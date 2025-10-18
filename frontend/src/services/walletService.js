// 錢包和 Web3 相關服務 - 使用 wagmi core
import { getAccount, getChainId, watchAccount, watchChainId, switchChain, disconnect } from '@wagmi/core'
import { createWeb3Modal, defaultWagmiConfig } from '@web3modal/wagmi'
import { arbitrum, base, polygon, mainnet, optimism, avalanche } from 'viem/chains'

class WalletService {
  constructor() {
    this.projectId = '255a4cd46f3cd791463a56bb6c43d7bc' // 您的 WalletConnect Project ID
    this.metadata = {
      name: 'GasPass',
      description: '基於 ERC-3525 的跨鏈 Gas 管理平台',
      url: 'https://gaspass.com',
      icons: ['https://gaspass.com/icon.png']
    }
    this.chains = [mainnet, arbitrum, polygon, base, optimism, avalanche]
    this.wagmiConfig = null
    this.modal = null
    this.isInitialized = false
    this.listeners = []
    
    this.initializeWeb3Modal()
  }

  // 初始化 Web3Modal
  async initializeWeb3Modal() {
    try {
      this.wagmiConfig = defaultWagmiConfig({ 
        chains: this.chains, 
        projectId: this.projectId, 
        metadata: this.metadata 
      })
      
      this.modal = createWeb3Modal({ 
        wagmiConfig: this.wagmiConfig, 
        projectId: this.projectId, 
        chains: this.chains 
      })
      
      this.isInitialized = true
      this.setupEventListeners()
    } catch (error) {
      console.error('Failed to initialize Web3Modal:', error)
    }
  }

  // 設置事件監聽
  async setupEventListeners() {
    if (!this.isInitialized) return
    
    try {
      // 監聽帳戶變化
      watchAccount(this.wagmiConfig, {
        onChange: (account) => {
          this.notifyListeners('accountChanged', {
            account: account.address,
            isConnected: account.isConnected,
            chainId: account.chainId
          })
        }
      })

      // 監聽鏈變化
      watchChainId(this.wagmiConfig, {
        onChange: (chainId) => {
          this.notifyListeners('chainChanged', { chainId })
        }
      })
    } catch (error) {
      console.error('Failed to setup event listeners:', error)
    }
  }

  // 連接錢包
  async connectWallet() {
    try {
      if (!this.isInitialized) {
        await this.initializeWeb3Modal()
      }
      await this.modal.open()
      return { success: true }
    } catch (error) {
      console.error('Connect wallet failed:', error)
      return { 
        success: false, 
        error: error.message 
      }
    }
  }

  // 斷開連接
  async disconnectWallet() {
    try {
      await disconnect(this.wagmiConfig)
      this.notifyListeners('disconnected')
      return { success: true }
    } catch (error) {
      console.error('Disconnect wallet failed:', error)
      return { 
        success: false, 
        error: error.message 
      }
    }
  }

  // 切換網絡
  async switchNetwork(chainId) {
    try {
      await switchChain(this.wagmiConfig, { chainId })
      return { success: true }
    } catch (error) {
      console.error('Switch network failed:', error)
      return { 
        success: false, 
        error: error.message 
      }
    }
  }

  // 切換到 Arbitrum
  async switchToArbitrum() {
    return await this.switchNetwork(42161)
  }

  // 獲取當前帳戶
  async getAccount() {
    try {
      if (!this.isInitialized) {
        await this.initializeWeb3Modal()
      }
      const account = getAccount(this.wagmiConfig)
      return {
        account: account.address,
        isConnected: account.isConnected,
        chainId: account.chainId
      }
    } catch (error) {
      return {
        account: null,
        isConnected: false,
        chainId: null
      }
    }
  }

  // 獲取當前網絡
  async getNetwork() {
    try {
      if (!this.isInitialized) {
        await this.initializeWeb3Modal()
      }
      const chainId = getChainId(this.wagmiConfig)
      const chain = this.chains?.find(c => c.id === chainId)
      return {
        chainId: chainId,
        chainName: chain?.name ?? null
      }
    } catch (error) {
      return {
        chainId: null,
        chainName: null
      }
    }
  }

  // 獲取 ETH 餘額
  async getBalance() {
    try {
      const account = await this.getAccount()
      if (!account.isConnected) {
        return { success: false, error: 'Wallet not connected' }
      }

      // 這裡應該使用 viem 來獲取餘額
      // 為了簡化，我們返回模擬數據
      return {
        success: true,
        balance: '1.234'
      }
    } catch (error) {
      console.error('Get balance failed:', error)
      return { 
        success: false, 
        error: error.message 
      }
    }
  }

  // 獲取 USDC 餘額
  async getUSDCBalance() {
    try {
      const account = await this.getAccount()
      if (!account.isConnected) {
        return { success: false, error: 'Wallet not connected' }
      }

      // 這裡應該使用 viem 來獲取 USDC 餘額
      // 為了簡化，我們返回模擬數據
      const balance = localStorage.getItem('usdcBalance') || '0.00'
      return {
        success: true,
        balance: balance
      }
    } catch (error) {
      console.error('Get USDC balance failed:', error)
      return { 
        success: false, 
        error: error.message 
      }
    }
  }

  // 格式化地址
  formatAddress(address) {
    if (!address) return ''
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  // 驗證地址
  isValidAddress(address) {
    return /^0x[a-fA-F0-9]{40}$/.test(address)
  }

  // 添加事件監聽器
  addEventListener(callback) {
    this.listeners.push(callback)
    return () => {
      const index = this.listeners.indexOf(callback)
      if (index > -1) {
        this.listeners.splice(index, 1)
      }
    }
  }

  // 通知所有監聽器
  notifyListeners(event, data = null) {
    this.listeners.forEach(listener => {
      try {
        listener(event, data)
      } catch (error) {
        console.error('Listener error:', error)
      }
    })
  }

  // 獲取當前狀態
  async getState() {
    try {
      const account = await this.getAccount()
      const network = await this.getNetwork()
      
      return {
        account: account.account,
        isConnected: account.isConnected,
        chainId: account.chainId || network.chainId,
        chainName: network.chainName
      }
    } catch (error) {
      return {
        account: null,
        isConnected: false,
        chainId: null,
        chainName: null
      }
    }
  }

  // 簽名消息
  async signMessage(message) {
    try {
      const account = await this.getAccount()
      if (!account.isConnected) {
        throw new Error('Wallet not connected')
      }

      // 使用 wagmi 的簽名功能
      const { signMessage: wagmiSignMessage } = await import('@wagmi/core')
      const signature = await wagmiSignMessage(this.wagmiConfig, { message })
      return {
        success: true,
        signature: signature
      }
    } catch (error) {
      console.error('Sign message failed:', error)
      return { 
        success: false, 
        error: error.message 
      }
    }
  }

  // 發送交易
  async sendTransaction(transaction) {
    try {
      const account = await this.getAccount()
      if (!account.isConnected) {
        throw new Error('Wallet not connected')
      }

      // 使用 wagmi 的發送交易功能
      const { sendTransaction: wagmiSendTransaction } = await import('@wagmi/core')
      const hash = await wagmiSendTransaction(this.wagmiConfig, transaction)
      return {
        success: true,
        hash: hash
      }
    } catch (error) {
      console.error('Send transaction failed:', error)
      return { 
        success: false, 
        error: error.message 
      }
    }
  }
}

// 創建單例實例
export const walletService = new WalletService()