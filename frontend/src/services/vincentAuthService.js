import { getWebAuthClient } from '@lit-protocol/vincent-app-sdk/webAuthClient'
import { isExpired } from '@lit-protocol/vincent-app-sdk/jwt'

const STORAGE_JWT = 'VINCENT_AUTH_JWT'
const STORAGE_DECODED = 'VINCENT_AUTH_JWT_DECODED'
const STORAGE_PKP_ADDR = 'VINCENT_PKP_ETH_ADDRESS'

export function createWebAuth(appId) {
  if (!appId) throw new Error('Missing Vincent App ID')
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
    console.log('🗑️ Cleared PKP address')
  } else {
    console.log('💾 Kept PKP address (as it never expires)')
  }
}

function extractPkpEthAddress(decodedJWT) {
  // Reference testScript logic: prefer payload.pkpInfo.ethAddress, fallback to pkp.ethAddress
  const result = decodedJWT?.payload?.pkpInfo?.ethAddress ?? decodedJWT?.pkp?.ethAddress ?? null
  
  console.log('🔍 extractPkpEthAddress debug:', {
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
  // Check localStorage state immediately
  const allKeys = Object.keys(localStorage)
  const vincentKeys = allKeys.filter(key => key.includes('VINCENT'))
  const pkpKeys = allKeys.filter(key => key.includes('PKP'))
  
  console.log('🔍 getStoredPkpEthAddress immediate check:', {
    storageKey: STORAGE_PKP_ADDR,
    localStorageSize: localStorage.length,
    allKeys: allKeys,
    vincentKeys: vincentKeys,
    pkpKeys: pkpKeys
  })
  
  // Try to read PKP address
  const pkp = localStorage.getItem(STORAGE_PKP_ADDR)
  
  console.log('🔍 getStoredPkpEthAddress read result:', {
    storageKey: STORAGE_PKP_ADDR,
    rawValue: pkp,
    isNull: pkp === null,
    isEmpty: pkp === '',
    type: typeof pkp,
    length: pkp ? pkp.length : 0
  })
  
  // Check if there are other possible PKP address storage
  for (const key of allKeys) {
    if (key.toLowerCase().includes('pkp') || key.toLowerCase().includes('address')) {
      const value = localStorage.getItem(key)
      console.log(`🔍 Found possible PKP related key: ${key} = ${value}`)
    }
  }
  
  // If read fails, try to re-extract from JWT
  if (!pkp) {
    console.log('⚠️ PKP address is empty, trying to re-extract from JWT...')
    const extracted = extractAndSetPkpFromJWT()
    if (extracted) {
      console.log('✅ Successfully re-extracted PKP address from JWT:', extracted)
      return extracted
    }
  }
  
  // Handle case where pkp might be a JSON object
  let result = pkp
  if (result && typeof result === 'string') {
    try {
      const parsed = JSON.parse(result)
      // If it's an object, try to extract the address
      if (typeof parsed === 'object') {
        result = parsed.ethAddress || parsed.address || parsed.value || result
        console.log('🔍 Parsed PKP object result:', result)
      }
    } catch (e) {
      // Not JSON, use string value directly
      result = pkp
    }
  }
  
  // If still not found, try to find from other localStorage keys
  if (!result) {
    for (const key of allKeys) {
      const value = localStorage.getItem(key)
      // Check if it's a valid Ethereum address format
      if (value && /^0x[a-fA-F0-9]{40}$/.test(value)) {
        // Exclude known other address types
        if (key.includes('WALLET') || key.includes('PKP') || key.includes('VINCENT')) {
          console.log(`🔍 Found possible PKP address from ${key}: ${value}`)
          // Temporarily use the found address (but this might not be PKP address)
          // result = value
          // break
        }
      }
    }
  }
  
  return result || null
}

// Reference testScript's concise implementation
export async function bootstrapAuthFlow(vincentAppClient, audienceOverride) {
  const safeIsExpired = (jwtStr) => {
    try {
      return isExpired(jwtStr)
    } catch (_) {
      return true
    }
  }

  // Reference testScript logic: use audience + '/'
  const audience = (audienceOverride || window.location.origin) + '/'
  console.log('🔍 bootstrapAuthFlow debug:', {
    audienceOverride,
    windowOrigin: window.location.origin,
    finalAudience: audience,
    uriContainsVincentJWT: vincentAppClient.uriContainsVincentJWT()
  })

  if (vincentAppClient.uriContainsVincentJWT()) {
    // Reference testScript's concise logic
    let result
    try {
      result = await vincentAppClient.decodeVincentJWTFromUri(audience)
      console.log('🔍 decodeVincentJWTFromUri result:', result)
    } catch (e) {
      console.warn('decodeVincentJWTFromUri failed:', e.message)
      throw e
    }
    
    const jwtStr = result?.jwtStr ?? result?.jwt ?? result?.token ?? null
    const decodedJWT = result?.decodedJWT ?? result?.decoded ?? null
    
    console.log('🔍 JWT parse result:', { jwtStr: !!jwtStr, decodedJWT: !!decodedJWT })
    
    if (jwtStr) localStorage.setItem(STORAGE_JWT, jwtStr)
    if (decodedJWT) {
      localStorage.setItem(STORAGE_DECODED, JSON.stringify(decodedJWT))
      const pkp = extractPkpEthAddress(decodedJWT)
      if (pkp) {
        console.log('💾 Stored PKP address to localStorage (SDK result):', { pkp, key: STORAGE_PKP_ADDR })
        localStorage.setItem(STORAGE_PKP_ADDR, pkp)
      } else {
        console.log('⚠️ Unable to extract PKP address from SDK result, skipping storage')
      }
    }
    
    vincentAppClient.removeVincentJWTFromURI()
    return { decodedJWT, jwtStr }
  } else {
    // Reference testScript logic: read from localStorage
    const storedJwt = localStorage.getItem(STORAGE_JWT)
    const expired = storedJwt ? safeIsExpired(storedJwt) : true
    if (!storedJwt || expired) {
      // Clear bad data to avoid reading wrong state next time
      // But keep PKP address as it never expires
      //localStorage.removeItem(STORAGE_JWT)
      //localStorage.removeItem(STORAGE_DECODED)
      // Don't delete PKP address: localStorage.removeItem(STORAGE_PKP_ADDR)
      console.log('⚠️ JWT expired, cleared JWT but kept PKP address')
      return { needsRedirect: true }
    }
    
    let decodedJWT = null
    try {
      const decoded = localStorage.getItem(STORAGE_DECODED)
      decodedJWT = decoded ? JSON.parse(decoded) : null
    } catch (_) {
      decodedJWT = null
    }
    
    // Ensure PKP address exists in storage
    try {
      const existing = localStorage.getItem(STORAGE_PKP_ADDR)
      console.log('🔍 Check existing PKP address:', { existing, hasDecodedJWT: !!decodedJWT })
      if (!existing && decodedJWT) {
        const pkp = extractPkpEthAddress(decodedJWT)
        if (pkp) {
          console.log('💾 Supplementary storage of PKP address to localStorage:', { pkp, key: STORAGE_PKP_ADDR })
          localStorage.setItem(STORAGE_PKP_ADDR, pkp)
        } else {
          console.log('⚠️ Unable to extract PKP address from existing JWT')
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
  // Ensure PKP address is also stored on success state
  try {
    if (state?.decodedJWT) {
      const pkp = extractPkpEthAddress(state.decodedJWT)
      if (pkp) {
        console.log('💾 Store PKP address on success state:', { pkp, key: STORAGE_PKP_ADDR })
        localStorage.setItem(STORAGE_PKP_ADDR, pkp)
      } else {
        console.log('⚠️ Unable to extract PKP address from success state JWT')
      }
    }
  } catch (error) {
    console.error('❌ Error occurred while storing PKP address:', error)
  }
  return { redirected: false, client, ...state }
}

export function getPkpEthAddress(decodedJWT) {
  const d = decodedJWT || getStoredVincentAuth().decodedJWT
  const fromDecoded = extractPkpEthAddress(d)
  const fromStorage = getStoredPkpEthAddress()
  
  console.log('🔍 getPkpEthAddress debug:', {
    hasDecodedJWT: !!decodedJWT,
    hasStoredJWT: !!d,
    fromDecoded,
    fromStorage,
    finalResult: fromDecoded || fromStorage
  })
  
  if (fromDecoded) return fromDecoded
  return fromStorage
}

// Function to manually set PKP address
export function setPkpEthAddress(pkpAddress) {
  if (!pkpAddress) {
    console.warn('⚠️ PKP address is empty, unable to set')
    return false
  }
  
  try {
    localStorage.setItem(STORAGE_PKP_ADDR, pkpAddress)
    console.log('✅ Successfully set PKP address:', { pkpAddress, key: STORAGE_PKP_ADDR })
    return true
  } catch (error) {
    console.error('❌ Failed to set PKP address:', error)
    return false
  }
}

// Manually extract and set PKP address from JWT
export function extractAndSetPkpFromJWT() {
  try {
    const decoded = localStorage.getItem(STORAGE_DECODED)
    if (!decoded) {
      console.warn('⚠️ Decoded JWT not found')
      return null
    }
    
    const parsed = JSON.parse(decoded)
    const pkpAddress = extractPkpEthAddress(parsed)
    
    if (pkpAddress) {
      setPkpEthAddress(pkpAddress)
      console.log('✅ Successfully extracted and set PKP address from JWT:', pkpAddress)
      return pkpAddress
    } else {
      console.warn('⚠️ Unable to extract PKP address from JWT')
      return null
    }
  } catch (error) {
    console.error('❌ Error occurred while extracting PKP address from JWT:', error)
    return null
  }
}

// Check if PKP address is still valid
export function validatePkpAddress() {
  const storedPkp = localStorage.getItem(STORAGE_PKP_ADDR)
  const jwt = localStorage.getItem(STORAGE_JWT)
  const decoded = localStorage.getItem(STORAGE_DECODED)
  
  console.log('🔍 PKP address validation:', {
    hasStoredPkp: !!storedPkp,
    hasJwt: !!jwt,
    hasDecoded: !!decoded,
    storedPkp: storedPkp
  })
  
  // If there's no stored PKP address, try to extract from JWT
  if (!storedPkp && decoded) {
    console.log('⚠️ No stored PKP address, trying to extract from JWT...')
    return extractAndSetPkpFromJWT()
  }
  
  return storedPkp
}

// Debug function: check all Vincent-related data in localStorage
export function debugVincentStorage() {
  console.log('🔍 Vincent Storage debug report:')
  console.log('All localStorage keys:', Object.keys(localStorage))
  console.log('Vincent related keys:', Object.keys(localStorage).filter(key => key.includes('VINCENT')))
  console.log('PKP address key:', STORAGE_PKP_ADDR)
  console.log('PKP address value:', localStorage.getItem(STORAGE_PKP_ADDR))
  console.log('JWT value:', localStorage.getItem(STORAGE_JWT))
  console.log('Decoded JWT value:', localStorage.getItem(STORAGE_DECODED))
  
  // Try to parse decoded JWT
  try {
    const decoded = localStorage.getItem(STORAGE_DECODED)
    if (decoded) {
      const parsed = JSON.parse(decoded)
      console.log('Parsed JWT payload:', parsed)
      console.log('PKP address extracted from JWT:', extractPkpEthAddress(parsed))
      
      // Try to automatically extract and set PKP address
      const extractedPkp = extractAndSetPkpFromJWT()
      if (extractedPkp) {
        console.log('✅ Successfully auto-extracted and set PKP address:', extractedPkp)
      }
    }
  } catch (error) {
    console.error('Error occurred while parsing JWT:', error)
  }
}

