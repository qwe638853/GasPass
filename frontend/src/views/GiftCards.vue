<template>
  <Layout>
    <div class="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
      <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <!-- Header -->
        <div class="text-center mb-12">
          <h1 class="text-4xl font-bold text-gray-900 mb-4">
            <span class="bg-gradient-to-r from-amber-500 to-orange-600 bg-clip-text text-transparent">
              贈送儲值卡
            </span>
          </h1>
          <p class="text-xl text-gray-600 max-w-3xl mx-auto">
            大量鑄造 GasPass 儲值卡，可以贈送給自己或其他人，享受 ERC-3525 的轉贈功能
          </p>
        </div>

        <!-- Not Connected State -->
        <div v-if="!isConnected" class="text-center py-16">
          <div class="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-12 max-w-2xl mx-auto">
            <div class="w-20 h-20 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg class="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
              </svg>
            </div>
            <h3 class="text-2xl font-bold text-gray-900 mb-4">請先連接錢包</h3>
            <p class="text-gray-600 mb-8">連接您的錢包後即可開始鑄造和贈送儲值卡</p>
            <button @click="connectWallet" class="btn-primary-hero group relative overflow-hidden">
              <!-- Glow effect -->
              <div class="absolute inset-0 bg-gradient-to-r from-amber-400 to-orange-500 rounded-xl blur-lg opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>
              <!-- Button content -->
              <span class="relative flex items-center justify-center gap-3 z-10">
                <svg class="w-6 h-6 group-hover:rotate-12 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path>
                </svg>
                連接錢包
              </span>
              <!-- Shimmer effect -->
              <div class="absolute inset-0 -top-2 -left-2 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 group-hover:animate-shimmer"></div>
            </button>
          </div>
        </div>

        <!-- Connected State -->
        <div v-else>
          <!-- User Info -->
          <div class="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-6 mb-8 relative overflow-hidden group">
            <!-- Glow effect -->
            <div class="absolute inset-0 bg-gradient-to-br from-amber-100/30 to-orange-100/30 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <!-- Content -->
            <div class="relative z-10 flex items-center justify-between">
              <div class="flex items-center gap-4">
                <div class="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <svg class="w-6 h-6 text-white group-hover:rotate-12 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                  </svg>
                </div>
                <div>
                  <h3 class="text-lg font-bold text-gray-900 group-hover:text-amber-600 transition-colors duration-300">錢包已連接</h3>
                  <p class="text-gray-600 group-hover:text-gray-700 transition-colors duration-300">{{ formatAddress(account) }}</p>
                </div>
              </div>
              <div class="text-right">
                <div class="text-sm text-gray-500 group-hover:text-gray-600 transition-colors duration-300">USDC 餘額</div>
                <div class="text-lg font-bold text-gray-900 group-hover:text-amber-600 transition-colors duration-300">{{ usdcBalance }} USDC</div>
              </div>
            </div>
            <!-- Shimmer effect -->
            <div class="absolute inset-0 -top-2 -left-2 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12 group-hover:animate-shimmer opacity-0 group-hover:opacity-100"></div>
          </div>

          <!-- Main Content -->
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <!-- Gift Form -->
            <div class="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-8 relative overflow-hidden group">
              <!-- Glow effect -->
              <div class="absolute inset-0 bg-gradient-to-br from-amber-100/20 to-orange-100/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              <!-- Content -->
              <div class="relative z-10">
                <div class="flex items-center gap-3 mb-6">
                  <div class="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <svg class="w-6 h-6 text-white group-hover:rotate-12 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"></path>
                    </svg>
                  </div>
                  <h2 class="text-2xl font-bold text-gray-900 group-hover:text-amber-600 transition-colors duration-300">鑄造儲值卡</h2>
                </div>

                <form @submit.prevent="handleGiftSubmit" class="space-y-6">
                  <!-- Card Quantity -->
                  <div>
                    <label class="block text-sm font-semibold text-gray-700 mb-3">儲值卡數量</label>
                    <div class="relative">
                      <input
                        v-model="giftForm.quantity"
                        type="number"
                        min="1"
                        max="100"
                        placeholder="輸入數量 (1-100)"
                        class="quantity-input"
                        @input="calculateTotalCost"
                      />
                      <div class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                        張
                      </div>
                    </div>
                    <div class="flex gap-2 mt-2">
                      <button type="button" @click="setQuantity(5)" class="quantity-btn">5</button>
                      <button type="button" @click="setQuantity(10)" class="quantity-btn">10</button>
                      <button type="button" @click="setQuantity(20)" class="quantity-btn">20</button>
                      <button type="button" @click="setQuantity(50)" class="quantity-btn">50</button>
                    </div>
                  </div>

                  <!-- Amount per Card -->
                  <div>
                    <label class="block text-sm font-semibold text-gray-700 mb-3">每張儲值金額</label>
                    <div class="relative">
                      <input
                        v-model="giftForm.amountPerCard"
                        type="number"
                        step="0.01"
                        min="0.01"
                        placeholder="輸入金額"
                        class="amount-input"
                        @input="calculateTotalCost"
                      />
                      <span class="currency-label">USDC</span>
                    </div>
                    <div class="flex gap-2 mt-2">
                      <button type="button" @click="setAmountPerCard(10)" class="amount-btn">$10</button>
                      <button type="button" @click="setAmountPerCard(50)" class="amount-btn">$50</button>
                      <button type="button" @click="setAmountPerCard(100)" class="amount-btn">$100</button>
                      <button type="button" @click="setAmountPerCard(500)" class="amount-btn">$500</button>
                    </div>
                  </div>

                  <!-- Recipient Type -->
                  <div>
                    <label class="block text-sm font-semibold text-gray-700 mb-3">贈送對象</label>
                    <div class="space-y-3">
                      <label class="recipient-option">
                        <input
                          v-model="giftForm.recipientType"
                          type="radio"
                          value="self"
                          class="recipient-radio"
                        />
                        <div class="recipient-content">
                          <div class="recipient-icon bg-gradient-to-br from-amber-400 to-orange-500">
                            <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                            </svg>
                          </div>
                          <div>
                            <div class="recipient-title">鑄造到我的錢包</div>
                            <div class="recipient-desc">儲值卡將直接添加到您的錢包中</div>
                          </div>
                        </div>
                      </label>

                      <label class="recipient-option">
                        <input
                          v-model="giftForm.recipientType"
                          type="radio"
                          value="other"
                          class="recipient-radio"
                        />
                        <div class="recipient-content">
                          <div class="recipient-icon bg-gradient-to-br from-blue-500 to-cyan-500">
                            <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"></path>
                            </svg>
                          </div>
                          <div>
                            <div class="recipient-title">贈送給其他人</div>
                            <div class="recipient-desc">直接鑄造到指定地址</div>
                          </div>
                        </div>
                      </label>
                    </div>
                  </div>

                  <!-- Recipient Address (if other) -->
                  <div v-if="giftForm.recipientType === 'other'">
                    <label class="block text-sm font-semibold text-gray-700 mb-3">接收地址</label>
                    <input
                      v-model="giftForm.recipientAddress"
                      type="text"
                      placeholder="輸入接收者錢包地址"
                      class="address-input"
                    />
                    <p class="text-sm text-gray-500 mt-2">請確保地址正確，鑄造後無法更改</p>
                  </div>

                  <!-- Cost Preview -->
                  <div v-if="costPreview" class="cost-preview">
                    <h4 class="text-lg font-semibold text-gray-900 mb-4">費用預覽</h4>
                    <div class="space-y-3">
                      <div class="flex justify-between">
                        <span class="text-gray-600">儲值卡數量:</span>
                        <span class="font-semibold">{{ giftForm.quantity }} 張</span>
                      </div>
                      <div class="flex justify-between">
                        <span class="text-gray-600">每張金額:</span>
                        <span class="font-semibold">{{ giftForm.amountPerCard }} USDC</span>
                      </div>
                      <div class="flex justify-between">
                        <span class="text-gray-600">總儲值金額:</span>
                        <span class="font-semibold">{{ costPreview.totalAmount }} USDC</span>
                      </div>
                      <div class="flex justify-between">
                        <span class="text-gray-600">鑄造費用:</span>
                        <span class="font-semibold">{{ costPreview.mintFee }} USDC</span>
                      </div>
                      <div class="border-t pt-3">
                        <div class="flex justify-between text-lg">
                          <span class="font-bold text-gray-900">總費用:</span>
                          <span class="font-bold text-amber-600">{{ costPreview.total }} USDC</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Submit Button -->
                  <button
                    type="submit"
                    :disabled="!canSubmit"
                    class="btn-primary w-full group relative overflow-hidden"
                    :class="{ 'loading': isLoading }"
                  >
                    <!-- Glow effect -->
                    <div class="absolute inset-0 bg-gradient-to-r from-amber-400 to-orange-500 rounded-xl blur-lg opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <!-- Button content -->
                    <span v-if="isLoading" class="relative flex items-center justify-center gap-2 z-10">
                      <div class="loading-spinner"></div>
                      鑄造中...
                    </span>
                    <span v-else class="relative flex items-center justify-center gap-2 z-10">
                      <svg class="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                      </svg>
                      {{ giftForm.recipientType === 'self' ? '鑄造儲值卡' : '贈送儲值卡' }}
                    </span>
                    <!-- Shimmer effect -->
                    <div class="absolute inset-0 -top-2 -left-2 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 group-hover:animate-shimmer"></div>
                  </button>
                </form>
              </div>
            </div>

            <!-- Gift History & Info -->
            <div class="space-y-6">
              <!-- Gift History -->
              <div class="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-6 relative overflow-hidden group">
                <!-- Glow effect -->
                <div class="absolute inset-0 bg-gradient-to-br from-blue-100/20 to-cyan-100/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                <!-- Content -->
                <div class="relative z-10">
                  <div class="flex items-center gap-3 mb-6">
                    <div class="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <svg class="w-6 h-6 text-white group-hover:rotate-12 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                      </svg>
                    </div>
                    <h3 class="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors duration-300">贈送記錄</h3>
                  </div>

                  <div v-if="giftHistory.length === 0" class="text-center py-8">
                    <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                      </svg>
                    </div>
                    <p class="text-gray-500">還沒有贈送記錄</p>
                  </div>

                  <div v-else class="space-y-3">
                    <div v-for="gift in giftHistory" :key="gift.id" class="gift-item">
                      <div class="flex items-center justify-between">
                        <div class="flex items-center gap-3">
                          <div class="w-8 h-8 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg flex items-center justify-center">
                            <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
                            </svg>
                          </div>
                          <div>
                            <div class="font-semibold text-gray-900">{{ gift.quantity }} 張儲值卡</div>
                            <div class="text-sm text-gray-500">{{ gift.recipientType === 'self' ? '鑄造到我的錢包' : '贈送給 ' + formatAddress(gift.recipientAddress) }}</div>
                          </div>
                        </div>
                        <div class="text-right">
                          <div class="font-semibold text-gray-900">{{ gift.totalAmount }} USDC</div>
                          <div class="text-sm text-gray-500">{{ gift.date }}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- ERC-3525 Info -->
              <div class="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-6 relative overflow-hidden group">
                <!-- Glow effect -->
                <div class="absolute inset-0 bg-gradient-to-br from-purple-100/20 to-pink-100/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                <!-- Content -->
                <div class="relative z-10">
                  <div class="flex items-center gap-3 mb-4">
                    <div class="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <svg class="w-6 h-6 text-white group-hover:rotate-12 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                    </div>
                    <h3 class="text-xl font-bold text-gray-900 group-hover:text-purple-600 transition-colors duration-300">ERC-3525 特色</h3>
                  </div>

                  <div class="space-y-3">
                    <div class="feature-item">
                      <div class="feature-icon">🎁</div>
                      <div>
                        <div class="feature-title">可轉贈</div>
                        <div class="feature-desc">儲值卡可以輕鬆轉贈給其他人</div>
                      </div>
                    </div>
                    <div class="feature-item">
                      <div class="feature-icon">💎</div>
                      <div>
                        <div class="feature-title">可分割</div>
                        <div class="feature-desc">一張儲值卡可以分割成多張小額卡片</div>
                      </div>
                    </div>
                    <div class="feature-item">
                      <div class="feature-icon">🔄</div>
                      <div>
                        <div class="feature-title">可合併</div>
                        <div class="feature-desc">多張儲值卡可以合併成一張大額卡片</div>
                      </div>
                    </div>
                    <div class="feature-item">
                      <div class="feature-icon">⚡</div>
                      <div>
                        <div class="feature-title">即時到賬</div>
                        <div class="feature-desc">轉贈後立即到賬，無需等待</div>
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
import { ref, computed, onMounted } from 'vue'
import Layout from '../components/Layout.vue'
import { useWeb3 } from '../composables/useWeb3.js'
import { giftCardService } from '../services/giftCardService.js'

const { account, isConnected, connectWallet, formatAddress, getUSDCBalance } = useWeb3()

// Form data
const giftForm = ref({
  quantity: 1,
  amountPerCard: 10,
  recipientType: 'self',
  recipientAddress: ''
})

// State
const isLoading = ref(false)
const usdcBalance = ref('0.00')
const giftHistory = ref([])
const costPreview = ref(null)

// Computed
const canSubmit = computed(() => {
  if (!giftForm.value.quantity || !giftForm.value.amountPerCard) return false
  if (giftForm.value.recipientType === 'other' && !giftForm.value.recipientAddress) return false
  return true
})

// Methods
const setQuantity = (quantity) => {
  giftForm.value.quantity = quantity
  calculateTotalCost()
}

const setAmountPerCard = (amount) => {
  giftForm.value.amountPerCard = amount
  calculateTotalCost()
}

const calculateTotalCost = () => {
  if (!giftForm.value.quantity || !giftForm.value.amountPerCard) {
    costPreview.value = null
    return
  }

  const totalAmount = giftForm.value.quantity * giftForm.value.amountPerCard
  const mintFee = giftForm.value.quantity * 0.1 // 每張卡 0.1 USDC 鑄造費
  const total = totalAmount + mintFee

  costPreview.value = {
    totalAmount: totalAmount.toFixed(2),
    mintFee: mintFee.toFixed(2),
    total: total.toFixed(2)
  }
}

const handleGiftSubmit = async () => {
  if (!canSubmit.value) return

  isLoading.value = true
  try {
    const result = await giftCardService.giftCards({
      quantity: giftForm.value.quantity,
      amountPerCard: giftForm.value.amountPerCard,
      recipientType: giftForm.value.recipientType,
      recipientAddress: giftForm.value.recipientAddress || account.value
    })

    if (result.success) {
      // Add to history
      giftHistory.value.unshift({
        id: Date.now(),
        quantity: giftForm.value.quantity,
        totalAmount: (giftForm.value.quantity * giftForm.value.amountPerCard).toFixed(2),
        recipientType: giftForm.value.recipientType,
        recipientAddress: giftForm.value.recipientAddress || account.value,
        date: new Date().toLocaleDateString()
      })

      // Reset form
      giftForm.value = {
        quantity: 1,
        amountPerCard: 10,
        recipientType: 'self',
        recipientAddress: ''
      }
      costPreview.value = null

      alert('儲值卡鑄造成功！')
    } else {
      alert('鑄造失敗：' + result.error)
    }
  } catch (error) {
    console.error('Gift cards error:', error)
    alert('鑄造失敗：' + error.message)
  } finally {
    isLoading.value = false
  }
}

// Lifecycle
onMounted(async () => {
  if (isConnected.value) {
    usdcBalance.value = await getUSDCBalance()
    giftHistory.value = await giftCardService.getGiftHistory()
  }
})
</script>

<style scoped>
/* Hero Buttons */
.btn-primary-hero {
  @apply bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold py-4 px-8 rounded-xl text-lg transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-amber-500/30 focus:ring-offset-2 shadow-lg hover:shadow-xl hover:scale-105;
}

/* Form Inputs */
.quantity-input, .amount-input, .address-input {
  @apply w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all duration-200 bg-white/80 backdrop-blur-sm;
}

.currency-label {
  @apply absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium;
}

/* Quick Selection Buttons */
.quantity-btn, .amount-btn {
  @apply px-3 py-1 text-sm bg-gray-100 hover:bg-amber-100 text-gray-700 hover:text-amber-700 rounded-lg transition-all duration-200 font-medium;
}

/* Recipient Options */
.recipient-option {
  @apply block cursor-pointer;
}

.recipient-radio {
  @apply sr-only;
}

.recipient-content {
  @apply flex items-center gap-4 p-4 border-2 border-gray-200 rounded-xl hover:border-amber-300 transition-all duration-200;
}

.recipient-option:has(.recipient-radio:checked) .recipient-content {
  @apply border-amber-500 bg-amber-50;
}

.recipient-icon {
  @apply w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0;
}

.recipient-title {
  @apply font-semibold text-gray-900;
}

.recipient-desc {
  @apply text-sm text-gray-600;
}

/* Cost Preview */
.cost-preview {
  @apply bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-4;
}

/* Gift Items */
.gift-item {
  @apply p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors duration-200;
}

/* Feature Items */
.feature-item {
  @apply flex items-center gap-3 p-2;
}

.feature-icon {
  @apply text-2xl flex-shrink-0;
}

.feature-title {
  @apply font-semibold text-gray-900 text-sm;
}

.feature-desc {
  @apply text-xs text-gray-600;
}

/* Loading state */
.loading {
  @apply opacity-75 cursor-not-allowed;
}

/* Enhanced animations */
@keyframes shimmer {
  0% { transform: translateX(-100%) skewX(-12deg); }
  100% { transform: translateX(200%) skewX(-12deg); }
}

.animate-shimmer {
  animation: shimmer 2s ease-in-out;
}
</style>
