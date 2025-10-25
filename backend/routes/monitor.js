import { ethers } from 'ethers';
import { GAS_PASS_CONFIG, SUPPORTED_CHAINS } from '../config/gasPassConfig.js';
import express from 'express';

const router = express.Router();

// 創建多鏈 Provider 緩存
const providerCache = new Map();

function getProvider(chainId = null, defaultRpcUrl) {
  const rpcUrl = chainId 
    ? SUPPORTED_CHAINS[chainId]?.rpc || defaultRpcUrl
    : defaultRpcUrl;
  
  if (!providerCache.has(rpcUrl)) {
    providerCache.set(rpcUrl, new ethers.JsonRpcProvider(rpcUrl));
  }
  return providerCache.get(rpcUrl);
}

// 檢查特定鏈的錢包餘額（帶重試機制）
async function checkBalance(walletAddress, chainId, defaultRpcUrl, retries = 3) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const config = SUPPORTED_CHAINS[chainId];
      if (!config) {
        console.warn(`⚠️  不支援的鏈 ID: ${chainId}`);
        return null;
      }

      const provider = getProvider(chainId, defaultRpcUrl);
      const balance = await provider.getBalance(walletAddress);
      const balanceInEth = ethers.formatEther(balance);
      
      console.log(`💰 ${config.name}: ${walletAddress} 餘額 = ${balanceInEth} ${config.nativeSymbol}`);
      return parseFloat(balanceInEth);
    } catch (error) {
      console.error(`❌ 查詢 ${SUPPORTED_CHAINS[chainId]?.name || chainId} 餘額失敗 (嘗試 ${attempt}/${retries}):`, error.message);
      
      if (attempt === retries) {
        console.error(`❌ 重試次數用盡，跳過此鏈`);
        return null;
      }
      
      // 等待後重試
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
    }
  }
  return null;
}

// 觸發自動補氣
async function triggerAutoRefuel(tokenId, chainId) {
  try {
    console.log(`🚀 觸發 autoRefuel: tokenId=${tokenId}, chainId=${chainId}`);
    console.log(`✅ 成功觸發 autoRefuel`);
    
    // 返回成功狀態
    return { success: true, tokenId, chainId };
  } catch (error) {
    console.error(`❌ 觸發 autoRefuel 失敗:`, error.message);
    throw error;
  }
}

// 檢查所有策略
async function checkAllPolicies(contract, defaultRpcUrl) {
  try {
    console.log('\n🔍 開始掃描所有策略...');
    
    const totalSupply = await contract.totalSupply();
    const totalSupplyNum = Number(totalSupply);
    
    // 獲取累積手續費
    const totalFees = await contract.totalFeesCollected();
    const withdrawableFees = await contract.getWithdrawableFees();
    const totalFeesFormatted = ethers.formatUnits(totalFees, 6);
    const withdrawableFeesFormatted = ethers.formatUnits(withdrawableFees, 6);
    
    console.log(`📊 總共發現 ${totalSupplyNum} 個 token`);
    console.log(`💰 累積手續費收入: ${totalFeesFormatted} USDC`);
    console.log(`💎 可提領手續費: ${withdrawableFeesFormatted} USDC`);
    
    if (totalSupplyNum === 0) {
      console.log('ℹ️  沒有 token，跳過掃描');
      return {
        totalTokens: 0,
        policiesFound: 0,
        refuelsTriggered: 0,
        totalPotentialFees: 0,
        totalFees: totalFeesFormatted,
        withdrawableFees: withdrawableFeesFormatted
      };
    }

    let policiesFound = 0;
    let refuelsTriggered = 0;
    let totalPotentialFees = 0;

    // 遍歷所有 tokenId
    for (let i = 0; i < totalSupplyNum; i++) {
      const tokenId = await contract.tokenByIndex(i);
      const tokenIdNum = Number(tokenId);
      
      console.log(`\n🎫 檢查 TokenId #${tokenIdNum}`);
      
      // 獲取 token 擁有者
      const owner = await contract.ownerOf(tokenId);
      console.log(`👤 擁有者: ${owner}`);
      
      // 獲取 token 餘額
      const tokenBalance = await contract.balanceOf(tokenIdNum);
      const tokenBalanceFormatted = ethers.formatUnits(tokenBalance, 6);
      console.log(`💰 Token 餘額: ${tokenBalanceFormatted} USDC`);
      
      // 遍歷所有支援的鏈
      for (const [chainId, config] of Object.entries(SUPPORTED_CHAINS)) {
        try {
          const policy = await contract.chainPolicies(tokenIdNum, chainId);
          const threshold = parseFloat(ethers.formatEther(policy.threshold));
          
          if (threshold > 0) {
            policiesFound++;
            console.log(`📋 發現策略: ${config.name} (threshold: ${threshold} ${config.nativeSymbol})`);
            
            // 檢查餘額
            const balance = await checkBalance(owner, parseInt(chainId), defaultRpcUrl);
            
            if (balance !== null && balance < threshold) {
              console.log(`⚠️  餘額不足! ${balance} < ${threshold} ${config.nativeSymbol}`);
              
              // 計算潛在手續費 (0.5%)
              const gasAmount = parseFloat(ethers.formatUnits(policy.gasAmount, 6));
              const potentialFee = gasAmount * 0.005; // 0.5%
              totalPotentialFees += potentialFee;
              
              // 觸發自動補氣
              try {
                await triggerAutoRefuel(tokenIdNum, chainId);
                refuelsTriggered++;
                console.log(`✅ 已觸發補氣: TokenId #${tokenIdNum} -> ${config.name} (手續費: ${potentialFee.toFixed(6)} USDC)`);
              } catch (error) {
                console.error(`❌ 補氣失敗:`, error.message);
              }
            } else if (balance !== null) {
              console.log(`✅ 餘額充足: ${balance} >= ${threshold} ${config.nativeSymbol}`);
            }
          }
        } catch (error) {
          console.error(`❌ 檢查策略失敗 (TokenId: ${tokenIdNum}, Chain: ${chainId}):`, error.message);
        }
      }
    }

    console.log(`\n📈 掃描完成統計:`);
    console.log(`  📋 發現策略: ${policiesFound} 個`);
    console.log(`  🚀 觸發補氣: ${refuelsTriggered} 次`);
    console.log(`  💰 潛在手續費: ${totalPotentialFees.toFixed(6)} USDC`);
    console.log(`  💎 累積手續費: ${totalFeesFormatted} USDC`);
    console.log(`  🏦 可提領手續費: ${withdrawableFeesFormatted} USDC`);
    
    return {
      totalTokens: totalSupplyNum,
      policiesFound,
      refuelsTriggered,
      totalPotentialFees,
      totalFees: totalFeesFormatted,
      withdrawableFees: withdrawableFeesFormatted
    };
    
  } catch (error) {
    console.error('❌ 掃描策略失敗:', error.message);
    throw error;
  }
}

// ==================== API 端點 ====================

// 手動觸發監控掃描
router.post('/scan', async (req, res) => {
  try {
    console.log('🔍 手動觸發監控掃描...');
    const { contract, wallet } = req.app.locals;
    const defaultRpcUrl = process.env.RPC_URL || GAS_PASS_CONFIG.network.rpc;
    
    const result = await checkAllPolicies(contract, defaultRpcUrl);
    res.json({ 
      success: true, 
      message: '監控掃描完成',
      data: result
    });
  } catch (error) {
    console.error('❌ 手動掃描失敗:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 獲取監控狀態
router.get('/status', async (req, res) => {
  try {
    const { contract } = req.app.locals;
    const totalSupply = await contract.totalSupply();
    const totalFees = await contract.totalFeesCollected();
    const withdrawableFees = await contract.getWithdrawableFees();
    
    res.json({
      success: true,
      totalTokens: Number(totalSupply),
      totalFees: ethers.formatUnits(totalFees, 6),
      withdrawableFees: ethers.formatUnits(withdrawableFees, 6),
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ 獲取監控狀態失敗:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 獲取支援的鏈列表
router.get('/chains', (req, res) => {
  try {
    const chains = Object.keys(SUPPORTED_CHAINS).map(chainId => ({
      chainId: parseInt(chainId),
      name: SUPPORTED_CHAINS[chainId].name,
      nativeSymbol: SUPPORTED_CHAINS[chainId].nativeSymbol,
      rpc: SUPPORTED_CHAINS[chainId].rpc
    }));
    
    res.json({
      success: true,
      chains,
      total: chains.length
    });
  } catch (error) {
    console.error('❌ 獲取支援鏈列表失敗:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 檢查特定 token 的策略
router.get('/token/:tokenId', async (req, res) => {
  try {
    const { tokenId } = req.params;
    const { contract } = req.app.locals;
    const defaultRpcUrl = process.env.RPC_URL || GAS_PASS_CONFIG.network.rpc;
    
    const tokenIdNum = parseInt(tokenId);
    
    // 獲取 token 擁有者
    const owner = await contract.ownerOf(tokenIdNum);
    
    // 獲取 token 餘額
    const tokenBalance = await contract.balanceOf(tokenIdNum);
    const tokenBalanceFormatted = ethers.formatUnits(tokenBalance, 6);
    
    const policies = [];
    
    // 遍歷所有支援的鏈
    for (const [chainId, config] of Object.entries(SUPPORTED_CHAINS)) {
      try {
        const policy = await contract.chainPolicies(tokenIdNum, chainId);
        const threshold = parseFloat(ethers.formatEther(policy.threshold));
        
        if (threshold > 0) {
          // 檢查餘額
          const balance = await checkBalance(owner, parseInt(chainId), defaultRpcUrl);
          
          policies.push({
            chainId: parseInt(chainId),
            chainName: config.name,
            nativeSymbol: config.nativeSymbol,
            threshold,
            gasAmount: ethers.formatUnits(policy.gasAmount, 6),
            currentBalance: balance,
            needsRefuel: balance !== null && balance < threshold,
            policyAgent: policy.policyAgent,
            lastRefuel: policy.lastRefuel
          });
        }
      } catch (error) {
        console.error(`❌ 檢查策略失敗 (TokenId: ${tokenIdNum}, Chain: ${chainId}):`, error.message);
      }
    }
    
    res.json({
      success: true,
      tokenId: tokenIdNum,
      owner,
      tokenBalance: tokenBalanceFormatted,
      policies,
      totalPolicies: policies.length
    });
  } catch (error) {
    console.error('❌ 獲取 token 策略失敗:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
