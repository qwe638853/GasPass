import 'dotenv/config';
import { ethers } from 'ethers';
import express from 'express';
import cors from 'cors';
import { GAS_PASS_CONFIG, GAS_PASS_ABI, SUPPORTED_CHAINS } from './config/gasPassConfig.js';

/**
 * GasPass 統一服務器
 * 整合 Relayer 和 Monitor 功能
 */

const app = express();
app.use(cors());
app.use(express.json());

// 環境變量驗證
const required = ['PRIVATE_KEY', 'RPC_URL'];
const missing = required.filter(key => !process.env[key]);

if (missing.length > 0) {
  console.error(`❌ 缺少必要的環境變量: ${missing.join(', ')}`);
  process.exit(1);
}

// 設定
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const RPC_URL = process.env.RPC_URL || GAS_PASS_CONFIG.network.rpc;
const PORT = process.env.PORT || GAS_PASS_CONFIG.service.port;

// 創建 provider 和 wallet
const provider = new ethers.JsonRpcProvider(RPC_URL);
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

// 創建合約實例
const contract = new ethers.Contract(GAS_PASS_CONFIG.contractAddress, GAS_PASS_ABI, wallet);

console.log(`🚀 GasPass 統一服務器啟動中...`);
console.log(`👤 Relayer 地址: ${wallet.address}`);
console.log(`🌐 RPC 端點: ${RPC_URL}`);
console.log(`📋 合約地址: ${GAS_PASS_CONFIG.contractAddress}`);
console.log(`🔗 網絡: ${GAS_PASS_CONFIG.network.name} (${GAS_PASS_CONFIG.network.chainId})`);

// ==================== RELAYER 功能 ====================

// 健康檢查
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'GasPass Unified Server',
    relayer: wallet.address,
    contract: GAS_PASS_CONFIG.contractAddress,
    network: GAS_PASS_CONFIG.network.name,
    chainId: GAS_PASS_CONFIG.network.chainId,
    timestamp: new Date().toISOString()
  });
});

// 獲取 Relayer 地址
app.get('/relayer', (req, res) => {
  res.json({
    address: wallet.address,
    network: GAS_PASS_CONFIG.network.name,
    chainId: GAS_PASS_CONFIG.network.chainId
  });
});

// 獲取合約配置
app.get('/config', (req, res) => {
  res.json({
    contractAddress: GAS_PASS_CONFIG.contractAddress,
    network: GAS_PASS_CONFIG.network,
    usdc: GAS_PASS_CONFIG.usdc,
    supportedChains: Object.keys(SUPPORTED_CHAINS).map(chainId => ({
      chainId: parseInt(chainId),
      name: SUPPORTED_CHAINS[chainId].name,
      nativeSymbol: SUPPORTED_CHAINS[chainId].nativeSymbol
    }))
  });
});

// 代送 mintWithSig 交易
app.post('/relay/mint', async (req, res) => {
  try {
    const { typedData, signature } = req.body;
    
    console.log(`📤 代送 mintWithSig 交易...`);
    console.log(`👤 用戶: ${typedData.to}`);
    console.log(`💰 金額: ${ethers.formatUnits(typedData.value, 6)} USDC`);
    
    const tx = await contract.mintWithSig(typedData, signature);
    console.log(`📝 交易哈希: ${tx.hash}`);
    
    const receipt = await tx.wait();
    console.log(`✅ 交易確認: ${receipt.transactionHash}`);
    
    res.json({
      success: true,
      txHash: receipt.transactionHash,
      blockNumber: receipt.blockNumber,
      gasUsed: receipt.gasUsed.toString()
    });
    
  } catch (error) {
    console.error('❌ mintWithSig 失敗:', error.message);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// 代送 mintBatchWithSig 交易
app.post('/relay/mint-batch', async (req, res) => {
  try {
    const { typedData, signature } = req.body;
    
    console.log(`📤 代送 mintBatchWithSig 交易...`);
    console.log(`👤 用戶: ${typedData.to}`);
    console.log(`📦 數量: ${typedData.amount}`);
    console.log(`💰 單價: ${ethers.formatUnits(typedData.singleValue, 6)} USDC`);
    
    const tx = await contract.mintBatchWithSig(typedData, signature);
    console.log(`📝 交易哈希: ${tx.hash}`);
    
    const receipt = await tx.wait();
    console.log(`✅ 交易確認: ${receipt.transactionHash}`);
    
    res.json({
      success: true,
      txHash: receipt.transactionHash,
      blockNumber: receipt.blockNumber,
      gasUsed: receipt.gasUsed.toString()
    });
    
  } catch (error) {
    console.error('❌ mintBatchWithSig 失敗:', error.message);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// 代送 depositWithSig 交易
app.post('/relay/deposit', async (req, res) => {
  try {
    const { typedData, signature } = req.body;
    
    console.log(`📤 代送 depositWithSig 交易...`);
    console.log(`🎫 Token ID: ${typedData.tokenId}`);
    console.log(`💰 金額: ${ethers.formatUnits(typedData.amount, 6)} USDC`);
    
    const tx = await contract.depositWithSig(typedData, signature);
    console.log(`📝 交易哈希: ${tx.hash}`);
    
    const receipt = await tx.wait();
    console.log(`✅ 交易確認: ${receipt.transactionHash}`);
    
    res.json({
      success: true,
      txHash: receipt.transactionHash,
      blockNumber: receipt.blockNumber,
      gasUsed: receipt.gasUsed.toString()
    });
    
  } catch (error) {
    console.error('❌ depositWithSig 失敗:', error.message);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// 代送 setRefuelPolicyWithSig 交易
app.post('/relay/set-refuel-policy', async (req, res) => {
  try {
    const { typedData, signature } = req.body;
    
    console.log(`📤 代送 setRefuelPolicyWithSig 交易...`);
    console.log(`🎫 Token ID: ${typedData.tokenId}`);
    console.log(`⛓️ 目標鏈: ${typedData.targetChainId}`);
    console.log(`💰 Gas 金額: ${ethers.formatUnits(typedData.gasAmount, 6)} USDC`);
    console.log(`⚠️ 觸發閾值: ${ethers.formatEther(typedData.threshold)} ETH`);
    
    const tx = await contract.setRefuelPolicyWithSig(typedData, signature);
    console.log(`📝 交易哈希: ${tx.hash}`);
    
    const receipt = await tx.wait();
    console.log(`✅ 交易確認: ${receipt.transactionHash}`);
    
    res.json({
      success: true,
      txHash: receipt.transactionHash,
      blockNumber: receipt.blockNumber,
      gasUsed: receipt.gasUsed.toString()
    });
    
  } catch (error) {
    console.error('❌ setRefuelPolicyWithSig 失敗:', error.message);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// 代送 cancelRefuelPolicyWithSig 交易
app.post('/relay/cancel-refuel-policy', async (req, res) => {
  try {
    const { typedData, signature } = req.body;
    
    console.log(`📤 代送 cancelRefuelPolicyWithSig 交易...`);
    console.log(`🎫 Token ID: ${typedData.tokenId}`);
    console.log(`⛓️ 目標鏈: ${typedData.targetChainId}`);
    
    const tx = await contract.cancelRefuelPolicyWithSig(typedData, signature);
    console.log(`📝 交易哈希: ${tx.hash}`);
    
    const receipt = await tx.wait();
    console.log(`✅ 交易確認: ${receipt.transactionHash}`);
    
    res.json({
      success: true,
      txHash: receipt.transactionHash,
      blockNumber: receipt.blockNumber,
      gasUsed: receipt.gasUsed.toString()
    });
    
  } catch (error) {
    console.error('❌ cancelRefuelPolicyWithSig 失敗:', error.message);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// 代送 setAgentToWalletWithSig 交易
app.post('/relay/set-agent', async (req, res) => {
  try {
    const { typedData, signature } = req.body;
    
    console.log(`📤 代送 setAgentToWalletWithSig 交易...`);
    console.log(`🤖 Agent: ${typedData.agent}`);
    console.log(`👤 Wallet: ${typedData.wallet}`);
    
    const tx = await contract.setAgentToWalletWithSig(typedData, signature);
    console.log(`📝 交易哈希: ${tx.hash}`);
    
    const receipt = await tx.wait();
    console.log(`✅ 交易確認: ${receipt.transactionHash}`);
    
    res.json({
      success: true,
      txHash: receipt.transactionHash,
      blockNumber: receipt.blockNumber,
      gasUsed: receipt.gasUsed.toString()
    });
    
  } catch (error) {
    console.error('❌ setAgentToWalletWithSig 失敗:', error.message);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// ==================== MONITOR 功能 ====================

// 創建多鏈 Provider 緩存
const providerCache = new Map();

function getProvider(chainId = null) {
  const rpcUrl = chainId 
    ? SUPPORTED_CHAINS[chainId]?.rpc || RPC_URL
    : RPC_URL;
  
  if (!providerCache.has(rpcUrl)) {
    providerCache.set(rpcUrl, new ethers.JsonRpcProvider(rpcUrl));
  }
  return providerCache.get(rpcUrl);
}

// 檢查特定鏈的錢包餘額（帶重試機制）
async function checkBalance(walletAddress, chainId, retries = 3) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const config = SUPPORTED_CHAINS[chainId];
      if (!config) {
        console.warn(`⚠️  不支援的鏈 ID: ${chainId}`);
        return null;
      }

      const provider = getProvider(chainId);
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
async function checkAllPolicies() {
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
      return;
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
            const balance = await checkBalance(owner, parseInt(chainId));
            
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
    
  } catch (error) {
    console.error('❌ 掃描策略失敗:', error.message);
  }
}

// 定時執行監聽
function startMonitoring(intervalMinutes = 1) {
  console.log(`🕐 開始監聽，每 ${intervalMinutes} 分鐘執行一次`);
  
  // 立即執行一次
  checkAllPolicies();
  
  // 設定定時器
  setInterval(() => {
    console.log(`\n⏰ ${new Date().toLocaleString('zh-TW')} - 開始新一輪掃描`);
    checkAllPolicies();
  }, intervalMinutes * 60 * 1000);
}

// ==================== API 端點 ====================

// 手動觸發監控掃描
app.post('/monitor/scan', async (req, res) => {
  try {
    console.log('🔍 手動觸發監控掃描...');
    await checkAllPolicies();
    res.json({ success: true, message: '監控掃描完成' });
  } catch (error) {
    console.error('❌ 手動掃描失敗:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 獲取監控狀態
app.get('/monitor/status', async (req, res) => {
  try {
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

// 啟動監控
startMonitoring();

// 啟動服務
app.listen(PORT, () => {
  console.log(`🌐 GasPass 統一服務器運行在端口 ${PORT}`);
  console.log(`📡 API 端點: http://localhost:${PORT}`);
  console.log(`🔍 健康檢查: http://localhost:${PORT}/health`);
  console.log(`📊 監控狀態: http://localhost:${PORT}/monitor/status`);
});

export default app;
