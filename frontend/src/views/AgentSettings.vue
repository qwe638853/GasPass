<template>
  <Layout>
    <div class="min-h-screen bg-gray-50 py-12">
      <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <!-- Header -->
        <div class="text-center mb-12">
          <h1 class="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            AI Agent 智能設定
          </h1>
          <p class="text-lg text-gray-600 max-w-2xl mx-auto">
            整合 Lit Protocol，讓 AI Agent 為您提供更智能的跨鏈 Gas 管理和監控服務
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
              <p class="text-yellow-700">您需要連接 Web3 錢包才能設定 AI Agent</p>
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
          <!-- Agent Status Overview -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div class="agent-status-card">
              <div class="flex items-center justify-between mb-4">
                <h3 class="text-lg font-semibold text-gray-900">Agent 狀態</h3>
                <div class="status-indicator" :class="agentStatus.isActive ? 'active' : 'inactive'">
                  {{ agentStatus.isActive ? '運行中' : '未啟用' }}
                </div>
              </div>
              <div class="space-y-2 text-sm">
                <div class="flex justify-between">
                  <span class="text-gray-600">監控錢包:</span>
                  <span class="text-gray-900">{{ agentStatus.monitoringWallets }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">監控鏈:</span>
                  <span class="text-gray-900">{{ agentStatus.monitoringChains }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">上次檢查:</span>
                  <span class="text-gray-900">{{ agentStatus.lastCheck }}</span>
                </div>
              </div>
            </div>

            <div class="agent-status-card">
              <div class="flex items-center justify-between mb-4">
                <h3 class="text-lg font-semibold text-gray-900">執行統計</h3>
                <svg class="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                </svg>
              </div>
              <div class="space-y-2 text-sm">
                <div class="flex justify-between">
                  <span class="text-gray-600">今日執行:</span>
                  <span class="text-gray-900">{{ agentStats.todayExecutions }} 次</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">總執行:</span>
                  <span class="text-gray-900">{{ agentStats.totalExecutions }} 次</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">成功率:</span>
                  <span class="text-gray-900">{{ agentStats.successRate }}%</span>
                </div>
              </div>
            </div>

            <div class="agent-status-card">
              <div class="flex items-center justify-between mb-4">
                <h3 class="text-lg font-semibold text-gray-900">費用統計</h3>
                <svg class="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
                </svg>
              </div>
              <div class="space-y-2 text-sm">
                <div class="flex justify-between">
                  <span class="text-gray-600">本月費用:</span>
                  <span class="text-gray-900">{{ agentCosts.monthly }} USDC</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">節省費用:</span>
                  <span class="text-green-600">+{{ agentCosts.saved }} USDC</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">平均每次:</span>
                  <span class="text-gray-900">{{ agentCosts.avgPerExecution }} USDC</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Main Configuration -->
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <!-- Left Panel - Agent Configuration -->
            <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
              <div class="flex items-center justify-between mb-6">
                <h3 class="text-2xl font-semibold text-gray-900">Agent 配置</h3>
                <button 
                  @click="toggleAgent"
                  class="toggle-btn"
                  :class="agentStatus.isActive ? 'active' : 'inactive'"
                >
                  <div class="toggle-slider"></div>
                </button>
              </div>

              <form @submit.prevent="saveAgentConfig" class="space-y-6">
                <!-- Monitoring Wallets -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-3">
                    監控錢包地址
                  </label>
                  <div class="space-y-2">
                    <div 
                      v-for="(wallet, index) in agentConfig.monitoringWallets" 
                      :key="index"
                      class="flex items-center space-x-2"
                    >
                      <input 
                        v-model="agentConfig.monitoringWallets[index]"
                        type="text" 
                        placeholder="0x..."
                        class="form-input flex-1"
                      />
                      <button 
                        v-if="agentConfig.monitoringWallets.length > 1"
                        type="button"
                        @click="removeWallet(index)"
                        class="text-red-500 hover:text-red-700"
                      >
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                        </svg>
                      </button>
                    </div>
                    <button 
                      type="button"
                      @click="addWallet"
                      class="btn-secondary w-full"
                    >
                      <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                      </svg>
                      新增錢包地址
                    </button>
                  </div>
                </div>

                <!-- Monitoring Chains -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-3">
                    監控區塊鏈
                  </label>
                  <div class="grid grid-cols-2 gap-3">
                    <div 
                      v-for="chain in availableChains" 
                      :key="chain.id"
                      class="chain-toggle"
                      :class="{ 'selected': agentConfig.monitoringChains.includes(chain.id) }"
                      @click="toggleChain(chain.id)"
                    >
                      <img :src="chain.icon" :alt="chain.name" class="w-6 h-6" />
                      <span class="text-sm font-medium">{{ chain.name }}</span>
                      <svg 
                        v-if="agentConfig.monitoringChains.includes(chain.id)"
                        class="w-4 h-4 text-orange-500" 
                        fill="currentColor" 
                        viewBox="0 0 20 20"
                      >
                        <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                      </svg>
                    </div>
                  </div>
                </div>

                <!-- Check Frequency -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    檢查頻率
                  </label>
                  <select v-model="agentConfig.checkFrequency" class="form-input">
                    <option value="5">每 5 分鐘</option>
                    <option value="10">每 10 分鐘</option>
                    <option value="30">每 30 分鐘</option>
                    <option value="60">每 1 小時</option>
                  </select>
                </div>

                <!-- Alert Settings -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-3">
                    通知設定
                  </label>
                  <div class="space-y-3">
                    <label class="flex items-center">
                      <input 
                        v-model="agentConfig.notifications.onExecution"
                        type="checkbox" 
                        class="form-checkbox"
                      />
                      <span class="ml-2 text-sm text-gray-700">執行補充時通知</span>
                    </label>
                    <label class="flex items-center">
                      <input 
                        v-model="agentConfig.notifications.onError"
                        type="checkbox" 
                        class="form-checkbox"
                      />
                      <span class="ml-2 text-sm text-gray-700">發生錯誤時通知</span>
                    </label>
                    <label class="flex items-center">
                      <input 
                        v-model="agentConfig.notifications.dailyReport"
                        type="checkbox" 
                        class="form-checkbox"
                      />
                      <span class="ml-2 text-sm text-gray-700">每日報告</span>
                    </label>
                  </div>
                </div>

                <!-- Emergency Settings -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    緊急停止條件
                  </label>
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label class="block text-xs text-gray-500 mb-1">單日最大執行次數</label>
                      <input 
                        v-model="agentConfig.emergency.maxDailyExecutions"
                        type="number" 
                        min="1"
                        max="100"
                        class="form-input"
                      />
                    </div>
                    <div>
                      <label class="block text-xs text-gray-500 mb-1">單日最大費用 (USDC)</label>
                      <input 
                        v-model="agentConfig.emergency.maxDailyCost"
                        type="number" 
                        min="1"
                        step="0.1"
                        class="form-input"
                      />
                    </div>
                  </div>
                </div>

                <!-- Save Button -->
                <button 
                  type="submit" 
                  class="btn-primary w-full py-3"
                  :disabled="isLoading"
                >
                  <span v-if="isLoading">儲存中...</span>
                  <span v-else>儲存配置</span>
                </button>
              </form>
            </div>

            <!-- Right Panel - Activity Log -->
            <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
              <h3 class="text-2xl font-semibold text-gray-900 mb-6">Activity Log</h3>
              
              <!-- Filter -->
              <div class="flex items-center space-x-4 mb-6">
                <select v-model="logFilter" class="form-input text-sm">
                  <option value="all">全部活動</option>
                  <option value="execution">執行記錄</option>
                  <option value="error">錯誤記錄</option>
                  <option value="alert">警告記錄</option>
                </select>
                <button @click="refreshLogs" class="btn-secondary text-sm">
                  <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                  </svg>
                  刷新
                </button>
              </div>

              <!-- Logs -->
              <div class="space-y-3 max-h-96 overflow-y-auto">
                <div 
                  v-for="log in filteredLogs" 
                  :key="log.id"
                  class="log-item"
                  :class="log.type"
                >
                  <div class="flex items-start justify-between">
                    <div class="flex items-start space-x-3">
                      <div class="log-icon" :class="log.type">
                        <svg v-if="log.type === 'execution'" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                        </svg>
                        <svg v-else-if="log.type === 'error'" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                        <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L5.08 15.5c-.77.833.192 2.5 1.732 2.5z"></path>
                        </svg>
                      </div>
                      <div class="flex-1">
                        <div class="font-medium text-gray-900 text-sm">{{ log.title }}</div>
                        <div class="text-xs text-gray-500 mt-1">{{ log.description }}</div>
                      </div>
                    </div>
                    <div class="text-xs text-gray-400">
                      {{ log.timestamp }}
                    </div>
                  </div>
                </div>
                
                <div v-if="filteredLogs.length === 0" class="text-center py-8">
                  <div class="w-12 h-12 mx-auto mb-3 bg-gray-100 rounded-full flex items-center justify-center">
                    <svg class="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                    </svg>
                  </div>
                  <p class="text-gray-600 text-sm">暫無活動記錄</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Advanced Settings -->
          <div class="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <h3 class="text-2xl font-semibold text-gray-900 mb-6">進階設定</h3>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
              <!-- Lit Protocol Settings -->
              <div>
                <h4 class="text-lg font-medium text-gray-900 mb-4">Lit Protocol 配置</h4>
                <div class="space-y-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">PKP Token ID</label>
                    <input 
                      v-model="advancedConfig.pkpTokenId"
                      type="text" 
                      placeholder="輸入 PKP Token ID"
                      class="form-input"
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Lit Action Code</label>
                    <textarea 
                      v-model="advancedConfig.litActionCode"
                      rows="4"
                      placeholder="自定義 Lit Action 程式碼..."
                      class="form-input"
                    ></textarea>
                  </div>
                </div>
              </div>

              <!-- Bridge Settings -->
              <div>
                <h4 class="text-lg font-medium text-gray-900 mb-4">橋接偏好設定</h4>
                <div class="space-y-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">優先橋接協議</label>
                    <select v-model="advancedConfig.preferredBridge" class="form-input">
                      <option value="avail">Avail SDK</option>
                      <option value="debridge">deBridge</option>
                      <option value="auto">自動選擇最佳</option>
                    </select>
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">滑點容忍度 (%)</label>
                    <input 
                      v-model="advancedConfig.slippageTolerance"
                      type="number" 
                      min="0.1"
                      max="5"
                      step="0.1"
                      class="form-input"
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">最大等待時間 (分鐘)</label>
                    <input 
                      v-model="advancedConfig.maxWaitTime"
                      type="number" 
                      min="1"
                      max="60"
                      class="form-input"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div class="mt-6 pt-6 border-t border-gray-200">
              <button 
                @click="saveAdvancedConfig" 
                class="btn-primary"
                :disabled="isLoading"
              >
                儲存進階設定
              </button>
              <button 
                @click="resetToDefaults" 
                class="btn-secondary ml-4"
              >
                重置為預設值
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Layout>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import Layout from '../components/Layout.vue'
import { useWeb3 } from '../composables/useWeb3'

const { account, chainId, isConnected, switchToArbitrum } = useWeb3()

// Data
const isLoading = ref(false)
const logFilter = ref('all')

// Agent Status
const agentStatus = ref({
  isActive: false,
  monitoringWallets: 1,
  monitoringChains: 3,
  lastCheck: '2024-01-15 15:32'
})

const agentStats = ref({
  todayExecutions: 5,
  totalExecutions: 47,
  successRate: 98.5
})

const agentCosts = ref({
  monthly: '12.4',
  saved: '25.8',
  avgPerExecution: '0.26'
})

// Agent Configuration
const agentConfig = ref({
  monitoringWallets: [account.value || ''],
  monitoringChains: [1, 137],
  checkFrequency: 10,
  notifications: {
    onExecution: true,
    onError: true,
    dailyReport: false
  },
  emergency: {
    maxDailyExecutions: 20,
    maxDailyCost: 50
  }
})

// Advanced Configuration
const advancedConfig = ref({
  pkpTokenId: '',
  litActionCode: '',
  preferredBridge: 'auto',
  slippageTolerance: 1.0,
  maxWaitTime: 15
})

// Activity Logs
const activityLogs = ref([
  {
    id: 1,
    type: 'execution',
    title: 'Ethereum Gas 補充',
    description: '為 0x123...abc 補充 0.01 ETH，消耗 20.1 USDC',
    timestamp: '15:30'
  },
  {
    id: 2,
    type: 'execution',
    title: 'Polygon Gas 補充',
    description: '為 0x123...abc 補充 0.5 MATIC，消耗 0.4 USDC',
    timestamp: '14:20'
  },
  {
    id: 3,
    type: 'alert',
    title: '餘額警告',
    description: 'Token ID 1 餘額不足 10 USDC，建議充值',
    timestamp: '13:45'
  },
  {
    id: 4,
    type: 'error',
    title: '橋接失敗',
    description: 'BNB Chain 橋接超時，將在下次檢查時重試',
    timestamp: '12:30'
  }
])

// Mock chain data
const availableChains = ref([
  {
    id: 1,
    name: 'Ethereum',
    icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjMyIiBoZWlnaHQ9IjMyIiBmaWxsPSIjMzI3N0Y1Ii8+CjxwYXRoIGZpbGwtcnVsZT0iZXZlbm9kZCIgY2xpcC1ydWxlPSJldmVub2RkIiBkPSJNMTYuMDAwMSAyNi45OTk5TDE2IDI2Ljk5OTlWMTguMjVMMjQuNTY1NyAxNC43NzczTDE2LjAwMDEgMjYuOTk5OVoiIGZpbGw9IndoaXRlIiBmaWxsLW9wYWNpdHk9IjAuNiIvPgo8cGF0aCBmaWxsLXJ1bGU9ImV2ZW5vZGQiIGNsaXAtcnVsZT0iZXZlbm9kZCIgZD0iTTE2IDI2Ljk5OTlMMTYgMTguMjVMNy40MzQyNiAxNC43NzczTDE2IDI2Ljk5OTlaIiBmaWxsPSJ3aGl0ZSIvPgo8cGF0aCBmaWxsLXJ1bGU9ImV2ZW5vZGQiIGNsaXAtcnVsZT0iZXZlbm9kZCIgZD0iTTE2LjAwMDEgNC45OTk5TDE2IDQuOTk5OVYxNi42MjQ5TDI0LjU2NTcgMTQuNzc3M0wxNi4wMDEgNC45OTk5WiIgZmlsbD0id2hpdGUiIGZpbGwtb3BhY2l0eT0iMC44Ii8+CjxwYXRoIGZpbGwtcnVsZT0iZXZlbm9kZCIgY2xpcC1ydWxlPSJldmVub2RkIiBkPSJNMTYgNC45OTk5VjE2LjYyNDlMNy40MzQyNiAxNC43NzczTDE2IDQuOTk5OVoiIGZpbGw9IndoaXRlIi8+Cjwvc3ZnPgo='
  },
  {
    id: 137,
    name: 'Polygon',
    icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjMyIiBoZWlnaHQ9IjMyIiBmaWxsPSIjODI0N0U1Ii8+CjxwYXRoIGQ9Ik0yMC4yODggMTIuMTQ0QzE5LjkzMiAxMS45NTIgMTkuNTI4IDExLjg0OCAxOS4xMjggMTEuODQ4SDE5LjEyNEMxOC43MjQgMTEuODQ4IDE4LjMyIDExLjk1MiAxNy45NjQgMTIuMTQ0TDE2IDEzLjI5MkwxNC4wMzYgMTIuMTQ0QzEzLjY4IDExLjk1MiAxMy4yNzYgMTEuODQ4IDEyLjg3NiAxMS44NDhIMTIuODcyQzEyLjQ3MiAxMS44NDggMTIuMDY4IDExLjk1MiAxMS43MTIgMTIuMTQ0TDkuMjMyIDEzLjU2QzguNTIgMTMuOTY0IDguNSAxNC44MjQgOC41IDE1LjQ5NlYyMC44MDhDOC41IDIxLjQ4IDguNTIgMjIuMzQgOS4yMzIgMjIuNzQ0TDExLjcxMiAyNC4xNkMxMi4wNjggMjQuMzUyIDEyLjQ3MiAyNC40NTYgMTIuODcyIDI0LjQ1NkgxMi44NzZDMTMuMjc2IDI0LjQ1NiAxMy42OCAyNC4zNTIgMTQuMDM2IDI0LjE2TDE2IDIzLjAxMkwxNy45NjQgMjQuMTZDMTguMzIgMjQuMzUyIDE4LjcyNCAyNC40NTYgMTkuMTI0IDI0LjQ1NkgxOS4xMjhDMTkuNTI4IDI0LjQ1NiAxOS45MzIgMjQuMzUyIDIwLjI4OCAyNC4xNkwyMi43NjggMjIuNzQ0QzIzLjQ4IDIyLjM0IDIzLjUgMjEuNDggMjMuNSAyMC44MDhWMTUuNDk2QzIzLjUgMTQuODI0IDIzLjQ4IDEzLjk2NCAyMi43NjggMTMuNTZMMjAuMjg4IDEyLjE0NFoiIGZpbGw9IndoaXRlIi8+Cjwvc3ZnPgo='
  },
  {
    id: 56,
    name: 'BNB Chain',
    icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjMyIiBoZWlnaHQ9IjMyIiBmaWxsPSIjRjNCQzFBIi8+CjxwYXRoIGQ9Ik0xNiA3LjVMMjAuMTI1IDExLjYyNUwyNCA3LjVMMjguNSAxMkwyNC4zNzUgMTZMMjguNSAyMEwyNCAxNi4zNzVMMTYgMjQuMzc1TDggMTYuMzc1TDMuNSAyMEw3LjYyNSAxNkwzLjUgMTJMOCA3LjVMMTIuMTI1IDExLjYyNUwxNiA3LjVaIiBmaWxsPSJ3aGl0ZSIvPgo8L3N2Zz4K'
  },
  {
    id: 43114,
    name: 'Avalanche',
    icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjMyIiBoZWlnaHQ9IjMyIiBmaWxsPSIjRTg0MTQyIi8+CjxwYXRoIGQ9Ik0xNi4wMDAxIDQuOTk5OUwyOCAyNkg0TDE2LjAwMDEgNC45OTk5WiIgZmlsbD0id2hpdGUiLz4KPC9zdmc+Cg=='
  }
])

// Computed
const filteredLogs = computed(() => {
  if (logFilter.value === 'all') return activityLogs.value
  return activityLogs.value.filter(log => log.type === logFilter.value)
})

// Methods
const toggleAgent = async () => {
  agentStatus.value.isActive = !agentStatus.value.isActive
  // In real implementation, interact with Lit Protocol
}

const addWallet = () => {
  agentConfig.value.monitoringWallets.push('')
}

const removeWallet = (index) => {
  agentConfig.value.monitoringWallets.splice(index, 1)
}

const toggleChain = (chainId) => {
  const index = agentConfig.value.monitoringChains.indexOf(chainId)
  if (index > -1) {
    agentConfig.value.monitoringChains.splice(index, 1)
  } else {
    agentConfig.value.monitoringChains.push(chainId)
  }
}

const saveAgentConfig = async () => {
  isLoading.value = true
  try {
    // Mock save
    await new Promise(resolve => setTimeout(resolve, 1000))
    alert('Agent 配置已保存！')
  } catch (error) {
    alert('保存失敗，請稍後再試')
  } finally {
    isLoading.value = false
  }
}

const saveAdvancedConfig = async () => {
  isLoading.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 1000))
    alert('進階設定已保存！')
  } catch (error) {
    alert('保存失敗，請稍後再試')
  } finally {
    isLoading.value = false
  }
}

const resetToDefaults = () => {
  if (confirm('確定要重置所有設定為預設值嗎？')) {
    advancedConfig.value = {
      pkpTokenId: '',
      litActionCode: '',
      preferredBridge: 'auto',
      slippageTolerance: 1.0,
      maxWaitTime: 15
    }
  }
}

const refreshLogs = () => {
  // Mock refresh
  alert('記錄已刷新')
}

// Set default wallet when account changes
watch(account, (newAccount) => {
  if (newAccount && agentConfig.value.monitoringWallets[0] === '') {
    agentConfig.value.monitoringWallets[0] = newAccount
  }
}, { immediate: true })
</script>

<style scoped>
.form-input {
  @apply w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors;
}

.form-checkbox {
  @apply text-orange-500 border-gray-300 rounded focus:ring-orange-500;
}

.btn-primary {
  @apply bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium py-2 px-4 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2;
}

.btn-secondary {
  @apply bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 flex items-center;
}

.agent-status-card {
  @apply bg-white rounded-xl shadow-sm border border-gray-200 p-6;
}

.status-indicator {
  @apply px-3 py-1 rounded-full text-xs font-medium;
}

.status-indicator.active {
  @apply bg-green-100 text-green-800;
}

.status-indicator.inactive {
  @apply bg-gray-100 text-gray-800;
}

.toggle-btn {
  @apply relative w-12 h-6 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2;
}

.toggle-btn.active {
  @apply bg-orange-500;
}

.toggle-btn.inactive {
  @apply bg-gray-300;
}

.toggle-slider {
  @apply absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform;
}

.toggle-btn.active .toggle-slider {
  @apply transform translate-x-6;
}

.chain-toggle {
  @apply flex items-center justify-between p-3 border border-gray-200 rounded-lg cursor-pointer hover:border-orange-300 hover:bg-orange-50 transition-all;
}

.chain-toggle.selected {
  @apply border-orange-500 bg-orange-50 ring-2 ring-orange-200;
}

.log-item {
  @apply bg-gray-50 rounded-lg p-3;
}

.log-item.execution {
  @apply bg-green-50 border-l-4 border-green-400;
}

.log-item.error {
  @apply bg-red-50 border-l-4 border-red-400;
}

.log-item.alert {
  @apply bg-yellow-50 border-l-4 border-yellow-400;
}

.log-icon {
  @apply w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0;
}

.log-icon.execution {
  @apply bg-green-100 text-green-600;
}

.log-icon.error {
  @apply bg-red-100 text-red-600;
}

.log-icon.alert {
  @apply bg-yellow-100 text-yellow-600;
}
</style>