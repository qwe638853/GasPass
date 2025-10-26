/**
 * Bungee Token List API 服務
 * 用於獲取代幣列表和圖標
 */

const BUNGEE_API_BASE = 'https://public-backend.bungee.exchange';

class BungeeTokenService {
  constructor() {
    this.tokenCache = new Map();
    this.cacheExpiry = 5 * 60 * 1000; // 5分鐘緩存
    this.lastFetchTime = 0;
  }

  /**
   * 獲取所有代幣列表
   * @returns {Promise<Array>} 代幣列表
   */
  async getTokenList() {
    try {
      const response = await fetch(`${BUNGEE_API_BASE}/api/v1/tokens/list`, {
        headers: {
          'Accept': 'application/json'
        }
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      
      // Bungee API 返回的數據結構是 { success: true, result: { "1": [...], "42161": [...] } }
      if (data.success && data.result) {
        // 將所有鏈的代幣合併成一個數組
        const allTokens = [];
        Object.values(data.result).forEach(chainTokens => {
          allTokens.push(...chainTokens);
        });
        return allTokens;
      }
      
      return [];
    } catch (error) {
      console.error('Failed to fetch token list from Bungee:', error);
      return [];
    }
  }

  /**
   * 根據鏈ID獲取代幣列表
   * @param {number} chainId - 鏈ID
   * @returns {Promise<Array>} 該鏈的代幣列表
   */
  async getTokensByChain(chainId) {
    try {
      const allTokens = await this.getTokenList();
      return allTokens.filter(token => token.chainId === chainId);
    } catch (error) {
      console.error(`Failed to fetch tokens for chain ${chainId}:`, error);
      return [];
    }
  }

  /**
   * 根據地址獲取代幣信息
   * @param {string} address - 代幣合約地址
   * @param {number} chainId - 鏈ID
   * @returns {Promise<Object|null>} 代幣信息
   */
  async getTokenByAddress(address, chainId) {
    try {
      const tokens = await this.getTokensByChain(chainId);
      return tokens.find(token => 
        token.address.toLowerCase() === address.toLowerCase()
      ) || null;
    } catch (error) {
      console.error(`Failed to fetch token ${address} on chain ${chainId}:`, error);
      return null;
    }
  }

  /**
   * 獲取代幣圖標URL
   * @param {string} address - 代幣合約地址
   * @param {number} chainId - 鏈ID
   * @returns {Promise<string|null>} 圖標URL
   */
  async getTokenIcon(address, chainId) {
    const cacheKey = `${chainId}-${address.toLowerCase()}`;
    
    // 檢查緩存
    if (this.tokenCache.has(cacheKey)) {
      const cached = this.tokenCache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.cacheExpiry) {
        return cached.icon;
      }
    }

    try {
      const token = await this.getTokenByAddress(address, chainId);
      const icon = token?.logoURI || null;
      
      // 緩存結果
      this.tokenCache.set(cacheKey, {
        icon,
        timestamp: Date.now()
      });
      
      return icon;
    } catch (error) {
      console.error(`Failed to get token icon for ${address}:`, error);
      return null;
    }
  }

  /**
   * 批量獲取代幣圖標
   * @param {Array} tokenAddresses - 代幣地址數組 [{address, chainId}]
   * @returns {Promise<Map>} 地址到圖標URL的映射
   */
  async getTokenIconsBatch(tokenAddresses) {
    const iconMap = new Map();
    
    try {
      // 按鏈ID分組
      const tokensByChain = {};
      tokenAddresses.forEach(({ address, chainId }) => {
        if (!tokensByChain[chainId]) {
          tokensByChain[chainId] = [];
        }
        tokensByChain[chainId].push(address);
      });

      // 並行獲取每個鏈的代幣列表
      const chainPromises = Object.entries(tokensByChain).map(async ([chainId, addresses]) => {
        const tokens = await this.getTokensByChain(parseInt(chainId));
        addresses.forEach(address => {
          const token = tokens.find(t => 
            t.address.toLowerCase() === address.toLowerCase()
          );
          if (token?.logoURI) {
            iconMap.set(`${chainId}-${address.toLowerCase()}`, token.logoURI);
          }
        });
      });

      await Promise.all(chainPromises);
    } catch (error) {
      console.error('Failed to get token icons batch:', error);
    }

    return iconMap;
  }

  /**
   * 清除緩存
   */
  clearCache() {
    this.tokenCache.clear();
    this.lastFetchTime = 0;
  }

  /**
   * 獲取原生代幣圖標（使用預設圖標）
   * @param {number} chainId - 鏈ID
   * @returns {string} 原生代幣圖標URL
   */
  getNativeTokenIcon(chainId) {
    const nativeTokenIcons = {
      1: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png',
      42161: 'https://assets.coingecko.com/coins/images/16547/large/photo_2023-03-29_21.47.00.jpeg',
      8453: 'https://assets.coingecko.com/coins/images/27575/large/lusd.png',
      43114: 'https://assets.coingecko.com/coins/images/12559/large/Avalanche_Circle_RedWhite_Trans.png',
      56: 'https://assets.coingecko.com/coins/images/825/large/bnb-icon2_2x.png',
      100: 'https://assets.coingecko.com/coins/images/11062/large/Identity_Primary_Dark_Grey.png',
      5000: 'https://assets.coingecko.com/coins/images/30980/large/paxg.png',
      34443: 'https://assets.coingecko.com/coins/images/32545/large/mode.png',
      130: 'https://media.socket.tech/networks/unichain.png',
      1868: 'https://media.socket.tech/networks/soneium.png',
      57073: 'https://media.socket.tech/networks/ink.svg',
      81457: 'https://assets.coingecko.com/coins/images/32545/large/mode.png',
      59144: 'https://assets.coingecko.com/coins/images/32545/large/mode.png',
      137: 'https://assets.coingecko.com/coins/images/4713/large/matic-token-icon.png',
      534352: 'https://assets.coingecko.com/coins/images/32545/large/mode.png',
      146: 'https://assets.coingecko.com/coins/images/32545/large/mode.png',
      10: 'https://assets.coingecko.com/coins/images/25244/large/Optimism.png',
      80094: 'https://assets.coingecko.com/coins/images/32545/large/mode.png'
    };

    return nativeTokenIcons[chainId] || 'https://assets.coingecko.com/coins/images/279/large/ethereum.png';
  }
}

// 創建單例實例
export const bungeeTokenService = new BungeeTokenService();

export default bungeeTokenService;
