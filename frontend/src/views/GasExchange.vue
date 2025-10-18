<template>
  <Layout>
    <!-- Header Section -->
    <section class="bg-gradient-to-br from-gray-100 to-gray-200 py-16">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center">
          <h1 class="text-4xl sm:text-5xl font-bold text-gray-800 mb-4">
            <span class="bg-gradient-to-r from-amber-500 to-orange-600 bg-clip-text text-transparent">
              兌換 Gas
            </span>
          </h1>
          <p class="text-xl text-gray-600 max-w-3xl mx-auto">
            跨鏈 Gas 兌換服務，讓您輕鬆管理多鏈 Gas 費用
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
            <p class="text-gray-600 mb-6">連接您的錢包以開始使用 Gas 兌換功能</p>
            <button @click="connectWallet" class="btn-primary w-full">
              連接錢包
            </button>
          </div>
        </div>

        <!-- Connected State -->
        <div v-else>
          <!-- Exchange Interface -->
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <!-- Main Exchange Panel -->
            <div class="lg:col-span-2">
              <div class="bg-white rounded-2xl shadow-lg p-6">
                <h3 class="text-xl font-bold text-gray-900 mb-6">Gas 兌換</h3>
                
                <!-- Exchange Form -->
                <div class="space-y-6">
                  <!-- Source Chain -->
                  <div>
                    <label class="block text-sm font-semibold text-gray-700 mb-2">來源鏈</label>
                    <div class="relative">
                      <select v-model="exchangeForm.sourceChain" class="chain-select">
                        <option value="42161">Arbitrum One</option>
                        <option value="1">Ethereum</option>
                        <option value="137">Polygon</option>
                        <option value="56">BSC</option>
                        <option value="43114">Avalanche</option>
                        <option value="10">Optimism</option>
                      </select>
                    </div>
                  </div>

                  <!-- Target Chain -->
                  <div>
                    <label class="block text-sm font-semibold text-gray-700 mb-2">目標鏈</label>
                    <div class="relative">
                      <select v-model="exchangeForm.targetChain" class="chain-select">
                        <option value="1">Ethereum</option>
                        <option value="137">Polygon</option>
                        <option value="56">BSC</option>
                        <option value="43114">Avalanche</option>
                        <option value="10">Optimism</option>
                        <option value="42161">Arbitrum One</option>
                      </select>
                    </div>
                  </div>

                  <!-- Amount Input -->
                  <div>
                    <label class="block text-sm font-semibold text-gray-700 mb-2">兌換金額</label>
                    <div class="relative">
                      <input 
                        v-model="exchangeForm.amount"
                        type="number"
                        step="0.01"
                        min="0.01"
                        placeholder="輸入金額"
                        class="amount-input"
                        @input="calculateExchange"
                      />
                      <span class="currency-label">USDC</span>
                    </div>
                  </div>

                  <!-- Recipient Address -->
                  <div>
                    <label class="block text-sm font-semibold text-gray-700 mb-2">接收地址</label>
                    <input 
                      v-model="exchangeForm.recipientAddress"
                      type="text"
                      placeholder="輸入接收地址"
                      class="address-input"
                    />
                  </div>

                  <!-- Exchange Preview -->
                  <div v-if="exchangePreview" class="exchange-preview">
                    <h4 class="text-lg font-semibold text-gray-900 mb-4">兌換預覽</h4>
                    <div class="space-y-3">
                      <div class="flex justify-between">
                        <span class="text-gray-600">兌換金額:</span>
                        <span class="font-semibold">{{ exchangeForm.amount }} USDC</span>
                      </div>
                      <div class="flex justify-between">
                        <span class="text-gray-600">Gas 費用:</span>
                        <span class="font-semibold">{{ exchangePreview.gasCost }} ETH</span>
                      </div>
                      <div class="flex justify-between">
                        <span class="text-gray-600">橋接費用:</span>
                        <span class="font-semibold">{{ exchangePreview.bridgeFee }} USDC</span>
                      </div>
                      <div class="border-t pt-3">
                        <div class="flex justify-between text-lg">
                          <span class="font-bold text-gray-900">總費用:</span>
                          <span class="font-bold text-amber-600">{{ exchangePreview.total }} USDC</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Exchange Button -->
                  <button 
                    @click="executeExchange"
                    :disabled="!canExecute"
                    class="btn-primary w-full"
                    :class="{ 'loading': isExchanging }"
                  >
                    <span v-if="isExchanging" class="flex items-center justify-center gap-2">
                      <div class="loading-spinner"></div>
                      兌換中...
                    </span>
                    <span v-else class="flex items-center justify-center gap-2">
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                      </svg>
                      開始兌換
                    </span>
                  </button>
                </div>
              </div>
            </div>

            <!-- Side Panel -->
            <div class="space-y-6">
              <!-- User Balance -->
              <div class="bg-white rounded-2xl shadow-lg p-6">
                <h4 class="text-lg font-bold text-gray-900 mb-4">我的餘額</h4>
                <div class="space-y-3">
                  <div class="flex justify-between">
                    <span class="text-gray-600">USDC 餘額:</span>
                    <span class="font-semibold">{{ usdcBalance }} USDC</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-600">ETH 餘額:</span>
                    <span class="font-semibold">{{ ethBalance }} ETH</span>
                  </div>
                </div>
              </div>

              <!-- Supported Chains -->
              <div class="bg-white rounded-2xl shadow-lg p-6">
                <h4 class="text-lg font-bold text-gray-900 mb-4">支援的鏈</h4>
                <div class="space-y-3">
                  <div v-for="chain in supportedChains" :key="chain.id" class="flex items-center gap-3">
                    <div class="w-8 h-8 rounded-full flex items-center justify-center" :style="{ backgroundColor: chain.color }">
                      <span class="text-white text-xs font-bold">{{ chain.symbol }}</span>
                    </div>
                    <div>
                      <div class="font-semibold text-gray-900">{{ chain.name }}</div>
                      <div class="text-sm text-gray-500">{{ chain.id }}</div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Exchange History -->
              <div class="bg-white rounded-2xl shadow-lg p-6">
                <h4 class="text-lg font-bold text-gray-900 mb-4">兌換歷史</h4>
                <div v-if="exchangeHistory.length === 0" class="text-center py-4 text-gray-500">
                  暫無兌換記錄
                </div>
                <div v-else class="space-y-3">
                  <div v-for="exchange in exchangeHistory" :key="exchange.id" class="exchange-history-item">
                    <div class="flex items-center justify-between">
                      <div>
                        <div class="font-semibold text-gray-900">{{ exchange.amount }} USDC</div>
                        <div class="text-sm text-gray-500">{{ exchange.timestamp }}</div>
                      </div>
                      <div class="text-right">
                        <div class="text-sm text-gray-600">{{ exchange.sourceChain }} → {{ exchange.targetChain }}</div>
                        <div class="text-sm text-green-600">{{ exchange.status }}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </Layout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useWeb3 } from '../composables/useWeb3.js'
import { gasPassService } from '../services/gasPassService.js'
import Layout from '../components/Layout.vue'

// Web3 composable
const { account, isConnected, connectWallet, getBalance, getUSDCBalance } = useWeb3()

// Data
const exchangeForm = ref({
  sourceChain: '42161',
  targetChain: '1',
  amount: '',
  recipientAddress: ''
})

const exchangePreview = ref(null)
const isExchanging = ref(false)
const usdcBalance = ref('0.00')
const ethBalance = ref('0.00')
const exchangeHistory = ref([])

const supportedChains = ref([
  { id: '1', name: 'Ethereum', symbol: 'ETH', color: '#627EEA' },
  { id: '137', name: 'Polygon', symbol: 'MATIC', color: '#8247E5' },
  { id: '56', name: 'BSC', symbol: 'BNB', color: '#F3BA2F' },
  { id: '43114', name: 'Avalanche', symbol: 'AVAX', color: '#E84142' },
  { id: '10', name: 'Optimism', symbol: 'OP', color: '#FF0420' },
  { id: '42161', name: 'Arbitrum', symbol: 'ARB', color: '#28A0F0' }
])

// Computed
const canExecute = computed(() => {
  return exchangeForm.value.amount && 
         parseFloat(exchangeForm.value.amount) > 0 &&
         exchangeForm.value.recipientAddress &&
         !isExchanging.value
})

// Methods
const calculateExchange = async () => {
  if (!exchangeForm.value.amount || parseFloat(exchangeForm.value.amount) <= 0) {
    exchangePreview.value = null
    return
  }

  try {
    // Simulate exchange calculation
    await new Promise(resolve => setTimeout(resolve, 500))
    
    const amount = parseFloat(exchangeForm.value.amount)
    const gasCost = (amount * 0.001).toFixed(4) // 0.1% gas cost
    const bridgeFee = (amount * 0.003).toFixed(4) // 0.3% bridge fee
    const total = (amount + parseFloat(bridgeFee)).toFixed(4)

    exchangePreview.value = {
      gasCost,
      bridgeFee,
      total
    }
  } catch (error) {
    console.error('Failed to calculate exchange:', error)
  }
}

const executeExchange = async () => {
  if (!canExecute.value) return

  isExchanging.value = true

  try {
    // Simulate exchange execution
    await new Promise(resolve => setTimeout(resolve, 3000))

    // Add to history
    const exchange = {
      id: Date.now(),
      amount: exchangeForm.value.amount,
      sourceChain: exchangeForm.value.sourceChain,
      targetChain: exchangeForm.value.targetChain,
      recipientAddress: exchangeForm.value.recipientAddress,
      timestamp: new Date().toLocaleString('zh-TW'),
      status: 'completed'
    }

    exchangeHistory.value.unshift(exchange)

    // Reset form
    exchangeForm.value.amount = ''
    exchangeForm.value.recipientAddress = ''
    exchangePreview.value = null

    // Reload balances
    await loadBalances()

  } catch (error) {
    console.error('Exchange failed:', error)
  } finally {
    isExchanging.value = false
  }
}

const loadBalances = async () => {
  try {
    usdcBalance.value = await getUSDCBalance()
    ethBalance.value = await getBalance()
  } catch (error) {
    console.error('Failed to load balances:', error)
  }
}

// Lifecycle
onMounted(() => {
  if (isConnected.value) {
    loadBalances()
  }
})
</script>

<style scoped>
.btn-primary {
  @apply bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-amber-500/30 focus:ring-offset-2 shadow-lg hover:shadow-xl hover:scale-105;
}

.btn-primary.loading {
  @apply opacity-75 cursor-not-allowed hover:scale-100;
}

.chain-select {
  @apply w-full p-3 border-2 border-gray-300 rounded-xl focus:border-amber-500 focus:ring-4 focus:ring-amber-500/30 focus:outline-none transition-all duration-300;
}

.amount-input {
  @apply w-full p-3 pr-16 border-2 border-gray-300 rounded-xl focus:border-amber-500 focus:ring-4 focus:ring-amber-500/30 focus:outline-none transition-all duration-300;
}

.currency-label {
  @apply absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600 font-semibold;
}

.address-input {
  @apply w-full p-3 border-2 border-gray-300 rounded-xl focus:border-amber-500 focus:ring-4 focus:ring-amber-500/30 focus:outline-none transition-all duration-300;
}

.exchange-preview {
  @apply bg-gray-50 border-2 border-gray-200 rounded-xl p-4;
}

.exchange-history-item {
  @apply border-b border-gray-100 py-3 last:border-b-0;
}

.loading-spinner {
  @apply w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin;
}
</style>
