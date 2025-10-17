<template>
  <div class="modal-overlay" @click="$emit('close')">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h2 class="modal-title">🔄 轉移儲值卡餘額</h2>
        <button @click="$emit('close')" class="close-btn">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>

      <div class="modal-body">
        <!-- Source Card Selection -->
        <div class="section">
          <h3 class="section-title">選擇來源儲值卡</h3>
          <div class="cards-grid">
            <div 
              v-for="card in availableSourceCards" 
              :key="card.tokenId"
              class="card-option"
              :class="{ 'selected': fromCard?.tokenId === card.tokenId }"
              @click="selectFromCard(card)"
            >
              <div class="card-icon">🎫</div>
              <div class="card-info">
                <div class="card-name">GasPass #{{ card.tokenId }}</div>
                <div class="card-balance">${{ card.balance }} USDC</div>
                <div class="card-date">可轉移餘額</div>
              </div>
            </div>
          </div>
          
          <div v-if="availableSourceCards.length === 0" class="empty-state">
            <div class="empty-icon">💸</div>
            <p class="empty-text">沒有可轉移的儲值卡</p>
            <p class="empty-description">需要至少一張有餘額的儲值卡才能進行轉移</p>
          </div>
        </div>

        <!-- Target Card Selection -->
        <div v-if="fromCard" class="section">
          <h3 class="section-title">選擇目標儲值卡</h3>
          <div class="cards-grid">
            <div 
              v-for="card in availableTargetCards" 
              :key="card.tokenId"
              class="card-option"
              :class="{ 'selected': toCard?.tokenId === card.tokenId }"
              @click="selectToCard(card)"
            >
              <div class="card-icon">🎯</div>
              <div class="card-info">
                <div class="card-name">GasPass #{{ card.tokenId }}</div>
                <div class="card-balance">${{ card.balance }} USDC</div>
                <div class="card-date">接收目標</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Transfer Amount -->
        <div v-if="fromCard && toCard" class="section">
          <h3 class="section-title">轉移金額</h3>
          <div class="transfer-section">
            <div class="transfer-preview">
              <div class="transfer-card from">
                <div class="transfer-label">來源</div>
                <div class="transfer-info">
                  <div class="transfer-name">GasPass #{{ fromCard.tokenId }}</div>
                  <div class="transfer-balance">
                    ${{ fromCard.balance }} → ${{ fromCardNewBalance }}
                  </div>
                </div>
              </div>
              
              <div class="transfer-arrow">
                <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path>
                </svg>
              </div>
              
              <div class="transfer-card to">
                <div class="transfer-label">目標</div>
                <div class="transfer-info">
                  <div class="transfer-name">GasPass #{{ toCard.tokenId }}</div>
                  <div class="transfer-balance">
                    ${{ toCard.balance }} → ${{ toCardNewBalance }}
                  </div>
                </div>
              </div>
            </div>
            
            <div class="amount-input-wrapper">
              <input 
                v-model="transferAmount"
                type="number" 
                step="0.01"
                min="0"
                :max="maxTransferAmount"
                placeholder="輸入轉移金額"
                class="amount-input"
              />
              <span class="currency-label">USDC</span>
            </div>
            
            <div class="quick-amounts">
              <button 
                v-for="amount in getQuickAmounts()" 
                :key="amount"
                @click="transferAmount = amount"
                class="quick-btn"
                :class="{ 'active': transferAmount == amount }"
              >
                ${{ amount }}
              </button>
              <button 
                @click="transferAmount = maxTransferAmount"
                class="quick-btn max"
                :class="{ 'active': transferAmount == maxTransferAmount }"
              >
                全部
              </button>
            </div>
            
            <div class="transfer-limits">
              <div class="limit-item">
                <span class="limit-label">最大可轉移:</span>
                <span class="limit-value">${{ maxTransferAmount }} USDC</span>
              </div>
              <div class="limit-item">
                <span class="limit-label">轉移後保留:</span>
                <span class="limit-value">${{ (parseFloat(fromCard.balance) - parseFloat(transferAmount || 0)).toFixed(2) }} USDC</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Fee Information -->
        <div v-if="fromCard && toCard && transferAmount" class="section">
          <div class="fee-card">
            <h3 class="section-title">費用說明</h3>
            <div class="fee-info">
              <div class="fee-icon">ℹ️</div>
              <div class="fee-content">
                <p class="fee-title">內部轉移免費</p>
                <p class="fee-description">
                  儲值卡之間的餘額轉移完全在智能合約內部進行，不會產生額外的 Gas 費用或手續費。
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Confirmation -->
        <div v-if="fromCard && toCard && transferAmount" class="section">
          <div class="confirmation-card">
            <h3 class="section-title">確認轉移</h3>
            <div class="confirmation-details">
              <div class="confirmation-row">
                <span>轉移金額:</span>
                <span class="highlight">${{ transferAmount }} USDC</span>
              </div>
              <div class="confirmation-row">
                <span>從:</span>
                <span>GasPass #{{ fromCard.tokenId }}</span>
              </div>
              <div class="confirmation-row">
                <span>到:</span>
                <span>GasPass #{{ toCard.tokenId }}</span>
              </div>
              <div class="confirmation-row">
                <span>手續費:</span>
                <span class="free">免費</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Submit Button -->
        <div class="section">
          <button 
            @click="handleTransfer"
            :disabled="!canTransfer"
            class="submit-btn"
            :class="{ 'loading': isLoading }"
          >
            <span v-if="isLoading" class="loading-content">
              <div class="loading-spinner"></div>
              轉移中...
            </span>
            <span v-else>
              🔄 確認轉移
            </span>
          </button>
          
          <div v-if="!canTransfer && transferAmount" class="error-message">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            {{ getErrorMessage() }}
          </div>
        </div>

        <!-- Transaction Progress -->
        <div v-if="isLoading" class="section">
          <div class="progress-card">
            <h3 class="section-title">轉移進度</h3>
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
import { ref, computed } from 'vue'
import { gasPassService } from '../services/gasPassService.js'

const props = defineProps({
  cards: {
    type: Array,
    required: true
  }
})

const emit = defineEmits(['close', 'success'])

// Data
const fromCard = ref(null)
const toCard = ref(null)
const transferAmount = ref('')
const isLoading = ref(false)
const currentStep = ref(0)

const progressSteps = [
  { title: '驗證參數', description: '檢查轉移條件和餘額' },
  { title: '執行轉移', description: '在智能合約中執行餘額轉移' },
  { title: '更新狀態', description: '同步卡片餘額資訊' }
]

// Computed
const availableSourceCards = computed(() => {
  return props.cards.filter(card => parseFloat(card.balance) > 0)
})

const availableTargetCards = computed(() => {
  if (!fromCard.value) return []
  return props.cards.filter(card => card.tokenId !== fromCard.value.tokenId)
})

const maxTransferAmount = computed(() => {
  if (!fromCard.value) return '0.00'
  return parseFloat(fromCard.value.balance).toFixed(2)
})

const fromCardNewBalance = computed(() => {
  if (!fromCard.value || !transferAmount.value) return fromCard.value?.balance || '0.00'
  return (parseFloat(fromCard.value.balance) - parseFloat(transferAmount.value)).toFixed(2)
})

const toCardNewBalance = computed(() => {
  if (!toCard.value || !transferAmount.value) return toCard.value?.balance || '0.00'
  return (parseFloat(toCard.value.balance) + parseFloat(transferAmount.value)).toFixed(2)
})

const canTransfer = computed(() => {
  return fromCard.value && 
         toCard.value && 
         transferAmount.value && 
         parseFloat(transferAmount.value) > 0 &&
         parseFloat(transferAmount.value) <= parseFloat(fromCard.value.balance) &&
         !isLoading.value
})

// Methods
const selectFromCard = (card) => {
  fromCard.value = card
  toCard.value = null
  transferAmount.value = ''
}

const selectToCard = (card) => {
  toCard.value = card
  transferAmount.value = ''
}

const getQuickAmounts = () => {
  if (!fromCard.value) return []
  
  const balance = parseFloat(fromCard.value.balance)
  const amounts = []
  
  // 25%, 50%, 75% of balance
  if (balance >= 4) amounts.push((balance * 0.25).toFixed(2))
  if (balance >= 2) amounts.push((balance * 0.5).toFixed(2))
  if (balance >= 1.33) amounts.push((balance * 0.75).toFixed(2))
  
  // Fixed amounts that are less than balance
  const fixedAmounts = ['10', '25', '50', '100']
  fixedAmounts.forEach(amount => {
    if (parseFloat(amount) <= balance && !amounts.includes(amount)) {
      amounts.push(amount)
    }
  })
  
  return amounts.slice(0, 4) // Limit to 4 quick amounts
}

const getErrorMessage = () => {
  if (!transferAmount.value) return ''
  
  if (parseFloat(transferAmount.value) <= 0) {
    return '請輸入有效的轉移金額'
  }
  
  if (parseFloat(transferAmount.value) > parseFloat(fromCard.value.balance)) {
    return '轉移金額超過可用餘額'
  }
  
  return ''
}

const handleTransfer = async () => {
  isLoading.value = true
  currentStep.value = 1
  
  try {
    // Step 1: Validate
    await new Promise(resolve => setTimeout(resolve, 800))
    currentStep.value = 2
    
    // Step 2: Execute Transfer
    await new Promise(resolve => setTimeout(resolve, 1500))
    currentStep.value = 3
    
    // Step 3: Update State
    const result = await gasPassService.transferBalance({
      fromTokenId: fromCard.value.tokenId,
      toTokenId: toCard.value.tokenId,
      amount: transferAmount.value
    })
    
    if (result.success) {
      emit('success', {
        txHash: result.txHash,
        fromCard: fromCard.value,
        toCard: toCard.value,
        amount: transferAmount.value,
        transaction: result.transaction
      })
    } else {
      throw new Error(result.error)
    }
    
  } catch (error) {
    console.error('Transfer failed:', error)
    alert('轉移失敗: ' + error.message)
  } finally {
    isLoading.value = false
    currentStep.value = 0
  }
}
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

.cards-grid {
  @apply grid grid-cols-1 md:grid-cols-2 gap-4;
}

.card-option {
  @apply flex items-center p-4 border-2 border-gaspass-gray-200 rounded-lg cursor-pointer hover:border-gaspass-yellow-400 transition-all;
}

.card-option.selected {
  @apply border-gaspass-yellow-400 bg-gaspass-yellow-50;
}

.card-icon {
  @apply text-3xl mr-4;
}

.card-info {
  @apply flex-1;
}

.card-name {
  @apply font-semibold text-gaspass-gray-800;
}

.card-balance {
  @apply text-lg font-bold text-gaspass-yellow-600;
}

.card-date {
  @apply text-sm text-gaspass-gray-600;
}

.empty-state {
  @apply text-center py-8;
}

.empty-icon {
  @apply text-4xl mb-4;
}

.empty-text {
  @apply text-lg font-semibold text-gaspass-gray-800 mb-2;
}

.empty-description {
  @apply text-gaspass-gray-600;
}

.transfer-preview {
  @apply flex items-center gap-4 mb-6 p-4 bg-gaspass-gray-50 rounded-lg;
}

.transfer-card {
  @apply flex-1 text-center;
}

.transfer-label {
  @apply text-sm font-medium text-gaspass-gray-600 mb-2;
}

.transfer-name {
  @apply font-semibold text-gaspass-gray-800;
}

.transfer-balance {
  @apply text-sm text-gaspass-gray-600;
}

.transfer-arrow {
  @apply flex-shrink-0 text-gaspass-yellow-400;
}

.amount-input-wrapper {
  @apply relative mb-4;
}

.amount-input {
  @apply w-full px-4 py-3 pr-20 border-2 border-gaspass-gray-200 rounded-lg focus:border-gaspass-yellow-400 focus:outline-none transition-colors;
}

.currency-label {
  @apply absolute right-4 top-1/2 transform -translate-y-1/2 font-semibold text-gaspass-gray-600;
}

.quick-amounts {
  @apply flex gap-2 flex-wrap mb-4;
}

.quick-btn {
  @apply px-3 py-1 border-2 border-gaspass-gray-200 rounded-lg text-sm font-medium hover:border-gaspass-yellow-400 transition-colors;
}

.quick-btn.active {
  @apply border-gaspass-yellow-400 bg-gaspass-yellow-400 text-gaspass-gray-800;
}

.quick-btn.max {
  @apply border-gaspass-yellow-400 text-gaspass-yellow-600;
}

.transfer-limits {
  @apply space-y-2;
}

.limit-item {
  @apply flex justify-between text-sm;
}

.limit-label {
  @apply text-gaspass-gray-600;
}

.limit-value {
  @apply font-medium text-gaspass-gray-800;
}

.fee-card {
  @apply bg-green-50 rounded-lg p-4 border border-green-200;
}

.fee-info {
  @apply flex items-start gap-3;
}

.fee-icon {
  @apply text-xl;
}

.fee-title {
  @apply font-semibold text-green-800 mb-1;
}

.fee-description {
  @apply text-sm text-green-700;
}

.confirmation-card {
  @apply bg-gaspass-gray-50 rounded-lg p-4 border border-gaspass-gray-200;
}

.confirmation-details {
  @apply space-y-2;
}

.confirmation-row {
  @apply flex justify-between;
}

.highlight {
  @apply text-gaspass-yellow-600 font-semibold;
}

.free {
  @apply text-green-600 font-semibold;
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

.error-message {
  @apply flex items-center gap-2 mt-2 text-red-600 text-sm;
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