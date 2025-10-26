<template>
  <Layout>
    <div class="min-h-screen card-background py-8 relative overflow-hidden">
      <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <!-- Header -->
        <div class="flex items-center justify-between mb-12">
          <div class="flex-1">
            <h1 class="text-4xl font-bold text-white mb-4">
              <span class="bg-gradient-to-r from-emerald-400 to-teal-500 bg-clip-text text-transparent">
                Digital Asset Distribution
              </span>
            </h1>
            <p class="text-xl text-emerald-200 max-w-3xl">
              Mint GasPass gift cards in bulk and send them to yourself or others, enjoying ERC-3525 transfer capabilities
            </p>
          </div>
          <div class="flex-shrink-0 flex items-center gap-4">
            <!-- Wallet Balance -->
            <div class="balance-display-premium">
              <div class="balance-header">
                <div class="balance-icon">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
                  </svg>
                </div>
                <span class="balance-label">USDC Balance</span>
                <button 
                  @click="refreshBalance"
                  class="refresh-btn"
                  :disabled="isRefreshingBalance"
                >
                  <svg class="w-3 h-3" :class="{ 'animate-spin': isRefreshingBalance }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                  </svg>
                </button>
              </div>
              <div class="balance-amount">
                <span class="balance-value">{{ parseFloat(usdcBalance).toFixed(2) }}</span>
                <span class="balance-currency">USDC</span>
              </div>
            </div>
            
            <!-- Gift History Button -->
            <button 
              @click="showGiftHistory = true"
              class="px-6 py-3 bg-yellow-400/20 hover:bg-yellow-400/30 text-yellow-300 hover:text-yellow-200 rounded-xl transition-all duration-300 font-medium flex items-center gap-3 border border-yellow-400/30 hover:border-yellow-400/50 backdrop-blur-sm"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
              </svg>
              Gift History
            </button>
          </div>
        </div>

        <!-- Not Connected State -->
        <div v-if="!isConnected" class="text-center py-16">
          <div class="bg-white/10 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-12 max-w-2xl mx-auto">
            <div class="w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg class="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
              </svg>
            </div>
            <h3 class="text-2xl font-bold text-white mb-4">Please Connect Your Wallet</h3>
            <p class="text-emerald-200 mb-8">Connect your wallet to start minting and gifting cards</p>
            <button @click="connectWallet" class="btn-primary-hero group relative overflow-hidden">
              <!-- Glow effect -->
              <div class="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl blur-lg opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>
              <!-- Button content -->
              <span class="relative flex items-center justify-center gap-3 z-10">
                <svg class="w-6 h-6 group-hover:rotate-12 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path>
                </svg>
                Connect Wallet
              </span>
              <!-- Shimmer effect -->
              <div class="absolute inset-0 -top-2 -left-2 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 group-hover:animate-shimmer"></div>
            </button>
          </div>
        </div>

        <!-- Connected State -->
        <div v-else>
          <!-- Main Content -->
          <!-- 鑄造儲值卡區塊 -->
          <div class="gift-card-container rounded-3xl shadow-2xl border border-white/30 p-8 mb-8 relative overflow-hidden group">
            <!-- Content -->
            <div class="relative z-10">
              <!-- Gift Card Title Section -->
              <div class="gift-card-title-section">
                <h2 class="gift-card-main-title">GIFT</h2>
                <h3 class="gift-card-sub-title">CARD</h3>
                </div>
              
              <div class="grid grid-cols-1 lg:grid-cols-4 gap-8">
                <!-- Left Sidebar - Recipient Selection -->
                <div class="lg:col-span-1">
                  <div class="metallic-card-secondary rounded-xl shadow-lg border border-white/20 p-6 sticky top-8">
                    <h3 class="text-lg font-bold text-white mb-4">Recipient</h3>
                    <div class="space-y-3">
                <button 
                        @click="giftForm.recipientType = 'self'"
                        class="w-full recipient-sidebar-option"
                        :class="{ 'recipient-sidebar-active': giftForm.recipientType === 'self' }"
                      >
                        <div class="flex items-center gap-2 p-2 rounded-lg transition-all duration-200">
                          <div class="w-6 h-6 flex items-center justify-center flex-shrink-0">
                            <svg class="w-3 h-3 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                            </svg>
                          </div>
                          <div class="text-left">
                            <div class="font-semibold text-sm text-white whitespace-nowrap">Mint to My Wallet</div>
                            <div class="text-xs text-emerald-200">Direct to your wallet</div>
                          </div>
                      </div>
                      </button>

                      <button
                        @click="giftForm.recipientType = 'other'"
                        class="w-full recipient-sidebar-option"
                        :class="{ 'recipient-sidebar-active': giftForm.recipientType === 'other' }"
                      >
                        <div class="flex items-center gap-2 p-2 rounded-lg transition-all duration-200">
                          <div class="w-6 h-6 flex items-center justify-center flex-shrink-0">
                            <svg class="w-3 h-3 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"></path>
                            </svg>
                          </div>
                          <div class="text-left">
                            <div class="font-semibold text-sm text-white">Gift to Others</div>
                            <div class="text-xs text-emerald-200 whitespace-nowrap">Send to specific address</div>
                          </div>
                      </div>
                      </button>
                    </div>
                  </div>
                </div>

                <!-- Right Content - Form -->
                <div class="lg:col-span-3">
                  <form @submit.prevent="handleGiftSubmit" class="space-y-6">

                <!-- Card Quantity (shown when recipient is self) -->
                <div v-if="giftForm.recipientType === 'self'">
                  <label class="block text-sm font-semibold text-emerald-200 mb-3">Card Quantity</label>
                  <div class="relative">
                    <input
                      v-model="giftForm.quantity"
                      type="number"
                      min="1"
                      max="100"
                      placeholder="Enter quantity (1-100)"
                      class="quantity-input"
                      @input="calculateTotalCost"
                    />
                    <div class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                      cards
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
                  <label class="block text-sm font-semibold text-emerald-200 mb-3">Amount per Card</label>
                  <div class="relative">
                    <input
                      v-model="giftForm.amountPerCard"
                      type="number"
                      step="0.01"
                      min="0.01"
                      placeholder="Enter amount"
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
                <div v-if="giftForm.recipientType === 'other'" class="mt-4 p-4 metallic-card-secondary rounded-xl border border-gray-400/30 backdrop-blur-sm">
                  <label class="block text-sm font-semibold text-emerald-200 mb-3">Gift Mode</label>
                  <div class="flex gap-3">
                    <button
                      @click="giftForm.giftMode = 'single'"
                      class="gift-mode-tab-button flex-1"
                      :class="{ 'gift-mode-tab-active': giftForm.giftMode === 'single' }"
                    >
                      Single Recipient
                    </button>

                    <button
                      @click="giftForm.giftMode = 'multiple'"
                      class="gift-mode-tab-button flex-1"
                      :class="{ 'gift-mode-tab-active': giftForm.giftMode === 'multiple' }"
                    >
                      Multiple Recipients
                    </button>
                  </div>
                  
                  <!-- Card fields shown when recipient is other and gift mode is single -->
                  <div v-if="giftForm.giftMode === 'single'">
                    <!-- Card Quantity -->
                    <div class="mt-4">
                      <label class="block text-sm font-semibold text-emerald-200 mb-3">Card Quantity</label>
                      <div class="relative">
                        <input
                          v-model="giftForm.quantity"
                          type="number"
                          min="1"
                          max="100"
                          placeholder="Enter quantity (1-100)"
                          class="quantity-input"
                          @input="calculateTotalCost"
                        />
                        <div class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
        History
                        </div>
                      </div>
                    </div>

                    <!-- Amount per Card -->
                    <div class="mt-4">
                      <label class="block text-sm font-semibold text-emerald-200 mb-3">Amount per Card</label>
                      <div class="relative">
                        <input
                          v-model="giftForm.amountPerCard"
                          type="number"
                          step="0.01"
                          min="0.01"
                          placeholder="Enter amount"
                          class="amount-input"
                          @input="calculateTotalCost"
                        />
                        <span class="currency-label">USDC</span>
                      </div>
                    </div>

                    <!-- Single Recipient Address -->
                    <div class="mt-4">
                      <label class="block text-sm font-semibold text-emerald-200 mb-3">Recipient Address</label>
                      <input
                        v-model="giftForm.recipientAddress"
                        type="text"
                        placeholder="Enter recipient wallet address"
                        class="address-input"
                      />
                      <p class="text-sm text-emerald-300 mt-2">Please ensure the address is correct, cannot be changed after minting</p>
                    </div>
                  </div>

                  <!-- Multiple Recipients Table (shown when recipient is other and gift mode is multiple) -->
                  <div v-if="giftForm.giftMode === 'multiple'" class="mt-4">
                    <label class="block text-sm font-semibold text-emerald-200 mb-3">Multiple Recipients List</label>
                    <div>
                      <table class="min-w-full metallic-card-secondary border border-white/20 rounded-xl">
                        <thead>
                          <tr class="bg-gray-500/20">
                            <th class="py-3 px-4 text-left text-sm font-semibold text-white border-b border-gray-400/30">Card Quantity</th>
                            <th class="py-3 px-4 text-left text-sm font-semibold text-white border-b border-gray-400/30">Amount (USDC)</th>
                            <th class="py-3 px-4 text-left text-sm font-semibold text-white border-b border-gray-400/30">Recipient Address</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr v-for="(recipient, index) in multipleRecipients" :key="index" class="hover:bg-gray-500/10">
                            <td class="py-3 px-4 border-b border-gray-400/30">
                              <input
                                v-model="recipient.quantity"
                                type="number"
                                min="1"
                                max="100"
                                placeholder="Quantity"
                                class="w-full px-3 py-2 border border-gray-400/30 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 bg-slate-800/50 backdrop-blur-sm text-white placeholder-emerald-300"
                              />
                            </td>
                            <td class="py-3 px-4 border-b border-gray-400/30">
                              <input
                                v-model="recipient.amount"
                                type="number"
                                step="0.01"
                                min="0.01"
                                placeholder="Amount"
                                class="w-full px-3 py-2 border border-gray-400/30 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 bg-slate-800/50 backdrop-blur-sm text-white placeholder-emerald-300"
                              />
                            </td>
                            <td class="py-3 px-4 border-b border-gray-400/30">
                              <input
                                v-model="recipient.address"
                                type="text"
                                placeholder="Wallet Address"
                                class="w-full px-3 py-2 border border-gray-400/30 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 bg-slate-800/50 backdrop-blur-sm text-white placeholder-emerald-300"
                              />
                            </td>
                          </tr>
                          
                          <!-- Add Recipient Row (appears on hover) -->
                          <tr class="add-recipient-row opacity-0 hover:opacity-100 transition-opacity duration-300">
                            <td colspan="3" class="py-4 px-4 text-center">
                      <button 
                        type="button" 
                        @click="addRecipientRow"
                                class="flex items-center gap-2 px-4 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 hover:text-emerald-200 rounded-lg transition-all duration-200 font-medium border border-emerald-400/30 hover:border-emerald-400/50 backdrop-blur-sm mx-auto"
                      >
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                        </svg>
                                Add Recipient
                      </button>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    <div class="mt-4 text-sm text-emerald-300">
                      <p>Please fill in the card quantity, amount, and wallet address for each recipient</p>
                    </div>
                  </div>
                </div>



                <!-- Cost Preview -->
                <div v-if="costPreview" class="metallic-card-secondary rounded-xl p-4 backdrop-blur-sm">
                  <h4 class="text-lg font-semibold text-white mb-4">Cost Preview</h4>
                  <div class="space-y-3">
                    <div class="flex justify-between">
                      <span class="text-emerald-200">Card Quantity:</span>
                      <span class="font-semibold text-white">{{ giftForm.quantity }} cards</span>
                    </div>
                    <div class="flex justify-between">
                      <span class="text-emerald-200">Amount per Card:</span>
                      <span class="font-semibold text-white">{{ giftForm.amountPerCard }} USDC</span>
                    </div>
                    <div class="flex justify-between">
                      <span class="text-emerald-200">Total Amount:</span>
                      <span class="font-semibold text-white">{{ costPreview.totalAmount }} USDC</span>
                    </div>
                    <div class="border-t pt-3">
                      <div class="flex justify-between text-lg">
                        <span class="font-bold text-white">Total Cost:</span>
                        <span class="font-bold text-emerald-400">{{ costPreview.total }} USDC</span>
                        </div>
                    </div>
                  </div>
                </div>

                <!-- Submit Button -->
                <button
                  type="submit"
                  :disabled="!canSubmit"
                  class="btn-primary-gift w-full group relative"
                  :class="{ 'loading': isLoading }"
                >
                  <!-- Button content -->
                  <span v-if="isLoading" class="relative flex items-center justify-center gap-2 z-10">
                    <div class="loading-spinner"></div>
                    Minting...
                  </span>
                  <span v-else class="relative flex items-center justify-center gap-2 z-10">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"></path>
                    </svg>
                    {{ giftForm.recipientType === 'self' ? 'Mint Gift Cards' : 'Gift Cards' }}
                  </span>
                </button>
              </form>
                </div>
              </div>
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
      <div class="relative gift-history-modal rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden z-10 transform transition-all duration-300">
        <!-- 視窗標題 -->
        <div class="gift-history-header p-6">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                </svg>
              </div>
              <h3 class="text-xl font-bold text-white">Gift History</h3>
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
            <p class="text-emerald-200">No gift history yet</p>
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
                    <div class="font-semibold text-white">{{ gift.quantity }} cards</div>
                    <div class="text-sm text-emerald-200">{{ gift.recipientType === 'self' ? 'Minted to my wallet' : 'Gifted to ' + formatAddress(gift.recipientAddress) }}</div>
                  </div>
                </div>
                <div class="text-right">
                  <div class="font-semibold text-white">{{ gift.totalAmount }} USDC</div>
                  <div class="text-sm text-emerald-200">{{ gift.date }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 成功彈窗 -->
    <div v-if="showSuccessModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <!-- 背景模糊遮罩 -->
      <div 
        class="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300"
        @click="showSuccessModal = false"
      ></div>
      
      <!-- 成功彈窗 -->
      <div class="relative success-modal rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden z-10 transform transition-all duration-300">
        <!-- 視窗標題 -->
        <div class="success-header p-6">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
                <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <div>
                <h3 class="text-2xl font-bold text-white">Minting Successful!</h3>
                <p class="text-emerald-200">Gift cards have been minted successfully</p>
              </div>
            </div>
            <button 
              @click="showSuccessModal = false"
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
          <div class="space-y-6">
            <!-- Basic Information -->
            <div class="success-info-card">
              <h4 class="text-lg font-semibold text-white mb-4">Minting Details</h4>
              <div class="grid grid-cols-2 gap-4">
                <div class="info-item">
                  <span class="info-label">Quantity</span>
                  <span class="info-value">{{ successData?.tokenIds?.length || 0 }} cards</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Recipient</span>
                  <span class="info-value">{{ successData?.recipientType === 'self' ? 'My Wallet' : formatAddress(successData?.recipientAddress) }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Transaction Hash</span>
                  <span class="info-value font-mono text-sm">{{ successData?.txHash?.slice(0, 10) }}...{{ successData?.txHash?.slice(-8) }}</span>
                </div>
              </div>
            </div>

            <!-- Token IDs -->
            <div class="success-info-card">
              <h4 class="text-lg font-semibold text-white mb-4">Token IDs</h4>
              <div class="flex flex-wrap gap-2">
                <span 
                  v-for="tokenId in successData?.tokenIds" 
                  :key="tokenId"
                  class="token-id-badge"
                >
                  #{{ tokenId }}
                </span>
              </div>
            </div>


            <!-- Action Buttons -->
            <div class="flex gap-3 pt-4">
              <button 
                @click="showSuccessModal = false"
                class="btn-secondary flex-1"
              >
                Close
              </button>
              <button 
                @click="viewOnExplorer"
                class="btn-primary flex-1"
              >
                View Transaction
              </button>
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
import { giftCardService } from '../services/giftCardService.js'
import Layout from '../components/Layout.vue'

// Web3 composable
const { account, isConnected, connectWallet, formatAddress, getUSDCBalance, provider, signer } = useWeb3()

// Data
const usdcBalance = ref('0.00')
const isLoading = ref(false)
const showGiftHistory = ref(false)
const isRefreshingBalance = ref(false)
const showSuccessModal = ref(false)
const successData = ref(null)

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
    
    return {
      totalAmount: totalAmount.toFixed(2),
      total: totalAmount.toFixed(2)
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
    
    return {
      totalAmount: totalAmount.toFixed(2),
      total: totalAmount.toFixed(2)
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
    let result = null
    
    // Handle gift submission based on recipient type and gift mode
    if (giftForm.value.recipientType === 'self') {
      // Mint cards to self using giftCardService
      result = await giftCardService.giftCards({
        quantity: parseInt(giftForm.value.quantity),
        amountPerCard: parseFloat(giftForm.value.amountPerCard),
        recipientType: 'self',
        recipientAddress: account.value
      })
      
      if (!result.success) {
        throw new Error(result.error)
      }
    } else if (giftForm.value.recipientType === 'other') {
      if (giftForm.value.giftMode === 'single') {
        // Mint cards to single recipient using giftCardService
        result = await giftCardService.giftCards({
          quantity: parseInt(giftForm.value.quantity),
          amountPerCard: parseFloat(giftForm.value.amountPerCard),
          recipientType: 'other',
          recipientAddress: giftForm.value.recipientAddress
        })
        
        if (!result.success) {
          throw new Error(result.error)
        }
      } else {
        // Multiple recipient mode
        // Filter out empty rows
        const validRecipients = multipleRecipients.value.filter(recipient => 
          recipient.quantity && recipient.amount && recipient.address
        )
        
        // Mint cards to each recipient using giftCardService
        for (const recipient of validRecipients) {
          result = await giftCardService.giftCards({
            quantity: parseInt(recipient.quantity),
            amountPerCard: parseFloat(recipient.amount),
            recipientType: 'other',
            recipientAddress: recipient.address
          })
          
          if (!result.success) {
            throw new Error(result.error)
          }
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
    
    // Show success modal
    successData.value = {
      txHash: result.txHash,
      tokenIds: result.tokenIds || [],
      recipientType: giftForm.value.recipientType,
      recipientAddress: result.recipient || (giftForm.value.recipientType === 'self' ? account.value : giftForm.value.recipientAddress)
    }
    showSuccessModal.value = true
  } catch (error) {
    console.error('Gift submission failed:', error)
    alert('Minting failed: ' + error.message)
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
    
    // Load gift history from giftCardService
    giftHistory.value = await giftCardService.getGiftHistory()
  } catch (error) {
    console.error('Failed to load user data:', error)
  }
}

const refreshBalance = async () => {
  if (!account.value || !provider.value || !signer.value) return
  
  isRefreshingBalance.value = true
  
  try {
    // Initialize contract service
    await contractService.init(provider.value, signer.value)
    
    // Load USDC balance
    usdcBalance.value = await contractService.getUSDCBalance(account.value)
  } catch (error) {
    console.error('Failed to refresh balance:', error)
  } finally {
    isRefreshingBalance.value = false
  }
}

const viewOnExplorer = () => {
  if (successData.value?.txHash) {
    const explorerUrl = `https://arbiscan.io/tx/${successData.value.txHash}`
    window.open(explorerUrl, '_blank')
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
/* Tech-metallic background design */
.card-background {
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 25%, #334155 50%, #1e293b 75%, #0f172a 100%);
  background-size: 400% 400%;
  animation: card-gradient-shift 8s ease infinite;
  position: relative;
}

.card-background::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: 
    radial-gradient(circle at 20% 20%, rgba(16, 185, 129, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 80% 80%, rgba(20, 184, 166, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 40% 60%, rgba(6, 182, 212, 0.05) 0%, transparent 50%);
  pointer-events: none;
}

.card-background::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: 
    linear-gradient(45deg, transparent 40%, rgba(255, 255, 255, 0.02) 50%, transparent 60%),
    linear-gradient(-45deg, transparent 40%, rgba(255, 255, 255, 0.02) 50%, transparent 60%);
  background-size: 60px 60px;
  animation: card-pattern-move 20s linear infinite;
  pointer-events: none;
}

/* Background animations */
@keyframes card-gradient-shift {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}

@keyframes card-pattern-move {
  0% { transform: translateX(0) translateY(0); }
  100% { transform: translateX(60px) translateY(60px); }
}

/* Hero Buttons */
.btn-primary-hero {
  @apply bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold py-4 px-8 rounded-xl text-lg transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-emerald-500/30 focus:ring-offset-2 shadow-lg hover:shadow-xl hover:scale-105;
}

/* Primary Button - Gift Style */
.btn-primary-gift {
  @apply bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 text-white font-bold py-5 px-8 rounded-full text-lg transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-yellow-500/30 focus:ring-offset-2 shadow-lg hover:shadow-xl hover:scale-105;
}

/* Form Inputs */
.quantity-input, .amount-input, .address-input {
  @apply w-full px-4 py-3 border border-emerald-400/30 rounded-xl focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all duration-200 bg-slate-800/50 backdrop-blur-sm text-white placeholder-emerald-300;
}

.currency-label {
  @apply absolute right-3 top-1/2 transform -translate-y-1/2 text-emerald-300 font-medium;
}

/* Quick Selection Buttons */
.quantity-btn, .amount-btn {
  @apply px-3 py-1 text-sm bg-slate-700/50 hover:bg-emerald-500/20 text-emerald-200 hover:text-emerald-100 rounded-lg transition-all duration-200 font-medium border border-emerald-400/30;
}

/* Recipient Sidebar Options */
.recipient-sidebar-option {
  @apply w-full text-left transition-all duration-200;
}

.recipient-sidebar-option:hover {
  @apply transform scale-105;
}

.recipient-sidebar-active {
  @apply bg-emerald-500/20 border border-emerald-400/50;
}

.recipient-sidebar-active .flex {
  @apply bg-emerald-500/10;
}

.recipient-sidebar-option:hover .flex {
  @apply bg-white/5;
}

/* Gift Mode Tab Buttons */
.gift-mode-tab-button {
  @apply relative px-4 py-3 text-sm font-bold text-emerald-300 hover:text-emerald-200 transition-all duration-200 bg-transparent border-none outline-none cursor-pointer;
}

.gift-mode-tab-button::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: rgba(16, 185, 129, 0.2);
  transform: scaleX(1);
  transition: all 0.3s ease;
}

.gift-mode-tab-button:hover::after {
  background: rgba(16, 185, 129, 0.5);
  height: 3px;
}

.gift-mode-tab-active {
  @apply text-emerald-200;
}

.gift-mode-tab-active::after {
  background: rgba(16, 185, 129, 0.8);
  height: 3px;
}

/* Gift Card Container */
.gift-card-container {
  background: linear-gradient(180deg, 
    rgba(15, 23, 42, 0.95) 0%, 
    rgba(2, 6, 23, 0.9) 100%);
  backdrop-filter: blur(20px);
  border: 3px solid transparent;
  background-clip: padding-box;
  box-shadow: 
    0 25px 50px rgba(0, 0, 0, 0.4),
    0 15px 30px rgba(0, 0, 0, 0.3),
    0 8px 16px rgba(0, 0, 0, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  position: relative;
  transform: translateY(-8px);
  transition: all 0.3s ease;
}

.gift-card-container:hover {
  transform: translateY(-12px);
  box-shadow: 
    0 35px 70px rgba(0, 0, 0, 0.5),
    0 20px 40px rgba(0, 0, 0, 0.4),
    0 12px 24px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.15);
}

.gift-card-container::before {
  content: '';
  position: absolute;
  top: -3px;
  left: -3px;
  right: -3px;
  bottom: -3px;
  background: linear-gradient(45deg, 
    #fbbf24, #f59e0b, #d97706, #b45309,
    #fbbf24, #f59e0b, #d97706, #b45309);
  background-size: 200% 200%;
  border-radius: inherit;
  z-index: -1;
  animation: golden-border-shine 4s ease-in-out infinite;
}

.gift-card-container::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(180deg, 
    rgba(15, 23, 42, 0.95) 0%, 
    rgba(2, 6, 23, 0.9) 100%);
  border-radius: inherit;
  z-index: 0;
}

/* Gift Card Background Pattern */
.gift-card-pattern {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: 
    linear-gradient(45deg, rgba(255, 255, 255, 0.02) 25%, transparent 25%),
    linear-gradient(-45deg, rgba(255, 255, 255, 0.02) 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, rgba(255, 255, 255, 0.02) 75%),
    linear-gradient(-45deg, transparent 75%, rgba(255, 255, 255, 0.02) 75%);
  background-size: 20px 20px;
  background-position: 0 0, 0 10px, 10px -10px, -10px 0px;
  opacity: 0.3;
  pointer-events: none;
}

/* Golden Sparkles */
.golden-sparkles {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  z-index: 5;
}

.sparkle {
  position: absolute;
  width: 4px;
  height: 4px;
  background: radial-gradient(circle, #fbbf24, #f59e0b);
  border-radius: 50%;
  animation: sparkle-twinkle 3s ease-in-out infinite;
  box-shadow: 0 0 6px rgba(251, 191, 36, 0.6);
}

.sparkle-1 { top: 15%; left: 10%; animation-delay: 0s; }
.sparkle-2 { top: 25%; left: 20%; animation-delay: 0.5s; }
.sparkle-3 { top: 35%; left: 15%; animation-delay: 1s; }
.sparkle-4 { top: 20%; left: 30%; animation-delay: 1.5s; }
.sparkle-5 { top: 40%; left: 25%; animation-delay: 2s; }
.sparkle-6 { top: 60%; right: 15%; animation-delay: 0.3s; }
.sparkle-7 { top: 70%; right: 25%; animation-delay: 0.8s; }
.sparkle-8 { top: 80%; right: 20%; animation-delay: 1.3s; }
.sparkle-9 { top: 65%; right: 35%; animation-delay: 1.8s; }
.sparkle-10 { top: 75%; right: 30%; animation-delay: 2.3s; }

/* Gift Ribbon */
.gift-ribbon {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  z-index: 8;
}

.ribbon-horizontal {
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 6px;
  background: linear-gradient(90deg, 
    transparent 0%, 
    rgba(251, 191, 36, 0.8) 20%, 
    #fbbf24 50%, 
    rgba(251, 191, 36, 0.8) 80%, 
    transparent 100%);
  transform: translateY(-50%);
  box-shadow: 0 2px 4px rgba(251, 191, 36, 0.4);
}

.ribbon-vertical {
  position: absolute;
  right: 15%;
  top: 0;
  bottom: 0;
  width: 6px;
  background: linear-gradient(180deg, 
    transparent 0%, 
    rgba(251, 191, 36, 0.8) 20%, 
    #fbbf24 50%, 
    rgba(251, 191, 36, 0.8) 80%, 
    transparent 100%);
  box-shadow: 2px 0 4px rgba(251, 191, 36, 0.4);
}

/* Gift Card Title Section */
.gift-card-title-section {
  text-align: left;
  margin-bottom: 2rem;
  z-index: 10;
  pointer-events: none;
}

.gift-card-main-title {
  font-size: 3rem;
  font-weight: 900;
  background: linear-gradient(135deg, #fbbf24, #f59e0b, #d97706);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  margin: 0;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.gift-card-sub-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
  margin: 0;
  margin-top: 0.2rem;
  margin-left: 0.1em;
  letter-spacing: 0.2em;
  text-transform: uppercase;
}

/* Sparkle Animation */
@keyframes sparkle-twinkle {
  0%, 100% { 
    opacity: 0.3; 
    transform: scale(1); 
  }
  50% { 
    opacity: 1; 
    transform: scale(1.2); 
  }
}

/* Golden Border Animation */
@keyframes golden-border-shine {
  0%, 100% { 
    background-position: 0% 50%; 
  }
  50% { 
    background-position: 100% 50%; 
  }
}

.metallic-card-secondary {
  background: linear-gradient(145deg, 
    rgba(255, 255, 255, 0.12) 0%, 
    rgba(255, 255, 255, 0.04) 25%, 
    rgba(255, 255, 255, 0.08) 50%, 
    rgba(255, 255, 255, 0.04) 75%, 
    rgba(255, 255, 255, 0.12) 100%);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  box-shadow: 
    0 4px 16px rgba(0, 0, 0, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.15),
    inset 0 -1px 0 rgba(0, 0, 0, 0.08);
  position: relative;
}

.metallic-card-secondary::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(45deg, 
    transparent 30%, 
    rgba(255, 255, 255, 0.08) 50%, 
    transparent 70%);
  border-radius: inherit;
  animation: metallic-shine-secondary 4s ease-in-out infinite;
  pointer-events: none;
}

@keyframes metallic-shine {
  0%, 100% { transform: translateX(-100%); }
  50% { transform: translateX(100%); }
}

@keyframes metallic-shine-secondary {
  0%, 100% { transform: translateX(-100%); }
  50% { transform: translateX(100%); }
}

/* Cost Preview */
.cost-preview {
  @apply bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-400/30 rounded-xl p-4 backdrop-blur-sm;
}

/* Gift Items */
.gift-item {
  @apply p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors duration-200;
}

/* Loading state */
.loading {
  @apply opacity-75 cursor-not-allowed;
}

/* Gift History Modal */
.gift-history-modal {
  background: linear-gradient(145deg, 
    rgba(16, 185, 129, 0.08) 0%, 
    rgba(16, 185, 129, 0.03) 25%, 
    rgba(16, 185, 129, 0.06) 50%, 
    rgba(16, 185, 129, 0.03) 75%, 
    rgba(16, 185, 129, 0.08) 100%);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(16, 185, 129, 0.15);
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.2),
    inset 0 -1px 0 rgba(0, 0, 0, 0.1);
  position: relative;
}

.gift-history-modal::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(45deg, 
    transparent 30%, 
    rgba(16, 185, 129, 0.1) 50%, 
    transparent 70%);
  border-radius: inherit;
  animation: metallic-shine 3s ease-in-out infinite;
  pointer-events: none;
}

/* Gift History Header */
.gift-history-header {
  background: linear-gradient(135deg, 
    rgba(16, 185, 129, 0.4) 0%, 
    rgba(5, 150, 105, 0.5) 50%, 
    rgba(4, 120, 87, 0.4) 100%);
  backdrop-filter: blur(16px);
  border-bottom: 1px solid rgba(16, 185, 129, 0.2);
  position: relative;
}

.gift-history-header::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(45deg, 
    transparent 30%, 
    rgba(255, 255, 255, 0.1) 50%, 
    transparent 70%);
  animation: metallic-shine 4s ease-in-out infinite;
  pointer-events: none;
}

/* Add Recipient Row */
.add-recipient-row {
  @apply transition-opacity duration-300;
}

tbody:hover .add-recipient-row {
  @apply opacity-100;
}
@keyframes shimmer {
  0% { transform: translateX(-100%) skewX(-12deg); }
  100% { transform: translateX(200%) skewX(-12deg); }
}

.animate-shimmer {
  animation: shimmer 2s ease-in-out;
}

/* Success Modal Styles */
.success-modal {
  background: linear-gradient(145deg, 
    rgba(16, 185, 129, 0.08) 0%, 
    rgba(16, 185, 129, 0.03) 25%, 
    rgba(16, 185, 129, 0.06) 50%, 
    rgba(16, 185, 129, 0.03) 75%, 
    rgba(16, 185, 129, 0.08) 100%);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(16, 185, 129, 0.15);
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.2),
    inset 0 -1px 0 rgba(0, 0, 0, 0.1);
  position: relative;
}

.success-modal::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(45deg, 
    transparent 30%, 
    rgba(16, 185, 129, 0.1) 50%, 
    transparent 70%);
  border-radius: inherit;
  animation: metallic-shine 3s ease-in-out infinite;
  pointer-events: none;
}

.success-header {
  background: linear-gradient(135deg, 
    rgba(16, 185, 129, 0.4) 0%, 
    rgba(5, 150, 105, 0.5) 50%, 
    rgba(4, 120, 87, 0.4) 100%);
  backdrop-filter: blur(16px);
  border-bottom: 1px solid rgba(16, 185, 129, 0.2);
  position: relative;
}

.success-header::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(45deg, 
    transparent 30%, 
    rgba(255, 255, 255, 0.1) 50%, 
    transparent 70%);
  animation: metallic-shine 4s ease-in-out infinite;
  pointer-events: none;
}

.success-info-card {
  @apply bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4;
}

.info-item {
  @apply flex flex-col gap-1;
}

.info-label {
  @apply text-xs text-emerald-300 font-medium uppercase tracking-wide;
}

.info-value {
  @apply text-white font-semibold;
}

.token-id-badge {
  @apply px-3 py-1 bg-emerald-500/20 text-emerald-300 rounded-lg font-mono text-sm border border-emerald-400/30;
}

.btn-secondary {
  @apply px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all duration-200 font-medium border border-white/20 hover:border-white/30;
}

.btn-primary {
  @apply px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-lg transition-all duration-200 font-medium shadow-lg hover:shadow-xl;
}

/* Premium Balance Display */
.balance-display-premium {
  background: linear-gradient(145deg, 
    rgba(15, 23, 42, 0.95) 0%, 
    rgba(30, 41, 59, 0.8) 50%, 
    rgba(15, 23, 42, 0.95) 100%);
  backdrop-filter: blur(24px);
  border: 1px solid rgba(16, 185, 129, 0.25);
  border-radius: 18px;
  padding: 18px 22px;
  box-shadow: 
    0 12px 40px rgba(0, 0, 0, 0.4),
    0 0 0 1px rgba(16, 185, 129, 0.15),
    inset 0 1px 0 rgba(255, 255, 255, 0.12),
    inset 0 -1px 0 rgba(0, 0, 0, 0.1);
  position: relative;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  min-width: 220px;
  overflow: hidden;
}

.balance-display-premium:hover {
  border-color: rgba(16, 185, 129, 0.4);
  box-shadow: 
    0 16px 48px rgba(0, 0, 0, 0.5),
    0 0 0 1px rgba(16, 185, 129, 0.25),
    inset 0 1px 0 rgba(255, 255, 255, 0.18),
    inset 0 -1px 0 rgba(0, 0, 0, 0.15);
  transform: translateY(-3px);
}

.balance-display-premium::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(45deg, 
    transparent 30%, 
    rgba(16, 185, 129, 0.08) 50%, 
    transparent 70%);
  border-radius: inherit;
  animation: premium-shine 4s ease-in-out infinite;
  pointer-events: none;
}

.balance-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
}

.balance-icon {
  width: 18px;
  height: 18px;
  background: linear-gradient(135deg, #10b981, #059669);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  box-shadow: 0 3px 10px rgba(16, 185, 129, 0.4);
  flex-shrink: 0;
}

.balance-label {
  font-size: 11px;
  font-weight: 700;
  color: rgba(16, 185, 129, 0.9);
  text-transform: uppercase;
  letter-spacing: 0.8px;
  flex: 1;
}

.refresh-btn {
  width: 20px;
  height: 20px;
  background: rgba(16, 185, 129, 0.12);
  border: 1px solid rgba(16, 185, 129, 0.25);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(16, 185, 129, 0.8);
  transition: all 0.2s ease;
  cursor: pointer;
  flex-shrink: 0;
}

.refresh-btn:hover {
  background: rgba(16, 185, 129, 0.25);
  border-color: rgba(16, 185, 129, 0.4);
  color: rgba(16, 185, 129, 1);
  transform: scale(1.05);
}

.refresh-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.balance-amount {
  display: flex;
  align-items: baseline;
  gap: 8px;
}

.balance-value {
  font-size: 20px;
  font-weight: 800;
  color: #ffffff;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.4);
  letter-spacing: -0.5px;
  font-variant-numeric: tabular-nums;
}

.balance-currency {
  font-size: 13px;
  font-weight: 600;
  color: rgba(16, 185, 129, 0.8);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-top: 2px;
}

@keyframes premium-shine {
  0%, 100% { 
    transform: translateX(-100%); 
  }
  50% { 
    transform: translateX(100%); 
  }
}
</style>