import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import { createVincentAuth, normalizeAudience } from './middleware/vincentAuth.mjs';



dotenv.config();

 



import { ensureInitialized, getDelegateeAddress, precheck as vincentPrecheck, getSignedBridgeQuote as vincentQuote, execute as vincentExecute } from './vincent.js';

const app = express();
const PORT = process.env.PORT || 8787;

app.use(cors());
app.use(bodyParser.json());

const allowedAudienceFromEnv = process.env.VINCENT_ALLOWED_AUDIENCE || process.env.ALLOWED_AUDIENCE || 'http://127.0.0.1:5173/';
const allowedAudience = normalizeAudience(allowedAudienceFromEnv);
const requiredAppIdEnv = process.env.VINCENT_APP_ID || process.env.APP_ID;
const requiredAppId = requiredAppIdEnv != null && requiredAppIdEnv !== '' ? parseInt(requiredAppIdEnv) : undefined;
const { middleware: vincentAuth, handler: withVincentAuth } = createVincentAuth({
  allowedAudience,
  requiredAppId,
  userKey: 'vincentUser',
});

app.get('/api/health', (req, res) => {
  res.json({ ok: true });
});

// 使用 Authorization: Bearer <token> 驗證
app.post('/api/verify-jwt', vincentAuth, withVincentAuth(async (req, res) => {
  try {
    const decoded = req.vincentUser.decodedJWT;
    if (!decoded) return res.status(401).json({ ok: false, error: 'Unauthorized' });
    const pkpAddr = decoded?.payload?.pkpInfo?.ethAddress ?? decoded?.pkp?.ethAddress;
    return res.json({ ok: true, decoded, pkpAddr, usedAudience: allowedAudience });
  } catch (err) {
    console.error('verify-jwt error:', err);
    return res.status(400).json({ ok: false, error: err.message || String(err) });
  }
}));

// 初始化 Vincent 並回傳 delegatee address
app.get('/api/vincent/ready', async (req, res) => {
  try {
    await ensureInitialized();
    return res.json({ ok: true, delegatee: getDelegateeAddress() });
  } catch (err) {
    console.error('ready error:', err);
    return res.status(500).json({ ok: false, error: err.message || String(err) });
  }
});

// POST /api/vincent/precheck { bridgeParams, delegatorPkpEthAddress, rpcUrl }
app.post('/api/vincent/precheck', vincentAuth, withVincentAuth(async (req, res) => {
  try {
    const { bridgeParams, delegatorPkpEthAddress, rpcUrl } = req.body || {};
    console.log('precheck req.body', req.body);
    if (!bridgeParams || !rpcUrl) return res.status(400).json({ ok: false, error: 'Missing bridgeParams/rpcUrl' });

    let delegator = delegatorPkpEthAddress;
    if (!delegator) {
      const decoded = req.vincentUser.decodedJWT;
      const pkpAddr = decoded?.payload?.pkpInfo?.ethAddress ?? decoded?.pkp?.ethAddress;
      if (!pkpAddr) return res.status(400).json({ ok: false, error: 'Invalid JWT: no pkp.ethAddress' });
      delegator = pkpAddr;
    }

    const result = await vincentPrecheck(bridgeParams, { delegatorPkpEthAddress: delegator, rpcUrl });
    return res.json({ ok: true, result });
  } catch (err) {
    console.error('precheck error:', err);
    return res.status(400).json({ ok: false, error: err.message || String(err) });
  }
}));

// POST /api/vincent/quote { bridgeParams, delegatorPkpEthAddress }
app.post('/api/vincent/quote', vincentAuth, withVincentAuth(async (req, res) => {
  try {
    const { bridgeParams, delegatorPkpEthAddress } = req.body || {};
    if (!bridgeParams) return res.status(400).json({ ok: false, error: 'Missing bridgeParams' });

    let delegator = delegatorPkpEthAddress;
    if (!delegator) {
      const decoded = req.vincentUser.decodedJWT;
      const pkpAddr = decoded?.payload?.pkpInfo?.ethAddress ?? decoded?.pkp?.ethAddress;
      if (!pkpAddr) return res.status(400).json({ ok: false, error: 'Invalid JWT: no pkp.ethAddress' });
      delegator = pkpAddr;
    }

    const result = await vincentQuote(bridgeParams, { delegatorPkpEthAddress: delegator });
    return res.json({ ok: true, result });
  } catch (err) {
    console.error('quote error:', err);
    return res.status(400).json({ ok: false, error: err.message || String(err) });
  }
}));

// POST /api/vincent/execute { bridgeParams, delegatorPkpEthAddress }
app.post('/api/vincent/execute', vincentAuth, withVincentAuth(async (req, res) => {
  try {
    const { bridgeParams, delegatorPkpEthAddress } = req.body || {};
    if (!bridgeParams) return res.status(400).json({ ok: false, error: 'Missing bridgeParams' });

    let delegator = delegatorPkpEthAddress;
    if (!delegator) {
      const decoded = req.vincentUser.decodedJWT;
      const pkpAddr = decoded?.payload?.pkpInfo?.ethAddress ?? decoded?.pkp?.ethAddress;
      if (!pkpAddr) return res.status(400).json({ ok: false, error: 'Invalid JWT: no pkp.ethAddress' });
      delegator = pkpAddr;
    }

    const result = await vincentExecute(bridgeParams, { delegatorPkpEthAddress: delegator });
    return res.json({ ok: true, result });
  } catch (err) {
    console.error('execute error:', err);
    return res.status(400).json({ ok: false, error: err.message || String(err) });
  }
}));

app.listen(PORT, () => {
  console.log(`JWT verify server listening on http://localhost:${PORT}`);
});


