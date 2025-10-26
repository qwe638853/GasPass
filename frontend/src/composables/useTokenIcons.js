/**
 * 代幣圖標 Composable
 * 提供在 Vue 組件中使用的代幣圖標功能
 */

import { ref, computed, onMounted, onUnmounted } from 'vue';
import { tokenIconService } from '../services/tokenIconService.js';

export function useTokenIcons() {
  const loadingIcons = ref(new Set());
  const iconCache = ref(new Map());

  /**
   * 獲取代幣圖標
   * @param {string} address - 代幣地址
   * @param {number} chainId - 鏈ID
   * @param {string} symbol - 代幣符號
   * @returns {Object} { iconUrl, isLoading, error }
   */
  const getTokenIcon = (address, chainId, symbol = null) => {
    const cacheKey = `${chainId}-${address.toLowerCase()}`;
    const isLoading = computed(() => loadingIcons.value.has(cacheKey));
    const error = ref(null);
    
    // 如果已經在緩存中，直接返回
    if (iconCache.value.has(cacheKey)) {
      return {
        iconUrl: computed(() => iconCache.value.get(cacheKey)),
        isLoading,
        error
      };
    }

    // 開始加載
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
        // 設置默認圖標
        iconCache.value.set(cacheKey, tokenIconService.getDefaultTokenIcon());
      });

    return {
      iconUrl: computed(() => iconCache.value.get(cacheKey) || tokenIconService.getDefaultTokenIcon()),
      isLoading,
      error
    };
  };

  /**
   * 獲取原生代幣圖標
   * @param {number} chainId - 鏈ID
   * @returns {string} 原生代幣圖標URL
   */
  const getNativeTokenIcon = (chainId) => {
    return tokenIconService.getNativeTokenIcon(chainId);
  };

  /**
   * 獲取鏈圖標
   * @param {number} chainId - 鏈ID
   * @returns {string} 鏈圖標URL
   */
  const getChainIcon = (chainId) => {
    return tokenIconService.getChainIcon(chainId);
  };

  /**
   * 批量獲取代幣圖標
   * @param {Array} tokens - 代幣數組
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
        // 更新緩存
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
   * 預載入常用代幣圖標
   * @param {number} chainId - 鏈ID
   */
  const preloadCommonTokens = async (chainId) => {
    try {
      await tokenIconService.preloadCommonTokens(chainId);
    } catch (error) {
      console.error('Failed to preload common tokens:', error);
    }
  };

  /**
   * 清除緩存
   */
  const clearCache = () => {
    iconCache.value.clear();
    loadingIcons.value.clear();
    tokenIconService.clearCache();
  };

  /**
   * 檢查圖標是否正在加載
   * @param {string} address - 代幣地址
   * @param {number} chainId - 鏈ID
   * @returns {boolean} 是否正在加載
   */
  const isIconLoading = (address, chainId) => {
    const cacheKey = `${chainId}-${address.toLowerCase()}`;
    return loadingIcons.value.has(cacheKey);
  };

  /**
   * 獲取圖標URL（同步）
   * @param {string} address - 代幣地址
   * @param {number} chainId - 鏈ID
   * @returns {string|null} 圖標URL
   */
  const getCachedIcon = (address, chainId) => {
    const cacheKey = `${chainId}-${address.toLowerCase()}`;
    return iconCache.value.get(cacheKey) || null;
  };

  // 組件卸載時清理
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
    // 狀態
    loadingIcons: computed(() => loadingIcons.value),
    iconCache: computed(() => iconCache.value)
  };
}

export default useTokenIcons;
