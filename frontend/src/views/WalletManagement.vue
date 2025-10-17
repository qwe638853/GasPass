<template>
  <Layout>
    <div class="min-h-screen bg-gaspass-gray-100 py-8">
      <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <!-- Header -->
        <div class="mb-8">
          <h1 class="text-3xl font-bold text-gaspass-gray-800 mb-4">
            💰 儲值管理
          </h1>
          <p class="text-xl text-gaspass-gray-600">
            管理您的 GasPass 儲值卡，查看餘額與交易記錄
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
              <p class="text-gaspass-yellow-700">需要連接錢包才能查看儲值卡資訊</p>
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
            <p class="text-gaspass-gray-600">載入儲值卡資料中...</p>
          </div>
        </div>

        <!-- No Cards State -->
        <div v-else-if="userCards.length === 0" class="text-center py-20">
          <div class="mb-8">
            <div class="empty-jar mx-auto mb-6">🏺</div>
            <h2 class="text-2xl font-bold text-gaspass-gray-800 mb-4">
              還沒有任何儲值卡
            </h2>
            <p class="text-gaspass-gray-600 mb-8">
              前往首頁創建您的第一個 GasPass 儲值卡吧！
            </p>
            <router-link to="/" class="btn-primary">
              🏠 返回首頁
            </router-link>
          </div>
        </div>

        <!-- Cards Grid -->
        <div v-else>
          <!-- Summary Cards -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div class="summary-card">
              <div class="summary-icon total">💰</div>
              <div class="summary-content">
                <div class="summary-value">${{ totalBalance }}</div>
                <div class="summary-label">總餘額</div>
              </div>
            </div>
            
            <div class="summary-card">
              <div class="summary-icon cards">🎫</div>
              <div class="summary-content">
                <div class="summary-value">{{ userCards.length }}</div>
                <div class="summary-label">儲值卡數量</div>
              </div>
            </div>
            
            <div class="summary-card">
              <div class="summary-icon policies">🤖</div>
              <div class="summary-content">
                <div class="summary-value">{{ totalActivePolicies }}</div>
                <div class="summary-label">活躍策略</div>
              </div>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="flex flex-wrap gap-4 mb-8">
            <button @click="showDepositModal = true" class="action-btn deposit">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
              </svg>
              💰 充值儲值卡
            </button>
            
            <button @click="showTransferModal = true" class="action-btn transfer">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16l-4-4m0 0l4-4m-4 4h18"></path>
              </svg>
              🔄 轉移餘額
            </button>
            
            <button @click="exportData" class="action-btn export">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
              📊 匯出數據
            </button>
          </div>

          <!-- Cards List -->
          <div class="space-y-6">
            <div 
              v-for="card in userCards" 
              :key="card.tokenId"
              class="card-container"
            >
              <!-- Card Header -->
              <div class="card-header">
                <div class="card-info">
                  <div class="card-title-row">
                    <h3 class="card-title">🎫 GasPass #{{ card.tokenId }}</h3>
                    <div class="card-balance">${{ card.balance }} USDC</div>
                  </div>
                  <div class="card-meta">
                    <span class="card-date">創建於 {{ formatDate(card.createdAt) }}</span>
                    <span class="card-update">最後更新: {{ card.lastUpdate }}</span>
                  </div>
                </div>
                <div class="card-actions">
                  <button @click="toggleCardDetails(card.tokenId)" class="toggle-btn">
                    <svg 
                      class="w-5 h-5 transition-transform"
                      :class="{ 'rotate-180': expandedCards.has(card.tokenId) }"
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                    </svg>
                  </button>
                </div>
              </div>

              <!-- Card Details (Expandable) -->
              <div v-if="expandedCards.has(card.tokenId)" class="card-details">
                <div class="details-tabs">
                  <button 
                    v-for="tab in detailTabs" 
                    :key="tab.id"
                    @click="activeTab = tab.id"
                    class="tab-btn"
                    :class="{ 'active': activeTab === tab.id }"
                  >
                    {{ tab.icon }} {{ tab.label }}
                  </button>
                </div>

                <!-- Transaction History Tab -->
                <div v-if="activeTab === 'history'" class="tab-content">
                  <div v-if="getCardTransactions(card.tokenId).length === 0" class="empty-transactions">
                    <div class="empty-icon">📄</div>
                    <p class="empty-text">尚無交易記錄</p>
                  </div>
                  <div v-else class="transaction-list">
                    <div 
                      v-for="tx in getCardTransactions(card.tokenId)" 
                      :key="tx.id"
                      class="transaction-item"
                    >
                      <div class="tx-icon" :class="getTxTypeClass(tx.type)">
                        {{ getTxIcon(tx.type) }}
                      </div>
                      <div class="tx-content">
                        <div class="tx-title">{{ tx.type }}</div>
                        <div class="tx-description">{{ getTxDescription(tx) }}</div>
                      </div>
                      <div class="tx-meta">
                        <div class="tx-amount" :class="getTxAmountClass(tx.type)">
                          {{ getTxAmount(tx) }}
                        </div>
                        <div class="tx-time">{{ tx.timestamp }}</div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Policies Tab -->
                <div v-if="activeTab === 'policies'" class="tab-content">
                  <div v-if="getCardPolicies(card.tokenId).length === 0" class="empty-policies">
                    <div class="empty-icon">🤖</div>
                    <p class="empty-text">尚無自動補充策略</p>
                    <button @click="openAgentSettings(card)" class="btn-secondary">
                      設定 AI Agent
                    </button>
                  </div>
                  <div v-else class="policies-list">
                    <div 
                      v-for="policy in getCardPolicies(card.tokenId)" 
                      :key="policy.id"
                      class="policy-item"
                      :class="{ 'active': policy.status === 'active' }"
                    >
                      <div class="policy-chain">
                        <span class="chain-icon">{{ getChainIcon(policy.chainId) }}</span>
                        <div>
                          <div class="chain-name">{{ policy.chainName }}</div>
                          <div class="chain-symbol">{{ policy.symbol }}</div>
                        </div>
                      </div>
                      <div class="policy-config">
                        <div class="config-item">
                          <span class="config-label">閾值:</span>
                          <span class="config-value">{{ policy.threshold }} {{ policy.symbol }}</span>
                        </div>
                        <div class="config-item">
                          <span class="config-label">補充:</span>
                          <span class="config-value">{{ policy.gasAmount }} {{ policy.symbol }}</span>
                        </div>
                      </div>
                      <div class="policy-status">
                        <span class="status-badge" :class="policy.status">
                          {{ policy.status === 'active' ? '運行中' : '已停用' }}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Analytics Tab -->
                <div v-if="activeTab === 'analytics'" class="tab-content">
                  <div class="analytics-grid">
                    <div class="analytics-card">
                      <div class="analytics-title">使用統計</div>
                      <div class="analytics-stats">
                        <div class="stat">
                          <span class="stat-number">{{ getCardUsageStats(card.tokenId).totalTransactions }}</span>
                          <span class="stat-label">總交易數</span>
                        </div>
                        <div class="stat">
                          <span class="stat-number">${{ getCardUsageStats(card.tokenId).totalSpent }}</span>
                          <span class="stat-label">總支出</span>
                        </div>
                      </div>
                    </div>
                    
                    <div class="analytics-card">
                      <div class="analytics-title">本月活動</div>
                      <div class="analytics-stats">
                        <div class="stat">
                          <span class="stat-number">{{ getCardUsageStats(card.tokenId).monthlyTransactions }}</span>
                          <span class="stat-label">交易次數</span>
                        </div>
                        <div class="stat">
                          <span class="stat-number">${{ getCardUsageStats(card.tokenId).monthlySpent }}</span>
                          <span class="stat-label">支出金額</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Card Actions -->
                <div class="card-action-bar">
                  <button @click="depositToCard(card)" class="card-action-btn deposit">
                    💰 充值
                  </button>
                  <button @click="manualRefuel(card)" class="card-action-btn refuel">
                    ⚡ 補 Gas
                  </button>
                  <button @click="openAgentSettings(card)" class="card-action-btn agent">
                    🤖 AI 設定
                  </button>
                  <button @click="viewCardDetails(card)" class="card-action-btn details">
                    📊 詳情
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Modals -->
        <DepositModal 
          v-if="showDepositModal"
          :cards="userCards"
          @close="showDepositModal = false"
          @success="handleDepositSuccess"
        />

        <TransferModal 
          v-if="showTransferModal"
          :cards="userCards"
          @close="showTransferModal = false"
          @success="handleTransferSuccess"
        />

        <ManualRefuelModal 
          v-if="showRefuelModal"
          :selected-card="selectedCard"
          @close="showRefuelModal = false"
          @success="handleRefuelSuccess"
        />

        <AgentSettingsModal 
          v-if="showAgentModal"
          :selected-card="selectedCard"
          @close="showAgentModal = false"
          @success="handleAgentSuccess"
        />
      </div>
    </div>
  </Layout>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import Layout from '../components/Layout.vue'
import DepositModal from '../components/DepositModal.vue'
import TransferModal from '../components/TransferModal.vue'
import ManualRefuelModal from '../components/ManualRefuelModal.vue'
import AgentSettingsModal from '../components/AgentSettingsModal.vue'
import { useWeb3 } from '../composables/useWeb3.js'
import { gasPassService } from '../services/gasPassService.js'
import { supportedChains } from '../utils/mockData.js'

const { account, chainId, isConnected, isArbitrum, switchToArbitrum } = useWeb3()

// Data
const isLoading = ref(false)
const userCards = ref([])
const transactionHistory = ref([])
const policies = ref([])
const expandedCards = ref(new Set())
const activeTab = ref('history')
const showDepositModal = ref(false)
const showTransferModal = ref(false)
const showRefuelModal = ref(false)
const showAgentModal = ref(false)
const selectedCard = ref(null)

const detailTabs = [
  { id: 'history', label: '交易記錄', icon: '📄' },
  { id: 'policies', label: 'AI 策略', icon: '🤖' },
  { id: 'analytics', label: '使用分析', icon: '📊' }
]

// Computed
const totalBalance = computed(() => {
  return userCards.value.reduce((sum, card) => sum + parseFloat(card.balance), 0).toFixed(2)
})

const totalActivePolicies = computed(() => {
  return policies.value.filter(p => p.status === 'active').length
})

// Methods
const loadUserData = async () => {
  if (!account.value) return
  
  isLoading.value = true
  
  try {
    userCards.value = await gasPassService.getUserCards(account.value)
    transactionHistory.value = await gasPassService.getTransactionHistory()
    
    // 載入每張卡的策略
    for (const card of userCards.value) {
      const cardPolicies = await gasPassService.getRefuelPolicies(card.tokenId)
      policies.value.push(...cardPolicies)
    }
  } catch (error) {
    console.error('Failed to load user data:', error)
  } finally {
    isLoading.value = false
  }
}

const toggleCardDetails = (tokenId) => {
  if (expandedCards.value.has(tokenId)) {
    expandedCards.value.delete(tokenId)
  } else {
    expandedCards.value.add(tokenId)
  }
}

const getCardTransactions = (tokenId) => {
  return transactionHistory.value.filter(tx => 
    tx.tokenId === tokenId || 
    (tx.type === '鑄造儲值卡' && tx.tokenId === tokenId)
  )
}

const getCardPolicies = (tokenId) => {
  return policies.value.filter(p => p.tokenId === tokenId)
}

const getCardUsageStats = (tokenId) => {
  const cardTxs = getCardTransactions(tokenId)
  const totalTransactions = cardTxs.length
  const totalSpent = cardTxs
    .filter(tx => tx.cost)
    .reduce((sum, tx) => sum + parseFloat(tx.cost), 0)
    .toFixed(2)
  
  const thisMonth = new Date().getMonth()
  const monthlyTxs = cardTxs.filter(tx => {
    const txDate = new Date(tx.timestamp)
    return txDate.getMonth() === thisMonth
  })
  
  return {
    totalTransactions,
    totalSpent,
    monthlyTransactions: monthlyTxs.length,
    monthlySpent: monthlyTxs
      .filter(tx => tx.cost)
      .reduce((sum, tx) => sum + parseFloat(tx.cost), 0)
      .toFixed(2)
  }
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('zh-TW')
}

const getTxIcon = (type) => {
  const icons = {
    '鑄造儲值卡': '🎫',
    '儲值': '💰',
    '手動補 Gas': '⚡',
    'Agent 設定更新': '🤖'
  }
  return icons[type] || '📄'
}

const getTxTypeClass = (type) => {
  const classes = {
    '鑄造儲值卡': 'mint',
    '儲值': 'deposit',
    '手動補 Gas': 'refuel',
    'Agent 設定更新': 'agent'
  }
  return classes[type] || 'default'
}

const getTxDescription = (tx) => {
  if (tx.description) return tx.description
  if (tx.chainId) return `目標鏈: ${getChainName(tx.chainId)}`
  return ''
}

const getTxAmount = (tx) => {
  if (tx.cost) return `-$${tx.cost}`
  if (tx.amount) return `+$${tx.amount}`
  return ''
}

const getTxAmountClass = (type) => {
  return type === '儲值' ? 'positive' : 'negative'
}

const getChainName = (chainId) => {
  const chain = supportedChains.find(c => c.id === chainId)
  return chain ? chain.name : `Chain ${chainId}`
}

const getChainIcon = (chainId) => {
  const chain = supportedChains.find(c => c.id === chainId)
  return chain ? chain.icon : '🔗'
}

const depositToCard = (card) => {
  selectedCard.value = card
  showDepositModal.value = true
}

const manualRefuel = (card) => {
  selectedCard.value = card
  showRefuelModal.value = true
}

const openAgentSettings = (card) => {
  selectedCard.value = card
  showAgentModal.value = true
}

const viewCardDetails = (card) => {
  // 可以導航到詳細頁面或顯示詳細模態框
  console.log('View details for card:', card.tokenId)
}

const exportData = () => {
  const data = {
    cards: userCards.value,
    transactions: transactionHistory.value,
    policies: policies.value,
    exportDate: new Date().toISOString()
  }
  
  const dataStr = JSON.stringify(data, null, 2)
  const dataBlob = new Blob([dataStr], { type: 'application/json' })
  const url = URL.createObjectURL(dataBlob)
  
  const link = document.createElement('a')
  link.href = url
  link.download = `gaspass-data-${new Date().toISOString().split('T')[0]}.json`
  link.click()
  
  URL.revokeObjectURL(url)
}

const handleDepositSuccess = () => {
  showDepositModal.value = false
  loadUserData()
}

const handleTransferSuccess = () => {
  showTransferModal.value = false
  loadUserData()
}

const handleRefuelSuccess = () => {
  showRefuelModal.value = false
  loadUserData()
}

const handleAgentSuccess = () => {
  showAgentModal.value = false
  loadUserData()
}

// Lifecycle
onMounted(() => {
  if (isConnected.value && isArbitrum.value) {
    loadUserData()
  }
})

// Watch for connection changes
watch([isConnected, isArbitrum], ([connected, arbitrum]) => {
  if (connected && arbitrum) {
    loadUserData()
  }
})
</script>

<style scoped>
.btn-primary {
  @apply bg-gaspass-yellow-400 hover:bg-gaspass-yellow-500 text-gaspass-gray-800 font-semibold py-2 px-4 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-gaspass-yellow-400 focus:ring-offset-2;
}

.btn-secondary {
  @apply bg-gaspass-gray-200 hover:bg-gaspass-gray-300 text-gaspass-gray-800 font-semibold py-2 px-4 rounded-lg transition-colors;
}

.loading-spinner {
  @apply w-8 h-8 border-4 border-gaspass-gray-200 border-t-gaspass-yellow-400 rounded-full animate-spin;
}

.empty-jar {
  @apply text-8xl mb-4;
}

.summary-card {
  @apply bg-white rounded-xl shadow-sm border border-gaspass-gray-200 p-6 flex items-center gap-4;
}

.summary-icon {
  @apply w-12 h-12 rounded-full flex items-center justify-center text-2xl;
}

.summary-icon.total {
  @apply bg-gaspass-yellow-100;
}

.summary-icon.cards {
  @apply bg-blue-100;
}

.summary-icon.policies {
  @apply bg-green-100;
}

.summary-value {
  @apply text-2xl font-bold text-gaspass-gray-800;
}

.summary-label {
  @apply text-sm text-gaspass-gray-600;
}

.action-btn {
  @apply flex items-center gap-2 px-4 py-3 rounded-lg font-semibold transition-all hover:scale-105;
}

.action-btn.deposit {
  @apply bg-gaspass-yellow-400 hover:bg-gaspass-yellow-500 text-gaspass-gray-800;
}

.action-btn.transfer {
  @apply bg-blue-500 hover:bg-blue-600 text-white;
}

.action-btn.export {
  @apply bg-gaspass-gray-500 hover:bg-gaspass-gray-600 text-white;
}

.card-container {
  @apply bg-white rounded-xl shadow-sm border border-gaspass-gray-200 overflow-hidden;
}

.card-header {
  @apply flex items-center justify-between p-6 border-b border-gaspass-gray-100;
}

.card-title-row {
  @apply flex items-center justify-between mb-2;
}

.card-title {
  @apply text-xl font-bold text-gaspass-gray-800;
}

.card-balance {
  @apply text-2xl font-bold text-gaspass-yellow-600;
}

.card-meta {
  @apply flex gap-4 text-sm text-gaspass-gray-600;
}

.toggle-btn {
  @apply p-2 text-gaspass-gray-400 hover:text-gaspass-gray-600 transition-colors;
}

.card-details {
  @apply border-t border-gaspass-gray-100;
}

.details-tabs {
  @apply flex border-b border-gaspass-gray-100;
}

.tab-btn {
  @apply px-6 py-4 text-sm font-medium border-b-2 border-transparent hover:text-gaspass-yellow-600 hover:border-gaspass-yellow-200 transition-colors;
}

.tab-btn.active {
  @apply text-gaspass-yellow-600 border-gaspass-yellow-400;
}

.tab-content {
  @apply p-6;
}

.empty-transactions, .empty-policies {
  @apply text-center py-8;
}

.empty-icon {
  @apply text-4xl mb-4;
}

.empty-text {
  @apply text-gaspass-gray-600 mb-4;
}

.transaction-list, .policies-list {
  @apply space-y-3;
}

.transaction-item {
  @apply flex items-center gap-4 p-4 bg-gaspass-gray-50 rounded-lg;
}

.tx-icon {
  @apply w-10 h-10 rounded-full flex items-center justify-center text-lg;
}

.tx-icon.mint {
  @apply bg-blue-100;
}

.tx-icon.deposit {
  @apply bg-green-100;
}

.tx-icon.refuel {
  @apply bg-gaspass-yellow-100;
}

.tx-icon.agent {
  @apply bg-purple-100;
}

.tx-icon.default {
  @apply bg-gaspass-gray-100;
}

.tx-content {
  @apply flex-1;
}

.tx-title {
  @apply font-semibold text-gaspass-gray-800;
}

.tx-description {
  @apply text-sm text-gaspass-gray-600;
}

.tx-meta {
  @apply text-right;
}

.tx-amount {
  @apply font-semibold;
}

.tx-amount.positive {
  @apply text-green-600;
}

.tx-amount.negative {
  @apply text-red-600;
}

.tx-time {
  @apply text-xs text-gaspass-gray-500;
}

.policy-item {
  @apply flex items-center gap-4 p-4 border-2 border-gaspass-gray-200 rounded-lg;
}

.policy-item.active {
  @apply border-gaspass-yellow-400 bg-gaspass-yellow-50;
}

.policy-chain {
  @apply flex items-center gap-3;
}

.chain-icon {
  @apply text-2xl;
}

.chain-name {
  @apply font-semibold text-gaspass-gray-800;
}

.chain-symbol {
  @apply text-sm text-gaspass-gray-600;
}

.policy-config {
  @apply flex-1 space-y-1;
}

.config-item {
  @apply flex justify-between text-sm;
}

.config-label {
  @apply text-gaspass-gray-600;
}

.config-value {
  @apply font-medium text-gaspass-gray-800;
}

.policy-status {
  @apply flex-shrink-0;
}

.status-badge {
  @apply px-3 py-1 rounded-full text-xs font-medium;
}

.status-badge.active {
  @apply bg-green-100 text-green-800;
}

.status-badge.inactive {
  @apply bg-gaspass-gray-100 text-gaspass-gray-600;
}

.analytics-grid {
  @apply grid grid-cols-1 md:grid-cols-2 gap-6;
}

.analytics-card {
  @apply bg-gaspass-gray-50 rounded-lg p-6 border border-gaspass-gray-200;
}

.analytics-title {
  @apply font-semibold text-gaspass-gray-800 mb-4;
}

.analytics-stats {
  @apply grid grid-cols-2 gap-4;
}

.stat {
  @apply text-center;
}

.stat-number {
  @apply block text-2xl font-bold text-gaspass-gray-800;
}

.stat-label {
  @apply text-sm text-gaspass-gray-600;
}

.card-action-bar {
  @apply flex flex-wrap gap-3 p-6 bg-gaspass-gray-50 border-t border-gaspass-gray-100;
}

.card-action-btn {
  @apply px-4 py-2 rounded-lg font-medium transition-colors;
}

.card-action-btn.deposit {
  @apply bg-gaspass-yellow-400 hover:bg-gaspass-yellow-500 text-gaspass-gray-800;
}

.card-action-btn.refuel {
  @apply bg-blue-500 hover:bg-blue-600 text-white;
}

.card-action-btn.agent {
  @apply bg-purple-500 hover:bg-purple-600 text-white;
}

.card-action-btn.details {
  @apply bg-gaspass-gray-200 hover:bg-gaspass-gray-300 text-gaspass-gray-800;
}

</style>