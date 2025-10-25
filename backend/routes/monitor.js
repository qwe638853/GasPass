import { ethers } from 'ethers';
import { GAS_PASS_CONFIG } from '../config/gasPassConfig.js';
import { SUPPORTED_CHAINS } from '../config/BungeeConfig.js';
import { executeCompleteAutoRefuel } from '../vincent/bridge.js';
import express from 'express';

// ETH 價格緩存
const priceCache = new Map();
const PRICE_CACHE_DURATION = 5 * 60 * 1000; // 5 分鐘

// 獲取 ETH 價格（USDC）
async function getETHPrice() {
  const now = Date.now();
  const cached = priceCache.get('ETH_USDC');
  
  if (cached && (now - cached.timestamp) < PRICE_CACHE_DURATION) {
    return cached.price;
  }
  
  try {
    // 使用 CoinGecko API 獲取 ETH 價格
    const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd');
    const data = await response.json();
    
    if (data.ethereum && data.ethereum.usd) {
      const price = data.ethereum.usd;
      priceCache.set('ETH_USDC', { price, timestamp: now });
      console.log(`💰 ETH 價格更新: $${price}`);
      return price;
    }
    
    throw new Error('無法獲取 ETH 價格');
  } catch (error) {
    console.error('❌ 獲取 ETH 價格失敗:', error.message);
    
    // 如果獲取失敗，使用緩存的價格或預設價格
    if (cached) {
      console.log('🔄 使用緩存的 ETH 價格:', cached.price);
      return cached.price;
    }
    
    // 預設價格 $3000
    console.log('⚠️  使用預設 ETH 價格: $3000');
    return 3000;
  }
}

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
        console.warn(`Unsupported chain ID: ${chainId}`);
        return null;
      }

      const provider = getProvider(chainId, defaultRpcUrl);
      const balance = await provider.getBalance(walletAddress);
      const balanceInEth = ethers.formatEther(balance);
      
      // 如果是 ETH 鏈，需要轉換為 USDC 單位進行比較
      if (config.nativeSymbol === 'ETH') {
        const ethPrice = await getETHPrice();
        const balanceInUsd = parseFloat(balanceInEth) * ethPrice;
        const balanceInUsdc = Math.floor(balanceInUsd * 1000000); // 轉換為 USDC 最小單位 (6 decimals)
        
        console.log(`💰 ${config.name}: ${walletAddress}`);
        console.log(`   ETH 餘額: ${balanceInEth} ETH`);
        console.log(`   ETH 價格: $${ethPrice}`);
        console.log(`   轉換為: $${balanceInUsd.toFixed(2)} = ${balanceInUsdc} USDC (最小單位)`);
        
        return {
          nativeBalance: parseFloat(balanceInEth),
          nativeSymbol: config.nativeSymbol,
          usdcBalance: balanceInUsdc, // USDC 最小單位
          ethPrice: ethPrice
        };
      } else {
        // 其他鏈直接返回原生餘額
        console.log(`💰 ${config.name}: ${walletAddress} balance = ${balanceInEth} ${config.nativeSymbol}`);
        
        return {
          nativeBalance: parseFloat(balanceInEth),
          nativeSymbol: config.nativeSymbol,
          usdcBalance: null,
          ethPrice: null
        };
      }
    } catch (error) {
      console.error(`Failed to check balance for ${SUPPORTED_CHAINS[chainId]?.name || chainId} (attempt ${attempt}/${retries}):`, error.message);
      
      if (attempt === retries) {
        console.error(`Out of retries, skipping this chain`);
        return null;
      }
      
      // 等待後重試
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
    }
  }
  return null;
}

// 觸發自動補氣
async function triggerAutoRefuel(tokenId, chainId, contract, wallet) {
  try {
    console.log(`🚀 觸發 autoRefuel: tokenId=${tokenId}, chainId=${chainId}`);
    
    // 獲取 policy 信息
    const policy = await contract.chainPolicies(tokenId, chainId);
    const gasAmount = policy.gasAmount;
    const policyAgent = policy.policyAgent;
    
    // 獲取 token 擁有者
    const owner = await contract.ownerOf(tokenId);
    
    // 獲取 USDC 合約地址
    const usdcAddress = await contract.stablecoin();
    
    // 獲取當前區塊信息
    const blockNumber = await contract.runner.provider.getBlockNumber();
    
    // 調用 executeCompleteAutoRefuel
    const result = await executeCompleteAutoRefuel({
      tokenId,
      destinationChainId: parseInt(chainId),
      receiver: owner,
      inputToken: usdcAddress,
      inputAmount: gasAmount,
      contractAddress: contract.target,
      blockNumber,
      gasLeft: 1000000,
      deadlineDelta: 600
    }, { delegatorPkpEthAddress: policyAgent });

    console.log(`✅ 成功觸發 autoRefuel:`, result);
    return { success: true, tokenId, chainId, result };
  } catch (error) {
    console.error(`❌ 觸發 autoRefuel 失敗:`, error.message);
    throw error;
  }
}

// 檢查所有策略
async function checkAllPolicies(contract, defaultRpcUrl, wallet) {
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
      if (tokenIdNum !== 4) continue;
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
            
            // 檢查 Token 餘額（USDC）
            const tokenBalance = await contract.balanceOf(tokenIdNum);
            const tokenBalanceInUsdc = parseFloat(ethers.formatUnits(tokenBalance, 6));
            
            console.log(`💰 Token 餘額: ${tokenBalanceInUsdc} USDC`);
            
            // 檢查鏈上餘額
            const balanceInfo = await checkBalance(owner, parseInt(chainId), defaultRpcUrl);
            
            if (balanceInfo !== null) {
              // 統一比較邏輯：所有鏈都轉換為 USDC 最小單位進行比較
              let currentBalanceInUsdc;
              let needsRefuel = false;
              let thresholdInUsdc;
              
              if (config.nativeSymbol === 'ETH') {
                // ETH 鏈：使用價格轉換後的 USDC 值
                currentBalanceInUsdc = balanceInfo.usdcBalance;
                thresholdInUsdc = policy.threshold; // policy.threshold 已經是 USDC 最小單位
                needsRefuel = currentBalanceInUsdc < thresholdInUsdc;
                
                console.log(`💱 ${config.name} 餘額檢查:`);
                console.log(`   ETH 餘額: ${balanceInfo.nativeBalance} ETH`);
                console.log(`   ETH 價格: $${balanceInfo.ethPrice}`);
                console.log(`   轉換後: ${currentBalanceInUsdc} USDC (最小單位)`);
                console.log(`   策略閾值: ${thresholdInUsdc} USDC (最小單位)`);
                console.log(`   比較結果: ${currentBalanceInUsdc} ${needsRefuel ? '<' : '>='} ${thresholdInUsdc}`);
                
              } else {
                // 其他鏈：直接使用原生單位（假設 policy.threshold 是原生單位）
                // 這裡需要根據實際情況調整，如果其他鏈的 policy.threshold 也是 USDC 單位
                currentBalanceInUsdc = balanceInfo.nativeBalance;
                thresholdInUsdc = threshold;
                needsRefuel = currentBalanceInUsdc < thresholdInUsdc;
                
                console.log(`💰 ${config.name} 餘額檢查:`);
                console.log(`   原生餘額: ${balanceInfo.nativeBalance} ${config.nativeSymbol}`);
                console.log(`   策略閾值: ${thresholdInUsdc} ${config.nativeSymbol}`);
                console.log(`   比較結果: ${currentBalanceInUsdc} ${needsRefuel ? '<' : '>='} ${thresholdInUsdc}`);
              }
              
              // 統一的補油邏輯：需要檢查 Token 餘額和鏈上餘額
              if (needsRefuel) {
                if (tokenBalanceInUsdc <= 0) {
                  console.log(`❌ Token 餘額不足 (${tokenBalanceInUsdc} USDC)，跳過補油`);
                } else {
                  console.log(`⚠️  鏈上餘額不足，但 Token 餘額充足 (${tokenBalanceInUsdc} USDC)，觸發自動補油...`);
                  
                  try {
                    await triggerAutoRefuel(tokenIdNum, chainId, contract, wallet);
                    refuelsTriggered++;
                    console.log(`✅ AutoRefuel triggered: TokenId #${tokenIdNum} -> ${config.name}`);
                  } catch (error) {
                    console.error(`❌ Failed to trigger autoRefuel:`, error.message);
                  }
                }
              } else {
                console.log(`✅ 鏈上餘額充足，無需補油`);
              }
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
    
    const result = await checkAllPolicies(contract, defaultRpcUrl, wallet);
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
          // 檢查 Token 餘額
          const tokenBalance = await contract.balanceOf(tokenIdNum);
          const tokenBalanceInUsdc = parseFloat(ethers.formatUnits(tokenBalance, 6));
          
          // 檢查鏈上餘額
          const balanceInfo = await checkBalance(owner, parseInt(chainId), defaultRpcUrl);
          
          let needsRefuel = false;
          let currentBalanceInUsdc = null;
          let thresholdInUsdc = null;
          
          if (balanceInfo !== null) {
            if (config.nativeSymbol === 'ETH') {
              // ETH 鏈：使用 USDC 單位比較
              currentBalanceInUsdc = balanceInfo.usdcBalance;
              thresholdInUsdc = policy.threshold;
              needsRefuel = balanceInfo.usdcBalance < thresholdInUsdc;
            } else {
              // 其他鏈：使用原生單位比較
              currentBalanceInUsdc = balanceInfo.nativeBalance;
              thresholdInUsdc = threshold;
              needsRefuel = balanceInfo.nativeBalance < threshold;
            }
          }
          
          // 檢查是否可以補油（需要 Token 餘額充足）
          const canRefuel = tokenBalanceInUsdc > 0;
          
          policies.push({
            chainId: parseInt(chainId),
            chainName: config.name,
            nativeSymbol: config.nativeSymbol,
            threshold: thresholdInUsdc,
            thresholdUnit: config.nativeSymbol === 'ETH' ? 'USDC' : config.nativeSymbol,
            gasAmount: ethers.formatUnits(policy.gasAmount, 6),
            currentBalance: currentBalanceInUsdc,
            currentBalanceUnit: config.nativeSymbol === 'ETH' ? 'USDC' : config.nativeSymbol,
            nativeBalance: balanceInfo?.nativeBalance || null,
            usdcBalance: balanceInfo?.usdcBalance || null,
            ethPrice: balanceInfo?.ethPrice || null,
            tokenBalance: tokenBalanceInUsdc,
            needsRefuel: needsRefuel,
            canRefuel: canRefuel,
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

// 導出函數供 server.js 使用
export { checkAllPolicies };

export default router;
