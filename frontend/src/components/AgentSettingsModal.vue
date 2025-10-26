<template>
  <div class="modal-overlay" @click="$emit('close')">
    <div class="modal-container" @click.stop>
      <div class="modal-header">
        <h3 class="modal-title">🤖 AI Agent Settings</h3>
        <button @click="$emit('close')" class="modal-close">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>
      
      <div class="modal-content">
        <form @submit.prevent="handleSubmit" class="space-y-6">
          <!-- Agent Status -->
          <div class="status-section">
            <div class="flex items-center justify-between mb-4">
              <h4 class="text-lg font-semibold text-gray-900">Agent Status</h4>
              <div class="status-indicator" :class="agentStatus.isActive ? 'active' : 'inactive'">
                {{ agentStatus.isActive ? 'Running' : 'Stopped' }}
              </div>
            </div>
            
            <div class="grid grid-cols-2 gap-4 text-sm">
              <div class="stat-item">
                <span class="stat-label">Monitoring Wallets:</span>
                <span class="stat-value">{{ agentStatus.monitoringWallets }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">Monitoring Chains:</span>
                <span class="stat-value">{{ agentStatus.monitoringChains }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">Executions Today:</span>
                <span class="stat-value">{{ agentStatus.todayExecutions }} times</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">Success Rate:</span>
                <span class="stat-value">{{ agentStatus.successRate }}%</span>
              </div>
            </div>
          </div>

          <!-- Agent Control -->
          <div class="control-section">
            <h4 class="text-lg font-semibold text-gray-900 mb-4">Agent Control</h4>
            
            <div class="flex items-center justify-between">
              <div>
                <h5 class="font-medium text-gray-900">Enable AI Agent</h5>
                <p class="text-sm text-gray-600">Let AI automatically monitor and manage your Gas fees</p>
              </div>
              <label class="toggle-switch">
                <input v-model="agentEnabled" type="checkbox" />
                <span class="toggle-slider"></span>
              </label>
            </div>
          </div>

          <!-- Monitoring Settings -->
          <div v-if="agentEnabled" class="monitoring-section">
            <h4 class="text-lg font-semibold text-gray-900 mb-4">Monitoring Settings</h4>
            
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Monitoring Frequency</label>
                <select v-model="monitoringFrequency" class="select-input">
                  <option value="5">Every 5 minutes</option>
                  <option value="15">Every 15 minutes</option>
                  <option value="30">Every 30 minutes</option>
                  <option value="60">Every hour</option>
                </select>
              </div>

              <div>
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
            </div>
          </div>

          <!-- Strategy Settings -->
          <div v-if="agentEnabled" class="strategy-section">
            <h4 class="text-lg font-semibold text-gray-900 mb-4">Strategy Settings</h4>
            
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Default Refuel Strategy</label>
                <select v-model="defaultStrategy" class="select-input">
                  <option value="conservative">Conservative (Low frequency, small amounts)</option>
                  <option value="balanced">Balanced (Medium frequency, moderate amounts)</option>
                  <option value="aggressive">Aggressive (High frequency, large amounts)</option>
                  <option value="custom">Custom</option>
                </select>
              </div>

              <div v-if="defaultStrategy === 'custom'" class="custom-strategy">
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm text-gray-600 mb-1">Minimum Balance Threshold</label>
                    <input
                      v-model="customThresholds.minBalance"
                      type="number"
                      step="0.001"
                      min="0"
                      placeholder="0.01"
                      class="threshold-input"
                    />
                  </div>
                  <div>
                    <label class="block text-sm text-gray-600 mb-1">Refuel Amount</label>
                    <input
                      v-model="customThresholds.refuelAmount"
                      type="number"
                      step="0.001"
                      min="0"
                      placeholder="0.05"
                      class="threshold-input"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Notification Settings -->
          <div v-if="agentEnabled" class="notification-section">
            <h4 class="text-lg font-semibold text-gray-900 mb-4">Notification Settings</h4>
            
            <div class="space-y-3">
              <label class="flex items-center gap-3">
                <input
                  v-model="notifications.email"
                  type="checkbox"
                  class="checkbox-input"
                />
                <span class="text-sm text-gray-700">Email Notifications</span>
              </label>
              
              <label class="flex items-center gap-3">
                <input
                  v-model="notifications.browser"
                  type="checkbox"
                  class="checkbox-input"
                />
                <span class="text-sm text-gray-700">Browser Notifications</span>
              </label>
              
              <label class="flex items-center gap-3">
                <input
                  v-model="notifications.telegram"
                  type="checkbox"
                  class="checkbox-input"
                />
                <span class="text-sm text-gray-700">Telegram Notifications</span>
              </label>
            </div>
          </div>

          <!-- Advanced Settings -->
          <div v-if="agentEnabled" class="advanced-section">
            <h4 class="text-lg font-semibold text-gray-900 mb-4">Advanced Settings</h4>
            
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Maximum Daily Executions</label>
                <input
                  v-model="maxDailyExecutions"
                  type="number"
                  min="1"
                  max="100"
                  class="threshold-input"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Gas Price Strategy</label>
                <select v-model="gasStrategy" class="select-input">
                  <option value="fast">Fast (High Gas Fee)</option>
                  <option value="standard">Standard (Medium Gas Fee)</option>
                  <option value="slow">Slow (Low Gas Fee)</option>
                </select>
              </div>

              <div class="flex items-center gap-2">
                <input
                  v-model="enableEmergencyMode"
                  type="checkbox"
                  class="checkbox-input"
                />
                <label class="text-sm text-gray-700">Enable Emergency Mode (Ignore cost limits)</label>
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
              Saving...
            </span>
            <span v-else>Save Settings</span>
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const emit = defineEmits(['close', 'success'])

// Data
const agentEnabled = ref(true)
const monitoringFrequency = ref(15)
const monitoringChains = ref([1, 42161])
const defaultStrategy = ref('balanced')
const customThresholds = ref({
  minBalance: 0.01,
  refuelAmount: 0.05
})
const notifications = ref({
  email: true,
  browser: true,
  telegram: false
})
const maxDailyExecutions = ref(20)
const gasStrategy = ref('standard')
const enableEmergencyMode = ref(false)
const isLoading = ref(false)

const supportedChains = [
  { id: 1, name: 'Ethereum', symbol: 'ETH', icon: 'Ξ', logo: null },
  { id: 137, name: 'Polygon', symbol: 'MATIC', icon: '⬟', logo: null },
  { id: 56, name: 'BSC', symbol: 'BNB', icon: '🔶', logo: null },
  { id: 42161, name: 'Arbitrum', symbol: 'ETH', icon: '🔵', logo: null }
]

const agentStatus = ref({
  isActive: true,
  monitoringWallets: 1,
  monitoringChains: 2,
  todayExecutions: 5,
  successRate: 95
})

// Computed
const canSubmit = computed(() => {
  if (!agentEnabled.value) return true
  return monitoringChains.value.length > 0
})

// Methods
const handleSubmit = async () => {
  if (!canSubmit.value) return
  
  isLoading.value = true
  
  try {
    // Mock API call
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    const config = {
      enabled: agentEnabled.value,
      monitoringFrequency: monitoringFrequency.value,
      monitoringChains: monitoringChains.value,
      defaultStrategy: defaultStrategy.value,
      customThresholds: customThresholds.value,
      notifications: notifications.value,
      maxDailyExecutions: maxDailyExecutions.value,
      gasStrategy: gasStrategy.value,
      enableEmergencyMode: enableEmergencyMode.value
    }
    
    emit('success', config)
    emit('close')
  } catch (error) {
    console.error('Agent settings failed:', error)
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
  @apply bg-white rounded-2xl shadow-2xl max-w-3xl w-full mx-4 max-h-[90vh] overflow-hidden;
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

.status-section {
  @apply p-4 bg-gray-50 rounded-xl border border-gray-200;
}

.status-indicator {
  @apply px-3 py-1 rounded-full text-sm font-medium;
}

.status-indicator.active {
  @apply bg-green-100 text-green-800;
}

.status-indicator.inactive {
  @apply bg-red-100 text-red-800;
}

.stat-item {
  @apply flex justify-between;
}

.stat-label {
  @apply text-gray-600;
}

.stat-value {
  @apply font-semibold text-gray-900;
}

.control-section {
  @apply p-4 bg-blue-50 rounded-xl border border-blue-200;
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

.monitoring-section,
.strategy-section,
.notification-section,
.advanced-section {
  @apply p-4 bg-white rounded-xl border border-gray-200;
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

.select-input {
  @apply w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 focus:outline-none transition-all duration-300;
}

.threshold-input {
  @apply w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 focus:outline-none transition-all duration-300;
}

.custom-strategy {
  @apply mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200;
}

.submit-btn {
  @apply w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 disabled:transform-none;
}

.loading-spinner {
  @apply w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin;
}
</style>
