import { reactive, computed } from 'vue'
import { NexusSDK } from '@avail-project/nexus-core'
import { getAccount, getWalletClient } from '@wagmi/core'
import { walletService } from '../services/walletService.js'

// 創建 SDK 實例
const sdk = new NexusSDK({ network: 'testnet' })

// 響應式狀態
export const nexusState = reactive({
  initialized: false,
  usdcAsset: null, // 存放原始的 USDC asset 物件
  usdcBalances: null, // 存放正規化後的 USDC 餘額
  loading: false,
  error: null
})

// 錯誤處理
const handleError = (error, context = '') => {
  console.error(`Nexus ${context} error:`, error)
  nexusState.error = error.message || 'Unknown error'
  nexusState.loading = false
}

// 初始化 Nexus SDK
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

    console.log('[useNexus] Current chain ID from walletClient:', walletClient.chain.id)

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

    if (walletClient.chain?.id !== 421614 && window?.ethereum?.request) {
      console.log('[useNexus] Switching to Arbitrum Sepolia...')
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x66eee' }],
      })
    }

    if (!sdk.isInitialized()) {
      console.log('[useNexus] Initializing SDK with chain ID:', walletClient.chain.id)
      await sdk.initialize(provider)
      console.log('[useNexus] SDK initialized. Current chain ID:', walletClient.chain.id)
      nexusState.initialized = true
    }

    await fetchUnifiedUSDC()
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
    console.log('Normalized USDC balances:', JSON.parse(JSON.stringify(nexusState.usdcBalances)))

    return nexusState.usdcBalances
  } catch (error) {
    handleError(error, 'fetching USDC balance')
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

export async function refuelGasWithUSDC() {
  throw new Error('尚未開放「USDC 補 Gas」功能（bridgeAndExecute 未啟用）')
}

export async function estimateGasRefuelCost() {
  throw new Error('尚未開放估價功能（quoteOnly 未啟用）')
}

export function getChainInfo(chainId) {
  if (!nexusState.usdcBalances) return null
  const chainStr = String(chainId)
  return nexusState.usdcBalances[chainStr] || null
}

export function hasEnoughUSDC(amount) {
  if (!nexusState.usdcBalances) return false
  let total = 0
  for (const cid of Object.keys(nexusState.usdcBalances)) {
    const v = Number(nexusState.usdcBalances[cid].balance || '0')
    if (!Number.isNaN(v)) total += v
  }
  return total >= Number(amount || 0)
}
