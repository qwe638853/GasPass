<template>
  <Layout>

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
          <!-- 上半部分：儲值卡管理 -->
          <div class="mb-12">
            <!-- 沒有儲值卡的情況 -->
            <div v-if="!hasCard" class="text-center py-12">
              <div class="bg-white rounded-3xl shadow-2xl p-12 max-w-4xl mx-auto relative overflow-hidden">
                <!-- 背景裝飾 -->
                <div class="absolute inset-0 bg-gradient-to-br from-amber-50/50 to-orange-50/50"></div>
                <div class="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-amber-200/20 to-orange-200/20 rounded-full -translate-y-32 translate-x-32"></div>
                <div class="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-amber-200/20 to-orange-200/20 rounded-full translate-y-24 -translate-x-24"></div>
                
                <div class="relative z-10">
                  <h3 class="text-3xl font-bold text-gray-900 mb-6">歡迎使用 GasPass！</h3>
                  <p class="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
                    您還沒有儲值卡，讓我們為您創建第一個可愛的 GasPass 儲值罐，開始您的無憂 DeFi 之旅！
                  </p>
                  
                  <!-- Cute Gas Jar Component -->
                  <CuteGasJar 
                    :isFirstTime="true"
                    @success="handleMintSuccess"
                    @error="handleError"
                  />
                </div>
              </div>
            </div>

            <!-- 有儲值卡的情況 -->
            <div v-else>
              <!-- 儲值卡概覽 -->
              <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                <!-- 儲值卡資訊 -->
                <div class="lg:col-span-2">
                  <div class="bg-white rounded-3xl shadow-2xl p-8 relative overflow-hidden group">
                    <!-- 背景光效 -->
                    <div class="absolute inset-0 bg-gradient-to-br from-amber-50/30 to-orange-50/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    
                    <div class="relative z-10">
                      <div class="flex items-center justify-between mb-8">
                        <h3 class="text-2xl font-bold text-gray-900">我的儲值卡</h3>
                        <button @click="refreshCards" class="btn-secondary-sm group">
                          <svg class="w-4 h-4 group-hover:rotate-180 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                          </svg>
                          刷新
                        </button>
                      </div>
                      
                      <div v-for="card in userCards" :key="card.tokenId" class="card-item-enhanced">
                        <div class="flex items-center justify-between">
                          <div class="flex items-center gap-6">
                            <div class="w-20 h-20 bg-gradient-to-br from-amber-400 to-orange-500 rounded-3xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                              <svg class="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
                              </svg>
                            </div>
                            <div>
                              <h4 class="text-2xl font-bold text-gray-900 mb-2">GasPass #{{ card.tokenId }}</h4>
                              <p class="text-lg text-gray-600 mb-1">餘額: {{ card.balance }} USDC</p>
                              <p class="text-sm text-gray-500">最後更新: {{ card.lastUpdate }}</p>
                            </div>
                          </div>
                          <div class="text-right">
                            <div class="text-3xl font-bold text-gray-900 mb-1">{{ card.balance }} USDC</div>
                            <div class="text-sm text-gray-500">可用餘額</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- 快速儲值 -->
                <div class="bg-white rounded-3xl shadow-2xl p-8 relative overflow-hidden group">
                  <!-- 背景光效 -->
                  <div class="absolute inset-0 bg-gradient-to-br from-blue-50/30 to-cyan-50/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  
                  <div class="relative z-10">
                    <h4 class="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                      <svg class="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
                      </svg>
                      快速儲值
                    </h4>
                    <CuteGasJar 
                      :isFirstTime="false"
                      :existingCard="userCards[0]"
                      @success="handleDepositSuccess"
                      @error="handleError"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 下半部分：Gas 兌換管理 -->
          <div class="bg-white rounded-3xl shadow-2xl p-8 relative overflow-hidden">
            <!-- 背景裝飾 -->
            <div class="absolute inset-0 bg-gradient-to-br from-gray-50/50 to-gray-100/50"></div>
            <div class="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-amber-200/20 to-orange-200/20 rounded-full -translate-y-16 translate-x-16"></div>
            
            <div class="relative z-10">
              <!-- 切換標籤 -->
              <div class="flex justify-center mb-8">
                <div class="bg-gray-100 rounded-2xl p-1 inline-flex">
                  <button 
                    @click="activeTab = 'manual'"
                    class="px-6 py-3 rounded-xl font-semibold transition-all duration-300 relative"
                    :class="activeTab === 'manual' 
                      ? 'bg-white text-gray-900 shadow-lg' 
                      : 'text-gray-600 hover:text-gray-900'"
                  >
                    <span class="relative z-10 flex items-center gap-2">
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                      </svg>
                      手動兌換
                    </span>
                  </button>
                  <button 
                    @click="activeTab = 'agent'"
                    class="px-6 py-3 rounded-xl font-semibold transition-all duration-300 relative"
                    :class="activeTab === 'agent' 
                      ? 'bg-white text-gray-900 shadow-lg' 
                      : 'text-gray-600 hover:text-gray-900'"
                  >
                    <span class="relative z-10 flex items-center gap-2">
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
                      </svg>
                      Agent 自動監測
                    </span>
                  </button>
                </div>
              </div>

              <!-- 手動兌換 Gas -->
              <div v-if="activeTab === 'manual'" class="space-y-6">
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <!-- 兌換設定 -->
                  <div class="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-6 border border-blue-200">
                    <h4 class="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                      <svg class="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                      </svg>
                      手動兌換設定
                    </h4>
                    
                    <div class="space-y-4">
                      <div>
                        <label class="block text-sm font-semibold text-gray-700 mb-2">選擇目標鏈</label>
                        <select v-model="manualRefuel.chainId" class="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-blue-400 focus:outline-none transition-colors">
                          <option value="1">Ethereum Mainnet</option>
                          <option value="42161">Arbitrum One</option>
                          <option value="10">Optimism</option>
                          <option value="137">Polygon</option>
                          <option value="8453">Base</option>
                        </select>
                      </div>
                      
                      <div>
                        <label class="block text-sm font-semibold text-gray-700 mb-2">兌換金額 (USDC)</label>
                        <input 
                          v-model="manualRefuel.amount"
                          type="number"
                          step="0.01"
                          min="1"
                          placeholder="輸入兌換金額"
                          class="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-blue-400 focus:outline-none transition-colors"
                        />
                      </div>
                      
                      <div>
                        <label class="block text-sm font-semibold text-gray-700 mb-2">接收地址</label>
                        <input 
                          v-model="manualRefuel.recipient"
                          type="text"
                          placeholder="輸入接收地址"
                          class="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-blue-400 focus:outline-none transition-colors"
                        />
                      </div>
                    </div>
                    
                    <button 
                      @click="executeManualRefuel"
                      :disabled="!canExecuteManualRefuel"
                      class="w-full mt-6 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 disabled:from-gray-300 disabled:to-gray-400 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 disabled:cursor-not-allowed"
                    >
                      立即兌換 Gas
                    </button>
                  </div>
                  
                  <!-- 兌換預覽 -->
                  <div class="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-6 border border-amber-200">
                    <h4 class="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                      <svg class="w-6 h-6 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                      兌換預覽
                    </h4>
                    
                    <div class="space-y-4">
                      <div class="flex justify-between items-center py-2 border-b border-amber-200">
                        <span class="text-gray-600">兌換金額:</span>
                        <span class="font-semibold text-gray-900">{{ manualRefuel.amount || '0' }} USDC</span>
                      </div>
                      <div class="flex justify-between items-center py-2 border-b border-amber-200">
                        <span class="text-gray-600">目標鏈:</span>
                        <span class="font-semibold text-gray-900">{{ getChainName(manualRefuel.chainId) }}</span>
                      </div>
                      <div class="flex justify-between items-center py-2 border-b border-amber-200">
                        <span class="text-gray-600">手續費:</span>
                        <span class="font-semibold text-gray-900">0.5%</span>
                      </div>
                      <div class="flex justify-between items-center py-2">
                        <span class="text-gray-600">實際到賬:</span>
                        <span class="font-bold text-amber-600">{{ calculateActualAmount(manualRefuel.amount) }} USDC</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Agent 自動監測 -->
              <div v-else class="space-y-6">
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <!-- Agent 設定 -->
                  <div class="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-200">
                    <h4 class="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                      <svg class="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
                      </svg>
                      Agent 自動監測設定
                    </h4>
                    
                    <div class="space-y-4">
                      <div>
                        <label class="block text-sm font-semibold text-gray-700 mb-2">監測鏈</label>
                        <select v-model="agentRefuel.chainId" class="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-green-400 focus:outline-none transition-colors">
                          <option value="1">Ethereum Mainnet</option>
                          <option value="42161">Arbitrum One</option>
                          <option value="10">Optimism</option>
                          <option value="137">Polygon</option>
                          <option value="8453">Base</option>
                        </select>
                      </div>
                      
                      <div>
                        <label class="block text-sm font-semibold text-gray-700 mb-2">觸發閾值 (ETH)</label>
                        <input 
                          v-model="agentRefuel.threshold"
                          type="number"
                          step="0.001"
                          min="0.001"
                          placeholder="當餘額低於此值時觸發"
                          class="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-green-400 focus:outline-none transition-colors"
                        />
                      </div>
                      
                      <div>
                        <label class="block text-sm font-semibold text-gray-700 mb-2">補充金額 (USDC)</label>
                        <input 
                          v-model="agentRefuel.amount"
                          type="number"
                          step="0.01"
                          min="1"
                          placeholder="每次補充的金額"
                          class="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-green-400 focus:outline-none transition-colors"
                        />
                      </div>
                      
                      <div>
                        <label class="block text-sm font-semibold text-gray-700 mb-2">接收地址</label>
                        <input 
                          v-model="agentRefuel.recipient"
                          type="text"
                          placeholder="輸入接收地址"
                          class="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-green-400 focus:outline-none transition-colors"
                        />
                      </div>
                    </div>
                    
                    <button 
                      @click="setupAgentRefuel"
                      :disabled="!canSetupAgentRefuel"
                      class="w-full mt-6 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 disabled:from-gray-300 disabled:to-gray-400 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 disabled:cursor-not-allowed"
                    >
                      設定 Agent 監測
                    </button>
                  </div>
                  
                  <!-- Agent 狀態 -->
                  <div class="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl p-6 border border-purple-200">
                    <h4 class="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                      <svg class="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                      Agent 狀態
                    </h4>
                    
                    <div class="space-y-4">
                      <div class="flex items-center justify-between">
                        <span class="text-gray-600">監測狀態:</span>
                        <span class="px-3 py-1 rounded-full text-sm font-semibold" :class="agentStatus.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'">
                          {{ agentStatus.active ? '運行中' : '未啟動' }}
                        </span>
                      </div>
                      <div class="flex items-center justify-between">
                        <span class="text-gray-600">監測鏈:</span>
                        <span class="font-semibold text-gray-900">{{ getChainName(agentRefuel.chainId) }}</span>
                      </div>
                      <div class="flex items-center justify-between">
                        <span class="text-gray-600">觸發閾值:</span>
                        <span class="font-semibold text-gray-900">{{ agentRefuel.threshold || '0' }} ETH</span>
                      </div>
                      <div class="flex items-center justify-between">
                        <span class="text-gray-600">補充金額:</span>
                        <span class="font-semibold text-gray-900">{{ agentRefuel.amount || '0' }} USDC</span>
                      </div>
                      <div class="flex items-center justify-between">
                        <span class="text-gray-600">最後檢查:</span>
                        <span class="font-semibold text-gray-900">{{ agentStatus.lastCheck || '從未檢查' }}</span>
                      </div>
                    </div>
                    
                    <div v-if="agentStatus.active" class="mt-6 p-4 bg-green-100 rounded-xl">
                      <div class="flex items-center gap-2 text-green-800">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                        <span class="font-semibold">Agent 正在監測您的錢包餘額</span>
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

// 新增：Tab 切換
const activeTab = ref('manual')

// 新增：手動兌換設定
const manualRefuel = ref({
  chainId: '42161', // 預設 Arbitrum
  amount: '',
  recipient: ''
})

// 新增：Agent 自動監測設定
const agentRefuel = ref({
  chainId: '42161', // 預設 Arbitrum
  threshold: '',
  amount: '',
  recipient: ''
})

// 新增：Agent 狀態
const agentStatus = ref({
  active: false,
  lastCheck: null
})

// Computed
const hasCard = computed(() => userCards.value.length > 0)

// 手動兌換驗證
const canExecuteManualRefuel = computed(() => {
  return manualRefuel.value.amount && 
         parseFloat(manualRefuel.value.amount) > 0 &&
         manualRefuel.value.recipient &&
         hasCard.value
})

// Agent 設定驗證
const canSetupAgentRefuel = computed(() => {
  return agentRefuel.value.threshold && 
         parseFloat(agentRefuel.value.threshold) > 0 &&
         agentRefuel.value.amount && 
         parseFloat(agentRefuel.value.amount) > 0 &&
         agentRefuel.value.recipient &&
         hasCard.value
})

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
    
    // 載入 Agent 狀態
    await loadAgentStatus()
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

// 新增：鏈名稱映射
const getChainName = (chainId) => {
  const chainMap = {
    '1': 'Ethereum Mainnet',
    '42161': 'Arbitrum One',
    '10': 'Optimism',
    '137': 'Polygon',
    '8453': 'Base'
  }
  return chainMap[chainId] || 'Unknown Chain'
}

// 新增：計算實際到賬金額
const calculateActualAmount = (amount) => {
  if (!amount) return '0.00'
  const fee = parseFloat(amount) * 0.005 // 0.5% 手續費
  return (parseFloat(amount) - fee).toFixed(2)
}

// 新增：執行手動兌換
const executeManualRefuel = async () => {
  if (!canExecuteManualRefuel.value) return
  
  try {
    // 這裡會串接 Bounce swap 工具
    console.log('執行手動兌換:', manualRefuel.value)
    
    // 模擬 API 調用
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // 成功後重置表單
    manualRefuel.value = {
      chainId: '42161',
      amount: '',
      recipient: ''
    }
    
    // 顯示成功訊息
    alert('Gas 兌換成功！')
    
  } catch (error) {
    console.error('Manual refuel failed:', error)
    alert('兌換失敗: ' + error.message)
  }
}

// 新增：設定 Agent 監測
const setupAgentRefuel = async () => {
  if (!canSetupAgentRefuel.value) return
  
  try {
    // 這裡會設定 Agent 監測策略
    console.log('設定 Agent 監測:', agentRefuel.value)
    
    // 模擬 API 調用
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // 更新 Agent 狀態
    agentStatus.value = {
      active: true,
      lastCheck: new Date().toLocaleString('zh-TW')
    }
    
    // 顯示成功訊息
    alert('Agent 監測設定成功！')
    
  } catch (error) {
    console.error('Agent setup failed:', error)
    alert('設定失敗: ' + error.message)
  }
}

// 新增：載入 Agent 狀態
const loadAgentStatus = async () => {
  try {
    // 這裡會從後端載入 Agent 狀態
    // 暫時使用模擬數據
    agentStatus.value = {
      active: false,
      lastCheck: null
    }
  } catch (error) {
    console.error('Failed to load agent status:', error)
  }
}

// Lifecycle
onMounted(() => {
  if (isConnected.value) {
    loadUserData()
  }
  
  // 預設填入當前錢包地址
  if (account.value) {
    manualRefuel.value.recipient = account.value
    agentRefuel.value.recipient = account.value
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

.card-item-enhanced {
  @apply border border-gray-200 rounded-2xl p-6 mb-6 hover:shadow-lg transition-all duration-300 bg-white/50 backdrop-blur-sm;
}

.transaction-item {
  @apply border-b border-gray-100 py-4 last:border-b-0;
}

/* 新增：Tab 切換動畫 */
.tab-transition-enter-active,
.tab-transition-leave-active {
  transition: all 0.3s ease;
}

.tab-transition-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.tab-transition-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* 新增：表單輸入樣式增強 */
input:focus,
select:focus {
  @apply ring-2 ring-blue-500/20 border-blue-400;
}

/* 新增：按鈕懸停效果增強 */
button:not(:disabled):hover {
  transform: translateY(-1px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}

button:not(:disabled):active {
  transform: translateY(0);
}

/* 新增：卡片懸停效果 */
.card-item-enhanced:hover {
  transform: translateY(-2px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
}

/* 新增：漸變背景動畫 */
@keyframes gradient-shift {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

.bg-gradient-animated {
  background-size: 200% 200%;
  animation: gradient-shift 3s ease infinite;
}

/* 新增：光效動畫 */
@keyframes glow-pulse {
  0%, 100% { box-shadow: 0 0 20px rgba(245, 158, 11, 0.3); }
  50% { box-shadow: 0 0 40px rgba(245, 158, 11, 0.6); }
}

.glow-pulse {
  animation: glow-pulse 2s ease-in-out infinite;
}

/* 新增：載入動畫 */
@keyframes loading-dots {
  0%, 20% { opacity: 0; }
  50% { opacity: 1; }
  80%, 100% { opacity: 0; }
}

.loading-dot {
  animation: loading-dots 1.4s infinite;
}

.loading-dot:nth-child(2) {
  animation-delay: 0.2s;
}

.loading-dot:nth-child(3) {
  animation-delay: 0.4s;
}

/* 新增：響應式設計增強 */
@media (max-width: 768px) {
  .card-item-enhanced {
    @apply p-4;
  }
  
  .grid-cols-1.lg\\:grid-cols-2 {
    @apply gap-4;
  }
}

/* 新增：深色模式支持（預留） */
@media (prefers-color-scheme: dark) {
  .card-item-enhanced {
    @apply bg-gray-800/50 border-gray-700;
  }
}
</style>
