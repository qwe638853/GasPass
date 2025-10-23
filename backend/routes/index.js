import { Router } from 'express';
import { getAuthenticateUserExpressHandler } from '../middleware/vincentAuth.mjs';
import { executeBungeeBridge, executeSponsorAutoRefuel } from '../vincent/bridge.js';

const router = Router();

// 建立 Vincent 驗證中間件
const vincentAuth = getAuthenticateUserExpressHandler({
  allowedAudience: process.env.VITE_VINCENT_APP_ID ? 
    `https://${process.env.VITE_VINCENT_APP_ID}.vincent.app` : 
    'http://localhost:5173',
  requiredAppId: parseInt(process.env.VITE_VINCENT_APP_ID) || undefined,
  userKey: 'vincentUser'
});

// 基本 API 端點
router.get('/', (req, res) => {
  res.json({ message: 'API is reachable' });
});


export default router;


