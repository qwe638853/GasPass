import { Router } from 'express';
import { ethers } from 'ethers';
import { GAS_PASS_CONFIG, GAS_PASS_ABI, SUPPORTED_CHAINS } from '../config/gasPassConfig.js';

const router = Router();

// 創建合約實例的輔助函數
function createContractInstance(wallet) {
  return new ethers.Contract(GAS_PASS_CONFIG.contractAddress, GAS_PASS_ABI, wallet);
}

// GasPass Relayer 相關端點
router.post('/relay/mint', async (req, res) => {
  try {
    const { typedData, signature } = req.body;
    
    console.log(`📤 代送 mintWithSig 交易...`);
    console.log(`👤 用戶: ${typedData.to}`);
    console.log(`💰 金額: ${ethers.formatUnits(typedData.value, 6)} USDC`);
    console.log(`🔍 簽名: ${signature}`);
    
    // 從主服務器獲取 wallet 和 contract
    const { wallet, contract } = req.app.locals;
    
    if (!wallet || !contract) {
      throw new Error('Relayer 服務未初始化');
    }
    
    // 準備合約調用的數據
    const mintData = {
      to: typedData.to,
      value: typedData.value,
      permitData: typedData.permitData,
      agent: typedData.agent,
      nonce: typedData.nonce,
      deadline: typedData.deadline
    };
    
    console.log(`🔍 mintData:`, mintData);
    
    // 調用合約的 mintWithSig 函數
    const tx = await contract.mintWithSig(mintData, signature);
    console.log(`📝 交易已提交: ${tx.hash}`);
    
    // 等待交易確認（等待 1 個確認）
    const receipt = await tx.wait(1);
    console.log(`✅ 交易已確認: ${receipt.hash}`);
    console.log(`📊 確認數: ${receipt.confirmations}`);
    console.log(`📊 狀態: ${receipt.status === 1 ? '成功' : '失敗'}`);
    console.log(`⛽ Gas 使用: ${receipt.gasUsed.toString()}`);
    
    // 檢查交易狀態
    if (receipt.status !== 1) {
      throw new Error(`交易失敗，狀態碼: ${receipt.status}`);
    }
    
    // 從事件中獲取 tokenId
    const mintEvent = receipt.logs.find(log => {
      try {
        const parsed = contract.interface.parseLog(log);
        return parsed.name === 'Minted';
      } catch (e) {
        return false;
      }
    });
    
    let tokenId = null;
    if (mintEvent) {
      const parsed = contract.interface.parseLog(mintEvent);
      tokenId = parsed.args.value.toString();
      console.log(`🎫 鑄造的 Token ID: ${tokenId}`);
    } else {
      console.warn('⚠️ 未找到 Minted 事件，可能合約 ABI 不匹配');
    }
    
    res.json({
      success: true,
      txHash: receipt.hash,
      tokenId: tokenId,
      confirmations: receipt.confirmations,
      gasUsed: receipt.gasUsed.toString(),
      status: receipt.status === 1 ? 'success' : 'failed',
      receipt: {
        hash: receipt.hash,
        blockNumber: receipt.blockNumber,
        blockHash: receipt.blockHash,
        confirmations: receipt.confirmations,
        gasUsed: receipt.gasUsed.toString(),
        status: receipt.status
      }
    });
    
  } catch (error) {
    console.error('❌ mintWithSig 失敗:', error.message);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

router.post('/relay/mint-batch', async (req, res) => {
  try {
    const { typedData, signature } = req.body;
    
    console.log(`📤 代送 mintBatchWithSig 交易...`);
    console.log(`👤 用戶: ${typedData.to}`);
    console.log(`📦 數量: ${typedData.amount}`);
    console.log(`💰 單價: ${ethers.formatUnits(typedData.singleValue, 6)} USDC`);
    
    res.json({
      success: true,
      message: 'Mint batch relay endpoint - implementation in main server'
    });
    
  } catch (error) {
    console.error('❌ mintBatchWithSig 失敗:', error.message);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

router.post('/relay/deposit', async (req, res) => {
  try {
    const { typedData, signature } = req.body;
    
    console.log(`📤 代送 depositWithSig 交易...`);
    console.log(`🎫 Token ID: ${typedData.tokenId}`);
    console.log(`💰 金額: ${ethers.formatUnits(typedData.amount, 6)} USDC`);
    console.log(`🔍 簽名: ${signature}`);
    
    // 從主服務器獲取 wallet 和 contract
    const { wallet, contract } = req.app.locals;
    
    if (!wallet || !contract) {
      throw new Error('Relayer 服務未初始化');
    }
    
    // 準備合約調用的數據（DepositWithSigTypedData 結構）
    const depositData = {
      tokenId: BigInt(typedData.tokenId),
      amount: BigInt(typedData.amount),
      permitData: {
        owner: typedData.permitData.owner,
        spender: typedData.permitData.spender,
        value: BigInt(typedData.permitData.value),
        deadline: BigInt(typedData.permitData.deadline),
        v: parseInt(typedData.permitData.v),
        r: typedData.permitData.r,
        s: typedData.permitData.s
      },
      nonce: BigInt(typedData.nonce),
      deadline: BigInt(typedData.deadline)
    };
    
    console.log(`🔍 depositData:`, depositData);
    
    // 調用合約的 depositWithSig 函數
    const tx = await contract.depositWithSig(depositData, signature);
    console.log(`📝 交易已提交: ${tx.hash}`);
    
    // 等待交易確認（等待 1 個確認）
    const receipt = await tx.wait(1);
    console.log(`✅ 交易已確認: ${receipt.hash}`);
    console.log(`📊 確認數: ${receipt.confirmations}`);
    console.log(`📊 狀態: ${receipt.status === 1 ? '成功' : '失敗'}`);
    console.log(`⛽ Gas 使用: ${receipt.gasUsed.toString()}`);
    
    // 檢查交易狀態
    if (receipt.status !== 1) {
      throw new Error(`交易失敗，狀態碼: ${receipt.status}`);
    }
    
    res.json({
      success: true,
      txHash: receipt.hash,
      confirmations: receipt.confirmations,
      gasUsed: receipt.gasUsed.toString(),
      status: receipt.status === 1 ? 'success' : 'failed',
      receipt: {
        hash: receipt.hash,
        blockNumber: receipt.blockNumber,
        blockHash: receipt.blockHash,
        confirmations: receipt.confirmations,
        gasUsed: receipt.gasUsed.toString(),
        status: receipt.status
      }
    });
    
  } catch (error) {
    console.error('❌ depositWithSig 失敗:', error.message);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

router.post('/relay/set-refuel-policy', async (req, res) => {
  try {
    const { typedData, signature } = req.body;
    
    console.log(`📤 代送 setRefuelPolicyWithSig 交易...`);
    console.log(`🎫 Token ID: ${typedData.tokenId}`);
    console.log(`⛓️ 目標鏈: ${typedData.targetChainId}`);
    console.log(`💰 Gas 金額: ${ethers.formatUnits(typedData.gasAmount, 6)} USDC`);
    console.log(`⚠️ 觸發閾值: ${ethers.formatEther(typedData.threshold)} ETH`);
    
    res.json({
      success: true,
      message: 'Set refuel policy relay endpoint - implementation in main server'
    });
    
  } catch (error) {
    console.error('❌ setRefuelPolicyWithSig 失敗:', error.message);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

router.post('/relay/cancel-refuel-policy', async (req, res) => {
  try {
    const { typedData, signature } = req.body;
    
    console.log(`📤 代送 cancelRefuelPolicyWithSig 交易...`);
    console.log(`🎫 Token ID: ${typedData.tokenId}`);
    console.log(`⛓️ 目標鏈: ${typedData.targetChainId}`);
    
    res.json({
      success: true,
      message: 'Cancel refuel policy relay endpoint - implementation in main server'
    });
    
  } catch (error) {
    console.error('❌ cancelRefuelPolicyWithSig 失敗:', error.message);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

router.post('/relay/set-agent', async (req, res) => {
  try {
    const { typedData, signature } = req.body;
    
    console.log(`📤 代送 setAgentToWalletWithSig 交易...`);
    console.log(`🤖 Agent: ${typedData.agent}`);
    console.log(`👤 Wallet: ${typedData.wallet}`);
    
    res.json({
      success: true,
      message: 'Set agent relay endpoint - implementation in main server'
    });
    
  } catch (error) {
    console.error('❌ setAgentToWalletWithSig 失敗:', error.message);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// GasPass Monitor 相關端點
router.post('/monitor/scan', async (req, res) => {
  try {
    console.log('🔍 手動觸發監控掃描...');
    res.json({ 
      success: true, 
      message: 'Monitor scan endpoint - implementation in main server' 
    });
  } catch (error) {
    console.error('❌ 手動掃描失敗:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/monitor/status', async (req, res) => {
  try {
    res.json({
      success: true,
      message: 'Monitor status endpoint - implementation in main server',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ 獲取監控狀態失敗:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// GasPass 配置相關端點
router.get('/config', (req, res) => {
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

router.get('/relayer', (req, res) => {
  res.json({
    message: 'Relayer info endpoint - implementation in main server',
    network: GAS_PASS_CONFIG.network.name,
    chainId: GAS_PASS_CONFIG.network.chainId
  });
});

export default router;
