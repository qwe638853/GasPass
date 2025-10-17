// 錢包和 Web3 相關服務
import { ethers } from 'ethers'

class WalletService {
  constructor() {
    this.provider = null
    this.signer = null
    this.account = null
    this.chainId = null
    this.isConnected = false
    this.listeners = []
  }

  // 連接錢包
  async connectWallet() {
    if (typeof window.ethereum === 'undefined') {
      throw new Error('請安裝 MetaMask 或其他 Web3 錢包')
    }

    try {
      // 請求連接
      await window.ethereum.request({ method: 'eth_requestAccounts' })
      
      this.provider = new ethers.BrowserProvider(window.ethereum)
      this.signer = await this.provider.getSigner()
      this.account = await this.signer.getAddress()
      
      const network = await this.provider.getNetwork()
      this.chainId = Number(network.chainId)
      this.isConnected = true
      
      // 設置事件監聽
      this.setupEventListeners()
      
      // 通知所有監聽器
      this.notifyListeners('connected', {
        account: this.account,
        chainId: this.chainId
      })
      
      return {
        success: true,
        account: this.account,
        chainId: this.chainId
      }
    } catch (error) {
      console.error('Failed to connect wallet:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  // 斷開錢包連接
  disconnectWallet() {
    this.provider = null
    this.signer = null
    this.account = null
    this.chainId = null
    this.isConnected = false
    
    this.notifyListeners('disconnected')
  }

  // 切換到 Arbitrum 網路
  async switchToArbitrum() {
    if (!window.ethereum) {
      throw new Error('錢包未連接')
    }

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0xA4B1' }] // Arbitrum One
      })
      
      // 更新鏈 ID
      const network = await this.provider.getNetwork()
      this.chainId = Number(network.chainId)
      
      this.notifyListeners('chainChanged', { chainId: this.chainId })
      
      return { success: true, chainId: this.chainId }
    } catch (error) {
      if (error.code === 4902) {
        // 鏈未添加，嘗試添加
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: '0xA4B1',
              chainName: 'Arbitrum One',
              nativeCurrency: {
                name: 'Ethereum',
                symbol: 'ETH',
                decimals: 18
              },
              rpcUrls: ['https://arb1.arbitrum.io/rpc'],
              blockExplorerUrls: ['https://arbiscan.io/']
            }]
          })
          
          // 再次嘗試切換
          return await this.switchToArbitrum()
        } catch (addError) {
          console.error('Failed to add Arbitrum network:', addError)
          return { success: false, error: addError.message }
        }
      }
      
      console.error('Failed to switch to Arbitrum:', error)
      return { success: false, error: error.message }
    }
  }

  // 獲取錢包餘額
  async getBalance(address = null) {
    if (!this.provider) {
      throw new Error('錢包未連接')
    }

    try {
      const targetAddress = address || this.account
      const balance = await this.provider.getBalance(targetAddress)
      return {
        eth: ethers.formatEther(balance),
        wei: balance.toString()
      }
    } catch (error) {
      console.error('Failed to get balance:', error)
      throw error
    }
  }

  // 獲取 USDC 餘額 (模擬)
  async getUSDCBalance(address = null) {
    // 在真實環境中，這裡會調用 USDC 合約
    // 現在返回模擬數據
    return '1000.00'
  }

  // 格式化地址
  formatAddress(address) {
    if (!address) return ''
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  // 驗證地址格式
  isValidAddress(address) {
    try {
      return ethers.isAddress(address)
    } catch {
      return false
    }
  }

  // 設置事件監聽器
  setupEventListeners() {
    if (!window.ethereum) return

    // 監聽帳戶變更
    window.ethereum.on('accountsChanged', (accounts) => {
      if (accounts.length === 0) {
        this.disconnectWallet()
      } else {
        this.account = accounts[0]
        this.notifyListeners('accountChanged', { account: this.account })
      }
    })

    // 監聽鏈變更
    window.ethereum.on('chainChanged', (chainId) => {
      this.chainId = parseInt(chainId, 16)
      this.notifyListeners('chainChanged', { chainId: this.chainId })
    })

    // 監聽連接狀態變更
    window.ethereum.on('disconnect', () => {
      this.disconnectWallet()
    })
  }

  // 添加事件監聽器
  addEventListener(callback) {
    this.listeners.push(callback)
    
    // 返回移除監聽器的函數
    return () => {
      const index = this.listeners.indexOf(callback)
      if (index > -1) {
        this.listeners.splice(index, 1)
      }
    }
  }

  // 通知所有監聽器
  notifyListeners(event, data = null) {
    this.listeners.forEach(callback => {
      try {
        callback(event, data)
      } catch (error) {
        console.error('Error in wallet event listener:', error)
      }
    })
  }

  // 簽名消息
  async signMessage(message) {
    if (!this.signer) {
      throw new Error('錢包未連接')
    }

    try {
      const signature = await this.signer.signMessage(message)
      return { success: true, signature }
    } catch (error) {
      console.error('Failed to sign message:', error)
      return { success: false, error: error.message }
    }
  }

  // 簽名類型化數據 (EIP-712)
  async signTypedData(domain, types, value) {
    if (!this.signer) {
      throw new Error('錢包未連接')
    }

    try {
      const signature = await this.signer.signTypedData(domain, types, value)
      return { success: true, signature }
    } catch (error) {
      console.error('Failed to sign typed data:', error)
      return { success: false, error: error.message }
    }
  }

  // 發送交易
  async sendTransaction(transaction) {
    if (!this.signer) {
      throw new Error('錢包未連接')
    }

    try {
      const tx = await this.signer.sendTransaction(transaction)
      return { 
        success: true, 
        hash: tx.hash,
        transaction: tx 
      }
    } catch (error) {
      console.error('Failed to send transaction:', error)
      return { success: false, error: error.message }
    }
  }

  // 獲取當前狀態
  getState() {
    return {
      isConnected: this.isConnected,
      account: this.account,
      chainId: this.chainId,
      isArbitrum: this.chainId === 42161
    }
  }
}

// 單例模式
export const walletService = new WalletService()
export default walletService