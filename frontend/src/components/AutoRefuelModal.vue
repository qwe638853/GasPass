<template>
  <div class="modal-overlay" @click="$emit('close')">
    <div class="modal-container" @click.stop>
      <div class="modal-header">
        <h3 class="modal-title">🤖 Auto Refuel Settings</h3>
        <button @click="$emit('close')" class="modal-close">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>
      
      <div class="modal-content">
        <form @submit.prevent="handleSubmit" class="space-y-6">
          <!-- Enable Toggle -->
          <div class="flex items-center justify-between">
            <div>
              <h4 class="text-lg font-semibold text-gray-900">Enable Auto Refuel</h4>
              <p class="text-sm text-gray-600">Let AI Agent automatically monitor and refuel Gas</p>
            </div>
            <label class="toggle-switch">
              <input v-model="isEnabled" type="checkbox" />
              <span class="toggle-slider"></span>
            </label>
          </div>

          <!-- Monitoring Chains -->
          <div v-if="isEnabled">
            <label class="block text-sm font-medium text-gray-700 mb-3">Monitored Blockchains</label>
            <div class="grid grid-cols-2 gap-3">
              <label
                v-for="chain in supportedChains"
                :key="chain.id"
                class="chain-checkbox"
              >
                <input
                  v-model="monitoringChains"
                  :value="chain.id"
                  type="checkbox"
                  class="checkbox-input"
                />
                <div class="checkbox-content">
                  <img v-if="chain.logo" :src="chain.logo" :alt="chain.name" class="w-5 h-5" />
                  <span v-else class="text-lg">{{ chain.icon }}</span>
                  <span class="chain-name">{{ chain.name }}</span>
                </div>
              </label>
            </div>
          </div>

          <!-- Threshold Settings -->
          <div v-if="isEnabled" class="space-y-4">
            <h4 class="text-lg font-semibold text-gray-900">Threshold Settings</h4>
            
            <div v-for="chain in selectedChains" :key="chain.id" class="threshold-group">
              <div class="flex items-center gap-3 mb-2">
                <img v-if="chain.logo" :src="chain.logo" :alt="chain.name" class="w-5 h-5" />
                <span v-else class="text-lg">{{ chain.icon }}</span>
                <span class="font-medium text-gray-900">{{ chain.name }}</span>
              </div>
              
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm text-gray-600 mb-1">Minimum Balance</label>
                  <input
                    v-model="thresholds[chain.id].minBalance"
                    type="number"
                    step="0.001"
                    min="0"
                    :placeholder="`${chain.symbol} amount`"
                    class="threshold-input"
                  />
                </div>
                <div>
                  <label class="block text-sm text-gray-600 mb-1">Refuel Amount</label>
                  <input
                    v-model="thresholds[chain.id].refuelAmount"
                    type="number"
                    step="0.001"
                    min="0"
                    :placeholder="`${chain.symbol} amount`"
                    class="threshold-input"
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- Advanced Settings -->
          <div v-if="isEnabled" class="space-y-4">
            <h4 class="text-lg font-semibold text-gray-900">Advanced Settings</h4>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Check Frequency</label>
              <select v-model="checkFrequency" class="select-input">
                <option value="5">Every 5 minutes</option>
                <option value="15">Every 15 minutes</option>
                <option value="30">Every 30 minutes</option>
                <option value="60">Every hour</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Maximum Daily Refuels</label>
              <input
                v-model="maxDailyRefuels"
                type="number"
                min="1"
                max="50"
                class="threshold-input"
              />
            </div>

            <div class="flex items-center gap-2">
              <input
                v-model="enableNotifications"
                type="checkbox"
                class="checkbox-input"
              />
              <label class="text-sm text-gray-700">Enable Notification Alerts</label>
            </div>
          </div>

          <!-- Cost Preview -->
          <div v-if="isEnabled && totalCost > 0" class="cost-preview">
            <h4 class="text-sm font-medium text-gray-700 mb-2">Estimated Cost</h4>
            <div class="space-y-1 text-sm">
              <div class="flex justify-between">
                <span>Maximum Daily Refuel:</span>
                <span>{{ totalCost }} USDC</span>
              </div>
              <div class="flex justify-between">
                <span>Monthly Estimate:</span>
                <span>{{ (totalCost * 30).toFixed(2) }} USDC</span>
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
              Setting up...
            </span>
            <span v-else>Confirm Settings</span>
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
const isEnabled = ref(false)
const monitoringChains = ref([1, 42161]) // Ethereum and Arbitrum by default
const checkFrequency = ref(15)
const maxDailyRefuels = ref(10)
const enableNotifications = ref(true)
const isLoading = ref(false)

const supportedChains = [
  { id: 1, name: 'Ethereum', symbol: 'ETH', icon: 'Ξ', logo: null },
  { id: 137, name: 'Polygon', symbol: 'MATIC', icon: '⬟', logo: null },
  { id: 56, name: 'BSC', symbol: 'BNB', icon: '🔶', logo: null },
  { id: 42161, name: 'Arbitrum', symbol: 'ETH', icon: '🔵', logo: null }
]

const thresholds = ref({
  1: { minBalance: 0.01, refuelAmount: 0.05 },
  137: { minBalance: 1, refuelAmount: 5 },
  56: { minBalance: 0.01, refuelAmount: 0.05 },
  42161: { minBalance: 0.01, refuelAmount: 0.05 }
})

// Computed
const selectedChains = computed(() => {
  return supportedChains.filter(chain => monitoringChains.value.includes(chain.id))
})

const canSubmit = computed(() => {
  if (!isEnabled.value) return true
  return monitoringChains.value.length > 0
})

const totalCost = computed(() => {
  if (!isEnabled.value) return 0
  
  let total = 0
  selectedChains.value.forEach(chain => {
    const threshold = thresholds.value[chain.id]
    if (threshold.refuelAmount) {
      total += parseFloat(threshold.refuelAmount) * 2000 // Mock conversion rate
    }
  })
  
  return total.toFixed(2)
})

// Methods
const handleSubmit = async () => {
  if (!canSubmit.value) return
  
  isLoading.value = true
  
  try {
    // Mock API call
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    const config = {
      enabled: isEnabled.value,
      monitoringChains: monitoringChains.value,
      thresholds: thresholds.value,
      checkFrequency: checkFrequency.value,
      maxDailyRefuels: maxDailyRefuels.value,
      enableNotifications: enableNotifications.value
    }
    
    emit('success', config)
    emit('close')
  } catch (error) {
    console.error('Auto refuel setup failed:', error)
    alert('Settings failed, please try again later')
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
  @apply bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden;
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

.toggle-switch {
  @apply relative inline-block w-12 h-6;
}

.toggle-switch input {
  @apply opacity-0 w-0 h-0;
}

.toggle-slider {
  @apply absolute cursor-pointer inset-0 bg-gray-300 rounded-full transition-all duration-300;
}

.toggle-slider:before {
  @apply absolute content-[''] h-5 w-5 left-0.5 bottom-0.5 bg-white rounded-full transition-all duration-300;
}

input:checked + .toggle-slider {
  @apply bg-amber-500;
}

input:checked + .toggle-slider:before {
  @apply transform translate-x-6;
}

.chain-checkbox {
  @apply flex items-center p-3 border-2 border-gray-200 rounded-xl hover:border-amber-400 transition-all duration-300 cursor-pointer;
}

.checkbox-input {
  @apply mr-3 w-4 h-4 text-amber-600 border-gray-300 rounded focus:ring-amber-500;
}

.checkbox-content {
  @apply flex items-center gap-2;
}

.chain-name {
  @apply text-sm font-medium text-gray-700;
}

.threshold-group {
  @apply p-4 bg-gray-50 rounded-xl border border-gray-200;
}

.threshold-input {
  @apply w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 focus:outline-none transition-all duration-300;
}

.select-input {
  @apply w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 focus:outline-none transition-all duration-300;
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
