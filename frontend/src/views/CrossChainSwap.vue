<template>
  <Layout>
    <div class="min-h-screen bg-gaspass-gray-100 py-8">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <!-- Header -->
        <div class="text-center mb-8">
          <h1 class="text-4xl font-bold text-gaspass-gray-800 mb-4">
            🌉 跨鏈 Gas 兌換
          </h1>
          <p class="text-xl text-gaspass-gray-600 max-w-2xl mx-auto">
            將一條鏈上的代幣兌換成另一條鏈的 Gas 費，跨鏈操作變得簡單！
          </p>
        </div>

        <!-- Connection Check -->
        <div v-if="!isConnected" class="bg-yellow-50 border-l-4 border-gaspass-yellow-400 p-6 mb-8">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <svg class="w-6 h-6 text-gaspass-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L5.08 15.5c-.77.833.192 2.5 1.732 2.5z"></path>
              </svg>
            </div>
            <div class="ml-3">
              <h3 class="text-lg font-medium text-gaspass-yellow-800">請先連接錢包</h3>
              <p class="text-gaspass-yellow-700">需要連接錢包才能進行跨鏈兌換</p>
            </div>
          </div>
        </div>

        <!-- Main Swap Interface -->
        <div v-else class="bg-white rounded-2xl shadow-xl border border-gaspass-gray-200 overflow-hidden">
          <!-- Swap Header -->
          <div class="bg-gradient-to-r from-gaspass-yellow-400 to-gaspass-yellow-500 p-6">
            <div class="flex items-center justify-between">
              <div>
                <h2 class="text-2xl font-bold text-gaspass-gray-800">⚡ 智能兌換</h2>
                <p class="text-gaspass-gray-700">自動尋找最佳路徑和匯率</p>
              </div>
              <div class="flex items-center gap-4">
                <button @click="refreshRates" class="refresh-btn" :disabled="isLoading">
                  <svg 
                    class="w-5 h-5" 
                    :class="{ 'animate-spin': isRefreshing }"
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                  </svg>
                  刷新匯率
                </button>
                <button @click="showSettings = true" class="settings-btn">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <div class="p-8">
            <!-- From Section -->
            <div class="swap-section">
              <div class="section-header">
                <h3 class="section-title">從 (支付)</h3>
                <div v-if="fromChain" class="balance-info">
                  餘額: {{ getChainBalance(fromChain.id) }} {{ fromChain.symbol }}
                </div>
              </div>
              
              <div class="input-container">
                <div class="chain-selector" @click="showFromChainModal = true">
                  <div v-if="fromChain" class="selected-chain">
                    <span class="chain-icon">{{ fromChain.icon }}</span>
                    <div class="chain-details">
                      <div class="chain-name">{{ fromChain.name }}</div>
                      <div class="chain-symbol">{{ fromChain.symbol }}</div>
                    </div>
                  </div>
                  <div v-else class="placeholder-chain">
                    <span class="placeholder-icon">🔗</span>
                    <span class="placeholder-text">選擇來源鏈</span>
                  </div>
                  <svg class="w-5 h-5 text-gaspass-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                  </svg>
                </div>
                
                <div class="amount-input-section">
                  <input 
                    v-model="fromAmount"
                    type="number" 
                    step="0.001"
                    min="0"
                    :placeholder="`輸入 ${fromChain?.symbol || '金額'}`"
                    class="amount-input"
                    @input="calculateSwap"
                  />
                  <div class="amount-actions">
                    <button 
                      @click="setMaxAmount"
                      :disabled="!fromChain"
                      class="max-btn"
                    >
                      MAX
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Swap Arrow -->
            <div class="swap-arrow-container">
              <button @click="swapChains" class="swap-arrow-btn">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"></path>
                </svg>
              </button>
            </div>

            <!-- To Section -->
            <div class="swap-section">
              <div class="section-header">
                <h3 class="section-title">到 (接收)</h3>
                <div v-if="toChain" class="balance-info">
                  餘額: {{ getChainBalance(toChain.id) }} {{ toChain.symbol }}
                </div>
              </div>
              
              <div class="input-container">
                <div class="chain-selector" @click="showToChainModal = true">
                  <div v-if="toChain" class="selected-chain">
                    <span class="chain-icon">{{ toChain.icon }}</span>
                    <div class="chain-details">
                      <div class="chain-name">{{ toChain.name }}</div>
                      <div class="chain-symbol">{{ toChain.symbol }}</div>
                    </div>
                  </div>
                  <div v-else class="placeholder-chain">
                    <span class="placeholder-icon">🔗</span>
                    <span class="placeholder-text">選擇目標鏈</span>
                  </div>
                  <svg class="w-5 h-5 text-gaspass-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                  </svg>
                </div>
                
                <div class="amount-display-section">
                  <div class="amount-display">
                    {{ toAmount || '0.00' }}
                  </div>
                  <div class="amount-symbol">{{ toChain?.symbol || '' }}</div>
                </div>
              </div>
            </div>

            <!-- Swap Details -->
            <div v-if="swapQuote" class="swap-details">
              <div class="details-header">
                <h4 class="details-title">兌換詳情</h4>
                <div class="route-info">
                  <span class="route-label">路徑:</span>
                  <span class="route-path">{{ swapQuote.route }}</span>
                </div>
              </div>
              
              <div class="details-grid">
                <div class="detail-item">
                  <span class="detail-label">匯率</span>
                  <span class="detail-value">
                    1 {{ fromChain.symbol }} = {{ swapQuote.rate }} {{ toChain.symbol }}
                  </span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">最小接收量</span>
                  <span class="detail-value">{{ swapQuote.minimumReceived }} {{ toChain.symbol }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">滑點容忍度</span>
                  <span class="detail-value">{{ slippageTolerance }}%</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">橋接費用</span>
                  <span class="detail-value">${{ swapQuote.bridgeFee }} USDC</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Gas 費用</span>
                  <span class="detail-value">${{ swapQuote.gasFee }} USDC</span>
                </div>
                <div class="detail-item total">
                  <span class="detail-label">總費用</span>
                  <span class="detail-value">${{ swapQuote.totalFee }} USDC</span>
                </div>
              </div>
              
              <div class="time-estimate">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                預計完成時間: {{ swapQuote.estimatedTime }}
              </div>
            </div>

            <!-- Recipient Address -->
            <div class="recipient-section">
              <label class="recipient-label">
                <input 
                  v-model="customRecipient" 
                  type="checkbox"
                  class="recipient-checkbox"
                />
                發送到不同地址
              </label>
              
              <div v-if="customRecipient" class="recipient-input-wrapper">
                <input 
                  v-model="recipientAddress"
                  type="text" 
                  placeholder="輸入接收地址"
                  class="recipient-input"
                />
              </div>
            </div>

            <!-- Action Button -->
            <div class="action-section">
              <button 
                @click="handleSwap"
                :disabled="!canSwap"
                class="swap-btn"
                :class="{ 'loading': isLoading }"
              >
                <span v-if="isLoading" class="loading-content">
                  <div class="loading-spinner"></div>
                  兌換中...
                </span>
                <span v-else>
                  {{ getSwapButtonText() }}
                </span>
              </button>
              
              <div v-if="swapError" class="error-message">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                {{ swapError }}
              </div>
            </div>
          </div>
        </div>

        <!-- Recent Swaps -->
        <div v-if="recentSwaps.length > 0" class="mt-8">
          <h2 class="text-2xl font-bold text-gaspass-gray-800 mb-6">📊 最近兌換</h2>
          <div class="bg-white rounded-xl shadow-sm border border-gaspass-gray-200 overflow-hidden">
            <div class="swap-history">
              <div 
                v-for="swap in recentSwaps.slice(0, 5)" 
                :key="swap.id"
                class="swap-history-item"
              >
                <div class="swap-chains">
                  <div class="swap-from">
                    <span class="chain-icon">{{ getChainIcon(swap.fromChain.id) }}</span>
                    <div class="swap-amount">{{ swap.inputAmount }} {{ swap.fromChain.symbol }}</div>
                  </div>
                  <div class="swap-arrow">→</div>
                  <div class="swap-to">
                    <span class="chain-icon">{{ getChainIcon(swap.toChain.id) }}</span>
                    <div class="swap-amount">{{ swap.outputAmount }} {{ swap.toChain.symbol }}</div>
                  </div>
                </div>
                <div class="swap-meta">
                  <div class="swap-status" :class="swap.status">{{ getStatusText(swap.status) }}</div>
                  <div class="swap-time">{{ swap.timestamp }}</div>
                </div>
                <div class="swap-actions">
                  <button @click="viewSwapDetails(swap)" class="view-btn">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Modals -->
        <ChainSelectorModal 
          v-if="showFromChainModal"
          :chains="availableFromChains"
          :selected-chain="fromChain"
          title="選擇來源鏈"
          @close="showFromChainModal = false"
          @select="selectFromChain"
        />

        <ChainSelectorModal 
          v-if="showToChainModal"
          :chains="availableToChains"
          :selected-chain="toChain"
          title="選擇目標鏈"
          @close="showToChainModal = false"
          @select="selectToChain"
        />

        <SwapSettingsModal 
          v-if="showSettings"
          :slippage="slippageTolerance"
          :deadline="transactionDeadline"
          @close="showSettings = false"
          @save="updateSettings"
        />

        <SwapProgressModal 
          v-if="showProgress"
          :swap-data="currentSwap"
          @close="showProgress = false"
        />
      </div>
    </div>
  </Layout>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import Layout from '../components/Layout.vue'
import ChainSelectorModal from '../components/ChainSelectorModal.vue'
import SwapSettingsModal from '../components/SwapSettingsModal.vue'
import SwapProgressModal from '../components/SwapProgressModal.vue'
import { useWeb3 } from '../composables/useWeb3.js'
import { crossChainService } from '../services/crossChainService.js'
import { supportedChains, mockSwapHistory } from '../utils/mockData.js'

const { account, isConnected } = useWeb3()

// Data
const fromChain = ref(null)
const toChain = ref(null)
const fromAmount = ref('')
const toAmount = ref('')
const isLoading = ref(false)
const isRefreshing = ref(false)
const swapQuote = ref(null)
const swapError = ref('')
const customRecipient = ref(false)
const recipientAddress = ref('')
const slippageTolerance = ref(0.5)
const transactionDeadline = ref(20)
const recentSwaps = ref([])
const chainBalances = ref({})
const currentSwap = ref(null)

// Modal states
const showFromChainModal = ref(false)
const showToChainModal = ref(false)
const showSettings = ref(false)
const showProgress = ref(false)

// Computed
const availableFromChains = computed(() => {
  return supportedChains.filter(chain => !toChain.value || chain.id !== toChain.value.id)
})

const availableToChains = computed(() => {
  return supportedChains.filter(chain => !fromChain.value || chain.id !== fromChain.value.id)
})

const canSwap = computed(() => {
  return fromChain.value && 
         toChain.value && 
         fromAmount.value && 
         parseFloat(fromAmount.value) > 0 &&
         swapQuote.value &&
         !isLoading.value
})

// Methods
const loadChainBalances = async () => {
  if (!account.value) return
  
  try {
    const balances = await crossChainService.getMultiChainBalances(account.value)
    chainBalances.value = balances
  } catch (error) {
    console.error('Failed to load chain balances:', error)
  }
}

const getChainBalance = (chainId) => {
  return chainBalances.value[chainId] || '0.00'
}

const getChainIcon = (chainId) => {
  const chain = supportedChains.find(c => c.id === chainId)
  return chain ? chain.icon : '🔗'
}

const selectFromChain = (chain) => {
  fromChain.value = chain
  showFromChainModal.value = false
  fromAmount.value = ''
  toAmount.value = ''
  swapQuote.value = null
}

const selectToChain = (chain) => {
  toChain.value = chain
  showToChainModal.value = false
  toAmount.value = ''
  swapQuote.value = null
}

const swapChains = () => {
  if (!fromChain.value || !toChain.value) return
  
  const temp = fromChain.value
  fromChain.value = toChain.value
  toChain.value = temp
  
  fromAmount.value = ''
  toAmount.value = ''
  swapQuote.value = null
}

const setMaxAmount = () => {
  if (!fromChain.value) return
  const balance = getChainBalance(fromChain.value.id)
  fromAmount.value = balance
  calculateSwap()
}

const calculateSwap = async () => {
  if (!fromChain.value || !toChain.value || !fromAmount.value || parseFloat(fromAmount.value) <= 0) {
    toAmount.value = ''
    swapQuote.value = null
    return
  }
  
  try {
    const quote = await crossChainService.getSwapQuote({
      fromChainId: fromChain.value.id,
      toChainId: toChain.value.id,
      fromAmount: fromAmount.value,
      slippage: slippageTolerance.value
    })
    
    swapQuote.value = quote
    toAmount.value = quote.outputAmount
    swapError.value = ''
  } catch (error) {
    console.error('Failed to get swap quote:', error)
    swapError.value = '無法獲取兌換報價'
    swapQuote.value = null
    toAmount.value = ''
  }
}

const refreshRates = async () => {
  isRefreshing.value = true
  try {
    await crossChainService.refreshRates()
    if (fromChain.value && toChain.value && fromAmount.value) {
      await calculateSwap()
    }
  } catch (error) {
    console.error('Failed to refresh rates:', error)
  } finally {
    isRefreshing.value = false
  }
}

const updateSettings = (settings) => {
  slippageTolerance.value = settings.slippage
  transactionDeadline.value = settings.deadline
  showSettings.value = false
  
  // Recalculate if needed
  if (fromChain.value && toChain.value && fromAmount.value) {
    calculateSwap()
  }
}

const getSwapButtonText = () => {
  if (!fromChain.value) return '選擇來源鏈'
  if (!toChain.value) return '選擇目標鏈'
  if (!fromAmount.value) return '輸入金額'
  if (!swapQuote.value) return '計算中...'
  return `🌉 兌換 ${fromChain.value.symbol} → ${toChain.value.symbol}`
}

const handleSwap = async () => {
  isLoading.value = true
  swapError.value = ''
  
  try {
    const swapData = {
      fromChainId: fromChain.value.id,
      toChainId: toChain.value.id,
      fromAmount: fromAmount.value,
      toAmount: toAmount.value,
      quote: swapQuote.value,
      recipientAddress: customRecipient.value ? recipientAddress.value : account.value,
      slippage: slippageTolerance.value,
      deadline: transactionDeadline.value
    }
    
    currentSwap.value = swapData
    showProgress.value = true
    
    const result = await crossChainService.executeSwap(swapData)
    
    if (result.success) {
      // 重新載入餘額
      await loadChainBalances()
      
      // 重新載入交易歷史
      await loadRecentSwaps()
      
      // 清空表單
      fromAmount.value = ''
      toAmount.value = ''
      swapQuote.value = null
      customRecipient.value = false
      recipientAddress.value = ''
    } else {
      throw new Error(result.error)
    }
    
  } catch (error) {
    console.error('Swap failed:', error)
    swapError.value = '兌換失敗: ' + error.message
  } finally {
    isLoading.value = false
    showProgress.value = false
  }
}

const loadRecentSwaps = async () => {
  try {
    recentSwaps.value = await crossChainService.getSwapHistory(account.value)
  } catch (error) {
    console.error('Failed to load swap history:', error)
    recentSwaps.value = mockSwapHistory
  }
}

const getStatusText = (status) => {
  const statusMap = {
    'completed': '已完成',
    'pending': '進行中',
    'failed': '失敗'
  }
  return statusMap[status] || status
}

const viewSwapDetails = (swap) => {
  currentSwap.value = swap
  showProgress.value = true
}

// Watch for connection changes
watch(isConnected, (connected) => {
  if (connected) {
    loadChainBalances()
    loadRecentSwaps()
  }
})

// Watch for amount changes to trigger quote calculation
watch([fromAmount, slippageTolerance], () => {
  calculateSwap()
}, { debounce: 500 })

// Lifecycle
onMounted(() => {
  if (isConnected.value) {
    loadChainBalances()
    loadRecentSwaps()
  }
})
</script>

<style scoped>
.refresh-btn, .settings-btn {
  @apply flex items-center gap-2 px-3 py-2 bg-gaspass-gray-800 bg-opacity-20 hover:bg-opacity-30 text-gaspass-gray-800 rounded-lg transition-all disabled:opacity-50;
}

.swap-section {
  @apply bg-gaspass-gray-50 rounded-xl p-6 border border-gaspass-gray-200;
}

.section-header {
  @apply flex items-center justify-between mb-4;
}

.section-title {
  @apply text-lg font-semibold text-gaspass-gray-800;
}

.balance-info {
  @apply text-sm text-gaspass-gray-600;
}

.input-container {
  @apply flex gap-4;
}

.chain-selector {
  @apply flex items-center justify-between p-4 bg-white border-2 border-gaspass-gray-200 rounded-lg cursor-pointer hover:border-gaspass-yellow-400 transition-all min-w-48;
}

.selected-chain {
  @apply flex items-center gap-3;
}

.chain-icon {
  @apply text-2xl;
}

.chain-details {
  @apply flex-1;
}

.chain-name {
  @apply font-semibold text-gaspass-gray-800;
}

.chain-symbol {
  @apply text-sm text-gaspass-gray-600;
}

.placeholder-chain {
  @apply flex items-center gap-3 text-gaspass-gray-500;
}

.placeholder-icon {
  @apply text-2xl;
}

.amount-input-section {
  @apply flex flex-1 bg-white border-2 border-gaspass-gray-200 rounded-lg focus-within:border-gaspass-yellow-400 transition-colors;
}

.amount-input {
  @apply flex-1 px-4 py-4 text-xl font-semibold text-gaspass-gray-800 bg-transparent border-none outline-none;
}

.amount-actions {
  @apply flex items-center pr-4;
}

.max-btn {
  @apply px-3 py-1 bg-gaspass-yellow-400 hover:bg-gaspass-yellow-500 text-gaspass-gray-800 text-sm font-semibold rounded-md transition-colors disabled:opacity-50;
}

.amount-display-section {
  @apply flex items-center justify-between flex-1 px-4 py-4 bg-white border-2 border-gaspass-gray-200 rounded-lg;
}

.amount-display {
  @apply text-xl font-semibold text-gaspass-gray-800;
}

.amount-symbol {
  @apply text-gaspass-gray-600 font-medium;
}

.swap-arrow-container {
  @apply flex justify-center my-6;
}

.swap-arrow-btn {
  @apply p-3 bg-gaspass-yellow-400 hover:bg-gaspass-yellow-500 text-gaspass-gray-800 rounded-full shadow-lg hover:shadow-xl transition-all transform hover:scale-105;
}

.swap-details {
  @apply mt-6 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200;
}

.details-header {
  @apply flex items-center justify-between mb-4;
}

.details-title {
  @apply text-lg font-semibold text-blue-800;
}

.route-info {
  @apply text-sm text-blue-600;
}

.route-label {
  @apply font-medium;
}

.route-path {
  @apply font-mono;
}

.details-grid {
  @apply grid grid-cols-2 gap-4;
}

.detail-item {
  @apply flex justify-between text-sm;
}

.detail-item.total {
  @apply col-span-2 border-t border-blue-200 pt-2 font-semibold;
}

.detail-label {
  @apply text-blue-700;
}

.detail-value {
  @apply text-blue-800 font-medium;
}

.time-estimate {
  @apply flex items-center gap-2 mt-4 text-sm text-blue-600;
}

.recipient-section {
  @apply mt-6 space-y-4;
}

.recipient-label {
  @apply flex items-center gap-2 text-gaspass-gray-700 cursor-pointer;
}

.recipient-checkbox {
  @apply w-4 h-4 text-gaspass-yellow-400 border-gaspass-gray-300 rounded focus:ring-gaspass-yellow-400;
}

.recipient-input-wrapper {
  @apply mt-2;
}

.recipient-input {
  @apply w-full px-4 py-3 border-2 border-gaspass-gray-200 rounded-lg focus:border-gaspass-yellow-400 focus:outline-none transition-colors font-mono text-sm;
}

.action-section {
  @apply mt-8 space-y-4;
}

.swap-btn {
  @apply w-full bg-gaspass-yellow-400 hover:bg-gaspass-yellow-500 disabled:bg-gaspass-gray-300 disabled:cursor-not-allowed text-gaspass-gray-800 font-bold py-4 px-6 rounded-xl text-lg transition-all transform hover:scale-105 disabled:transform-none;
}

.loading-content {
  @apply flex items-center justify-center gap-3;
}

.loading-spinner {
  @apply w-6 h-6 border-2 border-gaspass-gray-600 border-t-transparent rounded-full animate-spin;
}

.error-message {
  @apply flex items-center gap-2 text-red-600 text-sm bg-red-50 p-3 rounded-lg border border-red-200;
}

.swap-history {
  @apply divide-y divide-gaspass-gray-100;
}

.swap-history-item {
  @apply flex items-center justify-between p-6 hover:bg-gaspass-gray-50 transition-colors;
}

.swap-chains {
  @apply flex items-center gap-4;
}

.swap-from, .swap-to {
  @apply flex items-center gap-2;
}

.swap-arrow {
  @apply text-gaspass-gray-400 font-bold;
}

.swap-amount {
  @apply font-semibold text-gaspass-gray-800;
}

.swap-meta {
  @apply text-center;
}

.swap-status {
  @apply px-2 py-1 rounded-full text-xs font-medium;
}

.swap-status.completed {
  @apply bg-green-100 text-green-800;
}

.swap-status.pending {
  @apply bg-yellow-100 text-yellow-800;
}

.swap-status.failed {
  @apply bg-red-100 text-red-800;
}

.swap-time {
  @apply text-xs text-gaspass-gray-500 mt-1;
}

.swap-actions {
  @apply flex gap-2;
}

.view-btn {
  @apply p-2 text-gaspass-gray-400 hover:text-gaspass-gray-600 transition-colors;
}
</style>