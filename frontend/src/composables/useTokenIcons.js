/**
 * Token Icons Composable
 * Provides token icon functionality for use in Vue components
 */

import { ref, computed, onMounted, onUnmounted } from 'vue';
import { tokenIconService } from '../services/tokenIconService.js';

export function useTokenIcons() {
  const loadingIcons = ref(new Set());
  const iconCache = ref(new Map());

  /**
   * Get token icon
   * @param {string} address - Token address
   * @param {number} chainId - Chain ID
   * @param {string} symbol - Token symbol
   * @returns {Object} { iconUrl, isLoading, error }
   */
  const getTokenIcon = (address, chainId, symbol = null) => {
    const cacheKey = `${chainId}-${address.toLowerCase()}`;
    const isLoading = computed(() => loadingIcons.value.has(cacheKey));
    const error = ref(null);
    
    // If already in cache, return directly
    if (iconCache.value.has(cacheKey)) {
      return {
        iconUrl: computed(() => iconCache.value.get(cacheKey)),
        isLoading,
        error
      };
    }

    // Start loading
    loadingIcons.value.add(cacheKey);
    
    tokenIconService.getTokenIcon(address, chainId, symbol)
      .then(iconUrl => {
        iconCache.value.set(cacheKey, iconUrl);
        loadingIcons.value.delete(cacheKey);
      })
      .catch(err => {
        console.error('Failed to load token icon:', err);
        error.value = err;
        loadingIcons.value.delete(cacheKey);
        // Set default icon
        iconCache.value.set(cacheKey, tokenIconService.getDefaultTokenIcon());
      });

    return {
      iconUrl: computed(() => iconCache.value.get(cacheKey) || tokenIconService.getDefaultTokenIcon()),
      isLoading,
      error
    };
  };

  /**
   * Get native token icon
   * @param {number} chainId - Chain ID
   * @returns {string} Native token icon URL
   */
  const getNativeTokenIcon = (chainId) => {
    return tokenIconService.getNativeTokenIcon(chainId);
  };

  /**
   * Get chain icon
   * @param {number} chainId - Chain ID
   * @returns {string} Chain icon URL
   */
  const getChainIcon = (chainId) => {
    return tokenIconService.getChainIcon(chainId);
  };

  /**
   * Batch get token icons
   * @param {Array} tokens - Token array
   * @returns {Object} { icons, isLoading, error }
   */
  const getTokenIconsBatch = (tokens) => {
    const isLoading = ref(true);
    const error = ref(null);
    const icons = ref(new Map());

    tokenIconService.getTokenIconsBatch(tokens)
      .then(iconMap => {
        icons.value = iconMap;
        isLoading.value = false;
        // Update cache
        iconMap.forEach((url, key) => {
          iconCache.value.set(key, url);
        });
      })
      .catch(err => {
        console.error('Failed to load token icons batch:', err);
        error.value = err;
        isLoading.value = false;
      });

    return {
      icons: computed(() => icons.value),
      isLoading,
      error
    };
  };

  /**
   * Preload common token icons
   * @param {number} chainId - Chain ID
   */
  const preloadCommonTokens = async (chainId) => {
    try {
      await tokenIconService.preloadCommonTokens(chainId);
    } catch (error) {
      console.error('Failed to preload common tokens:', error);
    }
  };

  /**
   * Clear cache
   */
  const clearCache = () => {
    iconCache.value.clear();
    loadingIcons.value.clear();
    tokenIconService.clearCache();
  };

  /**
   * Check if icon is loading
   * @param {string} address - Token address
   * @param {number} chainId - Chain ID
   * @returns {boolean} Whether it's loading
   */
  const isIconLoading = (address, chainId) => {
    const cacheKey = `${chainId}-${address.toLowerCase()}`;
    return loadingIcons.value.has(cacheKey);
  };

  /**
   * Get icon URL (synchronous)
   * @param {string} address - Token address
   * @param {number} chainId - Chain ID
   * @returns {string|null} Icon URL
   */
  const getCachedIcon = (address, chainId) => {
    const cacheKey = `${chainId}-${address.toLowerCase()}`;
    return iconCache.value.get(cacheKey) || null;
  };

  // Clean up when component unmounts
  onUnmounted(() => {
    clearCache();
  });

  return {
    getTokenIcon,
    getNativeTokenIcon,
    getChainIcon,
    getTokenIconsBatch,
    preloadCommonTokens,
    clearCache,
    isIconLoading,
    getCachedIcon,
    // State
    loadingIcons: computed(() => loadingIcons.value),
    iconCache: computed(() => iconCache.value)
  };
}

export default useTokenIcons;
