<template>
  <div class="modal-overlay" @click="$emit('close')">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h2 class="modal-title">⚙️ Swap Settings</h2>
        <button @click="$emit('close')" class="close-btn">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>

      <div class="modal-body">
        <!-- Slippage Tolerance -->
        <div class="setting-section">
          <div class="setting-header">
            <h3 class="setting-title">Slippage Tolerance</h3>
            <div class="setting-info">
              <svg class="w-4 h-4 text-gaspass-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <div class="info-tooltip">
                <p>Slippage is the difference between expected and actual execution prices</p>
                <p>Setting too low may cause transaction failure, setting too high may cause losses</p>
              </div>
            </div>
          </div>
          
          <div class="slippage-options">
            <button 
              v-for="option in slippageOptions" 
              :key="option"
              @click="localSlippage = option"
              class="slippage-btn"
              :class="{ 'active': localSlippage === option }"
            >
              {{ option }}%
            </button>
            <div class="custom-slippage">
              <input 
                v-model="localSlippage"
                type="number" 
                step="0.1"
                min="0.1"
                max="50"
                class="custom-input"
                placeholder="自訂"
              />
              <span class="custom-unit">%</span>
            </div>
          </div>
          
          <div class="slippage-warning" v-if="getSlippageWarning()">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L5.08 15.5c-.77.833.192 2.5 1.732 2.5z"></path>
            </svg>
            {{ getSlippageWarning() }}
          </div>
        </div>

        <!-- Transaction Deadline -->
        <div class="setting-section">
          <div class="setting-header">
            <h3 class="setting-title">Transaction Deadline</h3>
            <div class="setting-info">
              <svg class="w-4 h-4 text-gaspass-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <div class="info-tooltip">
                <p>Transaction must complete within this time, otherwise it will be cancelled</p>
                <p>Cross-chain transactions typically require longer time, recommend setting 20+ minutes</p>
              </div>
            </div>
          </div>
          
          <div class="deadline-options">
            <button 
              v-for="option in deadlineOptions" 
              :key="option"
              @click="localDeadline = option"
              class="deadline-btn"
              :class="{ 'active': localDeadline === option }"
            >
              {{ option }} minutes
            </button>
            <div class="custom-deadline">
              <input 
                v-model="localDeadline"
                type="number" 
                step="5"
                min="5"
                max="120"
                class="custom-input"
                placeholder="自訂"
              />
              <span class="custom-unit">minutes</span>
            </div>
          </div>
        </div>

        <!-- MEV Protection -->
        <div class="setting-section">
          <div class="setting-header">
            <h3 class="setting-title">MEV Protection</h3>
            <div class="setting-info">
              <svg class="w-4 h-4 text-gaspass-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <div class="info-tooltip">
                <p>MEV (Maximal Extractable Value) protection can prevent front-running or sandwich attacks</p>
                <p>When enabled, transactions will execute through private mempool, improving security</p>
              </div>
            </div>
          </div>
          
          <div class="toggle-section">
            <label class="toggle-wrapper">
              <input 
                v-model="mevProtection" 
                type="checkbox"
                class="toggle-input"
              />
              <span class="toggle-slider"></span>
            </label>
            <div class="toggle-info">
              <div class="toggle-label">Enable MEV Protection</div>
              <div class="toggle-description">
                {{ mevProtection ? 'Transactions will execute through secure path' : 'Using standard mempool' }}
              </div>
            </div>
          </div>
        </div>

        <!-- Advanced Settings -->
        <div class="setting-section">
          <div class="advanced-toggle" @click="showAdvanced = !showAdvanced">
            <h3 class="setting-title">Advanced Settings</h3>
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
            <div class="advanced-item">
              <label class="advanced-label">Gas Price Multiplier</label>
              <div class="advanced-input-wrapper">
                <input 
                  v-model="gasMultiplier"
                  type="number" 
                  step="0.1"
                  min="1"
                  max="5"
                  class="advanced-input"
                />
                <span class="advanced-unit">x</span>
              </div>
              <p class="advanced-description">Adjust Gas price to speed up transaction confirmation</p>
            </div>
            
            <div class="advanced-item">
              <label class="advanced-label">Bridge Protocol Preference</label>
              <select v-model="bridgePreference" class="advanced-select">
                <option value="auto">Auto Select</option>
                <option value="avail">Avail DA</option>
                <option value="layerzero">LayerZero</option>
                <option value="stargate">Stargate</option>
              </select>
              <p class="advanced-description">Choose preferred cross-chain bridge protocol</p>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="action-buttons">
          <button @click="resetToDefaults" class="reset-btn">
            Reset to Defaults
          </button>
          <button @click="saveSettings" class="save-btn">
            Save Settings
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const props = defineProps({
  slippage: {
    type: Number,
    default: 0.5
  },
  deadline: {
    type: Number,
    default: 20
  }
})

const emit = defineEmits(['close', 'save'])

// Data
const localSlippage = ref(props.slippage)
const localDeadline = ref(props.deadline)
const mevProtection = ref(true)
const gasMultiplier = ref(1.2)
const bridgePreference = ref('auto')
const showAdvanced = ref(false)

const slippageOptions = [0.1, 0.5, 1.0, 3.0]
const deadlineOptions = [10, 20, 30, 60]

// Methods
const getSlippageWarning = () => {
  const slippage = parseFloat(localSlippage.value)
  if (slippage < 0.1) {
    return 'Slippage set too low, transaction may fail'
  } else if (slippage > 5) {
    return 'Slippage set too high, may cause significant losses'
  } else if (slippage > 1) {
    return 'High slippage setting, please confirm carefully'
  }
  return null
}

const resetToDefaults = () => {
  localSlippage.value = 0.5
  localDeadline.value = 20
  mevProtection.value = true
  gasMultiplier.value = 1.2
  bridgePreference.value = 'auto'
}

const saveSettings = () => {
  emit('save', {
    slippage: parseFloat(localSlippage.value),
    deadline: parseInt(localDeadline.value),
    mevProtection: mevProtection.value,
    gasMultiplier: parseFloat(gasMultiplier.value),
    bridgePreference: bridgePreference.value
  })
}

// Lifecycle
onMounted(() => {
  localSlippage.value = props.slippage
  localDeadline.value = props.deadline
})
</script>

<style scoped>
.modal-overlay {
  @apply fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4;
}

.modal-content {
  @apply bg-white rounded-xl shadow-xl max-w-lg w-full max-h-90vh overflow-y-auto;
}

.modal-header {
  @apply flex items-center justify-between p-6 border-b border-gaspass-gray-200;
}

.modal-title {
  @apply text-xl font-bold text-gaspass-gray-800;
}

.close-btn {
  @apply text-gaspass-gray-400 hover:text-gaspass-gray-600 transition-colors;
}

.modal-body {
  @apply p-6 space-y-6;
}

.setting-section {
  @apply space-y-4;
}

.setting-header {
  @apply flex items-center justify-between;
}

.setting-title {
  @apply text-lg font-semibold text-gaspass-gray-800;
}

.setting-info {
  @apply relative;
}

.setting-info:hover .info-tooltip {
  @apply opacity-100 visible;
}

.info-tooltip {
  @apply absolute right-0 top-6 w-64 p-3 bg-gaspass-gray-800 text-white text-sm rounded-lg opacity-0 invisible transition-all z-10;
}

.info-tooltip::before {
  @apply absolute right-2 -top-1 w-2 h-2 bg-gaspass-gray-800 transform rotate-45;
  content: '';
}

.slippage-options, .deadline-options {
  @apply flex gap-2 flex-wrap;
}

.slippage-btn, .deadline-btn {
  @apply px-3 py-2 border-2 border-gaspass-gray-200 rounded-lg text-sm font-medium hover:border-gaspass-yellow-400 transition-colors;
}

.slippage-btn.active, .deadline-btn.active {
  @apply border-gaspass-yellow-400 bg-gaspass-yellow-400 text-gaspass-gray-800;
}

.custom-slippage, .custom-deadline {
  @apply relative;
}

.custom-input {
  @apply w-20 px-3 py-2 pr-8 border-2 border-gaspass-gray-200 rounded-lg text-sm focus:border-gaspass-yellow-400 focus:outline-none transition-colors;
}

.custom-unit {
  @apply absolute right-2 top-1/2 transform -translate-y-1/2 text-sm text-gaspass-gray-600;
}

.slippage-warning {
  @apply flex items-center gap-2 p-3 bg-yellow-50 text-yellow-800 border border-yellow-200 rounded-lg text-sm;
}

.toggle-section {
  @apply flex items-center gap-4;
}

.toggle-wrapper {
  @apply relative inline-block w-12 h-6;
}

.toggle-input {
  @apply opacity-0 w-0 h-0;
}

.toggle-slider {
  @apply absolute cursor-pointer top-0 left-0 right-0 bottom-0 bg-gaspass-gray-300 rounded-full transition-all duration-300;
}

.toggle-slider:before {
  @apply absolute content-[''] h-5 w-5 left-0.5 bottom-0.5 bg-white rounded-full transition-all duration-300;
}

.toggle-input:checked + .toggle-slider {
  @apply bg-gaspass-yellow-400;
}

.toggle-input:checked + .toggle-slider:before {
  @apply transform translate-x-6;
}

.toggle-info {
  @apply flex-1;
}

.toggle-label {
  @apply font-medium text-gaspass-gray-800;
}

.toggle-description {
  @apply text-sm text-gaspass-gray-600;
}

.advanced-toggle {
  @apply flex items-center justify-between cursor-pointer;
}

.advanced-settings {
  @apply space-y-4 pt-4 border-t border-gaspass-gray-200;
}

.advanced-item {
  @apply space-y-2;
}

.advanced-label {
  @apply block text-sm font-medium text-gaspass-gray-700;
}

.advanced-input-wrapper {
  @apply relative;
}

.advanced-input {
  @apply w-full px-3 py-2 pr-8 border-2 border-gaspass-gray-200 rounded-lg focus:border-gaspass-yellow-400 focus:outline-none transition-colors;
}

.advanced-unit {
  @apply absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-gaspass-gray-600;
}

.advanced-select {
  @apply w-full px-3 py-2 border-2 border-gaspass-gray-200 rounded-lg focus:border-gaspass-yellow-400 focus:outline-none transition-colors bg-white;
}

.advanced-description {
  @apply text-xs text-gaspass-gray-600;
}

.action-buttons {
  @apply flex gap-3 pt-6 border-t border-gaspass-gray-200;
}

.reset-btn {
  @apply flex-1 px-4 py-3 bg-gaspass-gray-200 hover:bg-gaspass-gray-300 text-gaspass-gray-800 font-semibold rounded-lg transition-colors;
}

.save-btn {
  @apply flex-1 px-4 py-3 bg-gaspass-yellow-400 hover:bg-gaspass-yellow-500 text-gaspass-gray-800 font-semibold rounded-lg transition-colors;
}

</style>