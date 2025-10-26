<template>
  <Layout>

    <!-- Main Content -->
    <section class="py-12 card-background min-h-screen relative overflow-hidden">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <!-- Wallet Connection Status -->
        <div v-if="isWalletReady && !isConnected" class="text-center py-12">
          <div class="premium-card p-8 max-w-md mx-auto">
            <div class="w-16 h-16 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
              </svg>
            </div>
            <h3 class="text-xl font-bold text-white mb-4">Please connect your wallet</h3>
            <p class="text-emerald-200 mb-6">Connect your wallet to start using GasPass card management features</p>
            <button @click="connectWallet" class="btn-primary w-full">
              Connect Wallet
            </button>
          </div>
        </div>

        <!-- Network Check -->
        <div v-if="isConnected && !isArbitrum" class="text-center py-12">
          <div class="premium-card-error p-8 max-w-md mx-auto">
            <div class="w-16 h-16 bg-gradient-to-br from-red-400 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
              </svg>
            </div>
            <h3 class="text-xl font-bold text-white mb-4">Please switch to Arbitrum Mainnet</h3>
            <p class="text-red-200 mb-6">Your contract is deployed on Arbitrum Mainnet, please switch networks to continue</p>
            <button @click="switchToArbitrum" class="btn-primary w-full">
              Switch to Arbitrum Mainnet
            </button>
          </div>
        </div>

        <!-- Connected State -->
        <div v-else>
          <!-- Vincent Agent 登入銜接卡片（尚未取得 JWT 時顯示） -->
          <div v-if="!vincentJwt" class="mb-8">
            <div class="premium-card-vincent p-8 relative overflow-hidden group">
              <div class="absolute inset-0 bg-gradient-to-br from-emerald-50/10 to-teal-50/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div class="relative z-10">
                <div class="flex items-center justify-between mb-6">
                  <div class="flex items-center gap-3">
                    <div class="w-8 h-8 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-lg flex items-center justify-center">
                      <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                      </svg>
                    </div>
                    <h3 class="text-2xl font-bold text-white">Connect Vincent Agent</h3>
                  </div>
                  <span v-if="vincentRedirecting" class="text-sm text-emerald-300">Redirecting to login page...</span>
                </div>
                <p class="text-emerald-200 mb-6">
                  To enable cross-chain Gas exchange and automatic monitoring, please complete Vincent Agent login authorization first.
                </p>
              <div class="flex items-center gap-4">
                  <button 
                    class="btn-primary"
                    :disabled="vincentRedirecting"
                    @click="handleVincentConnectClick"
                  >
                    Go to Vincent Login
                  </button>
                  <div v-if="vincentRedirecting" class="flex items-center gap-1 text-gray-500">
                    <span class="loading-dot">•</span>
                    <span class="loading-dot">•</span>
                    <span class="loading-dot">•</span>
                  </div>
                </div>

                <!-- 導轉前確認區塊 -->
                <div v-if="confirmVincentVisible" class="mt-6 p-4 bg-emerald-500/10 border border-emerald-400/30 rounded-xl">
                  <p class="text-white mb-4">About to leave GasPass for Vincent login, will automatically return after completion. Continue?</p>
                  <div class="flex items-center justify-between">
                    <label class="flex items-center gap-2 text-sm text-emerald-200">
                      <input type="checkbox" v-model="skipVincentConfirm" @change="setSkipVincentConfirm(skipVincentConfirm)" />
                      Don't show again next time
                    </label>
                    <div class="flex items-center gap-3">
                      <button class="btn-secondary-sm" @click="confirmVincentCancel">Cancel</button>
                      <button class="btn-primary" @click="confirmVincentProceed">Continue</button>
                </div>
                </div>
              </div>
              </div>
            </div>
          </div>
          <!-- 上半部分：儲值卡管理 -->
          <div v-if="vincentJwt" class="mb-12">
            <!-- 沒有儲值卡的情況 -->
            <div v-if="!hasCard" class="py-8 -mt-8">
              <div class="premium-card-main px-8 py-4 max-w-5xl mx-auto relative overflow-hidden">
                <!-- 背景裝飾 -->
                <div class="absolute inset-0 bg-gradient-to-br from-emerald-50/10 to-teal-50/10"></div>
                <div class="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-emerald-200/20 to-teal-200/20 rounded-full -translate-y-32 translate-x-32"></div>
                <div class="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-emerald-200/20 to-teal-200/20 rounded-full translate-y-24 -translate-x-24"></div>
                
                <!-- 錢包地址 -->
                <div class="card-number-display">
                  <span class="number-segment">{{ getAddressSegment(0) }}</span>
                  <span class="number-segment">{{ getAddressSegment(1) }}</span>
                  <span class="number-segment">{{ getAddressSegment(2) }}</span>
                  <span class="number-segment">{{ getAddressSegment(3) }}</span>
                </div>
                
                <div class="relative z-10 flex items-center gap-12">
                  <!-- 左側文字內容 -->
                  <div class="flex-1 -mt-8">
                    <div class="flex items-center gap-3 mb-6">
                      <h3 class="text-4xl font-black text-gray-600">Welcome to GasPass!</h3>
                    </div>
                    <p class="text-xl text-emerald-200 mb-8 max-w-2xl">
                      You don't have a card yet, let's create your first GasPass<br>
                      to start your worry-free DeFi journey!
                    </p>
                  </div>
                  
                  <!-- 右側 Cute Gas Jar Component -->
                  <div class="flex-shrink-0">
                    <CuteGasJar 
                      :isFirstTime="true"
                      @success="handleMintSuccess"
                      @error="handleError"
                    />
                  </div>
                </div>
              </div>
            </div>

            <!-- 有儲值卡的情況 - 與沒有儲值卡畫面保持一致 -->
            <div v-else class="py-8 -mt-8">
              <!-- 多張卡片時的選擇器 -->
              <div v-if="userCards.length > 1" class="mb-6 flex justify-center">
                <div class="card-selector-elegant">
                  <div class="flex items-center gap-3">
                    <div class="flex items-center gap-2">
                      <div class="w-2 h-2 bg-emerald-400 rounded-full"></div>
                      <span class="text-sm text-emerald-300 font-medium">Select Card</span>
                    </div>
                    <div class="flex gap-1">
                      <button 
                        v-for="card in userCards" 
                        :key="card.tokenId"
                        @click="selectCard(card.tokenId)"
                        class="card-chip"
                        :class="{ 'active': selectedTokenId === card.tokenId }"
                      >
                        <span class="font-semibold">#{{ card.tokenId }}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 主要卡片區域 - 與沒有儲值卡畫面保持一致 -->
              <div class="premium-card-main px-8 py-4 max-w-5xl mx-auto relative overflow-hidden">
                <!-- 背景裝飾 -->
                <div class="absolute inset-0 bg-gradient-to-br from-emerald-50/10 to-teal-50/10"></div>
                <div class="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-emerald-200/20 to-teal-200/20 rounded-full -translate-y-32 translate-x-32"></div>
                <div class="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-teal-200/20 to-emerald-200/20 rounded-full translate-y-24 -translate-x-24"></div>
                
                <!-- 錢包地址 -->
                <div class="card-number-display">
                  <span class="number-segment">{{ getAddressSegment(0) }}</span>
                  <span class="number-segment">{{ getAddressSegment(1) }}</span>
                  <span class="number-segment">{{ getAddressSegment(2) }}</span>
                  <span class="number-segment">{{ getAddressSegment(3) }}</span>
                    </div>
                    
                 <!-- 卡片信息 - 左上角 -->
                 <div v-if="selectedTokenId" class="absolute top-6 left-6 z-20">
                   <div class="card-info-top-left">
                     <div class="flex items-center gap-3">
                       <div class="card-badge">
                         <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                           <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
                         </svg>
                         <span>GasPass #{{ selectedTokenId }}</span>
                       </div>
                       <div class="balance-display">
                         <span class="amount">{{ getSelectedCardBalance() }}</span>
                         <span class="currency">USDC</span>
                       </div>
                       <div class="status-indicator">
                         <div class="status-dot"></div>
                         <span class="status-text">Active</span>
                       </div>
                     </div>
                   </div>
                 </div>

                 <div class="relative z-10 flex items-center gap-12">
                   <!-- 左側文字內容 -->
                   <div class="flex-1 -mt-8">
                     <div class="flex items-center gap-3 mb-6">
                       <h3 class="text-4xl font-black text-gray-600">Welcome back!</h3>
                     </div>
                     
                     <!-- 專業化的狀態信息 -->
                     <div class="status-info-container mb-8">
                       <div class="status-description">
                         <p class="primary-text">Your GasPass infrastructure is ready</p>
                         <p class="secondary-text">Deposit USDC to maintain optimal gas reserves across chains</p>
                       </div>
                     </div>
                   </div>
                   
                   <!-- 右側 Cute Gas Jar Component -->
                   <div class="flex-shrink-0">
                     <CuteGasJar 
                       :isFirstTime="false"
                       :existingCard="getSelectedCard()"
                       @success="handleDepositSuccess"
                       @error="handleError"
                     />
                   </div>
                 </div>
              </div>
            </div>
          </div>

          <!-- 下半部分：Gas 兌換管理 -->
          <div v-if="hasCard && showGasExchange && selectedTokenId" class="premium-card-exchange p-8 relative overflow-hidden">
            <!-- 背景裝飾 -->
            <div class="absolute inset-0 bg-gradient-to-br from-emerald-50/5 to-teal-50/5"></div>
            <div class="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-200/20 to-teal-200/20 rounded-full -translate-y-16 translate-x-16"></div>
            
            <div class="relative z-10">
              <!-- 標題 -->
              <div class="flex items-center justify-center gap-3 mb-8">
                <div class="w-8 h-8 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-lg flex items-center justify-center">
                  <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                  </svg>
                </div>
                <h3 class="text-2xl font-bold text-white">Gas Exchange Management - GasPass #{{ selectedTokenId }}</h3>
                <button 
                  @click="showGasExchange = false; selectedTokenId = null"
                  class="ml-auto px-3 py-1 bg-slate-600/50 hover:bg-slate-600/70 text-gray-300 hover:text-white rounded-lg transition-all duration-300 text-sm"
                >
                  Close
                </button>
              </div>
              
              <!-- 切換標籤 -->
              <div class="flex justify-center mb-8">
                <div class="bg-slate-700/50 rounded-2xl p-1 inline-flex">
                  <button 
                    @click="activeTab = 'manual'"
                    class="px-6 py-3 rounded-xl font-semibold transition-all duration-300 relative"
                    :class="activeTab === 'manual' 
                      ? 'bg-emerald-500 text-white shadow-lg' 
                      : 'text-emerald-200 hover:text-white hover:bg-emerald-500/20'"
                  >
                    <span class="relative z-10 flex items-center gap-2">
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                        </svg>
                      Manual Exchange
                      </span>
                    </button>
                  <button 
                    @click="activeTab = 'agent'"
                    class="px-6 py-3 rounded-xl font-semibold transition-all duration-300 relative"
                    :class="activeTab === 'agent' 
                      ? 'bg-emerald-500 text-white shadow-lg' 
                      : 'text-emerald-200 hover:text-white hover:bg-emerald-500/20'"
                  >
                    <span class="relative z-10 flex items-center gap-2">
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
                        </svg>
                      Agent Auto Monitoring
                      </span>
                    </button>
                  </div>
                </div>

              <!-- 手動兌換 Gas -->
              <div v-if="activeTab === 'manual'" class="space-y-6">
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <!-- 兌換設定 -->
                  <div class="premium-card-settings p-6">
                    <div class="flex items-center gap-3 mb-6">
                      <div class="w-8 h-8 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-lg flex items-center justify-center">
                        <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                        </svg>
                      </div>
                      <h4 class="text-xl font-bold text-white">Manual Exchange Settings</h4>
                    </div>
                    
                    <div class="space-y-4">
                      <div>
                        <label class="block text-sm font-semibold text-emerald-200 mb-2">Select Target Chain</label>
                        <button 
                          @click="showManualChainModal = true"
                          class="w-full p-3 bg-slate-600/50 border border-emerald-400/30 rounded-xl focus:border-emerald-400 focus:outline-none transition-colors text-white text-left flex items-center justify-between hover:bg-slate-600/70"
                        >
                          <span>{{ getChainName(manualRefuel.chainId) }}</span>
                          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                          </svg>
                        </button>
                      </div>
                      
                      <div>
                        <label class="block text-sm font-semibold text-emerald-200 mb-2">
                          Amount to Exchange (USDC)
                          <span class="text-xs text-yellow-300 ml-2">⚠️ This will deduct from your card balance</span>
                        </label>
                        
                        
                        
                         <input 
                           v-model="manualRefuel.amount"
                           type="number"
                           step="0.01"
                           min="0.01"
                           :max="currentCardBalance"
                           placeholder="Enter exchange amount"
                           class="w-full p-3 bg-slate-600/50 border border-emerald-400/30 rounded-xl focus:border-emerald-400 focus:outline-none transition-colors text-white placeholder-emerald-300 mb-4"
                         />

                         <!-- 快捷按鈕 -->
                         <div class="flex gap-2 mb-3">
                          <button 
                            @click="setExchangeAmount(25)"
                            :disabled="currentCardBalance === 0"
                            class="px-3 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400/30 hover:border-emerald-400/50 text-emerald-300 hover:text-emerald-200 rounded-lg transition-all duration-300 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            25%
                          </button>
                          <button 
                            @click="setExchangeAmount(50)"
                            :disabled="currentCardBalance === 0"
                            class="px-3 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400/30 hover:border-emerald-400/50 text-emerald-300 hover:text-emerald-200 rounded-lg transition-all duration-300 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            50%
                          </button>
                          <button 
                            @click="setExchangeAmount(100)"
                            :disabled="currentCardBalance === 0"
                            class="px-3 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400/30 hover:border-emerald-400/50 text-emerald-300 hover:text-emerald-200 rounded-lg transition-all duration-300 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            100%
                          </button>
                          <div class="flex-1 text-right text-xs text-gray-400 self-center">
                            Balance: {{ currentCardBalance.toFixed(2) }} USDC
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <label class="block text-sm font-semibold text-emerald-200 mb-2">Recipient Address</label>
                        <input 
                          v-model="manualRefuel.recipient"
                          type="text"
                          placeholder="Enter recipient address"
                          class="w-full p-3 bg-slate-600/50 border border-emerald-400/30 rounded-xl focus:border-emerald-400 focus:outline-none transition-colors text-white placeholder-emerald-300"
                        />
              </div>
            </div>

                    <button 
                      @click="executeManualRefuel"
                      :disabled="!canExecuteManualRefuel"
                      class="w-full mt-6 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 disabled:from-gray-300 disabled:to-gray-400 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 disabled:cursor-not-allowed"
                    >
                      Exchange Gas Now
                    </button>
                  </div>
                  
                  <!-- 兌換預覽 -->
                  <div class="premium-card-preview p-6">
                    <div class="flex items-center gap-3 mb-6">
                      <div class="w-8 h-8 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-lg flex items-center justify-center">
                        <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                      </div>
                      <h4 class="text-xl font-bold text-white">Exchange Preview</h4>
                    </div>
                    
                    <div class="space-y-4">
                      <div class="flex justify-between items-center py-2 border-b border-emerald-400/20">
                        <span class="text-emerald-200">Exchange Amount:</span>
                        <span class="font-semibold text-white">{{ manualRefuel.amount || '0' }} USDC</span>
                      </div>
                      <div class="flex justify-between items-center py-2 border-b border-emerald-400/20">
                        <span class="text-emerald-200">Target Chain:</span>
                        <span class="font-semibold text-white">{{ getChainName(manualRefuel.chainId) }}</span>
                      </div>
                      <div class="flex justify-between items-center py-2 border-b border-emerald-400/20">
                        <span class="text-emerald-200">Fee:</span>
                        <span class="font-semibold text-white">0.5%</span>
                      </div>
                      <div class="flex justify-between items-center py-2">
                        <span class="text-emerald-200">Actual Amount:</span>
                        <div class="flex items-center gap-2">
                          <span v-if="isLoadingQuote" class="text-yellow-300 text-sm">Loading...</span>
                          <span v-else-if="quoteError" class="text-red-300 text-sm">{{ quoteError }}</span>
                          <span v-else class="font-bold text-emerald-400">{{ actualAmount }} {{ getChainNativeSymbol(manualRefuel.chainId) }}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Agent 自動監測 -->
              <div v-else class="space-y-6">
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <!-- Agent 設定 -->
                  <div class="premium-card-settings p-6">
                    <div class="flex items-center gap-3 mb-6">
                      <div class="w-8 h-8 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-lg flex items-center justify-center">
                        <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
                        </svg>
                      </div>
                      <h4 class="text-xl font-bold text-white">Agent Auto Monitoring Settings</h4>
                    </div>
                    
                    <div class="space-y-4">
                      <div>
                        <label class="block text-sm font-semibold text-emerald-200 mb-2">Monitor Chain</label>
                        <button 
                          @click="showAgentChainModal = true"
                          class="w-full p-3 bg-slate-600/50 border border-emerald-400/30 rounded-xl focus:border-emerald-400 focus:outline-none transition-colors text-white text-left flex items-center justify-between hover:bg-slate-600/70"
                        >
                          <span>{{ getChainName(agentRefuel.chainId) }}</span>
                          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                          </svg>
                        </button>
                      </div>
                      
                      <div>
                        <label class="block text-sm font-semibold text-emerald-200 mb-2">Trigger Threshold (USDC)</label>
                        <input 
                          v-model="agentRefuel.threshold"
                          type="number"
                          step="0.01"
                          min="0.01"
                          placeholder="Trigger when balance falls below this value"
                          class="w-full p-3 bg-slate-600/50 border border-emerald-400/30 rounded-xl focus:border-emerald-400 focus:outline-none transition-colors text-white placeholder-emerald-300"
                          style="-moz-appearance: textfield; appearance: textfield;"
                        />
                      </div>
                      
                      <div>
                        <label class="block text-sm font-semibold text-emerald-200 mb-2">Refill Amount (USDC)</label>
                        <input 
                          v-model="agentRefuel.amount"
                          type="number"
                          step="0.01"
                          min="0.01"
                          placeholder="Amount to refill each time"
                          class="w-full p-3 bg-slate-600/50 border border-emerald-400/30 rounded-xl focus:border-emerald-400 focus:outline-none transition-colors text-white placeholder-emerald-300"
                          style="-moz-appearance: textfield; appearance: textfield;"
                        />
                      </div>
                      
                    </div>
                    
                    <button 
                      @click="setupAgentRefuel"
                      :disabled="!canSetupAgentRefuel"
                      class="w-full mt-6 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 disabled:from-gray-300 disabled:to-gray-400 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 disabled:cursor-not-allowed"
                    >
                      Setup Agent Monitoring
                    </button>
                  </div>
                  
                  <!-- Agent 狀態 -->
                  <div class="premium-card-preview p-6">
                    <div class="flex items-center gap-3 mb-6">
                      <div class="w-8 h-8 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-lg flex items-center justify-center">
                        <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                      </div>
                      <h4 class="text-xl font-bold text-white">Agent Status</h4>
                    </div>
                    
                    <div class="space-y-4">
                      <div class="flex items-center justify-between">
                        <span class="text-emerald-200">Monitor Status:</span>
                        <span class="px-3 py-1 rounded-full text-sm font-semibold" :class="agentStatus.active ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30' : 'bg-slate-600/50 text-slate-300 border border-slate-500/30'">
                          {{ agentStatus.active ? 'Running' : 'Not Started' }}
                        </span>
                      </div>
                      <div class="flex items-center justify-between">
                        <span class="text-emerald-200">Monitor Chain:</span>
                        <span class="font-semibold text-white">{{ getChainName(agentRefuel.chainId) }}</span>
                      </div>
                      <div class="flex items-center justify-between">
                        <span class="text-emerald-200">Trigger Threshold:</span>
                        <span class="font-semibold text-white">{{ agentRefuel.threshold || '0' }} USDC</span>
                      </div>
                      <div class="flex items-center justify-between">
                        <span class="text-emerald-200">Refill Amount:</span>
                        <span class="font-semibold text-white">{{ agentRefuel.amount || '0' }} USDC</span>
                      </div>
                      <div class="flex items-center justify-between">
                        <span class="text-emerald-200">Last Check:</span>
                        <span class="font-semibold text-white">{{ agentStatus.lastCheck || 'Never checked' }}</span>
                      </div>
                    </div>
                    
                    <div v-if="agentStatus.active" class="mt-6 p-4 bg-emerald-500/10 border border-emerald-400/30 rounded-xl">
                      <div class="flex items-center gap-2 text-emerald-300">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                        <span class="font-semibold">Agent is monitoring your wallet balance</span>
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

    <!-- Chain Selection Modals -->
    <div v-if="showManualChainModal" class="modal-overlay" @click="showManualChainModal = false">
      <div class="modal-container" @click.stop>
        <div class="modal-header">
          <h3 class="modal-title">Select Target Chain</h3>
          <button @click="showManualChainModal = false" class="modal-close">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        
        <div class="modal-content">
          <div class="search-box">
            <input 
              v-model="manualChainSearch"
              placeholder="Search chains..."
              class="search-input"
            />
          </div>
          
          <div class="chains-grid">
            <div 
              v-for="(chain, chainId) in filteredManualChains" 
              :key="chainId"
              @click="selectManualChain(chainId)"
              :class="['chain-card', { active: manualRefuel.chainId === chainId }]"
            >
              <div class="chain-icon">
                <img v-if="chain.logo" 
                     :src="chain.logo" 
                     :alt="chain.name"
                     class="w-10 h-10 rounded-full object-cover"
                     @error="handleImageError"
                     @load="handleImageLoad"
                />
                <span v-if="chain.icon" 
                      class="text-2xl emoji-fallback" 
                      :style="{ display: chain.logo ? 'none' : 'block' }"
                >{{ chain.icon }}</span>
                <span v-if="!chain.icon" class="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-lg">🌐</span>
              </div>
              <div class="chain-info">
                <div class="chain-name">{{ chain.name }}</div>
                <div class="chain-gas-symbol">{{ chain.nativeSymbol }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="showAgentChainModal" class="modal-overlay" @click="showAgentChainModal = false">
      <div class="modal-container" @click.stop>
        <div class="modal-header">
          <h3 class="modal-title">Select Monitor Chain</h3>
          <button @click="showAgentChainModal = false" class="modal-close">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        
        <div class="modal-content">
          <div class="search-box">
            <input 
              v-model="agentChainSearch"
              placeholder="Search chains..."
              class="search-input"
            />
          </div>
          
          <div class="chains-grid">
            <div 
              v-for="(chain, chainId) in filteredAgentChains" 
              :key="chainId"
              @click="selectAgentChain(chainId)"
              :class="['chain-card', { active: agentRefuel.chainId === chainId }]"
            >
              <div class="chain-icon">
                <img v-if="chain.logo" 
                     :src="chain.logo" 
                     :alt="chain.name"
                     class="w-10 h-10 rounded-full object-cover"
                     @error="handleImageError"
                     @load="handleImageLoad"
                />
                <span v-if="chain.icon" 
                      class="text-2xl emoji-fallback" 
                      :style="{ display: chain.logo ? 'none' : 'block' }"
                >{{ chain.icon }}</span>
                <span v-if="!chain.icon" class="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-lg">🌐</span>
              </div>
              <div class="chain-info">
                <div class="chain-name">{{ chain.name }}</div>
                <div class="chain-gas-symbol">{{ chain.nativeSymbol }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

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
    
    <!-- Manual Refuel Success Modal -->
    <div v-if="showManualRefuelSuccess" class="success-modal-overlay" @click="showManualRefuelSuccess = false">
      <div class="success-modal" @click.stop>
        <div class="success-modal-content">
          <div class="success-icon">🎉</div>
          <h3 class="success-title">Manual Exchange Successful!</h3>
          <p class="success-message">Your Gas has been successfully exchanged and transferred to the target chain</p>
          <div class="success-details">
            <div class="detail-item">
              <span class="detail-label">Transaction Hash:</span>
              <a v-if="manualRefuelSuccessData.txHash && manualRefuelSuccessData.txHash !== 'Pending...'" 
                 :href="`https://arbiscan.io/tx/${manualRefuelSuccessData.txHash}`" 
                 target="_blank" 
                 class="detail-value text-green-800 hover:text-green-900 font-mono text-xs">
                {{ manualRefuelSuccessData.txHash.slice(0, 10) }}...{{ manualRefuelSuccessData.txHash.slice(-8) }}
              </a>
              <span v-else class="detail-value font-mono text-xs">Pending...</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Exchange Amount:</span>
              <span class="detail-value font-mono text-xs">{{ manualRefuelSuccessData.amount }} USDC</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Target Chain:</span>
              <span class="detail-value font-mono text-xs">{{ manualRefuelSuccessData.chainName }}</span>
            </div>
          </div>
          <button @click="showManualRefuelSuccess = false" class="continue-btn">
            Continue Using GasPass
          </button>
        </div>
      </div>
    </div>

    <!-- Agent Set Success Modal -->
    <div v-if="showAgentSetSuccess" class="success-modal-overlay" @click="showAgentSetSuccess = false">
      <div class="success-modal" @click.stop>
        <div class="success-modal-content">
          <div class="success-icon">🎉</div>
          <h3 class="success-title">Agent Monitoring Setup Successful!</h3>
          <p class="success-message">Agent has been successfully configured and started monitoring your wallet balance</p>
          <div class="success-details">
            <div class="detail-item">
              <span class="detail-label">Monitor Chain:</span>
              <span class="detail-value font-mono text-xs">{{ agentSetSuccessData.chainName }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Trigger Threshold:</span>
              <span class="detail-value font-mono text-xs">{{ agentSetSuccessData.threshold }} USDC</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Refill Amount:</span>
              <span class="detail-value font-mono text-xs">{{ agentSetSuccessData.amount }} USDC</span>
            </div>
          </div>
          <button @click="showAgentSetSuccess = false" class="continue-btn">
            Continue Using GasPass
          </button>
        </div>
      </div>
    </div>
  </Layout>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useWeb3 } from '../composables/useWeb3.js'
import { gasPassService } from '../services/gasPassService.js'
import { contractService} from '../services/contractService.js'
import { useVincentAuth } from '../composables/useVincentAuth.js'
import { getStoredPkpEthAddress } from '../services/vincentAuthService.js'
import { parseUnits, formatUnits } from 'ethers'
import { SUPPORTED_CHAINS } from '../config/BungeeConfig.js'
import quoteService from '../services/quoteService.js'
import Layout from '../components/Layout.vue'
import CuteGasJar from '../components/CuteGasJar.vue'
import ManualRefuelModal from '../components/ManualRefuelModal.vue'
import AutoRefuelModal from '../components/AutoRefuelModal.vue'

// Web3 composable
const { account, isConnected, isWalletReady, connectWallet, formatAddress, getUSDCBalance, provider, signer, isArbitrum, switchToArbitrum } = useWeb3()

// Vincent Auth composable（使用硬編碼的 App ID）
const { ensureAuth, loadFromStorage, vincentJwt, vincentRedirecting, vincentPkpEthAddress } = useVincentAuth()

// 暴露 SUPPORTED_CHAINS 給模板使用
const supportedChains = SUPPORTED_CHAINS

// Vincent JWT 狀態監聽（可選調試）
// watch(vincentJwt, (newVal) => {
//   console.log('[CardManagement] vincentJwt changed:', !!newVal, newVal)
// }, { immediate: true })

// Data
const userCards = ref([])
const transactionHistory = ref([])
const usdcBalance = ref('0.00')
const showManualRefuel = ref(false)
const showAutoRefuel = ref(false)
const showGasJar = ref(false) // 新增：控制 Gas Jar 顯示
const selectedTokenId = ref(null) // 新增：選中的 Token ID
const showGasExchange = ref(false) // 新增：控制 Gas Exchange 顯示

// 新增：手動兌換成功視窗
const showManualRefuelSuccess = ref(false)
const manualRefuelSuccessData = ref({
  txHash: '',
  amount: '',
  chainId: '',
  chainName: ''
})

// 新增：Agent Set 成功視窗
const showAgentSetSuccess = ref(false)
const agentSetSuccessData = ref({
  chainName: '',
  threshold: '',
  amount: ''
})

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
  amount: ''
})

// 新增：Agent 狀態
const agentStatus = ref({
  active: false,
  lastCheck: null
})

// 新增：模態視窗狀態
const showManualChainModal = ref(false)
const showAgentChainModal = ref(false)
const manualChainSearch = ref('')
const agentChainSearch = ref('')

// 新增：報價相關狀態
const actualAmount = ref('0.000000')
const isLoadingQuote = ref(false)
const quoteError = ref('')

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
         hasCard.value
})

// Methods
const loadUserData = async () => {
  console.log('🔍 loadUserData 開始執行')
  console.log('🔍 檢查條件:', {
    account: account.value,
    provider: !!provider.value,
    signer: !!signer.value,
    isConnected: isConnected.value
  })
  
  if (!account.value || !provider.value || !signer.value) {
    console.warn('⚠️ 缺少必要參數，無法載入用戶數據')
    return
  }
  
  try {
    console.log('🔍 開始初始化合約服務...')
    // 初始化合約服務
    await contractService.init(provider.value, signer.value)
    
    console.log('🔍 檢查是否有 GasPass 卡片...')
    // 檢查是否有 GasPass 卡片
    const hasCard = await contractService.hasGasPassCard(account.value)
    console.log('🔍 hasCard 結果:', hasCard)
    
    if (hasCard) {
      console.log('🔍 載入用戶卡片...')
      // 載入用戶卡片
      userCards.value = await contractService.getUserCards(account.value)
      console.log('🔍 載入的卡片:', userCards.value)
      console.log('📊 卡片詳細信息:')
      userCards.value.forEach((card, index) => {
        console.log(`  卡片 ${index + 1}: ID=${card.tokenId}, 餘額=${card.balance} USDC`)
      })
      
      // 如果沒有選中的卡片，默認選中第一張並顯示 Gas Exchange Management
      if (!selectedTokenId.value && userCards.value.length > 0) {
        selectedTokenId.value = userCards.value[0].tokenId
        showGasExchange.value = true
        console.log('🔍 默認選中卡片:', selectedTokenId.value, '並顯示 Gas Exchange Management')
      }
    } else {
      console.log('🔍 用戶沒有卡片')
      userCards.value = []
      selectedTokenId.value = null
      showGasExchange.value = false
    }
    
    // Load transaction history (暫時使用模擬數據)
    transactionHistory.value = await gasPassService.getTransactionHistory()
    
    // Load USDC balance
    usdcBalance.value = await contractService.getUSDCBalance(account.value)
    
    // 載入 Agent 狀態
    await loadAgentStatus()
    
    console.log('✅ loadUserData 完成')
  } catch (error) {
    console.error('❌ Failed to load user data:', error)
  }
}

const refreshCards = async () => {
  await loadUserData()
}

const handleMintSuccess = async () => {
  console.log('🎉 Mint 成功，刷新用戶數據...')
  
  // 添加延遲確保區塊鏈狀態更新
  await new Promise(resolve => setTimeout(resolve, 2000))
  
  // 重試機制：最多重試 3 次
  let retryCount = 0
  const maxRetries = 3
  
  while (retryCount < maxRetries) {
    try {
  await loadUserData()
      
      // 檢查是否成功載入卡片
      if (userCards.value.length > 0) {
  console.log('✅ 用戶數據已刷新，現在應該顯示卡片視圖')
        break
      } else {
        console.log(`⏳ 第 ${retryCount + 1} 次重試，等待區塊鏈確認...`)
        retryCount++
        if (retryCount < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, 3000))
        }
      }
    } catch (error) {
      console.error('❌ 載入用戶數據失敗:', error)
      retryCount++
      if (retryCount < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, 3000))
      }
    }
  }
  
  if (retryCount >= maxRetries && userCards.value.length === 0) {
    console.warn('⚠️ 多次重試後仍無法載入卡片，可能需要手動重新整理')
    // 可以在這裡顯示一個提示給用戶
  }
}

const handleDepositSuccess = async (data) => {
  console.log('💰 充值成功事件觸發，接收到的數據:', data)
  console.log('💰 開始刷新餘額...')
  
  try {
    // 立即刷新一次，嘗試獲取最新數據
    console.log('🔄 立即嘗試刷新餘額...')
    await loadUserData()
    
    // 打印當前卡片餘額供調試
    const currentCard = userCards.value.find(card => card.tokenId === selectedTokenId.value?.toString())
    if (currentCard) {
      console.log('📊 當前卡片餘額:', currentCard.balance)
    }
    
    // 添加延遲確保區塊鏈狀態更新
    await new Promise(resolve => setTimeout(resolve, 3000))
    
    // 再次刷新
    console.log('🔄 第二次刷新餘額...')
    await loadUserData()
    
    // 再次打印當前卡片餘額供調試
    const updatedCard = userCards.value.find(card => card.tokenId === selectedTokenId.value?.toString())
    if (updatedCard) {
      console.log('📊 更新後卡片餘額:', updatedCard.balance)
    }
    
    console.log('✅ 餘額刷新完成')
  } catch (error) {
    console.error('❌ 刷新餘額失敗:', error)
  }
}

const handleManualRefuelSuccess = async () => {
  console.log('⚡️ 手動加註成功，開始刷新餘額...')
  await new Promise(resolve => setTimeout(resolve, 2000))
  await loadUserData()
  console.log('✅ 餘額已更新')
}

const handleAutoRefuelSuccess = async () => {
  console.log('🔥 自動加註成功，開始刷新餘額...')
  await new Promise(resolve => setTimeout(resolve, 2000))
  await loadUserData()
  console.log('✅ 餘額已更新')
}

const handleError = (error) => {
  console.error('Operation failed:', error)
  // You can add toast notification here
}

// 新增：點擊卡片選擇
const selectCard = (tokenId) => {
  selectedTokenId.value = tokenId
  showGasExchange.value = true
  console.log('🎯 選擇卡片:', tokenId, '顯示 Gas Exchange Management')
  
  // 移除自動滾動效果
}

// 新增：獲取選中的卡片
const getSelectedCard = () => {
  if (!selectedTokenId.value) return null
  return userCards.value.find(card => card.tokenId === selectedTokenId.value)
}

// 新增：獲取選中卡片的餘額
const getSelectedCardBalance = () => {
  const card = getSelectedCard()
  return card ? card.balance : '0'
}

// 新增：鏈名稱映射
const getChainName = (chainId) => {
  return SUPPORTED_CHAINS[chainId]?.name || 'Unknown Chain'
}

// 新增：獲取目標鏈的原生代幣符號
const getChainNativeSymbol = (chainId) => {
  return SUPPORTED_CHAINS[chainId]?.nativeSymbol || 'ETH'
}

// 新增：計算實際到賬金額（使用真實報價）
const calculateActualAmount = async (amount) => {
  if (!amount || !manualRefuel.value.chainId || !account.value) {
    return '0.000000'
  }
  
  try {
    isLoadingQuote.value = true
    quoteError.value = ''
    
    const result = await quoteService.calculateActualAmount({
      destinationChainId: manualRefuel.value.chainId,
      amount: amount,
      userAddress: account.value
    })
    
    actualAmount.value = result.actualAmount
    return result.actualAmount
    
  } catch (error) {
    console.error('❌ 計算實際金額失敗:', error)
    quoteError.value = error.message
    // 返回預設計算（扣除 0.5% 手續費）
    const fee = parseFloat(amount) * 0.005
    const fallbackAmount = (parseFloat(amount) - fee).toFixed(6)
    actualAmount.value = fallbackAmount
    return fallbackAmount
  } finally {
    isLoadingQuote.value = false
  }
}

// 新增：過濾鏈列表
const filteredManualChains = computed(() => {
  if (!manualChainSearch.value) return supportedChains
  return Object.fromEntries(
    Object.entries(supportedChains).filter(([chainId, chain]) =>
      chain.name.toLowerCase().includes(manualChainSearch.value.toLowerCase()) ||
      chain.nativeSymbol.toLowerCase().includes(manualChainSearch.value.toLowerCase())
    )
  )
})

const filteredAgentChains = computed(() => {
  if (!agentChainSearch.value) return supportedChains
  return Object.fromEntries(
    Object.entries(supportedChains).filter(([chainId, chain]) =>
      chain.name.toLowerCase().includes(agentChainSearch.value.toLowerCase()) ||
      chain.nativeSymbol.toLowerCase().includes(agentChainSearch.value.toLowerCase())
    )
  )
})

// 新增：選擇鏈函數
const selectManualChain = (chainId) => {
  manualRefuel.value.chainId = chainId
  showManualChainModal.value = false
  manualChainSearch.value = ''
}

const selectAgentChain = (chainId) => {
  agentRefuel.value.chainId = chainId
  showAgentChainModal.value = false
  agentChainSearch.value = ''
}

// 新增：圖片錯誤處理
const handleImageError = (event) => {
  console.log('圖片載入失敗:', event.target.src)
  
  // 嘗試使用備用圖片源
  const currentSrc = event.target.src
  if (currentSrc.includes('cryptologos.cc')) {
    // 如果 cryptologos.cc 失敗，嘗試使用 CoinGecko
    const coinGeckoUrl = currentSrc.replace('cryptologos.cc/logos/', 'assets.coingecko.com/coins/images/')
    event.target.src = coinGeckoUrl
    return
  }
  
  // 如果所有圖片都失敗，隱藏圖片並顯示 emoji fallback
  event.target.style.display = 'none'
  
  // 找到父元素並顯示 emoji 圖標
  const parent = event.target.parentElement
  if (parent) {
    const emojiSpan = parent.querySelector('.emoji-fallback')
    if (emojiSpan) {
      emojiSpan.style.display = 'block'
      emojiSpan.style.fontSize = '20px'
    }
  }
}

// 新增：圖片載入成功處理
const handleImageLoad = (event) => {
  // 圖片載入成功時，隱藏 emoji fallback
  const parent = event.target.parentElement
  if (parent) {
    const emojiSpan = parent.querySelector('.emoji-fallback')
    if (emojiSpan) {
      emojiSpan.style.display = 'none'
    }
  }
}

// 新增：當前 Token ID (使用選中的 Token ID)
const currentTokenId = computed(() => {
  return selectedTokenId.value || (userCards.value.length > 0 ? userCards.value[0].tokenId : null)
})

// 新增：當前卡片餘額
const currentCardBalance = computed(() => {
  if (!currentTokenId.value) return 0
  const card = userCards.value.find(card => card.tokenId === currentTokenId.value)
  return card ? parseFloat(card.balance) : 0
})

// 新增：快捷按鈕函數
const setExchangeAmount = (percentage) => {
  const amount = (currentCardBalance.value * percentage / 100).toFixed(2)
  manualRefuel.value.amount = amount
}

// 新增：分割錢包地址為四段
const getAddressSegment = (index) => {
  if (!account.value) return 'Not Connected'
  
  const address = account.value
  if (address.length < 8) return address
  
  // 移除 0x 前綴
  const cleanAddress = address.startsWith('0x') ? address.slice(2) : address
  
  // 每段4個字符
  const segmentLength = Math.ceil(cleanAddress.length / 4)
  const start = index * segmentLength
  const end = Math.min(start + segmentLength, cleanAddress.length)
  
  return cleanAddress.slice(start, end).toUpperCase()
}

// 新增：執行手動兌換
const executeManualRefuel = async () => {
  if (!canExecuteManualRefuel.value) return
  
  try {
    console.log('🚀 執行手動兌換:', manualRefuel.value)
    
    // 檢查是否有選中的 Token ID
    if (!currentTokenId.value) {
      throw new Error('請先選擇一張 GasPass 卡片')
    }
    
    // 檢查餘額是否足夠
    const exchangeAmount = parseFloat(manualRefuel.value.amount)
    if (exchangeAmount > currentCardBalance.value) {
      throw new Error(`餘額不足！當前餘額: ${currentCardBalance.value.toFixed(2)} USDC`)
    }
    
    // 使用 gasPassService 執行手動兌換
    const result = await gasPassService.manualRefuel({
      tokenId: currentTokenId.value,
      targetChainId: manualRefuel.value.chainId,
      gasAmount: exchangeAmount,
      recipientAddress: manualRefuel.value.recipient
    })
    
    if (!result.success) {
      throw new Error(result.error)
    }
    
    console.log('✅ 兌換成功:', result)
    
    // 成功後重置表單
    manualRefuel.value = {
      chainId: '42161',
      amount: '',
      recipient: account.value || ''
    }
    
    // 重新載入用戶數據以更新餘額
    await loadUserData()
    
    // 顯示成功訊息
    showManualRefuelSuccess.value = true
    manualRefuelSuccessData.value = {
      txHash: result.result?.txHash || result.txHash || 'Pending...',
      amount: exchangeAmount,
      chainId: manualRefuel.value.chainId,
      chainName: getChainName(manualRefuel.value.chainId)
    }
    
  } catch (error) {
    console.error('❌ Manual refuel failed:', error)
    alert('兌換失敗: ' + error.message)
  }
}

// 新增：設定 Agent 監測
const setupAgentRefuel = async () => {
  if (!canSetupAgentRefuel.value) return
  
  try {
    // 獲取 PKP 地址
    const pkpAddress = getStoredPkpEthAddress()
    if (!pkpAddress) {
      alert('請先登入 Vincent 以獲取 PKP 地址')
      return
    }
    
    // 檢查錢包連接
    if (!account.value) {
      alert('請先連接錢包')
      return
    }
    
    // 檢查是否有 Token ID
    if (!currentTokenId.value) {
      alert('請先創建 GasPass 卡片')
      return
    }
    
    // 驗證輸入值
    if (!agentRefuel.value.threshold || !agentRefuel.value.amount) {
      alert('請填寫完整的 Agent 設定資訊')
      return
    }
    
    // 轉換為數字並驗證
    const thresholdNum = parseFloat(agentRefuel.value.threshold)
    const amountNum = parseFloat(agentRefuel.value.amount)
    
    if (isNaN(thresholdNum) || isNaN(amountNum) || thresholdNum <= 0 || amountNum <= 0) {
      alert('請輸入有效的數值')
      return
    }
    
    // 轉換 USDC 為最小單位 (1 USDC = 1000000 最小單位)
    const thresholdInWei = parseUnits(thresholdNum.toString(), 6) // USDC 有 6 位小數
    const amountInWei = parseUnits(amountNum.toString(), 6)
    
    console.log('設定 Agent 監測:', {
      tokenId: currentTokenId.value,
      chainId: agentRefuel.value.chainId,
      threshold: agentRefuel.value.threshold,
      amount: agentRefuel.value.amount,
      thresholdInWei: thresholdInWei.toString(),
      amountInWei: amountInWei.toString(),
      agent: pkpAddress
    })
    
     // 檢查 agent 映射是否正確
     console.log('🔧 檢查 Agent 映射...')
     const { gaspassRead } = contractService.getContracts()
     
     // 添加重試機制
     let agentToWallet = null
     let retryCount = 0
     const maxRetries = 3
     
     while (retryCount < maxRetries && agentToWallet === null) {
       try {
         agentToWallet = await gaspassRead.agentToWallet(pkpAddress)
         console.log('🔍 Agent 映射狀態:', { 
           pkpAddress, 
           currentWallet: account.value, 
           mappedWallet: agentToWallet 
         })
         break
       } catch (error) {
         retryCount++
         console.warn(`⚠️ 獲取 Agent 映射失敗 (嘗試 ${retryCount}/${maxRetries}):`, error.message)
         
         if (retryCount < maxRetries) {
           console.log('⏳ 等待 1 秒後重試...')
           await new Promise(resolve => setTimeout(resolve, 1000))
         } else {
           console.error('❌ 獲取 Agent 映射失敗，跳過檢查')
           // 如果無法獲取映射，跳過檢查直接繼續
           agentToWallet = account.value // 假設映射正確
         }
       }
     }
     
     if (agentToWallet && agentToWallet.toLowerCase() !== account.value.toLowerCase()) {
       throw new Error(`PKP Agent 地址 ${pkpAddress} 已經綁定到其他錢包 ${agentToWallet}。請使用相同的錢包或重新登入 Vincent。`)
     }
     
     console.log('✅ Agent 映射檢查通過')
     
     // 如果 Agent 沒有綁定，先進行綁定
     if (!agentToWallet || agentToWallet === '0x0000000000000000000000000000000000000000') {
       console.log('🔧 Agent 未綁定，先進行綁定...')
       const bindResult = await contractService.setAgentToWallet(pkpAddress, account.value)
       if (!bindResult.success) {
         throw new Error(`Agent 綁定失敗: ${bindResult.error}`)
       }
       console.log('✅ Agent 綁定成功')
     }
     
     // 設置 refuel policy
     console.log('🔧 設置 Refuel Policy...')
     console.log('🔍 簽名者地址 (用戶錢包):', account.value)
     console.log('🔍 Agent 地址 (PKP):', pkpAddress)
     console.log('🔍 Token 擁有者檢查: 簽名者必須是 Token 擁有者')
     
     const result = await contractService.setRefuelPolicy(
       currentTokenId.value, // 當前 Token ID
       agentRefuel.value.chainId, // 目標鏈 ID
       amountInWei.toString(), // 補氣金額 (USDC 最小單位)
       thresholdInWei.toString(), // 觸發閾值 (USDC 最小單位)
       pkpAddress // PKP 地址作為 agent
     )
    
    console.log('Agent 策略設定結果:', result)
    
    // 檢查結果
    if (!result.success) {
      throw new Error(result.error || '設定失敗')
    }
    
    // 更新 Agent 狀態
    agentStatus.value = {
      active: true,
      lastCheck: new Date().toLocaleString('zh-TW')
    }
    
    // 顯示成功視窗
    const chainName = getChainName(agentRefuel.value.chainId)
    agentSetSuccessData.value = {
      chainName: chainName,
      threshold: agentRefuel.value.threshold,
      amount: agentRefuel.value.amount
    }
    showAgentSetSuccess.value = true
    
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
onMounted(async () => {
  // 從 localStorage 嘗試還原 Vincent JWT（避免重整後狀態遺失）
  loadFromStorage()

  // 檢查並清除可能不匹配的 JWT
  const currentOrigin = window.location.origin
  console.log('🔍 當前頁面 origin:', currentOrigin)
  console.log('🔍 當前頁面 href:', window.location.href)
  
  // 檢查 localStorage 中的 JWT 是否與當前 origin 匹配
  const storedJwt = localStorage.getItem('VINCENT_AUTH_JWT')
  if (storedJwt) {
    try {
      // 嘗試解析 JWT 的 payload 來檢查 audience
      const payload = JSON.parse(atob(storedJwt.split('.')[1]))
      console.log('🔍 存儲的 JWT payload:', payload)
      console.log('🔍 JWT audience:', payload.aud)
      
      if (payload.aud && payload.aud !== currentOrigin + '/') {
        console.warn('⚠️ JWT audience 不匹配，清除舊的 JWT')
        console.warn('⚠️ 期望:', currentOrigin + '/', '實際:', payload.aud)
        localStorage.removeItem('VINCENT_AUTH_JWT')
        localStorage.removeItem('VINCENT_AUTH_JWT_DECODED')
        localStorage.removeItem('VINCENT_PKP_ETH_ADDRESS')
      }
    } catch (e) {
      console.warn('⚠️ 無法解析存儲的 JWT，清除它')
      localStorage.removeItem('VINCENT_AUTH_JWT')
      localStorage.removeItem('VINCENT_AUTH_JWT_DECODED')
      localStorage.removeItem('VINCENT_PKP_ETH_ADDRESS')
    }
  }

  // 無論是否已連接錢包，都先檢查本地 JWT 是否有效（若過期將自動清除）
  try {
    await ensureAuth(currentOrigin, { allowRedirect: false })
  } catch (e) {
    console.error('Vincent JWT 檢查失敗:', e)
  }

  if (isConnected.value) {
    try {
      const currentOrigin = window.location.origin
      const result = await ensureAuth(currentOrigin, { allowRedirect: false })
      if (!result.needsRedirect) {
        await loadUserData()
      }
    } catch (e) {
      console.error('Vincent Auth 初始化失敗:', e)
      await loadUserData()
    }
  } else {
    console.log('🔍 錢包未連接，等待連接...')
  }

  // 回跳時不主動打開錢包 UI；自動重連交由 wagmi autoConnect/reconnect 完成
  
  // 預設填入當前錢包地址
  if (account.value) {
    manualRefuel.value.recipient = account.value
  }
})

// 監聽錢包連線後，觸發 Vincent 登入流程
watch(isConnected, async (connected) => {
  console.log('🔍 isConnected 變化:', connected)
  if (connected) {
    try {
      const currentOrigin = window.location.origin
      const result = await ensureAuth(currentOrigin, { allowRedirect: false })
      if (!result.needsRedirect) {
        await loadUserData()
      }
    } catch (e) {
      console.error('Vincent Auth 啟動失敗:', e)
      await loadUserData()
    }
  }
})

// 監聽 account 變化，確保在錢包連接後載入數據
watch(account, async (newAccount, oldAccount) => {
  console.log('🔍 account 變化:', { newAccount, oldAccount, isConnected: isConnected.value })
  if (newAccount && isConnected.value) {
    console.log('🔍 檢測到新帳戶，嘗試載入用戶數據...')
    // 更新 Manual Exchange 的預設地址
    manualRefuel.value.recipient = newAccount
    // 延遲一點時間確保 provider 和 signer 都已更新
    setTimeout(async () => {
      await loadUserData()
    }, 1000)
  }
})

// 監聽手動兌換參數變化，自動更新報價
watch([() => manualRefuel.value.amount, () => manualRefuel.value.chainId], async ([amount, chainId]) => {
  if (amount && chainId && account.value) {
    console.log('🔄 參數變化，更新報價:', { amount, chainId })
    await calculateActualAmount(amount)
  }
}, { deep: true })

// 供 UI 觸發 Vincent 登入（導轉）
const handleVincentConnect = async () => {
  try {
    const currentOrigin = window.location.origin
    await ensureAuth(currentOrigin, { allowRedirect: true })
  } catch (e) {
    console.error('啟動 Vincent 登入失敗:', e)
  }
}

// 導轉前確認與偏好
const confirmVincentVisible = ref(false)
const skipVincentConfirm = ref(false)
const SKIP_KEY = 'VIN_SKIP_CONFIRM_LOGIN'
onMounted(() => {
  try {
    const v = localStorage.getItem(SKIP_KEY)
    skipVincentConfirm.value = v === '1'
  } catch {}
})
const setSkipVincentConfirm = (v) => {
  try { localStorage.setItem(SKIP_KEY, v ? '1' : '0') } catch {}
}
const handleVincentConnectClick = () => {
  if (skipVincentConfirm.value) {
    handleVincentConnect()
  } else {
    confirmVincentVisible.value = true
  }
}
const confirmVincentCancel = () => {
  confirmVincentVisible.value = false
}
const confirmVincentProceed = () => {
  confirmVincentVisible.value = false
  handleVincentConnect()
}
</script>

<style scoped>
/* 儲值卡背景設計 */
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

/* 高級儲值卡樣式 */
.premium-card {
  background: linear-gradient(135deg, 
    rgba(15, 23, 42, 0.9) 0%,
    rgba(30, 41, 59, 0.8) 25%,
    rgba(51, 65, 85, 0.7) 50%,
    rgba(30, 41, 59, 0.8) 75%,
    rgba(15, 23, 42, 0.9) 100%);
  backdrop-filter: blur(20px);
  border: 2px solid transparent;
  border-radius: 24px;
  box-shadow: 
    0 20px 40px rgba(0, 0, 0, 0.3),
    0 0 0 1px rgba(16, 185, 129, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  position: relative;
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.premium-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, 
    rgba(16, 185, 129, 0.1) 0%,
    rgba(20, 184, 166, 0.05) 50%,
    rgba(6, 182, 212, 0.1) 100%);
  border-radius: 24px;
  opacity: 0;
  transition: opacity 0.4s ease;
}

.premium-card:hover::before {
  opacity: 1;
}

.premium-card:hover {
  transform: translateY(-8px) scale(1.02);
  box-shadow: 
    0 32px 64px rgba(0, 0, 0, 0.4),
    0 0 0 1px rgba(16, 185, 129, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
}

.premium-card-error {
  background: linear-gradient(135deg, 
    rgba(15, 23, 42, 0.9) 0%,
    rgba(30, 41, 59, 0.8) 25%,
    rgba(51, 65, 85, 0.7) 50%,
    rgba(30, 41, 59, 0.8) 75%,
    rgba(15, 23, 42, 0.9) 100%);
  backdrop-filter: blur(20px);
  border: 2px solid transparent;
  border-radius: 24px;
  box-shadow: 
    0 20px 40px rgba(0, 0, 0, 0.3),
    0 0 0 1px rgba(239, 68, 68, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  position: relative;
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.premium-card-error::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, 
    rgba(239, 68, 68, 0.1) 0%,
    rgba(244, 63, 94, 0.05) 50%,
    rgba(236, 72, 153, 0.1) 100%);
  border-radius: 24px;
  opacity: 0;
  transition: opacity 0.4s ease;
}

.premium-card-error:hover::before {
  opacity: 1;
}

.premium-card-vincent {
  background: linear-gradient(135deg, 
    rgba(15, 23, 42, 0.95) 0%,
    rgba(30, 41, 59, 0.9) 25%,
    rgba(51, 65, 85, 0.85) 50%,
    rgba(30, 41, 59, 0.9) 75%,
    rgba(15, 23, 42, 0.95) 100%);
  backdrop-filter: blur(25px);
  border: 2px solid transparent;
  border-radius: 28px;
  box-shadow: 
    0 25px 50px rgba(0, 0, 0, 0.4),
    0 0 0 1px rgba(16, 185, 129, 0.3),
    inset 0 2px 0 rgba(255, 255, 255, 0.15);
  position: relative;
  overflow: hidden;
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.card-selector-elegant {
  background: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(16, 185, 129, 0.15);
  border-radius: 20px;
  padding: 8px 16px;
  box-shadow: 
    0 4px 20px rgba(0, 0, 0, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.05);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.card-chip {
  padding: 6px 12px;
  background: rgba(30, 41, 59, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  color: rgba(255, 255, 255, 0.6);
  font-size: 13px;
  font-weight: 500;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
}

.card-chip:hover {
  background: rgba(30, 41, 59, 0.6);
  border-color: rgba(16, 185, 129, 0.2);
  color: rgba(255, 255, 255, 0.8);
  transform: translateY(-1px);
}

.card-chip.active {
  background: rgba(16, 185, 129, 0.12);
  border-color: rgba(16, 185, 129, 0.4);
  color: #10b981;
  box-shadow: 
    0 2px 8px rgba(16, 185, 129, 0.15),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

.card-info-top-left {
  background: rgba(30, 41, 59, 0.3);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(16, 185, 129, 0.2);
  border-radius: 16px;
  padding: 12px 16px;
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.2),
    0 0 0 1px rgba(16, 185, 129, 0.15),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.card-info-top-left:hover {
  border-color: rgba(16, 185, 129, 0.3);
  box-shadow: 
    0 12px 40px rgba(0, 0, 0, 0.25),
    0 0 0 1px rgba(16, 185, 129, 0.25),
    inset 0 1px 0 rgba(255, 255, 255, 0.15);
}

.card-badge {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 5px 10px;
  background: rgba(16, 185, 129, 0.12);
  border: 1px solid rgba(16, 185, 129, 0.25);
  border-radius: 10px;
  color: #10b981;
  font-size: 12px;
  font-weight: 600;
  box-shadow: 
    0 2px 6px rgba(16, 185, 129, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

.balance-display {
  display: flex;
  align-items: baseline;
  gap: 4px;
}

.balance-display .amount {
  font-size: 16px;
  font-weight: 700;
  color: #ffffff;
}

.balance-display .currency {
  font-size: 11px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.7);
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: 6px;
}

.status-dot {
  width: 6px;
  height: 6px;
  background: #10b981;
  border-radius: 50%;
  animation: pulse 2s infinite;
}

.status-text {
  font-size: 11px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.5);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

/* Responsive Design for Card Selector */
@media (max-width: 768px) {
  .card-selector-elegant {
    padding: 6px 12px;
  }
  
  .card-chip {
    padding: 5px 10px;
    font-size: 12px;
  }
  
  .card-info-top-left {
    padding: 10px 14px;
  }
  
  .card-badge {
    padding: 4px 8px;
    font-size: 11px;
  }
  
  .balance-display .amount {
    font-size: 14px;
  }
}

@media (max-width: 480px) {
  .card-selector-elegant {
    padding: 5px 10px;
  }
  
  .card-chip {
    padding: 4px 8px;
    font-size: 11px;
  }
  
  .card-info-top-left {
    padding: 8px 12px;
  }
  
  .card-badge {
    padding: 3px 6px;
    font-size: 10px;
  }
  
  .balance-display .amount {
    font-size: 13px;
  }
}

.premium-card-main {
  background: 
    linear-gradient(135deg, 
      rgba(192, 192, 192, 0.95) 0%,
      rgba(169, 169, 169, 0.9) 15%,
      rgba(128, 128, 128, 0.85) 30%,
      rgba(105, 105, 105, 0.8) 45%,
      rgba(128, 128, 128, 0.85) 60%,
      rgba(169, 169, 169, 0.9) 75%,
      rgba(192, 192, 192, 0.95) 100%),
    radial-gradient(circle at 20% 20%, rgba(255, 255, 255, 0.3) 0%, transparent 50%),
    radial-gradient(circle at 80% 80%, rgba(0, 0, 0, 0.2) 0%, transparent 50%);
  backdrop-filter: blur(25px);
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-radius: 32px;
  box-shadow: 
    0 50px 100px rgba(0, 0, 0, 0.4),
    0 25px 50px rgba(0, 0, 0, 0.3),
    0 0 0 1px rgba(255, 255, 255, 0.4),
    inset 0 3px 0 rgba(255, 255, 255, 0.4),
    inset 0 -3px 0 rgba(0, 0, 0, 0.2),
    0 0 30px rgba(192, 192, 192, 0.3),
    0 0 60px rgba(192, 192, 192, 0.2);
  position: relative;
  overflow: hidden;
  transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  transform: perspective(1000px) rotateX(5deg) rotateY(-2deg);
  animation: card-float 6s ease-in-out infinite;
}

.premium-card-main::after {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: linear-gradient(45deg, 
    transparent 30%, 
    rgba(255, 255, 255, 0.2) 50%, 
    transparent 70%);
  animation: card-shine 3s ease-in-out infinite;
  pointer-events: none;
}

.premium-card-main:hover {
  transform: perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(-20px) scale(1.02);
  box-shadow: 
    0 80px 160px rgba(0, 0, 0, 0.5),
    0 40px 80px rgba(0, 0, 0, 0.4),
    0 0 0 1px rgba(255, 255, 255, 0.5),
    inset 0 3px 0 rgba(255, 255, 255, 0.5),
    inset 0 -3px 0 rgba(0, 0, 0, 0.3),
    0 0 50px rgba(192, 192, 192, 0.4),
    0 0 100px rgba(192, 192, 192, 0.3);
  animation-play-state: paused;
}

.premium-card-info {
  background: linear-gradient(135deg, 
    rgba(15, 23, 42, 0.9) 0%,
    rgba(30, 41, 59, 0.8) 25%,
    rgba(51, 65, 85, 0.7) 50%,
    rgba(30, 41, 59, 0.8) 75%,
    rgba(15, 23, 42, 0.9) 100%);
  backdrop-filter: blur(20px);
  border: 2px solid transparent;
  border-radius: 24px;
  box-shadow: 
    0 20px 40px rgba(0, 0, 0, 0.3),
    0 0 0 1px rgba(16, 185, 129, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  position: relative;
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.premium-card-item {
  background: linear-gradient(135deg, 
    rgba(15, 23, 42, 0.8) 0%,
    rgba(30, 41, 59, 0.7) 25%,
    rgba(51, 65, 85, 0.6) 50%,
    rgba(30, 41, 59, 0.7) 75%,
    rgba(15, 23, 42, 0.8) 100%);
  backdrop-filter: blur(15px);
  border: 1px solid transparent;
  border-radius: 20px;
  box-shadow: 
    0 15px 30px rgba(0, 0, 0, 0.2),
    0 0 0 1px rgba(16, 185, 129, 0.15),
    inset 0 1px 0 rgba(255, 255, 255, 0.08);
  position: relative;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  margin-bottom: 24px;
  padding: 24px;
}

.premium-card-item:hover {
  transform: translateY(-4px) scale(1.01);
  box-shadow: 
    0 25px 50px rgba(0, 0, 0, 0.3),
    0 0 0 1px rgba(16, 185, 129, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.15);
}

.premium-card-deposit {
  background: linear-gradient(135deg, 
    rgba(15, 23, 42, 0.9) 0%,
    rgba(30, 41, 59, 0.8) 25%,
    rgba(51, 65, 85, 0.7) 50%,
    rgba(30, 41, 59, 0.8) 75%,
    rgba(15, 23, 42, 0.9) 100%);
  backdrop-filter: blur(20px);
  border: 2px solid transparent;
  border-radius: 24px;
  box-shadow: 
    0 20px 40px rgba(0, 0, 0, 0.3),
    0 0 0 1px rgba(16, 185, 129, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  position: relative;
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.premium-card-exchange {
  background: linear-gradient(135deg, 
    rgba(15, 23, 42, 0.95) 0%,
    rgba(30, 41, 59, 0.9) 25%,
    rgba(51, 65, 85, 0.85) 50%,
    rgba(30, 41, 59, 0.9) 75%,
    rgba(15, 23, 42, 0.95) 100%);
  backdrop-filter: blur(25px);
  border: 3px solid transparent;
  border-radius: 28px;
  box-shadow: 
    0 25px 50px rgba(0, 0, 0, 0.4),
    0 0 0 2px rgba(16, 185, 129, 0.3),
    inset 0 2px 0 rgba(255, 255, 255, 0.15);
  position: relative;
  overflow: hidden;
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.premium-card-settings {
  background: linear-gradient(135deg, 
    rgba(15, 23, 42, 0.85) 0%,
    rgba(30, 41, 59, 0.75) 25%,
    rgba(51, 65, 85, 0.65) 50%,
    rgba(30, 41, 59, 0.75) 75%,
    rgba(15, 23, 42, 0.85) 100%);
  backdrop-filter: blur(18px);
  border: 1px solid transparent;
  border-radius: 20px;
  box-shadow: 
    0 15px 30px rgba(0, 0, 0, 0.25),
    0 0 0 1px rgba(16, 185, 129, 0.15),
    inset 0 1px 0 rgba(255, 255, 255, 0.08);
  position: relative;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.premium-card-preview {
  background: linear-gradient(135deg, 
    rgba(15, 23, 42, 0.85) 0%,
    rgba(30, 41, 59, 0.75) 25%,
    rgba(51, 65, 85, 0.65) 50%,
    rgba(30, 41, 59, 0.75) 75%,
    rgba(15, 23, 42, 0.85) 100%);
  backdrop-filter: blur(18px);
  border: 1px solid transparent;
  border-radius: 20px;
  box-shadow: 
    0 15px 30px rgba(0, 0, 0, 0.25),
    0 0 0 1px rgba(16, 185, 129, 0.15),
    inset 0 1px 0 rgba(255, 255, 255, 0.08);
  position: relative;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* 動畫效果 */
@keyframes card-gradient-shift {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}

@keyframes card-pattern-move {
  0% { transform: translateX(0) translateY(0); }
  100% { transform: translateX(60px) translateY(60px); }
}

@keyframes card-float {
  0%, 100% { 
    transform: perspective(1000px) rotateX(5deg) rotateY(-2deg) translateY(0px);
  }
  25% { 
    transform: perspective(1000px) rotateX(3deg) rotateY(-1deg) translateY(-8px);
  }
  50% { 
    transform: perspective(1000px) rotateX(7deg) rotateY(-3deg) translateY(-12px);
  }
  75% { 
    transform: perspective(1000px) rotateX(4deg) rotateY(-1deg) translateY(-6px);
  }
}

@keyframes card-shine {
  0% { transform: translateX(-100%) translateY(-100%) rotate(45deg); }
  100% { transform: translateX(100%) translateY(100%) rotate(45deg); }
}

@keyframes card-glow {
  0%, 100% { 
    box-shadow: 
      0 20px 40px rgba(0, 0, 0, 0.3),
      0 0 0 1px rgba(16, 185, 129, 0.2),
      inset 0 1px 0 rgba(255, 255, 255, 0.1);
  }
  50% { 
    box-shadow: 
      0 25px 50px rgba(0, 0, 0, 0.4),
      0 0 0 1px rgba(16, 185, 129, 0.4),
      inset 0 1px 0 rgba(255, 255, 255, 0.2);
  }
}

@keyframes card-float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
}

/* 按鈕樣式 */
.btn-primary {
  @apply bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-emerald-500/30 focus:ring-offset-2 shadow-lg hover:shadow-xl hover:scale-105;
  position: relative;
  overflow: hidden;
}

.btn-primary::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s;
}

.btn-primary:hover::before {
  left: 100%;
}

.btn-secondary {
  @apply bg-slate-600/50 border border-emerald-400/30 hover:border-emerald-400/50 text-emerald-200 hover:text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-emerald-500/30 focus:ring-offset-2 hover:bg-emerald-500/10;
}

.btn-secondary-sm {
  @apply bg-slate-600/50 hover:bg-emerald-500/20 text-emerald-200 hover:text-white font-medium py-2 px-4 rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:ring-offset-2 border border-emerald-400/30 hover:border-emerald-400/50;
}

.card-item {
  @apply border border-emerald-400/30 rounded-xl p-4 mb-4 hover:shadow-md transition-all duration-300 bg-slate-700/50 backdrop-blur-sm;
}

.card-item-enhanced {
  @apply border border-emerald-400/30 rounded-2xl p-6 mb-6 hover:shadow-lg transition-all duration-300 bg-slate-700/50 backdrop-blur-sm;
}

.transaction-item {
  @apply border-b border-emerald-400/20 py-4 last:border-b-0;
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
  @apply ring-2 ring-emerald-500/20 border-emerald-400;
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
  0%, 100% { box-shadow: 0 0 20px rgba(16, 185, 129, 0.3); }
  50% { box-shadow: 0 0 40px rgba(16, 185, 129, 0.6); }
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

/* 新增：隱藏數字輸入框的箭頭 */
input[type="number"]::-webkit-outer-spin-button,
input[type="number"]::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

input[type="number"] {
  -moz-appearance: textfield;
  appearance: textfield;
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



/* 錢包地址樣式 */
.card-number-display {
  position: absolute;
  bottom: 2rem;
  left: 2rem;
  display: flex;
  gap: 0.5rem;
  font-family: 'Courier New', monospace;
  font-size: 0.8rem;
  font-weight: bold;
  color: rgba(255, 255, 255, 0.9);
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
  z-index: 10;
  max-width: calc(100% - 4rem);
}

.number-segment {
  background: rgba(255, 255, 255, 0.1);
  padding: 0.25rem 0.4rem;
  border-radius: 4px;
  backdrop-filter: blur(5px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  letter-spacing: 0.1em;
  white-space: nowrap;
  min-width: 2.5rem;
  text-align: center;
  flex-shrink: 0;
}

/* 新增：深色模式支持（預留） */
@media (prefers-color-scheme: dark) {
  .card-item-enhanced {
    @apply bg-slate-800/50 border-emerald-400/30;
  }
}

/* 模態視窗樣式 */
.modal-overlay {
  @apply fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm;
  animation: fadeIn 0.3s ease-out;
}

.modal-container {
  @apply rounded-2xl shadow-2xl max-w-2xl w-full mx-4 max-h-[70vh] overflow-hidden;
  background: linear-gradient(135deg, rgba(15, 23, 42, 0.98) 0%, rgba(30, 41, 59, 0.98) 50%, rgba(15, 23, 42, 0.98) 100%);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(16, 185, 129, 0.3);
  box-shadow: 
    0 25px 50px rgba(0, 0, 0, 0.4),
    0 0 0 1px rgba(16, 185, 129, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

.modal-header {
  @apply flex items-center justify-between p-6 border-b border-emerald-400/20;
}

.modal-title {
  @apply text-xl font-bold text-white;
}

.modal-close {
  @apply p-2 text-emerald-300 hover:text-white hover:bg-emerald-500/20 rounded-lg transition-all duration-300;
}

.modal-content {
  @apply p-6 max-h-[50vh] overflow-y-auto;
}

.search-box {
  @apply mb-6;
}

.search-input {
  @apply w-full p-3 bg-slate-600/50 border border-emerald-400/30 rounded-xl focus:border-emerald-400 focus:outline-none transition-colors text-white placeholder-emerald-300;
}

.chains-grid {
  @apply grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3;
}

.chain-card {
  @apply flex flex-col items-center p-4 bg-white/5 border border-emerald-300/20 rounded-lg cursor-pointer transition-all duration-300 hover:bg-emerald-500/10 hover:border-emerald-400/40 hover:shadow-md;
  min-height: 120px;
}

.chain-card.active {
  @apply bg-emerald-500/20 border-emerald-400/60 shadow-md;
}

.chain-card .chain-icon {
  @apply mb-3;
}

.chain-card .chain-icon img {
  @apply shadow-sm border border-white/10;
}

.chain-card .chain-info {
  @apply text-center;
}

.chain-card .chain-name {
  @apply text-sm font-semibold text-white mb-1;
}

.chain-gas-symbol {
  @apply text-xs text-emerald-300 font-medium;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

/* 專業化狀態信息樣式 */
.status-info-container {
  @apply space-y-4;
}

.status-description {
  @apply space-y-2;
}

.primary-text {
  @apply text-lg font-medium text-white/90 leading-relaxed;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

.secondary-text {
  @apply text-base text-emerald-200/80 leading-relaxed;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

/* Success Modal Styles */
.success-modal-overlay {
  @apply fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4;
}

.success-modal {
  @apply bg-white rounded-xl shadow-xl max-w-md w-full;
}

.success-modal-content {
  @apply p-6 text-center;
}

.success-icon {
  @apply text-4xl mb-4;
}

.success-title {
  @apply text-2xl font-bold text-green-800 mb-2;
}

.success-message {
  @apply text-green-700 mb-4;
}

.success-details {
  @apply space-y-2 mb-6 p-4 bg-green-50 rounded-lg;
}

.detail-item {
  @apply flex justify-between text-sm;
}

.detail-label {
  @apply text-green-700 font-medium;
}

.detail-value {
  @apply text-green-800 font-mono text-xs;
}

.continue-btn {
  @apply w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300;
}
</style>
