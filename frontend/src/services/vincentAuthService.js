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

export function clearStoredVincentAuth(clearPkpAddress = false) {
  localStorage.removeItem(STORAGE_JWT)
  localStorage.removeItem(STORAGE_DECODED)
  if (clearPkpAddress) {
    localStorage.removeItem(STORAGE_PKP_ADDR)
    console.log('🗑️ 清除 PKP 地址')
  } else {
    console.log('💾 保留 PKP 地址（因為它不會過期）')
  }
}

function extractPkpEthAddress(decodedJWT) {
  // 參考 testScript 的邏輯：優先使用 payload.pkpInfo.ethAddress，回退到 pkp.ethAddress
  const result = decodedJWT?.payload?.pkpInfo?.ethAddress ?? decodedJWT?.pkp?.ethAddress ?? null
  
  console.log('🔍 extractPkpEthAddress 調試:', {
    decodedJWT: decodedJWT,
    payload: decodedJWT?.payload,
    pkpInfo: decodedJWT?.payload?.pkpInfo,
    pkp: decodedJWT?.pkp,
    pkpInfoEthAddress: decodedJWT?.payload?.pkpInfo?.ethAddress,
    pkpEthAddress: decodedJWT?.pkp?.ethAddress,
    result
  })
  
  return result
}

export function getStoredPkpEthAddress() {
  // 立即檢查 localStorage 狀態
  const allKeys = Object.keys(localStorage)
  const vincentKeys = allKeys.filter(key => key.includes('VINCENT'))
  const pkpKeys = allKeys.filter(key => key.includes('PKP'))
  
  console.log('🔍 getStoredPkpEthAddress 立即檢查:', {
    storageKey: STORAGE_PKP_ADDR,
    localStorageSize: localStorage.length,
    allKeys: allKeys,
    vincentKeys: vincentKeys,
    pkpKeys: pkpKeys
  })
  
  // 嘗試讀取 PKP 地址
  const pkp = localStorage.getItem(STORAGE_PKP_ADDR)
  
  console.log('🔍 getStoredPkpEthAddress 讀取結果:', {
    storageKey: STORAGE_PKP_ADDR,
    rawValue: pkp,
    isNull: pkp === null,
    isEmpty: pkp === '',
    type: typeof pkp,
    length: pkp ? pkp.length : 0
  })
  
  // 檢查是否有其他可能的 PKP 地址存儲
  for (const key of allKeys) {
    if (key.toLowerCase().includes('pkp') || key.toLowerCase().includes('address')) {
      const value = localStorage.getItem(key)
      console.log(`🔍 發現可能的 PKP 相關鍵: ${key} = ${value}`)
    }
  }
  
  // 如果讀取失敗，嘗試從 JWT 重新提取
  if (!pkp) {
    console.log('⚠️ PKP 地址為空，嘗試從 JWT 重新提取...')
    const extracted = extractAndSetPkpFromJWT()
    if (extracted) {
      console.log('✅ 從 JWT 重新提取 PKP 地址成功:', extracted)
      return extracted
    }
  }
  
  // 處理 pkp 可能是 JSON 對象的情況
  let result = pkp
  if (result && typeof result === 'string') {
    try {
      const parsed = JSON.parse(result)
      // 如果是對象，嘗試提取地址
      if (typeof parsed === 'object') {
        result = parsed.ethAddress || parsed.address || parsed.value || result
        console.log('🔍 解析 PKP 對象結果:', result)
      }
    } catch (e) {
      // 不是 JSON，直接使用字串值
      result = pkp
    }
  }
  
  // 如果還是沒有找到，嘗試從其他 localStorage key 查找
  if (!result) {
    for (const key of allKeys) {
      const value = localStorage.getItem(key)
      // 檢查是否是有效的以太坊地址格式
      if (value && /^0x[a-fA-F0-9]{40}$/.test(value)) {
        // 排除已知的其他地址類型
        if (key.includes('WALLET') || key.includes('PKP') || key.includes('VINCENT')) {
          console.log(`🔍 從 ${key} 找到可能的 PKP 地址: ${value}`)
          // 暫時使用找到的地址（但這可能不是 PKP 地址）
          // result = value
          // break
        }
      }
    }
  }
  
  return result || null
}

// 參考 testScript 的簡潔實現
export async function bootstrapAuthFlow(vincentAppClient, audienceOverride) {
  const safeIsExpired = (jwtStr) => {
    try {
      return isExpired(jwtStr)
    } catch (_) {
      return true
    }
  }

  // 參考 testScript 的邏輯：使用 audience + '/'
  const audience = (audienceOverride || window.location.origin) + '/'
  console.log('🔍 bootstrapAuthFlow 調試:', {
    audienceOverride,
    windowOrigin: window.location.origin,
    finalAudience: audience,
    uriContainsVincentJWT: vincentAppClient.uriContainsVincentJWT()
  })

  if (vincentAppClient.uriContainsVincentJWT()) {
    // 參考 testScript 的簡潔邏輯
    let result
    try {
      result = await vincentAppClient.decodeVincentJWTFromUri(audience)
      console.log('🔍 decodeVincentJWTFromUri 結果:', result)
    } catch (e) {
      console.warn('decodeVincentJWTFromUri 失敗:', e.message)
      throw e
    }
    
    const jwtStr = result?.jwtStr ?? result?.jwt ?? result?.token ?? null
    const decodedJWT = result?.decodedJWT ?? result?.decoded ?? null
    
    console.log('🔍 JWT 解析結果:', { jwtStr: !!jwtStr, decodedJWT: !!decodedJWT })
    
    if (jwtStr) localStorage.setItem(STORAGE_JWT, jwtStr)
    if (decodedJWT) {
      localStorage.setItem(STORAGE_DECODED, JSON.stringify(decodedJWT))
      const pkp = extractPkpEthAddress(decodedJWT)
      if (pkp) {
        console.log('💾 存儲 PKP 地址到 localStorage (SDK 結果):', { pkp, key: STORAGE_PKP_ADDR })
        localStorage.setItem(STORAGE_PKP_ADDR, pkp)
      } else {
        console.log('⚠️ 無法從 SDK 結果提取 PKP 地址，跳過存儲')
      }
    }
    
    vincentAppClient.removeVincentJWTFromURI()
    return { decodedJWT, jwtStr }
  } else {
    // 參考 testScript 的邏輯：從 localStorage 讀取
    const storedJwt = localStorage.getItem(STORAGE_JWT)
    const expired = storedJwt ? safeIsExpired(storedJwt) : true
    if (!storedJwt || expired) {
      // 清除壞資料避免下次還是讀到錯誤狀態
      // 但保留 PKP 地址，因為它不會過期
      //localStorage.removeItem(STORAGE_JWT)
      //localStorage.removeItem(STORAGE_DECODED)
      // 不刪除 PKP 地址：localStorage.removeItem(STORAGE_PKP_ADDR)
      console.log('⚠️ JWT 過期，清除 JWT 但保留 PKP 地址')
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
      console.log('🔍 檢查現有 PKP 地址:', { existing, hasDecodedJWT: !!decodedJWT })
      if (!existing && decodedJWT) {
        const pkp = extractPkpEthAddress(decodedJWT)
        if (pkp) {
          console.log('💾 補充存儲 PKP 地址到 localStorage:', { pkp, key: STORAGE_PKP_ADDR })
          localStorage.setItem(STORAGE_PKP_ADDR, pkp)
        } else {
          console.log('⚠️ 無法從現有 JWT 提取 PKP 地址')
        }
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
      if (pkp) {
        console.log('💾 確保成功狀態時存儲 PKP 地址:', { pkp, key: STORAGE_PKP_ADDR })
        localStorage.setItem(STORAGE_PKP_ADDR, pkp)
      } else {
        console.log('⚠️ 無法從成功狀態的 JWT 提取 PKP 地址')
      }
    }
  } catch (error) {
    console.error('❌ 存儲 PKP 地址時發生錯誤:', error)
  }
  return { redirected: false, client, ...state }
}

export function getPkpEthAddress(decodedJWT) {
  const d = decodedJWT || getStoredVincentAuth().decodedJWT
  const fromDecoded = extractPkpEthAddress(d)
  const fromStorage = getStoredPkpEthAddress()
  
  console.log('🔍 getPkpEthAddress 調試:', {
    hasDecodedJWT: !!decodedJWT,
    hasStoredJWT: !!d,
    fromDecoded,
    fromStorage,
    finalResult: fromDecoded || fromStorage
  })
  
  if (fromDecoded) return fromDecoded
  return fromStorage
}

// 手動設置 PKP 地址的函數
export function setPkpEthAddress(pkpAddress) {
  if (!pkpAddress) {
    console.warn('⚠️ PKP 地址為空，無法設置')
    return false
  }
  
  try {
    localStorage.setItem(STORAGE_PKP_ADDR, pkpAddress)
    console.log('✅ 手動設置 PKP 地址成功:', { pkpAddress, key: STORAGE_PKP_ADDR })
    return true
  } catch (error) {
    console.error('❌ 設置 PKP 地址失敗:', error)
    return false
  }
}

// 從 JWT 手動提取並設置 PKP 地址
export function extractAndSetPkpFromJWT() {
  try {
    const decoded = localStorage.getItem(STORAGE_DECODED)
    if (!decoded) {
      console.warn('⚠️ 沒有找到 decoded JWT')
      return null
    }
    
    const parsed = JSON.parse(decoded)
    const pkpAddress = extractPkpEthAddress(parsed)
    
    if (pkpAddress) {
      setPkpEthAddress(pkpAddress)
      console.log('✅ 從 JWT 提取並設置 PKP 地址成功:', pkpAddress)
      return pkpAddress
    } else {
      console.warn('⚠️ 無法從 JWT 提取 PKP 地址')
      return null
    }
  } catch (error) {
    console.error('❌ 從 JWT 提取 PKP 地址時發生錯誤:', error)
    return null
  }
}

// 檢查 PKP 地址是否仍然有效
export function validatePkpAddress() {
  const storedPkp = localStorage.getItem(STORAGE_PKP_ADDR)
  const jwt = localStorage.getItem(STORAGE_JWT)
  const decoded = localStorage.getItem(STORAGE_DECODED)
  
  console.log('🔍 PKP 地址驗證:', {
    hasStoredPkp: !!storedPkp,
    hasJwt: !!jwt,
    hasDecoded: !!decoded,
    storedPkp: storedPkp
  })
  
  // 如果沒有存儲的 PKP 地址，嘗試從 JWT 提取
  if (!storedPkp && decoded) {
    console.log('⚠️ 沒有存儲的 PKP 地址，嘗試從 JWT 提取...')
    return extractAndSetPkpFromJWT()
  }
  
  return storedPkp
}

// 調試函數：檢查所有 localStorage 中的 Vincent 相關數據
export function debugVincentStorage() {
  console.log('🔍 Vincent Storage 調試報告:')
  console.log('所有 localStorage 鍵:', Object.keys(localStorage))
  console.log('Vincent 相關鍵:', Object.keys(localStorage).filter(key => key.includes('VINCENT')))
  console.log('PKP 地址鍵:', STORAGE_PKP_ADDR)
  console.log('PKP 地址值:', localStorage.getItem(STORAGE_PKP_ADDR))
  console.log('JWT 值:', localStorage.getItem(STORAGE_JWT))
  console.log('Decoded JWT 值:', localStorage.getItem(STORAGE_DECODED))
  
  // 嘗試解析 decoded JWT
  try {
    const decoded = localStorage.getItem(STORAGE_DECODED)
    if (decoded) {
      const parsed = JSON.parse(decoded)
      console.log('解析後的 JWT payload:', parsed)
      console.log('從 JWT 提取的 PKP 地址:', extractPkpEthAddress(parsed))
      
      // 嘗試自動提取並設置 PKP 地址
      const extractedPkp = extractAndSetPkpFromJWT()
      if (extractedPkp) {
        console.log('✅ 自動提取並設置 PKP 地址成功:', extractedPkp)
      }
    }
  } catch (error) {
    console.error('解析 JWT 時發生錯誤:', error)
  }
}

