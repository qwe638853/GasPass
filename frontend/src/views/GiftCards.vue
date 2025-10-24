<template>
  <Layout>
    <div class="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
      <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <!-- Header -->
        <div class="text-center mb-12">
          <h1 class="text-4xl font-bold text-gray-900 mb-4">
            <span class="bg-gradient-to-r from-emerald-400 to-teal-500 bg-clip-text text-transparent">
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
            <div class="w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg class="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
              </svg>
            </div>
            <h3 class="text-2xl font-bold text-gray-900 mb-4">請先連接錢包</h3>
            <p class="text-gray-600 mb-8">連接您的錢包後即可開始鑄造和贈送儲值卡</p>
            <button @click="connectWallet" class="btn-primary-hero group relative overflow-hidden">
              <!-- Glow effect -->
              <div class="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl blur-lg opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>
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
            <div class="absolute inset-0 bg-gradient-to-br from-emerald-100/30 to-teal-100/30 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <!-- Content -->
            <div class="relative z-10 flex items-center justify-between">
              <div class="flex items-center gap-4">
                <div class="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <svg class="w-6 h-6 text-white group-hover:rotate-12 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                  </svg>
                </div>
                <div>
                  <h3 class="text-lg font-bold text-gray-900 group-hover:text-emerald-600 transition-colors duration-300">錢包已連接</h3>
                  <p class="text-gray-600 group-hover:text-gray-700 transition-colors duration-300">{{ formatAddress(account) }}</p>
                </div>
              </div>
              <div class="text-right">
                <div class="text-sm text-gray-500 group-hover:text-gray-600 transition-colors duration-300">USDC 餘額</div>
                <div class="text-lg font-bold text-gray-900 group-hover:text-emerald-600 transition-colors duration-300">{{ usdcBalance }} USDC</div>
              </div>
            </div>
            <!-- Shimmer effect -->
            <div class="absolute inset-0 -top-2 -left-2 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12 group-hover:animate-shimmer opacity-0 group-hover:opacity-100"></div>
          </div>

          <!-- Main Content -->
          <!-- 鑄造儲值卡區塊 -->
          <div class="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-8 mb-8 relative overflow-hidden group">
            <!-- Glow effect -->
            <div class="absolute inset-0 bg-gradient-to-br from-emerald-100/20 to-teal-100/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            
            <!-- Content -->
            <div class="relative z-10">
              <div class="flex items-center gap-3 mb-6">
                <div class="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <svg class="w-6 h-6 text-white group-hover:rotate-12 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"></path>
                  </svg>
                </div>
                <h2 class="text-2xl font-bold text-gray-900 group-hover:text-emerald-600 transition-colors duration-300">鑄造儲值卡</h2>
                
                <!-- 贈送記錄按鈕 -->
                <button 
                  @click="showGiftHistory = true"
                  class="ml-auto px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition-colors duration-200 font-medium flex items-center gap-2"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                  </svg>
                  贈送記錄
                </button>
              </div>

              <form @submit.prevent="handleGiftSubmit" class="space-y-6">
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
                        <div class="recipient-icon bg-gradient-to-br from-emerald-500 to-teal-600">
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

                <!-- Card Quantity (shown when recipient is self) -->
                <div v-if="giftForm.recipientType === 'self'">
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

                <!-- Amount per Card (shown when recipient is self) -->
                <div v-if="giftForm.recipientType === 'self'">
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

                <!-- Gift Mode Selection (when other is selected) -->
                <div v-if="giftForm.recipientType === 'other'" class="mt-4 p-4 bg-blue-50 rounded-xl border border-blue-200">
                  <label class="block text-sm font-semibold text-gray-700 mb-3">贈送方式</label>
                  <div class="space-y-3">
                    <label class="gift-mode-option">
                      <input
                        v-model="giftForm.giftMode"
                        type="radio"
                        value="single"
                        class="gift-mode-radio"
                      />
                      <div class="gift-mode-content">
                        <div class="gift-mode-icon bg-gradient-to-br from-blue-400 to-cyan-500">
                          <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                          </svg>
                        </div>
                        <div>
                          <div class="gift-mode-title">單人贈送</div>
                          <div class="gift-mode-desc">贈送給單一接收者</div>
                        </div>
                      </div>
                    </label>

                    <label class="gift-mode-option">
                      <input
                        v-model="giftForm.giftMode"
                        type="radio"
                        value="multiple"
                        class="gift-mode-radio"
                      />
                      <div class="gift-mode-content">
                        <div class="gift-mode-icon bg-gradient-to-br from-purple-500 to-indigo-600">
                          <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                          </svg>
                        </div>
                        <div>
                          <div class="gift-mode-title">多人贈送</div>
                          <div class="gift-mode-desc">同時贈送給多位接收者</div>
                        </div>
                      </div>
                    </label>
                  </div>
                  
                  <!-- Card fields shown when recipient is other and gift mode is single -->
                  <div v-if="giftForm.giftMode === 'single'">
                    <!-- Card Quantity -->
                    <div class="mt-4">
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
                    </div>

                    <!-- Amount per Card -->
                    <div class="mt-4">
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
                    </div>

                    <!-- Single Recipient Address -->
                    <div class="mt-4">
                      <label class="block text-sm font-semibold text-gray-700 mb-3">接收地址</label>
                      <input
                        v-model="giftForm.recipientAddress"
                        type="text"
                        placeholder="輸入接收者錢包地址"
                        class="address-input"
                      />
                      <p class="text-sm text-gray-500 mt-2">請確保地址正確，鑄造後無法更改</p>
                    </div>
                  </div>

                  <!-- Multiple Recipients Table (shown when recipient is other and gift mode is multiple) -->
                  <div v-if="giftForm.giftMode === 'multiple'" class="mt-4">
                    <label class="block text-sm font-semibold text-gray-700 mb-3">多人贈送列表</label>
                    <div class="overflow-x-auto">
                      <table class="min-w-full bg-white border border-gray-200 rounded-lg">
                        <thead>
                          <tr class="bg-gray-50">
                            <th class="py-3 px-4 text-left text-sm font-semibold text-gray-700 border-b border-gray-200">儲值卡數量</th>
                            <th class="py-3 px-4 text-left text-sm font-semibold text-gray-700 border-b border-gray-200">儲值金額 (USDC)</th>
                            <th class="py-3 px-4 text-left text-sm font-semibold text-gray-700 border-b border-gray-200">接收地址</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr v-for="(recipient, index) in multipleRecipients" :key="index" class="hover:bg-gray-50">
                            <td class="py-3 px-4 border-b border-gray-200">
                              <input
                                v-model="recipient.quantity"
                                type="number"
                                min="1"
                                max="100"
                                placeholder="數量"
                                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500"
                              />
                            </td>
                            <td class="py-3 px-4 border-b border-gray-200">
                              <input
                                v-model="recipient.amount"
                                type="number"
                                step="0.01"
                                min="0.01"
                                placeholder="金額"
                                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500"
                              />
                            </td>
                            <td class="py-3 px-4 border-b border-gray-200">
                              <input
                                v-model="recipient.address"
                                type="text"
                                placeholder="錢包地址"
                                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500"
                              />
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    <div class="mt-4 text-sm text-gray-500">
                      <p>請填寫每位接收者的儲值卡數量、金額和錢包地址</p>
                    </div>
                    <!-- Add Row Button -->
                    <div class="mt-4">
                      <button 
                        type="button" 
                        @click="addRecipientRow"
                        class="flex items-center gap-2 px-4 py-2 bg-emerald-100 hover:bg-emerald-200 text-emerald-700 rounded-lg transition-colors duration-200 font-medium"
                      >
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                        </svg>
                        添加接收者
                      </button>
                    </div>
                  </div>
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
                        <span class="font-bold text-emerald-600">{{ costPreview.total }} USDC</span>
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
                  <div class="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl blur-lg opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>
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
        </div>
      </div>
    </div>
    
    <!-- 贈送記錄彈出視窗 -->
    <div v-if="showGiftHistory" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <!-- 背景模糊遮罩 -->
      <div 
        class="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300"
        @click="showGiftHistory = false"
      ></div>
      
      <!-- 彈出視窗 -->
      <div class="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden z-10 transform transition-all duration-300">
        <!-- 視窗標題 -->
        <div class="bg-gradient-to-r from-blue-500 to-cyan-500 p-6">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                </svg>
              </div>
              <h3 class="text-xl font-bold text-white">贈送記錄</h3>
            </div>
            <button 
              @click="showGiftHistory = false"
              class="text-white/80 hover:text-white transition-colors duration-200"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
        </div>
        
        <!-- 視窗內容 -->
        <div class="p-6 overflow-y-auto max-h-[calc(80vh-88px)]">
          <div v-if="giftHistory.length === 0" class="text-center py-8">
            <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
            </div>
            <p class="text-gray-500">還沒有贈送記錄</p>
          </div>

          <div v-else class="space-y-4">
            <div v-for="gift in giftHistory" :key="gift.id" class="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors duration-200">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
                    <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
    </div>
  </Layout>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useWeb3 } from '../composables/useWeb3.js'
import { gasPassService } from '../services/gasPassService.js'
import { contractService } from '../services/contractService.js'
import Layout from '../components/Layout.vue'

// Web3 composable
const { account, isConnected, connectWallet, formatAddress, getUSDCBalance, provider, signer } = useWeb3()

// Data
const usdcBalance = ref('0.00')
const isLoading = ref(false)
const showGiftHistory = ref(false)

// Gift form data
const giftForm = ref({
  quantity: '',
  amountPerCard: '',
  recipientType: 'self', // 'self' or 'other'
  giftMode: 'single', // 'single' or 'multiple'
  recipientAddress: ''
})

// Multiple recipients data for batch gifting
const multipleRecipients = ref([
  { quantity: '', amount: '', address: '' },
  { quantity: '', amount: '', address: '' },
  { quantity: '', amount: '', address: '' },
  { quantity: '', amount: '', address: '' },
  { quantity: '', amount: '', address: '' }
])

// Gift history data (mock data for now)
const giftHistory = ref([
  // {
  //   id: '1',
  //   quantity: 5,
  //   amountPerCard: 100,
  //   totalAmount: 500,
  //   recipientType: 'other',
  //   recipientAddress: '0x742d35Cc6634C0532925a3b8D4C0532925a3b8D4',
  //   date: '2023-06-15'
  // }
])

// Computed
const costPreview = computed(() => {
  if (giftForm.value.recipientType === 'self' || 
      (giftForm.value.recipientType === 'other' && giftForm.value.giftMode === 'single')) {
    // For self or single recipient mode
    if (!giftForm.value.quantity || !giftForm.value.amountPerCard) return null
    
    const quantity = parseInt(giftForm.value.quantity) || 0
    const amountPerCard = parseFloat(giftForm.value.amountPerCard) || 0
    const totalAmount = quantity * amountPerCard
    const mintFee = totalAmount * 0.01 // 1% minting fee
    const total = totalAmount + mintFee
    
    return {
      totalAmount: totalAmount.toFixed(2),
      mintFee: mintFee.toFixed(2),
      total: total.toFixed(2)
    }
  } else if (giftForm.value.recipientType === 'other' && giftForm.value.giftMode === 'multiple') {
    // For multiple recipients mode
    if (!multipleRecipients.value || multipleRecipients.value.length === 0) return null
    
    let totalAmount = 0
    
    // Calculate total for all valid recipients
    for (const recipient of multipleRecipients.value) {
      const quantity = parseInt(recipient.quantity) || 0
      const amount = parseFloat(recipient.amount) || 0
      totalAmount += quantity * amount
    }
    
    const mintFee = totalAmount * 0.01 // 1% minting fee
    const total = totalAmount + mintFee
    
    return {
      totalAmount: totalAmount.toFixed(2),
      mintFee: mintFee.toFixed(2),
      total: total.toFixed(2)
    }
  }
  
  return null
})

const canSubmit = computed(() => {
  if (giftForm.value.recipientType === 'self' || 
      (giftForm.value.recipientType === 'other' && giftForm.value.giftMode === 'single')) {
    // For self or single recipient mode
    if (!giftForm.value.quantity || !giftForm.value.amountPerCard) return false
    
    const quantity = parseInt(giftForm.value.quantity)
    const amountPerCard = parseFloat(giftForm.value.amountPerCard)
    
    if (quantity < 1 || quantity > 100) return false
    if (amountPerCard < 0.01) return false
    
    // If gifting to others, check address for single mode
    if (giftForm.value.recipientType === 'other' && giftForm.value.giftMode === 'single') {
      return giftForm.value.recipientAddress && giftForm.value.recipientAddress.length > 0
    }
    
    return true
  } else if (giftForm.value.recipientType === 'other' && giftForm.value.giftMode === 'multiple') {
    // For multiple recipients mode
    if (!multipleRecipients.value || multipleRecipients.value.length === 0) return false
    
    // Check if at least one recipient has valid data
    let hasValidRecipient = false
    
    for (const recipient of multipleRecipients.value) {
      const quantity = parseInt(recipient.quantity)
      const amount = parseFloat(recipient.amount)
      
      // Skip empty rows
      if (!recipient.quantity && !recipient.amount && !recipient.address) continue
      
      // Validate current row
      if (quantity && (quantity < 1 || quantity > 100)) return false
      if (amount && amount < 0.01) return false
      if (!recipient.address || recipient.address.length === 0) return false
      
      hasValidRecipient = true
    }
    
    return hasValidRecipient
  }
  
  return false
})

// Methods
const setQuantity = (quantity) => {
  giftForm.value.quantity = quantity.toString()
  calculateTotalCost()
}

const setAmountPerCard = (amount) => {
  giftForm.value.amountPerCard = amount.toString()
  calculateTotalCost()
}

const calculateTotalCost = () => {
  // This will trigger the computed property to recalculate
}

const addRecipientRow = () => {
  multipleRecipients.value.push({
    quantity: '',
    amount: '',
    address: ''
  })
}

const handleGiftSubmit = async () => {
  if (!canSubmit.value) return
  
  isLoading.value = true
  
  try {
    // Initialize contract service
    await contractService.init(provider.value, signer.value)
    
    // Handle gift submission based on recipient type and gift mode
    if (giftForm.value.recipientType === 'self') {
      // Mint cards to self
      await contractService.mintCardsToSelf(
        account.value,
        giftForm.value.quantity,
        giftForm.value.amountPerCard
      )
    } else if (giftForm.value.recipientType === 'other') {
      if (giftForm.value.giftMode === 'single') {
        // Mint cards to single recipient
        await contractService.mintCardsToRecipient(
          account.value,
          giftForm.value.recipientAddress,
          giftForm.value.quantity,
          giftForm.value.amountPerCard
        )
      } else {
        // Multiple recipient mode
        // Filter out empty rows
        const validRecipients = multipleRecipients.value.filter(recipient => 
          recipient.quantity && recipient.amount && recipient.address
        )
        
        // Mint cards to each recipient
        for (const recipient of validRecipients) {
          await contractService.mintCardsToRecipient(
            account.value,
            recipient.address,
            recipient.quantity,
            recipient.amount
          )
        }
      }
    }
    
    // Add to gift history
    if (giftForm.value.recipientType === 'self' || 
        (giftForm.value.recipientType === 'other' && giftForm.value.giftMode === 'single')) {
      // For self or single recipient mode
      giftHistory.value.unshift({
        id: Date.now().toString(),
        quantity: parseInt(giftForm.value.quantity),
        amountPerCard: parseFloat(giftForm.value.amountPerCard),
        totalAmount: costPreview.value.total,
        recipientType: giftForm.value.recipientType,
        recipientAddress: giftForm.value.recipientAddress,
        date: new Date().toLocaleDateString('zh-TW')
      })
    } else if (giftForm.value.recipientType === 'other' && giftForm.value.giftMode === 'multiple') {
      // For multiple recipients mode, add each recipient as a separate entry
      const validRecipients = multipleRecipients.value.filter(recipient => 
        recipient.quantity && recipient.amount && recipient.address
      )
      
      for (const recipient of validRecipients) {
        giftHistory.value.unshift({
          id: Date.now().toString() + Math.random(),
          quantity: parseInt(recipient.quantity),
          amountPerCard: parseFloat(recipient.amount),
          totalAmount: (parseInt(recipient.quantity) * parseFloat(recipient.amount)).toFixed(2),
          recipientType: 'other',
          recipientAddress: recipient.address,
          date: new Date().toLocaleDateString('zh-TW')
        })
      }
    }
    
    // Reset form
    giftForm.value.quantity = ''
    giftForm.value.amountPerCard = ''
    giftForm.value.recipientAddress = ''
    
    // Reset multiple recipients (keep 5 empty rows)
    multipleRecipients.value = [
      { quantity: '', amount: '', address: '' },
      { quantity: '', amount: '', address: '' },
      { quantity: '', amount: '', address: '' },
      { quantity: '', amount: '', address: '' },
      { quantity: '', amount: '', address: '' }
    ]
    
    // Show success message
    alert('儲值卡鑄造成功！')
  } catch (error) {
    console.error('Gift submission failed:', error)
    alert('鑄造失敗: ' + error.message)
  } finally {
    isLoading.value = false
  }
}

const loadUserData = async () => {
  if (!account.value || !provider.value || !signer.value) return
  
  try {
    // Initialize contract service
    await contractService.init(provider.value, signer.value)
    
    // Load USDC balance
    usdcBalance.value = await contractService.getUSDCBalance(account.value)
    
    // Load gift history (would come from backend in real implementation)
    // giftHistory.value = await gasPassService.getGiftHistory(account.value)
  } catch (error) {
    console.error('Failed to load user data:', error)
  }
}

// Lifecycle
onMounted(async () => {
  if (isConnected.value) {
    await loadUserData()
  }
})

// Watch for wallet connection
watch(isConnected, async (connected) => {
  if (connected) {
    await loadUserData()
  }
})
</script>

<style scoped>
/* Hero Buttons */
.btn-primary-hero {
  @apply bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold py-4 px-8 rounded-xl text-lg transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-emerald-500/30 focus:ring-offset-2 shadow-lg hover:shadow-xl hover:scale-105;
}

/* Primary Button - 增加上下內邊距 */
.btn-primary {
  @apply py-5;
}

/* Form Inputs */
.quantity-input, .amount-input, .address-input {
  @apply w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all duration-200 bg-white/80 backdrop-blur-sm;
}

.currency-label {
  @apply absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium;
}

/* Quick Selection Buttons */
.quantity-btn, .amount-btn {
  @apply px-3 py-1 text-sm bg-gray-100 hover:bg-emerald-100 text-gray-700 hover:text-emerald-700 rounded-lg transition-all duration-200 font-medium;
}

/* Recipient Options */
.recipient-option {
  @apply block cursor-pointer;
}

.recipient-radio {
  @apply sr-only;
}

.recipient-content {
  @apply flex items-center gap-4 p-4 border-2 border-gray-200 rounded-xl hover:border-emerald-300 transition-all duration-200;
}

.recipient-option:has(.recipient-radio:checked) .recipient-content {
  @apply border-emerald-500 bg-emerald-50;
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

/* Gift Mode Options */
.gift-mode-option {
  @apply block cursor-pointer;
}

.gift-mode-radio {
  @apply sr-only;
}

.gift-mode-content {
  @apply flex items-center gap-4 p-4 border-2 border-gray-200 rounded-xl hover:border-blue-300 transition-all duration-200;
}

.gift-mode-option:has(.gift-mode-radio:checked) .gift-mode-content {
  @apply border-blue-500 bg-blue-50;
}

.gift-mode-icon {
  @apply w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0;
}

.gift-mode-title {
  @apply font-semibold text-gray-900;
}

.gift-mode-desc {
  @apply text-sm text-gray-600;
}

/* Cost Preview */
.cost-preview {
  @apply bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl p-4;
}

/* Gift Items */
.gift-item {
  @apply p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors duration-200;
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