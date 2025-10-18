// 贈送儲值卡服務

// 模擬贈送儲值卡功能
export const giftCardService = {
  // 贈送儲值卡
  async giftCards({ quantity, amountPerCard, recipientType, recipientAddress }) {
    try {
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
