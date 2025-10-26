<template>
  <div class="modal-overlay" @click="$emit('close')">
    <div class="modal-container" @click.stop>
      <div class="modal-header">
        <h3 class="modal-title">⚡ Manual Refuel</h3>
        <button @click="$emit('close')" class="modal-close">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>
      
      <div class="modal-content">
        <form @submit.prevent="handleSubmit" class="space-y-6">
          <!-- Target Chain Selection -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-3">Select Target Blockchain</label>
            <div class="grid grid-cols-2 gap-3">
              <button
                v-for="chain in supportedChains"
                :key="chain.id"
                type="button"
                @click="selectedChain = chain.id"
                class="chain-option"
                :class="{ 'selected': selectedChain === chain.id }"
              >
                <img v-if="chain.logo" :src="chain.logo" :alt="chain.name" class="w-6 h-6" />
                <span v-else class="text-2xl">{{ chain.icon }}</span>
                <span class="chain-name">{{ chain.name }}</span>
              </button>
            </div>
          </div>

          <!-- Amount Input -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Refuel Amount</label>
            <div class="relative">
              <input
                v-model="amount"
                type="number"
                step="0.001"
                min="0"
                placeholder="Enter amount"
                class="amount-input"
                required
              />
              <span class="currency-symbol">{{ getChainSymbol(selectedChain) }}</span>
            </div>
          </div>

          <!-- Quick Amount Buttons -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Quick Select</label>
            <div class="grid grid-cols-4 gap-2">
              <button
                v-for="quickAmount in quickAmounts"
                :key="quickAmount"
                type="button"
                @click="amount = quickAmount"
                class="quick-amount-btn"
                :class="{ 'active': amount === quickAmount }"
              >
                {{ quickAmount }}
              </button>
            </div>
          </div>

          <!-- Cost Preview -->
          <div v-if="costEstimate" class="cost-preview">
            <h4 class="text-sm font-medium text-gray-700 mb-2">Cost Estimate</h4>
            <div class="space-y-1 text-sm">
              <div class="flex justify-between">
                <span>Refuel Amount:</span>
                <span>{{ amount }} {{ getChainSymbol(selectedChain) }}</span>
              </div>
              <div class="flex justify-between">
                <span>Gas Fee:</span>
                <span>≈ {{ costEstimate.gas }} ETH</span>
              </div>
              <div class="flex justify-between font-semibold">
                <span>Total Cost:</span>
                <span>{{ costEstimate.total }} USDC</span>
              </div>
            </div>
          </div>

          <!-- Submit Button -->
          <button
            type="submit"
            class="submit-btn"
            :disabled="!canSubmit || isLoading"
          >
            <span v-if="isLoading" class="flex items-center justify-center gap-2">
              <div class="loading-spinner"></div>
              Processing...
            </span>
            <span v-else>Confirm Refuel</span>
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const emit = defineEmits(['close', 'success'])

// Data
const selectedChain = ref(1) // Ethereum
const amount = ref('')
const isLoading = ref(false)

const quickAmounts = [0.01, 0.05, 0.1, 0.5]

const supportedChains = [
  { id: 1, name: 'Ethereum', symbol: 'ETH', icon: 'Ξ', logo: null },
  { id: 137, name: 'Polygon', symbol: 'MATIC', icon: '⬟', logo: null },
  { id: 56, name: 'BSC', symbol: 'BNB', icon: '🔶', logo: null },
  { id: 42161, name: 'Arbitrum', symbol: 'ETH', icon: '🔵', logo: null }
]

// Computed
const canSubmit = computed(() => {
  return selectedChain.value && amount.value && parseFloat(amount.value) > 0
})

const costEstimate = computed(() => {
  if (!amount.value || parseFloat(amount.value) <= 0) return null
  
  const gasPrice = 0.001 // Mock gas price
  const totalCost = parseFloat(amount.value) * 2000 // Mock conversion rate
  
  return {
    gas: gasPrice,
    total: totalCost.toFixed(2)
  }
})

// Methods
const getChainSymbol = (chainId) => {
  const chain = supportedChains.find(c => c.id === chainId)
  return chain?.symbol || 'ETH'
}

const handleSubmit = async () => {
  if (!canSubmit.value) return
  
  isLoading.value = true
  
  try {
    // Mock transaction
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    emit('success', {
      chain: selectedChain.value,
      amount: amount.value,
      txHash: '0x' + Math.random().toString(16).substr(2, 64)
    })
    
    emit('close')
  } catch (error) {
    console.error('Manual refuel failed:', error)
    alert('Refuel failed, please try again later')
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.modal-overlay {
  @apply fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm;
}

.modal-container {
  @apply bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 max-h-[90vh] overflow-hidden;
}

.modal-header {
  @apply flex items-center justify-between p-6 border-b border-gray-200;
}

.modal-title {
  @apply text-xl font-bold text-gray-900;
}

.modal-close {
  @apply p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-all duration-300;
}

.modal-content {
  @apply p-6 max-h-[70vh] overflow-y-auto;
}

.chain-option {
  @apply flex flex-col items-center gap-2 p-4 border-2 border-gray-200 rounded-xl hover:border-amber-400 transition-all duration-300 cursor-pointer;
}

.chain-option.selected {
  @apply border-amber-500 bg-amber-50;
}

.chain-name {
  @apply text-sm font-medium text-gray-700;
}

.amount-input {
  @apply w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-amber-400 focus:ring-4 focus:ring-amber-400/20 focus:outline-none transition-all duration-300;
}

.currency-symbol {
  @apply absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm;
}

.quick-amount-btn {
  @apply px-3 py-2 bg-gray-100 hover:bg-amber-500 hover:text-white text-gray-700 font-medium rounded-lg transition-all duration-300 text-sm;
}

.quick-amount-btn.active {
  @apply bg-amber-500 text-white;
}

.cost-preview {
  @apply bg-amber-50 border border-amber-200 rounded-xl p-4;
}

.submit-btn {
  @apply w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 disabled:transform-none;
}

.loading-spinner {
  @apply w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin;
}
</style>
