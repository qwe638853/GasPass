<template>
  <div class="modal-overlay" @click="$emit('close')">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h2 class="modal-title">💰 Deposit to Card</h2>
        <button @click="$emit('close')" class="close-btn">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>

      <div class="modal-body">
        <!-- Card Selection -->
        <div class="section">
          <h3 class="section-title">Select Card</h3>
          <div class="cards-grid">
            <div 
              v-for="card in cards" 
              :key="card.tokenId"
              class="card-option"
              :class="{ 'selected': selectedCard?.tokenId === card.tokenId }"
              @click="selectCard(card)"
            >
              <div class="card-icon">🎫</div>
              <div class="card-info">
                <div class="card-name">GasPass #{{ card.tokenId }}</div>
                <div class="card-balance">${{ card.balance }} USDC</div>
                <div class="card-date">Created {{ formatDate(card.createdAt) }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Amount Input -->
        <div v-if="selectedCard" class="section">
          <h3 class="section-title">Deposit Amount</h3>
          <div class="amount-section">
            <div class="balance-info">
              <div class="balance-item">
                <span class="balance-label">Current Balance:</span>
                <span class="balance-value">${{ selectedCard.balance }} USDC</span>
              </div>
              <div class="balance-item">
                <span class="balance-label">Your USDC Balance:</span>
                <span class="balance-value">${{ userUSDCBalance }} USDC</span>
              </div>
            </div>
            
            <div class="amount-input-wrapper">
              <input 
                v-model="depositAmount"
                type="number" 
                step="0.01"
                min="0"
                :max="userUSDCBalance"
                placeholder="Enter deposit amount"
                class="amount-input"
              />
              <span class="currency-label">USDC</span>
            </div>
            
            <div class="quick-amounts">
              <button 
                v-for="amount in quickAmounts" 
                :key="amount"
                @click="depositAmount = amount"
                class="quick-btn"
                :class="{ 'active': depositAmount == amount }"
                :disabled="parseFloat(amount) > parseFloat(userUSDCBalance)"
              >
                ${{ amount }}
              </button>
              <button 
                @click="depositAmount = userUSDCBalance"
                class="quick-btn max"
                :class="{ 'active': depositAmount == userUSDCBalance }"
              >
                All
              </button>
            </div>
          </div>
        </div>

        <!-- Fee Estimation -->
        <div v-if="selectedCard && depositAmount" class="section">
          <div class="fee-card">
            <h3 class="section-title">Fee Details</h3>
            <div class="fee-breakdown">
              <div class="fee-row">
                <span>Deposit Amount:</span>
                <span class="highlight">${{ depositAmount }} USDC</span>
              </div>
              <div class="fee-row">
                <span>Gas Fee:</span>
                <span>${{ gasFee }} USDC</span>
              </div>
              <div class="fee-row total">
                <span>You Will Pay:</span>
                <span class="highlight">${{ totalCost }} USDC</span>
              </div>
            </div>
            
            <div class="result-preview">
              <div class="preview-item">
                <span>Balance After Deposit:</span>
                <span class="preview-balance">${{ newBalance }} USDC</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Permit Information -->
        <div v-if="selectedCard && depositAmount" class="section">
          <div class="permit-info">
            <div class="info-header">
              <div class="info-icon">ℹ️</div>
              <h4 class="info-title">About ERC-2612 Permit</h4>
            </div>
            <p class="info-description">
              We use ERC-2612 Permit signatures to authorize transfers, so you only need to pay Gas fees once, without additional approve transactions.
            </p>
          </div>
        </div>

        <!-- Submit Button -->
        <div class="section">
          <button 
            @click="handleDeposit"
            :disabled="!canDeposit"
            class="submit-btn"
            :class="{ 'loading': isLoading }"
          >
            <span v-if="isLoading" class="loading-content">
              <div class="loading-spinner"></div>
              Processing...
            </span>
            <span v-else>
              💰 Confirm Deposit
            </span>
          </button>
          
          <div v-if="!canDeposit && depositAmount" class="error-message">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            {{ getErrorMessage() }}
          </div>
        </div>

        <!-- Transaction Progress -->
        <div v-if="isLoading" class="section">
          <div class="progress-card">
            <h3 class="section-title">Transaction Progress</h3>
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

    <!-- Success Modal -->
    <div v-if="showSuccess" class="success-modal-overlay" @click="handleSuccessModalClick">
      <div class="success-modal" @click.stop>
        <div class="success-modal-content">
          <div class="success-icon">🎉</div>
          <h3 class="success-title">Deposit Successful!</h3>
          <p class="success-message">{{ successMessage }}</p>
          <div v-if="successData" class="success-details">
            <div class="detail-item">
              <span class="detail-label">Transaction Hash:</span>
              <span class="detail-value">{{ successData.txHash }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Deposit Amount:</span>
              <span class="detail-value">{{ successData.amount }} USDC</span>
            </div>
          </div>
          <button @click="handleSuccessContinue" class="continue-btn">
            Continue Using GasPass
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { gasPassService } from '../services/gasPassService.js'
import { contractService } from '../services/contractService.js'
import { useWeb3 } from '../composables/useWeb3.js'

const props = defineProps({
  cards: {
    type: Array,
    required: true
  }
})

const emit = defineEmits(['close', 'success'])

const { getUSDCBalance } = useWeb3()

// Data
const selectedCard = ref(null)
const depositAmount = ref('')
const isLoading = ref(false)
const currentStep = ref(0)
const userUSDCBalance = ref('0.00')
const showSuccess = ref(false)
const successMessage = ref('')
const successData = ref(null)

const quickAmounts = ['10', '25', '50', '100', '250']
const gasFee = ref('0.5')

const progressSteps = [
  { title: 'Prepare Transaction', description: 'Verify parameters and balance' },
  { title: 'Sign Permit', description: 'Authorize with ERC-2612' },
  { title: 'Execute Deposit', description: 'Transfer USDC to card' },
  { title: 'Update Balance', description: 'Sync card balance info' }
]

// Computed
const totalCost = computed(() => {
  if (!depositAmount.value) return '0.00'
  return (parseFloat(depositAmount.value) + parseFloat(gasFee.value)).toFixed(2)
})

const newBalance = computed(() => {
  if (!selectedCard.value || !depositAmount.value) return '0.00'
  return (parseFloat(selectedCard.value.balance) + parseFloat(depositAmount.value)).toFixed(2)
})

const canDeposit = computed(() => {
  return selectedCard.value && 
         depositAmount.value && 
         parseFloat(depositAmount.value) > 0 &&
         parseFloat(totalCost.value) <= parseFloat(userUSDCBalance.value) &&
         !isLoading.value
})

// Methods
const loadUserBalance = async () => {
  try {
    userUSDCBalance.value = await getUSDCBalance()
  } catch (error) {
    console.error('Failed to load USDC balance:', error)
  }
}

const selectCard = (card) => {
  selectedCard.value = card
  depositAmount.value = ''
}

const handleSuccessContinue = () => {
  showSuccess.value = false
  emit('close')
}

const handleSuccessModalClick = (event) => {
  if (event.target === event.currentTarget) {
    handleSuccessContinue()
  }
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('zh-TW')
}

const getErrorMessage = () => {
  if (!depositAmount.value) return ''
  
  if (parseFloat(depositAmount.value) <= 0) {
    return 'Please enter a valid deposit amount'
  }
  
  if (parseFloat(totalCost.value) > parseFloat(userUSDCBalance.value)) {
    return 'Insufficient USDC balance'
  }
  
  return ''
}

const handleDeposit = async () => {
  isLoading.value = true
  currentStep.value = 1
  
  try {
    // Step 1: Prepare
    await new Promise(resolve => setTimeout(resolve, 800))
    currentStep.value = 2
    
    // Step 2: Sign Permit
    await new Promise(resolve => setTimeout(resolve, 1500))
    currentStep.value = 3
    
    // Step 3: Execute Deposit
    await new Promise(resolve => setTimeout(resolve, 1200))
    currentStep.value = 4
    
    // Step 4: Complete - Call real contract service
    const result = await contractService.depositToCard({
      tokenId: selectedCard.value.tokenId,
      amount: depositAmount.value
    })
    
    if (result.success) {
      // Show success modal
      successData.value = {
        txHash: result.txHash,
        card: selectedCard.value,
        amount: depositAmount.value,
        transaction: result.transaction
      }
      successMessage.value = `Successfully deposited ${depositAmount.value} USDC to GasPass card #${selectedCard.value.tokenId}!`
      showSuccess.value = true
      
      // Also emit event to parent component
      emit('success', successData.value)
    } else {
      throw new Error(result.error)
    }
    
  } catch (error) {
    console.error('Deposit failed:', error)
    alert('Deposit failed: ' + error.message)
  } finally {
    isLoading.value = false
    currentStep.value = 0
  }
}

// Lifecycle
onMounted(() => {
  loadUserBalance()
  if (props.cards.length === 1) {
    selectCard(props.cards[0])
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

.balance-info {
  @apply bg-gaspass-gray-50 rounded-lg p-4 mb-4 space-y-2;
}

.balance-item {
  @apply flex justify-between;
}

.balance-label {
  @apply text-gaspass-gray-600;
}

.balance-value {
  @apply font-semibold text-gaspass-gray-800;
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
  @apply flex gap-2 flex-wrap;
}

.quick-btn {
  @apply px-3 py-1 border-2 border-gaspass-gray-200 rounded-lg text-sm font-medium hover:border-gaspass-yellow-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed;
}

.quick-btn.active {
  @apply border-gaspass-yellow-400 bg-gaspass-yellow-400 text-gaspass-gray-800;
}

.quick-btn.max {
  @apply border-gaspass-yellow-400 text-gaspass-yellow-600;
}

.fee-card {
  @apply bg-gaspass-gray-50 rounded-lg p-4 border border-gaspass-gray-200;
}

.fee-breakdown {
  @apply space-y-2 mb-4;
}

.fee-row {
  @apply flex justify-between text-sm;
}

.fee-row.total {
  @apply border-t border-gaspass-gray-200 pt-2 font-semibold;
}

.highlight {
  @apply text-gaspass-yellow-600 font-semibold;
}

.result-preview {
  @apply border-t border-gaspass-gray-200 pt-4;
}

.preview-item {
  @apply flex justify-between;
}

.preview-balance {
  @apply text-lg font-bold text-green-600;
}

.permit-info {
  @apply bg-blue-50 rounded-lg p-4 border border-blue-200;
}

.info-header {
  @apply flex items-center gap-2 mb-2;
}

.info-icon {
  @apply text-xl;
}

.info-title {
  @apply font-semibold text-blue-800;
}

.info-description {
  @apply text-sm text-blue-700;
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

/* Success Modal Styles */
.success-modal-overlay {
  @apply fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4;
}

.success-modal {
  @apply bg-white rounded-xl shadow-xl max-w-md w-full;
}

.success-modal-content {
  @apply p-6 text-center;
}

.success-icon {
  @apply text-4xl mb-4;
}

.success-title {
  @apply text-2xl font-bold text-green-800 mb-2;
}

.success-message {
  @apply text-green-700 mb-4;
}

.success-details {
  @apply space-y-2 mb-6 p-4 bg-green-50 rounded-lg;
}

.detail-item {
  @apply flex justify-between text-sm;
}

.detail-label {
  @apply text-green-700 font-medium;
}

.detail-value {
  @apply text-green-800 font-mono text-xs;
}

.continue-btn {
  @apply w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300;
}
</style>