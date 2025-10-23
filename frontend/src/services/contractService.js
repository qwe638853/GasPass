// GasPass 合約服務
import { ethers, formatUnits, parseUnits, parseEther, formatEther } from 'ethers'
import { GAS_PASS_CONFIG } from '@/config/gasPassConfig.js'
import relayerService from './relayerService.js'

// 自定義 splitSignature 函數 (ethers v6 中已移除)
function splitSignature(signature) {
  const r = signature.slice(0, 66)
  const s = signature.slice(66, 130)
  const v = parseInt(signature.slice(130, 132), 16)
  return { r, s, v }
}

// 合約配置
const CONTRACT_CONFIG = {
  // Arbitrum Mainnet - 使用已部署的合約地址
  address: GAS_PASS_CONFIG.contractAddress,
  abi: [
    // ERC3525 基本函數
    'function totalSupply() view returns (uint256)',
    'function tokenByIndex(uint256) view returns (uint256)',
    'function ownerOf(uint256) view returns (address)',
    'function balanceOf(uint256) view returns (uint256)',
    'function ownerNonces(address) view returns (uint256)',
    
    // GasPass 特定函數
    'function mintWithSig(tuple(address to, uint256 value, tuple(address owner, address spender, uint256 value, uint256 deadline, uint8 v, bytes32 r, bytes32 s) permitData, address agent, uint256 nonce, uint256 deadline) typedData, bytes signature) external',
    'function depositWithSig(tuple(uint256 tokenId, uint256 amount, tuple(address owner, address spender, uint256 value, uint256 deadline, uint8 v, bytes32 r, bytes32 s) permitData, uint256 nonce, uint256 deadline) typedData, bytes signature) external',
    'function chainPolicies(uint256, uint256) view returns (uint128 gasAmount, uint128 threshold, address agent, uint256 lastRefueled)',
    'function setRefuelPolicy(uint256 tokenId, uint256 targetChainId, uint128 gasAmount, uint128 threshold, address agent) external',
    'function autoRefuel(uint256 tokenId, uint256 targetChainId) external',
    
    // 事件
    'event Minted(address indexed to, uint256 value, address indexed agent)',
    'event Deposited(address indexed owner, uint256 indexed tokenId, uint256 amount)',
    'event RefuelPolicySet(uint256 indexed tokenId, uint256 indexed targetChainId, uint128 gasAmount, uint128 threshold, address indexed agent)',
    'event AutoRefueled(uint256 indexed tokenId, uint256 indexed targetChainId, uint256 gasAmount, uint256 fee)'
  ]
}

// USDC 合約配置 (Arbitrum Mainnet)
const USDC_CONFIG = {
  address: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831', // Arbitrum Mainnet USDC
  abi: [
    'function balanceOf(address) view returns (uint256)',
    'function approve(address, uint256) returns (bool)',
    'function allowance(address, address) view returns (uint256)',
    'function permit(address owner, address spender, uint256 value, uint256 deadline, uint8 v, bytes32 r, bytes32 s) external',
    'function nonces(address) view returns (uint256)',
    'function name() view returns (string)',
    'function symbol() view returns (string)',
    'function decimals() view returns (uint8)'
  ]
}

class ContractService {
  constructor() {
    this.provider = null
    this.signer = null
    this.gasPassContract = null
    this.usdcContract = null
  }

  // 初始化合約連接
  async init(provider, signer) {
    this.provider = provider
    this.signer = signer
    
    // 使用 signer 的 provider 來讀取合約狀態
    this.gasPassContract = new ethers.Contract(CONTRACT_CONFIG.address, CONTRACT_CONFIG.abi, signer)
    this.usdcContract = new ethers.Contract(USDC_CONFIG.address, USDC_CONFIG.abi, signer)
    
    // 確保 provider 是正確的
    if (signer && signer.provider) {
      this.provider = signer.provider
    }
  }

  // 檢查用戶是否有 GasPass token
  async hasGasPassCard(walletAddress) {
    try {
      const totalSupply = await this.gasPassContract.totalSupply()
      
      // 遍歷所有 token 檢查擁有者
      for (let i = 0; i < totalSupply; i++) {
        const tokenId = await this.gasPassContract.tokenByIndex(i)
        const owner = await this.gasPassContract.ownerOf(tokenId)
        if (owner.toLowerCase() === walletAddress.toLowerCase()) {
          return true
        }
      }
      return false
    } catch (error) {
      console.error('Error checking GasPass cards:', error)
      return false
    }
  }

  // 獲取用戶的所有 GasPass token
  async getUserCards(walletAddress) {
    try {
      const cards = []
      const totalSupply = await this.gasPassContract.totalSupply()
      
      for (let i = 0; i < totalSupply; i++) {
        const tokenId = await this.gasPassContract.tokenByIndex(i)
        const owner = await this.gasPassContract.ownerOf(tokenId)
        
        if (owner.toLowerCase() === walletAddress.toLowerCase()) {
          const balance = await this.gasPassContract.balanceOf(tokenId)
          const balanceInUSDC = ethers.utils.formatUnits(balance, 6) // USDC 有 6 位小數
          
          cards.push({
            tokenId: tokenId.toString(),
            owner: owner,
            balance: balanceInUSDC,
            createdAt: new Date().toISOString(),
            lastUpdate: new Date().toLocaleString('zh-TW')
          })
        }
      }
      
      return cards
    } catch (error) {
      console.error('Error getting user cards:', error)
      return []
    }
  }

  // 獲取 USDC 餘額
  async getUSDCBalance(walletAddress) {
    try {
      const balance = await this.usdcContract.balanceOf(walletAddress)
      return formatUnits(balance, 6)
    } catch (error) {
      console.error('Error getting USDC balance:', error)
      // 在測試網上，如果 USDC 合約不完整，返回模擬餘額
      console.warn('USDC contract not available, returning mock balance for testing')
      return '1000' // 返回模擬的 1000 USDC 餘額
    }
  }

  // 獲取 USDC nonce
  async getUSDCNonce(walletAddress) {
    try {
      // 確保 provider 存在
      if (!this.provider) {
        throw new Error('Provider not initialized')
      }
      
      // 使用 provider 而不是 signer 來讀取 nonce
      const usdcContract = new ethers.Contract(USDC_CONFIG.address, USDC_CONFIG.abi, this.provider)
      const nonce = await usdcContract.nonces(walletAddress)
      console.log('USDC nonce retrieved:', nonce.toString())
      return nonce
    } catch (error) {
      console.error('Error getting USDC nonce:', error)
      // 如果 USDC 合約不支持 nonces，我們可以嘗試其他方法
      // 或者直接返回 0，讓用戶手動 approve
      console.warn('USDC contract may not support ERC-2612 permit, falling back to manual approval')
      return 0n
    }
  }

  // 獲取用戶的 nonce (從 GasPass 合約讀取)
  async getUserNonce(walletAddress) {
    try {
      if (!this.provider) {
        throw new Error('Provider not initialized')
      }
      
      // 從 GasPass 合約讀取 ownerNonces
      const gasPassContract = new ethers.Contract(CONTRACT_CONFIG.address, CONTRACT_CONFIG.abi, this.provider)
      const nonce = await gasPassContract.ownerNonces(walletAddress)
      console.log('GasPass 合約 nonce 獲取成功:', nonce.toString())
      return nonce
    } catch (error) {
      console.error('Error getting GasPass nonce:', error)
      console.warn('無法從 GasPass 合約讀取 nonce，使用 0 作為 fallback')
      // 如果獲取失敗，返回 0
      return 0n
    }
  }

  // 創建 USDC permit 簽名
  async createUSDCPermit(owner, spender, value, deadline) {
    try {
      const domain = {
        name: 'USD Coin',
        version: '2',
        chainId: 42161, // Arbitrum Mainnet
        verifyingContract: USDC_CONFIG.address
      }

      const types = {
        Permit: [
          { name: 'owner', type: 'address' },
          { name: 'spender', type: 'address' },
          { name: 'value', type: 'uint256' },
          { name: 'nonce', type: 'uint256' },
          { name: 'deadline', type: 'uint256' }
        ]
      }

      const nonce = await this.getUSDCNonce(owner)
      const valueWei = parseUnits(value, 6)

      const value_data = {
        owner: owner,
        spender: spender,
        value: valueWei,
        nonce: nonce,
        deadline: deadline
      }

      const signature = await this.signer.signTypedData(domain, types, value_data, 'Permit')
      const sig = splitSignature(signature)

      return {
        owner: owner,
        spender: spender,
        value: valueWei,
        deadline: deadline,
        v: sig.v,
        r: sig.r.startsWith('0x') ? sig.r : '0x' + sig.r,
        s: sig.s.startsWith('0x') ? sig.s : '0x' + sig.s
      }
    } catch (error) {
      console.error('Error creating USDC permit:', error)
      throw error
    }
  }

  // Mint GasPass token (使用 Relayer)
  async mintGasPassCard(params) {
    try {
      const { to, amount, agent } = params
      
      console.log('🚀 開始鑄造 GasPass 儲值卡...')
      console.log('參數:', { to, amount, agent })
      
      const usdcAmount = parseUnits(amount, 6) // USDC 有 6 位小數
      const deadline = Math.floor(Date.now() / 1000) + 3600
      
      // 獲取用戶的實際 nonce
      const nonce = await this.getUserNonce(to)
      console.log('用戶 nonce:', nonce.toString())
      
      // 創建 USDC permit 簽名
      console.log('📝 創建 USDC permit 簽名...')
      const permitData = await this.createUSDCPermit(to, CONTRACT_CONFIG.address, amount, deadline)
      
      // 創建 EIP-712 簽名數據
      const domain = {
        name: 'GasPass',
        version: '1',
        chainId: 42161, // Arbitrum Mainnet
        verifyingContract: CONTRACT_CONFIG.address
      }

      const types = {
        MintWithSig: [
          { name: 'to', type: 'address' },
          { name: 'value', type: 'uint256' },
          { name: 'permitData', type: 'StablecoinPermitData' },
          { name: 'agent', type: 'address' },
          { name: 'nonce', type: 'uint256' },
          { name: 'deadline', type: 'uint256' }
        ],
        StablecoinPermitData: [
          { name: 'owner', type: 'address' },
          { name: 'spender', type: 'address' },
          { name: 'value', type: 'uint256' },
          { name: 'deadline', type: 'uint256' },
          { name: 'v', type: 'uint8' },
          { name: 'r', type: 'bytes32' },
          { name: 's', type: 'bytes32' }
        ]
      }

      const typedData = {
        to: to,
        value: usdcAmount.toString(),
        permitData: {
          owner: permitData.owner,
          spender: permitData.spender,
          value: permitData.value.toString(),
          deadline: permitData.deadline.toString(),
          v: permitData.v,
          r: permitData.r,
          s: permitData.s
        },
        agent: agent || to,
        nonce: nonce.toString(),
        deadline: deadline.toString()
      }

      console.log('✍️ 簽署 EIP-712 數據...')
      console.log('🔍 typedData 內容:', JSON.stringify(typedData, null, 2))
      const signature = await this.signer.signTypedData(domain, types, typedData, 'MintWithSig')
      
      console.log('📤 通過 Relayer 發送交易...')
      console.log('🔍 發送給後端的數據:', { typedData, signature })
      const result = await relayerService.relayMint(typedData, signature)
      
      console.log('✅ 鑄造成功!', result)
      return {
        success: true,
        txHash: result.txHash,
        tokenId: result.tokenId,
        receipt: result.receipt
      }
    } catch (error) {
      console.error('❌ 鑄造失敗:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  // Deposit to GasPass token (使用 Relayer)
  async depositToCard(params) {
    try {
      const { tokenId, amount } = params
      
      console.log('💰 開始為儲值卡充值...')
      console.log('參數:', { tokenId, amount })
      
      const usdcAmount = parseUnits(amount, 6) // USDC 有 6 位小數
      const deadline = Math.floor(Date.now() / 1000) + 3600
      
      // 獲取用戶的實際 nonce
      const userAddress = await this.signer.getAddress()
      const nonce = await this.getUserNonce(userAddress)
      console.log('用戶 nonce:', nonce.toString())
      
      // 創建 USDC permit 簽名
      console.log('📝 創建 USDC permit 簽名...')
      const permitData = await this.createUSDCPermit(userAddress, CONTRACT_CONFIG.address, amount, deadline)
      
      // 創建 EIP-712 簽名數據
      const domain = {
        name: 'GasPass',
        version: '1',
        chainId: 42161, // Arbitrum Mainnet
        verifyingContract: CONTRACT_CONFIG.address
      }

      const types = {
        DepositWithSig: [
          { name: 'tokenId', type: 'uint256' },
          { name: 'amount', type: 'uint256' },
          { name: 'permitData', type: 'StablecoinPermitData' },
          { name: 'nonce', type: 'uint256' },
          { name: 'deadline', type: 'uint256' }
        ],
        StablecoinPermitData: [
          { name: 'owner', type: 'address' },
          { name: 'spender', type: 'address' },
          { name: 'value', type: 'uint256' },
          { name: 'deadline', type: 'uint256' },
          { name: 'v', type: 'uint8' },
          { name: 'r', type: 'bytes32' },
          { name: 's', type: 'bytes32' }
        ]
      }

      const typedData = {
        tokenId: tokenId.toString(),
        amount: usdcAmount.toString(),
        permitData: {
          owner: permitData.owner,
          spender: permitData.spender,
          value: permitData.value.toString(),
          deadline: permitData.deadline.toString(),
          v: permitData.v,
          r: permitData.r,
          s: permitData.s
        },
        nonce: nonce.toString(),
        deadline: deadline.toString()
      }

      console.log('✍️ 簽署 EIP-712 數據...')
      const signature = await this.signer.signTypedData(domain, types, typedData, 'DepositWithSig')
      
      console.log('📤 通過 Relayer 發送交易...')
      const result = await relayerService.relayDeposit(typedData, signature)
      
      console.log('✅ 充值成功!', result)
      return {
        success: true,
        txHash: result.txHash,
        receipt: result.receipt
      }
    } catch (error) {
      console.error('❌ 充值失敗:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  // 設置 refuel policy
  async setRefuelPolicy(params) {
    try {
      const { tokenId, targetChainId, gasAmount, threshold, agent } = params
      
      const tx = await this.gasPassContract.setRefuelPolicy(
        tokenId,
        targetChainId,
        parseUnits(gasAmount, 6), // gasAmount in USDC
        parseEther(threshold), // threshold in ETH
        agent
      )
      
      const receipt = await tx.wait()
      
      return {
        success: true,
        txHash: tx.hash,
        receipt: receipt
      }
    } catch (error) {
      console.error('Set refuel policy failed:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  // 獲取 refuel policies
  async getRefuelPolicies(tokenId) {
    try {
      const policies = []
      const chainIds = [1, 42161, 10, 137, 8453] // 主要鏈 ID
      
      for (const chainId of chainIds) {
        const policy = await this.gasPassContract.chainPolicies(tokenId, chainId)
        if (policy.gasAmount > 0) {
          policies.push({
            tokenId: tokenId,
            chainId: chainId,
            gasAmount: formatUnits(policy.gasAmount, 6),
            threshold: formatEther(policy.threshold),
            agent: policy.agent,
            lastRefueled: policy.lastRefueled.toString()
          })
        }
      }
      
      return policies
    } catch (error) {
      console.error('Error getting refuel policies:', error)
      return []
    }
  }
}

// 單例模式
export const contractService = new ContractService()
export default contractService
