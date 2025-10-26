<template>
  <div class="token-icon-demo">
    <h3 class="text-xl font-bold text-white mb-4">代幣圖標測試</h3>
    
    <!-- 單個代幣圖標測試 -->
    <div class="mb-6">
      <h4 class="text-lg font-semibold text-emerald-200 mb-3">單個代幣圖標</h4>
      <div class="flex items-center gap-4">
        <div v-for="token in testTokens" :key="token.address" class="flex items-center gap-2">
          <div class="relative">
            <img 
              :src="getTokenIcon(token.address, token.chainId, token.symbol).iconUrl.value"
              :alt="token.symbol"
              class="w-8 h-8 rounded-full"
              @error="handleImageError"
            />
            <div 
              v-if="getTokenIcon(token.address, token.chainId, token.symbol).isLoading.value"
              class="absolute inset-0 bg-gray-800 rounded-full flex items-center justify-center"
            >
              <div class="w-4 h-4 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin"></div>
            </div>
          </div>
          <span class="text-white text-sm">{{ token.symbol }}</span>
        </div>
      </div>
    </div>

    <!-- 鏈圖標測試 -->
    <div class="mb-6">
      <h4 class="text-lg font-semibold text-emerald-200 mb-3">鏈圖標</h4>
      <div class="flex items-center gap-4">
        <div v-for="chainId in testChains" :key="chainId" class="flex items-center gap-2">
          <img 
            :src="getChainIcon(chainId)"
            :alt="`Chain ${chainId}`"
            class="w-8 h-8 rounded-full"
            @error="handleImageError"
          />
          <span class="text-white text-sm">{{ chainId }}</span>
        </div>
      </div>
    </div>

    <!-- 批量加載測試 -->
    <div class="mb-6">
      <h4 class="text-lg font-semibold text-emerald-200 mb-3">批量加載</h4>
      <button 
        @click="loadBatchIcons"
        :disabled="batchLoading"
        class="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors duration-200 disabled:opacity-50"
      >
        {{ batchLoading ? '加載中...' : '批量加載圖標' }}
      </button>
      
      <div v-if="batchIcons.size > 0" class="mt-4 flex flex-wrap gap-4">
        <div v-for="[key, iconUrl] in batchIcons" :key="key" class="flex items-center gap-2">
          <img 
            :src="iconUrl"
            :alt="key"
            class="w-6 h-6 rounded-full"
            @error="handleImageError"
          />
          <span class="text-white text-xs">{{ key }}</span>
        </div>
      </div>
    </div>

    <!-- 錯誤處理測試 -->
    <div class="mb-6">
      <h4 class="text-lg font-semibold text-emerald-200 mb-3">錯誤處理</h4>
      <div class="flex items-center gap-4">
        <div class="flex items-center gap-2">
          <img 
            src="invalid-url"
            alt="Invalid"
            class="w-8 h-8 rounded-full bg-gray-600"
            @error="handleImageError"
          />
          <span class="text-white text-sm">無效URL</span>
        </div>
      </div>
    </div>

    <!-- 控制按鈕 -->
    <div class="flex gap-3">
      <button 
        @click="clearAllCache"
        class="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors duration-200"
      >
        清除緩存
      </button>
      <button 
        @click="preloadTokens"
        class="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors duration-200"
      >
        預載入常用代幣
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useTokenIcons } from '../composables/useTokenIcons.js';

// 使用圖標服務
const {
  getTokenIcon,
  getChainIcon,
  getTokenIconsBatch,
  preloadCommonTokens,
  clearCache
} = useTokenIcons();

// 測試數據
const testTokens = ref([
  {
    address: '0xA0b86a33E6441b8C4C8C0C4C8C0C4C8C0C4C8C0C',
    chainId: 1,
    symbol: 'USDC'
  },
  {
    address: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    chainId: 1,
    symbol: 'USDT'
  },
  {
    address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
    chainId: 1,
    symbol: 'WETH'
  }
]);

const testChains = ref([1, 42161, 8453, 137, 56]);

// 批量加載狀態
const batchLoading = ref(false);
const batchIcons = ref(new Map());

// 方法
const loadBatchIcons = async () => {
  batchLoading.value = true;
  try {
    const tokens = testTokens.value.map(token => ({
      address: token.address,
      chainId: token.chainId,
      symbol: token.symbol
    }));
    
    const { icons } = getTokenIconsBatch(tokens);
    batchIcons.value = icons.value;
  } catch (error) {
    console.error('Failed to load batch icons:', error);
  } finally {
    batchLoading.value = false;
  }
};

const preloadTokens = async () => {
  try {
    await preloadCommonTokens(1); // Ethereum
    await preloadCommonTokens(42161); // Arbitrum
    console.log('Common tokens preloaded successfully');
  } catch (error) {
    console.error('Failed to preload tokens:', error);
  }
};

const clearAllCache = () => {
  clearCache();
  batchIcons.value.clear();
};

const handleImageError = (event) => {
  console.log('Image load error:', event.target.src);
  // 設置默認圖標
  event.target.src = 'https://media.socket.tech/networks/ethereum.svg';
};

// 組件掛載時預載入
onMounted(() => {
  preloadTokens();
});
</script>

<style scoped>
.token-icon-demo {
  @apply p-6 bg-gray-800 rounded-xl;
}

img {
  @apply border border-gray-600;
}
</style>
