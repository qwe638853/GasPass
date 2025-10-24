// 在 Quote → Execute → Submit 流程中添加日誌記錄的示例

// 1. Quote 階段
const { resp: quoteResp, data: quoteData, text: quoteText } = await postJson('/api/vincent/quote', { 
  bridgeParams: params, 
  delegatorPkpEthAddress: delegator, 
  jwt, 
  audience, 
  appId, 
  decodedJWT 
});

// 記錄 Quote API 調用
logApiCall(
  { bridgeParams: params, delegatorPkpEthAddress: delegator, jwt, audience, appId, decodedJWT },
  quoteData,
  'quote'
);

if (!quoteResp.ok || !quoteData?.ok) {
  throw new Error((quoteData && quoteData.error) || quoteText || `Quote HTTP ${quoteResp.status}`);
}

// 記錄 Quote 數據
logQuote({
  quoteId: quoteData.result?.quoteId,
  requestType: quoteData.result?.requestType,
  signTypedData: quoteData.result?.signTypedData,
  fullResponse: quoteData
});

// 2. Execute 階段
const { resp: execResp, data: execData, text: execText } = await postJson('/api/vincent/execute', { 
  bridgeParams: executeParams, 
  delegatorPkpEthAddress: delegator, 
  jwt, 
  audience, 
  appId, 
  decodedJWT 
});

// 記錄 Execute API 調用
logApiCall(
  { bridgeParams: executeParams, delegatorPkpEthAddress: delegator, jwt, audience, appId, decodedJWT },
  execData,
  'execute'
);

if (!execResp.ok || !execData?.ok) {
  throw new Error((execData && execData.error) || execText || `Execute HTTP ${execResp.status}`);
}

// 記錄 Execute 數據
logExecute({
  result: execData.result,
  requestType: execData.requestType,
  quoteId: execData.quoteId,
  userSignature: execData.userSignature,
  witness: execData.witness,
  signTypedData: execData.signTypedData,
  fullResponse: execData
});

// 3. 簽名驗證階段
if (execData?.userSignature && execData?.signTypedData) {
  const verification = verifyEIP712Signature(execData.userSignature, execData.signTypedData, delegator);
  
  // 記錄簽名數據
  logSignature({
    signature: execData.userSignature,
    signTypedData: execData.signTypedData,
    verification: verification,
    recoveredSigner: verification.details?.recoveredSigner,
    expectedSigner: verification.details?.expectedSigner,
    signerMatches: verification.details?.signerMatches
  });
}

// 4. Submit 階段
const submitBody = {
  requestType: execData.requestType,
  request: execData.witness,
  userSignature: execData.userSignature,
  quoteId: execData.quoteId,
};

const submitResp = await fetch('https://public-backend.bungee.exchange/api/v1/bungee/submit', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(submitBody),
});

const submitData = await submitResp.json();

// 記錄 Submit API 調用
logApiCall(
  submitBody,
  submitData,
  'submit'
);

// 記錄 Submit 數據
logSubmit({
  requestBody: submitBody,
  response: submitData,
  requestHash: submitData?.result?.requestHash,
  serverReqId: submitResp.headers.get('server-req-id')
});

// 5. 狀態輪詢階段
if (submitData?.success && submitData?.result?.requestHash) {
  await pollBungeeStatusUI(submitData.result.requestHash);
}

// 在 pollBungeeStatusUI 函數中添加狀態記錄
async function pollBungeeStatusUI(requestHash, intervalMs = 10000, maxAttempts = 60) {
  let attempts = 0;
  while (attempts < maxAttempts) {
    try {
      const resp = await fetch(`/api/bungee/status?requestHash=${encodeURIComponent(requestHash)}`);
      const data = await resp.json();
      
      // 記錄狀態 API 調用
      logApiCall(
        { requestHash },
        data,
        'status'
      );
      
      // 記錄狀態數據
      logStatus({
        requestHash,
        attempt: attempts + 1,
        bungeeStatusCode: data.status?.bungeeStatusCode,
        txHash: data.status?.destinationData?.txHash,
        serverReqId: data?.meta?.serverReqId,
        fullResponse: data
      });
      
      if (!resp.ok || !data?.ok) throw new Error((data && data.error) || `HTTP ${resp.status}`);
      const status = data.status;
      
      if (status?.bungeeStatusCode === 3) {
        log('交易完成，目的鏈 txHash: ' + (status.destinationData?.txHash || '未知'), 'ok');
        return;
      }
      if (status?.bungeeStatusCode === 5) {
        const reason = status?.errorMessage || status?.error?.message || '未知失敗';
        log('Bungee 任務失敗: ' + reason, 'error');
        log('詳細錯誤信息: ' + JSON.stringify(status, null, 2), 'error');
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

// 6. 測試總結
function logTestRunSummary() {
  const summary = {
    testType: 'Quote → Execute → Submit',
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
    url: window.location.href,
    localStorageKeys: Object.keys(localStorage).filter(key => key.startsWith('TESTSCRIPT_LOG_')),
    totalLogs: getAllLogs().length
  };
  
  logTestSummary(summary);
}
