import { getWebAuthClient } from '@lit-protocol/vincent-app-sdk/webAuthClient';
import { isExpired } from '@lit-protocol/vincent-app-sdk/jwt';

export function createWebAuth(appId) {
  if (!appId) throw new Error('缺少 Vincent App ID');
  const client = getWebAuthClient({ appId });
  return client;
}

export async function bootstrapAuthFlow(vincentAppClient, audienceOverride) {
  const safeIsExpired = (jwtStr) => {
    try {
      return isExpired(jwtStr);
    } catch (_) {
      return true; // 無法判斷時視為已過期，強迫重新導轉
    }
  };
  console.log('audienceOverride', audienceOverride);
  console.log('window.location.origin', window.location.origin);
  const audience = (audienceOverride || window.location.origin) + '/';
  console.log('uriContainsVincentJWT', vincentAppClient.uriContainsVincentJWT());
  if (vincentAppClient.uriContainsVincentJWT()) {
    let result;
    result = await vincentAppClient.decodeVincentJWTFromUri(audience);
    console.log('decodeVincentJWTFromUri result', result);
    const jwtStr = result?.jwtStr ?? result?.jwt ?? result?.token ?? null;
    const decodedJWT = result?.decodedJWT ?? result?.decoded ?? null;
    console.log('decodedJWT', jwtStr);
    console.log('decodedJWT decdoded', decodedJWT);
    if (jwtStr) localStorage.setItem('VINCENT_AUTH_JWT', jwtStr);
    if (decodedJWT) localStorage.setItem('VINCENT_AUTH_JWT_DECODED', JSON.stringify(decodedJWT));
    vincentAppClient.removeVincentJWTFromURI();
    return { decodedJWT, jwtStr };
  } else {
    const storedJwt = localStorage.getItem('VINCENT_AUTH_JWT');
    const expired = storedJwt ? safeIsExpired(storedJwt) : true;
    if (!storedJwt || expired) {
      // 清除壞資料避免下次還是讀到錯誤狀態
      localStorage.removeItem('VINCENT_AUTH_JWT');
      localStorage.removeItem('VINCENT_AUTH_JWT_DECODED');
      return { needsRedirect: true };
    }
    let decodedJWT = null;
    try {
      const decoded = localStorage.getItem('VINCENT_AUTH_JWT_DECODED');
      decodedJWT = decoded ? JSON.parse(decoded) : null;
    } catch (_) {
      decodedJWT = null;
    }
    return { decodedJWT, jwtStr: storedJwt };
  }
}


