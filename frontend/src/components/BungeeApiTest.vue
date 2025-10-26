<template>
  <div class="bungee-api-test">
    <h3 class="text-xl font-bold text-white mb-4">Bungee API Test</h3>
    
    <div class="mb-4">
      <button 
        @click="testBungeeAPI"
        :disabled="isLoading"
        class="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors duration-200 disabled:opacity-50"
      >
        {{ isLoading ? 'Testing...' : 'Test Bungee API' }}
      </button>
    </div>

    <div v-if="apiResult" class="space-y-4">
      <div class="bg-gray-800 rounded-lg p-4">
        <h4 class="text-lg font-semibold text-emerald-200 mb-2">API Response</h4>
        <div class="text-sm text-gray-300">
          <p>Success: {{ apiResult.success }}</p>
          <p>Status Code: {{ apiResult.statusCode }}</p>
          <p>Chain Count: {{ Object.keys(apiResult.result || {}).length }}</p>
        </div>
      </div>

      <div v-if="sampleTokens.length > 0" class="bg-gray-800 rounded-lg p-4">
        <h4 class="text-lg font-semibold text-emerald-200 mb-2">Sample Tokens (Top 5)</h4>
        <div class="space-y-2">
          <div v-for="token in sampleTokens" :key="token.address" class="flex items-center gap-3 p-2 bg-gray-700 rounded">
            <img 
              :src="token.logoURI"
              :alt="token.symbol"
              class="w-8 h-8 rounded-full"
              @error="handleImageError"
            />
            <div>
              <div class="text-white font-medium">{{ token.symbol }}</div>
              <div class="text-sm text-gray-400">{{ token.name }}</div>
            </div>
            <div class="ml-auto text-sm text-gray-300">
              Chain: {{ token.chainId }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="error" class="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
      <h4 class="text-lg font-semibold text-red-200 mb-2">Error</h4>
      <p class="text-red-300">{{ error }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { bungeeTokenService } from '../services/bungeeTokenService.js';

const isLoading = ref(false);
const apiResult = ref(null);
const sampleTokens = ref([]);
const error = ref(null);

const testBungeeAPI = async () => {
  isLoading.value = true;
  error.value = null;
  apiResult.value = null;
  sampleTokens.value = [];

  try {
    // Call Bungee API directly
    const response = await fetch('https://public-backend.bungee.exchange/api/v1/tokens/list', {
      headers: {
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    apiResult.value = data;

    // Get sample tokens
    if (data.success && data.result) {
      const allTokens = [];
      Object.values(data.result).forEach(chainTokens => {
        allTokens.push(...chainTokens);
      });
      sampleTokens.value = allTokens.slice(0, 5);
    }

    console.log('Bungee API test successful:', data);
  } catch (err) {
    console.error('Bungee API test failed:', err);
    error.value = err.message;
  } finally {
    isLoading.value = false;
  }
};

const handleImageError = (event) => {
  console.log('Image load error:', event.target.src);
  // Set default icon
  event.target.src = 'https://media.socket.tech/networks/ethereum.svg';
};
</script>

<style scoped>
.bungee-api-test {
  @apply p-6 bg-gray-800 rounded-xl;
}
</style>
