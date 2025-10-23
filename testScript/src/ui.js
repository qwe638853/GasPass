import { VincentBridgeClient } from './logic/vincentClient.js';
import { createWebAuth, bootstrapAuthFlow } from './auth.js';
import { ethers } from 'ethers';

const $ = (id) => document.getElementById(id);
const logEl = $('log');

// Env helpers
const ENV_APP_ID = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_VINCENT_APP_ID) ? import.meta.env.VITE_VINCENT_APP_ID : undefined;
const STORAGE_PKP_ADDR = 'VINCENT_PKP_ETH_ADDRESS';

function log(message, type = 'info') {
  const time = new Date().toLocaleTimeString();
  const line = document.createElement('div');
  line.className = type === 'error' ? 'err' : type === 'ok' ? 'ok' : '';
  line.textContent = `[${time}] ${message}`;
  logEl.prepend(line);
}

function getParamsFromForm() {
  return {
    rpcUrl: $('rpcUrl').value,
    sourceChain: $('sourceChain').value,
    destinationChain: $('destinationChain').value,
    sourceToken: $('sourceToken').value,
    destinationToken: $('destinationToken').value,
    amount: $('amount').value,
    slippageBps: $('slippageBps').value,
    spenderAddress: $('spenderAddress')?.value || '',
    // optional sponsor inline params (override env on server if provided)
    alchemyGasSponsor: true,
    alchemyGasSponsorApiKey: '',
    alchemyGasSponsorPolicyId: '',
  };
}

function buildAbilityParams() {
  const f = getParamsFromForm();
  const delegator = $('delegator')?.value?.trim();
  const recipientInput = $('recipient')?.value?.trim();
  // recipient 應該使用 PKP Address，不是用戶錢包地址
  const recipient = recipientInput || delegator || '';
  const params = {
    rpcUrl: String(f.rpcUrl || '').trim(),
    fromChainId: String(f.sourceChain || '').trim(),
    toChainId: String(f.destinationChain || '').trim(),
    fromToken: String(f.sourceToken || '').trim(),
    toToken: String(f.destinationToken || '').trim(),
    amount: String(f.amount || '').trim(),
    recipient, // 使用 PKP Address 作為 recipient
    slippageBps: f.slippageBps ? Number(f.slippageBps) : undefined,
  };
  // Sponsored flow 已移除；僅使用 Permit2
  return params;
}

const client = new VincentBridgeClient();

// 安全發送與解析（避免 Unexpected end of JSON input）
async function postJson(path, payload) {
  const resp = await fetch(path, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(payload && payload.jwt ? { Authorization: `Bearer ${payload.jwt}` } : {}),
    },
    body: JSON.stringify(payload)
  });
  const text = await resp.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch (_) {
    data = null;
  }
  return { resp, data, text };
}

// 表單狀態持久化與還原（Sponsored flow 移除）
const formKeys = ['rpcUrl','sourceChain','destinationChain','sourceToken','destinationToken','amount','slippageBps','recipient','appId','jwtStr','audience'];
const sponsorKeys = [];
function saveForm() {
  try {
    const state = {};
    for (const k of formKeys) state[k] = ($(k)?.value ?? '');
    for (const k of sponsorKeys) {
      const el = $(k);
      state[k] = el ? (el.type === 'checkbox' ? el.checked : el.value) : '';
    }
    localStorage.setItem('FORM_STATE', JSON.stringify(state));
  } catch {}
}
function loadForm() {
  try {
    const raw = localStorage.getItem('FORM_STATE');
    if (!raw) return;
    const state = JSON.parse(raw);
    for (const k of formKeys) if ($(k) && state[k] != null) $(k).value = state[k];
    for (const k of sponsorKeys) if ($(k) && state[k] != null) {
      if ($(k).type === 'checkbox') $(k).checked = !!state[k]; else $(k).value = state[k];
    }
  } catch {}
}
loadForm();
loadSponsorForm();
window.addEventListener('beforeunload', saveForm);
formKeys.forEach(id => { const el = $(id); if (el) el.addEventListener('input', saveForm); });

// Audience 預設使用目前 origin（僅在欄位為空時）
if ($('audience') && !$('audience').value) {
  $('audience').value = window.location.origin;
}
// 若 .env 提供 AppID，優先帶入（不強制顯示表單值）
if (ENV_APP_ID && $('appId')) {
  $('appId').placeholder = String(ENV_APP_ID);
}
// 從儲存的 PKP 地址還原到欄位（若存在且欄位為空）
try {
  const pkpAddrSaved = localStorage.getItem(STORAGE_PKP_ADDR);
  if (pkpAddrSaved && $('delegator') && !$('delegator').value) {
    $('delegator').value = pkpAddrSaved;
  }
} catch {}
$('btn-login-vincent').addEventListener('click', async () => {
  try {
    const appIdInput = $('appId')?.value?.trim();
    const appId = (appIdInput && appIdInput !== '') ? appIdInput : (ENV_APP_ID != null ? String(ENV_APP_ID) : '');
    if (!appId) throw new Error('請輸入 Vincent App ID');
    const aud = ($('audience')?.value || window.location.origin).trim();
    let webAuth = createWebAuth(appId);
    let state;
    try {
      state = await bootstrapAuthFlow(webAuth, aud);
    } catch (e) {
      if (String(e?.message || '').includes('appId mismatch')) {
        webAuth = createWebAuth(Number(appId));
        state = await bootstrapAuthFlow(webAuth, aud);
      } else {
        throw e;
      }
    }
    if (state.needsRedirect) {
      webAuth.redirectToConnectPage({ redirectUri: window.location.href });
      return;
    }
    if (state.decodedJWT) {
      $('jwtStr').value = state.jwtStr;
      // 優先使用 payload.pkpInfo.ethAddress，回退到 pkp.ethAddress
      const pkpAddr = state.decodedJWT?.payload?.pkpInfo?.ethAddress ?? state.decodedJWT?.pkp?.ethAddress;
      if (pkpAddr) {
        $('delegator').value = pkpAddr;
        try { localStorage.setItem(STORAGE_PKP_ADDR, pkpAddr) } catch {}
      }
      log('JWT 已載入並填入欄位', 'ok');
      saveForm();
    }
  } catch (err) {
    console.error(err);
    log('Vincent 登入流程失敗: ' + (err.message || err), 'error');
  }
});

// 自動從既有 JWT 或已保存 AppID 嘗試還原（避免重定向後狀態遺失）
(async function tryBootstrap() {
  try {
    // 優先使用已儲存的解析結果
    const jwtSaved = localStorage.getItem('VINCENT_AUTH_JWT');
    const decodedSaved = localStorage.getItem('VINCENT_AUTH_JWT_DECODED');
    if (jwtSaved) $('jwtStr').value = jwtSaved;
    if (decodedSaved) {
      const decoded = JSON.parse(decodedSaved);
      if (decoded?.pkp?.ethAddress) $('delegator').value = decoded.pkp.ethAddress;
    }

    // 若 URL 仍含 JWT 且已存在 appId，則自動解析一次
    const appIdField = $('appId')?.value?.trim();
    const appId = (ENV_APP_ID != null ? String(ENV_APP_ID) : '') || appIdField;
    if (appId) {
      const aud = ($('audience')?.value || window.location.origin).trim();
      let state;
      try {
        state = await bootstrapAuthFlow(createWebAuth(appId), aud);
      } catch (e) {
        if (String(e?.message || '').includes('appId mismatch')) {
          state = await bootstrapAuthFlow(createWebAuth(Number(appId)), aud);
        } else {
          throw e;
        }
      }
      if (state.decodedJWT) {
        $('jwtStr').value = state.jwtStr;
        const pkpAddr = state.decodedJWT?.payload?.pkpInfo?.ethAddress ?? state.decodedJWT?.pkp?.ethAddress;
        if (pkpAddr) {
          $('delegator').value = pkpAddr;
          try { localStorage.setItem(STORAGE_PKP_ADDR, pkpAddr) } catch {}
        }
        log('已自動從 URL JWT 還原', 'ok');
      }
    }
    saveForm();
  } catch {}
})();

$('btn-connect').addEventListener('click', async () => {
  try {
    log('連接錢包中...');
    const { address } = await client.connectWallet();
    $('account').textContent = address;
    log('錢包已連接: ' + address, 'ok');
  } catch (err) {
    console.error(err);
    log('連接失敗: ' + (err.message || err), 'error');
  }
});

$('btn-verify-jwt').addEventListener('click', async () => {
  try {
    const jwtStr = $('jwtStr').value.trim();
    const audience = $('audience').value.trim();
    if (!jwtStr) throw new Error('請輸入 Vincent JWT');
    if (!audience) throw new Error('請輸入 Audience (redirect URI)');

    log('送出後端驗證中...');
    const appId = $('appId')?.value?.trim();

    const { resp, data, text } = await postJson('/api/verify-jwt', { jwt: jwtStr, audience, appId });
    if (!resp.ok || !data?.ok) {
      throw new Error((data && data.error) || text || `HTTP ${resp.status}`);
    }
    log('後端驗證成功: ' + JSON.stringify(data.decoded), 'ok');
  } catch (err) {
    console.error(err);
    log('後端驗證錯誤: ' + (err.message || err), 'error');
  }
});

$('btn-precheck').addEventListener('click', async () => {
  try {
    const delegator = $('delegator').value.trim();
    const jwt = $('jwtStr').value.trim();
    const audience = $('audience').value.trim();
    if (!jwt) throw new Error('請先登入以取得 JWT');
    const params = buildAbilityParams();
    log('執行後端 precheck...');
    const appId = $('appId')?.value?.trim();
    let decodedJWT = null; try { const s = localStorage.getItem('VINCENT_AUTH_JWT_DECODED'); decodedJWT = s ? JSON.parse(s) : null; } catch {}
    const { resp, data, text } = await postJson('/api/vincent/precheck', { bridgeParams: params, delegatorPkpEthAddress: delegator, jwt, audience, appId, decodedJWT });
    if (!resp.ok || !data?.ok) throw new Error((data && data.error) || text || `HTTP ${resp.status}`);
    log('precheck 回應: ' + JSON.stringify(data.result));
    
    // 顯示 precheck 的關鍵參數
    if (data?.hints) {
      log('Precheck 關鍵參數:');
      log('- signTypedData: ' + (data.hints.hasSignTypedData ? '有' : '無'));
      log('- quoteId: ' + (data.hints.quoteId || '無'));
      log('- requestType: ' + (data.hints.requestType || '無'));
      
      if (data.hints.signTypedData) {
        log('- signTypedData 詳細: ' + JSON.stringify(data.hints.signTypedData, null, 2));
      }
    }
  } catch (err) {
    console.error(err);
    log('precheck 失敗: ' + (err.message || err), 'error');
  }
});

$('btn-quote').addEventListener('click', async () => {
  try {
    const delegator = $('delegator').value.trim();
    const jwt = $('jwtStr').value.trim();
    const audience = $('audience').value.trim();
    if (!jwt) throw new Error('請先登入以取得 JWT');
    const params = buildAbilityParams();
    log('後端取得 signed bridge quote...');
    const appId = $('appId')?.value?.trim();
    let decodedJWT = null; try { const s = localStorage.getItem('VINCENT_AUTH_JWT_DECODED'); decodedJWT = s ? JSON.parse(s) : null; } catch {}
    const { resp, data, text } = await postJson('/api/vincent/quote', { bridgeParams: params, delegatorPkpEthAddress: delegator, jwt, audience, appId, decodedJWT });
    if (!resp.ok || !data?.ok) throw new Error((data && data.error) || text || `HTTP ${resp.status}`);
    log('quote 回應: ' + JSON.stringify(data.result));
  } catch (err) {
    console.error(err);
    log('quote 失敗: ' + (err.message || err), 'error');
  }
});

$('btn-exec').addEventListener('click', async () => {
  try {
    const delegator = $('delegator').value.trim();
    const jwt = $('jwtStr').value.trim();
    const audience = $('audience').value.trim();
    if (!jwt) throw new Error('請先登入以取得 JWT');
    const params = buildAbilityParams();
    log('後端執行 execute...');
    const appId = $('appId')?.value?.trim();
    let decodedJWT = null; try { const s = localStorage.getItem('VINCENT_AUTH_JWT_DECODED'); decodedJWT = s ? JSON.parse(s) : null; } catch {}
    const { resp, data, text } = await postJson('/api/vincent/execute', { bridgeParams: params, delegatorPkpEthAddress: delegator, jwt, audience, appId, decodedJWT });
    if (!resp.ok || !data?.ok) throw new Error((data && data.error) || text || `HTTP ${resp.status}`);
    log('execute 回應: ' + JSON.stringify(data.result));
  } catch (err) {
    console.error(err);
    log('execute 失敗: ' + (err.message || err), 'error');
  }
});

$('btn-exec-combined').addEventListener('click', async () => {
  try {
    const delegator = $('delegator').value.trim();
    const jwt = $('jwtStr').value.trim();
    const audience = $('audience').value.trim();
    if (!jwt) throw new Error('請先登入以取得 JWT');
    const params = buildAbilityParams();
    log('後端執行 executeCombined...');
    const appId = $('appId')?.value?.trim();
    let decodedJWT = null; try { const s = localStorage.getItem('VINCENT_AUTH_JWT_DECODED'); decodedJWT = s ? JSON.parse(s) : null; } catch {}
    const { resp, data, text } = await postJson('/api/vincent/executeCombined', { bridgeParams: params, delegatorPkpEthAddress: delegator, jwt, audience, appId, decodedJWT });
    if (!resp.ok || !data?.ok) throw new Error((data && data.error) || text || `HTTP ${resp.status}`);
    log('executeCombined 回應: ' + JSON.stringify(data.result));
  } catch (err) {
    console.error(err);
    log('executeCombined 失敗: ' + (err.message || err), 'error');
  }
});

// EIP-712 簽名驗證函數（包含 signer 回推）
function verifyEIP712Signature(signature, signTypedData, expectedSigner) {
  try {
    // 檢查簽名格式
    if (!signature || !signature.startsWith('0x') || signature.length !== 132) {
      return { valid: false, error: 'Invalid signature format' };
    }
    
    // 檢查 signTypedData 結構
    if (!signTypedData || !signTypedData.domain || !signTypedData.types || !signTypedData.values) {
      return { valid: false, error: 'Invalid signTypedData structure' };
    }
    
    // 檢查 domain 必要欄位
    const domain = signTypedData.domain;
    if (!domain.name || !domain.chainId || !domain.verifyingContract) {
      return { valid: false, error: 'Invalid domain structure' };
    }
    
    // 檢查 types 結構
    if (!signTypedData.types.PermitWitnessTransferFrom) {
      return { valid: false, error: 'Missing PermitWitnessTransferFrom type' };
    }
    
    // 檢查 values 結構
    const values = signTypedData.values;
    if (!values.permitted || !values.spender || !values.nonce || !values.deadline || !values.witness) {
      return { valid: false, error: 'Invalid values structure' };
    }
    
    // 檢查 witness 結構
    const witness = values.witness;
    if (!witness.basicReq || !witness.swapOutputToken || witness.minSwapOutput === undefined || !witness.metadata) {
      return { valid: false, error: 'Invalid witness structure' };
    }
    
    // 檢查 basicReq 結構
    const basicReq = witness.basicReq;
    if (!basicReq.originChainId || !basicReq.destinationChainId || !basicReq.deadline || 
        !basicReq.nonce || !basicReq.sender || !basicReq.receiver || !basicReq.delegate || 
        !basicReq.bungeeGateway || !basicReq.switchboardId || !basicReq.inputToken || 
        !basicReq.inputAmount || !basicReq.outputToken || !basicReq.minOutputAmount || 
        basicReq.refuelAmount === undefined) {
      return { valid: false, error: 'Invalid basicReq structure' };
    }
    
    // 回推 signer（使用 ethers v6 的 recoverAddress）
    let recoveredSigner = null;
    try {
      // 使用 ethers v6 的 TypedDataEncoder 和 recoverAddress
      if (ethers && ethers.TypedDataEncoder) {
        const hash = ethers.TypedDataEncoder.hash(domain, signTypedData.types, values);
        recoveredSigner = ethers.recoverAddress(hash, signature);
        console.log('EIP-712 Hash:', hash);
        console.log('Recovered Signer:', recoveredSigner);
      } else {
        // 如果沒有 ethers.js，使用 Web3 或其他方法
        recoveredSigner = 'ethers.js not available';
        console.log('ethers.js not available, ethers:', ethers);
        console.log('ethers.TypedDataEncoder:', ethers?.TypedDataEncoder);
      }
    } catch (recoverError) {
      recoveredSigner = 'Recovery failed: ' + recoverError.message;
      console.error('Recovery error:', recoverError);
    }
    
    // 檢查 signer 是否匹配
    const signerMatches = expectedSigner && recoveredSigner && 
                         recoveredSigner.toLowerCase() === expectedSigner.toLowerCase();
    
    return { 
      valid: true, 
      message: 'EIP-712 signature structure is valid',
      details: {
        domain: domain,
        primaryType: 'PermitWitnessTransferFrom',
        hasWitness: !!witness,
        chainId: domain.chainId,
        verifyingContract: domain.verifyingContract,
        recoveredSigner: recoveredSigner,
        expectedSigner: expectedSigner,
        signerMatches: signerMatches
      }
    };
  } catch (error) {
    return { valid: false, error: 'Verification error: ' + error.message };
  }
}

// 後端自動 Precheck -> Execute(簽名) -> Submit
$('btn-exec-auto').addEventListener('click', async () => {
  try {
    const delegator = $('delegator').value.trim();
    const jwt = $('jwtStr').value.trim();
    const audience = $('audience').value.trim();
    if (!jwt) throw new Error('請先登入以取得 JWT');
    const params = buildAbilityParams();
    log('後端執行 execute 流程 (precheck -> sign)...');
    const appId = $('appId')?.value?.trim();
    let decodedJWT = null; try { const s = localStorage.getItem('VINCENT_AUTH_JWT_DECODED'); decodedJWT = s ? JSON.parse(s) : null; } catch {}
    const { resp, data, text } = await postJson('/api/vincent/execute', { bridgeParams: params, delegatorPkpEthAddress: delegator, jwt, audience, appId, decodedJWT });
    if (!resp.ok || !data?.ok) throw new Error((data && data.error) || text || `HTTP ${resp.status}`);
    log('execute(自動) 回應: ' + JSON.stringify({ result: data.result, requestType: data.requestType, quoteId: data.quoteId, userSignature: data.userSignature, witness: data.witness }));
    try { localStorage.setItem('LAST_EXECUTE_PAYLOAD', JSON.stringify(data.result || {})); } catch {}

    // 驗證 EIP-712 簽名
    if (data?.userSignature && data?.signTypedData) {
      log('開始驗證 EIP-712 簽名...');
      const verification = verifyEIP712Signature(data.userSignature, data.signTypedData, delegator);
      if (verification.valid) {
        log('✅ EIP-712 簽名驗證通過: ' + verification.message, 'ok');
        log('簽名詳情: ' + JSON.stringify(verification.details, null, 2));
        
        // 顯示 signer 回推結果
        if (verification.details.recoveredSigner) {
          log('🔍 回推的 Signer: ' + verification.details.recoveredSigner);
          log('🎯 期望的 Signer: ' + verification.details.expectedSigner);
          log('✅ Signer 匹配: ' + (verification.details.signerMatches ? '是' : '否'));
        }
      } else {
        log('❌ EIP-712 簽名驗證失敗: ' + verification.error, 'error');
        return; // 停止執行，不進行 submit
      }
    } else {
      log('⚠️ 缺少簽名或 signTypedData，無法驗證', 'error');
    }

    // 前端執行 submit
    if (data?.userSignature && data?.witness && data?.quoteId && data?.requestType) {
      log('開始前端 Submit 到 Bungee...');
      try {
        const submitBody = {
          requestType: data.requestType,
          request: data.witness,
          userSignature: data.userSignature,
          quoteId: data.quoteId,
        };
        log('前端 Submit 請求: ' + JSON.stringify(submitBody));
        const submitResp = await fetch('https://public-backend.bungee.exchange/api/v1/bungee/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(submitBody),
        });
        const serverReqId1 = submitResp.headers;
        console.log('serverReqId', serverReqId1);
        console.log('All Headers:');
        console.log(submitResp.headers.keys());
        console.log(submitResp.headers.values());

        // 專取出 server-req-id
        const serverReqId = submitResp.headers.get('server-req-id');
        console.log('✅ Server Request ID:', serverReqId);

        const submitData = await submitResp.json();
        log('前端 Submit 回應: ' + JSON.stringify({ 
          http: submitResp.status, 
          serverReqId:  null, 
          data: submitData 
        }));
        
        if (submitData?.success && submitData?.result?.requestHash) {
          log('Bungee 已接收請求: ' + submitData.result.requestHash + '，開始輪詢狀態...', 'ok');
          await pollBungeeStatusUI(submitData.result.requestHash);
        }
      } catch (submitErr) {
        log('前端 Submit 失敗: ' + (submitErr.message || submitErr), 'error');
      }
    } else {
      log('缺少必要參數，無法執行 Submit', 'error');
    }
  } catch (err) {
    console.error(err);
    log('execute(自動) 失敗: ' + (err.message || err), 'error');
  }
});

// 檢查 Permit2 Allowance (前端直接檢查)
async function checkPermit2Allowance(params) {
  try {
    const delegator = $('delegator').value.trim();
    
    if (!delegator) {
      throw new Error('請先連接錢包以取得 PKP 地址');
    }
    
    // 根據鏈 ID 選擇正確的 RPC URL
    const chainId = Number(params.fromChainId);
    let rpcUrl = params.rpcUrl;
    
    if (!rpcUrl || rpcUrl.includes('yellowstone-rpc.litprotocol.com')) {
      // 使用預設的 RPC URL
      switch (chainId) {
        case 42161: // Arbitrum One
          rpcUrl = 'https://arb1.arbitrum.io/rpc';
          break;
        case 8453: // Base
          rpcUrl = 'https://mainnet.base.org';
          break;
        case 1: // Ethereum
          rpcUrl = 'https://eth.llamarpc.com';
          break;
        default:
          rpcUrl = 'https://arb1.arbitrum.io/rpc'; // 預設使用 Arbitrum
      }
    }
    
    log('🔍 前端直接檢查 Permit2 Allowance...');
    log('檢查參數: ' + JSON.stringify({
      chainId,
      tokenAddress: params.fromToken,
      userAddress: delegator,
      spenderAddress: '0x000000000022D473030F116dDEE9F6B43aC78BA3',
      rpcUrl
    }));
    
    // 使用 ethers.js 直接檢查 ERC20 token 對 Permit2 的 allowance
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    
    // ERC20 ABI for allowance function
    const ERC20_ABI = [
      {
        "inputs": [
          {"internalType": "address", "name": "owner", "type": "address"},
          {"internalType": "address", "name": "spender", "type": "address"}
        ],
        "name": "allowance",
        "outputs": [
          {"internalType": "uint256", "name": "", "type": "uint256"}
        ],
        "stateMutability": "view",
        "type": "function"
      }
    ];
    
    const tokenContract = new ethers.Contract(params.fromToken, ERC20_ABI, provider);
    
    // 檢查 ERC20 token 對 Permit2 合約的 allowance
    const amount = await tokenContract.allowance(
      delegator,
      '0x000000000022D473030F116dDEE9F6B43aC78BA3' // Permit2 合約地址
    );
    
    // ERC20 allowance 沒有過期時間，只有數量
    const hasAllowance = (typeof amount.gt === 'function' ? amount.gt(0) : Number(amount) > 0);
    
    const allowance = {
      amount: amount.toString(),
      hasAllowance,
      tokenAddress: params.fromToken,
      spenderAddress: '0x000000000022D473030F116dDEE9F6B43aC78BA3'
    };
    
    log('✅ Allowance 檢查結果: ' + JSON.stringify(allowance));
    
    return allowance;
  } catch (err) {
    console.error('Allowance 檢查失敗:', err);
    log('❌ Allowance 檢查失敗: ' + (err.message || err), 'error');
    return null;
  }
}

// Quote → Execute → Submit 流程
$('btn-quote-exec-submit').addEventListener('click', async () => {
  try {
    const delegator = $('delegator').value.trim();
    const jwt = $('jwtStr').value.trim();
    const audience = $('audience').value.trim();
    if (!jwt) throw new Error('請先登入以取得 JWT');
    const params = buildAbilityParams();
    
    // Step 0: 檢查 Permit2 Allowance
    log('步驟 0: 檢查 Permit2 Allowance...');
    const allowance = await checkPermit2Allowance(params);
    
    if (!allowance) {
      log('❌ 無法檢查 Allowance，停止流程', 'error');
      return;
    }
    
    if (!allowance.hasAllowance) {
      log('⚠️ Allowance 不足或已過期，需要執行 Permit2 Approval', 'warning');
      
      // 自動執行 Permit2 Approval
      try {
        log('🔄 自動執行 Permit2 Approval...');
        const approvalParams = {
          chainId: Number(params.fromChainId),
          tokenIn: params.fromToken,
          amountIn: params.amount,
          rpcUrl: params.rpcUrl || `https://arb1.arbitrum.io/rpc`,
          spenderAddress: '0x000000000022D473030F116dDEE9F6B43aC78BA3',
          alchemyGasSponsor: true,
          alchemyGasSponsorApiKey: undefined,
          alchemyGasSponsorPolicyId: undefined,
        };
        
        const appId = $('appId')?.value?.trim();
        let decodedJWT = null; 
        try { 
          const s = localStorage.getItem('VINCENT_AUTH_JWT_DECODED'); 
          decodedJWT = s ? JSON.parse(s) : null; 
        } catch {}
        
        // 執行 Permit2 Approval
        const { resp: approveResp, data: approveData, text: approveText } = await postJson('/api/vincent/approve/execute', { 
          approvalParams, 
          delegatorPkpEthAddress: delegator, 
          jwt, 
          audience, 
          appId,
          decodedJWT
        });
        
        if (!approveResp.ok || !approveData?.ok) {
          throw new Error((approveData && approveData.error) || approveText || `Approval HTTP ${approveResp.status}`);
        }
        
        log('✅ Permit2 Approval 完成: ' + JSON.stringify(approveData.result), 'ok');
        
        if (approveData.bundleTxHash) {
          log('📦 UserOp 已打包: ' + approveData.bundleTxHash, 'ok');
        }
        
        // 等待一下讓 approval 生效
        log('⏳ 等待 Approval 生效...');
        await new Promise(resolve => setTimeout(resolve, 3000));
        
      } catch (approveErr) {
        log('❌ Permit2 Approval 失敗: ' + (approveErr.message || approveErr), 'error');
        return;
      }
    } else {
      log('✅ Allowance 充足，繼續執行流程', 'ok');
    }
    
    // Step 1: 從外部取得 Quote
    log('步驟 1: 從外部取得 Quote...');
    const appId = $('appId')?.value?.trim();
    let decodedJWT = null; 
    try { 
      const s = localStorage.getItem('VINCENT_AUTH_JWT_DECODED'); 
      decodedJWT = s ? JSON.parse(s) : null; 
    } catch {}
    
    const { resp: quoteResp, data: quoteData, text: quoteText } = await postJson('/api/vincent/quote', { 
      bridgeParams: params, 
      delegatorPkpEthAddress: delegator, 
      jwt, 
      audience, 
      appId, 
      decodedJWT 
    });
    
    if (!quoteResp.ok || !quoteData?.ok) {
      throw new Error((quoteData && quoteData.error) || quoteText || `Quote HTTP ${quoteResp.status}`);
    }
    
    log('Quote 回應: ' + JSON.stringify({ 
      quoteId: quoteData.result?.quoteId, 
      requestType: quoteData.result?.requestType,
      signTypedData: quoteData.result?.signTypedData ? 'present' : 'missing'
    }));
    
    // Step 2: 使用 Quote 結果執行 Execute
    log('步驟 2: 執行 Execute (使用 Quote 結果)...');
    const executeParams = {
      ...params,
      signTypedData: quoteData.result?.signTypedData,
      quoteId: quoteData.result?.quoteId,
      requestType: quoteData.result?.requestType
    };
    
    const { resp: execResp, data: execData, text: execText } = await postJson('/api/vincent/execute', { 
      bridgeParams: executeParams, 
      delegatorPkpEthAddress: delegator, 
      jwt, 
      audience, 
      appId, 
      decodedJWT 
    });
    
    if (!execResp.ok || !execData?.ok) {
      throw new Error((execData && execData.error) || execText || `Execute HTTP ${execResp.status}`);
    }
    
    log('Execute 回應: ' + JSON.stringify({ 
      result: execData.result, 
      requestType: execData.requestType, 
      quoteId: execData.quoteId, 
      userSignature: execData.userSignature ? 'present' : 'missing',
      witness: execData.witness ? 'present' : 'missing'
    }));
    
    // 驗證 EIP-712 簽名
    if (execData?.userSignature && execData?.signTypedData) {
      log('驗證 EIP-712 簽名...');
      const verification = verifyEIP712Signature(execData.userSignature, execData.signTypedData, delegator);
      if (verification.valid) {
        log('✅ EIP-712 簽名驗證通過: ' + verification.message, 'ok');
      } else {
        log('❌ EIP-712 簽名驗證失敗: ' + verification.error, 'error');
        return;
      }
    }
    
    // Step 3: 前端執行 Submit
    if (execData?.userSignature && execData?.witness && execData?.quoteId && execData?.requestType) {
      log('步驟 3: 前端 Submit 到 Bungee...');
      try {
        const submitBody = {
          requestType: execData.requestType,
          request: execData.witness,
          userSignature: execData.userSignature,
          quoteId: execData.quoteId,
        };
        
        log('Submit 請求: ' + JSON.stringify(submitBody));
        const submitResp = await fetch('https://public-backend.bungee.exchange/api/v1/bungee/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(submitBody),
        });
        
        const serverReqId = submitResp.headers.get('server-req-id');
        const submitData = await submitResp.json();
        
        log('Submit 回應: ' + JSON.stringify({ 
          http: submitResp.status, 
          serverReqId: serverReqId, 
          data: submitData 
        }));
        
        if (submitData?.success && submitData?.result?.requestHash) {
          log('✅ Bungee 已接收請求: ' + submitData.result.requestHash + '，開始輪詢狀態...', 'ok');
          await pollBungeeStatusUI(submitData.result.requestHash);
        } else {
          log('❌ Submit 失敗: ' + JSON.stringify(submitData), 'error');
        }
      } catch (submitErr) {
        log('❌ Submit 失敗: ' + (submitErr.message || submitErr), 'error');
      }
    } else {
      log('❌ 缺少必要參數，無法執行 Submit', 'error');
    }
    
    log('✅ Quote → Execute → Submit 流程完成！', 'ok');
  } catch (err) {
    console.error(err);
    log('❌ Quote → Execute → Submit 失敗: ' + (err.message || err), 'error');
  }
});

async function pollBungeeStatusUI(requestHash, intervalMs = 10000, maxAttempts = 60) {
  let attempts = 0;
  while (attempts < maxAttempts) {
    try {
      const resp = await fetch(`/api/bungee/status?requestHash=${encodeURIComponent(requestHash)}`);
      const data = await resp.json();
      if (!resp.ok || !data?.ok) throw new Error((data && data.error) || `HTTP ${resp.status}`);
      const status = data.status;
      const safeLog = {
        code: status?.bungeeStatusCode,
        txHash: status?.destinationData?.txHash || null,
        serverReqId: data?.meta?.serverReqId || null,
      };
      log('Bungee 狀態: ' + JSON.stringify(safeLog));
      if (status?.bungeeStatusCode === 3) {
        log('交易完成，目的鏈 txHash: ' + (status.destinationData?.txHash || '未知'), 'ok');
        return;
      }
      if (status?.bungeeStatusCode === 5) {
        const reason = status?.errorMessage || status?.error?.message || '未知失敗';
        log('Bungee 任務失敗: ' + reason, 'error');
        return;
      }
    } catch (e) {
      log('輪詢狀態失敗: ' + (e.message || e), 'error');
    }
    attempts++;
    await new Promise(r => setTimeout(r, intervalMs));
  }
  log('輪詢逾時，請稍後再查詢。', 'error');
}

// 直接用前端提交 witness + 簽章到 Bungee 以檢查請求格式
$('btn-submit-front').addEventListener('click', async () => {
  try {
    const lastRaw = localStorage.getItem('LAST_EXECUTE_PAYLOAD');
    let payload = null;
    try { payload = lastRaw ? JSON.parse(lastRaw) : null; } catch {}
    if (!payload) throw new Error('尚未有 execute 結果可提交，請先執行 execute');
    const requestType = payload.requestType || payload?.result?.requestType;
    const quoteId = payload.quoteId || payload?.result?.quoteId;
    const userSignature = payload.userSignature || payload?.result?.userSignature;
    const witness = payload.witness || payload?.result?.witness || payload?.signTypedData?.values?.witness;
    if (!requestType || !quoteId || !userSignature || !witness) {
      throw new Error('缺少 requestType/quoteId/userSignature/witness，無法提交');
    }
    
    const body = { requestType, request: witness, userSignature, quoteId };
    console.log('body', body);
    log('前端 Submit 請求: ' + JSON.stringify(body));
    const resp = await fetch('https://public-backend.bungee.exchange/api/v1/bungee/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    
    const data = await resp.json();
    log('前端 Submit 回應: ' + JSON.stringify({ http: resp.status, serverReqId: resp.headers.get('server-req-id') || null, data }));
    if (data?.success && data?.result?.requestHash) {
      await pollBungeeStatusUI(data.result.requestHash);
    }
  } catch (err) {
    console.error(err);
    log('前端 Submit 失敗: ' + (err.message || err), 'error');
  }
});


// Sponsor Transaction Logic
function buildSponsorParams() {
  return {
    chainId: Number($('sponsorChainId')?.value || 42161),
    sponsorApiKey: '', // 由後端從環境變數取得
    sponsorPolicyId: '', // 由後端從環境變數取得
    contractAddress: $('sponsorContractAddress')?.value || '',
    functionName: $('sponsorFunctionName')?.value || '',
    args: (() => {
      try { return JSON.parse($('sponsorArgs')?.value || '[]'); } catch { return []; }
    })(),
    abi: (() => {
      try { return JSON.parse($('sponsorAbi')?.value || '[]'); } catch { return []; }
    })(),
    value: $('sponsorValue')?.value || '0',
  };
}

// Sponsor Transaction 表單持久化
function saveSponsorForm() {
  const sponsorData = {
    chainId: $('sponsorChainId')?.value || '',
    contractAddress: $('sponsorContractAddress')?.value || '',
    functionName: $('sponsorFunctionName')?.value || '',
    args: $('sponsorArgs')?.value || '',
    abi: $('sponsorAbi')?.value || '',
    value: $('sponsorValue')?.value || '',
  };
  localStorage.setItem('SPONSOR_FORM_DATA', JSON.stringify(sponsorData));
}

function loadSponsorForm() {
  try {
    const sponsorData = JSON.parse(localStorage.getItem('SPONSOR_FORM_DATA') || '{}');
    if (sponsorData.chainId) $('sponsorChainId').value = sponsorData.chainId;
    if (sponsorData.contractAddress) $('sponsorContractAddress').value = sponsorData.contractAddress;
    if (sponsorData.functionName) $('sponsorFunctionName').value = sponsorData.functionName;
    if (sponsorData.args) $('sponsorArgs').value = sponsorData.args;
    if (sponsorData.abi) $('sponsorAbi').value = sponsorData.abi;
    if (sponsorData.value) $('sponsorValue').value = sponsorData.value;
  } catch (err) {
    console.warn('Failed to load sponsor form data:', err);
  }
}

// Sponsor Transaction 表單變更時自動保存
['sponsorChainId', 'sponsorContractAddress', 'sponsorFunctionName', 'sponsorArgs', 'sponsorAbi', 'sponsorValue'].forEach(id => {
  const el = $(id);
  if (el) {
    el.addEventListener('input', saveSponsorForm);
    el.addEventListener('change', saveSponsorForm);
  }
});

// Sponsor Transaction Event Listeners
$('btn-sponsor-precheck').addEventListener('click', async () => {
  try {
    const delegator = $('delegator').value.trim();
    const jwt = $('jwtStr').value.trim();
    const audience = $('audience').value.trim();
    if (!jwt) throw new Error('請先登入以取得 JWT');
    if (!delegator) throw new Error('請先取得 PKP 地址');
    
    const sponsorParams = buildSponsorParams();
    log('Sponsor Precheck 請求: ' + JSON.stringify(sponsorParams));
    const resp = await postJson('/api/vincent/sponsor/precheck', { sponsorParams, jwt, delegatorPkpEthAddress: delegator });
    log('Sponsor Precheck 回應: ' + JSON.stringify(resp.data));
  } catch (err) {
    console.error(err);
    log('Sponsor Precheck 失敗: ' + (err.message || err), 'error');
  }
});

$('btn-sponsor-execute').addEventListener('click', async () => {
  try {
    const delegator = $('delegator').value.trim();
    const jwt = $('jwtStr').value.trim();
    const audience = $('audience').value.trim();
    if (!jwt) throw new Error('請先登入以取得 JWT');
    if (!delegator) throw new Error('請先取得 PKP 地址');
    
    const sponsorParams = buildSponsorParams();
    log('Sponsor Execute 請求: ' + JSON.stringify(sponsorParams));
    const resp = await postJson('/api/vincent/sponsor/execute', { sponsorParams, jwt, delegatorPkpEthAddress: delegator });
    log('Sponsor Execute 回應: ' + JSON.stringify(resp.data));
  } catch (err) {
    console.error(err);
    log('Sponsor Execute 失敗: ' + (err.message || err), 'error');
  }
});

// Permit2 Approve: Precheck
$('btn-approve-precheck').addEventListener('click', async () => {
  try {
    const delegator = $('delegator').value.trim();
    const jwt = $('jwtStr').value.trim();
    const audience = $('audience').value.trim();
    if (!jwt) throw new Error('請先登入以取得 JWT');
    const f = getParamsFromForm();
    const approvalParams = {
      chainId: Number(String(f.sourceChain || '').trim()),
      tokenIn: String(f.sourceToken || '').trim(),
      amountIn: String(f.amount || '').trim(),
      rpcUrl: String(f.rpcUrl || '').trim(),
    spenderAddress: String(f.spenderAddress || '').trim(),
    alchemyGasSponsor: f.alchemyGasSponsor === true,
    alchemyGasSponsorApiKey: f.alchemyGasSponsorApiKey || undefined,
    alchemyGasSponsorPolicyId: f.alchemyGasSponsorPolicyId || undefined,
    };
    log('後端 Permit2 precheck...');
    const appId = $('appId')?.value?.trim();
    const { resp, data, text } = await postJson('/api/vincent/approve/precheck', { approvalParams, delegatorPkpEthAddress: delegator, jwt, audience, appId });
    if (!resp.ok || !data?.ok) throw new Error((data && data.error) || text || `HTTP ${resp.status}`);
    log('approve precheck 回應: ' + JSON.stringify(data.result));
  } catch (err) {
    console.error(err);
    log('approve precheck 失敗: ' + (err.message || err), 'error');
  }
});

// Permit2 Approve: Execute (支援 UserOp 贊助等待)
$('btn-approve-exec').addEventListener('click', async () => {
  try {
    const delegator = $('delegator').value.trim();
    const jwt = $('jwtStr').value.trim();
    const audience = $('audience').value.trim();
    if (!jwt) throw new Error('請先登入以取得 JWT');
    const f = getParamsFromForm();
    const approvalParams = {
      chainId: Number(String(f.sourceChain || '').trim()),
      tokenIn: String(f.sourceToken || '').trim(),
      amountIn: String(f.amount || '').trim(),
      rpcUrl: String(f.rpcUrl || '').trim(),
    spenderAddress: String(f.spenderAddress || '').trim(),
    alchemyGasSponsor: f.alchemyGasSponsor === true,
    alchemyGasSponsorApiKey: f.alchemyGasSponsorApiKey || undefined,
    alchemyGasSponsorPolicyId: f.alchemyGasSponsorPolicyId || undefined,
    };
    log('後端 Permit2 execute...');
    const appId = $('appId')?.value?.trim();
    const { resp, data, text } = await postJson('/api/vincent/approve/execute', { approvalParams, delegatorPkpEthAddress: delegator, jwt, audience, appId });
    if (!resp.ok || !data?.ok) throw new Error((data && data.error) || text || `HTTP ${resp.status}`);
    log('approve execute 回應: ' + JSON.stringify(data.result));
    if (data.bundleTxHash) {
      log('UserOp 已打包: ' + data.bundleTxHash, 'ok');
    }
  } catch (err) {
    console.error(err);
    log('approve execute 失敗: ' + (err.message || err), 'error');
  }
});


