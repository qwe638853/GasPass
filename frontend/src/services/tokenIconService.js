/**
 * 代幣圖標服務
 * 整合 Bungee API 和本地配置，提供統一的代幣圖標獲取接口
 */

import { bungeeTokenService } from './bungeeTokenService.js';
import { SUPPORTED_CHAINS } from '../config/BungeeConfig.js';
import { iconUrlService } from './iconUrlService.js';

class TokenIconService {
  constructor() {
    this.iconCache = new Map();
    this.fallbackIcons = new Map();
    this.initFallbackIcons();
  }

  /**
   * 初始化備用圖標
   */
  initFallbackIcons() {
    // 常見代幣的備用圖標 - 使用 CoinGecko
    this.fallbackIcons.set('USDC', 'https://assets.coingecko.com/coins/images/6319/large/USD_Coin_icon.png');
    this.fallbackIcons.set('USDT', 'https://assets.coingecko.com/coins/images/325/large/Tether.png');
    this.fallbackIcons.set('WETH', 'https://assets.coingecko.com/coins/images/279/large/ethereum.png');
    this.fallbackIcons.set('WBTC', 'https://assets.coingecko.com/coins/images/7598/large/wrapped_bitcoin_wbtc.png');
    this.fallbackIcons.set('DAI', 'https://assets.coingecko.com/coins/images/9956/large/Badge_Dai.png');
    this.fallbackIcons.set('LINK', 'https://assets.coingecko.com/coins/images/877/large/chainlink-new-logo.png');
    this.fallbackIcons.set('UNI', 'https://assets.coingecko.com/coins/images/12504/large/uniswap-uni.png');
    this.fallbackIcons.set('AAVE', 'https://assets.coingecko.com/coins/images/12645/large/AAVE.png');
    this.fallbackIcons.set('CRV', 'https://assets.coingecko.com/coins/images/12124/large/Curve.png');
    this.fallbackIcons.set('COMP', 'https://assets.coingecko.com/coins/images/10775/large/COMP.png');
  }

  /**
   * 獲取代幣圖標
   * @param {string} address - 代幣合約地址
   * @param {number} chainId - 鏈ID
   * @param {string} symbol - 代幣符號（可選，用於備用圖標）
   * @returns {Promise<string>} 圖標URL
   */
  async getTokenIcon(address, chainId, symbol = null) {
    const cacheKey = `${chainId}-${address.toLowerCase()}`;
    
    // 檢查緩存
    if (this.iconCache.has(cacheKey)) {
      return this.iconCache.get(cacheKey);
    }

    try {
      // 首先嘗試從 Bungee API 獲取
      let iconUrl = await bungeeTokenService.getTokenIcon(address, chainId);
      
      // 如果沒有找到，嘗試使用備用圖標
      if (!iconUrl && symbol) {
        iconUrl = this.fallbackIcons.get(symbol.toUpperCase());
      }
      
      // 如果還是沒有，使用默認圖標
      if (!iconUrl) {
        iconUrl = this.getDefaultTokenIcon();
      }

      // 緩存結果
      this.iconCache.set(cacheKey, iconUrl);
      return iconUrl;
    } catch (error) {
      console.error(`Failed to get token icon for ${address}:`, error);
      return this.getDefaultTokenIcon();
    }
  }

  /**
   * 獲取原生代幣圖標
   * @param {number} chainId - 鏈ID
   * @returns {string} 原生代幣圖標URL
   */
  getNativeTokenIcon(chainId) {
    return bungeeTokenService.getNativeTokenIcon(chainId);
  }

  /**
   * 獲取鏈圖標
   * @param {number} chainId - 鏈ID
   * @returns {string} 鏈圖標URL
   */
  getChainIcon(chainId) {
    // 首先嘗試使用 iconUrlService
    const iconUrl = iconUrlService.getChainIconUrl(chainId);
    if (iconUrl !== iconUrlService.getDefaultIconUrl()) {
      return iconUrl;
    }
    
    // 回退到配置文件
    const chain = SUPPORTED_CHAINS[chainId];
    return chain?.logo || this.getDefaultChainIcon();
  }

  /**
   * 批量獲取代幣圖標
   * @param {Array} tokens - 代幣數組 [{address, chainId, symbol}]
   * @returns {Promise<Map>} 地址到圖標URL的映射
   */
  async getTokenIconsBatch(tokens) {
    const iconMap = new Map();
    
    try {
      // 使用 Bungee 服務批量獲取
      const tokenAddresses = tokens.map(t => ({ address: t.address, chainId: t.chainId }));
      const bungeeIcons = await bungeeTokenService.getTokenIconsBatch(tokenAddresses);
      
      // 處理結果
      tokens.forEach(token => {
        const cacheKey = `${token.chainId}-${token.address.toLowerCase()}`;
        let iconUrl = bungeeIcons.get(cacheKey);
        
        // 如果 Bungee 沒有，嘗試備用圖標
        if (!iconUrl && token.symbol) {
          iconUrl = this.fallbackIcons.get(token.symbol.toUpperCase());
        }
        
        // 最後使用默認圖標
        if (!iconUrl) {
          iconUrl = this.getDefaultTokenIcon();
        }
        
        iconMap.set(cacheKey, iconUrl);
        this.iconCache.set(cacheKey, iconUrl);
      });
    } catch (error) {
      console.error('Failed to get token icons batch:', error);
      // 使用默認圖標
      tokens.forEach(token => {
        const cacheKey = `${token.chainId}-${token.address.toLowerCase()}`;
        const iconUrl = this.fallbackIcons.get(token.symbol?.toUpperCase()) || this.getDefaultTokenIcon();
        iconMap.set(cacheKey, iconUrl);
        this.iconCache.set(cacheKey, iconUrl);
      });
    }

    return iconMap;
  }

  /**
   * 預載入常用代幣圖標
   * @param {number} chainId - 鏈ID
   */
  async preloadCommonTokens(chainId) {
    const commonTokens = [
      { address: '0xA0b86a33E6441b8C4C8C0C4C8C0C4C8C0C4C8C0C', symbol: 'USDC' }, // 示例地址
      { address: '0xdAC17F958D2ee523a2206206994597C13D831ec7', symbol: 'USDT' },
      { address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', symbol: 'WETH' },
      { address: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599', symbol: 'WBTC' }
    ];

    try {
      await this.getTokenIconsBatch(commonTokens.map(token => ({
        ...token,
        chainId
      })));
    } catch (error) {
      console.error('Failed to preload common tokens:', error);
    }
  }

  /**
   * 獲取默認代幣圖標
   * @returns {string} 默認圖標URL
   */
  getDefaultTokenIcon() {
    return iconUrlService.getDefaultIconUrl();
  }

  /**
   * 獲取默認鏈圖標
   * @returns {string} 默認鏈圖標URL
   */
  getDefaultChainIcon() {
    return iconUrlService.getDefaultIconUrl();
  }

  /**
   * 清除緩存
   */
  clearCache() {
    this.iconCache.clear();
    bungeeTokenService.clearCache();
  }

  /**
   * 檢查圖標URL是否有效
   * @param {string} url - 圖標URL
   * @returns {Promise<boolean>} 是否有效
   */
  async isValidIconUrl(url) {
    try {
      const response = await fetch(url, { method: 'HEAD' });
      return response.ok;
    } catch (error) {
      return false;
    }
  }

  /**
   * 獲取所有支援的鏈
   * @returns {Object} 支援的鏈配置
   */
  getSupportedChains() {
    return SUPPORTED_CHAINS;
  }
}

// 創建單例實例
export const tokenIconService = new TokenIconService();

export default tokenIconService;
