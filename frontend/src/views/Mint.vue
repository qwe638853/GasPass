<template>
  <Layout>
    <div class="min-h-screen bg-gray-50 py-12">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <!-- Header -->
        <div class="text-center mb-12">
          <h1 class="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            鑄造 GasPass 儲值卡
          </h1>
          <p class="text-lg text-gray-600 max-w-2xl mx-auto">
            使用 USDC 鑄造您的專屬跨鏈 Gas 儲值卡，開啟便捷的多鏈體驗
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
              <p class="text-yellow-700">您需要連接 Web3 錢包才能鑄造儲值卡</p>
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
        <div v-else class="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <!-- Left Panel - Form -->
          <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <h2 class="text-2xl font-semibold text-gray-900 mb-6">鑄造設定</h2>
            
            <form @submit.prevent="handleMint" class="space-y-6">
              <!-- Amount Input -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  初始儲值金額 (USDC)
                </label>
                <div class="relative">
                  <input 
                    v-model="mintAmount"
                    type="number" 
                    step="0.01"
                    min="0"
                    placeholder="輸入 USDC 數量"
                    class="form-input"
                    :disabled="isLoading"
                  />
                  <div class="absolute inset-y-0 right-0 flex items-center pr-3">
                    <span class="text-gray-500 text-sm">USDC</span>
                  </div>
                </div>
                <p class="text-sm text-gray-500 mt-1">
                  最低金額: 10 USDC
                </p>
              </div>

              <!-- Recipient Address -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  接收地址
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

              <!-- Gas Estimation -->
              <div v-if="gasEstimate" class="bg-gray-50 rounded-lg p-4">
                <h4 class="text-sm font-medium text-gray-700 mb-2">交易預估</h4>
                <div class="space-y-1 text-sm text-gray-600">
                  <div class="flex justify-between">
                    <span>鑄造費用:</span>
                    <span>{{ mintAmount }} USDC</span>
                  </div>
                  <div class="flex justify-between">
                    <span>Gas 費用:</span>
                    <span>≈ {{ gasEstimate }} ETH</span>
                  </div>
                </div>
              </div>

              <!-- Submit Button -->
              <button 
                type="submit" 
                class="btn-primary w-full py-4 text-lg"
                :disabled="isLoading || !canMint"
              >
                <span v-if="isLoading" class="flex items-center justify-center">
                  <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  鑄造中...
                </span>
                <span v-else>
                  鑄造儲值卡
                </span>
              </button>
            </form>
          </div>

          <!-- Right Panel - Preview -->
          <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <h2 class="text-2xl font-semibold text-gray-900 mb-6">預覽</h2>
            
            <!-- Card Preview -->
            <div class="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white mb-6">
              <div class="flex items-center justify-between mb-4">
                <img src="../assets/GasPass.png" alt="GasPass" class="h-8 w-auto brightness-0 invert" />
                <span class="text-sm opacity-80">ERC-3525</span>
              </div>
              
              <div class="space-y-2">
                <div class="text-sm opacity-80">儲值金額</div>
                <div class="text-2xl font-bold">
                  {{ mintAmount || '0' }} USDC
                </div>
              </div>
              
              <div class="mt-4 pt-4 border-t border-orange-400 border-opacity-50">
                <div class="text-xs opacity-80">持有者</div>
                <div class="text-sm font-mono">
                  {{ formatAddress(recipientAddress || account) }}
                </div>
              </div>
            </div>

            <!-- Features -->
            <div class="space-y-4">
              <h3 class="text-lg font-semibold text-gray-900">儲值卡特色</h3>
              
              <div class="space-y-3">
                <div class="flex items-start space-x-3">
                  <div class="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <div>
                    <div class="font-medium text-gray-900">跨鏈通用</div>
                    <div class="text-sm text-gray-600">支援主流區塊鏈網路的 Gas 補充</div>
                  </div>
                </div>
                
                <div class="flex items-start space-x-3">
                  <div class="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <div>
                    <div class="font-medium text-gray-900">可轉贈</div>
                    <div class="text-sm text-gray-600">基於 ERC-3525 標準，支援價值轉移</div>
                  </div>
                </div>
                
                <div class="flex items-start space-x-3">
                  <div class="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <div>
                    <div class="font-medium text-gray-900">自動管理</div>
                    <div class="text-sm text-gray-600">支援 AI Agent 智能監控和補充</div>
                  </div>
                </div>
                
                <div class="flex items-start space-x-3">
                  <div class="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <div>
                    <div class="font-medium text-gray-900">安全可靠</div>
                    <div class="text-sm text-gray-600">多重簽名保護，資金安全有保障</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Transaction Status -->
        <div v-if="txHash" class="mt-8 bg-green-50 border border-green-200 rounded-lg p-6">
          <div class="flex items-center">
            <svg class="w-6 h-6 text-green-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <div>
              <h3 class="text-lg font-medium text-green-800">鑄造成功！</h3>
              <p class="text-green-700">
                您的 GasPass 儲值卡已成功鑄造。
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
import { ref, computed, watch } from 'vue'
import Layout from '../components/Layout.vue'
import { useWeb3 } from '../composables/useWeb3'

const { account, chainId, isConnected, switchToArbitrum, formatAddress } = useWeb3()

// Form data
const mintAmount = ref('')
const recipientAddress = ref('')
const isLoading = ref(false)
const gasEstimate = ref('')
const txHash = ref('')

// Computed
const canMint = computed(() => {
  return mintAmount.value && 
         parseFloat(mintAmount.value) >= 10 && 
         !isLoading.value &&
         isConnected.value &&
         chainId.value === 42161
})

// Watch for amount changes to estimate gas
watch(mintAmount, async (newAmount) => {
  if (newAmount && parseFloat(newAmount) >= 10) {
    // Mock gas estimation - in real implementation, call contract
    gasEstimate.value = '0.001'
  } else {
    gasEstimate.value = ''
  }
})

// Set default recipient to current account
watch(account, (newAccount) => {
  if (newAccount && !recipientAddress.value) {
    recipientAddress.value = newAccount
  }
}, { immediate: true })

const handleMint = async () => {
  isLoading.value = true
  
  try {
    // Mock transaction - in real implementation, call smart contract
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Mock transaction hash
    txHash.value = '0x' + Math.random().toString(16).substr(2, 64)
    
    // Reset form
    mintAmount.value = ''
    recipientAddress.value = account.value
    
  } catch (error) {
    console.error('Mint failed:', error)
    alert('鑄造失敗，請稍後再試')
  } finally {
    isLoading.value = false
  }
}
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
</style>