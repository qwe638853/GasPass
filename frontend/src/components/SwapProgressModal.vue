<template>
  <div class="modal-overlay" @click="canClose && $emit('close')">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h2 class="modal-title">
          {{ isCompleted ? '🎉 Swap Complete' : '⏳ Swap In Progress' }}
        </h2>
        <button 
          v-if="canClose" 
          @click="$emit('close')" 
          class="close-btn"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>

      <div class="modal-body">
        <!-- Swap Overview -->
        <div class="swap-overview">
          <div class="swap-path">
            <div class="path-item from">
              <div class="path-icon">{{ getChainIcon(swapData?.fromChainId) }}</div>
              <div class="path-details">
                <div class="path-amount">{{ swapData?.fromAmount }}</div>
                <div class="path-symbol">{{ getChainSymbol(swapData?.fromChainId) }}</div>
              </div>
            </div>
            
            <div class="path-arrow">
              <svg class="w-8 h-8 text-gaspass-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path>
              </svg>
            </div>
            
            <div class="path-item to">
              <div class="path-icon">{{ getChainIcon(swapData?.toChainId) }}</div>
              <div class="path-details">
                <div class="path-amount">{{ swapData?.toAmount }}</div>
                <div class="path-symbol">{{ getChainSymbol(swapData?.toChainId) }}</div>
              </div>
            </div>
          </div>
          
          <div class="swap-route">
            <span class="route-label">Route:</span>
            <span class="route-path">{{ swapData?.quote?.route || 'Direct Swap' }}</span>
          </div>
        </div>

        <!-- Progress Steps -->
        <div class="progress-section">
          <h3 class="progress-title">Swap Progress</h3>
          <div class="progress-steps">
            <div 
              v-for="(step, index) in progressSteps" 
              :key="index"
              class="progress-step"
              :class="getStepClass(index)"
            >
              <div class="step-indicator">
                <div v-if="currentStep > index" class="step-completed">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                </div>
                <div v-else-if="currentStep === index" class="step-loading">
                  <div class="loading-dot"></div>
                </div>
                <div v-else class="step-pending">{{ index + 1 }}</div>
              </div>
              
              <div class="step-content">
                <div class="step-title">{{ step.title }}</div>
                <div class="step-description">{{ step.description }}</div>
                <div v-if="step.txHash" class="step-hash">
                  <a :href="getExplorerUrl(step.txHash, step.chainId)" target="_blank" class="hash-link">
                    {{ formatHash(step.txHash) }}
                    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
                    </svg>
                  </a>
                </div>
              </div>
              
              <div v-if="currentStep === index && !isCompleted" class="step-timer">
                {{ formatTime(stepTimer) }}
              </div>
            </div>
          </div>
        </div>

        <!-- Error Display -->
        <div v-if="errorMessage" class="error-section">
          <div class="error-card">
            <div class="error-icon">❌</div>
            <div class="error-content">
              <h4 class="error-title">Swap Failed</h4>
              <p class="error-message">{{ errorMessage }}</p>
              <div class="error-actions">
                <button @click="retrySwap" class="retry-btn">
                  🔄 Retry
                </button>
                <button @click="$emit('close')" class="close-error-btn">
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Success Display -->
        <div v-if="isCompleted && !errorMessage" class="success-section">
          <div class="success-card">
            <div class="success-icon">🎉</div>
            <div class="success-content">
              <h4 class="success-title">Swap Successfully Completed!</h4>
              <p class="success-message">
                You successfully swapped {{ swapData?.fromAmount }} {{ getChainSymbol(swapData?.fromChainId) }} 
                for {{ actualReceived || swapData?.toAmount }} {{ getChainSymbol(swapData?.toChainId) }}
              </p>
              
              <div class="success-stats">
                <div class="stat-item">
                  <span class="stat-label">Total Cost:</span>
                  <span class="stat-value">${{ totalFee }} USDC</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">Completed:</span>
                  <span class="stat-value">{{ completionTime }}</span>
                </div>
              </div>
              
              <div class="success-actions">
                <button @click="viewInExplorer" class="explorer-btn">
                  🔍 View Transaction
                </button>
                <button @click="addToWallet" class="add-token-btn">
                  💳 Add Token
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Estimated Time -->
        <div v-if="!isCompleted && !errorMessage" class="time-estimate">
          <div class="estimate-item">
            <span class="estimate-label">Estimated Time Remaining:</span>
            <span class="estimate-value">{{ estimatedTimeRemaining }}</span>
          </div>
          <div class="estimate-item">
            <span class="estimate-label">Total Estimated Time:</span>
            <span class="estimate-value">{{ swapData?.quote?.estimatedTime || '3-5 minutes' }}</span>
          </div>
        </div>

        <!-- Action Buttons -->
        <div v-if="isCompleted" class="action-buttons">
          <button @click="shareSwap" class="share-btn">
            📤 Share
          </button>
          <button @click="newSwap" class="new-swap-btn">
            🔄 New Swap
          </button>
          <button @click="$emit('close')" class="done-btn">
            ✅ Complete
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { supportedChains } from '../utils/mockData.js'

const props = defineProps({
  swapData: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['close', 'retry', 'newSwap'])

// Data
const currentStep = ref(0)
const stepTimer = ref(0)
const errorMessage = ref('')
const actualReceived = ref('')
const totalFee = ref('0.00')
const completionTime = ref('')
const timer = ref(null)

const progressSteps = ref([
  { 
    title: 'Prepare Transaction', 
    description: 'Verify parameters and balance',
    txHash: null,
    chainId: null
  },
  { 
    title: 'Source Chain Transaction', 
    description: 'Execute transaction on source chain',
    txHash: null,
    chainId: null
  },
  { 
    title: 'Cross-Chain Bridge', 
    description: 'Transfer assets through bridge protocol',
    txHash: null,
    chainId: null
  },
  { 
    title: 'Target Chain Confirmation', 
    description: 'Confirm reception on target chain',
    txHash: null,
    chainId: null
  }
])

// Computed
const isCompleted = computed(() => {
  return currentStep.value >= progressSteps.value.length && !errorMessage.value
})

const canClose = computed(() => {
  return isCompleted.value || errorMessage.value
})

const estimatedTimeRemaining = computed(() => {
  if (isCompleted.value) return '已完成'
  
  const totalSteps = progressSteps.value.length
  const remainingSteps = totalSteps - currentStep.value
  const avgTimePerStep = 45 // seconds
  const remainingSeconds = remainingSteps * avgTimePerStep
  
  if (remainingSeconds < 60) {
    return `${remainingSeconds} 秒`
  } else {
    const minutes = Math.ceil(remainingSeconds / 60)
    return `${minutes} 分鐘`
  }
})

// Methods
const getChainIcon = (chainId) => {
  const chain = supportedChains.find(c => c.id === chainId)
  return chain ? chain.icon : '🔗'
}

const getChainSymbol = (chainId) => {
  const chain = supportedChains.find(c => c.id === chainId)
  return chain ? chain.symbol : 'Token'
}

const getStepClass = (index) => {
  if (currentStep.value > index) return 'completed'
  if (currentStep.value === index) return 'active'
  return 'pending'
}

const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

const formatHash = (hash) => {
  if (!hash) return ''
  return `${hash.slice(0, 6)}...${hash.slice(-4)}`
}

const getExplorerUrl = (hash, chainId) => {
  const explorers = {
    1: 'https://etherscan.io/tx/',
    137: 'https://polygonscan.com/tx/',
    56: 'https://bscscan.com/tx/',
    43114: 'https://snowtrace.io/tx/',
    10: 'https://optimistic.etherscan.io/tx/',
    250: 'https://ftmscan.com/tx/'
  }
  return (explorers[chainId] || 'https://etherscan.io/tx/') + hash
}

const simulateSwapProgress = async () => {
  try {
    // Step 1: Prepare
    currentStep.value = 0
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Step 2: Source chain transaction
    currentStep.value = 1
    progressSteps.value[1].txHash = '0x' + Math.random().toString(16).substr(2, 64)
    progressSteps.value[1].chainId = props.swapData.fromChainId
    await new Promise(resolve => setTimeout(resolve, 3000))
    
    // Step 3: Bridge
    currentStep.value = 2
    progressSteps.value[2].txHash = '0x' + Math.random().toString(16).substr(2, 64)
    progressSteps.value[2].chainId = props.swapData.fromChainId
    await new Promise(resolve => setTimeout(resolve, 4000))
    
    // Step 4: Target chain confirmation
    currentStep.value = 3
    progressSteps.value[3].txHash = '0x' + Math.random().toString(16).substr(2, 64)
    progressSteps.value[3].chainId = props.swapData.toChainId
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Complete
    currentStep.value = 4
    actualReceived.value = (parseFloat(props.swapData.toAmount) * 0.998).toFixed(6)
    totalFee.value = props.swapData.quote?.totalFee || '2.50'
    completionTime.value = formatTime(stepTimer.value)
    
  } catch (error) {
    errorMessage.value = error.message || '兌換過程中發生錯誤'
  }
}

const retrySwap = () => {
  errorMessage.value = ''
  currentStep.value = 0
  stepTimer.value = 0
  simulateSwapProgress()
}

const newSwap = () => {
  emit('newSwap')
}

const viewInExplorer = () => {
  const finalStep = progressSteps.value[3]
  if (finalStep.txHash) {
    window.open(getExplorerUrl(finalStep.txHash, finalStep.chainId), '_blank')
  }
}

const addToWallet = async () => {
  try {
    await window.ethereum.request({
      method: 'wallet_watchAsset',
      params: {
        type: 'ERC20',
        options: {
          address: '0x0000000000000000000000000000000000000000', // Token address
          symbol: getChainSymbol(props.swapData.toChainId),
          decimals: 18,
        },
      },
    })
  } catch (error) {
    console.error('Failed to add token to wallet:', error)
  }
}

const shareSwap = () => {
  const text = `我剛在 GasPass 上完成了跨鏈兌換！${props.swapData.fromAmount} ${getChainSymbol(props.swapData.fromChainId)} → ${actualReceived.value} ${getChainSymbol(props.swapData.toChainId)}`
  
  if (navigator.share) {
    navigator.share({
      title: 'GasPass 跨鏈兌換',
      text: text,
      url: window.location.href
    })
  } else {
    navigator.clipboard.writeText(text)
    alert('分享內容已複製到剪貼板！')
  }
}

// Lifecycle
onMounted(() => {
  simulateSwapProgress()
  
  // Start timer
  timer.value = setInterval(() => {
    stepTimer.value++
  }, 1000)
})

onUnmounted(() => {
  if (timer.value) {
    clearInterval(timer.value)
  }
})
</script>

<style scoped>
.modal-overlay {
  @apply fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4;
}

.modal-content {
  @apply bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-90vh overflow-y-auto;
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

.swap-overview {
  @apply bg-gradient-to-r from-gaspass-yellow-50 to-gaspass-yellow-100 rounded-xl p-6 border border-gaspass-yellow-200;
}

.swap-path {
  @apply flex items-center justify-between mb-4;
}

.path-item {
  @apply flex items-center gap-3;
}

.path-icon {
  @apply text-3xl;
}

.path-amount {
  @apply text-xl font-bold text-gaspass-gray-800;
}

.path-symbol {
  @apply text-sm text-gaspass-gray-600;
}

.path-arrow {
  @apply flex-shrink-0;
}

.swap-route {
  @apply text-sm text-gaspass-gray-600;
}

.route-label {
  @apply font-medium;
}

.route-path {
  @apply font-mono;
}

.progress-section {
  @apply space-y-4;
}

.progress-title {
  @apply text-lg font-semibold text-gaspass-gray-800;
}

.progress-steps {
  @apply space-y-4;
}

.progress-step {
  @apply flex items-start gap-4 p-4 rounded-lg transition-colors;
}

.progress-step.completed {
  @apply bg-green-50 border border-green-200;
}

.progress-step.active {
  @apply bg-blue-50 border border-blue-200;
}

.progress-step.pending {
  @apply bg-gaspass-gray-50 border border-gaspass-gray-200;
}

.step-indicator {
  @apply flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center;
}

.step-completed {
  @apply w-full h-full bg-green-500 text-white rounded-full flex items-center justify-center;
}

.step-loading {
  @apply w-full h-full bg-blue-500 text-white rounded-full flex items-center justify-center;
}

.loading-dot {
  @apply w-2 h-2 bg-white rounded-full animate-pulse;
}

.step-pending {
  @apply w-full h-full bg-gaspass-gray-300 text-gaspass-gray-600 rounded-full flex items-center justify-center font-semibold text-sm;
}

.step-content {
  @apply flex-1;
}

.step-title {
  @apply font-semibold text-gaspass-gray-800;
}

.step-description {
  @apply text-sm text-gaspass-gray-600;
}

.step-hash {
  @apply mt-1;
}

.hash-link {
  @apply inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-mono;
}

.step-timer {
  @apply text-sm text-gaspass-gray-500 font-mono;
}

.error-section, .success-section {
  @apply mt-6;
}

.error-card {
  @apply flex items-start gap-4 p-6 bg-red-50 border border-red-200 rounded-xl;
}

.error-icon {
  @apply text-2xl;
}

.error-title {
  @apply font-semibold text-red-800 mb-2;
}

.error-message {
  @apply text-red-700 mb-4;
}

.error-actions {
  @apply flex gap-2;
}

.retry-btn {
  @apply px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors;
}

.close-error-btn {
  @apply px-4 py-2 bg-gaspass-gray-200 hover:bg-gaspass-gray-300 text-gaspass-gray-800 font-semibold rounded-lg transition-colors;
}

.success-card {
  @apply flex items-start gap-4 p-6 bg-green-50 border border-green-200 rounded-xl;
}

.success-icon {
  @apply text-2xl;
}

.success-title {
  @apply font-semibold text-green-800 mb-2;
}

.success-message {
  @apply text-green-700 mb-4;
}

.success-stats {
  @apply space-y-2 mb-4;
}

.stat-item {
  @apply flex justify-between text-sm;
}

.stat-label {
  @apply text-green-700;
}

.stat-value {
  @apply font-semibold text-green-800;
}

.success-actions {
  @apply flex gap-2;
}

.explorer-btn, .add-token-btn {
  @apply px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors;
}

.time-estimate {
  @apply bg-gaspass-gray-50 rounded-lg p-4 space-y-2;
}

.estimate-item {
  @apply flex justify-between text-sm;
}

.estimate-label {
  @apply text-gaspass-gray-600;
}

.estimate-value {
  @apply font-semibold text-gaspass-gray-800;
}

.action-buttons {
  @apply flex gap-3;
}

.share-btn, .new-swap-btn, .done-btn {
  @apply flex-1 px-4 py-3 font-semibold rounded-lg transition-colors;
}

.share-btn {
  @apply bg-blue-500 hover:bg-blue-600 text-white;
}

.new-swap-btn {
  @apply bg-gaspass-yellow-400 hover:bg-gaspass-yellow-500 text-gaspass-gray-800;
}

.done-btn {
  @apply bg-green-500 hover:bg-green-600 text-white;
}
</style>