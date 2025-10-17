<template>
  <div class="modal-overlay" @click="$emit('close')">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h2 class="modal-title">⚡ 手動補 Gas</h2>
        <button @click="$emit('close')" class="close-btn">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>

      <div class="modal-body">
        <!-- Chain Selection -->
        <div class="section">
          <h3 class="section-title">選擇目標區塊鏈</h3>
          <div class="chain-grid">
            <div 
              v-for="chain in supportedChains" 
              :key="chain.id"
              class="chain-card"
              :class="{ 'selected': selectedChain?.id === chain.id }"
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

        <!-- Amount Input -->
        <div v-if="selectedChain" class="section">
          <h3 class="section-title">設定補充數量</h3>
          <div class="amount-section">
            <div class="amount-input-wrapper">
              <input 
                v-model="gasAmount"
                type="number" 
                step="0.001"
                min="0"
                :placeholder="`輸入 ${selectedChain.symbol} 數量`"
                class="amount-input"
              />
              <span class="currency-label">{{ selectedChain.symbol }}</span>
            </div>
            
            <div class="quick-amounts">
              <button 
                v-for="amount in selectedChain.quickAmounts" 
                :key="amount"
                @click="gasAmount = amount"
                class="quick-btn"
                :class="{ 'active': gasAmount === amount }"
              >
                {{ amount }}
              </button>
            </div>
            
            <div class="recommendation">
              💡 建議數量: {{ selectedChain.recommended }} {{ selectedChain.symbol }}
            </div>
          </div>
        </div>

        <!-- Recipient Address -->
        <div v-if="selectedChain" class="section">
          <h3 class="section-title">接收地址 (可選)</h3>
          <input 
            v-model="recipientAddress"
            type="text" 
            placeholder="預設為當前錢包地址"
            class="address-input"
          />
        </div>

        <!-- Cost Estimation -->
        <div v-if="costEstimation" class="section">
          <div class="cost-card">
            <h3 class="section-title">費用預估</h3>
            <div class="cost-breakdown">
              <div class="cost-row">
                <span>補充數量:</span>
                <span class="highlight">{{ gasAmount }} {{ selectedChain.symbol }}</span>
              </div>
              <div class="cost-row">
                <span>等值 USDC:</span>
                <span>{{ costEstimation.usdcValue }} USDC</span>
              </div>
              <div class="cost-row">
                <span>橋接費用:</span>
                <span>{{ costEstimation.bridgeFee }} USDC</span>
              </div>
              <div class="cost-row">
                <span>Gas 費用:</span>
                <span>{{ costEstimation.gasFee }} USDC</span>
              </div>
              <div class="cost-row total">
                <span>總計:</span>
                <span class="highlight">{{ costEstimation.total }} USDC</span>
              </div>
            </div>
            
            <div class="estimated-time">
              ⏱️ 預計完成時間: {{ costEstimation.estimatedTime }}
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
              執行中...
            </span>
            <span v-else>
              ⚡ 立即補充 Gas
            </span>
          </button>
        </div>

        <!-- Transaction Progress -->
        <div v-if="isLoading" class="section">
          <div class="progress-card">
            <h3 class="section-title">交易進度</h3>
            <div class="progress-steps">
              <div 
                v-for="(step, index) in progressSteps" 
                :key="index"
                class="progress-step"
                :class="{ 
                  'active': currentStep >= index + 1,
                  'completed': currentStep > index + 1 
                }"
              >
                <div class="step-indicator">
                  <div v-if="currentStep > index + 1" class="step-completed">✓</div>
                  <div v-else-if="currentStep === index + 1" class="step-loading">
                    <div class="loading-dot"></div>
                  </div>
                  <div v-else class="step-pending">{{ index + 1 }}</div>
                </div>
                <div class="step-content">
                  <div class="step-title">{{ step.title }}</div>
                  <div class="step-description">{{ step.description }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { gasPassService } from '../services/gasPassService.js'
import { supportedChains } from '../utils/mockData.js'
import { useWeb3 } from '../composables/useWeb3.js'

const props = defineProps({
  selectedCard: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['close', 'success'])

const { account } = useWeb3()

// Data
const selectedChain = ref(null)
const gasAmount = ref('')
const recipientAddress = ref('')
const isLoading = ref(false)
const currentStep = ref(0)
const costEstimation = ref(null)

const progressSteps = [
  { title: '準備交易', description: '驗證參數和餘額' },
  { title: '跨鏈橋接', description: '透過 Avail SDK 橋接' },
  { title: '轉帳 Gas', description: '將 Gas 轉入目標錢包' },
  { title: '完成確認', description: '交易完成並更新餘額' }
]

// Computed
const canSubmit = computed(() => {
  return selectedChain.value && 
         gasAmount.value && 
         parseFloat(gasAmount.value) > 0 && 
         !isLoading.value &&
         costEstimation.value &&
         parseFloat(costEstimation.value.total) <= parseFloat(props.selectedCard.balance)
})

// Methods
const selectChain = (chain) => {
  selectedChain.value = chain
  gasAmount.value = ''
  costEstimation.value = null
}

const calculateCost = async () => {
  if (!selectedChain.value || !gasAmount.value || parseFloat(gasAmount.value) <= 0) {
    costEstimation.value = null
    return
  }

  try {
    const estimate = await gasPassService.estimateGasFee(gasAmount.value, selectedChain.value.id)
    costEstimation.value = {
      usdcValue: estimate.gasCost,
      bridgeFee: estimate.bridgeFee,
      gasFee: '0.5',
      total: estimate.total,
      estimatedTime: getEstimatedTime(selectedChain.value.id)
    }
  } catch (error) {
    console.error('Failed to calculate cost:', error)
  }
}

const getEstimatedTime = (chainId) => {
  const times = {
    1: '2-5 分鐘',
    137: '1-3 分鐘', 
    56: '1-2 分鐘',
    43114: '1-3 分鐘',
    10: '2-4 分鐘',
    250: '30 秒 - 1 分鐘'
  }
  return times[chainId] || '2-5 分鐘'
}

const getGasPriceColor = (gasPrice) => {
  const colors = {
    'High': 'text-red-600',
    'Medium': 'text-yellow-600',
    'Low': 'text-green-600'
  }
  return colors[gasPrice] || 'text-gaspass-gray-600'
}

const handleSubmit = async () => {
  isLoading.value = true
  currentStep.value = 1
  
  try {
    // Step 1: Prepare
    await new Promise(resolve => setTimeout(resolve, 800))
    currentStep.value = 2
    
    // Step 2: Bridge
    await new Promise(resolve => setTimeout(resolve, 1500))
    currentStep.value = 3
    
    // Step 3: Transfer Gas
    await new Promise(resolve => setTimeout(resolve, 1200))
    currentStep.value = 4
    
    // Step 4: Complete
    const result = await gasPassService.manualRefuel({
      tokenId: props.selectedCard.tokenId,
      targetChainId: selectedChain.value.id,
      gasAmount: gasAmount.value,
      recipientAddress: recipientAddress.value || account.value
    })
    
    if (result.success) {
      emit('success', {
        txHash: result.txHash,
        chain: selectedChain.value,
        amount: gasAmount.value,
        cost: result.cost
      })
    } else {
      throw new Error(result.error)
    }
    
  } catch (error) {
    console.error('Manual refuel failed:', error)
    alert('補 Gas 失敗: ' + error.message)
  } finally {
    isLoading.value = false
    currentStep.value = 0
  }
}

// Watch for amount changes
watch([gasAmount, selectedChain], () => {
  calculateCost()
})

// Set default recipient
watch(account, (newAccount) => {
  if (newAccount && !recipientAddress.value) {
    recipientAddress.value = newAccount
  }
}, { immediate: true })
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

.amount-section {
  @apply space-y-4;
}

.amount-input-wrapper {
  @apply relative;
}

.amount-input {
  @apply w-full px-4 py-3 pr-20 border-2 border-gaspass-gray-200 rounded-lg focus:border-gaspass-yellow-400 focus:outline-none transition-colors;
}

.currency-label {
  @apply absolute right-4 top-1/2 transform -translate-y-1/2 font-semibold text-gaspass-gray-600;
}

.quick-amounts {
  @apply flex gap-2 flex-wrap;
}

.quick-btn {
  @apply px-3 py-1 border-2 border-gaspass-gray-200 rounded-lg text-sm font-medium hover:border-gaspass-yellow-400 transition-colors;
}

.quick-btn.active {
  @apply border-gaspass-yellow-400 bg-gaspass-yellow-400 text-gaspass-gray-800;
}

.recommendation {
  @apply text-sm text-gaspass-gray-600 bg-gaspass-gray-50 p-3 rounded-lg;
}

.address-input {
  @apply w-full px-4 py-3 border-2 border-gaspass-gray-200 rounded-lg focus:border-gaspass-yellow-400 focus:outline-none transition-colors font-mono text-sm;
}

.cost-card {
  @apply bg-gaspass-gray-50 rounded-lg p-4 border border-gaspass-gray-200;
}

.cost-breakdown {
  @apply space-y-2 mb-4;
}

.cost-row {
  @apply flex justify-between text-sm;
}

.cost-row.total {
  @apply border-t border-gaspass-gray-200 pt-2 font-semibold;
}

.highlight {
  @apply text-gaspass-yellow-600 font-semibold;
}

.estimated-time {
  @apply text-sm text-gaspass-gray-600 bg-white p-2 rounded border;
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

.progress-card {
  @apply bg-blue-50 rounded-lg p-4 border border-blue-200;
}

.progress-steps {
  @apply space-y-3;
}

.progress-step {
  @apply flex items-start gap-3;
}

.progress-step.active .step-title {
  @apply text-blue-600;
}

.progress-step.completed .step-title {
  @apply text-green-600;
}

.step-indicator {
  @apply flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center;
}

.step-completed {
  @apply w-full h-full bg-green-500 text-white rounded-full flex items-center justify-center font-bold;
}

.step-loading {
  @apply w-full h-full bg-blue-500 text-white rounded-full flex items-center justify-center;
}

.loading-dot {
  @apply w-2 h-2 bg-white rounded-full animate-pulse;
}

.step-pending {
  @apply w-full h-full bg-gaspass-gray-300 text-gaspass-gray-600 rounded-full flex items-center justify-center font-semibold;
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
</style>