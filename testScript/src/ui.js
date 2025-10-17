import { VincentBridgeClient } from './logic/vincentClient.js';
import { createWebAuth, bootstrapAuthFlow } from './auth.js';

const $ = (id) => document.getElementById(id);
const logEl = $('log');

function log(message, type = 'info') {
  const time = new Date().toLocaleTimeString();
  const line = document.createElement('div');
  line.className = type === 'error' ? 'err' : type === 'ok' ? 'ok' : '';
  line.textContent = `[${time}] ${message}`;
  logEl.prepend(line);
}

function getParamsFromForm() {
  return {
    operation: $('op').value,
    rpcUrl: $('rpcUrl').value,
    sourceChain: $('sourceChain').value,
    destinationChain: $('destinationChain').value,
    sourceToken: $('sourceToken').value,
    destinationToken: $('destinationToken').value,
    amount: $('amount').value,
    slippageBps: $('slippageBps').value,
  };
}

const client = new VincentBridgeClient();

// 安全發送與解析（避免 Unexpected end of JSON input）
async function postJson(path, payload) {
  const resp = await fetch(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
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

// 表單狀態持久化與還原
const formKeys = ['rpcUrl','op','sourceChain','destinationChain','sourceToken','destinationToken','amount','slippageBps','appId','jwtStr','audience'];
function saveForm() {
  try {
    const state = {};
    for (const k of formKeys) state[k] = ($(k)?.value ?? '');
    localStorage.setItem('FORM_STATE', JSON.stringify(state));
  } catch {}
}
function loadForm() {
  try {
    const raw = localStorage.getItem('FORM_STATE');
    if (!raw) return;
    const state = JSON.parse(raw);
    for (const k of formKeys) if ($(k) && state[k] != null) $(k).value = state[k];
  } catch {}
}
loadForm();
window.addEventListener('beforeunload', saveForm);
formKeys.forEach(id => { const el = $(id); if (el) el.addEventListener('input', saveForm); });

// Audience 預設使用目前 origin（僅在欄位為空時）
if ($('audience') && !$('audience').value) {
  $('audience').value = window.location.origin;
}
$('btn-login-vincent').addEventListener('click', async () => {
  try {
    const appId = $('appId').value.trim();
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
    const appId = $('appId')?.value?.trim();
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
        if (pkpAddr) $('delegator').value = pkpAddr;
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
    if (!delegator && (!jwt || !audience)) throw new Error('缺少 Delegator 或 JWT+Audience');
    const params = client.buildBridgeParams(getParamsFromForm());
    log('執行後端 precheck...');
    const appId = $('appId')?.value?.trim();
    let decodedJWT = null; try { const s = localStorage.getItem('VINCENT_AUTH_JWT_DECODED'); decodedJWT = s ? JSON.parse(s) : null; } catch {}
    const { resp, data, text } = await postJson('/api/vincent/precheck', { bridgeParams: params, delegatorPkpEthAddress: delegator, rpcUrl: params.rpcUrl, jwt, audience, appId, decodedJWT });
    if (!resp.ok || !data?.ok) throw new Error((data && data.error) || text || `HTTP ${resp.status}`);
    log('precheck 回應: ' + JSON.stringify(data.result));
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
    if (!delegator && (!jwt || !audience)) throw new Error('缺少 Delegator 或 JWT+Audience');
    const params = client.buildBridgeParams(getParamsFromForm());
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
    if (!delegator && (!jwt || !audience)) throw new Error('缺少 Delegator 或 JWT+Audience');
    const params = client.buildBridgeParams(getParamsFromForm());
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


