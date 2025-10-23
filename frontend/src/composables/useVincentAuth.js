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
    // 參考 testScript 的邏輯：優先從 localStorage 讀取，回退到 JWT 解析
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
    // 參考 testScript 的邏輯：更新所有狀態
    if (result.jwtStr) {
      vincentJwt.value = result.jwtStr
      vincentDecoded.value = result.decodedJWT
      // 參考 testScript：優先使用 payload.pkpInfo.ethAddress，回退到 pkp.ethAddress
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
    debugVincentStorage, // 調試函數
    setPkpEthAddress, // 手動設置 PKP 地址
    extractAndSetPkpFromJWT, // 從 JWT 提取並設置 PKP 地址
    validatePkpAddress, // 驗證 PKP 地址
  }
}


