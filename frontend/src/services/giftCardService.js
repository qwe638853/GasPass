// 贈送儲值卡服務
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
  address: GAS_PASS_CONFIG.contractAddress,
  abi: [
    'function totalSupply() view returns (uint256)',
    'function tokenByIndex(uint256) view returns (uint256)',
    'function ownerOf(uint256) view returns (address)',
    'function balanceOf(uint256) view returns (uint256)',
    'function ownerNonces(address) view returns (uint256)',
    'function nonces(uint256) view returns (uint256)',
    'function mintBatchWithSig(tuple(address to, uint256 amount, uint256 singleValue, address agent, tuple(address owner, address spender, uint256 value, uint256 deadline, uint8 v, bytes32 r, bytes32 s) permitData, uint256 nonce, uint256 deadline) typedData, bytes signature) external',
    'event MintBatch(address indexed to, uint256 amount, uint256 singleValue, address indexed agent)'
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

class GiftCardService {
  constructor() {
    this.ethProvider = null
    this.signer = null
    this.gasPassContract = null
    this.usdcContract = null
  }

  // 初始化錢包連接
  async initWallet() {
    const injected = window.ethereum
    if (!injected) throw new Error("找不到注入錢包 (window.ethereum)")
    const metamask = injected.providers?.find?.(p => p.isMetaMask) ?? injected
    const provider = new ethers.BrowserProvider(metamask)
    await provider.send("eth_requestAccounts", [])
    const signer = await provider.getSigner()

    this.ethProvider = markRaw(provider)
    this.signer = markRaw(signer)
    this.provider = this.ethProvider

    const owner = await this.signer.getAddress()
    const code = await this.ethProvider.getCode(owner)
    if (code !== "0x") {
      throw new Error("當前帳戶是合約錢包（非 EOA）。請切回 MetaMask EOA，或等合約支援 EIP-1271。")
    }
    return owner
  }

  // 獲取合約實例
  getContracts() {
    if (!this.ethProvider || !this.signer) {
      throw new Error('Provider or signer not initialized')
    }
    
    const gaspassRead = new ethers.Contract(CONTRACT_CONFIG.address, CONTRACT_CONFIG.abi, this.ethProvider)
    const gaspassWrite = new ethers.Contract(CONTRACT_CONFIG.address, CONTRACT_CONFIG.abi, this.ethProvider)
    const usdcRead = new ethers.Contract(USDC_CONFIG.address, USDC_CONFIG.abi, this.ethProvider)
    
    return { gaspassRead, gaspassWrite, usdcRead }
  }

  // 確保服務已初始化
  async ensureInitialized() {
    if (!this.ethProvider || !this.signer) {
      console.warn('⚠️ GiftCardService 未初始化，嘗試初始化...')
      await this.initWallet()
    }
  }

  // 獲取 USDC nonce
  async getUSDCNonce(walletAddress) {
    try {
      if (!this.provider) {
        throw new Error('Provider not initialized')
      }
      
      const usdcContract = new ethers.Contract(USDC_CONFIG.address, USDC_CONFIG.abi, this.signer)
      const nonce = await usdcContract.nonces(walletAddress)
      console.log('USDC nonce retrieved:', nonce.toString())
      return nonce
    } catch (error) {
      console.error('Error getting USDC nonce:', error)
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
      
      const gasPassContract = new ethers.Contract(CONTRACT_CONFIG.address, CONTRACT_CONFIG.abi, this.signer)
      const nonce = await gasPassContract.ownerNonces(walletAddress)
      console.log('GasPass 合約 nonce 獲取成功:', nonce.toString())
      return nonce
    } catch (error) {
      console.error('Error getting GasPass nonce:', error)
      console.warn('無法從 GasPass 合約讀取 nonce，使用 0 作為 fallback')
      return 0n
    }
  }

  // 使用 mintBatchWithSig 鑄造多張儲值卡給別人
  async mintBatchCards(params) {
    try {
      const { to, quantity, amountPerCard } = params
      
      console.log('🎁 開始批量鑄造儲值卡給別人...')
      console.log('參數:', { to, quantity, amountPerCard })
      
      await this.ensureInitialized()
      
      const owner = await this.signer.getAddress()
      const { gaspassRead, usdcRead } = this.getContracts()

      // 計算總金額
      const totalAmount = quantity * amountPerCard
      const totalValueWei = ethers.parseUnits(String(totalAmount), 6) // USDC 6 decimals
      const singleValueWei = ethers.parseUnits(String(amountPerCard), 6) // 每張卡的金額
      
      console.log('💰 總金額:', totalAmount, 'USDC')
      console.log('💰 每張卡金額:', amountPerCard, 'USDC')

      // 獲取 nonce
      const gaspassNonce = await gaspassRead.ownerNonces(owner)
      const usdcNonce = await usdcRead.nonces(owner)
      
      console.log('🔍 GasPass nonce:', gaspassNonce.toString())
      console.log('🔍 USDC nonce:', usdcNonce.toString())

      // 設定 deadline (1 小時後)
      const deadline = BigInt(Math.floor(Date.now()/1000) + 3600)

      // ===== 建 USDC permit（EIP-2612）=====
      const usdcDomain = {
        name: "USD Coin",
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
        value: totalValueWei,
        nonce: BigInt(usdcNonce.toString()),
        deadline,
      }
      
      console.log('📝 創建 USDC permit 簽名...')
      const usdcSig = await this.signer.signTypedData(usdcDomain, usdcTypes, usdcMessage)
      const { v: pv, r: pr, s: ps } = ethers.Signature.from(usdcSig)

      // 計算 permitDataHash
      const STABLECOIN_PERMIT_TYPEHASH = ethers.keccak256(ethers.toUtf8Bytes('StablecoinPermitData(address owner,address spender,uint256 value,uint256 deadline,uint8 v,bytes32 r,bytes32 s)'))
      const permitDataHash = ethers.keccak256(
        ethers.AbiCoder.defaultAbiCoder().encode(
          ["bytes32","address","address","uint256","uint256","uint8","bytes32","bytes32"],
          [STABLECOIN_PERMIT_TYPEHASH, owner, CONTRACT_CONFIG.address, totalValueWei, deadline, pv, pr, ps]
        )
      )

      // ===== 建 GasPass 的 EIP-712（MintBatchWithSig）=====
      const domain = {
        name: "GasPass",
        version: "1",
        chainId: 42161,
        verifyingContract: CONTRACT_CONFIG.address,
      }
      const types = {
        MintBatchWithSig: [
          { name: "to",             type: "address"  },
          { name: "amount",         type: "uint256"  },
          { name: "singleValue",    type: "uint256"  },
          { name: "agent",          type: "address"  },
          { name: "permitDataHash", type: "bytes32"  },
          { name: "nonce",          type: "uint256"  },
          { name: "deadline",       type: "uint256"  },
        ],
      }
             // 獲取 agent 地址，確保是有效的地址格式
       let agentAddress = getStoredPkpEthAddress()
       
       // 如果沒有找到 PKP 地址，使用用戶錢包地址作為備用
       if (!agentAddress || !ethers.isAddress(agentAddress)) {
         console.warn('⚠️ PKP agent address not found, using wallet address as agent')
         agentAddress = owner
       }
       
       // 驗證 agent 地址格式
       if (!ethers.isAddress(agentAddress)) {
         throw new Error(`Invalid agent address: ${agentAddress}`)
       }

      const message = {
        to,
        amount: BigInt(quantity),
        singleValue: singleValueWei,
        agent: agentAddress,
        permitDataHash,
        nonce: BigInt(gaspassNonce.toString()),
        deadline,
      }

      console.log('✍️ 簽署 EIP-712 數據...')
      console.log('🔍 message:', message)
      console.log('🔍 agent address:', agentAddress)

      // 簽名驗證 - 確保使用正確的 signer，並手動解析 domain
      // 使用 signTypedData 時，確保 agent 是地址格式，不是 ENS 名稱
      const sig = await this.signer.signTypedData(domain, types, message)
      const who = ethers.verifyTypedData(domain, types, message, sig)
      if (who.toLowerCase() !== owner.toLowerCase()) {
        throw new Error(`簽名者不匹配：期望 ${owner}，實際 ${who}`)
      }
      
      console.log('✅ 簽名驗證通過！簽名者:', who)

      // 準備發送給 relayer 的數據
      const mintBatchTypedData = {
        to: to,
        amount: quantity.toString(),
        singleValue: singleValueWei.toString(),
        permitData: {
          owner: owner,
          spender: CONTRACT_CONFIG.address,
          value: totalValueWei.toString(),
          deadline: deadline.toString(),
          v: pv,
          r: pr,
          s: ps
        },
        agent: agentAddress,
        nonce: gaspassNonce.toString(),
        deadline: deadline.toString()
      }

      console.log('📤 通過 Relayer 發送批量鑄造交易...')
      console.log('🔍 發送給後端的數據:', { typedData: mintBatchTypedData, signature: sig })
      
      // 這裡需要調用 relayer 的 mintBatch 方法
      const result = await relayerService.relayMintBatch(mintBatchTypedData, sig)
      
      console.log('✅ 批量鑄造成功!', result)
      return {
        success: true,
        txHash: result.txHash,
        tokenIds: result.tokenIds,
        quantity: quantity,
        amountPerCard: amountPerCard,
        totalAmount: totalAmount,
        recipient: to,
        receipt: result.receipt
      }
    } catch (error) {
      console.error('❌ 批量鑄造失敗:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }
}

// 創建 GiftCardService 實例
const giftCardServiceInstance = new GiftCardService()

// 模擬贈送儲值卡功能
export const giftCardService = {
  // 使用 mintBatchWithSig 贈送儲值卡給別人
  async giftCards({ quantity, amountPerCard, recipientType, recipientAddress }) {
    try {
      // 如果是贈送給別人，使用真實的合約調用
      if (recipientType === 'other' && recipientAddress) {
        console.log('🎁 使用合約批量鑄造儲值卡給別人...')
        const result = await giftCardServiceInstance.mintBatchCards({
          to: recipientAddress,
          quantity: quantity,
          amountPerCard: amountPerCard
        })
        
        if (result.success) {
          // 更新本地儲存記錄
          const giftCards = JSON.parse(localStorage.getItem('giftCards') || '[]')
          for (let i = 0; i < quantity; i++) {
            giftCards.push({
              tokenId: result.tokenIds[i] || (Date.now() + i).toString(),
              balance: amountPerCard,
              recipientType,
              recipientAddress,
              mintTime: new Date().toISOString(),
              status: 'active',
              txHash: result.txHash
            })
          }
          localStorage.setItem('giftCards', JSON.stringify(giftCards))
        }
        
        return result
      }
      
      // 如果是給自己，使用模擬邏輯
      console.log('🎁 使用模擬邏輯鑄造儲值卡給自己...')
      
      // 模擬 API 延遲
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // 模擬鑄造過程
      const totalAmount = quantity * amountPerCard
      const mintFee = quantity * 0.1 // 每張卡 0.1 USDC 鑄造費
      
      // 檢查餘額是否足夠
      const currentBalance = parseFloat(localStorage.getItem('usdcBalance') || '0')
      if (currentBalance < totalAmount + mintFee) {
        return {
          success: false,
          error: 'USDC 餘額不足'
        }
      }
      
      // 模擬鑄造成功
      const newCards = []
      for (let i = 0; i < quantity; i++) {
        const tokenId = Date.now() + i
        newCards.push({
          tokenId: tokenId.toString(),
          balance: amountPerCard,
          recipientType,
          recipientAddress,
          mintTime: new Date().toISOString(),
          status: 'active'
        })
      }
      
      // 更新本地儲存
      const existingCards = JSON.parse(localStorage.getItem('giftCards') || '[]')
      existingCards.push(...newCards)
      localStorage.setItem('giftCards', JSON.stringify(existingCards))
      
      // 更新 USDC 餘額
      const newBalance = currentBalance - totalAmount - mintFee
      localStorage.setItem('usdcBalance', newBalance.toString())
      
      return {
        success: true,
        data: {
          cards: newCards,
          totalAmount,
          mintFee,
          recipientType,
          recipientAddress
        }
      }
    } catch (error) {
      console.error('Gift cards error:', error)
      return {
        success: false,
        error: error.message
      }
    }
  },

  // 直接使用合約批量鑄造儲值卡
  async mintBatchCards(params) {
    return await giftCardServiceInstance.mintBatchCards(params)
  },

  // 獲取贈送記錄
  async getGiftHistory() {
    try {
      const giftCards = JSON.parse(localStorage.getItem('giftCards') || '[]')
      
      // 按時間分組
      const groupedByDate = giftCards.reduce((acc, card) => {
        const date = new Date(card.mintTime).toLocaleDateString()
        if (!acc[date]) {
          acc[date] = []
        }
        acc[date].push(card)
        return acc
      }, {})
      
      // 轉換為歷史記錄格式
      const history = Object.entries(groupedByDate).map(([date, cards]) => {
        const totalAmount = cards.reduce((sum, card) => sum + card.balance, 0)
        const recipientType = cards[0].recipientType
        const recipientAddress = cards[0].recipientAddress
        
        return {
          id: date,
          date,
          quantity: cards.length,
          totalAmount: totalAmount.toFixed(2),
          recipientType,
          recipientAddress
        }
      })
      
      return history.sort((a, b) => new Date(b.date) - new Date(a.date))
    } catch (error) {
      console.error('Get gift history error:', error)
      return []
    }
  },

  // 獲取我的儲值卡
  async getMyCards() {
    try {
      const giftCards = JSON.parse(localStorage.getItem('giftCards') || '[]')
      return giftCards.filter(card => card.recipientType === 'self')
    } catch (error) {
      console.error('Get my cards error:', error)
      return []
    }
  },

  // 轉贈儲值卡
  async transferCard({ tokenId, toAddress, amount }) {
    try {
      // 模擬 API 延遲
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      const giftCards = JSON.parse(localStorage.getItem('giftCards') || '[]')
      const cardIndex = giftCards.findIndex(card => card.tokenId === tokenId)
      
      if (cardIndex === -1) {
        return {
          success: false,
          error: '儲值卡不存在'
        }
      }
      
      const card = giftCards[cardIndex]
      
      if (card.balance < amount) {
        return {
          success: false,
          error: '餘額不足'
        }
      }
      
      // 更新卡片餘額
      card.balance -= amount
      
      // 如果全部轉贈，則移除卡片
      if (card.balance <= 0) {
        giftCards.splice(cardIndex, 1)
      }
      
      // 創建新的接收者卡片
      const newCard = {
        tokenId: Date.now().toString(),
        balance: amount,
        recipientType: 'other',
        recipientAddress: toAddress,
        mintTime: new Date().toISOString(),
        status: 'active',
        transferredFrom: card.tokenId
      }
      
      giftCards.push(newCard)
      localStorage.setItem('giftCards', JSON.stringify(giftCards))
      
      return {
        success: true,
        data: {
          transferredAmount: amount,
          remainingBalance: card.balance,
          newCard
        }
      }
    } catch (error) {
      console.error('Transfer card error:', error)
      return {
        success: false,
        error: error.message
      }
    }
  },

  // 分割儲值卡
  async splitCard({ tokenId, amounts }) {
    try {
      // 模擬 API 延遲
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      const giftCards = JSON.parse(localStorage.getItem('giftCards') || '[]')
      const cardIndex = giftCards.findIndex(card => card.tokenId === tokenId)
      
      if (cardIndex === -1) {
        return {
          success: false,
          error: '儲值卡不存在'
        }
      }
      
      const card = giftCards[cardIndex]
      const totalSplitAmount = amounts.reduce((sum, amount) => sum + amount, 0)
      
      if (card.balance < totalSplitAmount) {
        return {
          success: false,
          error: '餘額不足'
        }
      }
      
      // 更新原卡片餘額
      card.balance -= totalSplitAmount
      
      // 創建分割後的卡片
      const newCards = amounts.map(amount => ({
        tokenId: (Date.now() + Math.random() * 1000).toString(),
        balance: amount,
        recipientType: card.recipientType,
        recipientAddress: card.recipientAddress,
        mintTime: new Date().toISOString(),
        status: 'active',
        splitFrom: card.tokenId
      }))
      
      giftCards.push(...newCards)
      localStorage.setItem('giftCards', JSON.stringify(giftCards))
      
      return {
        success: true,
        data: {
          originalCard: card,
          newCards,
          totalSplitAmount
        }
      }
    } catch (error) {
      console.error('Split card error:', error)
      return {
        success: false,
        error: error.message
      }
    }
  },

  // 合併儲值卡
  async mergeCards({ tokenIds }) {
    try {
      // 模擬 API 延遲
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      const giftCards = JSON.parse(localStorage.getItem('giftCards') || '[]')
      const cardsToMerge = giftCards.filter(card => tokenIds.includes(card.tokenId))
      
      if (cardsToMerge.length !== tokenIds.length) {
        return {
          success: false,
          error: '部分儲值卡不存在'
        }
      }
      
      // 計算總餘額
      const totalBalance = cardsToMerge.reduce((sum, card) => sum + card.balance, 0)
      
      // 移除要合併的卡片
      const remainingCards = giftCards.filter(card => !tokenIds.includes(card.tokenId))
      
      // 創建合併後的卡片
      const mergedCard = {
        tokenId: Date.now().toString(),
        balance: totalBalance,
        recipientType: cardsToMerge[0].recipientType,
        recipientAddress: cardsToMerge[0].recipientAddress,
        mintTime: new Date().toISOString(),
        status: 'active',
        mergedFrom: tokenIds
      }
      
      remainingCards.push(mergedCard)
      localStorage.setItem('giftCards', JSON.stringify(remainingCards))
      
      return {
        success: true,
        data: {
          mergedCard,
          totalBalance,
          mergedCount: cardsToMerge.length
        }
      }
    } catch (error) {
      console.error('Merge cards error:', error)
      return {
        success: false,
        error: error.message
      }
    }
  },

  // 獲取儲值卡統計
  async getCardStats() {
    try {
      const giftCards = JSON.parse(localStorage.getItem('giftCards') || '[]')
      
      const stats = {
        totalCards: giftCards.length,
        totalValue: giftCards.reduce((sum, card) => sum + card.balance, 0),
        myCards: giftCards.filter(card => card.recipientType === 'self').length,
        giftedCards: giftCards.filter(card => card.recipientType === 'other').length,
        averageValue: 0
      }
      
      if (stats.totalCards > 0) {
        stats.averageValue = (stats.totalValue / stats.totalCards).toFixed(2)
      }
      
      return stats
    } catch (error) {
      console.error('Get card stats error:', error)
      return {
        totalCards: 0,
        totalValue: 0,
        myCards: 0,
        giftedCards: 0,
        averageValue: 0
      }
    }
  }
}
