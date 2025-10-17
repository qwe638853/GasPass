<template>
  <Layout>
    <div class="min-h-screen bg-gray-50 py-12">
      <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <!-- Header -->
        <div class="text-center mb-12">
          <h1 class="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            儲值金管理
          </h1>
          <p class="text-lg text-gray-600 max-w-2xl mx-auto">
            為您的 GasPass 儲值卡充值 USDC，確保跨鏈 Gas 充足
          </p>
        </div>

        <!-- Connection Check -->
        <div v-if="!isConnected" class="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8">
          <div class="flex items-center">
            <svg class="w-6 h-6 text-yellow-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L5.08 15.5c-.77.833.192 2.5 1.732 2.5z"></path>
            </svg>
            <div>
              <h3 class="text-lg font-medium text-yellow-800">請先連接錢包</h3>
              <p class="text-yellow-700">您需要連接 Web3 錢包才能管理儲值卡</p>
            </div>
          </div>
        </div>

        <!-- Network Check -->
        <div v-else-if="chainId !== 42161" class="bg-red-50 border border-red-200 rounded-lg p-6 mb-8">
          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <svg class="w-6 h-6 text-red-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <div>
                <h3 class="text-lg font-medium text-red-800">請切換到 Arbitrum 網路</h3>
                <p class="text-red-700">GasPass 合約部署在 Arbitrum 上</p>
              </div>
            </div>
            <button @click="switchToArbitrum" class="btn-primary">
              切換網路
            </button>
          </div>
        </div>

        <!-- Main Content -->
        <div v-else>
          <!-- Cards List -->
          <div class="mb-8">
            <h2 class="text-2xl font-semibold text-gray-900 mb-6">我的儲值卡</h2>
            
            <div v-if="gasPassCards.length === 0" class="text-center py-12">
              <div class="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <svg class="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                </svg>
              </div>
              <h3 class="text-lg font-medium text-gray-900 mb-2">還沒有儲值卡</h3>
              <p class="text-gray-600 mb-4">請先鑄造您的第一張 GasPass 儲值卡</p>
              <router-link to="/mint" class="btn-primary">
                立即鑄造
              </router-link>
            </div>

            <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div 
                v-for="card in gasPassCards" 
                :key="card.tokenId"
                class="gas-pass-card"
                :class="{ 'selected': selectedCard?.tokenId === card.tokenId }"
                @click="selectCard(card)"
              >
                <div class="flex items-center justify-between mb-4">
                  <span class="text-sm text-white opacity-80">Token ID: {{ card.tokenId }}</span>
                  <span class="text-xs text-white opacity-60">ERC-3525</span>
                </div>
                
                <div class="mb-4">
                  <div class="text-sm text-white opacity-80 mb-1">餘額</div>
                  <div class="text-2xl font-bold text-white">
                    {{ card.balance }} USDC
                  </div>
                </div>
                
                <div class="pt-4 border-t border-white border-opacity-20">
                  <div class="text-xs text-white opacity-60">
                    最後更新: {{ card.lastUpdate }}
                  </div>
                </div>
                
                <div v-if="selectedCard?.tokenId === card.tokenId" class="absolute top-4 right-4">
                  <div class="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                    <svg class="w-4 h-4 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Deposit Form -->
          <div v-if="selectedCard" class="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <!-- Left Panel - Form -->
            <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
              <h3 class="text-2xl font-semibold text-gray-900 mb-6">
                儲值到卡片 #{{ selectedCard.tokenId }}
              </h3>
              
              <form @submit.prevent="handleDeposit" class="space-y-6">
                <!-- Current Balance -->
                <div class="bg-gray-50 rounded-lg p-4">
                  <div class="flex justify-between items-center">
                    <span class="text-sm font-medium text-gray-700">當前餘額</span>
                    <span class="text-lg font-semibold text-gray-900">
                      {{ selectedCard.balance }} USDC
                    </span>
                  </div>
                </div>

                <!-- Amount Input -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    儲值金額 (USDC)
                  </label>
                  <div class="relative">
                    <input 
                      v-model="depositAmount"
                      type="number" 
                      step="0.01"
                      min="0"
                      placeholder="輸入儲值金額"
                      class="form-input"
                      :disabled="isLoading"
                    />
                    <div class="absolute inset-y-0 right-0 flex items-center pr-3">
                      <span class="text-gray-500 text-sm">USDC</span>
                    </div>
                  </div>
                </div>

                <!-- Quick Amount Buttons -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    快速選擇
                  </label>
                  <div class="grid grid-cols-4 gap-2">
                    <button 
                      v-for="amount in quickAmounts" 
                      :key="amount"
                      type="button"
                      @click="depositAmount = amount"
                      class="quick-amount-btn"
                      :disabled="isLoading"
                    >
                      {{ amount }}
                    </button>
                  </div>
                </div>

                <!-- USDC Balance -->
                <div class="bg-blue-50 rounded-lg p-4">
                  <div class="flex justify-between items-center">
                    <span class="text-sm font-medium text-blue-700">錢包 USDC 餘額</span>
                    <span class="text-lg font-semibold text-blue-900">
                      {{ usdcBalance }} USDC
                    </span>
                  </div>
                </div>

                <!-- Gas Estimation -->
                <div v-if="gasEstimate" class="bg-gray-50 rounded-lg p-4">
                  <h4 class="text-sm font-medium text-gray-700 mb-2">交易預估</h4>
                  <div class="space-y-1 text-sm text-gray-600">
                    <div class="flex justify-between">
                      <span>儲值金額:</span>
                      <span>{{ depositAmount }} USDC</span>
                    </div>
                    <div class="flex justify-between">
                      <span>新餘額:</span>
                      <span>{{ (parseFloat(selectedCard.balance) + parseFloat(depositAmount || 0)).toFixed(2) }} USDC</span>
                    </div>
                    <div class="flex justify-between">
                      <span>Gas 費用:</span>
                      <span>≈ {{ gasEstimate }} ETH</span>
                    </div>
                  </div>
                </div>

                <!-- Submit Button -->
                <button 
                  type="submit" 
                  class="btn-primary w-full py-4 text-lg"
                  :disabled="isLoading || !canDeposit"
                >
                  <span v-if="isLoading" class="flex items-center justify-center">
                    <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    儲值中...
                  </span>
                  <span v-else>
                    確認儲值
                  </span>
                </button>
              </form>
            </div>

            <!-- Right Panel - Transaction History -->
            <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
              <h3 class="text-2xl font-semibold text-gray-900 mb-6">交易紀錄</h3>
              
              <div v-if="transactionHistory.length === 0" class="text-center py-8">
                <div class="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                  </svg>
                </div>
                <p class="text-gray-600">暫無交易紀錄</p>
              </div>

              <div v-else class="space-y-4">
                <div 
                  v-for="tx in transactionHistory" 
                  :key="tx.hash"
                  class="transaction-item"
                >
                  <div class="flex items-center justify-between">
                    <div class="flex items-center space-x-3">
                      <div class="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                        </svg>
                      </div>
                      <div>
                        <div class="font-medium text-gray-900">{{ tx.type }}</div>
                        <div class="text-sm text-gray-500">{{ tx.timestamp }}</div>
                      </div>
                    </div>
                    <div class="text-right">
                      <div class="font-semibold text-gray-900">+{{ tx.amount }} USDC</div>
                      <a 
                        :href="`https://arbiscan.io/tx/${tx.hash}`" 
                        target="_blank"
                        class="text-xs text-blue-600 hover:underline"
                      >
                        查看交易
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Transaction Status -->
        <div v-if="txHash" class="mt-8 bg-green-50 border border-green-200 rounded-lg p-6">
          <div class="flex items-center">
            <svg class="w-6 h-6 text-green-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <div>
              <h3 class="text-lg font-medium text-green-800">儲值成功！</h3>
              <p class="text-green-700">
                已成功為儲值卡充值 {{ depositAmount }} USDC。
                <a :href="`https://arbiscan.io/tx/${txHash}`" target="_blank" class="underline hover:no-underline">
                  查看交易
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Layout>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import Layout from '../components/Layout.vue'
import { useWeb3 } from '../composables/useWeb3'

const { account, chainId, isConnected, switchToArbitrum } = useWeb3()

// Data
const gasPassCards = ref([])
const selectedCard = ref(null)
const depositAmount = ref('')
const isLoading = ref(false)
const gasEstimate = ref('')
const txHash = ref('')
const usdcBalance = ref('1000.00')
const transactionHistory = ref([])

const quickAmounts = [10, 50, 100, 500]

// Computed
const canDeposit = computed(() => {
  return depositAmount.value && 
         parseFloat(depositAmount.value) > 0 && 
         parseFloat(depositAmount.value) <= parseFloat(usdcBalance.value) &&
         !isLoading.value &&
         selectedCard.value
})

// Watch for amount changes to estimate gas
watch(depositAmount, async (newAmount) => {
  if (newAmount && parseFloat(newAmount) > 0) {
    gasEstimate.value = '0.0008'
  } else {
    gasEstimate.value = ''
  }
})

// Methods
const selectCard = (card) => {
  selectedCard.value = card
  loadTransactionHistory(card.tokenId)
}

const loadUserCards = async () => {
  if (!account.value) return
  
  // Mock data - in real implementation, fetch from contract
  gasPassCards.value = [
    {
      tokenId: 1,
      balance: '150.25',
      lastUpdate: '2024-01-15'
    },
    {
      tokenId: 3,
      balance: '89.50',
      lastUpdate: '2024-01-10'
    }
  ]
  
  if (gasPassCards.value.length > 0) {
    selectCard(gasPassCards.value[0])
  }
}

const loadTransactionHistory = async (tokenId) => {
  // Mock data - in real implementation, fetch from contract events
  transactionHistory.value = [
    {
      hash: '0x123...abc',
      type: '儲值',
      amount: '50.00',
      timestamp: '2024-01-15 14:30'
    },
    {
      hash: '0x456...def',
      type: '儲值',
      amount: '100.25',
      timestamp: '2024-01-10 09:15'
    }
  ]
}

const handleDeposit = async () => {
  isLoading.value = true
  
  try {
    // Mock transaction - in real implementation, call smart contract
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Mock transaction hash
    txHash.value = '0x' + Math.random().toString(16).substr(2, 64)
    
    // Update card balance
    const newBalance = (parseFloat(selectedCard.value.balance) + parseFloat(depositAmount.value)).toFixed(2)
    selectedCard.value.balance = newBalance
    
    // Update USDC balance
    usdcBalance.value = (parseFloat(usdcBalance.value) - parseFloat(depositAmount.value)).toFixed(2)
    
    // Add to transaction history
    transactionHistory.value.unshift({
      hash: txHash.value,
      type: '儲值',
      amount: depositAmount.value,
      timestamp: new Date().toLocaleString('zh-TW')
    })
    
    // Reset form
    depositAmount.value = ''
    
  } catch (error) {
    console.error('Deposit failed:', error)
    alert('儲值失敗，請稍後再試')
  } finally {
    isLoading.value = false
  }
}

// Load data when connected
watch([account, chainId], () => {
  if (isConnected.value && chainId.value === 42161) {
    loadUserCards()
  }
}, { immediate: true })
</script>

<style scoped>
.form-input {
  @apply w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors;
}

.form-input:disabled {
  @apply bg-gray-100 text-gray-500 cursor-not-allowed;
}

.btn-primary {
  @apply bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium py-2 px-4 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2;
}

.gas-pass-card {
  @apply relative bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white cursor-pointer transition-all hover:shadow-lg;
}

.gas-pass-card.selected {
  @apply ring-4 ring-orange-300 ring-opacity-50 shadow-lg;
}

.quick-amount-btn {
  @apply bg-gray-100 hover:bg-orange-500 hover:text-white text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors text-sm;
}

.quick-amount-btn:disabled {
  @apply bg-gray-100 text-gray-400 cursor-not-allowed hover:bg-gray-100 hover:text-gray-400;
}

.transaction-item {
  @apply bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors;
}
</style>