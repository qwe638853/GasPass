/**
 * Icon URL Mapping Service
 * Provides reliable icon URLs, avoiding CORS issues
 */

class IconUrlService {
  constructor() {
    this.iconUrls = new Map();
    this.initIconUrls();
  }

  /**
   * Initialize icon URL mappings
   */
  initIconUrls() {
    // Use more reliable CDN and icon sources - prefer Socket.tech and CoinGecko
    const iconMappings = {
      // Main chain icons - using Socket.tech icons
      'ethereum': 'https://media.socket.tech/networks/ethereum.svg',
      'arbitrum': 'https://media.socket.tech/networks/arbitrum.svg',
      'base': 'https://media.socket.tech/networks/base.svg',
      'avalanche': 'https://media.socket.tech/networks/avalanche.svg',
      'bsc': 'https://media.socket.tech/networks/bsc.svg',
      'polygon': 'https://media.socket.tech/networks/polygon.svg',
      'optimism': 'https://media.socket.tech/networks/optimism.svg',
      'gnosis': 'https://media.socket.tech/networks/gnosis.svg',
      'mantle': 'https://media.socket.tech/networks/mantle.svg',
      'mode': 'https://media.socket.tech/networks/mode.svg',
      'blast': 'https://media.socket.tech/networks/blast.svg',
      'linea': 'https://media.socket.tech/networks/linea.svg',
      'scroll': 'https://media.socket.tech/networks/scroll.svg',
      'sonic': 'https://media.socket.tech/networks/soneium.png',
      'berachain': 'https://media.socket.tech/networks/berachain.svg',
      'ink': 'https://media.socket.tech/networks/ink.svg',
      'unichain': 'https://media.socket.tech/networks/unichain.png',
      
      // Common token icons - using CoinGecko
      'usdc': 'https://assets.coingecko.com/coins/images/6319/large/usdc.png',
      'usdt': 'https://assets.coingecko.com/coins/images/325/large/Tether.png',
      'weth': 'https://assets.coingecko.com/coins/images/2518/large/weth.png',
      'wbtc': 'https://assets.coingecko.com/coins/images/7598/large/wrapped_bitcoin_wbtc.png',
      'dai': 'https://assets.coingecko.com/coins/images/9956/large/Badge_Dai.png',
      'link': 'https://assets.coingecko.com/coins/images/877/large/chainlink-new-logo.png',
      'uni': 'https://assets.coingecko.com/coins/images/12504/large/uniswap-uni.png',
      'aave': 'https://assets.coingecko.com/coins/images/12645/large/AAVE.png',
      'crv': 'https://assets.coingecko.com/coins/images/12124/large/Curve.png',
      'comp': 'https://assets.coingecko.com/coins/images/10775/large/COMP.png',
      'fdusd': 'https://assets.coingecko.com/coins/images/31079/large/FDUSD_icon_black.png'
    };

    // Add mappings to Map
    Object.entries(iconMappings).forEach(([key, url]) => {
      this.iconUrls.set(key.toLowerCase(), url);
    });
  }

  /**
   * Get chain icon URL
   * @param {number} chainId - Chain ID
   * @returns {string} Icon URL
   */
  getChainIconUrl(chainId) {
    const chainMap = {
      1: 'ethereum',
      42161: 'arbitrum',
      8453: 'base',
      43114: 'avalanche',
      56: 'bsc',
      100: 'gnosis',
      5000: 'mantle',
      34443: 'mode',
      130: 'unichain',
      1868: 'sonic',
      57073: 'ink',
      81457: 'blast',
      59144: 'linea',
      137: 'polygon',
      534352: 'scroll',
      146: 'sonic',
      10: 'optimism',
      80094: 'berachain'
    };

    const chainKey = chainMap[chainId];
    return chainKey ? this.iconUrls.get(chainKey) : this.getDefaultIconUrl();
  }

  /**
   * Get token icon URL
   * @param {string} symbol - Token symbol
   * @returns {string} Icon URL
   */
  getTokenIconUrl(symbol) {
    if (!symbol) return this.getDefaultIconUrl();
    
    const symbolKey = symbol.toLowerCase();
    return this.iconUrls.get(symbolKey) || this.getDefaultIconUrl();
  }

  /**
   * Get default icon URL
   * @returns {string} Default icon URL
   */
  getDefaultIconUrl() {
    return 'https://media.socket.tech/networks/ethereum.svg';
  }

  /**
   * Check if icon URL exists
   * @param {string} url - Icon URL
   * @returns {boolean} Whether it exists
   */
  hasIconUrl(key) {
    return this.iconUrls.has(key.toLowerCase());
  }

  /**
   * Add custom icon URL
   * @param {string} key - Icon key
   * @param {string} url - Icon URL
   */
  addIconUrl(key, url) {
    this.iconUrls.set(key.toLowerCase(), url);
  }

  /**
   * Get all icon URLs
   * @returns {Map} All icon URL mappings
   */
  getAllIconUrls() {
    return new Map(this.iconUrls);
  }
}

// Create singleton instance
export const iconUrlService = new IconUrlService();

export default iconUrlService;
