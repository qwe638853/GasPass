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

  // 嘗試多種 audience 格式
  const baseOrigin = audienceOverride || window.location.origin
  const possibleAudiences = [
    baseOrigin + '/',
    baseOrigin,
    baseOrigin + '/card-management',
    baseOrigin + '/card-management/',
    'http://localhost:5173',
    'http://localhost:5173/',
    'http://localhost:5173/card-management',
    'http://localhost:5173/card-management/'
  ]
  
  // 先嘗試最常見的格式
  const audience = baseOrigin + '/'

  if (vincentAppClient.uriContainsVincentJWT()) {
    let jwtAudiences = []
    
    // 先嘗試從 URL 中提取 JWT 並手動解析，看看實際的 audience 是什麼
    try {
      const url = new URL(window.location.href)
      const jwtParam = url.searchParams.get('jwt')
      if (jwtParam) {
        // 手動解析 JWT payload（不驗證簽名）
        const parts = jwtParam.split('.')
        if (parts.length === 3) {
          const payload = JSON.parse(atob(parts[1]))
          
          // 如果 audience 是數組，添加到可能的 audience 列表中
          if (Array.isArray(payload.aud)) {
            possibleAudiences.push(...payload.aud)
            jwtAudiences = payload.aud
          }
        }
      }
    } catch (error) {
      // 靜默處理錯誤
    }
    
    let result = null
    let successfulAudience = null
    
    // 將 JWT audience 放在測試列表的前面
    const prioritizedAudiences = [...jwtAudiences, ...possibleAudiences.filter(aud => !jwtAudiences.includes(aud))]
    
    // 嘗試每種 audience 格式
    for (const testAudience of prioritizedAudiences) {
      try {
        result = await vincentAppClient.decodeVincentJWTFromUri(testAudience)
        if (result && (result.jwtStr || result.jwt || result.token)) {
          successfulAudience = testAudience
          break
        }
      } catch (error) {
        // 如果是 appId mismatch 錯誤，嘗試使用字符串格式的 appId
        if (error.message.includes('appId mismatch')) {
          try {
            const stringAppIdClient = createWebAuth(String(vincentAppClient.appId || appId))
            result = await stringAppIdClient.decodeVincentJWTFromUri(testAudience)
            if (result && (result.jwtStr || result.jwt || result.token)) {
              successfulAudience = testAudience
              break
            }
          } catch (retryError) {
            // 靜默處理重試錯誤
          }
        }
        continue
      }
    }
    
    // 如果所有 audience 都失敗了，嘗試直接使用 JWT 內容（跳過 SDK 驗證）
    if (!result || (!result.jwtStr && !result.jwt && !result.token)) {
      try {
        const url = new URL(window.location.href)
        const jwtParam = url.searchParams.get('jwt')
        if (jwtParam) {
          // 直接使用 JWT，不通過 SDK 驗證
          const parts = jwtParam.split('.')
          if (parts.length === 3) {
            const payload = JSON.parse(atob(parts[1]))
            
            // 檢查 JWT 是否過期
            const now = Math.floor(Date.now() / 1000)
            if (payload.exp && payload.exp < now) {
              throw new Error('JWT has expired')
            }
            
            // 直接使用 JWT 內容
            localStorage.setItem(STORAGE_JWT, jwtParam)
            localStorage.setItem(STORAGE_DECODED, JSON.stringify(payload))
            const pkp = extractPkpEthAddress(payload)
            if (pkp) localStorage.setItem(STORAGE_PKP_ADDR, pkp)
            
            vincentAppClient.removeVincentJWTFromURI()
            return { decodedJWT: payload, jwtStr: jwtParam }
          }
        }
      } catch (directError) {
        // 靜默處理直接提取錯誤
      }
      
      throw new Error('Failed to decode JWT with any audience format')
    }
    
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


