import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import { z } from 'zod';
import { createVincentAuth, normalizeAudience } from './middleware/vincentAuth.mjs';



dotenv.config();

 



import { ensureInitialized, getDelegateeAddress, precheck as vincentPrecheck, getSignedBridgeQuote as vincentQuote, execute as vincentExecute, executeCombined as vincentExecuteCombined, approvePermit2Precheck, approvePermit2Execute, sponsorTransactionPrecheck, sponsorTransactionExecute } from './vincent.js';
import { waitForUserOp } from '@lit-protocol/vincent-scaffold-sdk';
import { alchemyGasSponsorApiKey, alchemyGasSponsorPolicyId } from './alchemy.mjs';

// Sponsor transaction params schema validation
const sponsorParamsSchema = z.object({
  chainId: z.number(),
  sponsorApiKey: z.string(),
  sponsorPolicyId: z.string(),
  contractAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid contract address'),
  functionName: z.string(),
  args: z.any().optional(),
  abi: z.any(),
  value: z.union([z.string(), z.number()]).optional(),
});

// Ability params schema validation
const abilityParamsSchema = z.object({
  fromChainId: z.union([z.string(), z.number()]),
  toChainId: z.union([z.string(), z.number()]),
  fromToken: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid token address'),
  toToken: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid token address'),
  amount: z.string().regex(/^\d+$/, 'Amount must be integer string'),
  recipient: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid recipient address'),
  slippageBps: z.number().int().min(1).max(1000).optional().default(100),
  // Optional fast path: if provided, execute will only sign and return userSignature
  signTypedData: z.any().optional(),
  quoteId: z.string().optional(),
  requestType: z.string().optional(),
});

// Helper: extract precheck hints
function extractHintsFromPrecheck(res) {
  const r = res?.result || res || {};
  const auto = r?.autoRoute || r?.bestRoute || r;
  return {
    signTypedData: auto?.signTypedData,
    quoteId: auto?.quoteId,
    requestType: auto?.requestType,
  };
}

// Helper: submit to Bungee（回傳 API 狀態與 server-req-id）
async function submitToBungee({ requestType, witness, userSignature, quoteId }) {
  const BUNGEE_API_BASE_URL = 'https://public-backend.bungee.exchange';
  const resp = await fetch(`${BUNGEE_API_BASE_URL}/api/v1/bungee/submit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ requestType, request: witness, userSignature, quoteId }),
  });
  const serverReqId = resp.headers.get('server-req-id') || null;
  const httpStatus = resp.status;
  let data = null;
  try { data = await resp.json(); } catch { data = null; }
  const submitResult = {
    success: !!(data && data.success),
    httpStatus,
    serverReqId,
    result: data && data.result ? data.result : null,
    requestHash: data && data.result && data.result.requestHash ? data.result.requestHash : null,
    error: data && !data.success ? (data.error?.message || data.message || null) : null,
  };
  if (!submitResult.success) {
    // 不中斷流程，回傳詳細錯誤給前端呈現
    return submitResult;
  }
  return submitResult;
}


// Proxy: Bungee status
async function fetchBungeeStatus(requestHash) {
  const base = 'https://public-backend.bungee.exchange';
  const resp = await fetch(`${base}/api/v1/bungee/status?requestHash=${encodeURIComponent(requestHash)}`);
  const data = await resp.json();
  if (!data?.success) {
    throw new Error(data?.error?.message || data?.message || `HTTP ${resp.status}`);
  }
  const status = Array.isArray(data.result) && data.result.length ? data.result[0] : null;
  const serverReqId = resp.headers.get('server-req-id') || null;
  return { status, meta: { serverReqId } };
}

// Approve ability schema (簡化：與文檔一致)
const approveParamsSchema = z.object({
  chainId: z.union([z.string(), z.number()]),
  tokenIn: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
  amountIn: z.string().regex(/^\d+$/),
  rpcUrl: z.string().url(),
  spenderAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/).optional(),
  alchemyGasSponsor: z.boolean().optional(),
  alchemyGasSponsorApiKey: z.string().optional(),
  alchemyGasSponsorPolicyId: z.string().optional(),
});

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
    const { bridgeParams, delegatorPkpEthAddress } = req.body || {};
    console.log('precheck req.body', req.body);
    if (!bridgeParams) return res.status(400).json({ ok: false, error: 'Missing bridgeParams' });
    const parsed = abilityParamsSchema.safeParse(bridgeParams);
    if (!parsed.success) {
      return res.status(400).json({ ok: false, error: 'Invalid bridgeParams', issues: parsed.error.issues });
    }

    let delegator = delegatorPkpEthAddress;
    if (!delegator) {
      const decoded = req.vincentUser.decodedJWT;
      const pkpAddr = decoded?.payload?.pkpInfo?.ethAddress ?? decoded?.pkp?.ethAddress;
      if (!pkpAddr) return res.status(400).json({ ok: false, error: 'Invalid JWT: no pkp.ethAddress' });
      delegator = pkpAddr;
    }

    const result = await vincentPrecheck(bridgeParams, { delegatorPkpEthAddress: delegator });
    
    // 提取並回傳 precheck 的關鍵參數
    const hints = extractHintsFromPrecheck(result);
    console.log('Precheck hints:', hints);
    
    return res.json({ 
      ok: true, 
      result,
      hints: {
        signTypedData: hints?.signTypedData,
        quoteId: hints?.quoteId,
        requestType: hints?.requestType,
        hasSignTypedData: !!hints?.signTypedData,
        hasQuoteId: !!hints?.quoteId,
        hasRequestType: !!hints?.requestType
      }
    });
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
    const parsed = abilityParamsSchema.safeParse(bridgeParams);
    if (!parsed.success) {
      return res.status(400).json({ ok: false, error: 'Invalid bridgeParams', issues: parsed.error.issues });
    }

    let delegator = delegatorPkpEthAddress;
    if (!delegator) {
      const decoded = req.vincentUser.decodedJWT;
      const pkpAddr = decoded?.payload?.pkpInfo?.ethAddress ?? decoded?.pkp?.ethAddress;
      if (!pkpAddr) return res.status(400).json({ ok: false, error: 'Invalid JWT: no pkp.ethAddress' });
      delegator = pkpAddr;
    }

    const quoteResult = await vincentQuote(bridgeParams, { delegatorPkpEthAddress: delegator });
    if (!quoteResult.success) {
      return res.status(400).json({ ok: false, error: quoteResult.error });
    }
    return res.json({ ok: true, result: quoteResult.result });
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
    const parsed = abilityParamsSchema.safeParse(bridgeParams);
    if (!parsed.success) {
      return res.status(400).json({ ok: false, error: 'Invalid bridgeParams', issues: parsed.error.issues });
    }

    let delegator = delegatorPkpEthAddress;
    if (!delegator) {
      const decoded = req.vincentUser.decodedJWT;
      const pkpAddr = decoded?.payload?.pkpInfo?.ethAddress ?? decoded?.pkp?.ethAddress;
      if (!pkpAddr) return res.status(400).json({ ok: false, error: 'Invalid JWT: no pkp.ethAddress' });
      delegator = pkpAddr;
    }

    /* 若未帶快路徑三件套，先執行 precheck 取得簽名參數
    if (!bridgeParams.signTypedData || !bridgeParams.quoteId || !bridgeParams.requestType) {
      const pre = await vincentPrecheck(bridgeParams, { delegatorPkpEthAddress: delegator });
      const hints = extractHintsFromPrecheck(pre);
      if (!hints?.signTypedData || !hints?.quoteId || !hints?.requestType) {
        throw new Error('Precheck did not return signTypedData/quoteId/requestType');
      }
      const execParams = { ...bridgeParams, ...hints };
      const execRes = await vincentExecute(execParams, { delegatorPkpEthAddress: delegator });
      const payload = execRes?.result ?? execRes;
      return res.json({ 
        ok: true, 
        result: payload, 
        requestType: payload?.requestType || hints.requestType, 
        quoteId: payload?.quoteId || hints.quoteId, 
        userSignature: payload?.userSignature, 
        signTypedData: payload?.signTypedData, 
        witness: payload?.witness || payload?.signTypedData?.values?.witness, 
        fromChainId: payload?.fromChainId, 
        toChainId: payload?.toChainId, 
        timestamp: payload?.timestamp 
      });
    }
      */

    // 已帶三件套：僅簽名
    const execRes = await vincentExecute(bridgeParams, { delegatorPkpEthAddress: delegator });
    const payload = execRes.result;
    console.log('payload', payload);
    return res.json({ 
      ok: true, 
      result: payload, 
      requestType: payload?.requestType || bridgeParams?.requestType, 
      quoteId: payload?.quoteId || bridgeParams?.quoteId, 
      userSignature: payload?.userSignature, 
      signTypedData: payload?.signTypedData, 
      witness: payload?.witness || payload?.signTypedData?.values?.witness, 
      fromChainId: payload?.fromChainId, 
      toChainId: payload?.toChainId, 
      timestamp: payload?.timestamp 
    });
  } catch (err) {
    console.error('execute error:', err);
    return res.status(400).json({ ok: false, error: err.message || String(err) });
  }
}));

// GET /api/bungee/status?requestHash=0x...
app.get('/api/bungee/status', async (req, res) => {
  try {
    const requestHash = String(req.query.requestHash || '').trim();
    if (!requestHash) return res.status(400).json({ ok: false, error: 'Missing requestHash' });
    const { status, meta } = await fetchBungeeStatus(requestHash);
    return res.json({ ok: true, status, meta });
  } catch (err) {
    return res.status(400).json({ ok: false, error: err.message || String(err) });
  }
});

// POST /api/vincent/executeCombined { bridgeParams, delegatorPkpEthAddress }
app.post('/api/vincent/executeCombined', vincentAuth, withVincentAuth(async (req, res) => {
  try {
    const { bridgeParams, delegatorPkpEthAddress } = req.body || {};
    if (!bridgeParams) return res.status(400).json({ ok: false, error: 'Missing bridgeParams' });
    const parsed = abilityParamsSchema.safeParse(bridgeParams);
    if (!parsed.success) {
      return res.status(400).json({ ok: false, error: 'Invalid bridgeParams', issues: parsed.error.issues });
    }

    let delegator = delegatorPkpEthAddress;
    if (!delegator) {
      const decoded = req.vincentUser.decodedJWT;
      const pkpAddr = decoded?.payload?.pkpInfo?.ethAddress ?? decoded?.pkp?.ethAddress;
      if (!pkpAddr) return res.status(400).json({ ok: false, error: 'Invalid JWT: no pkp.ethAddress' });
      delegator = pkpAddr;
    }

    const result = await vincentExecuteCombined({ ...parsed.data, separateApproval: false }, { delegatorPkpEthAddress: delegator });
    return res.json({ ok: true, result });
  } catch (err) {
    console.error('executeCombined error:', err);
    return res.status(400).json({ ok: false, error: err.message || String(err) });
  }
}));

// POST /api/vincent/sponsor/precheck { sponsorParams, delegatorPkpEthAddress }
app.post('/api/vincent/sponsor/precheck', vincentAuth, withVincentAuth(async (req, res) => {
  try {
    const { sponsorParams, delegatorPkpEthAddress } = req.body;
    if (!sponsorParams) {
      return res.status(400).json({ success: false, error: 'Missing sponsorParams' });
    }
    const delegator = delegatorPkpEthAddress || req.delegatorPkpEthAddress;
    if (!delegator) {
      return res.status(400).json({ success: false, error: 'Missing delegatorPkpEthAddress' });
    }
    const result = await sponsorTransactionPrecheck(sponsorParams, { delegatorPkpEthAddress: delegator });
    res.json({ success: true, result });
  } catch (error) {
    console.error('Sponsor precheck error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}));

// POST /api/vincent/sponsor/execute { sponsorParams, delegatorPkpEthAddress }
app.post('/api/vincent/sponsor/execute', vincentAuth, withVincentAuth(async (req, res) => {
  try {
    const { sponsorParams, delegatorPkpEthAddress } = req.body;
    if (!sponsorParams) {
      return res.status(400).json({ success: false, error: 'Missing sponsorParams' });
    }
    const delegator = delegatorPkpEthAddress || req.delegatorPkpEthAddress;
    if (!delegator) {
      return res.status(400).json({ success: false, error: 'Missing delegatorPkpEthAddress' });
    }
    const result = await sponsorTransactionExecute(sponsorParams, { delegatorPkpEthAddress: delegator });
    res.json({ success: true, result });
  } catch (error) {
    console.error('Sponsor execute error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}));

// POST /api/vincent/approve/precheck { approvalParams, delegatorPkpEthAddress }
app.post('/api/vincent/approve/precheck', vincentAuth, withVincentAuth(async (req, res) => {
  try {
    const { approvalParams, delegatorPkpEthAddress } = req.body || {};
    if (!approvalParams) return res.status(400).json({ ok: false, error: 'Missing approvalParams' });
    const parsed = approveParamsSchema.safeParse(approvalParams);
    if (!parsed.success) {
      return res.status(400).json({ ok: false, error: 'Invalid approvalParams', issues: parsed.error.issues });
    }
    let delegator = delegatorPkpEthAddress;
    if (!delegator) {
      const decoded = req.vincentUser.decodedJWT;
      const pkpAddr = decoded?.payload?.pkpInfo?.ethAddress ?? decoded?.pkp?.ethAddress;
      if (!pkpAddr) return res.status(400).json({ ok: false, error: 'Invalid JWT: no pkp.ethAddress' });
      delegator = pkpAddr;
    }
    const result = await approvePermit2Precheck(parsed.data, { delegatorPkpEthAddress: delegator });
    return res.json({ ok: true, result });
  } catch (err) {
    console.error('approve precheck error:', err);
    return res.status(400).json({ ok: false, error: err.message || String(err) });
  }
}));

// POST /api/vincent/approve/execute { approvalParams, delegatorPkpEthAddress }
app.post('/api/vincent/approve/execute', vincentAuth, withVincentAuth(async (req, res) => {
  try {
    const { approvalParams, delegatorPkpEthAddress } = req.body || {};
    if (!approvalParams) return res.status(400).json({ ok: false, error: 'Missing approvalParams' });
    const parsed = approveParamsSchema.safeParse(approvalParams);
    if (!parsed.success) {
      return res.status(400).json({ ok: false, error: 'Invalid approvalParams', issues: parsed.error.issues });
    }
    let delegator = delegatorPkpEthAddress;
    if (!delegator) {
      const decoded = req.vincentUser.decodedJWT;
      const pkpAddr = decoded?.payload?.pkpInfo?.ethAddress ?? decoded?.pkp?.ethAddress;
      if (!pkpAddr) return res.status(400).json({ ok: false, error: 'Invalid JWT: no pkp.ethAddress' });
      delegator = pkpAddr;
    }
    const result = await approvePermit2Execute(parsed.data, { delegatorPkpEthAddress: delegator });
    // 若底層為 UserOp，回傳可能帶有 userOpHash 或 opHash/ophash
    const opHash = result?.userOpHash || result?.opHash || result?.ophash;
    let bundleTxHash = null;
    if (opHash && alchemyGasSponsorApiKey && alchemyGasSponsorPolicyId) {
      try {
        const provider = new (require('ethers').ethers).providers.JsonRpcProvider(parsed.data.rpcUrl);
        bundleTxHash = await waitForUserOp({
          pkpPublicKey: req.vincentUser.decodedJWT?.payload?.pkpInfo?.publicKey || req.vincentUser.decodedJWT?.pkp?.publicKey,
          chainId: provider.network.chainId,
          eip7702AlchemyApiKey: alchemyGasSponsorApiKey,
          eip7702AlchemyPolicyId: alchemyGasSponsorPolicyId,
          userOp: opHash,
        });
      } catch (e) {
        console.error('waitForUserOp failed:', e?.message || e);
      }
    }
    return res.json({ ok: true, result, bundleTxHash });
  } catch (err) {
    console.error('approve execute error:', err);
    return res.status(400).json({ ok: false, error: err.message || String(err) });
  }
}));

app.listen(PORT, () => {
  console.log(`JWT verify server listening on http://localhost:${PORT}`);
});


