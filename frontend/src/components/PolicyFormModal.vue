<template>
  <div class="modal-overlay" @click="$emit('close')">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h2 class="modal-title">
          {{ isEditing ? 'Edit' : 'Add' }} Monitoring Policy
        </h2>
        <button @click="$emit('close')" class="close-btn">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>

      <div class="modal-body">
        <!-- Chain Selection -->
        <div class="section">
          <h3 class="section-title">Select Monitoring Blockchain</h3>
          <div class="chain-grid">
            <div 
              v-for="chain in supportedChains" 
              :key="chain.id"
              class="chain-card"
              :class="{ 'selected': form.chainId === chain.id }"
              @click="selectChain(chain)"
            >
              <div class="chain-icon">{{ chain.icon }}</div>
              <div class="chain-info">
                <div class="chain-name">{{ chain.name }}</div>
                <div class="chain-symbol">{{ chain.symbol }}</div>
                <div class="chain-meta">
                  <span class="gas-price" :class="getGasPriceColor(chain.gasPrice)">
                    {{ chain.gasPrice }} Gas
                  </span>
                  <span class="confirm-time">{{ chain.avgConfirmTime }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Threshold Settings -->
        <div v-if="selectedChain" class="section">
          <h3 class="section-title">Trigger Condition Settings</h3>
          <div class="threshold-card">
            <div class="threshold-description">
              <div class="desc-icon">⚠️</div>
              <div>
                <p class="desc-title">Auto refuel when {{ selectedChain.symbol }} balance drops below threshold</p>
                <p class="desc-subtitle">Recommended to set as enough to execute 5-10 transactions</p>
              </div>
            </div>
            
            <div class="threshold-input-section">
              <label class="input-label">Trigger Threshold</label>
              <div class="input-wrapper">
                <input 
                  v-model="form.threshold"
                  type="number" 
                  step="0.001"
                  min="0"
                  :placeholder="`例如: ${selectedChain.recommended}`"
                  class="threshold-input"
                />
                <span class="currency-label">{{ selectedChain.symbol }}</span>
              </div>
              
              <div class="quick-thresholds">
                <button 
                  v-for="amount in getQuickThresholds()" 
                  :key="amount"
                  @click="form.threshold = amount"
                  class="quick-btn"
                  :class="{ 'active': form.threshold === amount }"
                >
                  {{ amount }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Gas Amount Settings -->
        <div v-if="selectedChain" class="section">
          <h3 class="section-title">Refuel Amount Settings</h3>
          <div class="gas-amount-card">
            <div class="amount-description">
              <div class="desc-icon">⚡</div>
              <div>
                <p class="desc-title">Amount of {{ selectedChain.symbol }} to refuel each time triggered</p>
                <p class="desc-subtitle">Recommend setting enough amount for a period to avoid frequent triggers</p>
              </div>
            </div>
            
            <div class="amount-input-section">
              <label class="input-label">Refuel Amount</label>
              <div class="input-wrapper">
                <input 
                  v-model="form.gasAmount"
                  type="number" 
                  step="0.001"
                  min="0"
                  :placeholder="`例如: ${selectedChain.recommended}`"
                  class="amount-input"
                />
                <span class="currency-label">{{ selectedChain.symbol }}</span>
              </div>
              
              <div class="quick-amounts">
                <button 
                  v-for="amount in selectedChain.quickAmounts" 
                  :key="amount"
                  @click="form.gasAmount = amount"
                  class="quick-btn"
                  :class="{ 'active': form.gasAmount === amount }"
                >
                  {{ amount }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Advanced Settings -->
        <div v-if="selectedChain" class="section">
          <div class="advanced-toggle" @click="showAdvanced = !showAdvanced">
            <h3 class="section-title">Advanced Settings</h3>
            <svg 
              class="w-5 h-5 transition-transform"
              :class="{ 'rotate-180': showAdvanced }"
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
            </svg>
          </div>
          
          <div v-if="showAdvanced" class="advanced-settings">
            <div class="setting-row">
              <label class="setting-label">Maximum Daily Executions</label>
              <input 
                v-model="form.maxDailyExecutions"
                type="number" 
                min="1"
                max="20"
                class="setting-input"
              />
            </div>
            
            <div class="setting-row">
              <label class="setting-label">Cooldown Time (minutes)</label>
              <select v-model="form.cooldownMinutes" class="setting-select">
                <option value="5">5 minutes</option>
                <option value="15">15 minutes</option>
                <option value="30">30 minutes</option>
                <option value="60">1 hour</option>
                <option value="120">2 hours</option>
              </select>
            </div>
            
            <div class="setting-row">
              <label class="setting-label">Priority</label>
              <select v-model="form.priority" class="setting-select">
                <option value="low">Low</option>
                <option value="normal">Normal</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Cost Estimation -->
        <div v-if="costEstimation" class="section">
          <div class="cost-card">
            <h3 class="section-title">Cost Estimate</h3>
            <div class="cost-breakdown">
              <div class="cost-row">
                <span>Single Refuel Cost:</span>
                <span class="highlight">{{ costEstimation.singleRefuelCost }} USDC</span>
              </div>
              <div class="cost-row">
                <span>Estimated Monthly Executions:</span>
                <span>{{ costEstimation.monthlyExecutions }} times</span>
              </div>
              <div class="cost-row">
                <span>Estimated Monthly Cost:</span>
                <span>{{ costEstimation.monthlyCost }} USDC</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Submit Button -->
        <div class="section">
          <button 
            @click="handleSubmit"
            :disabled="!canSubmit"
            class="submit-btn"
            :class="{ 'loading': isLoading }"
          >
            <span v-if="isLoading" class="loading-content">
              <div class="loading-spinner"></div>
              {{ isEditing ? 'Updating...' : 'Creating...' }}
            </span>
            <span v-else>
              {{ isEditing ? '💾 Update Policy' : '✨ Create Policy' }}
            </span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { gasPassService } from '../services/gasPassService.js'

const props = defineProps({
  policy: {
    type: Object,
    default: null
  },
  supportedChains: {
    type: Array,
    required: true
  }
})

const emit = defineEmits(['close', 'success'])

// Data
const form = ref({
  chainId: null,
  chainName: '',
  symbol: '',
  threshold: '',
  gasAmount: '',
  maxDailyExecutions: 5,
  cooldownMinutes: 30,
  priority: 'normal',
  status: 'active'
})

const selectedChain = ref(null)
const showAdvanced = ref(false)
const isLoading = ref(false)
const costEstimation = ref(null)

// Computed
const isEditing = computed(() => !!props.policy)

const canSubmit = computed(() => {
  return selectedChain.value && 
         form.value.threshold && 
         form.value.gasAmount && 
         parseFloat(form.value.threshold) > 0 && 
         parseFloat(form.value.gasAmount) > 0 &&
         !isLoading.value
})

// Methods
const selectChain = (chain) => {
  selectedChain.value = chain
  form.value.chainId = chain.id
  form.value.chainName = chain.name
  form.value.symbol = chain.symbol
  
  // Set recommended values
  if (!form.value.threshold) {
    form.value.threshold = getQuickThresholds()[0]
  }
  if (!form.value.gasAmount) {
    form.value.gasAmount = chain.recommended
  }
}

const getQuickThresholds = () => {
  if (!selectedChain.value) return []
  
  const recommended = parseFloat(selectedChain.value.recommended)
  return [
    (recommended * 0.2).toString(),
    (recommended * 0.5).toString(),
    recommended.toString()
  ]
}

const getGasPriceColor = (gasPrice) => {
  const colors = {
    'High': 'text-red-600',
    'Medium': 'text-yellow-600',
    'Low': 'text-green-600'
  }
  return colors[gasPrice] || 'text-gaspass-gray-600'
}

const calculateCost = async () => {
  if (!selectedChain.value || !form.value.gasAmount || parseFloat(form.value.gasAmount) <= 0) {
    costEstimation.value = null
    return
  }

  try {
    const estimate = await gasPassService.estimateGasFee(form.value.gasAmount, selectedChain.value.id)
    costEstimation.value = {
      singleRefuelCost: estimate.total,
      monthlyExecutions: Math.ceil(30 / (form.value.cooldownMinutes / 60 / 24)) || 10,
      monthlyCost: (parseFloat(estimate.total) * 10).toFixed(2)
    }
  } catch (error) {
    console.error('Failed to calculate cost:', error)
  }
}

const handleSubmit = async () => {
  isLoading.value = true
  
  try {
    const policyData = {
      ...form.value,
      id: isEditing.value ? props.policy.id : Date.now(),
      createdAt: isEditing.value ? props.policy.createdAt : new Date().toISOString(),
      lastTriggered: isEditing.value ? props.policy.lastTriggered : null,
      executeCount: isEditing.value ? props.policy.executeCount : 0
    }
    
    if (isEditing.value) {
      await gasPassService.updatePolicy(policyData)
    } else {
      await gasPassService.createPolicy(policyData)
    }
    
    emit('success', policyData)
  } catch (error) {
    console.error('Failed to save policy:', error)
    alert('Failed to save policy: ' + error.message)
  } finally {
    isLoading.value = false
  }
}

// Watch for form changes to update cost estimation
watch([() => form.value.gasAmount, selectedChain], () => {
  calculateCost()
})

// Initialize form with existing policy data
onMounted(() => {
  if (props.policy) {
    form.value = { ...props.policy }
    const chain = props.supportedChains.find(c => c.id === props.policy.chainId)
    if (chain) {
      selectChain(chain)
    }
  }
})
</script>

<style scoped>
.modal-overlay {
  @apply fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4;
}

.modal-content {
  @apply bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-90vh overflow-y-auto;
}

.modal-header {
  @apply flex items-center justify-between p-6 border-b border-gaspass-gray-200;
}

.modal-title {
  @apply text-2xl font-bold text-gaspass-gray-800;
}

.close-btn {
  @apply text-gaspass-gray-400 hover:text-gaspass-gray-600 transition-colors;
}

.modal-body {
  @apply p-6 space-y-6;
}

.section {
  @apply space-y-4;
}

.section-title {
  @apply text-lg font-semibold text-gaspass-gray-800;
}

.chain-grid {
  @apply grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3;
}

.chain-card {
  @apply flex items-center p-4 border-2 border-gaspass-gray-200 rounded-lg cursor-pointer hover:border-gaspass-yellow-400 transition-all;
}

.chain-card.selected {
  @apply border-gaspass-yellow-400 bg-gaspass-yellow-50;
}

.chain-icon {
  @apply text-3xl mr-3;
}

.chain-info {
  @apply flex-1;
}

.chain-name {
  @apply font-semibold text-gaspass-gray-800;
}

.chain-symbol {
  @apply text-sm text-gaspass-gray-600;
}

.chain-meta {
  @apply flex gap-2 text-xs;
}

.gas-price {
  @apply font-medium;
}

.confirm-time {
  @apply text-gaspass-gray-500;
}

.threshold-card, .gas-amount-card {
  @apply bg-gaspass-gray-50 rounded-lg p-6 border border-gaspass-gray-200;
}

.threshold-description, .amount-description {
  @apply flex items-start gap-3 mb-4;
}

.desc-icon {
  @apply text-2xl;
}

.desc-title {
  @apply font-semibold text-gaspass-gray-800;
}

.desc-subtitle {
  @apply text-sm text-gaspass-gray-600;
}

.threshold-input-section, .amount-input-section {
  @apply space-y-4;
}

.input-label {
  @apply block text-sm font-medium text-gaspass-gray-700;
}

.input-wrapper {
  @apply relative;
}

.threshold-input, .amount-input {
  @apply w-full px-4 py-3 pr-20 border-2 border-gaspass-gray-200 rounded-lg focus:border-gaspass-yellow-400 focus:outline-none transition-colors;
}

.currency-label {
  @apply absolute right-4 top-1/2 transform -translate-y-1/2 font-semibold text-gaspass-gray-600;
}

.quick-thresholds, .quick-amounts {
  @apply flex gap-2 flex-wrap;
}

.quick-btn {
  @apply px-3 py-1 border-2 border-gaspass-gray-200 rounded-lg text-sm font-medium hover:border-gaspass-yellow-400 transition-colors;
}

.quick-btn.active {
  @apply border-gaspass-yellow-400 bg-gaspass-yellow-400 text-gaspass-gray-800;
}

.advanced-toggle {
  @apply flex items-center justify-between cursor-pointer;
}

.advanced-settings {
  @apply grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 p-4 bg-white rounded-lg border border-gaspass-gray-200;
}

.setting-row {
  @apply space-y-2;
}

.setting-label {
  @apply block text-sm font-medium text-gaspass-gray-700;
}

.setting-input, .setting-select {
  @apply w-full px-3 py-2 border-2 border-gaspass-gray-200 rounded-lg focus:border-gaspass-yellow-400 focus:outline-none transition-colors;
}

.setting-select {
  @apply bg-white;
}

.cost-card {
  @apply bg-gaspass-gray-50 rounded-lg p-4 border border-gaspass-gray-200;
}

.cost-breakdown {
  @apply space-y-2;
}

.cost-row {
  @apply flex justify-between text-sm;
}

.highlight {
  @apply text-gaspass-yellow-600 font-semibold;
}

.submit-btn {
  @apply w-full bg-gaspass-yellow-400 hover:bg-gaspass-yellow-500 disabled:bg-gaspass-gray-300 disabled:cursor-not-allowed text-gaspass-gray-800 font-semibold py-4 px-6 rounded-lg transition-all;
}

.loading-content {
  @apply flex items-center justify-center gap-2;
}

.loading-spinner {
  @apply w-5 h-5 border-2 border-gaspass-gray-600 border-t-transparent rounded-full animate-spin;
}

</style>