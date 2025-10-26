/**
 * Token Icon Service
 * Integrates Bungee API and local configuration to provide unified token icon retrieval interface
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
   * Initialize fallback icons
   */
  initFallbackIcons() {
    // Common tokens' fallback icons - using CoinGecko
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
   * Get token icon
   * @param {string} address - Token contract address
   * @param {number} chainId - Chain ID
   * @param {string} symbol - Token symbol (optional, used for fallback icon)
   * @returns {Promise<string>} Icon URL
   */
  async getTokenIcon(address, chainId, symbol = null) {
    const cacheKey = `${chainId}-${address.toLowerCase()}`;
    
    // Check cache
    if (this.iconCache.has(cacheKey)) {
      return this.iconCache.get(cacheKey);
    }

    try {
      // First try to get from Bungee API
      let iconUrl = await bungeeTokenService.getTokenIcon(address, chainId);
      
      // If not found, try to use fallback icon
      if (!iconUrl && symbol) {
        iconUrl = this.fallbackIcons.get(symbol.toUpperCase());
      }
      
      // If still not found, use default icon
      if (!iconUrl) {
        iconUrl = this.getDefaultTokenIcon();
      }

      // Cache result
      this.iconCache.set(cacheKey, iconUrl);
      return iconUrl;
    } catch (error) {
      console.error(`Failed to get token icon for ${address}:`, error);
      return this.getDefaultTokenIcon();
    }
  }

  /**
   * Get native token icon
   * @param {number} chainId - Chain ID
   * @returns {string} Native token icon URL
   */
  getNativeTokenIcon(chainId) {
    return bungeeTokenService.getNativeTokenIcon(chainId);
  }

  /**
   * Get chain icon
   * @param {number} chainId - Chain ID
   * @returns {string} Chain icon URL
   */
  getChainIcon(chainId) {
    // First try to use iconUrlService
    const iconUrl = iconUrlService.getChainIconUrl(chainId);
    if (iconUrl !== iconUrlService.getDefaultIconUrl()) {
      return iconUrl;
    }
    
    // Fallback to config file
    const chain = SUPPORTED_CHAINS[chainId];
    return chain?.logo || this.getDefaultChainIcon();
  }

  /**
   * Batch get token icons
   * @param {Array} tokens - Token array [{address, chainId, symbol}]
   * @returns {Promise<Map>} Map of address to icon URL
   */
  async getTokenIconsBatch(tokens) {
    const iconMap = new Map();
    
    try {
      // Use Bungee service for batch retrieval
      const tokenAddresses = tokens.map(t => ({ address: t.address, chainId: t.chainId }));
      const bungeeIcons = await bungeeTokenService.getTokenIconsBatch(tokenAddresses);
      
      // Process results
      tokens.forEach(token => {
        const cacheKey = `${token.chainId}-${token.address.toLowerCase()}`;
        let iconUrl = bungeeIcons.get(cacheKey);
        
        // If Bungee doesn't have it, try fallback icon
        if (!iconUrl && token.symbol) {
          iconUrl = this.fallbackIcons.get(token.symbol.toUpperCase());
        }
        
        // Finally use default icon
        if (!iconUrl) {
          iconUrl = this.getDefaultTokenIcon();
        }
        
        iconMap.set(cacheKey, iconUrl);
        this.iconCache.set(cacheKey, iconUrl);
      });
    } catch (error) {
      console.error('Failed to get token icons batch:', error);
      // Use default icons
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
   * Preload common token icons
   * @param {number} chainId - Chain ID
   */
  async preloadCommonTokens(chainId) {
    const commonTokens = [
      { address: '0xA0b86a33E6441b8C4C8C0C4C8C0C4C8C0C4C8C0C', symbol: 'USDC' }, // Example address
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
   * Get default token icon
   * @returns {string} Default icon URL
   */
  getDefaultTokenIcon() {
    return iconUrlService.getDefaultIconUrl();
  }

  /**
   * Get default chain icon
   * @returns {string} Default chain icon URL
   */
  getDefaultChainIcon() {
    return iconUrlService.getDefaultIconUrl();
  }

  /**
   * Clear cache
   */
  clearCache() {
    this.iconCache.clear();
    bungeeTokenService.clearCache();
  }

  /**
   * Check if icon URL is valid
   * @param {string} url - Icon URL
   * @returns {Promise<boolean>} Whether it's valid
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
   * Get all supported chains
   * @returns {Object} Supported chains configuration
   */
  getSupportedChains() {
    return SUPPORTED_CHAINS;
  }
}

// Create singleton instance
export const tokenIconService = new TokenIconService();

export default tokenIconService;
