import { reactive, computed } from 'vue'
import { NexusSDK } from '@avail-project/nexus-core'
import { getAccount, getWalletClient } from '@wagmi/core'
import { walletService } from '../services/walletService.js'

// 創建 SDK 實例 (使用主網)
console.log('[useNexus] 🔧 創建 Nexus SDK 實例，配置 mainnet...')

// 檢查環境變數和可能的配置選項
console.log('[useNexus] 🌍 當前環境檢查:')
console.log('  - NODE_ENV:', import.meta.env.NODE_ENV || 'undefined')
console.log('  - MODE:', import.meta.env.MODE || 'undefined') 
console.log('  - DEV:', import.meta.env.DEV || 'undefined')
console.log('  - 當前 URL:', window.location.href)

// 使用主網配置
let sdk

// 導出 sdk 實例供其他組件使用
export { sdk }
try {
  // 方法 1: 標準 mainnet 配置 (根據文檔)
  const config = { network: 'mainnet' }
  console.log('[useNexus] 🌐 嘗試配置:', config)
  sdk = new NexusSDK(config)
  console.log('[useNexus] ✅ SDK 創建完成，配置方法 1 (標準):', config)
} catch (error) {
  console.log('[useNexus] ❌ 配置方法 1 失敗:', error.message)
  
  try {
    // 方法 2: 無參數初始化，預設是 mainnet
    console.log('[useNexus] 🌐 嘗試配置: 無參數（預設 mainnet）')
    sdk = new NexusSDK()
    console.log('[useNexus] ✅ SDK 創建完成，配置方法 2: 無參數（預設 mainnet）')
  } catch (error2) {
    console.log('[useNexus] ❌ 配置方法 2 失敗:', error2.message)
    
    try {
      // 方法 3: 嘗試明確的字串配置
      console.log('[useNexus] 🌐 嘗試配置: mainnet 字串')
      sdk = new NexusSDK('mainnet')
      console.log('[useNexus] ✅ SDK 創建完成，配置方法 3: mainnet 字串')
    } catch (error3) {
      console.log('[useNexus] ❌ 所有配置方法失敗:', error3.message)
      throw new Error('無法創建 Nexus SDK 實例')
    }
  }
}

// 立即檢查 SDK 是否正確配置
if (sdk && typeof sdk.utils === 'object') {
  console.log('[useNexus] ✅ SDK utils 可用')
  
  // 立即測試 getSupportedChains 在初始化前的結果
  try {
    const preInitChains = sdk.utils.getSupportedChains()
    console.log('[useNexus] 🧪 初始化前的支援鏈 (應該是空或預設):', preInitChains)
  } catch (preError) {
    console.log('[useNexus] ⚠️ 初始化前無法獲取支援鏈:', preError.message)
  }
} else {
  console.log('[useNexus] ❌ SDK utils 不可用')
}

// 移除硬編碼的鏈圖標映射 - SDK 會提供 logo

// 響應式狀態
export const nexusState = reactive({
  initialized: false,
  usdcAsset: null, // 存放原始的asset 物件
  usdcBalances: null, // 存放正規化後的餘額
  // 通用：目前選擇的資產及其餘額
  selectedToken: 'USDC',
  currentAsset: null,
  currentBalances: null,
  supportedChains: [], // 支援的鏈列表
  swapSupport: null, // swap 支援信息
  loading: false,
  error: null,
  // 進度追蹤
  currentOperation: null,
  operationSteps: [],
  completedSteps: [],
  // Swap 相關狀態
  swapSupportedChains: [], // 支援 swap 的鏈和代幣
  destinationTokens: new Map(), // 目標代幣建議 chainId -> tokens[]
  swapProgress: {
    steps: [],
    currentStep: null,
    sourceSwapHash: null,
    destinationSwapHash: null,
    completed: false
  },
  swapLoading: false,
  swapError: null
})

// 錯誤處理
const handleError = (error, context = '') => {
  console.error(`Nexus ${context} error:`, error)
  nexusState.error = error.message || 'Unknown error'
  nexusState.loading = false
}

// 初始化 Nexus SDK（使用主網）
export async function initializeNexus() {
  try {
    nexusState.loading = true
    nexusState.error = null

    const account = getAccount(walletService.wagmiConfig)
    if (!account.isConnected) {
      throw new Error('請先連接錢包')
    }

    const walletClient = await getWalletClient(walletService.wagmiConfig)
    if (!walletClient) throw new Error('無法獲取 WalletClient，請先連錢包')

    console.log('[useNexus] 🔗 當前錢包鏈 ID:', walletClient.chain.id)
    console.log('[useNexus] 🌐 使用 Nexus mainnet 模式')

    // 檢查當前錢包鏈ID
    const currentChainId = walletClient.chain.id
    console.log('[useNexus] 當前錢包鏈 ID:', currentChainId)

    const isEip1193 = (p) => !!p && typeof p.request === 'function'

    const providerFromWalletClient = (wc) => {
      const p = wc?.transport?.value
      if (p && typeof p.request === 'function' && typeof p.on === 'function') {
        return p
      }
      return {
        request: ({ method, params }) => wc.request({ method, params }),
        on: (event, handler) => {
          if (wc?.transport?.on) return wc.transport.on(event, handler)
          if (typeof window !== 'undefined' && window.ethereum?.on) {
            return window.ethereum.on(event, handler)
          }
        },
        removeListener: (event, handler) => {
          if (wc?.transport?.off) return wc.transport.off(event, handler)
          if (typeof window !== 'undefined' && window.ethereum?.removeListener) {
            return window.ethereum.removeListener(event, handler)
          }
        }
      }
    }

    const provider = providerFromWalletClient(walletClient)
    if (!isEip1193(provider)) throw new Error('無法取得 EIP-1193 Provider')

    if (!sdk.isInitialized()) {
      console.log('[useNexus] 🚀 初始化 Nexus SDK (mainnet 模式)...')
      console.log('[useNexus] SDK 配置:', { network: 'mainnet' })
      
      // 在初始化前先檢查 SDK 是否正確配置為 mainnet
      console.log('[useNexus] 初始化前 - 檢查 SDK network 配置...')
      
      // 特別注意這裡 - 這是簽名請求出現的地方
      console.log('[useNexus] 🔐 即將調用 sdk.initialize() - 這裡會出現簽名請求')
      console.log('[useNexus] 🔐 預期: 簽名請求應該顯示主網 Chain ID')
      console.log('[useNexus] 🔐 當前錢包鏈 ID:', walletClient.chain.id)
      
      await sdk.initialize(provider)
      
      console.log('[useNexus] ✅ SDK 初始化完成')
      console.log('[useNexus] 初始化後 - 當前錢包鏈 ID:', walletClient.chain.id)
      
      // 檢查簽名後的實際狀態
      console.log('[useNexus] 🔍 檢查簽名後的狀態...')
      try {
        // 嘗試獲取當前連接的鏈信息
        if (typeof sdk.getCurrentChainId === 'function') {
          const sdkChainId = sdk.getCurrentChainId()
          console.log('[useNexus] SDK 報告的當前鏈 ID:', sdkChainId)
        }
        
        // 檢查 provider 的狀態
        const chainIdHex = await provider.request({ method: 'eth_chainId' })
        const chainIdDecimal = parseInt(chainIdHex, 16)
        console.log('[useNexus] Provider 報告的鏈 ID:', chainIdDecimal, '(hex:', chainIdHex, ')')
        
      } catch (statusError) {
        console.log('[useNexus] ⚠️ 檢查簽名後狀態時出錯:', statusError.message)
      }
      
      // 立即檢查 SDK 是否返回正確的主網鏈
      const immediateCheck = sdk.utils.getSupportedChains()
      console.log('[useNexus] 🔍 初始化後立即檢查支援的鏈:', immediateCheck)
      
      if (immediateCheck && immediateCheck.length > 0) {
        const chainIds = immediateCheck.map(c => c.id)
        
        console.log('[useNexus] 📊 SDK 返回的鏈:', {
          總數: chainIds.length,
          鏈ID列表: chainIds
        })
        
        console.log('[useNexus] ✅ SDK 成功返回支援的鏈')
      }
      
      nexusState.initialized = true
    }

    // 先探索支援鏈，填充 nexusState.supportedChains，再抓餘額
    await exploreNexusCapabilities()
    await fetchUnifiedUSDC()
    
    // 獲取 swap 支援的鏈和代幣
    await getSwapSupportedChainsAndTokens()
    
    // 設置默認的 hooks
    setupIntentHook()
    setupAllowanceHook()
    
    // 設置進度追蹤
    setupProgressTracking()
    setupSwapProgressTracking()
  } catch (error) {
    handleError(error, 'initialization')
    throw error
  } finally {
    nexusState.loading = false
  }
}

// 將 getUnifiedBalance('USDC') 的回傳轉成 { [chainId]: { balance, decimals, address, chainName } }
function normalizeUSDC(asset) {
  const map = {}
  if (!asset || !Array.isArray(asset.breakdown)) return map
  for (const item of asset.breakdown) {
    const cid = String(item?.chain?.id ?? '')
    if (!cid) continue
    map[cid] = {
      balance: item.balance ?? '0',
      decimals: item.decimals ?? asset.decimals ?? 6,
      address: item.contractAddress ?? '',
      chainName: item.chain?.name ?? ''
    }
  }
  return map
}

// 專門獲取 USDC 統一餘額並正規化
export async function fetchUnifiedUSDC() {
  try {
    if (!sdk.isInitialized()) throw new Error('Nexus SDK 未初始化')
    nexusState.loading = true
    const usdcAsset = await sdk.getUnifiedBalance('USDC')
    console.log('Raw USDC asset:', usdcAsset)

    nexusState.usdcAsset = usdcAsset // 保存原始物件
    nexusState.usdcBalances = normalizeUSDC(usdcAsset)
    nexusState.selectedToken = 'USDC' // 設置選中的代幣
    console.log('Normalized USDC balances:', JSON.parse(JSON.stringify(nexusState.usdcBalances)))

    return nexusState.usdcBalances
  } catch (error) {
    handleError(error, 'fetching USDC balance')
    throw error
  } finally {
    nexusState.loading = false
  }
}

// 取得任意代幣的 unified balance 並正規化
export async function fetchUnifiedToken(symbol) {
  try {
    if (!sdk.isInitialized()) throw new Error('Nexus SDK 未初始化')
    nexusState.loading = true
    const asset = await sdk.getUnifiedBalance(symbol)
    nexusState.currentAsset = asset
    nexusState.currentBalances = normalizeUSDC(asset)
    nexusState.selectedToken = symbol
    return nexusState.currentBalances
  } catch (error) {
    handleError(error, `fetching ${symbol} balance`)
    throw error
  } finally {
    nexusState.loading = false
  }
}

// 計算屬性：提供給 UI 使用的 USDC 餘額列表
export const getUSDCBalances = computed(() => {
  if (!nexusState.usdcBalances) return []
  return Object.entries(nexusState.usdcBalances).map(([chainId, data]) => ({
    chainId: parseInt(chainId),
    chainName: data.chainName,
    balance: data.balance,
    formattedBalance: Number(data.balance || '0').toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 6
    })
  }))
})

// 提供 UI 使用：目前選擇代幣的餘額列表
export const getSelectedTokenBalances = computed(() => {
  // 根據選中的代幣類型選擇正確的數據源
  const src = nexusState.selectedToken === 'USDC' ? nexusState.usdcBalances : nexusState.currentBalances
  if (!src) return []
  return Object.entries(src).map(([chainId, data]) => ({
    chainId: parseInt(chainId),
    chainName: data.chainName,
    balance: data.balance,
    formattedBalance: Number(data.balance || '0').toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 6
    })
  }))
})

// 計算屬性：所有鏈的 USDC 總餘額
export const getTotalUSDCBalance = computed(() => {
  if (!nexusState.usdcAsset) return '0.00'
  if (nexusState.usdcAsset.balance) {
    return parseFloat(nexusState.usdcAsset.balance).toFixed(2)
  }

  if (!nexusState.usdcBalances) return '0.00'
  let total = 0
  for (const cid of Object.keys(nexusState.usdcBalances)) {
    const v = Number(nexusState.usdcBalances[cid].balance || '0')
    if (!Number.isNaN(v)) total += v
  }
  return total.toFixed(2)
})

// 目前選擇代幣的總餘額
export const getSelectedTokenTotal = computed(() => {
  // 根據選中的代幣類型選擇正確的數據源
  if (nexusState.selectedToken === 'USDC') {
    return getTotalUSDCBalance.value
  } else if (nexusState.currentAsset?.balance) {
    return parseFloat(nexusState.currentAsset.balance).toFixed(2)
  }
  return '0.00'
})

// 探索 Nexus 的能力和支援的鏈 (使用官方 SDK utilities)
export async function exploreNexusCapabilities() {
  try {
    if (!sdk.isInitialized()) throw new Error('Nexus SDK 未初始化')
    
    console.log('[useNexus] 探索 Nexus 能力 (mainnet 模式)...')
    
    // 詳細檢查 SDK 狀態和配置
    console.log('[useNexus] 🔍 詳細 SDK 檢查:')
    console.log('  - isInitialized:', sdk.isInitialized())
    console.log('  - 我們的配置: network: mainnet')
    console.log('  - SDK 方法:', Object.keys(sdk).filter(k => typeof sdk[k] === 'function'))
    console.log('  - Utils 方法:', Object.keys(sdk.utils).filter(k => typeof sdk.utils[k] === 'function'))
    
    // 嘗試檢查 SDK 內部的網路配置（如果可能）
    try {
      // 檢查是否有方法可以驗證當前網路模式
      if (typeof sdk.getNetwork === 'function') {
        const currentNetwork = sdk.getNetwork()
        console.log('[useNexus] 🌐 SDK 當前網路模式:', currentNetwork)
      } else {
        console.log('[useNexus] ℹ️ SDK 沒有 getNetwork 方法')
      }
      
      // 檢查 SDK 的配置物件（如果可訪問）
      if (sdk.config) {
        console.log('[useNexus] ⚙️ SDK 配置物件:', sdk.config)
      } else {
        console.log('[useNexus] ℹ️ SDK 配置物件不可訪問')
      }
    } catch (configError) {
      console.log('[useNexus] ⚠️ 檢查 SDK 配置時出錯:', configError.message)
    }
    
    // 使用官方 SDK utilities 獲取支援的鏈
    const supportedChains = sdk.utils.getSupportedChains()
    console.log('[useNexus] sdk.utils.getSupportedChains() 完整結果:', supportedChains)
    console.log('[useNexus] supportedChains 類型:', typeof supportedChains, Array.isArray(supportedChains))
    
    // 獲取 swap 支援信息
    const swapSupport = sdk.utils.getSwapSupportedChainsAndTokens()
    console.log('[useNexus] sdk.utils.getSwapSupportedChainsAndTokens() 結果:', swapSupport)
    console.log('[useNexus] swapSupport 類型:', typeof swapSupport)
    
    // 嘗試更多的 SDK utilities 方法
    try {
      // 檢查支援的代幣
      if (typeof sdk.utils.isSupportedToken === 'function') {
        const tokens = ['USDC', 'ETH', 'USDT']
        tokens.forEach(token => {
          const supported = sdk.utils.isSupportedToken(token)
          console.log(`[useNexus] 代幣 ${token} 支援狀態:`, supported)
        })
      }
      
      // 檢查特定鏈是否支援 - 使用 SDK 提供的鏈列表
      if (typeof sdk.utils.isSupportedChain === 'function' && supportedChains) {
        supportedChains.forEach(chain => {
          const supported = sdk.utils.isSupportedChain(chain.id)
          console.log(`[useNexus] 鏈 ${chain.id} (${chain.name}) 支援狀態:`, supported)
        })
      }
      
      // 嘗試獲取鏈的 metadata - 使用 SDK 提供的鏈列表
      if (typeof sdk.utils.getChainMetadata === 'function' && supportedChains) {
        supportedChains.forEach(chain => {
          const metadata = sdk.utils.getChainMetadata(chain.id)
          console.log(`[useNexus] 鏈 ${chain.id} (${chain.name}) metadata:`, metadata)
        })
      }
      
    } catch (utilsError) {
      console.log('[useNexus] 探索 utils 方法時出錯:', utilsError.message)
    }
    
    // 處理 getSupportedChains 的結果
    let finalChains = []
    
    // 使用 getSupportedChains() 獲取主網鏈
    console.log('[useNexus] 🌐 使用 getSupportedChains() 獲取主網鏈')
    
    let actualMainnetChains = []
    
    // 方法 1: 從 USDC 餘額中獲取實際可用的主網鏈
    if (nexusState.usdcBalances && Object.keys(nexusState.usdcBalances).length > 0) {
      const usdcChainIds = Object.keys(nexusState.usdcBalances).map(id => parseInt(id))
      console.log('[useNexus] 📊 從 USDC 餘額發現的實際可用鏈:', usdcChainIds)
      
      // 為這些鏈獲取 metadata
      actualMainnetChains = usdcChainIds.map(chainId => {
        const metadata = sdk.utils.getChainMetadata(chainId)
        if (metadata) {
          return {
            id: metadata.id,
            name: metadata.name,
            symbol: metadata.nativeCurrency?.symbol || 'ETH',
            icon: metadata.logo || '🌐',
            logo: metadata.logo
          }
        } else {
          // 如果 SDK 沒有提供 metadata，使用基本資訊
          return {
            id: chainId,
            name: `Chain ${chainId}`,
            symbol: 'ETH',
            icon: '🌐'
          }
        }
      }).filter(Boolean)
      
      console.log('[useNexus] ✅ 從實際 USDC 餘額構建的主網鏈:', actualMainnetChains)
    }
    
    // 方法 2: 如果沒有 USDC 餘額，使用 getSupportedChains 的結果
    if (actualMainnetChains.length === 0 && supportedChains && Array.isArray(supportedChains)) {
      console.log('[useNexus] 📋 備援方案：使用 getSupportedChains 返回的主網鏈')
      
      actualMainnetChains = supportedChains.map(chain => ({
        id: chain.id,
        name: chain.name,
        symbol: chain.symbol || 'ETH',
        icon: chain.logo || '🌐',
        logo: chain.logo
      }))
      
      console.log('[useNexus] 📋 使用 getSupportedChains 的鏈:', actualMainnetChains)
    }
    
    finalChains = actualMainnetChains
    
    // 記錄 getSupportedChains 的結果
    if (supportedChains && Array.isArray(supportedChains) && supportedChains.length > 0) {
      console.log('[useNexus] ✅ getSupportedChains() 返回的主網鏈:')
      supportedChains.forEach((chain, index) => {
        console.log(`  [${index}] ID: ${chain.id}, Name: ${chain.name}, Logo: ${chain.logo}`)
      })
    }
    
    // 更新狀態
    nexusState.supportedChains = finalChains
    nexusState.swapSupport = swapSupport
    
    console.log('[useNexus] 最終使用的鏈列表 (共', finalChains.length, '個):', finalChains)
    
    return { supportedChains: finalChains, swapSupport }
  } catch (error) {
    console.error('[useNexus] 探索能力失敗:', error)
    console.error('[useNexus] 錯誤堆疊:', error.stack)
    return { supportedChains: [], swapSupport: null }
  }
}

// 獲取支援的目標鏈列表
export function getSupportedTargetChains() {
  if (nexusState.supportedChains && nexusState.supportedChains.length > 0) {
    return nexusState.supportedChains
  }
  
  console.log('[useNexus] 尚未探索到支援的鏈，返回空列表')
  return []
}



// 獲取鏈信息（從 Nexus 數據中）
export function getChainMetadata(chainId) {
  if (!nexusState.supportedChains) return null
  return nexusState.supportedChains.find(chain => chain.id === chainId) || null
}

// 格式化代幣數量
export function formatTokenAmount(amount, symbol) {
  const num = parseFloat(amount || '0')
  return `${num.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 6
  })} ${symbol}`
}

// 設置 Intent Hook（用戶確認交易意圖）
export function setupIntentHook(confirmCallback) {
  if (!sdk.isInitialized()) return
  
  sdk.setOnIntentHook(({ intent, allow, deny, refresh }) => {
    console.log('[useNexus] Intent Hook:', intent)
    
    // 調用外部的確認回調
    if (confirmCallback) {
      confirmCallback({ intent, allow, deny, refresh })
    } else {
      // 默認自動確認（開發階段）
      console.log('[useNexus] 自動確認 Intent')
      allow()
    }
  })
}

// 設置 Allowance Hook（用戶確認授權）
export function setupAllowanceHook(allowanceCallback) {
  if (!sdk.isInitialized()) return
  
  sdk.setOnAllowanceHook(({ allow, deny, sources }) => {
    console.log('[useNexus] Allowance Hook:', sources)
    
    // 調用外部的授權回調
    if (allowanceCallback) {
      allowanceCallback({ allow, deny, sources })
    } else {
      // 默認使用最小授權
      console.log('[useNexus] 自動確認 Allowance (min)')
      allow(sources.map(() => 'min'))
    }
  })
}

// 設置進度事件監聽
export function setupProgressTracking() {
  if (!sdk.isInitialized()) return
  
  // Transfer 和 Bridge 進度
  const unsubscribeExpected = sdk.nexusEvents.on('expected_steps', (steps) => {
    console.log('[useNexus] 預期步驟:', steps)
    nexusState.operationSteps = steps
  })
  
  const unsubscribeCompleted = sdk.nexusEvents.on('step_complete', (step) => {
    console.log('[useNexus] 完成步驟:', step)
    nexusState.completedSteps.push(step)
    
    if (step.typeID === 'IS' && step.data.explorerURL) {
      console.log('[useNexus] 交易探索器:', step.data.explorerURL)
    }
  })
  
  // Bridge & Execute 進度
  const unsubscribeBridgeExpected = sdk.nexusEvents.on('bridge_execute_expected_steps', (steps) => {
    console.log('[useNexus] Bridge Execute 預期步驟:', steps)
    nexusState.operationSteps = steps
  })
  
  const unsubscribeBridgeCompleted = sdk.nexusEvents.on('bridge_execute_completed_steps', (step) => {
    console.log('[useNexus] Bridge Execute 完成步驟:', step)
    nexusState.completedSteps.push(step)
  })
  
  // 返回清理函數
  return () => {
    unsubscribeExpected()
    unsubscribeCompleted()
    unsubscribeBridgeExpected()
    unsubscribeBridgeCompleted()
  }
}

// 專門診斷 SDK 網路模式的函數
export async function diagnoseSDKNetworkMode() {
  try {
    console.log('=== SDK 網路模式深度診斷 ===')
    
    // 檢查 SDK 創建時的配置
    console.log('🔧 SDK 創建配置檢查:')
    console.log('  - SDK 實例存在:', !!sdk)
    console.log('  - SDK 類型:', typeof sdk)
    
    if (!sdk) {
      return { error: 'SDK 實例不存在' }
    }
    
    // 檢查 SDK 內部可能的配置屬性
    console.log('🔍 SDK 內部檢查:')
    const sdkKeys = Object.keys(sdk)
    console.log('  - SDK 屬性:', sdkKeys)
    
    // 嘗試找到網路配置相關的屬性
    const configKeys = sdkKeys.filter(key => 
      key.toLowerCase().includes('config') || 
      key.toLowerCase().includes('network') ||
      key.toLowerCase().includes('mode')
    )
    console.log('  - 可能的配置屬性:', configKeys)
    
    configKeys.forEach(key => {
      try {
        console.log(`  - ${key}:`, sdk[key])
      } catch (error) {
        console.log(`  - ${key}: 無法存取 (${error.message})`)
      }
    })
    
    // 檢查 getSupportedChains 在不同時機的結果
    console.log('⛓️ getSupportedChains 測試:')
    
    const beforeInitChains = sdk.utils.getSupportedChains()
    console.log('  - 初始化前:', beforeInitChains)
    
    if (beforeInitChains && beforeInitChains.length > 0) {
      const chainIds = beforeInitChains.map(c => c.id)
      const isMainnet = chainIds.some(id => [1, 137, 42161, 10, 8453].includes(id))
      const isTestnet = chainIds.some(id => [11155420, 80002, 421614, 84532, 11155111, 1014].includes(id))
      
      console.log('  - 分析結果:')
      console.log('    * 鏈數量:', chainIds.length)
      console.log('    * 包含主網鏈:', isMainnet)
      console.log('    * 包含測試網鏈:', isTestnet)
      console.log('    * 所有鏈 ID:', chainIds)
      
      if (isMainnet && !isTestnet) {
        console.log('  ❌ 問題確認: SDK 返回主網鏈，testnet 配置無效')
        return {
          issue: 'SDK_MAINNET_MODE',
          description: 'SDK 配置為 testnet 但返回主網鏈',
          evidence: { chainIds, isMainnet, isTestnet }
        }
      } else if (isTestnet) {
        console.log('  ✅ SDK 正確配置為 testnet 模式')
        return {
          status: 'OK',
          description: 'SDK 正確返回測試網鏈',
          evidence: { chainIds, isMainnet, isTestnet }
        }
      }
    }
    
    return { status: 'UNKNOWN', description: '無法確定 SDK 網路模式' }
    
  } catch (error) {
    console.error('❌ SDK 網路模式診斷失敗:', error)
    return { error: error.message }
  }
}

// 診斷函數：檢查測試網環境和 USDC 支援（使用官方 SDK utilities）
export async function diagnoseBridgeSupport() {
  try {
    console.log('=== Nexus 測試網診斷 (使用官方 SDK utilities) ===')
    
    if (!sdk.isInitialized()) {
      console.log('❌ SDK 未初始化')
      return { error: 'SDK 未初始化' }
    }
    
    console.log('✅ SDK 已初始化')
    
    // 使用官方 SDK utilities 檢查基本能力
    const supportedChains = sdk.utils.getSupportedChains()
    const swapSupport = sdk.utils.getSwapSupportedChainsAndTokens()
    
    console.log('🔗 sdk.utils.getSupportedChains() 結果:', supportedChains)
    console.log('💱 sdk.utils.getSwapSupportedChainsAndTokens() 結果:', swapSupport)
    
    // 使用 SDK utilities 檢查代幣支援
    const tokenSupportResults = {}
    const tokens = ['USDC', 'ETH', 'USDT']
    if (typeof sdk.utils.isSupportedToken === 'function') {
      tokens.forEach(token => {
        const isSupported = sdk.utils.isSupportedToken(token)
        tokenSupportResults[token] = isSupported
        console.log(`🪙 sdk.utils.isSupportedToken('${token}'):`, isSupported)
      })
    }
    
    // 使用 SDK utilities 檢查鏈支援
    const chainSupportResults = {}
    const testnetChainIds = [11155420, 80002, 421614, 84532, 11155111, 1014]
    if (typeof sdk.utils.isSupportedChain === 'function') {
      testnetChainIds.forEach(chainId => {
        const isSupported = sdk.utils.isSupportedChain(chainId)
        chainSupportResults[chainId] = isSupported
        console.log(`⛓️ sdk.utils.isSupportedChain(${chainId}):`, isSupported)
      })
    }
    
    // 使用 SDK utilities 獲取鏈的 metadata
    const chainMetadataResults = {}
    if (typeof sdk.utils.getChainMetadata === 'function') {
      testnetChainIds.forEach(chainId => {
        const metadata = sdk.utils.getChainMetadata(chainId)
        chainMetadataResults[chainId] = metadata
        console.log(`📋 sdk.utils.getChainMetadata(${chainId}):`, metadata)
      })
    }
    
    // 檢查 USDC 餘額和支援的鏈
    let usdcChains = []
    try {
      const usdcAsset = await sdk.getUnifiedBalance('USDC')
      if (usdcAsset && usdcAsset.breakdown) {
        usdcChains = usdcAsset.breakdown.map(b => b.chain?.id).filter(Boolean)
        console.log('💰 USDC 可用鏈 (從 getUnifiedBalance):', usdcChains)
      }
    } catch (usdcError) {
      console.log('❌ USDC 餘額檢查失敗:', usdcError.message)
    }
    
    // 嘗試對支援的測試網鏈進行模擬（只對 SDK 明確支援的鏈進行測試）
    const supportedTestnetChains = testnetChainIds.filter(chainId => 
      chainSupportResults[chainId] === true
    )
    
    console.log(`🧪 將對以下 SDK 支援的測試網鏈進行模擬:`, supportedTestnetChains)
    
    const simulationResults = {}
    
    for (const chainId of supportedTestnetChains) {
      try {
        console.log(`🧪 測試鏈 ${chainId} (SDK 確認支援)...`)
        
        const simulation = await sdk.simulateTransfer({
          token: 'USDC',
          amount: 1,
          chainId: chainId,
          recipient: '0x742d35Cc6634C0532925a3b8D28F1eC21a9B7b5'
        })
        
        simulationResults[chainId] = { success: true, simulation }
        console.log(`✅ 鏈 ${chainId} 模擬成功:`, simulation)
      } catch (error) {
        simulationResults[chainId] = { success: false, error: error.message }
        console.log(`❌ 鏈 ${chainId} 模擬失敗:`, error.message)
      }
    }
    
    // 如果沒有 SDK 明確支援的鏈，也測試一下文檔中提到的測試網鏈
    if (supportedTestnetChains.length === 0) {
      console.log('⚠️ SDK 未明確支援任何測試網鏈，嘗試文檔中的測試網鏈')
      const fallbackChains = [11155420, 80002, 421614, 84532, 11155111]
      
      for (const chainId of fallbackChains) {
        try {
          console.log(`🧪 嘗試測試鏈 ${chainId} (備援測試)...`)
          
          const simulation = await sdk.simulateTransfer({
            token: 'USDC',
            amount: 1,
            chainId: chainId,
            recipient: '0x742d35Cc6634C0532925a3b8D28F1eC21a9B7b5'
          })
          
          simulationResults[chainId] = { success: true, simulation }
          console.log(`✅ 鏈 ${chainId} 備援測試成功`)
        } catch (error) {
          simulationResults[chainId] = { success: false, error: error.message }
          console.log(`❌ 鏈 ${chainId} 備援測試失敗:`, error.message)
        }
      }
    }
    
    const summary = {
      sdkInitialized: true,
      supportedChainsFromSDK: supportedChains,
      supportedChainsCount: supportedChains?.length || 0,
      hasSwapSupport: !!swapSupport,
      tokenSupportResults,
      chainSupportResults,
      chainMetadataResults,
      usdcSupportedChains: usdcChains,
      simulationResults,
      recommendations: []
    }
    
    // 生成建議
    if (usdcChains.length === 0) {
      summary.recommendations.push('需要先在測試網獲取 USDC 餘額')
    }
    
    const successfulChains = Object.keys(simulationResults).filter(id => simulationResults[id].success)
    if (successfulChains.length === 0) {
      summary.recommendations.push('沒有鏈支援 USDC 轉移模擬，可能 testnet 環境需要檢查')
    } else {
      summary.recommendations.push(`建議使用支援的鏈: ${successfulChains.join(', ')}`)
    }
    
    // 檢查 SDK 是否正確返回測試網鏈
    if (supportedChains && supportedChains.length > 0) {
      const chainIds = supportedChains.map(c => c.id)
      const hasMainnetChains = chainIds.some(id => [1, 137, 42161, 10, 8453].includes(id))
      const hasTestnetChains = chainIds.some(id => [11155420, 80002, 421614, 84532, 11155111, 1014].includes(id))
      
      if (hasMainnetChains && !hasTestnetChains) {
        summary.recommendations.push('SDK 返回主網鏈而非測試網鏈，可能配置有問題')
      } else if (hasTestnetChains) {
        summary.recommendations.push('SDK 正確返回測試網鏈')
      }
    }
    
    console.log('📊 完整診斷總結:', summary)
    return summary
    
  } catch (error) {
    console.error('❌ 診斷失敗:', error)
    return { error: error.message }
  }
}

// ===== Swap 功能實現 =====

// 獲取支援的 swap 鏈和代幣
export async function getSwapSupportedChainsAndTokens() {
  try {
    if (!sdk.isInitialized()) throw new Error('Nexus SDK 未初始化')
    
    console.log('[useNexus] 獲取 swap 支援的鏈和代幣...')
    
    // 使用官方 API 獲取支援的來源鏈和代幣
    const supportedOptions = sdk.utils.getSwapSupportedChainsAndTokens()
    console.log('[useNexus] 支援的來源鏈和代幣:', supportedOptions)
    
    // 詳細檢查每個鏈和代幣的數據結構
    if (supportedOptions && Array.isArray(supportedOptions)) {
      supportedOptions.forEach((chain, index) => {
        console.log(`[useNexus] 鏈 ${index}:`, {
          id: chain.id,
          name: chain.name,
          logo: chain.logo,
          tokens: chain.tokens?.map(token => ({
            symbol: token.symbol,
            name: token.name,
            logo: token.logo,
            tokenAddress: token.tokenAddress,
            decimals: token.decimals
          }))
        })
      })
    }
    
    // 按照官方文檔，這返回的是來源鏈和代幣
    nexusState.swapSupportedChains = supportedOptions
    
    // 獲取目標代幣 - 使用官方 DESTINATION_SWAP_TOKENS
    await getDestinationSwapTokens()
    
    console.log('[useNexus] 來源鏈和代幣:', nexusState.swapSupportedChains)
    console.log('[useNexus] 目標代幣清單:', nexusState.destinationTokens)
    
    return nexusState.swapSupportedChains
    
  } catch (error) {
    console.error('[useNexus] 獲取 swap 支援失敗:', error)
    return []
  }
}

// 獲取目標代幣 - 使用官方 DESTINATION_SWAP_TOKENS
export async function getDestinationSwapTokens() {
  try {
    if (!sdk.isInitialized()) throw new Error('Nexus SDK 未初始化')
    
    console.log('[useNexus] 獲取目標代幣...')
    
    // 清空現有的目標代幣
    nexusState.destinationTokens.clear()
    
    // 獲取支援的鏈列表
    const supportedChains = sdk.utils.getSupportedChains()
    console.log('[useNexus] 支援的鏈:', supportedChains)
    
    // 使用官方 DESTINATION_SWAP_TOKENS
    const { DESTINATION_SWAP_TOKENS } = await import('@avail-project/nexus-core')
    
    // 為每個支援的鏈獲取建議的目標代幣
    if (supportedChains && Array.isArray(supportedChains)) {
      for (const chain of supportedChains) {
        const destinationTokens = DESTINATION_SWAP_TOKENS.get(chain.id)
        
        if (destinationTokens && Array.isArray(destinationTokens)) {
          // 為每個代幣添加鏈信息
          const tokensWithChainInfo = destinationTokens.map(token => ({
            ...token,
            chainId: chain.id,
            chainName: chain.name,
            chainLogo: chain.logo
          }))
          
          nexusState.destinationTokens.set(chain.id, tokensWithChainInfo)
          console.log(`[useNexus] 鏈 ${chain.id} (${chain.name}) 的目標代幣:`, tokensWithChainInfo)
        }
      }
    }
    
    console.log('[useNexus] 最終目標代幣清單:', nexusState.destinationTokens)
    
  } catch (error) {
    console.error('[useNexus] 獲取目標代幣失敗:', error)
  }
}

// EXACT_IN Swap - 指定輸入金額
export async function swapWithExactIn(params) {
  try {
    if (!sdk.isInitialized()) throw new Error('Nexus SDK 未初始化')
    
    const { fromChainId, fromTokenAddress, fromAmount, toChainId, toTokenAddress } = params
    
    console.log('[useNexus] 開始 EXACT_IN Swap:', params)
    
    nexusState.swapLoading = true
    nexusState.swapError = null
    nexusState.swapProgress.completed = false
    nexusState.swapProgress.steps = []
    
    // 按照官方文檔構建 ExactInSwapInput
    const swapWithExactInInput = {
      from: [
        {
          chainId: fromChainId,
          amount: BigInt(fromAmount),
          tokenAddress: fromTokenAddress
        }
      ],
      toChainId: toChainId,
      toTokenAddress: toTokenAddress
    }
    
    console.log('[useNexus] Swap 輸入參數:', swapWithExactInInput)
    
    // 設置進度追蹤
    setupSwapProgressTracking()
    
    // 存儲費用詳情
    let swapFees = null
    
    // 執行 swap - 完全按照官方文檔格式
    const swapWithExactInResult = await sdk.swapWithExactIn(swapWithExactInInput, {
      swapIntentHook: async (data) => {
        console.log('[useNexus] Swap Intent Hook:', data)
        
        const { intent, allow, reject, refresh } = data
        
        // 更新 UI 狀態以顯示 intent 給用戶
        nexusState.swapProgress.currentStep = 'intent_approval'
        
        // 顯示 intent 信息給用戶
        console.log('[useNexus] Intent 詳情:', intent)
        
        // 提取費用詳情
        if (intent && intent.fees) {
          swapFees = {
            totalFees: intent.fees.totalFees || '0',
            gasFees: intent.fees.gasFees || '0',
            bridgeFees: intent.fees.bridgeFees || '0',
            swapFees: intent.fees.swapFees || '0',
            currency: intent.fees.currency || 'USDC'
          }
          console.log('[useNexus] 費用詳情:', swapFees)
        }
        
        // 直接允許，因為我們在 GasExchange.vue 中控制 Modal 顯示
        allow()
      }
    })
    
    console.log('[useNexus] Swap 結果:', swapWithExactInResult)
    
    // 處理 swap 結果 - 按照官方文檔格式
    if (swapWithExactInResult.success) {
      console.log('✅ Swap successful!')
      console.log('Source transaction:', swapWithExactInResult.result.sourceSwaps)
      console.log('Destination transaction:', swapWithExactInResult.result.destinationSwap)
      console.log('Explorer URL:', swapWithExactInResult.result.explorerURL)
      console.log('Full result object:', swapWithExactInResult.result)
      console.log('Destination swap details:', swapWithExactInResult.result.destinationSwap)
      
      // 檢查是否有其他可用的 explorer URL
      let actualExplorerURL = swapWithExactInResult.result.explorerURL
      
      // 如果有 destination swap，優先使用其 explorer URL
      if (swapWithExactInResult.result.destinationSwap?.explorerURL) {
        actualExplorerURL = swapWithExactInResult.result.destinationSwap.explorerURL
        console.log('使用 destination swap explorer URL:', actualExplorerURL)
      } else if (swapWithExactInResult.result.destinationSwap?.txHash) { // 這邊是因為nexus的bug，有時候會沒有explorerURL，但是有txHash，所以我先用手動的方式去跳轉到scan上，應該是Avail那邊的問題啦
        // 如果沒有 explorerURL 但有 txHash，根據 chainId 構建 URL
        const chainId = swapWithExactInResult.result.destinationSwap.chainId
        const txHash = swapWithExactInResult.result.destinationSwap.txHash
        
        // 根據 chainId 構建對應的 explorer URL
        if (chainId === 42161) { // Arbitrum One
          actualExplorerURL = `https://arbiscan.io/tx/${txHash}`
        } else if (chainId === 1) { // Ethereum
          actualExplorerURL = `https://etherscan.io/tx/${txHash}`
        } else if (chainId === 137) { // Polygon
          actualExplorerURL = `https://polygonscan.com/tx/${txHash}`
        } else if (chainId === 10) { // Optimism
          actualExplorerURL = `https://optimistic.etherscan.io/tx/${txHash}`
        } else if (chainId === 8453) { // Base
          actualExplorerURL = `https://basescan.org/tx/${txHash}`
        } else if (chainId === 56) { // BSC
          actualExplorerURL = `https://bscscan.com/tx/${txHash}`
        } else if (chainId === 43114) { // Avalanche
          actualExplorerURL = `https://snowtrace.io/tx/${txHash}`
        } else {
          // 預設使用通用的 explorer
          actualExplorerURL = `https://explorer.nexus.availproject.org/intent/0`
        }
        
        console.log('構建 destination swap explorer URL:', actualExplorerURL)
      }
      
      // 如果有 source swap，也可以使用其 explorer URL
      if (swapWithExactInResult.result.sourceSwaps?.[0]?.explorerURL) {
        actualExplorerURL = swapWithExactInResult.result.sourceSwaps[0].explorerURL
        console.log('使用 source swap explorer URL:', actualExplorerURL)
      } else if (swapWithExactInResult.result.sourceSwaps?.[0]?.txHash) {
        // 如果沒有 explorerURL 但有 txHash，根據 chainId 構建 URL
        const chainId = swapWithExactInResult.result.sourceSwaps[0].chainId
        const txHash = swapWithExactInResult.result.sourceSwaps[0].txHash
        
        // 根據 chainId 構建對應的 explorer URL
        if (chainId === 42161) { // Arbitrum One
          actualExplorerURL = `https://arbiscan.io/tx/${txHash}`
        } else if (chainId === 1) { // Ethereum
          actualExplorerURL = `https://etherscan.io/tx/${txHash}`
        } else if (chainId === 137) { // Polygon
          actualExplorerURL = `https://polygonscan.com/tx/${txHash}`
        } else if (chainId === 10) { // Optimism
          actualExplorerURL = `https://optimistic.etherscan.io/tx/${txHash}`
        } else if (chainId === 8453) { // Base
          actualExplorerURL = `https://basescan.org/tx/${txHash}`
        } else if (chainId === 56) { // BSC
          actualExplorerURL = `https://bscscan.com/tx/${txHash}`
        } else if (chainId === 43114) { // Avalanche
          actualExplorerURL = `https://snowtrace.io/tx/${txHash}`
        }
        
        console.log('構建 source swap explorer URL:', actualExplorerURL)
      }
      
      nexusState.swapProgress.completed = true
      nexusState.swapProgress.sourceSwapHash = swapWithExactInResult.result?.sourceSwaps?.[0]?.hash
      nexusState.swapProgress.destinationSwapHash = swapWithExactInResult.result?.destinationSwap?.hash
      
      // 刷新餘額
      await refreshBalanceAfterSwap()
      
      return {
        success: true,
        result: swapWithExactInResult.result,
        sourceSwaps: swapWithExactInResult.result?.sourceSwaps,
        destinationSwap: swapWithExactInResult.result?.destinationSwap,
        explorerURL: actualExplorerURL, // 使用正確的 explorer URL
        fees: swapFees
      }
    } else {
      console.error('❌ Swap failed:', swapWithExactInResult.error)
      throw new Error(swapWithExactInResult.error || 'Swap 執行失敗')
    }
    
  } catch (error) {
    console.error('[useNexus] EXACT_IN Swap 失敗:', error)
    nexusState.swapError = error.message
    return {
      success: false,
      error: error.message
    }
  } finally {
    nexusState.swapLoading = false
  }
}

// EXACT_OUT Swap - 指定輸出金額
export async function swapWithExactOut(params) {
  try {
    if (!sdk.isInitialized()) throw new Error('Nexus SDK 未初始化')
    
    const { toChainId, toTokenAddress, toAmount } = params
    
    console.log('[useNexus] 開始 EXACT_OUT Swap:', params)
    
    nexusState.swapLoading = true
    nexusState.swapError = null
    nexusState.swapProgress.completed = false
    nexusState.swapProgress.steps = []
    
    // 按照官方文檔構建 ExactOutSwapInput
    const swapWithExactOutInput = {
      toChainId: toChainId,
      toTokenAddress: toTokenAddress,
      toAmount: BigInt(toAmount)
    }
    
    console.log('[useNexus] Swap 輸入參數:', swapWithExactOutInput)
    
    // 執行 swap - 完全按照官方文檔格式
    const swapWithExactOutResult = await sdk.swapWithExactOut(swapWithExactOutInput, {
      swapIntentHook: async (data) => {
        console.log('[useNexus] Swap Intent Hook:', data)
        
        const { intent, allow, reject, refresh } = data
        
        nexusState.swapProgress.currentStep = 'intent_approval'
        
        // 顯示 intent 信息給用戶
        console.log('[useNexus] Intent 詳情:', intent)
        
        // 直接允許 intent（按照官方文檔示例）
        allow()
      }
    })
    
    console.log('[useNexus] Swap 結果:', swapWithExactOutResult)
    
    // 處理 swap 結果 - 按照官方文檔格式
    if (swapWithExactOutResult.success) {
      console.log('✅ Swap successful!')
      console.log('Source transaction:', swapWithExactOutResult.result.sourceSwaps)
      console.log('Destination transaction:', swapWithExactOutResult.result.destinationSwap)
      console.log('Explorer URL:', swapWithExactOutResult.result.explorerURL)
      
      nexusState.swapProgress.completed = true
      nexusState.swapProgress.sourceSwapHash = swapWithExactOutResult.result?.sourceSwaps?.[0]?.hash
      nexusState.swapProgress.destinationSwapHash = swapWithExactOutResult.result?.destinationSwap?.hash
      
      // 刷新餘額
      await refreshBalanceAfterSwap()
      
      return {
        success: true,
        result: swapWithExactOutResult.result,
        sourceSwaps: swapWithExactOutResult.result?.sourceSwaps,
        destinationSwap: swapWithExactOutResult.result?.destinationSwap,
        explorerURL: swapWithExactOutResult.result?.explorerURL
      }
    } else {
      console.error('❌ Swap failed:', swapWithExactOutResult.error)
      throw new Error(swapWithExactOutResult.error || 'Swap 執行失敗')
    }
    
  } catch (error) {
    console.error('[useNexus] EXACT_OUT Swap 失敗:', error)
    nexusState.swapError = error.message
    return {
      success: false,
      error: error.message
    }
  } finally {
    nexusState.swapLoading = false
  }
}

// 設置 Swap 進度追蹤
export function setupSwapProgressTracking() {
  if (!sdk.isInitialized()) return
  
  console.log('[useNexus] 設置 Swap 進度追蹤...')
  
  // 監聽 swap 步驟事件 - 使用官方 NEXUS_EVENTS
  const unsubscribeSwapSteps = sdk.nexusEvents.on('SWAP_STEPS', (step) => {
    console.log('[useNexus] Swap 步驟:', step)
    
    nexusState.swapProgress.steps.push(step)
    nexusState.swapProgress.currentStep = step.type
    
    if (step.type === 'SOURCE_SWAP_HASH' && step.explorerURL) {
      console.log('[useNexus] 來源交易:', step.explorerURL)
    }
    
    if (step.type === 'DESTINATION_SWAP_HASH' && step.explorerURL) {
      console.log('[useNexus] 目標交易:', step.explorerURL)
    }
    
    if (step.type === 'SWAP_COMPLETE' && step.completed) {
      console.log('[useNexus] ✅ Swap 完成!')
    }
  })
  
  // 返回清理函數
  return () => {
    unsubscribeSwapSteps()
  }
}

// 刷新 swap 後的餘額
async function refreshBalanceAfterSwap() {
  try {
    // 刷新當前選擇的代幣餘額
    if (nexusState.selectedToken === 'USDC') {
      await fetchUnifiedUSDC()
    } else {
      await fetchUnifiedToken(nexusState.selectedToken)
    }
  } catch (error) {
    console.error('[useNexus] 刷新餘額失敗:', error)
  }
}

// 獲取目標鏈的建議代幣
export function getDestinationTokens(chainId) {
  return nexusState.destinationTokens.get(chainId) || []
}

// 格式化 swap 金額（處理 BigInt 和小數）
export function formatSwapAmount(amount, decimals) {
  try {
    if (typeof amount === 'bigint') {
      // 將 BigInt 轉換為字符串，然後格式化
      const divisor = BigInt(10 ** decimals)
      const quotient = amount / divisor
      const remainder = amount % divisor
      
      if (remainder === 0n) {
        return quotient.toString()
      } else {
        const remainderStr = remainder.toString().padStart(decimals, '0')
        const trimmedRemainder = remainderStr.replace(/0+$/, '')
        return trimmedRemainder ? `${quotient.toString()}.${trimmedRemainder}` : quotient.toString()
      }
    } else {
      return parseFloat(amount || '0').toFixed(decimals)
    }
  } catch (error) {
    console.error('[useNexus] 格式化金額失敗:', error)
    return '0'
  }
}

// 解析 swap 金額（將字符串轉換為 BigInt）
export function parseSwapAmount(amount, decimals) {
  try {
    const amountStr = amount.toString()
    const [whole, fraction = ''] = amountStr.split('.')
    const paddedFraction = fraction.padEnd(decimals, '0').slice(0, decimals)
    return BigInt(whole + paddedFraction)
  } catch (error) {
    console.error('[useNexus] 解析金額失敗:', error)
    return 0n
  }
}
