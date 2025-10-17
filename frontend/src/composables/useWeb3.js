import { ref, computed, onMounted, onUnmounted } from 'vue'
import { walletService } from '../services/walletService.js'

const account = ref(null)
const chainId = ref(null)
const isConnected = computed(() => !!account.value)
const isArbitrum = computed(() => chainId.value === 42161)

let removeListener = null

export function useWeb3() {
  // 初始化時檢查錢包狀態
  onMounted(() => {
    const state = walletService.getState()
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
        account.value = result.account
        chainId.value = result.chainId
      }
      return result.success
    } catch (error) {
      console.error('Connect wallet failed:', error)
      return false
    }
  }
  
  const disconnectWallet = () => {
    walletService.disconnectWallet()
    account.value = null
    chainId.value = null
  }
  
  const switchToArbitrum = async () => {
    try {
      const result = await walletService.switchToArbitrum()
      if (result.success) {
        chainId.value = result.chainId
      }
      return result.success
    } catch (error) {
      console.error('Switch to Arbitrum failed:', error)
      return false
    }
  }
  
  const getBalance = async () => {
    try {
      return await walletService.getBalance()
    } catch (error) {
      console.error('Get balance failed:', error)
      return null
    }
  }
  
  const getUSDCBalance = async () => {
    try {
      return await walletService.getUSDCBalance()
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