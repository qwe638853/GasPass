import { getWebAuthClient } from '@lit-protocol/vincent-app-sdk/webAuthClient'
import { isExpired } from '@lit-protocol/vincent-app-sdk/jwt'

const STORAGE_JWT = 'VINCENT_AUTH_JWT'
const STORAGE_DECODED = 'VINCENT_AUTH_JWT_DECODED'
const STORAGE_PKP_ADDR = 'VINCENT_PKP_ETH_ADDRESS'

export function createWebAuth(appId) {
  if (!appId) throw new Error('缺少 Vincent App ID')
  return getWebAuthClient({ appId })
}

export function getStoredVincentAuth() {
  const jwtStr = localStorage.getItem(STORAGE_JWT) || null
  let decodedJWT = null
  try {
    const s = localStorage.getItem(STORAGE_DECODED)
    decodedJWT = s ? JSON.parse(s) : null
  } catch (_) {
    decodedJWT = null
  }
  return { jwtStr, decodedJWT }
}

export function clearStoredVincentAuth() {
  localStorage.removeItem(STORAGE_JWT)
  localStorage.removeItem(STORAGE_DECODED)
  localStorage.removeItem(STORAGE_PKP_ADDR)
}

function extractPkpEthAddress(decodedJWT) {
  return decodedJWT?.payload?.pkpInfo?.ethAddress ?? decodedJWT?.pkp?.ethAddress ?? null
}

export function getStoredPkpEthAddress() {
  return localStorage.getItem(STORAGE_PKP_ADDR) || null
}

export async function bootstrapAuthFlow(vincentAppClient, audienceOverride) {
  const safeIsExpired = (jwtStr) => {
    try {
      return isExpired(jwtStr)
    } catch (_) {
      return true
    }
  }

  const audience = (audienceOverride || window.location.origin) + '/'

  if (vincentAppClient.uriContainsVincentJWT()) {
    const result = await vincentAppClient.decodeVincentJWTFromUri(audience)
    const jwtStr = result?.jwtStr ?? result?.jwt ?? result?.token ?? null
    const decodedJWT = result?.decodedJWT ?? result?.decoded ?? null
    if (jwtStr) localStorage.setItem(STORAGE_JWT, jwtStr)
    if (decodedJWT) {
      localStorage.setItem(STORAGE_DECODED, JSON.stringify(decodedJWT))
      const pkp = extractPkpEthAddress(decodedJWT)
      if (pkp) localStorage.setItem(STORAGE_PKP_ADDR, pkp)
    }
    vincentAppClient.removeVincentJWTFromURI()
    return { decodedJWT, jwtStr }
  } else {
    const storedJwt = localStorage.getItem(STORAGE_JWT)
    const expired = storedJwt ? safeIsExpired(storedJwt) : true
    if (!storedJwt || expired) {
      clearStoredVincentAuth()
      return { needsRedirect: true }
    }
    let decodedJWT = null
    try {
      const decoded = localStorage.getItem(STORAGE_DECODED)
      decodedJWT = decoded ? JSON.parse(decoded) : null
    } catch (_) {
      decodedJWT = null
    }
    // 確保 PKP 地址存在於儲存中
    try {
      const existing = localStorage.getItem(STORAGE_PKP_ADDR)
      if (!existing && decodedJWT) {
        const pkp = extractPkpEthAddress(decodedJWT)
        if (pkp) localStorage.setItem(STORAGE_PKP_ADDR, pkp)
      }
    } catch {}
    return { decodedJWT, jwtStr: storedJwt }
  }
}

export async function ensureVincentAuth(appId, audienceOverride, options = {}) {
  const { allowRedirect = true } = options
  let client = createWebAuth(appId)
  let state
  try {
    state = await bootstrapAuthFlow(client, audienceOverride)
  } catch (e) {
    if (String(e?.message || '').includes('appId mismatch')) {
      client = createWebAuth(Number(appId))
      state = await bootstrapAuthFlow(client, audienceOverride)
    } else {
      throw e
    }
  }
  if (state?.needsRedirect) {
    if (allowRedirect) {
      client.redirectToConnectPage({ redirectUri: window.location.href })
      return { redirected: true }
    }
    return { redirected: false, needsRedirect: true }
  }
  // 確保成功狀態時把 PKP 地址也存下
  try {
    if (state?.decodedJWT) {
      const pkp = extractPkpEthAddress(state.decodedJWT)
      if (pkp) localStorage.setItem(STORAGE_PKP_ADDR, pkp)
    }
  } catch {}
  return { redirected: false, client, ...state }
}

export function getPkpEthAddress(decodedJWT) {
  const d = decodedJWT || getStoredVincentAuth().decodedJWT
  const fromDecoded = extractPkpEthAddress(d)
  if (fromDecoded) return fromDecoded
  return getStoredPkpEthAddress()
}


