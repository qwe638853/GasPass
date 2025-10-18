<template>
  <div class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
    <div class="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
      <!-- Header -->
      <div class="p-6 border-b border-gray-200">
        <div class="flex items-center justify-between">
          <h3 class="text-xl font-bold text-gray-900">自動補 Gas 設定</h3>
          <button @click="$emit('close')" class="text-gray-400 hover:text-gray-600 transition-colors">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
      </div>

      <!-- Content -->
      <div class="p-6">
        <form @submit.prevent="handleSubmit" class="space-y-6">
          <!-- Target Chain -->
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">目標鏈</label>
            <select v-model="form.targetChain" class="chain-select">
              <option value="1">Ethereum</option>
              <option value="137">Polygon</option>
              <option value="56">BSC</option>
              <option value="43114">Avalanche</option>
              <option value="10">Optimism</option>
              <option value="250">Fantom</option>
            </select>
          </div>

          <!-- Gas Amount -->
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">每次補充 Gas 數量</label>
            <div class="relative">
              <input 
                v-model="form.gasAmount"
                type="number"
                step="0.001"
                min="0.001"
                placeholder="輸入 Gas 數量"
                class="amount-input"
              />
              <span class="currency-label">ETH</span>
            </div>
          </div>

          <!-- Threshold -->
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">觸發閾值</label>
            <div class="relative">
              <input 
                v-model="form.threshold"
                type="number"
                step="0.001"
                min="0.001"
                placeholder="輸入觸發閾值"
                class="amount-input"
              />
              <span class="currency-label">ETH</span>
            </div>
            <p class="text-sm text-gray-500 mt-1">當 Gas 餘額低於此值時自動補充</p>
          </div>

          <!-- Recipient Address -->
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">接收地址</label>
            <input 
              v-model="form.recipientAddress"
              type="text"
              placeholder="輸入接收地址"
              class="address-input"
            />
          </div>

          <!-- Policy Preview -->
          <div v-if="form.gasAmount && form.threshold" class="policy-preview">
            <h4 class="text-lg font-semibold text-gray-900 mb-3">策略預覽</h4>
            <div class="space-y-2">
              <div class="flex justify-between">
                <span class="text-gray-600">目標鏈:</span>
                <span class="font-semibold">{{ getChainName(form.targetChain) }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">補充數量:</span>
                <span class="font-semibold">{{ form.gasAmount }} ETH</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">觸發閾值:</span>
                <span class="font-semibold">{{ form.threshold }} ETH</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">接收地址:</span>
                <span class="font-semibold text-xs">{{ form.recipientAddress.slice(0, 6) }}...{{ form.recipientAddress.slice(-4) }}</span>
              </div>
            </div>
          </div>

          <!-- Submit Button -->
          <button 
            type="submit"
            :disabled="!canSubmit"
            class="btn-primary w-full"
            :class="{ 'loading': isLoading }"
          >
            <span v-if="isLoading" class="flex items-center justify-center gap-2">
              <div class="loading-spinner"></div>
              設定中...
            </span>
            <span v-else class="flex items-center justify-center gap-2">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
              </svg>
              設定自動補 Gas
            </span>
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { gasPassService } from '../services/gasPassService.js'

// Emits
const emit = defineEmits(['close', 'success'])

// Data
const form = ref({
  targetChain: '1',
  gasAmount: '',
  threshold: '',
  recipientAddress: ''
})

const isLoading = ref(false)

// Computed
const canSubmit = computed(() => {
  return form.value.gasAmount && 
         parseFloat(form.value.gasAmount) > 0 &&
         form.value.threshold &&
         parseFloat(form.value.threshold) > 0 &&
         form.value.recipientAddress &&
         !isLoading.value
})

// Methods
const getChainName = (chainId) => {
  const chains = {
    '1': 'Ethereum',
    '137': 'Polygon',
    '56': 'BSC',
    '43114': 'Avalanche',
    '10': 'Optimism',
    '250': 'Fantom'
  }
  return chains[chainId] || 'Unknown'
}

const handleSubmit = async () => {
  if (!canSubmit.value) return

  isLoading.value = true

  try {
    const result = await gasPassService.setRefuelPolicy({
      tokenId: 1, // Use first card for now
      targetChainId: parseInt(form.value.targetChain),
      gasAmount: form.value.gasAmount,
      threshold: form.value.threshold
    })

    if (result.success) {
      emit('success')
      emit('close')
    } else {
      throw new Error(result.error || '設定自動補 Gas 失敗')
    }
  } catch (error) {
    console.error('Set auto refuel failed:', error)
    // You can add toast notification here
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.chain-select {
  @apply w-full p-3 border-2 border-gray-300 rounded-xl focus:border-amber-500 focus:ring-4 focus:ring-amber-500/30 focus:outline-none transition-all duration-300;
}

.amount-input {
  @apply w-full p-3 pr-16 border-2 border-gray-300 rounded-xl focus:border-amber-500 focus:ring-4 focus:ring-amber-500/30 focus:outline-none transition-all duration-300;
}

.currency-label {
  @apply absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600 font-semibold;
}

.address-input {
  @apply w-full p-3 border-2 border-gray-300 rounded-xl focus:border-amber-500 focus:ring-4 focus:ring-amber-500/30 focus:outline-none transition-all duration-300;
}

.policy-preview {
  @apply bg-gray-50 border-2 border-gray-200 rounded-xl p-4;
}

.btn-primary {
  @apply bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-amber-500/30 focus:ring-offset-2 shadow-lg hover:shadow-xl hover:scale-105;
}

.btn-primary.loading {
  @apply opacity-75 cursor-not-allowed hover:scale-100;
}

.loading-spinner {
  @apply w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin;
}
</style>
