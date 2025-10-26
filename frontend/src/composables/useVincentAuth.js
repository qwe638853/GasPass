import { ref } from 'vue'
import { 
  ensureVincentAuth, 
  getStoredVincentAuth, 
  getPkpEthAddress, 
  getStoredPkpEthAddress, 
  debugVincentStorage,
  setPkpEthAddress,
  extractAndSetPkpFromJWT,
  validatePkpAddress
} from '../services/vincentAuthService.js'

// Vincent App ID - Hardcoded to resolve JWT validation issues
const VINCENT_APP_ID = 6140907850
const APP_ID_FROM_ENV = typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env.VITE_VINCENT_APP_ID : VINCENT_APP_ID
const DEFAULT_AUDIENCE = typeof window !== 'undefined' ? window.location.origin : ''

export function useVincentAuth(appIdProvider) {
  const vincentJwt = ref(null)
  const vincentDecoded = ref(null)
  const vincentPkpEthAddress = ref(null)
  const vincentRedirecting = ref(false)

  const getAppId = () => {
    if (typeof appIdProvider === 'function') return appIdProvider()
    if (appIdProvider != null) return appIdProvider
    return APP_ID_FROM_ENV
  }

  const loadFromStorage = () => {
    const { jwtStr, decodedJWT } = getStoredVincentAuth()
    vincentJwt.value = jwtStr
    vincentDecoded.value = decodedJWT
    // Reference testScript logic: prefer reading from localStorage, fallback to JWT parsing
    vincentPkpEthAddress.value = getStoredPkpEthAddress() || getPkpEthAddress(decodedJWT)
  }

  const ensureAuth = async (audience = DEFAULT_AUDIENCE, { allowRedirect = true } = {}) => {
    const appId = getAppId()
    if (!appId) throw new Error('Missing Vincent App ID')
    const result = await ensureVincentAuth(appId, audience, { allowRedirect })
    if (result.redirected) {
      vincentRedirecting.value = true
      return { redirected: true }
    }
    // Reference testScript logic: update all state
    if (result.jwtStr) {
      vincentJwt.value = result.jwtStr
      vincentDecoded.value = result.decodedJWT
      // Reference testScript: prefer payload.pkpInfo.ethAddress, fallback to pkp.ethAddress
      const pkpAddr = result.decodedJWT?.payload?.pkpInfo?.ethAddress ?? result.decodedJWT?.pkp?.ethAddress
      if (pkpAddr) {
        vincentPkpEthAddress.value = pkpAddr
      }
    }
    return { redirected: false, ...result }
  }

  return {
    vincentJwt,
    vincentDecoded,
    vincentPkpEthAddress,
    vincentRedirecting,
    loadFromStorage,
    ensureAuth,
    debugVincentStorage, // Debug function
    setPkpEthAddress, // Manually set PKP address
    extractAndSetPkpFromJWT, // Extract and set PKP address from JWT
    validatePkpAddress, // Validate PKP address
  }
}


