import { Router } from 'express';
import { getAuthenticateUserExpressHandler } from '../middleware/vincentAuth.mjs';
import { executeCompleteAutoRefuel, executeSponsorAutoRefuel } from '../vincent/bridge.js';

const router = Router();

// 建立 Vincent 驗證中間件
const vincentAuth = getAuthenticateUserExpressHandler({
  allowedAudience: process.env.VITE_VINCENT_APP_ID ? 
    `https://${process.env.VITE_VINCENT_APP_ID}.vincent.app` : 
    'http://localhost:5173',
  requiredAppId: parseInt(process.env.VITE_VINCENT_APP_ID) || undefined,
  userKey: 'vincentUser'
});

// Vincent Bridge 相關端點
router.post('/bridge', vincentAuth, async (req, res) => {
  try {
    const { bridgeParams } = req.body;
    const delegatorPkpEthAddress = req.vincentUser.decodedJWT?.payload?.pkpInfo?.ethAddress ?? 
                                  req.vincentUser.decodedJWT?.pkp?.ethAddress;
    
    if (!delegatorPkpEthAddress) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid JWT: no pkp.ethAddress' 
      });
    }

    const result = await executeCompleteAutoRefuel(bridgeParams, { 
      delegatorPkpEthAddress,
      rpcUrl: process.env.RPC_URL 
    });

    res.json({
      success: true,
      result: {
        execute: result.result,
        submit: result.result
      }
    });
  } catch (error) {
    console.error('Vincent Bridge 失敗:', error);
    res.status(400).json({
      success: false,
      error: error.message || String(error)
    });
  }
});

// Vincent Sponsor 相關端點
router.post('/sponsor', vincentAuth, async (req, res) => {
  try {
    const { sponsorParams } = req.body;
    const delegatorPkpEthAddress = req.vincentUser.decodedJWT?.payload?.pkpInfo?.ethAddress ?? 
                                  req.vincentUser.decodedJWT?.pkp?.ethAddress;
    
    if (!delegatorPkpEthAddress) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid JWT: no pkp.ethAddress' 
      });
    }

    const result = await executeSponsorAutoRefuel(sponsorParams, { 
      delegatorPkpEthAddress,
      rpcUrl: process.env.RPC_URL 
    });

    res.json({
      success: true,
      result
    });
  } catch (error) {
    console.error('Vincent Sponsor 失敗:', error);
    res.status(400).json({
      success: false,
      error: error.message || String(error)
    });
  }
});

// Vincent 狀態檢查
router.get('/status', vincentAuth, async (req, res) => {
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
});

export default router;
