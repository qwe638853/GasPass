import { ref, computed, onMounted, onUnmounted } from 'vue'
import { walletService } from '../services/walletService.js'

const account = ref(null)
const chainId = ref(null)
const isConnected = computed(() => !!account.value)
const isArbitrum = computed(() => chainId.value === 421614) // Arbitrum Sepolia

let removeListener = null

export function useWeb3() {
  // 初始化時檢查錢包狀態
  onMounted(async () => {
    try {
      // 等待一下讓 Web3Modal 完全初始化
      await new Promise(resolve => setTimeout(resolve, 100))
      
      const state = await walletService.getState()
      console.log('Initial wallet state:', state)
      account.value = state.account
      chainId.value = state.chainId

      // 設置事件監聽
      removeListener = walletService.addEventListener((event, data) => {
        console.log('Wallet event received:', event, data)
        switch (event) {
          case 'connected':
          case 'accountChanged':
            console.log('Updating account state:', data)
            account.value = data.account
            chainId.value = data.chainId
            console.log('State updated - account:', account.value, 'chainId:', chainId.value)
            break
          case 'chainChanged':
            console.log('Chain changed:', data.chainId)
            chainId.value = data.chainId
            break
          case 'disconnected':
            console.log('Wallet disconnected')
            account.value = null
            chainId.value = null
            break
        }
      })
    } catch (error) {
      console.error('Failed to initialize wallet service:', error)
    }
  })

  onUnmounted(() => {
    if (removeListener) {
      removeListener()
    }
  })

  const connectWallet = async () => {
    try {
      console.log('Attempting to connect wallet...')
      const result = await walletService.connectWallet()
      console.log('Connect result:', result)
      
      if (result.success) {
        console.log('Wallet connection initiated successfully')
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

  const switchToArbitrum = async () => {
    try {
      const result = await walletService.switchToArbitrum()
      if (result.success) {
        const state = await walletService.getState()
        chainId.value = state.chainId
      }
      return result.success
    } catch (error) {
      console.error('Switch to Arbitrum failed:', error)
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
    isArbitrum,
    connectWallet,
    disconnectWallet,
    switchToArbitrum,
    getBalance,
    getUSDCBalance,
    formatAddress,
    isValidAddress
  }
}