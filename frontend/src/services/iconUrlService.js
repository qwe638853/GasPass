/**
 * 圖標 URL 映射服務
 * 提供可靠的圖標 URL，避免 CORS 問題
 */

class IconUrlService {
  constructor() {
    this.iconUrls = new Map();
    this.initIconUrls();
  }

  /**
   * 初始化圖標 URL 映射
   */
  initIconUrls() {
    // 使用更可靠的 CDN 和圖標來源 - 優先使用 Socket.tech 和 CoinGecko
    const iconMappings = {
      // 主要鏈圖標 - 使用 Socket.tech 的圖標
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
      
      // 常用代幣圖標 - 使用 CoinGecko
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

    // 將映射添加到 Map 中
    Object.entries(iconMappings).forEach(([key, url]) => {
      this.iconUrls.set(key.toLowerCase(), url);
    });
  }

  /**
   * 獲取鏈圖標 URL
   * @param {number} chainId - 鏈ID
   * @returns {string} 圖標URL
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
   * 獲取代幣圖標 URL
   * @param {string} symbol - 代幣符號
   * @returns {string} 圖標URL
   */
  getTokenIconUrl(symbol) {
    if (!symbol) return this.getDefaultIconUrl();
    
    const symbolKey = symbol.toLowerCase();
    return this.iconUrls.get(symbolKey) || this.getDefaultIconUrl();
  }

  /**
   * 獲取默認圖標 URL
   * @returns {string} 默認圖標URL
   */
  getDefaultIconUrl() {
    return 'https://media.socket.tech/networks/ethereum.svg';
  }

  /**
   * 檢查圖標 URL 是否存在
   * @param {string} url - 圖標URL
   * @returns {boolean} 是否存在
   */
  hasIconUrl(key) {
    return this.iconUrls.has(key.toLowerCase());
  }

  /**
   * 添加自定義圖標 URL
   * @param {string} key - 圖標鍵
   * @param {string} url - 圖標URL
   */
  addIconUrl(key, url) {
    this.iconUrls.set(key.toLowerCase(), url);
  }

  /**
   * 獲取所有圖標 URL
   * @returns {Map} 所有圖標URL映射
   */
  getAllIconUrls() {
    return new Map(this.iconUrls);
  }
}

// 創建單例實例
export const iconUrlService = new IconUrlService();

export default iconUrlService;
