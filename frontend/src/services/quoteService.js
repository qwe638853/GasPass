// Cross-chain swap quote service
class QuoteService {
  constructor() {
    // Dynamically set backend URL based on environment
    this.baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api/gaspass';
  }

  // Get cross-chain swap quote
  async getQuote(params) {
    try {
      const { destinationChainId, amount, userAddress } = params;
      
      console.log('📊 Requesting cross-chain swap quote:', params);
      
      const response = await fetch(`${this.baseUrl}/quote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          destinationChainId: destinationChainId,
          amount: amount,
          userAddress: userAddress
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to get quote');
      }

      console.log('✅ Quote retrieved successfully:', data);
      return data;
      
    } catch (error) {
      console.error('❌ Failed to get quote:', error);
      throw error;
    }
  }

  // Calculate actual received amount (from quote)
  async calculateActualAmount(params) {
    try {
      const quote = await this.getQuote(params);
      
      // 根據目標鏈確定代幣精度
      const decimals = this.getTokenDecimals(params.destinationChainId);
      
      // 將最小輸出金額從 wei 轉換為實際代幣單位
      const actualAmount = parseFloat(quote.minOutputAmount) / Math.pow(10, decimals);
      
      return {
        actualAmount: actualAmount.toFixed(6),
        minOutputAmount: quote.minOutputAmount,
        inputAmount: quote.inputAmount,
        destinationChainId: quote.destinationChainId
      };
      
    } catch (error) {
      console.error('❌ 計算實際金額失敗:', error);
      // 返回預設值
      return {
        actualAmount: '0.000000',
        minOutputAmount: '0',
        inputAmount: params.amount,
        destinationChainId: params.destinationChainId,
        error: error.message
      };
    }
  }

  // 獲取不同鏈的原生代幣精度
  getTokenDecimals(chainId) {
    // 大部分 EVM 鏈的原生代幣都是 18 位小數
    // 但有些鏈可能不同，這裡可以根據需要調整
    const specialDecimals = {
      // 如果有特殊精度的鏈，可以在這裡定義
      // 例如：'137': 18, // Polygon MATIC
    };
    
    return specialDecimals[chainId] || 18; // 預設 18 位小數
  }
}

// 創建單例實例
const quoteService = new QuoteService();
export default quoteService;
