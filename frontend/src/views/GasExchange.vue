<template>
  <Layout>
    <!-- Header Section -->
    <section class="bg-gradient-to-br from-gray-100 to-gray-200 py-16">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center">
          <h1 class="text-4xl sm:text-5xl font-bold text-gray-800 mb-4">
            <span class="bg-gradient-to-r from-amber-500 to-orange-600 bg-clip-text text-transparent">
              ⛽ 跨鏈 Gas 兌換
            </span>
          </h1>
          <p class="text-xl text-gray-600 max-w-3xl mx-auto">
            使用 <span class="text-amber-600 font-semibold">USDC</span> 統一支付，
            輕鬆為任意鏈補充 Gas 費用，享受真正的跨鏈便利！
          </p>
        </div>
      </div>
    </section>

    <!-- Main Content -->
    <section class="py-12 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <!-- Wallet Connection Status -->
        <div v-if="!isConnected" class="text-center py-12">
          <div class="bg-white rounded-2xl shadow-lg p-8 max-w-md mx-auto">
            <div class="w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
              </svg>
            </div>
            <h3 class="text-xl font-bold text-gray-900 mb-4">請先連接錢包</h3>
            <p class="text-gray-600 mb-6">連接您的錢包以開始使用跨鏈 Gas 兌換功能</p>
            <button @click="connectWallet" class="btn-primary w-full">
              連接錢包
            </button>
          </div>
        </div>

        <!-- Connected State -->
        <div v-else>
          <!-- Nexus Initialization -->
          <div v-if="!nexusState.initialized" class="text-center py-12">
            <div class="bg-white rounded-2xl shadow-lg p-8 max-w-md mx-auto">
              <div class="w-16 h-16 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                </svg>
              </div>
              <h3 class="text-xl font-bold text-gray-900 mb-4">初始化 Nexus SDK</h3>
              <p class="text-gray-600 mb-6">正在初始化跨鏈服務，請稍候...</p>
              <button @click="initNexus" :disabled="nexusState.loading" class="btn-primary w-full">
                <span v-if="nexusState.loading" class="flex items-center justify-center gap-2">
                  <div class="loading-spinner"></div>
                  初始化中...
                </span>
                <span v-else>初始化 Nexus</span>
              </button>
            </div>
          </div>

          <!-- Main Interface -->
          <div v-else>
            <!-- Unified Balance Overview -->
            <div class="mb-12">
              <!-- Title and Refresh Button -->
              <div class="flex items-center justify-between mb-6 px-2">
                <h3 class="text-2xl font-bold text-gray-900"> 全鏈 USDC 餘額</h3>
                <button @click="refreshBalances" :disabled="nexusState.loading" class="refresh-btn">
                  <svg class="w-5 h-5" :class="{ 'animate-spin': nexusState.loading }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                  </svg>
                  刷新
                </button>
              </div>

              <!-- Centered Total Balance Card -->
              <div class="flex justify-center mb-10">
                <div class="w-full max-w-lg">
                  <div class="total-balance-card">
                    <div class="text-lg text-gray-600">總 USDC 餘額</div>
                    <div class="text-5xl font-bold text-gray-900 tracking-tight my-2">{{ totalUSDCBalance }}</div>
                    <div class="text-lg text-gray-500">USDC</div>
                  </div>
                </div>
              </div>

              <!-- Grid for Per-Chain Cards -->
              <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                <div v-for="balance in usdcBalances" :key="balance.chainId" class="chain-balance-card">
                  <div class="text-4xl mb-4">{{ getChainInfo(balance.chainId)?.icon || '🌐' }}</div>
                  <div class="text-lg font-semibold text-gray-800">{{ balance.chainName }}</div>
                  <div class="text-gray-600 mt-1">{{ balance.formattedBalance }} USDC</div>
                </div>
              </div>
            </div>

            <!-- Gas Refuel Interface -->
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <!-- Main Refuel Panel -->
              <div class="lg:col-span-2">
                <div class="bg-white rounded-2xl shadow-lg p-6">
                  <h3 class="text-xl font-bold text-gray-900 mb-6">⚡ 跨鏈 Gas 兌換</h3>
                  
                  <!-- Refuel Form -->
                  <div class="space-y-6">
                    <!-- Destination Chain -->
                    <div>
                      <label class="block text-sm font-semibold text-gray-700 mb-2">目標鏈</label>
                      <div class="chain-selector" @click="showChainModal = true">
                        <div v-if="selectedChain" class="selected-chain">
                          <span class="chain-icon">{{ selectedChain.icon }}</span>
                          <div class="chain-details">
                            <div class="chain-name">{{ selectedChain.name }}</div>
                            <div class="chain-symbol">{{ selectedChain.symbol }}</div>
                          </div>
                        </div>
                        <div v-else class="placeholder-chain">
                          <span class="placeholder-icon">🔗</span>
                          <span class="placeholder-text">選擇目標鏈</span>
                        </div>
                        <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                        </svg>
                      </div>
                    </div>

                    <!-- Gas Amount Input -->
                    <div>
                      <label class="block text-sm font-semibold text-gray-700 mb-2">Gas 數量</label>
                      <div class="amount-input-container">
                        <input 
                          v-model="gasAmount"
                          type="number"
                          step="0.001"
                          min="0.001"
                          :placeholder="`輸入 ${selectedChain?.symbol || 'Gas'} 數量`"
                          class="amount-input"
                          @input="calculateCost"
                        />
                        <div class="amount-actions">
                          <button 
                            @click="setMaxGas"
                            :disabled="!selectedChain"
                            class="max-btn"
                          >
                            MAX
                          </button>
                        </div>
                      </div>
                    </div>

                    <!-- Recipient Address -->
                    <div>
                      <label class="block text-sm font-semibold text-gray-700 mb-2">接收地址</label>
                      <input 
                        v-model="recipientAddress"
                        type="text"
                        placeholder="輸入接收地址（留空使用當前錢包地址）"
                        class="address-input"
                      />
                    </div>

                    <!-- Cost Preview -->
                    <div v-if="costEstimate" class="cost-preview">
                      <h4 class="text-lg font-semibold text-gray-900 mb-4">費用預估</h4>
                      <div class="space-y-3">
                        <div class="flex justify-between">
                          <span class="text-gray-600">Gas 數量:</span>
                          <span class="font-semibold">{{ gasAmount }} {{ selectedChain?.symbol }}</span>
                        </div>
                        <div class="flex justify-between">
                          <span class="text-gray-600">橋接費用:</span>
                          <span class="font-semibold">{{ costEstimate.bridgeFee }} USDC</span>
                        </div>
                        <div class="flex justify-between">
                          <span class="text-gray-600">兌換費用:</span>
                          <span class="font-semibold">{{ costEstimate.exchangeFee }} USDC</span>
                        </div>
                        <div class="border-t pt-3">
                          <div class="flex justify-between text-lg">
                            <span class="font-bold text-gray-900">總費用:</span>
                            <span class="font-bold text-amber-600">{{ costEstimate.totalCost }} USDC</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <!-- Refuel Button -->
                    <button 
                      @click="executeRefuel"
                      :disabled="!canRefuel"
                      class="refuel-btn"
                      :class="{ 'loading': nexusState.loading }"
                    >
                      <span v-if="nexusState.loading" class="flex items-center justify-center gap-2">
                        <div class="loading-spinner"></div>
                        兌換中...
                      </span>
                      <span v-else class="flex items-center justify-center gap-2">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                        </svg>
                        {{ getRefuelButtonText() }}
                      </span>
                    </button>

                    <!-- Error Message -->
                    <div v-if="nexusState.error" class="error-message">
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                      {{ nexusState.error }}
                    </div>
                  </div>
                </div>
              </div>

              <!-- Side Panel -->
              <div class="space-y-6">
                <!-- Recent Transactions -->
                <div class="bg-white rounded-2xl shadow-lg p-6">
                  <h4 class="text-lg font-bold text-gray-900 mb-4">📊 最近交易</h4>
                  <div v-if="recentTransactions.length === 0" class="text-center py-4 text-gray-500">
                    暫無交易記錄
                  </div>
                  <div v-else class="space-y-3">
                    <div v-for="tx in recentTransactions" :key="tx.id" class="transaction-item">
                      <div class="flex items-center justify-between">
                        <div>
                          <div class="font-semibold text-gray-900">{{ tx.amount }} {{ tx.symbol }}</div>
                          <div class="text-sm text-gray-500">{{ tx.chain }}</div>
                        </div>
                        <div class="text-right">
                          <div class="text-sm text-gray-600">{{ tx.cost }} USDC</div>
                          <div class="text-sm text-green-600">{{ tx.status }}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Supported Chains -->
                <div class="bg-white rounded-2xl shadow-lg p-6">
                  <h4 class="text-lg font-bold text-gray-900 mb-4">🔗 支援的鏈</h4>
                  <div class="space-y-3">
                    <div v-for="chain in supportedChains" :key="chain.id" class="supported-chain-item">
                      <div class="flex items-center gap-3">
                        <div class="chain-icon">{{ chain.icon }}</div>
                        <div>
                          <div class="font-semibold text-gray-900">{{ chain.name }}</div>
                          <div class="text-sm text-gray-500">{{ chain.symbol }}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- How it Works -->
                <div class="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200">
                  <h4 class="text-lg font-bold text-blue-900 mb-4">💡 工作原理</h4>
                  <div class="space-y-3 text-sm text-blue-800">
                    <div class="flex items-start gap-2">
                      <span class="text-blue-600 font-bold">1.</span>
                      <span>選擇目標鏈和 Gas 數量</span>
                    </div>
                    <div class="flex items-start gap-2">
                      <span class="text-blue-600 font-bold">2.</span>
                      <span>使用 USDC 統一支付</span>
                    </div>
                    <div class="flex items-start gap-2">
                      <span class="text-blue-600 font-bold">3.</span>
                      <span>Nexus 自動橋接和兌換</span>
                    </div>
                    <div class="flex items-start gap-2">
                      <span class="text-blue-600 font-bold">4.</span>
                      <span>Gas 直接到賬目標鏈</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Chain Selection Modal -->
    <div v-if="showChainModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" @click="showChainModal = false">
      <div class="bg-white rounded-2xl p-6 max-w-md w-full mx-4" @click.stop>
        <h3 class="text-xl font-bold text-gray-900 mb-4">選擇目標鏈</h3>
        <div class="space-y-2">
          <div 
            v-for="chain in supportedChains" 
            :key="chain.id"
            @click="selectChain(chain)"
            class="chain-option"
          >
            <span class="chain-icon">{{ chain.icon }}</span>
            <div class="chain-details">
              <div class="chain-name">{{ chain.name }}</div>
              <div class="chain-symbol">{{ chain.symbol }}</div>
            </div>
          </div>
        </div>
        <button @click="showChainModal = false" class="close-btn">
          取消
        </button>
      </div>
    </div>
  </Layout>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useWeb3 } from '../composables/useWeb3.js'
import { 
  nexusState, 
  initializeNexus, 
  fetchUnifiedUSDC,
  getUSDCBalances,
  getTotalUSDCBalance,
  refuelGasWithUSDC,
  estimateGasRefuelCost,
  getChainInfo
} from '../composables/useNexus.js'
import Layout from '../components/Layout.vue'

// Web3 composable
const { account, isConnected, connectWallet } = useWeb3()

// Data
const selectedChain = ref(null)
const gasAmount = ref('')
const recipientAddress = ref('')
const costEstimate = ref(null)
const recentTransactions = ref([])
const showChainModal = ref(false)

// Computed
const totalUSDCBalance = getTotalUSDCBalance
const usdcBalances = getUSDCBalances

const supportedChains = computed(() => {
  if (!usdcBalances.value) return []
  return usdcBalances.value.map(balance => ({
    id: balance.chainId,
    name: balance.chainName,
    symbol: balance.chainName.split(' ')[0], // Basic symbol derivation
    icon: '🌐' // Generic globe icon
  }))
})

const canRefuel = computed(() => {
  return selectedChain.value && 
         gasAmount.value && 
         parseFloat(gasAmount.value) > 0 &&
         costEstimate.value &&
         (parseFloat(totalUSDCBalance.value) >= parseFloat(costEstimate.value.totalCost)) &&
         !nexusState.loading
})

// Methods
const initNexus = async () => {
  try {
    await initializeNexus()
    await loadRecentTransactions()
  } catch (error) {
    console.error('Failed to initialize Nexus:', error)
  }
}

const refreshBalances = async () => {
  try {
    await fetchUnifiedUSDC()
  } catch (error) {
    console.error('Failed to refresh balances:', error)
  }
}

const selectChain = (chain) => {
  selectedChain.value = chain
  showChainModal.value = false
  gasAmount.value = ''
  costEstimate.value = null
}

const setMaxGas = () => {
  if (!selectedChain.value) return
  // 設置一個合理的最大 Gas 數量
  gasAmount.value = '0.1'
  calculateCost()
}

const calculateCost = async () => {
  if (!selectedChain.value || !gasAmount.value || parseFloat(gasAmount.value) <= 0) {
    costEstimate.value = null
    return
  }

  try {
    const estimate = await estimateGasRefuelCost({
      destinationChain: selectedChain.value.id,
      nativeAmount: gasAmount.value
    })

    costEstimate.value = {
      bridgeFee: (parseFloat(gasAmount.value) * 0.01).toFixed(4), // 1% bridge fee
      exchangeFee: (parseFloat(gasAmount.value) * 0.005).toFixed(4), // 0.5% exchange fee
      totalCost: (parseFloat(gasAmount.value) * 0.015).toFixed(4) // Total 1.5% fee
    }
  } catch (error) {
    console.error('Failed to calculate cost:', error)
    // 使用模擬數據
    costEstimate.value = {
      bridgeFee: (parseFloat(gasAmount.value) * 0.01).toFixed(4),
      exchangeFee: (parseFloat(gasAmount.value) * 0.005).toFixed(4),
      totalCost: (parseFloat(gasAmount.value) * 0.015).toFixed(4)
    }
  }
}

const executeRefuel = async () => {
  if (!canRefuel.value) return

  try {
    const result = await refuelGasWithUSDC({
      destinationChain: selectedChain.value.id,
      nativeAmount: gasAmount.value,
      recipientAddress: recipientAddress.value || account.value
    })

    // 添加到交易歷史
    const transaction = {
      id: Date.now(),
      amount: gasAmount.value,
      symbol: selectedChain.value.symbol,
      chain: selectedChain.value.name,
      cost: costEstimate.value.totalCost,
      status: 'completed',
      timestamp: new Date().toLocaleString('zh-TW')
    }
    recentTransactions.value.unshift(transaction)

    // 重置表單
    gasAmount.value = ''
    recipientAddress.value = ''
    costEstimate.value = null

    // 刷新餘額
    await refreshBalances()

  } catch (error) {
    console.error('Refuel failed:', error)
  }
}

const getRefuelButtonText = () => {
  if (!selectedChain.value) return '選擇目標鏈'
  if (!gasAmount.value) return '輸入 Gas 數量'
  if (!costEstimate.value) return '計算費用中...'
  if (!(parseFloat(totalUSDCBalance.value) >= parseFloat(costEstimate.value.totalCost))) return 'USDC 餘額不足'
  return `用 ${costEstimate.value.totalCost} USDC 兌換 ${gasAmount.value} ${selectedChain.value.symbol}`
}

const loadRecentTransactions = async () => {
  // 模擬交易歷史
  recentTransactions.value = [
    {
      id: 1,
      amount: '0.05',
      symbol: 'ETH',
      chain: 'Arbitrum',
      cost: '0.075',
      status: 'completed',
      timestamp: '2024-01-15 14:30'
    },
    {
      id: 2,
      amount: '0.02',
      symbol: 'ETH',
      chain: 'Base',
      cost: '0.03',
      status: 'completed',
      timestamp: '2024-01-14 09:15'
    }
  ]
}

// Watch for connection changes
watch(isConnected, (connected) => {
  if (connected && !nexusState.initialized) {
    initNexus()
  }
})

// Watch for amount changes
watch(gasAmount, () => {
  calculateCost()
})

// Lifecycle
onMounted(() => {
  if (isConnected.value && !nexusState.initialized) {
    initNexus()
  }
})
</script>

<style scoped>
.btn-primary {
  @apply bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-amber-500/30 focus:ring-offset-2 shadow-lg hover:shadow-xl hover:scale-105;
}

.refresh-btn {
  @apply flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-all duration-300;
}

.total-balance-card {
  @apply bg-gradient-to-br from-gray-50 to-gray-200 p-8 rounded-3xl shadow-lg text-center transition-all duration-300 hover:shadow-xl border border-gray-200/80;
}

.chain-balance-card {
  @apply bg-white p-6 rounded-2xl shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col items-center justify-start text-center h-full border border-gray-100 hover:border-gray-200;
}

/* Text styles are now applied directly in the template for more granular control */
.balance-icon, .chain-icon {
  /* This class is kept for potential fallback but is mostly superseded by classes in the template */
}

.balance-label, .chain-name {
  @apply text-sm text-gray-600;
}

.balance-amount, .chain-balance {
  @apply font-bold text-gray-900;
}

.chain-selector {
  @apply flex items-center justify-between p-4 bg-gray-50 border-2 border-gray-200 rounded-xl cursor-pointer hover:border-amber-400 transition-all duration-300;
}

.selected-chain {
  @apply flex items-center gap-3;
}

.chain-details {
  @apply flex-1;
}

.chain-name {
  @apply font-semibold text-gray-900;
}

.chain-symbol {
  @apply text-sm text-gray-600;
}

.placeholder-chain {
  @apply flex items-center gap-3 text-gray-500;
}

.placeholder-icon {
  @apply text-2xl;
}

.amount-input-container {
  @apply flex bg-white border-2 border-gray-200 rounded-xl focus-within:border-amber-400 transition-colors;
}

.amount-input {
  @apply flex-1 px-4 py-3 text-lg font-semibold text-gray-900 bg-transparent border-none outline-none;
}

.amount-actions {
  @apply flex items-center pr-4;
}

.max-btn {
  @apply px-3 py-1 bg-amber-400 hover:bg-amber-500 text-gray-800 text-sm font-semibold rounded-md transition-colors disabled:opacity-50;
}

.address-input {
  @apply w-full p-3 border-2 border-gray-200 rounded-xl focus:border-amber-400 focus:ring-4 focus:ring-amber-400/30 focus:outline-none transition-all duration-300;
}

.cost-preview {
  @apply bg-blue-50 border border-blue-200 rounded-xl p-4;
}

.refuel-btn {
  @apply w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold py-4 px-6 rounded-xl text-lg transition-all duration-300 transform hover:scale-105 disabled:transform-none;
}

.error-message {
  @apply flex items-center gap-2 text-red-600 text-sm bg-red-50 p-3 rounded-lg border border-red-200;
}

.transaction-item {
  @apply border-b border-gray-100 py-3 last:border-b-0;
}

.supported-chain-item {
  @apply flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors;
}

.chain-option {
  @apply flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors;
}

.close-btn {
  @apply w-full mt-4 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded-lg transition-colors;
}

.loading-spinner {
  @apply w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin;
}
</style>

<style scoped>
.btn-primary {
  @apply bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-amber-500/30 focus:ring-offset-2 shadow-lg hover:shadow-xl hover:scale-105;
}

.refresh-btn {
  @apply flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-all duration-300;
}

.total-balance-card {
  @apply bg-gradient-to-br from-gray-50 to-gray-200 p-8 rounded-3xl shadow-lg text-center transition-all duration-300 hover:shadow-xl border border-gray-200/80;
}

.chain-balance-card {
  @apply bg-white p-6 rounded-2xl shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col items-center justify-start text-center h-full border border-gray-100 hover:border-gray-200;
}

/* Text styles are now applied directly in the template for more granular control */
.balance-icon, .chain-icon {
  /* This class is kept for potential fallback but is mostly superseded by classes in the template */
}

.balance-label, .chain-name {
  @apply text-sm text-gray-600;
}

.balance-amount, .chain-balance {
  @apply font-bold text-gray-900;
}

.chain-selector {
  @apply flex items-center justify-between p-4 bg-gray-50 border-2 border-gray-200 rounded-xl cursor-pointer hover:border-amber-400 transition-all duration-300;
}

.selected-chain {
  @apply flex items-center gap-3;
}

.chain-details {
  @apply flex-1;
}

.chain-name {
  @apply font-semibold text-gray-900;
}

.chain-symbol {
  @apply text-sm text-gray-600;
}

.placeholder-chain {
  @apply flex items-center gap-3 text-gray-500;
}

.placeholder-icon {
  @apply text-2xl;
}

.amount-input-container {
  @apply flex bg-white border-2 border-gray-200 rounded-xl focus-within:border-amber-400 transition-colors;
}

.amount-input {
  @apply flex-1 px-4 py-3 text-lg font-semibold text-gray-900 bg-transparent border-none outline-none;
}

.amount-actions {
  @apply flex items-center pr-4;
}

.max-btn {
  @apply px-3 py-1 bg-amber-400 hover:bg-amber-500 text-gray-800 text-sm font-semibold rounded-md transition-colors disabled:opacity-50;
}

.address-input {
  @apply w-full p-3 border-2 border-gray-200 rounded-xl focus:border-amber-400 focus:ring-4 focus:ring-amber-400/30 focus:outline-none transition-all duration-300;
}

.cost-preview {
  @apply bg-blue-50 border border-blue-200 rounded-xl p-4;
}

.refuel-btn {
  @apply w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold py-4 px-6 rounded-xl text-lg transition-all duration-300 transform hover:scale-105 disabled:transform-none;
}

.error-message {
  @apply flex items-center gap-2 text-red-600 text-sm bg-red-50 p-3 rounded-lg border border-red-200;
}

.transaction-item {
  @apply border-b border-gray-100 py-3 last:border-b-0;
}

.supported-chain-item {
  @apply flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors;
}

.chain-option {
  @apply flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors;
}

.close-btn {
  @apply w-full mt-4 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded-lg transition-colors;
}

.loading-spinner {
  @apply w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin;
}
</style>