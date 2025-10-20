// 錢包和 Web3 相關服務 - 使用 wagmi core
import { getAccount, getChainId, watchAccount, watchChainId, switchChain, disconnect } from '@wagmi/core'
import { createWeb3Modal, defaultWagmiConfig } from '@web3modal/wagmi'
import { arbitrumSepolia, baseSepolia, polygonAmoy, sepolia, optimismSepolia } from 'viem/chains'

class WalletService {
  constructor() {
    this.projectId = '255a4cd46f3cd791463a56bb6c43d7bc' // 您的 WalletConnect Project ID
    this.metadata = {
      name: 'GasPass',
      description: '基於 ERC-3525 的跨鏈 Gas 管理平台',
      url: window.location.origin, // 使用當前頁面的 URL
      icons: ['https://gaspass.com/icon.png']
    }
    this.chains = [arbitrumSepolia, sepolia, baseSepolia, optimismSepolia, polygonAmoy]
    this.wagmiConfig = null
    this.modal = null
    this.isInitialized = false
    this.listeners = []
    this.initializationPromise = null // 防止重複初始化
    
    this.initializeWeb3Modal()
  }

  // 初始化 Web3Modal
  async initializeWeb3Modal() {
    // 防止重複初始化
    if (this.initializationPromise) {
      return this.initializationPromise
    }
    
    this.initializationPromise = this._doInitialize()
    return this.initializationPromise
  }
  
  async _doInitialize() {
    try {
      // 檢查是否已經初始化
      if (this.isInitialized) {
        console.log('Web3Modal already initialized')
        return
      }
      
      console.log('Initializing Web3Modal...')
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
      console.log('Web3Modal initialized successfully')
      
      // 延遲設置事件監聽器，確保 wagmi 完全初始化
      setTimeout(() => {
        this.setupEventListeners()
      }, 100)
    } catch (error) {
      console.error('Failed to initialize Web3Modal:', error)
      this.initializationPromise = null // 重置，允許重試
    }
  }

  // 設置事件監聽
  async setupEventListeners() {
    if (!this.isInitialized) return
    
    try {
      console.log('Setting up event listeners...')
      
      // 監聽帳戶變化
      watchAccount(this.wagmiConfig, {
        onChange: (account) => {
          console.log('Account changed:', account)
          console.log('[walletService] Current chain ID:', account.chainId)
          
          if (account.isConnected && account.address) {
            // 連接成功
            this.notifyListeners('connected', {
              account: account.address,
              isConnected: account.isConnected,
              chainId: account.chainId
            })
          } else if (!account.isConnected) {
            // 斷開連接
            this.notifyListeners('disconnected')
          } else {
            // 其他帳戶變化
            this.notifyListeners('accountChanged', {
              account: account.address,
              isConnected: account.isConnected,
              chainId: account.chainId
            })
          }
        }
      })

      // 監聽鏈變化
      watchChainId(this.wagmiConfig, {
        onChange: (chainId) => {
          console.log('Chain changed:', chainId)
          console.log('[walletService] Switched to chain ID:', chainId)
          this.notifyListeners('chainChanged', { chainId })
        }
      })
      
      console.log('Event listeners setup complete')
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
      
      console.log('Opening Web3Modal...')
      // 打開 Web3Modal
      await this.modal.open()
      
      // 不等待連接完成，讓事件監聽器處理狀態更新
      // 用戶選擇錢包後，事件監聽器會自動觸發
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

  // 切換到 Arbitrum Sepolia (測試網)
  async switchToArbitrum() {
    return await this.switchNetwork(421614) // Arbitrum Sepolia
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