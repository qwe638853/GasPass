// GasPass 合約服務
import { ethers, formatUnits, parseUnits, parseEther, formatEther } from 'ethers'
import { GAS_PASS_CONFIG } from '@/config/gasPassConfig.js'
import relayerService from './relayerService.js'
import { getStoredPkpEthAddress } from './vincentAuthService.js'
import { markRaw } from 'vue'

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
    'function nonces(uint256) view returns (uint256)',
    
    // GasPass 特定函數
    'function mintWithSig(tuple(address to, uint256 value, tuple(address owner, address spender, uint256 value, uint256 deadline, uint8 v, bytes32 r, bytes32 s) permitData, address agent, uint256 nonce, uint256 deadline) typedData, bytes signature) external',
    'function depositWithSig(tuple(uint256 tokenId, uint256 amount, tuple(address owner, address spender, uint256 value, uint256 deadline, uint8 v, bytes32 r, bytes32 s) permitData, uint256 nonce, uint256 deadline) typedData, bytes signature) external',
    'function setRefuelPolicyWithSig(tuple(uint256 tokenId, uint256 targetChainId, uint128 gasAmount, uint128 threshold, address agent, uint256 nonce, uint256 deadline) policy, bytes signature) external',
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
    this.ethProvider = null  // 真正的 MetaMask provider
    this.signer = null
    this.gasPassContract = null
    this.usdcContract = null
  }

  // 1) 拿到 "真正" 的 MetaMask provider
  getMetaMaskProvider() {
    const injected = window.ethereum
    if (!injected) throw new Error("找不到注入錢包 (window.ethereum)")
    // 如有多個注入，挑 MetaMask 那個
    const metamask = injected.providers?.find?.(p => p.isMetaMask) ?? injected
    return new ethers.BrowserProvider(metamask)
  }

  async initWallet() {
    const provider = this.getMetaMaskProvider()
    await provider.send("eth_requestAccounts", [])
    const signer = await provider.getSigner()

    // 防止 Vue 把原型包壞
    this.ethProvider = markRaw(provider)
    this.signer = markRaw(signer)
    this.provider = this.ethProvider  // 設置 provider 以保持向後兼容

    // 確認是 EOA（你現在合約只支援 ECDSA）
    const owner = await this.signer.getAddress()
    const code = await this.ethProvider.getCode(owner)
    if (code !== "0x") {
      throw new Error("當前帳戶是合約錢包（非 EOA）。請切回 MetaMask EOA，或等合約支援 EIP-1271。")
    }
    return owner
  }

  // 2) 統一讀寫來源 - 所有合約實例都使用相同的 provider
  getContracts() {
    if (!this.ethProvider || !this.signer) {
      throw new Error('Provider or signer not initialized')
    }
    
    console.log('🔍 創建合約實例，統一使用 ethProvider')
    console.log('🔍 Provider 類型:', this.ethProvider.constructor?.name)
    
    // 統一使用 ethProvider，因為它已經確保是有效的 ethers provider
    const gaspassRead = new ethers.Contract(CONTRACT_CONFIG.address, CONTRACT_CONFIG.abi, this.ethProvider)
    const gaspassWrite = new ethers.Contract(CONTRACT_CONFIG.address, CONTRACT_CONFIG.abi, this.ethProvider)
    const usdcRead = new ethers.Contract(USDC_CONFIG.address, USDC_CONFIG.abi, this.ethProvider)
    
    return { gaspassRead, gaspassWrite, usdcRead }
  }

  // 檢查 provider 是否為有效的 ethers provider
  isValidEthersProvider(provider) {
    return provider && 
           typeof provider.getCode === 'function' && 
           typeof provider.getSigner === 'function' &&
           provider.constructor?.name === 'BrowserProvider'
  }

  // 創建 fallback provider
  async createFallbackProvider() {
    if (!window.ethereum) {
      throw new Error('No ethereum provider found')
    }
    const provider = new ethers.BrowserProvider(window.ethereum)
    const signer = await provider.getSigner()
    console.log('🔍 創建 fallback ethers BrowserProvider')
    return { provider, signer }
  }

  // 初始化合約連接（保持向後兼容）
  async init(provider, signer) {
    // 優先使用傳入的 provider，但需要驗證其有效性
    if (this.isValidEthersProvider(provider) && signer) {
      this.ethProvider = provider
      this.signer = signer
      this.provider = this.ethProvider  // 設置 provider 以保持向後兼容
      console.log('🔍 ContractService 使用傳入的有效 ethers provider')
      console.log('🔍 Provider 類型:', provider.constructor?.name)
      console.log('🔍 Signer 類型:', signer.constructor?.name)
    } else {
      // Fallback: 創建真正的 ethers provider
      console.log('🔍 傳入的 provider 無效，使用 fallback 邏輯')
      const { provider: fallbackProvider, signer: fallbackSigner } = await this.createFallbackProvider()
      this.ethProvider = fallbackProvider
      this.signer = fallbackSigner
      this.provider = this.ethProvider  // 設置 provider 以保持向後兼容
      console.log('🔍 ContractService 使用 fallback ethers BrowserProvider')
    }
  }

  // 確保合約服務已初始化
  async ensureInitialized() {
    if (!this.ethProvider || !this.signer) {
      console.warn('⚠️ ContractService 未初始化，嘗試初始化...')
      await this.initWallet()
    }
  }

  // 檢查用戶是否有 GasPass token
  async hasGasPassCard(walletAddress) {
    try {
      await this.ensureInitialized()
      
      const { gaspassRead } = this.getContracts()
      console.log('🔍 檢查 GasPass 卡片，地址:', walletAddress)
      
      const totalSupply = await gaspassRead.totalSupply()
      console.log('🔍 總供應量:', totalSupply.toString())
      
      // 遍歷所有 token 檢查擁有者
      for (let i = 0; i < totalSupply; i++) {
        const tokenId = await gaspassRead.tokenByIndex(i)
        const owner = await gaspassRead.ownerOf(tokenId)
        console.log(`🔍 Token ${i}: ID=${tokenId}, Owner=${owner}`)
        if (owner.toLowerCase() === walletAddress.toLowerCase()) {
          console.log('✅ 找到用戶的卡片!')
          return true
        }
      }
      console.log('❌ 未找到用戶的卡片')
      return false
    } catch (error) {
      console.error('Error checking GasPass cards:', error)
      return false
    }
  }

  // 獲取用戶的所有 GasPass token
  async getUserCards(walletAddress) {
    try {
      await this.ensureInitialized()
      
      const { gaspassRead } = this.getContracts()
      console.log('🔍 獲取用戶卡片，地址:', walletAddress)
      
      const cards = []
      const totalSupply = await gaspassRead.totalSupply()
      console.log('🔍 總供應量:', totalSupply.toString())
      
      for (let i = 0; i < totalSupply; i++) {
        const tokenId = await gaspassRead.tokenByIndex(i)
        const owner = await gaspassRead.ownerOf(tokenId)
        
        if (owner.toLowerCase() === walletAddress.toLowerCase()) {
          const balance = await gaspassRead.balanceOf(tokenId)
          const balanceInUSDC = ethers.formatUnits(balance, 6) // USDC 有 6 位小數
          
          console.log(`✅ 找到卡片: ID=${tokenId}, Balance=${balanceInUSDC} USDC`)
          
          cards.push({
            tokenId: tokenId.toString(),
            owner: owner,
            balance: balanceInUSDC,
            createdAt: new Date().toISOString(),
            lastUpdate: new Date().toLocaleString('zh-TW')
          })
        }
      }
      
      console.log(`🔍 用戶共有 ${cards.length} 張卡片`)
      return cards
    } catch (error) {
      console.error('Error getting user cards:', error)
      return []
    }
  }

  // 獲取 USDC 餘額
  async getUSDCBalance(walletAddress) {
    try {
      await this.ensureInitialized()
      const { usdcRead } = this.getContracts()
      
      const balance = await usdcRead.balanceOf(walletAddress)
      return ethers.formatUnits(balance, 6)
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
      
      // 使用 signer 來讀取 nonce
      const usdcContract = new ethers.Contract(USDC_CONFIG.address, USDC_CONFIG.abi, this.signer)
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
      const gasPassContract = new ethers.Contract(CONTRACT_CONFIG.address, CONTRACT_CONFIG.abi, this.signer)
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
      console.log('🔍 創建 USDC permit 簽名...')
      console.log('🔍 參數:', { owner, spender, value, deadline })
      
      // 獲取 USDC nonce
      const nonce = await this.getUSDCNonce(owner)
      console.log('🔍 USDC nonce:', nonce.toString())
      
      const valueWei = parseUnits(value, 6)
      console.log('🔍 valueWei:', valueWei.toString())

      const types = {
        Permit: [
          { name: 'owner', type: 'address' },
          { name: 'spender', type: 'address' },
          { name: 'value', type: 'uint256' },
          { name: 'nonce', type: 'uint256' },
          { name: 'deadline', type: 'uint256' }
        ]
      }

      const value_data = {
        owner: owner,
        spender: spender,
        value: valueWei,
        nonce: nonce,
        deadline: deadline
      }

      console.log('🔍 permit 數據:', value_data)
      
      // 使用 EIP-712 typed data 簽名（不是 signMessage）
      const domain = {
        name: 'USD Coin',
        version: '2',
        chainId: 42161,
        verifyingContract: USDC_CONFIG.address
      }
      
      console.log('🔍 使用 EIP-712 typed data 簽名...')
      const signature = await this.signer.signTypedData(domain, types, value_data)
      const sig = splitSignature(signature)

      console.log('🔍 permit 簽名:', { v: sig.v, r: sig.r, s: sig.s })

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
      console.error('❌ 創建 USDC permit 失敗:', error)
      throw error
    }
  }

  // 3) 鑄造主流程（mintWithSig）
  async mintGasPassCard(params) {
    try {
      const { to, amount } = params
      
      console.log('🚀 開始鑄造 GasPass 儲值卡...')
      console.log('參數:', { to, amount })
      
      const owner = await this.signer.getAddress()
      const { gaspassRead, usdcRead } = this.getContracts()

      // ===== 讀鏈上 nonce（不要再 fallback 0）=====
      const gaspassNonce = await gaspassRead.ownerNonces(owner)
      const usdcNonce = await usdcRead.nonces(owner)
      
      console.log('🔍 GasPass nonce:', gaspassNonce.toString())
      console.log('🔍 USDC nonce:', usdcNonce.toString())

      // ===== 建 USDC permit（EIP-2612）=====
      const value = ethers.parseUnits(String(amount), 6) // USDC 6 decimals
      const deadline = BigInt(Math.floor(Date.now()/1000) + 3600)

      const usdcDomain = {
        name: "USD Coin",       // ← 確認你鏈上 USDC 的實際 name/version
        version: "2",
        chainId: 42161,
        verifyingContract: USDC_CONFIG.address,
      }
      const usdcTypes = {
        Permit: [
          { name: "owner",   type: "address" },
          { name: "spender", type: "address" },
          { name: "value",   type: "uint256" },
          { name: "nonce",   type: "uint256" },
          { name: "deadline",type: "uint256" },
        ],
      }
      const usdcMessage = {
        owner,
        spender: CONTRACT_CONFIG.address,
        value: BigInt(value),
        nonce: BigInt(usdcNonce.toString()),
        deadline,
      }
      
      console.log('📝 創建 USDC permit 簽名...')
      const usdcSig = await this.signer.signTypedData(usdcDomain, usdcTypes, usdcMessage)
      const { v: pv, r: pr, s: ps } = ethers.Signature.from(usdcSig)

      // 依合約 STABLECOIN_PERMIT_TYPEHASH 的 **型別與順序**編碼再 keccak
      const STABLECOIN_PERMIT_TYPEHASH = ethers.keccak256(ethers.toUtf8Bytes('StablecoinPermitData(address owner,address spender,uint256 value,uint256 deadline,uint8 v,bytes32 r,bytes32 s)'))
      const permitDataHash = ethers.keccak256(
        ethers.AbiCoder.defaultAbiCoder().encode(
          ["bytes32","address","address","uint256","uint256","uint8","bytes32","bytes32"],
          [STABLECOIN_PERMIT_TYPEHASH, owner, CONTRACT_CONFIG.address, BigInt(value), deadline, pv, pr, ps]
        )
      )

      // ===== 建 GasPass 的 712（MintWithSig）=====
      const domain = {
        name: "GasPass",
        version: "1",
        chainId: 42161,
        verifyingContract: CONTRACT_CONFIG.address,
      }
      const types = {
        MintWithSig: [
          { name: "to",             type: "address"  },
          { name: "value",          type: "uint256"  },
          { name: "permitDataHash", type: "bytes32"  },
          { name: "agent",          type: "address"  },
          { name: "nonce",          type: "uint256"  },
          { name: "deadline",       type: "uint256"  },
        ],
      }
      const message = {
        to,
        value: BigInt(value),
        permitDataHash,
        agent: getStoredPkpEthAddress(), // 你的 agent 地址；與合約邏輯無需等於 owner
        nonce: BigInt(gaspassNonce.toString()),
        deadline,
      }

      console.log('✍️ 簽署 EIP-712 數據...')
      console.log('🔍 message:', message)

      // 先自驗（不要自己手算 digest，直接用 ethers 幫你 recover）
      const sig = await this.signer.signTypedData(domain, types, message)
      const who = ethers.verifyTypedData(domain, types, message, sig)
      if (who.toLowerCase() !== owner.toLowerCase()) {
        throw new Error(`簽名者不匹配：期望 ${owner}，實際 ${who}`)
      }
      
      console.log('✅ 簽名驗證通過！簽名者:', who)

      // 準備發送給 relayer 的數據（與合約結構一致）
      const mintTypedData = {
        to: to,
        value: value.toString(),
        permitData: {
          owner: owner,
          spender: CONTRACT_CONFIG.address,
          value: value.toString(),
          deadline: deadline.toString(),
          v: pv,
          r: pr,
          s: ps
        },
        agent: getStoredPkpEthAddress(),
        nonce: gaspassNonce.toString(),
        deadline: deadline.toString()
      }

      console.log('📤 通過 Relayer 發送交易...')
      console.log('🔍 發送給後端的數據:', { typedData: mintTypedData, signature: sig })
      const result = await relayerService.relayMint(mintTypedData, sig)
      
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
      
      // 確保合約服務已初始化
      await this.ensureInitialized()
      
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

      // 計算 permitHash（與合約邏輯一致）
      const permitHash = ethers.keccak256(ethers.AbiCoder.defaultAbiCoder().encode(
        ['bytes32', 'address', 'address', 'uint256', 'uint256', 'uint8', 'bytes32', 'bytes32'],
        [
          ethers.keccak256(ethers.toUtf8Bytes('StablecoinPermitData(address owner,address spender,uint256 value,uint256 deadline,uint8 v,bytes32 r,bytes32 s)')),
          permitData.owner,
          permitData.spender,
          permitData.value,
          permitData.deadline,
          permitData.v,
          permitData.r,
          permitData.s
        ]
      ))

      const types = {
        DepositWithSig: [
          { name: 'tokenId', type: 'uint256' },
          { name: 'amount', type: 'uint256' },
          { name: 'permitDataHash', type: 'bytes32' },  // EIP-712 簽名時使用 permitDataHash
          { name: 'nonce', type: 'uint256' },
          { name: 'deadline', type: 'uint256' }
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
      let signature
      try {
        // 創建用於簽名的 typedData（使用 permitHash）
        const signatureTypedData = {
          tokenId: tokenId.toString(),
          amount: usdcAmount.toString(),
          permitDataHash: permitHash,  // 簽名時使用 permitHash
          nonce: nonce.toString(),
          deadline: deadline.toString()
        }
        
        signature = await this.signer.signTypedData(domain, types, signatureTypedData)
        console.log('🔍 簽名結果:', signature)
      } catch (error) {
        console.error('❌ EIP-712 計算錯誤:', error)
        throw error
      }
      
      console.log('📤 通過 Relayer 發送交易...')
      const result = await relayerService.relayDeposit(typedData, signature)
      
      console.log('✅ 充值成功!', result)
      return {
        success: true,
        txHash: result.txHash,
        confirmations: result.confirmations,
        gasUsed: result.gasUsed,
        status: result.status,
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

  // 設置 refuel policy (EIP-712 簽名版本)
  async setRefuelPolicy(tokenId, targetChainId, gasAmount, threshold, agent) {
    try {
      console.log('🔧 設定 Refuel Policy:', {
        tokenId,
        targetChainId,
        gasAmount,
        threshold,
        agent
      })

      // 獲取合約實例
      const { gaspassRead } = this.getContracts()
      
      // 先測試合約連接
      console.log('🔍 測試合約連接...')
      try {
        const totalSupply = await gaspassRead.totalSupply()
        console.log('📊 總供應量:', totalSupply.toString())
        
        // 檢查 Token 是否存在
        const owner = await gaspassRead.ownerOf(tokenId)
        console.log('👤 Token 擁有者:', owner)
        
      // 獲取 nonce - 使用正確的方法
      console.log('🔍 獲取 Token nonce...')
      console.log('🔍 TokenId 類型:', typeof tokenId, '值:', tokenId)
      const nonce = await gaspassRead.nonces(BigInt(tokenId))
      console.log('📝 Token nonce:', nonce.toString())
        
      } catch (error) {
        console.error('❌ 合約調用失敗:', error)
        console.error('❌ 錯誤詳情:', {
          code: error.code,
          message: error.message,
          data: error.data
        })
        throw new Error(`合約調用失敗: ${error.message}`)
      }

      // 設定 deadline (1 小時後)
      const deadline = Math.floor(Date.now() / 1000) + 3600

      // 創建 typedData
      const typedData = {
        tokenId: BigInt(tokenId),
        targetChainId: BigInt(targetChainId),
        gasAmount: BigInt(gasAmount),
        threshold: BigInt(threshold),
        agent: agent,
        nonce: BigInt(nonce.toString()),
        deadline: BigInt(deadline)
      }

      console.log('📋 TypedData:', typedData)

      // EIP-712 簽名
      const domain = {
        name: 'GasPass',
        version: '1',
        chainId: 42161, // Arbitrum Mainnet
        verifyingContract: CONTRACT_CONFIG.address
      }

      const types = {
        SetRefuelPolicy: [
          { name: 'tokenId', type: 'uint256' },
          { name: 'targetChainId', type: 'uint256' },
          { name: 'gasAmount', type: 'uint128' },
          { name: 'threshold', type: 'uint128' },
          { name: 'agent', type: 'address' },
          { name: 'nonce', type: 'uint256' },
          { name: 'deadline', type: 'uint256' }
        ]
      }

      const sig = await this.signer.signTypedData(domain, types, typedData)
      console.log('✍️ 簽名完成:', sig)

      // 通過 relayer 發送
      const result = await relayerService.relaySetRefuelPolicy(typedData, sig)
      console.log('🚀 Relayer 結果:', result)

      return {
        success: true,
        result: result
      }
    } catch (error) {
      console.error('❌ Set refuel policy failed:', error)
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
            agent: getStoredPkpEthAddress(),
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
