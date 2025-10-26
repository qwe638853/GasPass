/**
 * Bungee Token List API Service
 * Used to fetch token lists and icons
 */

const BUNGEE_API_BASE = 'https://public-backend.bungee.exchange';

class BungeeTokenService {
  constructor() {
    this.tokenCache = new Map();
    this.cacheExpiry = 5 * 60 * 1000; // 5 minutes cache
    this.lastFetchTime = 0;
  }

  /**
   * Get all token lists
   * @returns {Promise<Array>} Token list
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
      
      // Bungee API returns data structure: { success: true, result: { "1": [...], "42161": [...] } }
      if (data.success && data.result) {
        // Merge tokens from all chains into a single array
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
   * Get token list by chain ID
   * @param {number} chainId - Chain ID
   * @returns {Promise<Array>} Token list for that chain
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
   * Get token information by address
   * @param {string} address - Token contract address
   * @param {number} chainId - Chain ID
   * @returns {Promise<Object|null>} Token information
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
   * Get token icon URL
   * @param {string} address - Token contract address
   * @param {number} chainId - Chain ID
   * @returns {Promise<string|null>} Icon URL
   */
  async getTokenIcon(address, chainId) {
    const cacheKey = `${chainId}-${address.toLowerCase()}`;
    
    // Check cache
    if (this.tokenCache.has(cacheKey)) {
      const cached = this.tokenCache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.cacheExpiry) {
        return cached.icon;
      }
    }

    try {
      const token = await this.getTokenByAddress(address, chainId);
      const icon = token?.logoURI || null;
      
      // Cache result
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
   * Batch get token icons
   * @param {Array} tokenAddresses - Token address array [{address, chainId}]
   * @returns {Promise<Map>} Map of address to icon URL
   */
  async getTokenIconsBatch(tokenAddresses) {
    const iconMap = new Map();
    
    try {
      // Group by chain ID
      const tokensByChain = {};
      tokenAddresses.forEach(({ address, chainId }) => {
        if (!tokensByChain[chainId]) {
          tokensByChain[chainId] = [];
        }
        tokensByChain[chainId].push(address);
      });

      // Fetch each chain's token list in parallel
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
   * Clear cache
   */
  clearCache() {
    this.tokenCache.clear();
    this.lastFetchTime = 0;
  }

  /**
   * Get native token icon (using default icon)
   * @param {number} chainId - Chain ID
   * @returns {string} Native token icon URL
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

// Create singleton instance
export const bungeeTokenService = new BungeeTokenService();

export default bungeeTokenService;
