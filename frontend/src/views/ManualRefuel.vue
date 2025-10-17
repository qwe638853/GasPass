<template>
  <Layout>
    <div class="min-h-screen bg-gray-50 py-12">
      <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <!-- Header -->
        <div class="text-center mb-12">
          <h1 class="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            手動補 Gas
          </h1>
          <p class="text-lg text-gray-600 max-w-2xl mx-auto">
            選擇目標區塊鏈和補充數量，立即為您的錢包補充 Gas 費用
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
              <p class="text-yellow-700">您需要連接 Web3 錢包才能使用手動補 Gas 功能</p>
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
                <div class="text-xl font-bold text-white">
                  {{ card.balance }} USDC
                </div>
              </div>
            </div>
          </div>

          <!-- Refuel Form -->
          <div v-if="selectedCard" class="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <!-- Left Panel - Chain & Amount Selection -->
            <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
              <h3 class="text-2xl font-semibold text-gray-900 mb-6">補 Gas 設定</h3>
              
              <form @submit.prevent="handleRefuel" class="space-y-6">
                <!-- Target Chain Selection -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-4">
                    選擇目標區塊鏈
                  </label>
                  <div class="grid grid-cols-2 gap-3">
                    <div 
                      v-for="chain in supportedChains" 
                      :key="chain.id"
                      class="chain-option"
                      :class="{ 'selected': selectedChain?.id === chain.id }"
                      @click="selectChain(chain)"
                    >
                      <img :src="chain.icon" :alt="chain.name" class="w-8 h-8" />
                      <div>
                        <div class="font-medium text-gray-900">{{ chain.name }}</div>
                        <div class="text-sm text-gray-500">{{ chain.symbol }}</div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Gas Amount Input -->
                <div v-if="selectedChain">
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    補充數量 ({{ selectedChain.symbol }})
                  </label>
                  <div class="relative">
                    <input 
                      v-model="gasAmount"
                      type="number" 
                      step="0.001"
                      min="0"
                      :placeholder="`輸入 ${selectedChain.symbol} 數量`"
                      class="form-input"
                      :disabled="isLoading"
                    />
                    <div class="absolute inset-y-0 right-0 flex items-center pr-3">
                      <span class="text-gray-500 text-sm">{{ selectedChain.symbol }}</span>
                    </div>
                  </div>
                  <p class="text-sm text-gray-500 mt-1">
                    建議數量: {{ selectedChain.recommended }} {{ selectedChain.symbol }}
                  </p>
                </div>

                <!-- Quick Amount Buttons -->
                <div v-if="selectedChain">
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    快速選擇
                  </label>
                  <div class="grid grid-cols-3 gap-2">
                    <button 
                      v-for="amount in selectedChain.quickAmounts" 
                      :key="amount"
                      type="button"
                      @click="gasAmount = amount"
                      class="quick-amount-btn"
                      :disabled="isLoading"
                    >
                      {{ amount }} {{ selectedChain.symbol }}
                    </button>
                  </div>
                </div>

                <!-- Recipient Address -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    接收地址 (可選)
                  </label>
                  <input 
                    v-model="recipientAddress"
                    type="text" 
                    placeholder="預設為當前錢包地址"
                    class="form-input"
                    :disabled="isLoading"
                  />
                  <p class="text-sm text-gray-500 mt-1">
                    留空將使用您當前的錢包地址
                  </p>
                </div>

                <!-- Cost Estimation -->
                <div v-if="costEstimation" class="bg-gray-50 rounded-lg p-4">
                  <h4 class="text-sm font-medium text-gray-700 mb-2">費用預估</h4>
                  <div class="space-y-1 text-sm text-gray-600">
                    <div class="flex justify-between">
                      <span>補充數量:</span>
                      <span>{{ gasAmount }} {{ selectedChain.symbol }}</span>
                    </div>
                    <div class="flex justify-between">
                      <span>橋接費用:</span>
                      <span>{{ costEstimation.bridgeFee }} USDC</span>
                    </div>
                    <div class="flex justify-between">
                      <span>Gas 費用:</span>
                      <span>{{ costEstimation.gasFee }} USDC</span>
                    </div>
                    <div class="flex justify-between border-t border-gray-200 pt-1 font-medium">
                      <span>總計:</span>
                      <span>{{ costEstimation.total }} USDC</span>
                    </div>
                  </div>
                </div>

                <!-- Submit Button -->
                <button 
                  type="submit" 
                  class="btn-primary w-full py-4 text-lg"
                  :disabled="isLoading || !canRefuel"
                >
                  <span v-if="isLoading" class="flex items-center justify-center">
                    <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    橋接中...
                  </span>
                  <span v-else>
                    確認補 Gas
                  </span>
                </button>
              </form>
            </div>

            <!-- Right Panel - Transaction Status -->
            <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
              <h3 class="text-2xl font-semibold text-gray-900 mb-6">交易狀態</h3>
              
              <!-- Transaction Progress -->
              <div v-if="isLoading" class="space-y-4">
                <div class="transaction-step" :class="{ active: currentStep >= 1 }">
                  <div class="step-indicator">
                    <div v-if="currentStep > 1" class="step-completed">
                      <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                      </svg>
                    </div>
                    <div v-else-if="currentStep === 1" class="step-loading">
                      <svg class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    </div>
                    <div v-else class="step-pending">1</div>
                  </div>
                  <div class="step-content">
                    <div class="step-title">確認交易</div>
                    <div class="step-description">準備橋接交易...</div>
                  </div>
                </div>

                <div class="transaction-step" :class="{ active: currentStep >= 2 }">
                  <div class="step-indicator">
                    <div v-if="currentStep > 2" class="step-completed">
                      <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                      </svg>
                    </div>
                    <div v-else-if="currentStep === 2" class="step-loading">
                      <svg class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    </div>
                    <div v-else class="step-pending">2</div>
                  </div>
                  <div class="step-content">
                    <div class="step-title">跨鏈橋接</div>
                    <div class="step-description">透過 Avail SDK 進行橋接...</div>
                  </div>
                </div>

                <div class="transaction-step" :class="{ active: currentStep >= 3 }">
                  <div class="step-indicator">
                    <div v-if="currentStep > 3" class="step-completed">
                      <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                      </svg>
                    </div>
                    <div v-else-if="currentStep === 3" class="step-loading">
                      <svg class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    </div>
                    <div v-else class="step-pending">3</div>
                  </div>
                  <div class="step-content">
                    <div class="step-title">轉帳 Gas</div>
                    <div class="step-description">將 Gas 轉入目標錢包...</div>
                  </div>
                </div>
              </div>

              <!-- Recent Transactions -->
              <div v-else class="space-y-4">
                <h4 class="text-lg font-semibold text-gray-900">最近交易</h4>
                
                <div v-if="recentTransactions.length === 0" class="text-center py-8">
                  <div class="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                    <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                  </div>
                  <p class="text-gray-600">暫無補 Gas 紀錄</p>
                </div>

                <div v-else class="space-y-3">
                  <div 
                    v-for="tx in recentTransactions" 
                    :key="tx.hash"
                    class="refuel-transaction"
                  >
                    <div class="flex items-center justify-between">
                      <div class="flex items-center space-x-3">
                        <img :src="tx.chainIcon" :alt="tx.chainName" class="w-8 h-8" />
                        <div>
                          <div class="font-medium text-gray-900">{{ tx.chainName }}</div>
                          <div class="text-sm text-gray-500">{{ tx.timestamp }}</div>
                        </div>
                      </div>
                      <div class="text-right">
                        <div class="font-semibold text-gray-900">+{{ tx.amount }} {{ tx.symbol }}</div>
                        <div class="text-sm text-gray-500">{{ tx.cost }} USDC</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Success Message -->
        <div v-if="txHash" class="mt-8 bg-green-50 border border-green-200 rounded-lg p-6">
          <div class="flex items-center">
            <svg class="w-6 h-6 text-green-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <div>
              <h3 class="text-lg font-medium text-green-800">補 Gas 成功！</h3>
              <p class="text-green-700">
                已成功為 {{ selectedChain?.name }} 錢包補充 {{ gasAmount }} {{ selectedChain?.symbol }}。
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
const selectedChain = ref(null)
const gasAmount = ref('')
const recipientAddress = ref('')
const isLoading = ref(false)
const currentStep = ref(0)
const txHash = ref('')
const recentTransactions = ref([])
const costEstimation = ref(null)

// Mock chain data
const supportedChains = ref([
  {
    id: 1,
    name: 'Ethereum',
    symbol: 'ETH',
    icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjMyIiBoZWlnaHQ9IjMyIiBmaWxsPSIjMzI3N0Y1Ii8+CjxwYXRoIGZpbGwtcnVsZT0iZXZlbm9kZCIgY2xpcC1ydWxlPSJldmVub2RkIiBkPSJNMTYuMDAwMSAyNi45OTk5TDE2IDI2Ljk5OTlWMTguMjVMMjQuNTY1NyAxNC43NzczTDE2LjAwMDEgMjYuOTk5OVoiIGZpbGw9IndoaXRlIiBmaWxsLW9wYWNpdHk9IjAuNiIvPgo8cGF0aCBmaWxsLXJ1bGU9ImV2ZW5vZGQiIGNsaXAtcnVsZT0iZXZlbm9kZCIgZD0iTTE2IDI2Ljk5OTlMMTYgMTguMjVMNy40MzQyNiAxNC43NzczTDE2IDI2Ljk5OTlaIiBmaWxsPSJ3aGl0ZSIvPgo8cGF0aCBmaWxsLXJ1bGU9ImV2ZW5vZGQiIGNsaXAtcnVsZT0iZXZlbm9kZCIgZD0iTTE2LjAwMDEgNC45OTk5TDE2IDQuOTk5OVYxNi42MjQ5TDI0LjU2NTcgMTQuNzc3M0wxNi4wMDAxIDQuOTk5OVoiIGZpbGw9IndoaXRlIiBmaWxsLW9wYWNpdHk9IjAuOCIvPgo8cGF0aCBmaWxsLXJ1bGU9ImV2ZW5vZGQiIGNsaXAtcnVsZT0iZXZlbm9kZCIgZD0iTTE2IDQuOTk5OVYxNi42MjQ5TDcuNDM0MjYgMTQuNzc3M0wxNiA0Ljk5OTlaIiBmaWxsPSJ3aGl0ZSIvPgo8L3N2Zz4K',
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
  },
  {
    id: 43114,
    name: 'Avalanche',
    symbol: 'AVAX',
    icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjMyIiBoZWlnaHQ9IjMyIiBmaWxsPSIjRTg0MTQyIi8+CjxwYXRoIGQ9Ik0xNi4wMDAxIDQuOTk5OUwyOCAyNkg0TDE2LjAwMDEgNC45OTk5WiIgZmlsbD0id2hpdGUiLz4KPC9zdmc+Cg==',
    recommended: '0.05',
    quickAmounts: ['0.01', '0.05', '0.1']
  },
  {
    id: 10,
    name: 'Optimism',
    symbol: 'ETH',
    icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjMyIiBoZWlnaHQ9IjMyIiBmaWxsPSIjRkYwNDIwIi8+CjxwYXRoIGQ9Ik0xNi4wMDAxIDRMMjggMTZMMTYuMDAwMSAyOEw0IDE2TDE2LjAwMDEgNFoiIGZpbGw9IndoaXRlIi8+Cjwvc3ZnPgo=',
    recommended: '0.005',
    quickAmounts: ['0.002', '0.005', '0.01']
  },
  {
    id: 250,
    name: 'Fantom',
    symbol: 'FTM',
    icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjMyIiBoZWlnaHQ9IjMyIiBmaWxsPSIjMTk2OUZGIi8+CjxwYXRoIGQ9Ik0xNiA0TDI4IDE2TDE2IDI4TDQgMTZMMTYgNFoiIGZpbGw9IndoaXRlIi8+Cjwvc3ZnPgo=',
    recommended: '2',
    quickAmounts: ['1', '2', '5']
  }
])

// Computed
const canRefuel = computed(() => {
  return selectedCard.value && 
         selectedChain.value && 
         gasAmount.value && 
         parseFloat(gasAmount.value) > 0 && 
         !isLoading.value &&
         costEstimation.value &&
         parseFloat(costEstimation.value.total) <= parseFloat(selectedCard.value.balance)
})

// Watch for changes to calculate cost
watch([gasAmount, selectedChain], async () => {
  if (gasAmount.value && selectedChain.value && parseFloat(gasAmount.value) > 0) {
    // Mock cost calculation
    const amount = parseFloat(gasAmount.value)
    const bridgeFee = (amount * 0.003).toFixed(4) // 0.3% bridge fee
    const gasFee = '0.5' // Fixed gas fee
    const total = (parseFloat(bridgeFee) + parseFloat(gasFee)).toFixed(4)
    
    costEstimation.value = {
      bridgeFee,
      gasFee,
      total
    }
  } else {
    costEstimation.value = null
  }
})

// Methods
const selectCard = (card) => {
  selectedCard.value = card
}

const selectChain = (chain) => {
  selectedChain.value = chain
  gasAmount.value = ''
}

const loadUserCards = async () => {
  if (!account.value) return
  
  // Mock data
  gasPassCards.value = [
    {
      tokenId: 1,
      balance: '150.25'
    },
    {
      tokenId: 3,
      balance: '89.50'
    }
  ]
  
  if (gasPassCards.value.length > 0) {
    selectCard(gasPassCards.value[0])
  }
}

const loadRecentTransactions = async () => {
  // Mock data
  recentTransactions.value = [
    {
      hash: '0x123...abc',
      chainName: 'Ethereum',
      chainIcon: supportedChains.value[0].icon,
      amount: '0.01',
      symbol: 'ETH',
      cost: '2.5',
      timestamp: '2024-01-15 14:30'
    },
    {
      hash: '0x456...def',
      chainName: 'Polygon',
      chainIcon: supportedChains.value[1].icon,
      amount: '0.5',
      symbol: 'MATIC',
      cost: '1.2',
      timestamp: '2024-01-14 10:20'
    }
  ]
}

const handleRefuel = async () => {
  isLoading.value = true
  currentStep.value = 1
  
  try {
    // Step 1: Confirm transaction
    await new Promise(resolve => setTimeout(resolve, 1000))
    currentStep.value = 2
    
    // Step 2: Bridge
    await new Promise(resolve => setTimeout(resolve, 2000))
    currentStep.value = 3
    
    // Step 3: Transfer Gas
    await new Promise(resolve => setTimeout(resolve, 1500))
    currentStep.value = 4
    
    // Mock transaction hash
    txHash.value = '0x' + Math.random().toString(16).substr(2, 64)
    
    // Update card balance
    const newBalance = (parseFloat(selectedCard.value.balance) - parseFloat(costEstimation.value.total)).toFixed(2)
    selectedCard.value.balance = newBalance
    
    // Add to recent transactions
    recentTransactions.value.unshift({
      hash: txHash.value,
      chainName: selectedChain.value.name,
      chainIcon: selectedChain.value.icon,
      amount: gasAmount.value,
      symbol: selectedChain.value.symbol,
      cost: costEstimation.value.total,
      timestamp: new Date().toLocaleString('zh-TW')
    })
    
    // Reset form
    gasAmount.value = ''
    selectedChain.value = null
    costEstimation.value = null
    
  } catch (error) {
    console.error('Refuel failed:', error)
    alert('補 Gas 失敗，請稍後再試')
  } finally {
    isLoading.value = false
    currentStep.value = 0
  }
}

// Load data when connected
watch([account, chainId], () => {
  if (isConnected.value && chainId.value === 42161) {
    loadUserCards()
    loadRecentTransactions()
  }
}, { immediate: true })

// Set default recipient to current account
watch(account, (newAccount) => {
  if (newAccount && !recipientAddress.value) {
    recipientAddress.value = newAccount
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
  @apply relative bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-4 text-white cursor-pointer transition-all hover:shadow-lg;
}

.gas-pass-card.selected {
  @apply ring-4 ring-orange-300 ring-opacity-50 shadow-lg;
}

.chain-option {
  @apply flex items-center space-x-3 p-4 border border-gray-200 rounded-lg cursor-pointer hover:border-orange-300 hover:bg-orange-50 transition-all;
}

.chain-option.selected {
  @apply border-orange-500 bg-orange-50 ring-2 ring-orange-200;
}

.quick-amount-btn {
  @apply bg-gray-100 hover:bg-orange-500 hover:text-white text-gray-700 font-medium py-2 px-3 rounded-lg transition-colors text-sm;
}

.quick-amount-btn:disabled {
  @apply bg-gray-100 text-gray-400 cursor-not-allowed hover:bg-gray-100 hover:text-gray-400;
}

.transaction-step {
  @apply flex items-start space-x-3 py-3;
}

.transaction-step.active {
  @apply opacity-100;
}

.transaction-step:not(.active) {
  @apply opacity-50;
}

.step-indicator {
  @apply flex-shrink-0;
}

.step-completed {
  @apply w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center;
}

.step-loading {
  @apply w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center;
}

.step-pending {
  @apply w-8 h-8 bg-gray-300 text-gray-600 rounded-full flex items-center justify-center text-sm font-medium;
}

.step-content {
  @apply flex-1 min-w-0;
}

.step-title {
  @apply font-medium text-gray-900;
}

.step-description {
  @apply text-sm text-gray-500;
}

.refuel-transaction {
  @apply bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors;
}
</style>