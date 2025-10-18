import { ref, computed, onMounted, onUnmounted } from 'vue'
import { walletService } from '../services/walletService.js'

const account = ref(null)
const chainId = ref(null)
const isConnected = computed(() => !!account.value)
const isArbitrum = computed(() => chainId.value === 42161)

let removeListener = null

export function useWeb3() {
  // 初始化時檢查錢包狀態
  onMounted(async () => {
    try {
      const state = await walletService.getState()
      account.value = state.account
      chainId.value = state.chainId

      // 設置事件監聽
      removeListener = walletService.addEventListener((event, data) => {
        switch (event) {
          case 'connected':
          case 'accountChanged':
            account.value = data.account
            chainId.value = data.chainId
            break
          case 'chainChanged':
            chainId.value = data.chainId
            break
          case 'disconnected':
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
      const result = await walletService.connectWallet()
      if (result.success) {
        const state = await walletService.getState()
        account.value = state.account
        chainId.value = state.chainId
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