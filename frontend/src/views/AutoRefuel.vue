<template>
  <Layout>
    <div class="min-h-screen bg-gray-50 py-12">
      <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <!-- Header -->
        <div class="text-center mb-12">
          <h1 class="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            自動補 Gas 管理
          </h1>
          <p class="text-lg text-gray-600 max-w-2xl mx-auto">
            設定自動補充策略，讓您的錢包永遠保持充足的 Gas，無需手動管理
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
              <p class="text-yellow-700">您需要連接 Web3 錢包才能設定自動補 Gas</p>
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
          <!-- Cards Selection -->
          <div class="mb-8">
            <h2 class="text-2xl font-semibold text-gray-900 mb-6">選擇儲值卡</h2>
            
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

            <div v-else class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div 
                v-for="card in gasPassCards" 
                :key="card.tokenId"
                class="gas-pass-card"
                :class="{ 'selected': selectedCard?.tokenId === card.tokenId }"
                @click="selectCard(card)"
              >
                <div class="flex items-center justify-between mb-2">
                  <span class="text-sm text-white opacity-80">Token ID: {{ card.tokenId }}</span>
                  <div v-if="selectedCard?.tokenId === card.tokenId" class="w-5 h-5 bg-white rounded-full flex items-center justify-center">
                    <svg class="w-3 h-3 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                    </svg>
                  </div>
                </div>
                <div class="text-xl font-bold text-white mb-2">
                  {{ card.balance }} USDC
                </div>
                <div class="text-xs text-white opacity-60">
                  {{ card.activePolicies }} 個活躍策略
                </div>
              </div>
            </div>
          </div>

          <!-- Auto Refuel Policies -->
          <div v-if="selectedCard" class="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <!-- Left Panel - Current Policies -->
            <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
              <div class="flex items-center justify-between mb-6">
                <h3 class="text-2xl font-semibold text-gray-900">
                  自動補充策略
                </h3>
                <button 
                  @click="showAddPolicy = true"
                  class="btn-primary"
                >
                  <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                  </svg>
                  新增策略
                </button>
              </div>
              
              <div v-if="activePolicies.length === 0" class="text-center py-12">
                <div class="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
                  </svg>
                </div>
                <h4 class="text-lg font-medium text-gray-900 mb-2">尚未設定自動策略</h4>
                <p class="text-gray-600 mb-4">設定自動補充策略，讓系統為您監控和補充 Gas</p>
                <button 
                  @click="showAddPolicy = true"
                  class="btn-primary"
                >
                  設定第一個策略
                </button>
              </div>

              <div v-else class="space-y-4">
                <div 
                  v-for="policy in activePolicies" 
                  :key="`${policy.chainId}-${policy.id}`"
                  class="policy-card"
                >
                  <div class="flex items-start justify-between">
                    <div class="flex items-center space-x-3">
                      <img :src="policy.chainIcon" :alt="policy.chainName" class="w-10 h-10" />
                      <div>
                        <h4 class="font-medium text-gray-900">{{ policy.chainName }}</h4>
                        <div class="text-sm text-gray-500">
                          閾值: {{ policy.threshold }} {{ policy.symbol }} | 補充: {{ policy.gasAmount }} {{ policy.symbol }}
                        </div>
                      </div>
                    </div>
                    <div class="flex items-center space-x-2">
                      <div class="status-indicator" :class="policy.status === 'active' ? 'active' : 'inactive'">
                        {{ policy.status === 'active' ? '啟用' : '停用' }}
                      </div>
                      <button 
                        @click="togglePolicy(policy)"
                        class="text-gray-400 hover:text-gray-600"
                      >
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"></path>
                        </svg>
                      </button>
                    </div>
                  </div>
                  
                  <div class="mt-4 pt-4 border-t border-gray-100">
                    <div class="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span class="text-gray-500">最後執行:</span>
                        <span class="ml-1 text-gray-900">{{ policy.lastTriggered || '從未執行' }}</span>
                      </div>
                      <div>
                        <span class="text-gray-500">執行次數:</span>
                        <span class="ml-1 text-gray-900">{{ policy.executeCount }} 次</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Right Panel - Add/Edit Policy or Monitoring -->
            <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
              <!-- Add Policy Form -->
              <div v-if="showAddPolicy">
                <div class="flex items-center justify-between mb-6">
                  <h3 class="text-2xl font-semibold text-gray-900">新增策略</h3>
                  <button 
                    @click="showAddPolicy = false"
                    class="text-gray-400 hover:text-gray-600"
                  >
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                  </button>
                </div>

                <form @submit.prevent="handleAddPolicy" class="space-y-6">
                  <!-- Chain Selection -->
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-3">
                      選擇區塊鏈
                    </label>
                    <div class="grid grid-cols-2 gap-3">
                      <div 
                        v-for="chain in availableChains" 
                        :key="chain.id"
                        class="chain-option"
                        :class="{ 'selected': newPolicy.chainId === chain.id }"
                        @click="selectChainForPolicy(chain)"
                      >
                        <img :src="chain.icon" :alt="chain.name" class="w-6 h-6" />
                        <div class="text-sm font-medium">{{ chain.name }}</div>
                      </div>
                    </div>
                  </div>

                  <!-- Threshold -->
                  <div v-if="newPolicy.chainId">
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      觸發閾值 ({{ selectedPolicyChain?.symbol }})
                    </label>
                    <input 
                      v-model="newPolicy.threshold"
                      type="number" 
                      step="0.001"
                      min="0"
                      :placeholder="`當餘額低於此數值時觸發補充`"
                      class="form-input"
                      required
                    />
                    <p class="text-sm text-gray-500 mt-1">
                      建議設置為 {{ selectedPolicyChain?.recommended }} {{ selectedPolicyChain?.symbol }}
                    </p>
                  </div>

                  <!-- Gas Amount -->
                  <div v-if="newPolicy.chainId">
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      補充數量 ({{ selectedPolicyChain?.symbol }})
                    </label>
                    <input 
                      v-model="newPolicy.gasAmount"
                      type="number" 
                      step="0.001"
                      min="0"
                      :placeholder="`每次補充的 ${selectedPolicyChain?.symbol} 數量`"
                      class="form-input"
                      required
                    />
                    <div class="grid grid-cols-3 gap-2 mt-2">
                      <button 
                        v-for="amount in selectedPolicyChain?.quickAmounts" 
                        :key="amount"
                        type="button"
                        @click="newPolicy.gasAmount = amount"
                        class="quick-amount-btn text-xs"
                      >
                        {{ amount }}
                      </button>
                    </div>
                  </div>

                  <!-- Cost Preview -->
                  <div v-if="newPolicy.chainId && newPolicy.gasAmount" class="bg-gray-50 rounded-lg p-4">
                    <h4 class="text-sm font-medium text-gray-700 mb-2">每次執行預估費用</h4>
                    <div class="space-y-1 text-sm text-gray-600">
                      <div class="flex justify-between">
                        <span>Gas 成本:</span>
                        <span>{{ calculateGasCost(newPolicy.gasAmount) }} USDC</span>
                      </div>
                      <div class="flex justify-between">
                        <span>橋接費用:</span>
                        <span>{{ calculateBridgeFee(newPolicy.gasAmount) }} USDC</span>
                      </div>
                      <div class="flex justify-between border-t border-gray-200 pt-1 font-medium">
                        <span>總計:</span>
                        <span>{{ calculateTotalCost(newPolicy.gasAmount) }} USDC</span>
                      </div>
                    </div>
                  </div>

                  <!-- Submit Button -->
                  <button 
                    type="submit" 
                    class="btn-primary w-full py-3"
                    :disabled="!canAddPolicy"
                  >
                    新增自動策略
                  </button>
                </form>
              </div>

              <!-- Monitoring Dashboard -->
              <div v-else>
                <h3 class="text-2xl font-semibold text-gray-900 mb-6">監控儀表板</h3>
                
                <!-- Stats -->
                <div class="grid grid-cols-2 gap-4 mb-6">
                  <div class="stat-card">
                    <div class="stat-value">{{ activePolicies.length }}</div>
                    <div class="stat-label">活躍策略</div>
                  </div>
                  <div class="stat-card">
                    <div class="stat-value">{{ totalExecutions }}</div>
                    <div class="stat-label">總執行次數</div>
                  </div>
                </div>

                <!-- Recent Activity -->
                <div>
                  <h4 class="text-lg font-semibold text-gray-900 mb-4">最近活動</h4>
                  
                  <div v-if="recentActivity.length === 0" class="text-center py-8">
                    <div class="w-12 h-12 mx-auto mb-3 bg-gray-100 rounded-full flex items-center justify-center">
                      <svg class="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                    </div>
                    <p class="text-gray-600 text-sm">暫無自動執行紀錄</p>
                  </div>

                  <div v-else class="space-y-3">
                    <div 
                      v-for="activity in recentActivity" 
                      :key="activity.id"
                      class="activity-item"
                    >
                      <div class="flex items-center justify-between">
                        <div class="flex items-center space-x-3">
                          <div class="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                            <svg class="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                            </svg>
                          </div>
                          <div>
                            <div class="font-medium text-gray-900">{{ activity.chainName }}</div>
                            <div class="text-sm text-gray-500">{{ activity.timestamp }}</div>
                          </div>
                        </div>
                        <div class="text-right">
                          <div class="font-semibold text-gray-900">+{{ activity.amount }} {{ activity.symbol }}</div>
                          <div class="text-sm text-gray-500">{{ activity.cost }} USDC</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
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
const gasPassCards = ref([])
const selectedCard = ref(null)
const showAddPolicy = ref(false)
const activePolicies = ref([])
const recentActivity = ref([])

// New policy form
const newPolicy = ref({
  chainId: null,
  threshold: '',
  gasAmount: ''
})

// Mock chain data
const availableChains = ref([
  {
    id: 1,
    name: 'Ethereum',
    symbol: 'ETH',
    icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjMyIiBoZWlnaHQ9IjMyIiBmaWxsPSIjMzI3N0Y1Ii8+CjxwYXRoIGZpbGwtcnVsZT0iZXZlbm9kZCIgY2xpcC1ydWxlPSJldmVub2RkIiBkPSJNMTYuMDAwMSAyNi45OTk5TDE2IDI2Ljk5OTlWMTguMjVMMjQuNTY1NyAxNC43NzczTDE2LjAwMDEgMjYuOTk5OVoiIGZpbGw9IndoaXRlIiBmaWxsLW9wYWNpdHk9IjAuNiIvPgo8cGF0aCBmaWxsLXJ1bGU9ImV2ZW5vZGQiIGNsaXAtcnVsZT0iZXZlbm9kZCIgZD0iTTE2IDI2Ljk5OTlMMTYgMTguMjVMNy40MzQyNiAxNC43NzczTDE2IDI2Ljk5OTlaIiBmaWxsPSJ3aGl0ZSIvPgo8cGF0aCBmaWxsLXJ1bGU9ImV2ZW5vZGQiIGNsaXAtcnVsZT0iZXZlbm9kZCIgZD0iTTE2LjAwMDEgNC45OTk5TDE2IDQuOTk5OVYxNi42MjQ5TDI0LjU2NTcgMTQuNzc3M0wxNi4wMDExIDQuOTk5OVoiIGZpbGw9IndoaXRlIiBmaWxsLW9wYWNpdHk9IjAuOCIvPgo8cGF0aCBmaWxsLXJ1bGU9ImV2ZW5vZGQiIGNsaXAtcnVsZT0iZXZlbm9kZCIgZD0iTTE2IDQuOTk5OVYxNi42MjQ5TDcuNDM0MjYgMTQuNzc3M0wxNiA0Ljk5OTlaIiBmaWxsPSJ3aGl0ZSIvPgo8L3N2Zz4K',
    recommended: '0.01',
    quickAmounts: ['0.005', '0.01', '0.02']
  },
  {
    id: 137,
    name: 'Polygon',
    symbol: 'MATIC',
    icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjMyIiBoZWlnaHQ9IjMyIiBmaWxsPSIjODI0N0U1Ii8+CjxwYXRoIGQ9Ik0yMC4yODggMTIuMTQ0QzE5LjkzMiAxMS45NTIgMTkuNTI4IDExLjg0OCAxOS4xMjggMTEuODQ4SDE5LjEyNEMxOC43MjQgMTEuODQ4IDE4LjMyIDExLjk1MiAxNy45NjQgMTIuMTQ0TDE2IDEzLjI5MkwxNC4wMzYgMTIuMTQ0QzEzLjY4IDExLjk1MiAxMy4yNzYgMTEuODQ4IDEyLjg3NiAxMS44NDhIMTIuODcyQzEyLjQ3MiAxMS44NDggMTIuMDY4IDExLjk1MiAxMS43MTIgMTIuMTQ0TDkuMjMyIDEzLjU2QzguNTIgMTMuOTY0IDguNSAxNC44MjQgOC41IDE1LjQ5NlYyMC44MDhDOC41IDIxLjQ4IDguNTIgMjIuMzQgOS4yMzIgMjIuNzQ0TDExLjcxMiAyNC4xNkMxMi4wNjggMjQuMzUyIDEyLjQ3MiAyNC40NTYgMTIuODcyIDI0LjQ1NkgxMi44NzZDMTMuMjc2IDI0LjQ1NiAxMy42OCAyNC4zNTIgMTQuMDM2IDI0LjE2TDE2IDIzLjAxMkwxNy45NjQgMjQuMTZDMTguMzIgMjQuMzUyIDE4LjcyNCAyNC40NTYgMTkuMTI0IDI0LjQ1NkgxOS4xMjhDMTkuNTI4IDI0LjQ1NiAxOS45MzIgMjQuMzUyIDIwLjI4OCAyNC4xNkwyMi43NjggMjIuNzQ0QzIzLjQ4IDIyLjM0IDIzLjUgMjEuNDggMjMuNSAyMC44MDhWMTUuNDk2QzIzLjUgMTQuODI0IDIzLjQ4IDEzLjk2NCAyMi43NjggMTMuNTZMMjAuMjg4IDEyLjE0NFoiIGZpbGw9IndoaXRlIi8+Cjwvc3ZnPgo=',
    recommended: '0.5',
    quickAmounts: ['0.1', '0.5', '1.0']
  },
  {
    id: 56,
    name: 'BNB Chain',
    symbol: 'BNB',
    icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjMyIiBoZWlnaHQ9IjMyIiBmaWxsPSIjRjNCQzFBIi8+CjxwYXRoIGQ9Ik0xNiA3LjVMMjAuMTI1IDExLjYyNUwyNCA3LjVMMjguNSAxMkwyNC4zNzUgMTZMMjguNSAyMEwyNCAxNi4zNzVMMTYgMjQuMzc1TDggMTYuMzc1TDMuNSAyMEw3LjYyNSAxNkwzLjUgMTJMOCA3LjVMMTIuMTI1IDExLjYyNUwxNiA3LjVaIiBmaWxsPSJ3aGl0ZSIvPgo8L3N2Zz4K',
    recommended: '0.01',
    quickAmounts: ['0.005', '0.01', '0.02']
  }
])

// Computed
const selectedPolicyChain = computed(() => {
  return availableChains.value.find(chain => chain.id === newPolicy.value.chainId)
})

const canAddPolicy = computed(() => {
  return newPolicy.value.chainId && 
         newPolicy.value.threshold && 
         newPolicy.value.gasAmount &&
         parseFloat(newPolicy.value.threshold) > 0 &&
         parseFloat(newPolicy.value.gasAmount) > 0
})

const totalExecutions = computed(() => {
  return activePolicies.value.reduce((sum, policy) => sum + policy.executeCount, 0)
})

// Methods
const selectCard = (card) => {
  selectedCard.value = card
  loadActivePolicies(card.tokenId)
  loadRecentActivity(card.tokenId)
}

const selectChainForPolicy = (chain) => {
  newPolicy.value.chainId = chain.id
  newPolicy.value.threshold = chain.recommended
}

const calculateGasCost = (amount) => {
  if (!amount) return '0.00'
  // Mock calculation: 1 ETH = 2000 USDC
  const rate = selectedPolicyChain.value?.symbol === 'ETH' ? 2000 : 
               selectedPolicyChain.value?.symbol === 'MATIC' ? 0.8 : 
               selectedPolicyChain.value?.symbol === 'BNB' ? 300 : 1
  return (parseFloat(amount) * rate).toFixed(2)
}

const calculateBridgeFee = (amount) => {
  if (!amount) return '0.00'
  return (parseFloat(calculateGasCost(amount)) * 0.003).toFixed(2)
}

const calculateTotalCost = (amount) => {
  if (!amount) return '0.00'
  const gasCost = parseFloat(calculateGasCost(amount))
  const bridgeFee = parseFloat(calculateBridgeFee(amount))
  return (gasCost + bridgeFee + 0.5).toFixed(2) // +0.5 for base fee
}

const loadUserCards = async () => {
  if (!account.value) return
  
  // Mock data
  gasPassCards.value = [
    {
      tokenId: 1,
      balance: '150.25',
      activePolicies: 2
    },
    {
      tokenId: 3,
      balance: '89.50',
      activePolicies: 1
    }
  ]
  
  if (gasPassCards.value.length > 0) {
    selectCard(gasPassCards.value[0])
  }
}

const loadActivePolicies = async (tokenId) => {
  // Mock data
  activePolicies.value = [
    {
      id: 1,
      chainId: 1,
      chainName: 'Ethereum',
      chainIcon: availableChains.value[0].icon,
      symbol: 'ETH',
      threshold: '0.01',
      gasAmount: '0.02',
      status: 'active',
      lastTriggered: '2024-01-15 14:30',
      executeCount: 5
    },
    {
      id: 2,
      chainId: 137,
      chainName: 'Polygon',
      chainIcon: availableChains.value[1].icon,
      symbol: 'MATIC',
      threshold: '0.5',
      gasAmount: '1.0',
      status: 'active',
      lastTriggered: '2024-01-14 10:20',
      executeCount: 3
    }
  ]
}

const loadRecentActivity = async (tokenId) => {
  // Mock data
  recentActivity.value = [
    {
      id: 1,
      chainName: 'Ethereum',
      amount: '0.02',
      symbol: 'ETH',
      cost: '40.1',
      timestamp: '2024-01-15 14:30'
    },
    {
      id: 2,
      chainName: 'Polygon',
      amount: '1.0',
      symbol: 'MATIC',
      cost: '0.8',
      timestamp: '2024-01-14 10:20'
    }
  ]
}

const handleAddPolicy = async () => {
  try {
    // Mock adding policy
    const newPolicyData = {
      id: Date.now(),
      chainId: newPolicy.value.chainId,
      chainName: selectedPolicyChain.value.name,
      chainIcon: selectedPolicyChain.value.icon,
      symbol: selectedPolicyChain.value.symbol,
      threshold: newPolicy.value.threshold,
      gasAmount: newPolicy.value.gasAmount,
      status: 'active',
      lastTriggered: null,
      executeCount: 0
    }
    
    activePolicies.value.push(newPolicyData)
    
    // Update card
    if (selectedCard.value) {
      selectedCard.value.activePolicies = activePolicies.value.length
    }
    
    // Reset form
    newPolicy.value = {
      chainId: null,
      threshold: '',
      gasAmount: ''
    }
    showAddPolicy.value = false
    
    alert('自動補充策略已成功新增！')
    
  } catch (error) {
    console.error('Add policy failed:', error)
    alert('新增策略失敗，請稍後再試')
  }
}

const togglePolicy = async (policy) => {
  policy.status = policy.status === 'active' ? 'inactive' : 'active'
  // In real implementation, call smart contract
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

.btn-primary {
  @apply bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium py-2 px-4 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 flex items-center;
}

.gas-pass-card {
  @apply relative bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-4 text-white cursor-pointer transition-all hover:shadow-lg;
}

.gas-pass-card.selected {
  @apply ring-4 ring-orange-300 ring-opacity-50 shadow-lg;
}

.chain-option {
  @apply flex items-center space-x-2 p-3 border border-gray-200 rounded-lg cursor-pointer hover:border-orange-300 hover:bg-orange-50 transition-all;
}

.chain-option.selected {
  @apply border-orange-500 bg-orange-50 ring-2 ring-orange-200;
}

.quick-amount-btn {
  @apply bg-gray-100 hover:bg-orange-500 hover:text-white text-gray-700 font-medium py-1 px-2 rounded transition-colors;
}

.policy-card {
  @apply bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors;
}

.status-indicator {
  @apply px-2 py-1 rounded-full text-xs font-medium;
}

.status-indicator.active {
  @apply bg-green-100 text-green-800;
}

.status-indicator.inactive {
  @apply bg-gray-100 text-gray-800;
}

.stat-card {
  @apply bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg p-4 text-white text-center;
}

.stat-value {
  @apply text-2xl font-bold;
}

.stat-label {
  @apply text-sm opacity-80;
}

.activity-item {
  @apply bg-gray-50 rounded-lg p-3;
}
</style>