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
            <div v-if="!hasCard" class="text-center py-12">
              <div class="premium-card-main p-12 max-w-4xl mx-auto relative overflow-hidden">
                <!-- 背景裝飾 -->
                <div class="absolute inset-0 bg-gradient-to-br from-emerald-50/10 to-teal-50/10"></div>
                <div class="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-emerald-200/20 to-teal-200/20 rounded-full -translate-y-32 translate-x-32"></div>
                <div class="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-emerald-200/20 to-teal-200/20 rounded-full translate-y-24 -translate-x-24"></div>
                
                <div class="relative z-10">
                  <div class="flex items-center justify-center gap-3 mb-6">
                    <h3 class="text-3xl font-bold text-white">Welcome to GasPass!</h3>
                  </div>
                  <p class="text-xl text-emerald-200 mb-12 max-w-2xl mx-auto">
                    You don't have a card yet, let's create your first cute GasPass jar to start your worry-free DeFi journey!
                  </p>
              
              <!-- Cute Gas Jar Component -->
              <CuteGasJar 
                :isFirstTime="true"
                @success="handleMintSuccess"
                @error="handleError"
              />
                </div>
            </div>
          </div>

            <!-- 有儲值卡的情況 -->
          <div v-else>
              <!-- 儲值卡概覽 -->
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                <!-- 儲值卡資訊 -->
              <div class="lg:col-span-2">
                  <div class="premium-card-info p-8 relative overflow-hidden group">
                    <!-- 背景光效 -->
                    <div class="absolute inset-0 bg-gradient-to-br from-emerald-50/10 to-teal-50/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    
                    <div class="relative z-10">
                      <div class="flex items-center justify-between mb-8">
                        <div class="flex items-center gap-3">
                          <div class="w-8 h-8 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-lg flex items-center justify-center">
                            <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
                            </svg>
                          </div>
                          <h3 class="text-2xl font-bold text-white">My Card</h3>
                        </div>
                        <button @click="refreshCards" class="btn-secondary-sm group">
                          <svg class="w-4 h-4 group-hover:rotate-180 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                        </svg>
                        Refresh
                      </button>
                  </div>
                  
                      <div v-for="card in userCards" :key="card.tokenId" class="premium-card-item">
                    <div class="flex items-center justify-between">
                          <div class="flex items-center gap-6">
                            <div class="w-20 h-20 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-3xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                              <svg class="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
                          </svg>
                        </div>
                        <div>
                              <h4 class="text-2xl font-bold text-white mb-2">GasPass #{{ card.tokenId }}</h4>
                              <p class="text-lg text-emerald-200 mb-1">Balance: {{ card.balance }} USDC</p>
                          <p class="text-sm text-emerald-300">Last updated: {{ card.lastUpdate }}</p>
                        </div>
                      </div>
                      <div class="text-right">
                            <div class="text-3xl font-bold text-white mb-1">{{ card.balance }} USDC</div>
                        <div class="text-sm text-emerald-300">Available Balance</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
                </div>

                <!-- 快速儲值 -->
                <div class="premium-card-deposit p-8 relative overflow-hidden group">
                  <!-- 背景光效 -->
                  <div class="absolute inset-0 bg-gradient-to-br from-emerald-50/10 to-teal-50/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  
                  <div class="relative z-10">
                    <div class="flex items-center gap-3 mb-6">
                      <div class="w-8 h-8 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-lg flex items-center justify-center">
                        <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
                        </svg>
                      </div>
                      <h4 class="text-xl font-bold text-white">Quick Deposit</h4>
                    </div>
                  <CuteGasJar 
                    :isFirstTime="false"
                    :existingCard="userCards[0]"
                    @success="handleDepositSuccess"
                    @error="handleError"
                  />
                </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 下半部分：Gas 兌換管理 -->
          <div v-if="vincentJwt" class="premium-card-exchange p-8 relative overflow-hidden">
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
                <h3 class="text-2xl font-bold text-white">Gas Exchange Management</h3>
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
                        <select v-model="manualRefuel.chainId" class="w-full p-3 bg-slate-600/50 border border-emerald-400/30 rounded-xl focus:border-emerald-400 focus:outline-none transition-colors text-white">
                          <option value="1">Ethereum Mainnet</option>
                          <option value="42161">Arbitrum One</option>
                          <option value="10">Optimism</option>
                          <option value="137">Polygon</option>
                          <option value="8453">Base</option>
                        </select>
                      </div>
                      
                      <div>
                        <label class="block text-sm font-semibold text-emerald-200 mb-2">Exchange Amount (USDC)</label>
                        <input 
                          v-model="manualRefuel.amount"
                          type="number"
                          step="0.01"
                          min="1"
                          placeholder="Enter exchange amount"
                          class="w-full p-3 bg-slate-600/50 border border-emerald-400/30 rounded-xl focus:border-emerald-400 focus:outline-none transition-colors text-white placeholder-emerald-300"
                        />
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
                        <span class="font-bold text-emerald-400">{{ calculateActualAmount(manualRefuel.amount) }} USDC</span>
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
                        <select v-model="agentRefuel.chainId" class="w-full p-3 bg-slate-600/50 border border-emerald-400/30 rounded-xl focus:border-emerald-400 focus:outline-none transition-colors text-white">
                          <option value="1">Ethereum Mainnet</option>
                          <option value="42161">Arbitrum One</option>
                          <option value="10">Optimism</option>
                          <option value="137">Polygon</option>
                          <option value="8453">Base</option>
                        </select>
                      </div>
                      
                      <div>
                        <label class="block text-sm font-semibold text-emerald-200 mb-2">Trigger Threshold (ETH)</label>
                        <input 
                          v-model="agentRefuel.threshold"
                          type="number"
                          step="0.001"
                          min="0.001"
                          placeholder="Trigger when balance falls below this value"
                          class="w-full p-3 bg-slate-600/50 border border-emerald-400/30 rounded-xl focus:border-emerald-400 focus:outline-none transition-colors text-white placeholder-emerald-300"
                        />
                      </div>
                      
                      <div>
                        <label class="block text-sm font-semibold text-emerald-200 mb-2">Refill Amount (USDC)</label>
                        <input 
                          v-model="agentRefuel.amount"
                          type="number"
                          step="0.01"
                          min="1"
                          placeholder="Amount to refill each time"
                          class="w-full p-3 bg-slate-600/50 border border-emerald-400/30 rounded-xl focus:border-emerald-400 focus:outline-none transition-colors text-white placeholder-emerald-300"
                        />
                      </div>
                      
                      <div>
                        <label class="block text-sm font-semibold text-emerald-200 mb-2">Recipient Address</label>
                        <input 
                          v-model="agentRefuel.recipient"
                          type="text"
                          placeholder="Enter recipient address"
                          class="w-full p-3 bg-slate-600/50 border border-emerald-400/30 rounded-xl focus:border-emerald-400 focus:outline-none transition-colors text-white placeholder-emerald-300"
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
                        <span class="font-semibold text-white">{{ agentRefuel.threshold || '0' }} ETH</span>
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
  </Layout>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useWeb3 } from '../composables/useWeb3.js'
import { gasPassService } from '../services/gasPassService.js'
import { contractService} from '../services/contractService.js'
import { useVincentAuth } from '../composables/useVincentAuth.js'
import Layout from '../components/Layout.vue'
import CuteGasJar from '../components/CuteGasJar.vue'
import ManualRefuelModal from '../components/ManualRefuelModal.vue'
import AutoRefuelModal from '../components/AutoRefuelModal.vue'

// Web3 composable
const { account, isConnected, isWalletReady, connectWallet, formatAddress, getUSDCBalance, provider, signer, isArbitrum, switchToArbitrum } = useWeb3()

// Vincent Auth composable（使用硬編碼的 App ID）
const { ensureAuth, loadFromStorage, vincentJwt, vincentRedirecting, vincentPkpEthAddress } = useVincentAuth()

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
  amount: '',
  recipient: ''
})

// 新增：Agent 狀態
const agentStatus = ref({
  active: false,
  lastCheck: null
})

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
         agentRefuel.value.recipient &&
         hasCard.value
})

// Methods
const loadUserData = async () => {
  if (!account.value || !provider.value || !signer.value) return
  
  try {
    // 初始化合約服務
    await contractService.init(provider.value, signer.value)
    
    // 檢查是否有 GasPass 卡片
    const hasCard = await contractService.hasGasPassCard(account.value)
    
    if (hasCard) {
      // 載入用戶卡片
      userCards.value = await contractService.getUserCards(account.value)
    } else {
      userCards.value = []
    }
    
    // Load transaction history (暫時使用模擬數據)
    transactionHistory.value = await gasPassService.getTransactionHistory()
    
    // Load USDC balance
    usdcBalance.value = await contractService.getUSDCBalance(account.value)
    
    // 載入 Agent 狀態
    await loadAgentStatus()
  } catch (error) {
    console.error('Failed to load user data:', error)
  }
}

const refreshCards = async () => {
  await loadUserData()
}

const handleMintSuccess = () => {
  loadUserData()
}

const handleDepositSuccess = () => {
  loadUserData()
}

const handleManualRefuelSuccess = () => {
  loadUserData()
}

const handleAutoRefuelSuccess = () => {
  loadUserData()
}

const handleError = (error) => {
  console.error('Operation failed:', error)
  // You can add toast notification here
}

// 新增：鏈名稱映射
const getChainName = (chainId) => {
  const chainMap = {
    '1': 'Ethereum Mainnet',
    '42161': 'Arbitrum One',
    '10': 'Optimism',
    '137': 'Polygon',
    '8453': 'Base'
  }
  return chainMap[chainId] || 'Unknown Chain'
}

// 新增：計算實際到賬金額
const calculateActualAmount = (amount) => {
  if (!amount) return '0.00'
  const fee = parseFloat(amount) * 0.005 // 0.5% 手續費
  return (parseFloat(amount) - fee).toFixed(2)
}

// 新增：執行手動兌換
const executeManualRefuel = async () => {
  if (!canExecuteManualRefuel.value) return
  
  try {
    // 這裡會串接 Bounce swap 工具
    console.log('執行手動兌換:', manualRefuel.value)
    
    // 模擬 API 調用
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // 成功後重置表單
    manualRefuel.value = {
      chainId: '42161',
      amount: '',
      recipient: ''
    }
    
    // 顯示成功訊息
    alert('Gas 兌換成功！')
    
  } catch (error) {
    console.error('Manual refuel failed:', error)
    alert('兌換失敗: ' + error.message)
  }
}

// 新增：設定 Agent 監測
const setupAgentRefuel = async () => {
  if (!canSetupAgentRefuel.value) return
  
  try {
    // 這裡會設定 Agent 監測策略
    console.log('設定 Agent 監測:', agentRefuel.value)
    
    // 模擬 API 調用
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // 更新 Agent 狀態
    agentStatus.value = {
      active: true,
      lastCheck: new Date().toLocaleString('zh-TW')
    }
    
    // 顯示成功訊息
    alert('Agent 監測設定成功！')
    
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
  }

  // 回跳時不主動打開錢包 UI；自動重連交由 wagmi autoConnect/reconnect 完成
  
  // 預設填入當前錢包地址
  if (account.value) {
    manualRefuel.value.recipient = account.value
    agentRefuel.value.recipient = account.value
  }
})

// 監聽錢包連線後，觸發 Vincent 登入流程
watch(isConnected, async (connected) => {
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

.premium-card-main {
  background: linear-gradient(135deg, 
    rgba(15, 23, 42, 0.95) 0%,
    rgba(30, 41, 59, 0.9) 25%,
    rgba(51, 65, 85, 0.85) 50%,
    rgba(30, 41, 59, 0.9) 75%,
    rgba(15, 23, 42, 0.95) 100%);
  backdrop-filter: blur(25px);
  border: 3px solid transparent;
  border-radius: 32px;
  box-shadow: 
    0 30px 60px rgba(0, 0, 0, 0.5),
    0 0 0 2px rgba(16, 185, 129, 0.4),
    inset 0 3px 0 rgba(255, 255, 255, 0.2);
  position: relative;
  overflow: hidden;
  transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
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
    rgba(16, 185, 129, 0.1) 50%, 
    transparent 70%);
  animation: card-shine 3s ease-in-out infinite;
  pointer-events: none;
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

/* 新增：響應式設計增強 */
@media (max-width: 768px) {
  .card-item-enhanced {
    @apply p-4;
  }
  
  .grid-cols-1.lg\\:grid-cols-2 {
    @apply gap-4;
  }
}

/* 新增：深色模式支持（預留） */
@media (prefers-color-scheme: dark) {
  .card-item-enhanced {
    @apply bg-slate-800/50 border-emerald-400/30;
  }
}
</style>
