<template>
  <Layout>
    <div class="min-h-screen bg-gaspass-gray-100 py-8">
      <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <!-- Connection Check -->
        <div v-if="!isConnected" class="bg-yellow-50 border-l-4 border-gaspass-yellow-400 p-6 mb-8">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <svg class="w-6 h-6 text-gaspass-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L5.08 15.5c-.77.833.192 2.5 1.732 2.5z"></path>
              </svg>
            </div>
            <div class="ml-3">
              <h3 class="text-lg font-medium text-gaspass-yellow-800">歡迎來到 GasPass！</h3>
              <p class="text-gaspass-yellow-700">請先連接您的錢包開始使用</p>
            </div>
          </div>
        </div>

        <!-- Network Check -->
        <div v-else-if="!isArbitrum" class="bg-red-50 border-l-4 border-red-400 p-6 mb-8">
          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <div class="ml-3">
                <h3 class="text-lg font-medium text-red-800">請切換到 Arbitrum 網路</h3>
                <p class="text-red-700">GasPass 需要在 Arbitrum 上運行</p>
              </div>
            </div>
            <button @click="switchToArbitrum" class="btn-primary">
              切換網路
            </button>
          </div>
        </div>

        <!-- Loading State -->
        <div v-else-if="isLoading" class="flex items-center justify-center py-20">
          <div class="text-center">
            <div class="loading-spinner mx-auto mb-4"></div>
            <p class="text-gaspass-gray-600">檢查您的 GasPass 狀態中...</p>
          </div>
        </div>

        <!-- Main Content -->
        <div v-else>
          <!-- First Time User - Show Cute Gas Jar -->
          <div v-if="!hasGasPassCard" class="text-center">
            <div class="mb-8">
              <h1 class="text-4xl font-bold text-gaspass-gray-800 mb-4">
                🎉 歡迎加入 GasPass 大家庭！
              </h1>
              <p class="text-xl text-gaspass-gray-600">
                讓我們創建您的第一個跨鏈 Gas 儲值罐吧！
              </p>
            </div>
            
            <CuteGasJar 
              :is-first-time="true"
              @success="handleFirstTimeSuccess"
              @error="handleError"
            />
          </div>

          <!-- Existing User - Show Deposit Options -->
          <div v-else>
            <div class="mb-8">
              <h1 class="text-3xl font-bold text-gaspass-gray-800 mb-4">
                🎊 歡迎回來！
              </h1>
              <p class="text-xl text-gaspass-gray-600">
                為您的儲值罐充值，或使用下方的 Gas 管理功能
              </p>
            </div>

            <!-- Deposit Section -->
            <div class="max-w-2xl mx-auto mb-12">
              <CuteGasJar 
                :is-first-time="false"
                :existing-card="selectedCard"
                @success="handleDepositSuccess"
                @error="handleError"
              />
            </div>

            <!-- Gas Management Functions -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <!-- Manual Gas Refuel -->
              <div class="gas-function-card">
                <div class="function-icon manual">
                  <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                  </svg>
                </div>
                
                <h3 class="function-title">⚡ 手動補 Gas</h3>
                <p class="function-description">
                  需要立即補充 Gas？選擇目標區塊鏈，手動補充您需要的 Gas 數量。
                </p>
                
                <div class="function-features">
                  <div class="feature-item">
                    <span class="feature-icon">🎯</span>
                    <span>精確控制</span>
                  </div>
                  <div class="feature-item">
                    <span class="feature-icon">⚡</span>
                    <span>即時到帳</span>
                  </div>
                  <div class="feature-item">
                    <span class="feature-icon">🌍</span>
                    <span>多鏈支援</span>
                  </div>
                </div>
                
                <button @click="openManualRefuel" class="function-btn manual">
                  立即補充 Gas
                </button>
              </div>

              <!-- Agent Gas Refuel -->
              <div class="gas-function-card">
                <div class="function-icon agent">
                  <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
                  </svg>
                </div>
                
                <h3 class="function-title">🤖 AI Agent 智能補充</h3>
                <p class="function-description">
                  設定自動策略，讓 AI Agent 監控您的錢包並智能補充 Gas，完全自動化！
                </p>
                
                <div class="function-features">
                  <div class="feature-item">
                    <span class="feature-icon">🧠</span>
                    <span>智能監控</span>
                  </div>
                  <div class="feature-item">
                    <span class="feature-icon">🔄</span>
                    <span>自動執行</span>
                  </div>
                  <div class="feature-item">
                    <span class="feature-icon">💡</span>
                    <span>策略設定</span>
                  </div>
                </div>
                
                <button @click="openAgentSettings" class="function-btn agent">
                  設定智能補充
                </button>
              </div>
            </div>

            <!-- Recent Activity -->
            <div v-if="recentActivity.length > 0" class="mt-12">
              <h2 class="text-2xl font-bold text-gaspass-gray-800 mb-6">📊 最近活動</h2>
              <div class="bg-white rounded-xl shadow-sm border border-gaspass-gray-200 overflow-hidden">
                <div class="activity-list">
                  <div 
                    v-for="activity in recentActivity.slice(0, 5)" 
                    :key="activity.id"
                    class="activity-item"
                  >
                    <div class="activity-icon" :class="activity.type">
                      <span v-if="activity.type === 'mint'">🎫</span>
                      <span v-else-if="activity.type === 'deposit'">💰</span>
                      <span v-else-if="activity.type === 'refuel'">⚡</span>
                      <span v-else>📄</span>
                    </div>
                    <div class="activity-content">
                      <div class="activity-title">{{ activity.title }}</div>
                      <div class="activity-description">{{ activity.description }}</div>
                    </div>
                    <div class="activity-meta">
                      <div class="activity-amount">{{ activity.amount }}</div>
                      <div class="activity-time">{{ activity.timestamp }}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Manual Refuel Modal -->
        <ManualRefuelModal 
          v-if="showManualRefuel"
          :selected-card="selectedCard"
          @close="showManualRefuel = false"
          @success="handleRefuelSuccess"
        />

        <!-- Agent Settings Modal -->
        <AgentSettingsModal 
          v-if="showAgentSettings"
          :selected-card="selectedCard"
          @close="showAgentSettings = false"
          @success="handleAgentSuccess"
        />
      </div>
    </div>
  </Layout>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import Layout from '../components/Layout.vue'
import CuteGasJar from '../components/CuteGasJar.vue'
import ManualRefuelModal from '../components/ManualRefuelModal.vue'
import AgentSettingsModal from '../components/AgentSettingsModal.vue'
import { useWeb3 } from '../composables/useWeb3.js'
import { gasPassService } from '../services/gasPassService.js'

const { account, chainId, isConnected, isArbitrum, switchToArbitrum } = useWeb3()

// Data
const isLoading = ref(false)
const hasGasPassCard = ref(false)
const userCards = ref([])
const recentActivity = ref([])
const showManualRefuel = ref(false)
const showAgentSettings = ref(false)

// Computed
const selectedCard = computed(() => {
  return userCards.value.length > 0 ? userCards.value[0] : null
})

// Methods
const checkUserStatus = async () => {
  if (!account.value) return
  
  isLoading.value = true
  
  try {
    // 檢查用戶是否有儲值卡
    hasGasPassCard.value = await gasPassService.hasGasPassCard(account.value)
    
    if (hasGasPassCard.value) {
      // 獲取用戶卡片
      userCards.value = await gasPassService.getUserCards(account.value)
      
      // 獲取最近活動
      recentActivity.value = await gasPassService.getTransactionHistory()
    }
  } catch (error) {
    console.error('Failed to check user status:', error)
  } finally {
    isLoading.value = false
  }
}

const handleFirstTimeSuccess = () => {
  hasGasPassCard.value = true
  checkUserStatus() // 重新檢查狀態
}

const handleDepositSuccess = () => {
  checkUserStatus() // 重新獲取資料
}

const handleError = (error) => {
  console.error('Operation failed:', error)
  // 這裡可以顯示錯誤訊息
}

const openManualRefuel = () => {
  showManualRefuel.value = true
}

const openAgentSettings = () => {
  showAgentSettings.value = true
}

const handleRefuelSuccess = () => {
  showManualRefuel.value = false
  checkUserStatus()
}

const handleAgentSuccess = () => {
  showAgentSettings.value = false
  checkUserStatus()
}

// Lifecycle
onMounted(() => {
  if (isConnected.value && isArbitrum.value) {
    checkUserStatus()
  }
})

// Watch for connection changes
watch([isConnected, isArbitrum], ([connected, arbitrum]) => {
  if (connected && arbitrum) {
    checkUserStatus()
  }
})
</script>

<style scoped>
.btn-primary {
  @apply bg-gaspass-yellow-400 hover:bg-gaspass-yellow-500 text-gaspass-gray-800 font-semibold py-2 px-4 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-gaspass-yellow-400 focus:ring-offset-2;
}

.loading-spinner {
  @apply w-8 h-8 border-4 border-gaspass-gray-200 border-t-gaspass-yellow-400 rounded-full animate-spin;
}

.gas-function-card {
  @apply bg-white rounded-xl shadow-sm border border-gaspass-gray-200 p-8 text-center hover:shadow-md transition-all duration-300;
}

.function-icon {
  @apply w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-white;
}

.function-icon.manual {
  @apply bg-gradient-to-br from-gaspass-yellow-400 to-gaspass-yellow-500;
}

.function-icon.agent {
  @apply bg-gradient-to-br from-gaspass-gray-500 to-gaspass-gray-600;
}

.function-title {
  @apply text-xl font-bold text-gaspass-gray-800 mb-3;
}

.function-description {
  @apply text-gaspass-gray-600 mb-4 leading-relaxed;
}

.function-features {
  @apply space-y-2 mb-6;
}

.feature-item {
  @apply flex items-center justify-center gap-2 text-sm text-gaspass-gray-700;
}

.feature-icon {
  @apply text-base;
}

.function-btn {
  @apply w-full py-3 px-6 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105;
}

.function-btn.manual {
  @apply bg-gaspass-yellow-400 hover:bg-gaspass-yellow-500 text-gaspass-gray-800;
}

.function-btn.agent {
  @apply bg-gaspass-gray-500 hover:bg-gaspass-gray-600 text-white;
}

.activity-list {
  @apply divide-y divide-gaspass-gray-100;
}

.activity-item {
  @apply flex items-center p-4 hover:bg-gaspass-gray-50 transition-colors;
}

.activity-icon {
  @apply w-12 h-12 rounded-full flex items-center justify-center text-xl mr-4;
}

.activity-icon.mint {
  @apply bg-blue-100;
}

.activity-icon.deposit {
  @apply bg-green-100;
}

.activity-icon.refuel {
  @apply bg-gaspass-yellow-100;
}

.activity-content {
  @apply flex-1;
}

.activity-title {
  @apply font-semibold text-gaspass-gray-800;
}

.activity-description {
  @apply text-sm text-gaspass-gray-600;
}

.activity-meta {
  @apply text-right;
}

.activity-amount {
  @apply font-semibold text-gaspass-gray-800;
}

.activity-time {
  @apply text-xs text-gaspass-gray-500;
}
</style>