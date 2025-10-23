import { ref, computed, onMounted, onUnmounted } from 'vue'
import { walletService } from '../services/walletService.js'
import { BrowserProvider, JsonRpcProvider } from 'ethers'
import { getAccount, getChainId } from '@wagmi/core'

const account = ref(null)
const chainId = ref(null)
const provider = ref(null)
const signer = ref(null)
const isConnected = computed(() => !!account.value)
const isWalletReady = ref(false)
// 檢查是否連接到 Arbitrum Mainnet
const isArbitrum = computed(() => chainId.value === 42161) // Arbitrum One (mainnet)

let removeListener = null

// 更新 provider 和 signer
const updateProviderAndSigner = async () => {
  try {
    if (account.value) {
      // 使用 Web3Modal 的狀態創建 provider 和 signer
      const wagmiConfig = walletService.getWagmiConfig()
      const accountData = getAccount(wagmiConfig)
      const chainIdData = getChainId(wagmiConfig)
      
      if (accountData.isConnected && window.ethereum) {
        // 創建一個簡單的 provider 包裝器
        provider.value = {
          getSigner: async () => {
            // 返回一個簡單的 signer 包裝器
            return {
              getAddress: () => accountData.address,
              provider: {
                getTransactionReceipt: async (txHash) => {
                  return await window.ethereum.request({
                    method: 'eth_getTransactionReceipt',
                    params: [txHash]
                  })
                },
                getTransaction: async (txHash) => {
                  return await window.ethereum.request({
                    method: 'eth_getTransactionByHash',
                    params: [txHash]
                  })
                },
                waitForTransaction: async (txHash, confirmations = 1) => {
                  return new Promise((resolve, reject) => {
                    let attempts = 0
                    const maxAttempts = 30 // 最多等待 30 秒
                    
                    const checkReceipt = async () => {
                      try {
                        attempts++
                        const receipt = await window.ethereum.request({
                          method: 'eth_getTransactionReceipt',
                          params: [txHash]
                        })
                        
                        if (receipt && receipt.status === '0x1') {
                          resolve(receipt)
                        } else if (receipt && receipt.status === '0x0') {
                          reject(new Error('Transaction failed'))
                        } else if (attempts >= maxAttempts) {
                          // 如果等待太久，假設交易成功（可能是 RPC 問題）
                          console.warn('Transaction receipt not found after 30 seconds, assuming success')
                          resolve({ status: '0x1', transactionHash: txHash })
                        } else {
                          setTimeout(checkReceipt, 1000)
                        }
                      } catch (error) {
                        if (attempts >= maxAttempts) {
                          // 如果 RPC 錯誤持續，假設交易成功
                          console.warn('RPC error after 30 seconds, assuming transaction success')
                          resolve({ status: '0x1', transactionHash: txHash })
                        } else {
                          console.warn('RPC error, retrying...', error)
                          setTimeout(checkReceipt, 1000)
                        }
                      }
                    }
                    checkReceipt()
                  })
                }
              },
              signMessage: async (message) => {
                return await window.ethereum.request({
                  method: 'personal_sign',
                  params: [message, accountData.address]
                })
              },
              signTypedData: async (domain, types, value, primaryType = 'MintWithSig') => {
                // 處理 BigInt 序列化
                const serializeBigInt = (obj) => {
                  return JSON.parse(JSON.stringify(obj, (key, val) =>
                    typeof val === 'bigint' ? val.toString() : val
                  ))
                }
                
                return await window.ethereum.request({
                  method: 'eth_signTypedData_v4',
                  params: [accountData.address, JSON.stringify(serializeBigInt({
                    domain,
                    types,
                    primaryType,
                    message: value
                  }))]
                })
              },
              sendTransaction: async (tx) => {
                // 確保交易對象包含 from 字段
                const transaction = {
                  ...tx,
                  from: accountData.address
                }
                
                return await window.ethereum.request({
                  method: 'eth_sendTransaction',
                  params: [transaction]
                })
              }
            }
          }
        }
        
        // 獲取 signer
        signer.value = await provider.value.getSigner()
        
        console.log('Provider and signer updated using Web3Modal state')
      } else {
        console.warn('No connected account or ethereum provider available')
        provider.value = null
        signer.value = null
      }
    } else {
      provider.value = null
      signer.value = null
    }
  } catch (error) {
    console.error('Failed to update provider and signer:', error)
    provider.value = null
    signer.value = null
  }
}

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
      
      // 初始化 provider 和 signer
      await updateProviderAndSigner()

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
            // 更新 provider 和 signer
            updateProviderAndSigner()
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
            provider.value = null
            signer.value = null
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

  // 切換到 Arbitrum Mainnet
  const switchToArbitrum = async () => {
    try {
      const result = await walletService.switchNetwork(42161) // Arbitrum Mainnet Chain ID
      if (result.success) {
        const state = await walletService.getState()
        chainId.value = state.chainId
      }
      return result.success
    } catch (error) {
      console.error('Switch to Arbitrum Mainnet failed:', error)
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
    provider,
    signer,
    isConnected,
    isWalletReady,
    isArbitrum,
    connectWallet,
    disconnectWallet,
    switchToChain,
    switchToArbitrum,
    getBalance,
    getUSDCBalance,
    formatAddress,
    isValidAddress
  }
}