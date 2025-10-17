import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { verifyVincentAppUserJWT } from '@lit-protocol/vincent-app-sdk/jwt';
import { createRequire } from 'module';



async function verifyJwtWithFallbacks(jwt, expectedAudience, appId) {
  console.log('verifyJwtWithFallbacks', jwt, expectedAudience, parseInt(appId));
 
  try {
    const decodedJWT = await verifyVincentAppUserJWT({
      jwt: jwt,
      expectedAudience: expectedAudience + '/',
      requiredAppId: parseInt(appId),
    });
    return { decoded: decodedJWT, usedAudience: expectedAudience };
  } catch (error) {
    throw new Error(error.message);
  }
}



import { ensureInitialized, getDelegateeAddress, precheck as vincentPrecheck, getSignedBridgeQuote as vincentQuote, execute as vincentExecute } from './vincent.js';

const app = express();
const PORT = process.env.PORT || 8787;

app.use(cors());
app.use(bodyParser.json());

app.get('/api/health', (req, res) => {
  res.json({ ok: true });
});

// 以 JSON body: { jwt: string, audience: string }
app.post('/api/verify-jwt', async (req, res) => {
  try {
    const { jwt, audience, appId } = req.body || {};
    if (!jwt || !audience) {
      return res.status(400).json({ ok: false, error: 'Missing jwt or audience' });
    }
    

    const { decoded, usedAudience } = await verifyJwtWithFallbacks(jwt, audience, appId);
    // 正規化 pkp 地址位置，便於前端觀察
    const pkpAddr = decoded?.payload?.pkpInfo?.ethAddress ?? decoded?.pkp?.ethAddress;
    return res.json({ ok: true, decoded, pkpAddr, usedAudience });
  } catch (err) {
    console.error('verify-jwt error:', err);
    return res.status(400).json({ ok: false, error: err.message || String(err) });
  }
});

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
app.post('/api/vincent/precheck', async (req, res) => {
  try {
    const { bridgeParams, delegatorPkpEthAddress, rpcUrl, jwt, audience, appId } = req.body || {};
    if (!bridgeParams || !rpcUrl) return res.status(400).json({ ok: false, error: 'Missing bridgeParams/rpcUrl' });

    let delegator = delegatorPkpEthAddress;
    if (!delegator) {
      if (!jwt || !audience) return res.status(400).json({ ok: false, error: 'Missing delegator or jwt/audience' });
      const { decoded } = await verifyJwtWithFallbacks(jwt, audience, appId);
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
});

// POST /api/vincent/quote { bridgeParams, delegatorPkpEthAddress }
app.post('/api/vincent/quote', async (req, res) => {
  try {
    const { bridgeParams, delegatorPkpEthAddress, jwt, audience, appId } = req.body || {};
    if (!bridgeParams) return res.status(400).json({ ok: false, error: 'Missing bridgeParams' });

    let delegator = delegatorPkpEthAddress;
    if (!delegator) {
      if (!jwt || !audience) return res.status(400).json({ ok: false, error: 'Missing delegator or jwt/audience' });
      const { decoded } = await verifyJwtWithFallbacks(jwt, audience, appId);
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
});

// POST /api/vincent/execute { bridgeParams, delegatorPkpEthAddress }
app.post('/api/vincent/execute', async (req, res) => {
  try {
    const { bridgeParams, delegatorPkpEthAddress, jwt, audience, appId } = req.body || {};
    if (!bridgeParams) return res.status(400).json({ ok: false, error: 'Missing bridgeParams' });

    let delegator = delegatorPkpEthAddress;
    if (!delegator) {
      if (!jwt || !audience) return res.status(400).json({ ok: false, error: 'Missing delegator or jwt/audience' });
      const { decoded } = await verifyJwtWithFallbacks(jwt, audience, appId);
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
});

app.listen(PORT, () => {
  console.log(`JWT verify server listening on http://localhost:${PORT}`);
});


