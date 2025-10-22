import { ref, computed, onMounted, onUnmounted } from 'vue'
import { walletService } from '../services/walletService.js'

const account = ref(null)
const chainId = ref(null)
const isConnected = computed(() => !!account.value)
const isWalletReady = ref(false)
// 主網環境不再特定標記測試網
const isArbitrum = computed(() => chainId.value === 42161) // Arbitrum One (mainnet)

let removeListener = null

export function useWeb3() {
  // 初始化時檢查錢包狀態
  onMounted(async () => {
    try {
      // 等待一下讓 Web3Modal 完全初始化
      await new Promise(resolve => setTimeout(resolve, 100))
      
      // 嘗試無 UI 重連（可還原 WalletConnect/Injected 連線）
      try { await walletService.attemptReconnect() } catch {}
      const state = await walletService.getState()
      // 移除冗長的 console，保留關鍵資訊
      console.log('[useWeb3] Initial wallet chain:', state.chainId)
      account.value = state.account
      chainId.value = state.chainId

      // 設置事件監聽
      removeListener = walletService.addEventListener((event, data) => {
        // 精簡事件日誌
        // console.log('Wallet event:', event, data)
        switch (event) {
          case 'connected':
          case 'accountChanged':
            // console.log('Updating account state:', data)
            account.value = data.account
            chainId.value = data.chainId
            // console.log('State updated - account:', account.value, 'chainId:', chainId.value)
            break
          case 'chainChanged':
            console.log('[useWeb3] Chain changed:', data.chainId)
            chainId.value = data.chainId
            break
          case 'disconnected':
            console.log('Wallet disconnected')
            account.value = null
            chainId.value = null
            break
        }
      })
      isWalletReady.value = true
    } catch (error) {
      console.error('Failed to initialize wallet service:', error)
      isWalletReady.value = true
    }
  })

  onUnmounted(() => {
    if (removeListener) {
      removeListener()
    }
  })

  const connectWallet = async () => {
    try {
      // console.log('Attempting to connect wallet...')
      const result = await walletService.connectWallet()
      // console.log('Connect result:', result)
      
      if (result.success) {
        // console.log('Wallet connection initiated successfully')
        // 狀態會通過事件監聽器自動更新，不需要手動檢查
      }
      return result.success
    } catch (error) {
      console.error('Connect wallet failed:', error)
      return false
    }
  }

  const disconnectWallet = async () => {
    try {
      await walletService.disconnectWallet()
      account.value = null
      chainId.value = null
    } catch (error) {
      console.error('Disconnect wallet failed:', error)
    }
  }

  // 提供通用切換到指定主網鏈的方法
  const switchToChain = async (id) => {
    try {
      const result = await walletService.switchNetwork(id)
      if (result.success) {
        const state = await walletService.getState()
        chainId.value = state.chainId
      }
      return result.success
    } catch (error) {
      console.error('Switch network failed:', error)
      return false
    }
  }

  const getBalance = async () => {
    try {
      const result = await walletService.getBalance()
      return result.success ? result.balance : null
    } catch (error) {
      console.error('Get balance failed:', error)
      return null
    }
  }

  const getUSDCBalance = async () => {
    try {
      const result = await walletService.getUSDCBalance()
      return result.success ? result.balance : '0.00'
    } catch (error) {
      console.error('Get USDC balance failed:', error)
      return '0.00'
    }
  }

  const formatAddress = (address) => {
    return walletService.formatAddress(address)
  }

  const isValidAddress = (address) => {
    return walletService.isValidAddress(address)
  }

  return {
    account,
    chainId,
    isConnected,
    isWalletReady,
    isArbitrum,
    connectWallet,
    disconnectWallet,
    switchToChain,
    getBalance,
    getUSDCBalance,
    formatAddress,
    isValidAddress
  }
}