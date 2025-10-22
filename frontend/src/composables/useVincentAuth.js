import { ref } from 'vue'
import { ensureVincentAuth, getStoredVincentAuth, getPkpEthAddress, getStoredPkpEthAddress } from '../services/vincentAuthService.js'

// Vincent App ID - 硬編碼以解決 JWT 驗證問題
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
    vincentPkpEthAddress.value = getStoredPkpEthAddress() || getPkpEthAddress(decodedJWT)
  }

  const ensureAuth = async (audience = DEFAULT_AUDIENCE, { allowRedirect = true } = {}) => {
    const appId = getAppId()
    if (!appId) throw new Error('缺少 Vincent App ID')
    const result = await ensureVincentAuth(appId, audience, { allowRedirect })
    if (result.redirected) {
      vincentRedirecting.value = true
      return { redirected: true }
    }
    // 只有在有新的 JWT 時才更新狀態，避免清除已設置的 JWT
    if (result.jwtStr) {
      vincentJwt.value = result.jwtStr
      vincentDecoded.value = result.decodedJWT
      vincentPkpEthAddress.value = getPkpEthAddress(result.decodedJWT)
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
  }
}


