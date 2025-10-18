<template>
  <Layout>
    <!-- Header Section -->
    <section class="bg-gradient-to-br from-gray-100 to-gray-200 py-16">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center">
          <h1 class="text-4xl sm:text-5xl font-bold text-gray-800 mb-4">
            <span class="bg-gradient-to-r from-amber-500 to-orange-600 bg-clip-text text-transparent">
              儲值卡管理
            </span>
          </h1>
          <p class="text-xl text-gray-600 max-w-3xl mx-auto">
            管理您的 GasPass 儲值卡，享受無憂的跨鏈 Gas 管理體驗
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
            <p class="text-gray-600 mb-6">連接您的錢包以開始使用 GasPass 儲值卡管理功能</p>
            <button @click="connectWallet" class="btn-primary w-full">
              連接錢包
            </button>
          </div>
        </div>

        <!-- Connected State -->
        <div v-else>
          <!-- User Info -->
          <div class="bg-white rounded-2xl shadow-lg p-6 mb-8">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-4">
                <div class="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center">
                  <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                  </svg>
                </div>
                <div>
                  <h3 class="text-lg font-bold text-gray-900">錢包已連接</h3>
                  <p class="text-gray-600">{{ formatAddress(account) }}</p>
                </div>
              </div>
              <div class="text-right">
                <div class="text-sm text-gray-500">USDC 餘額</div>
                <div class="text-lg font-bold text-gray-900">{{ usdcBalance }} USDC</div>
              </div>
            </div>
          </div>

          <!-- Card Status -->
          <div v-if="!hasCard" class="text-center py-12">
            <div class="bg-white rounded-2xl shadow-lg p-8 max-w-2xl mx-auto">
              <h3 class="text-2xl font-bold text-gray-900 mb-4">歡迎使用 GasPass！</h3>
              <p class="text-gray-600 mb-8">您還沒有儲值卡，讓我們為您創建第一個可愛的 GasPass 儲值罐</p>
              
              <!-- Cute Gas Jar Component -->
              <CuteGasJar 
                :isFirstTime="true"
                @success="handleMintSuccess"
                @error="handleError"
              />
            </div>
          </div>

          <!-- Existing Card Management -->
          <div v-else>
            <!-- Card Overview -->
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
              <!-- Card Info -->
              <div class="lg:col-span-2">
                <div class="bg-white rounded-2xl shadow-lg p-6">
                  <div class="flex items-center justify-between mb-6">
                    <h3 class="text-xl font-bold text-gray-900">我的儲值卡</h3>
                    <div class="flex gap-2">
                      <button @click="refreshCards" class="btn-secondary-sm">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                        </svg>
                        刷新
                      </button>
                    </div>
                  </div>
                  
                  <div v-for="card in userCards" :key="card.tokenId" class="card-item">
                    <div class="flex items-center justify-between">
                      <div class="flex items-center gap-4">
                        <div class="w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center">
                          <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
                          </svg>
                        </div>
                        <div>
                          <h4 class="text-lg font-bold text-gray-900">GasPass #{{ card.tokenId }}</h4>
                          <p class="text-gray-600">餘額: {{ card.balance }} USDC</p>
                          <p class="text-sm text-gray-500">最後更新: {{ card.lastUpdate }}</p>
                        </div>
                      </div>
                      <div class="text-right">
                        <div class="text-2xl font-bold text-gray-900">{{ card.balance }} USDC</div>
                        <div class="text-sm text-gray-500">可用餘額</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Quick Actions -->
              <div class="space-y-6">
                <!-- Deposit Card -->
                <div class="bg-white rounded-2xl shadow-lg p-6">
                  <h4 class="text-lg font-bold text-gray-900 mb-4">快速儲值</h4>
                  <CuteGasJar 
                    :isFirstTime="false"
                    :existingCard="userCards[0]"
                    @success="handleDepositSuccess"
                    @error="handleError"
                  />
                </div>

                <!-- Quick Actions -->
                <div class="bg-white rounded-2xl shadow-lg p-6">
                  <h4 class="text-lg font-bold text-gray-900 mb-4">快速操作</h4>
                  <div class="space-y-3">
                    <router-link to="/gas-exchange" class="btn-primary w-full">
                      <span class="flex items-center justify-center gap-2">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                        </svg>
                        兌換 Gas
                      </span>
                    </router-link>
                    <button @click="showManualRefuel = true" class="btn-secondary w-full">
                      <span class="flex items-center justify-center gap-2">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100-4m0 4v2m0-6V4"></path>
                        </svg>
                        手動補 Gas
                      </span>
                    </button>
                    <button @click="showAutoRefuel = true" class="btn-secondary w-full">
                      <span class="flex items-center justify-center gap-2">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
                        </svg>
                        自動補 Gas
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Transaction History -->
            <div class="bg-white rounded-2xl shadow-lg p-6">
              <h3 class="text-xl font-bold text-gray-900 mb-6">交易歷史</h3>
              <div v-if="transactionHistory.length === 0" class="text-center py-8 text-gray-500">
                暫無交易記錄
              </div>
              <div v-else class="space-y-4">
                <div v-for="tx in transactionHistory" :key="tx.id" class="transaction-item">
                  <div class="flex items-center justify-between">
                    <div class="flex items-center gap-4">
                      <div class="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center">
                        <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
                        </svg>
                      </div>
                      <div>
                        <h4 class="font-semibold text-gray-900">{{ tx.type }}</h4>
                        <p class="text-sm text-gray-500">{{ tx.timestamp }}</p>
                      </div>
                    </div>
                    <div class="text-right">
                      <div class="font-semibold text-gray-900">{{ tx.amount }} USDC</div>
                      <div class="text-sm text-green-600">{{ tx.status }}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Modals -->
    <ManualRefuelModal 
      v-if="showManualRefuel"
      @close="showManualRefuel = false"
      @success="handleManualRefuelSuccess"
    />
    
    <AutoRefuelModal 
      v-if="showAutoRefuel"
      @close="showAutoRefuel = false"
      @success="handleAutoRefuelSuccess"
    />
  </Layout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useWeb3 } from '../composables/useWeb3.js'
import { gasPassService } from '../services/gasPassService.js'
import Layout from '../components/Layout.vue'
import CuteGasJar from '../components/CuteGasJar.vue'
import ManualRefuelModal from '../components/ManualRefuelModal.vue'
import AutoRefuelModal from '../components/AutoRefuelModal.vue'

// Web3 composable
const { account, isConnected, connectWallet, formatAddress, getUSDCBalance } = useWeb3()

// Data
const userCards = ref([])
const transactionHistory = ref([])
const usdcBalance = ref('0.00')
const showManualRefuel = ref(false)
const showAutoRefuel = ref(false)

// Computed
const hasCard = computed(() => userCards.value.length > 0)

// Methods
const loadUserData = async () => {
  if (!account.value) return
  
  try {
    // Load user cards
    userCards.value = await gasPassService.getUserCards(account.value)
    
    // Load transaction history
    transactionHistory.value = await gasPassService.getTransactionHistory()
    
    // Load USDC balance
    usdcBalance.value = await getUSDCBalance()
  } catch (error) {
    console.error('Failed to load user data:', error)
  }
}

const refreshCards = async () => {
  await loadUserData()
}

const handleMintSuccess = () => {
  loadUserData()
}

const handleDepositSuccess = () => {
  loadUserData()
}

const handleManualRefuelSuccess = () => {
  loadUserData()
}

const handleAutoRefuelSuccess = () => {
  loadUserData()
}

const handleError = (error) => {
  console.error('Operation failed:', error)
  // You can add toast notification here
}

// Lifecycle
onMounted(() => {
  if (isConnected.value) {
    loadUserData()
  }
})
</script>

<style scoped>
.btn-primary {
  @apply bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-amber-500/30 focus:ring-offset-2 shadow-lg hover:shadow-xl hover:scale-105;
}

.btn-secondary {
  @apply bg-white border-2 border-gray-300 hover:border-gray-400 text-gray-700 font-semibold py-3 px-6 rounded-xl transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-gray-500/30 focus:ring-offset-2 hover:bg-gray-50;
}

.btn-secondary-sm {
  @apply bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-gray-500/30 focus:ring-offset-2;
}

.card-item {
  @apply border border-gray-200 rounded-xl p-4 mb-4 hover:shadow-md transition-all duration-300;
}

.transaction-item {
  @apply border-b border-gray-100 py-4 last:border-b-0;
}
</style>
