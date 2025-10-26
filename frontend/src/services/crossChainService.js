// Cross-chain swap service
import { supportedChains, mockSwapHistory } from '../utils/mockData.js'

class CrossChainService {
  constructor() {
    this.swapHistory = mockSwapHistory
    this.supportedChains = supportedChains
    this.chainBalances = {}
  }

  // Get supported chains
  getSupportedChains() {
    return this.supportedChains
  }

  // Get chain information
  getChainInfo(chainId) {
    return this.supportedChains.find(chain => chain.id === chainId)
  }

  // Estimate cross-chain swap cost
  async estimateSwapCost(fromChain, toChain, amount) {
    await this.simulateDelay(800)
    
    const fromChainInfo = this.getChainInfo(fromChain)
    const toChainInfo = this.getChainInfo(toChain)
    
    if (!fromChainInfo || !toChainInfo) {
      throw new Error('Unsupported chain')
    }

    // 模擬費用計算
    const baseAmount = parseFloat(amount)
    const exchangeRate = this.getExchangeRate(fromChainInfo.symbol, toChainInfo.symbol)
    const outputAmount = baseAmount * exchangeRate
    
    const bridgeFee = Math.max(baseAmount * 0.003, 0.1) // 最低 0.1 USD
    const gasFee = this.getEstimatedGasFee(toChain)
    const slippage = outputAmount * 0.005 // 0.5% 滑點
    
    return {
      inputAmount: baseAmount,
      outputAmount: outputAmount.toFixed(6),
      exchangeRate: exchangeRate.toFixed(6),
      bridgeFee: bridgeFee.toFixed(4),
      gasFee: gasFee.toFixed(4),
      slippage: slippage.toFixed(6),
      totalCost: (bridgeFee + gasFee).toFixed(4),
      estimatedTime: this.getEstimatedTime(fromChain, toChain)
    }
  }

  // 執行跨鏈轉換
  async executeSwap(params) {
    const { 
      fromChain, 
      toChain, 
      amount, 
      recipientAddress, 
      slippageTolerance = 1.0 
    } = params
    
    try {
      // 驗證參數
      if (!amount || parseFloat(amount) <= 0) {
        throw new Error('無效的轉換金額')
      }
      
      if (!recipientAddress || !this.isValidAddress(recipientAddress)) {
        throw new Error('無效的接收地址')
      }

      const fromChainInfo = this.getChainInfo(fromChain)
      const toChainInfo = this.getChainInfo(toChain)
      
      if (!fromChainInfo || !toChainInfo) {
        throw new Error('不支援的鏈')
      }

      // 模擬轉換過程
      await this.simulateSwapProcess()
      
      // 計算輸出金額
      const estimate = await this.estimateSwapCost(fromChain, toChain, amount)
      
      // 創建交易記錄
      const swap = {
        id: Date.now(),
        hash: '0x' + Math.random().toString(16).substr(2, 64),
        fromChain: fromChainInfo,
        toChain: toChainInfo,
        inputAmount: amount,
        outputAmount: estimate.outputAmount,
        recipientAddress,
        status: 'completed',
        timestamp: new Date().toLocaleString('zh-TW'),
        estimatedTime: estimate.estimatedTime,
        actualTime: Math.floor(Math.random() * 300) + 60, // 1-5分鐘
        bridgeFee: estimate.bridgeFee,
        gasFee: estimate.gasFee
      }
      
      this.swapHistory.unshift(swap)
      
      return {
        success: true,
        txHash: swap.hash,
        swap
      }
    } catch (error) {
      console.error('Cross-chain swap failed:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  // 獲取交換歷史
  async getSwapHistory(walletAddress, limit = 10) {
    await this.simulateDelay(300)
    return this.swapHistory.slice(0, limit)
  }

  // 獲取多鏈餘額
  async getMultiChainBalances(walletAddress) {
    await this.simulateDelay(500)
    
    // 模擬各鏈餘額
    const balances = {
      1: (Math.random() * 5).toFixed(4),      // ETH
      137: (Math.random() * 1000).toFixed(2), // MATIC
      56: (Math.random() * 10).toFixed(3),    // BNB
      43114: (Math.random() * 50).toFixed(2), // AVAX
      10: (Math.random() * 3).toFixed(4),     // ETH on Optimism
      250: (Math.random() * 5000).toFixed(1)  // FTM
    }
    
    this.chainBalances = balances
    return balances
  }

  // 刷新匯率
  async refreshRates() {
    await this.simulateDelay(800)
    // 模擬刷新匯率
    return { success: true }
  }

  // 獲取兌換報價
  async getSwapQuote(params) {
    const { fromChainId, toChainId, fromAmount, slippage = 0.5 } = params
    
    await this.simulateDelay(600)
    
    const fromChain = this.getChainInfo(fromChainId)
    const toChain = this.getChainInfo(toChainId)
    
    if (!fromChain || !toChain) {
      throw new Error('不支援的鏈')
    }
    
    const exchangeRate = this.getExchangeRate(fromChain.symbol, toChain.symbol)
    const outputAmount = (parseFloat(fromAmount) * exchangeRate).toFixed(6)
    const minimumReceived = (parseFloat(outputAmount) * (1 - slippage / 100)).toFixed(6)
    
    const bridgeFee = Math.max(parseFloat(fromAmount) * 0.003, 0.1).toFixed(2)
    const gasFee = this.getEstimatedGasFee(toChainId).toFixed(2)
    const totalFee = (parseFloat(bridgeFee) + parseFloat(gasFee)).toFixed(2)
    
    return {
      outputAmount,
      rate: exchangeRate.toFixed(6),
      minimumReceived,
      bridgeFee,
      gasFee,
      totalFee,
      estimatedTime: this.getEstimatedTime(fromChainId, toChainId),
      route: `${fromChain.name} → ${toChain.name}`
    }
  }

  // 執行兌換
  async executeSwap(swapData) {
    await this.simulateDelay(3000)
    
    const txHash = '0x' + Math.random().toString(16).substr(2, 64)
    
    const swap = {
      id: Date.now(),
      hash: txHash,
      fromChain: this.getChainInfo(swapData.fromChainId),
      toChain: this.getChainInfo(swapData.toChainId),
      inputAmount: swapData.fromAmount,
      outputAmount: swapData.toAmount,
      recipientAddress: swapData.recipientAddress,
      status: 'completed',
      timestamp: new Date().toLocaleString('zh-TW'),
      bridgeFee: swapData.quote?.bridgeFee || '0.10',
      gasFee: swapData.quote?.gasFee || '0.50'
    }
    
    this.swapHistory.unshift(swap)
    
    return {
      success: true,
      txHash,
      swap
    }
  }

  // 獲取交換狀態
  async getSwapStatus(txHash) {
    await this.simulateDelay(500)
    const swap = this.swapHistory.find(s => s.hash === txHash)
    
    if (!swap) {
      return { found: false }
    }
    
    return {
      found: true,
      status: swap.status,
      progress: this.getSwapProgress(swap),
      estimatedCompletion: this.getEstimatedCompletion(swap)
    }
  }

  // 獲取支援的路由
  async getSupportedRoutes(fromChain, toChain) {
    await this.simulateDelay(400)
    
    // 模擬不同的路由選項
    const routes = [
      {
        id: 'direct',
        name: '直接橋接',
        protocol: 'Avail SDK',
        estimatedTime: '2-5 分鐘',
        fee: '0.1%',
        reliability: 98
      },
      {
        id: 'debridge',
        name: 'deBridge',
        protocol: 'deBridge',
        estimatedTime: '3-8 分鐘',
        fee: '0.05%',
        reliability: 96
      }
    ]
    
    return routes
  }

  // 工具方法
  getExchangeRate(fromSymbol, toSymbol) {
    // 模擬匯率 (實際應該從價格 API 獲取)
    const rates = {
      'ETH': { 'ETH': 1, 'MATIC': 2500, 'BNB': 6, 'AVAX': 60, 'FTM': 4000 },
      'MATIC': { 'ETH': 0.0004, 'MATIC': 1, 'BNB': 0.0024, 'AVAX': 0.024, 'FTM': 1.6 },
      'BNB': { 'ETH': 0.167, 'MATIC': 417, 'BNB': 1, 'AVAX': 10, 'FTM': 667 },
      'AVAX': { 'ETH': 0.0167, 'MATIC': 41.7, 'BNB': 0.1, 'AVAX': 1, 'FTM': 66.7 },
      'FTM': { 'ETH': 0.00025, 'MATIC': 0.625, 'BNB': 0.0015, 'AVAX': 0.015, 'FTM': 1 }
    }
    
    return rates[fromSymbol]?.[toSymbol] || 1
  }

  getEstimatedGasFee(chainId) {
    const gasFees = {
      1: 15,      // Ethereum - 高
      137: 0.01,  // Polygon - 低
      56: 0.2,    // BNB Chain - 低
      43114: 0.5, // Avalanche - 中
      10: 2,      // Optimism - 中
      250: 0.01   // Fantom - 低
    }
    
    return gasFees[chainId] || 1
  }

  getEstimatedTime(fromChain, toChain) {
    // 基於鏈的複雜度估算時間
    const complexity = {
      1: 5,    // Ethereum
      137: 2,  // Polygon
      56: 2,   // BNB
      43114: 3, // Avalanche
      10: 3,   // Optimism
      250: 2   // Fantom
    }
    
    const fromComplexity = complexity[fromChain] || 3
    const toComplexity = complexity[toChain] || 3
    const avgTime = (fromComplexity + toComplexity) / 2
    
    return `${Math.floor(avgTime)}-${Math.ceil(avgTime * 1.5)} 分鐘`
  }

  getSwapProgress(swap) {
    // 模擬進度
    const now = Date.now()
    const swapTime = new Date(swap.timestamp).getTime()
    const elapsed = (now - swapTime) / 1000 / 60 // 分鐘
    
    if (swap.status === 'completed') return 100
    if (elapsed > 10) return 95
    if (elapsed > 5) return 75
    if (elapsed > 2) return 50
    if (elapsed > 1) return 25
    return 10
  }

  getEstimatedCompletion(swap) {
    if (swap.status === 'completed') return '已完成'
    
    const estimatedMinutes = parseInt(swap.estimatedTime.split('-')[1])
    const elapsed = (Date.now() - new Date(swap.timestamp).getTime()) / 1000 / 60
    const remaining = Math.max(0, estimatedMinutes - elapsed)
    
    if (remaining < 1) return '即將完成'
    return `剩餘約 ${Math.ceil(remaining)} 分鐘`
  }

  isValidAddress(address) {
    // 簡單的地址驗證
    return address && address.length === 42 && address.startsWith('0x')
  }

  async simulateDelay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  async simulateSwapProcess() {
    // 模擬跨鏈轉換的多個階段
    const stages = [
      { name: '驗證交易', duration: 500 },
      { name: '鎖定資產', duration: 1000 },
      { name: '跨鏈傳輸', duration: 1500 },
      { name: '解鎖資產', duration: 800 },
      { name: '確認完成', duration: 300 }
    ]
    
    for (const stage of stages) {
      await this.simulateDelay(stage.duration)
    }
  }

  // 獲取推薦的轉換金額
  getRecommendedAmounts(chainId) {
    const recommendations = {
      1: ['0.01', '0.05', '0.1'],      // ETH
      137: ['10', '50', '100'],        // MATIC
      56: ['0.1', '0.5', '1'],         // BNB
      43114: ['1', '5', '10'],         // AVAX
      10: ['0.01', '0.05', '0.1'],     // ETH on Optimism
      250: ['100', '500', '1000']      // FTM
    }
    
    return recommendations[chainId] || ['1', '5', '10']
  }
}

// 單例模式
export const crossChainService = new CrossChainService()
export default crossChainService