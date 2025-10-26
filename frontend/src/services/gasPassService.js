// GasPass 業務邏輯服務
import { mockGasPassCards, mockTransactionHistory, mockRefuelPolicies } from '../utils/mockData.js'

class GasPassService {
  constructor() {
    this.userCards = []
    this.transactionHistory = []
    this.refuelPolicies = []
    this.agentSettings = new Map() // tokenId -> settings
  }

  // 檢查用戶是否有儲值卡
  async hasGasPassCard(walletAddress) {
    if (!walletAddress) return false
    // 模擬檢查邏輯 - 在真實環境中會查詢智能合約
    const cards = await this.getUserCards(walletAddress)
    return cards.length > 0
  }

  // 獲取用戶的所有儲值卡
  async getUserCards(walletAddress) {
    if (!walletAddress) return []
    // 模擬從智能合約獲取用戶卡片
    this.userCards = mockGasPassCards.filter(card => 
      card.owner.toLowerCase() === walletAddress.toLowerCase()
    )
    return this.userCards
  }

  // 鑄造新的儲值卡
  async mintGasPassCard(params) {
    const { to, amount, permitData, deadline } = params
    
    try {
      // 模擬鑄造過程
      await this.simulateDelay(2000)
      
      // 生成新的儲值卡
      const newCard = {
        tokenId: Date.now(),
        owner: to,
        balance: amount,
        createdAt: new Date().toISOString(),
        lastUpdate: new Date().toLocaleString('zh-TW')
      }
      
      this.userCards.push(newCard)
      
      // 記錄交易歷史
      const transaction = {
        id: Date.now(),
        hash: '0x' + Math.random().toString(16).substr(2, 64),
        type: '鑄造儲值卡',
        amount: amount,
        timestamp: new Date().toLocaleString('zh-TW'),
        status: 'completed'
      }
      
      this.transactionHistory.unshift(transaction)
      
      return {
        success: true,
        txHash: transaction.hash,
        tokenId: newCard.tokenId,
        card: newCard
      }
    } catch (error) {
      console.error('Mint failed:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  // 為儲值卡充值
  async depositToCard(params) {
    const { tokenId, amount, permitData, deadline } = params
    
    try {
      await this.simulateDelay(1500)
      
      // 更新卡片餘額
      const cardIndex = this.userCards.findIndex(card => card.tokenId === tokenId)
      if (cardIndex !== -1) {
        this.userCards[cardIndex].balance = (
          parseFloat(this.userCards[cardIndex].balance) + parseFloat(amount)
        ).toFixed(2)
        this.userCards[cardIndex].lastUpdate = new Date().toLocaleString('zh-TW')
      }
      
      // 記錄交易歷史
      const transaction = {
        id: Date.now(),
        hash: '0x' + Math.random().toString(16).substr(2, 64),
        type: '儲值',
        amount: amount,
        tokenId: tokenId,
        timestamp: new Date().toLocaleString('zh-TW'),
        status: 'completed'
      }
      
      this.transactionHistory.unshift(transaction)
      
      return {
        success: true,
        txHash: transaction.hash,
        transaction
      }
    } catch (error) {
      console.error('Deposit failed:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  // 獲取交易歷史
  async getTransactionHistory(tokenId) {
    await this.simulateDelay(500)
    
    if (tokenId) {
      return this.transactionHistory.filter(tx => tx.tokenId === tokenId)
    }
    
    return this.transactionHistory
  }

  // 手動補 Gas
  async manualRefuel(params) {
    const { tokenId, targetChainId, gasAmount, recipientAddress } = params
    
    try {
      console.log('🚀 執行手動兌換:', params)
      
      // 準備 API 請求參數
      const requestData = {
        tokenId: tokenId,
        chainId: targetChainId,
        gasAmount: gasAmount.toString()
      }
      
      console.log('📤 發送請求到後端:', requestData)
      
      // 檢查 JWT token
      const jwtToken = localStorage.getItem('VINCENT_AUTH_JWT')
      console.log('🔍 JWT Token 檢查:', {
        hasToken: !!jwtToken,
        tokenLength: jwtToken ? jwtToken.length : 0,
        tokenStart: jwtToken ? jwtToken.substring(0, 20) + '...' : 'null',
        tokenEnd: jwtToken ? '...' + jwtToken.substring(jwtToken.length - 20) : 'null'
      })
      
      if (!jwtToken) {
        throw new Error('沒有找到 JWT token，請先登入 Vincent')
      }
      
      // 調用後端 API
      const response = await fetch('/api/vincent/triggerManualRefuel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('VINCENT_AUTH_JWT')}`
        },
        body: JSON.stringify(requestData)
      })
      
      const result = await response.json()
      
      if (!response.ok || !result.success) {
        throw new Error(result.error || '兌換失敗')
      }
      
      console.log('✅ 兌換成功:', result)
      
      // 計算費用（用於本地記錄）
      const gasCost = this.calculateGasCost(gasAmount, targetChainId)
      const bridgeFee = this.calculateBridgeFee(gasCost)
      const totalCost = gasCost + bridgeFee + 0.5 // 基礎費用
      
      // 扣除卡片餘額
      const cardIndex = this.userCards.findIndex(card => card.tokenId === tokenId)
      if (cardIndex !== -1) {
        const currentBalance = parseFloat(this.userCards[cardIndex].balance)
        if (currentBalance < totalCost) {
          throw new Error('儲值卡餘額不足')
        }
        
        this.userCards[cardIndex].balance = (currentBalance - totalCost).toFixed(2)
        this.userCards[cardIndex].lastUpdate = new Date().toLocaleString('zh-TW')
      }
      
      // 記錄交易
      const transaction = {
        id: Date.now(),
        hash: result.result?.txHash || '0x' + Math.random().toString(16).substr(2, 64),
        type: '手動補 Gas',
        chainId: targetChainId,
        gasAmount: gasAmount,
        cost: totalCost.toFixed(2),
        recipient: recipientAddress,
        timestamp: new Date().toLocaleString('zh-TW'),
        status: 'completed'
      }
      
      this.transactionHistory.unshift(transaction)
      
      return {
        success: true,
        txHash: result.result?.txHash,
        cost: totalCost,
        transaction,
        result: result.result // 包含後端返回的完整結果
      }
    } catch (error) {
      console.error('❌ Manual refuel failed:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  // 設定自動補 Gas 策略
  async setRefuelPolicy(params) {
    const { tokenId, targetChainId, gasAmount, threshold } = params
    
    try {
      await this.simulateDelay(1000)
      
      const policy = {
        id: Date.now(),
        tokenId,
        chainId: targetChainId,
        gasAmount,
        threshold,
        status: 'active',
        createdAt: new Date().toISOString(),
        lastTriggered: null,
        executeCount: 0
      }
      
      // 移除舊策略（如果存在）
      this.refuelPolicies = this.refuelPolicies.filter(
        p => !(p.tokenId === tokenId && p.chainId === targetChainId)
      )
      
      this.refuelPolicies.push(policy)
      
      return {
        success: true,
        policy
      }
    } catch (error) {
      console.error('Set refuel policy failed:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  // 獲取活躍的自動補充策略
  async getRefuelPolicies(tokenId) {
    await this.simulateDelay(300)
    
    if (tokenId) {
      return this.refuelPolicies.filter(policy => policy.tokenId === tokenId)
    }
    
    return this.refuelPolicies
  }

  // 切換策略狀態
  async togglePolicyStatus(policyId) {
    const policy = this.refuelPolicies.find(p => p.id === policyId)
    if (policy) {
      policy.status = policy.status === 'active' ? 'inactive' : 'active'
      return { success: true, policy }
    }
    return { success: false, error: 'Policy not found' }
  }

  // 工具方法
  calculateGasCost(amount, chainId) {
    const rates = {
      1: 2000,    // ETH
      137: 0.8,   // MATIC
      56: 300,    // BNB
      43114: 25,  // AVAX
      10: 2000,   // OP ETH
      250: 0.5    // FTM
    }
    return parseFloat(amount) * (rates[chainId] || 1)
  }

  calculateBridgeFee(gasCost) {
    return gasCost * 0.003 // 0.3% 橋接費用
  }

  calculateTotalCost(amount, chainId) {
    const gasCost = this.calculateGasCost(amount, chainId)
    const bridgeFee = this.calculateBridgeFee(gasCost)
    return gasCost + bridgeFee + 0.5
  }

  async simulateDelay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  // 估算 Gas 費用
  async estimateGasFee(amount, chainId) {
    await this.simulateDelay(200)
    return {
      gasCost: this.calculateGasCost(amount, chainId).toFixed(4),
      bridgeFee: this.calculateBridgeFee(this.calculateGasCost(amount, chainId)).toFixed(4),
      total: this.calculateTotalCost(amount, chainId).toFixed(4)
    }
  }

  // Agent 相關方法

  // 獲取 Agent 設定
  async getAgentSettings(tokenId) {
    await this.simulateDelay(300)
    
    if (this.agentSettings.has(tokenId)) {
      return this.agentSettings.get(tokenId)
    }
    
    // 默認設定
    const defaultSettings = {
      enabled: false,
      policies: mockRefuelPolicies.filter(p => p.tokenId === tokenId),
      globalSettings: {
        maxDailySpend: '100',
        checkInterval: '15',
        notifications: {
          execution: true,
          errors: true,
          lowBalance: true
        }
      }
    }
    
    this.agentSettings.set(tokenId, defaultSettings)
    return defaultSettings
  }

  // 切換 Agent 狀態
  async toggleAgent(tokenId, enabled) {
    await this.simulateDelay(500)
    
    const settings = await this.getAgentSettings(tokenId)
    settings.enabled = enabled
    
    if (!enabled) {
      // 停用所有策略
      settings.policies.forEach(policy => {
        policy.status = 'inactive'
      })
    }
    
    this.agentSettings.set(tokenId, settings)
    return { success: true }
  }

  // 更新策略狀態
  async updatePolicyStatus(policyId, status) {
    await this.simulateDelay(200)
    
    for (const [tokenId, settings] of this.agentSettings) {
      const policy = settings.policies.find(p => p.id === policyId)
      if (policy) {
        policy.status = status
        this.agentSettings.set(tokenId, settings)
        return { success: true }
      }
    }
    
    return { success: false, error: 'Policy not found' }
  }

  // 刪除策略
  async deletePolicy(policyId) {
    await this.simulateDelay(300)
    
    for (const [tokenId, settings] of this.agentSettings) {
      const policyIndex = settings.policies.findIndex(p => p.id === policyId)
      if (policyIndex !== -1) {
        settings.policies.splice(policyIndex, 1)
        this.agentSettings.set(tokenId, settings)
        return { success: true }
      }
    }
    
    return { success: false, error: 'Policy not found' }
  }

  // 創建新策略
  async createPolicy(policyData) {
    await this.simulateDelay(500)
    
    const tokenId = policyData.tokenId || 1 // 默認使用第一個卡片
    const settings = await this.getAgentSettings(tokenId)
    
    const newPolicy = {
      ...policyData,
      id: Date.now(),
      tokenId,
      createdAt: new Date().toISOString(),
      lastTriggered: null,
      executeCount: 0
    }
    
    settings.policies.push(newPolicy)
    this.agentSettings.set(tokenId, settings)
    
    return { success: true, policy: newPolicy }
  }

  // 更新策略
  async updatePolicy(policyData) {
    await this.simulateDelay(400)
    
    for (const [tokenId, settings] of this.agentSettings) {
      const policyIndex = settings.policies.findIndex(p => p.id === policyData.id)
      if (policyIndex !== -1) {
        settings.policies[policyIndex] = { ...settings.policies[policyIndex], ...policyData }
        this.agentSettings.set(tokenId, settings)
        return { success: true }
      }
    }
    
    return { success: false, error: 'Policy not found' }
  }

  // 儲存 Agent 設定
  async saveAgentSettings(tokenId, settings) {
    await this.simulateDelay(800)
    
    this.agentSettings.set(tokenId, settings)
    
    // 記錄設定變更歷史
    const transaction = {
      id: Date.now(),
      hash: '0x' + Math.random().toString(16).substr(2, 64),
      type: 'Agent 設定更新',
      description: `更新了 ${settings.policies.length} 個策略設定`,
      timestamp: new Date().toLocaleString('zh-TW'),
      status: 'completed'
    }
    
    this.transactionHistory.unshift(transaction)
    
    return { success: true, transaction }
  }

  // 轉移儲值卡餘額
  async transferBalance(params) {
    const { fromTokenId, toTokenId, amount } = params
    
    try {
      await this.simulateDelay(1200)
      
      // 檢查來源卡餘額
      const fromCardIndex = this.userCards.findIndex(card => card.tokenId === fromTokenId)
      const toCardIndex = this.userCards.findIndex(card => card.tokenId === toTokenId)
      
      if (fromCardIndex === -1 || toCardIndex === -1) {
        throw new Error('找不到指定的儲值卡')
      }
      
      const fromCard = this.userCards[fromCardIndex]
      const toCard = this.userCards[toCardIndex]
      
      if (parseFloat(fromCard.balance) < parseFloat(amount)) {
        throw new Error('來源卡餘額不足')
      }
      
      // 執行轉移
      this.userCards[fromCardIndex].balance = (parseFloat(fromCard.balance) - parseFloat(amount)).toFixed(2)
      this.userCards[toCardIndex].balance = (parseFloat(toCard.balance) + parseFloat(amount)).toFixed(2)
      
      // 更新時間
      const now = new Date().toLocaleString('zh-TW')
      this.userCards[fromCardIndex].lastUpdate = now
      this.userCards[toCardIndex].lastUpdate = now
      
      // 記錄交易
      const transaction = {
        id: Date.now(),
        hash: '0x' + Math.random().toString(16).substr(2, 64),
        type: '餘額轉移',
        description: `從 #${fromTokenId} 轉移 $${amount} 到 #${toTokenId}`,
        amount: amount,
        fromTokenId,
        toTokenId,
        timestamp: now,
        status: 'completed'
      }
      
      this.transactionHistory.unshift(transaction)
      
      return {
        success: true,
        txHash: transaction.hash,
        transaction
      }
    } catch (error) {
      console.error('Transfer failed:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }
}

// 單例模式
export const gasPassService = new GasPassService()
export default gasPassService