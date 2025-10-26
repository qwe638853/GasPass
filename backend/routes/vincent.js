import { Router } from 'express';
import { createVincentAuth } from '../middleware/vincentAuth.mjs';
import { executeCompleteAutoRefuel, executeManualRefuelByAgent } from '../vincent/bridge.js';
import { ethers } from 'ethers';
import { GAS_PASS_CONFIG, GAS_PASS_ABI } from '../config/gasPassConfig.js';

const router = Router();

// 建立 Vincent 驗證中間件（與 testScript 一致）
const allowedAudience = 'http://127.0.0.1:5173/';
const requiredAppId = parseInt(process.env.VITE_VINCENT_APP_ID) || undefined;

const { middleware: vincentAuth, handler: withVincentAuth } = createVincentAuth({
  allowedAudience,
  requiredAppId,
  userKey: 'vincentUser',
});



// Vincent 狀態檢查
router.get('/status', vincentAuth, withVincentAuth(async (req, res) => {
  try {
    const delegatorPkpEthAddress = req.vincentUser.decodedJWT?.payload?.pkpInfo?.ethAddress ?? 
                                  req.vincentUser.decodedJWT?.pkp?.ethAddress;
    
    res.json({
      success: true,
      result: {
        pkpAddress: delegatorPkpEthAddress,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Vincent Status 失敗:', error);
    res.status(400).json({
      success: false,
      error: error.message || String(error)
    });
  }
}));


router.post('/triggerManualRefuel', vincentAuth, withVincentAuth(async (req, res) => {
  try {
    const { tokenId, chainId, gasAmount } = req.body;
    
    // 驗證必要參數
    if (!tokenId || !chainId || !gasAmount) {
      return res.status(400).json({
        success: false,
        error: '缺少必要參數: tokenId, chainId, gasAmount'
      });
    }

    console.log('🚀 前端觸發手動補油:', { tokenId, chainId, gasAmount });

    // 獲取 PKP 地址
    const delegatorPkpEthAddress = req.vincentUser.decodedJWT?.payload?.pkpInfo?.ethAddress ?? 
                                  req.vincentUser.decodedJWT?.pkp?.ethAddress;

    if (!delegatorPkpEthAddress) {
      return res.status(400).json({
        success: false,
        error: '無法獲取 PKP 地址'
      });
    }

    // 創建合約實例 - 使用環境變數或備用 RPC
    const rpcUrl = 'https://1rpc.io/arb';
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const contract = new ethers.Contract(
      GAS_PASS_CONFIG.contractAddress,
      GAS_PASS_ABI,
      provider
    );

    // 獲取 token 擁有者
    const owner = await contract.ownerOf(tokenId);
    console.log('👤 Token 擁有者:', owner);

    // 獲取 USDC 合約地址
    const usdcAddress = await contract.stablecoin();
    console.log('💰 USDC 合約地址:', usdcAddress);

    // 獲取當前區塊信息
    const blockNumber = await contract.runner.provider.getBlockNumber();
    console.log('📦 當前區塊號:', blockNumber);

    // 關閉 provider 釋放資源
    provider.destroy();
    console.log('🔌 Provider 已關閉');

    // 調用 executeManualRefuelByAgent (手動補油，不需要 policy)
    const result = await executeManualRefuelByAgent({
      tokenId: parseInt(tokenId),
      destinationChainId: parseInt(chainId),
      receiver: owner,
      inputToken: usdcAddress,
      inputAmount: gasAmount.toString(), // 確保轉換為字符串
      contractAddress: contract.target,
      blockNumber,
      gasLeft: 1000000,
      deadlineDelta: 600
    }, { delegatorPkpEthAddress });

    console.log('✅ 手動補油成功:', result);

    res.json({
      success: true,
      result: {
        tokenId: parseInt(tokenId),
        chainId: parseInt(chainId),
        gasAmount,
        owner,
        txHash: result.result?.txHash,
        requestData: result.requestData,
        minOutputAmount: result.minOutputAmount,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ 觸發手動補油失敗:', error);
    res.status(500).json({
      success: false,
      error: error.message || String(error)
    });
  }
}));

export default router;
