<template>
  <Layout>

    <!-- Main Content -->
    <section class="py-12 bg-gradient-to-br from-slate-900/80 to-gray-900/90 backdrop-blur-xl min-h-screen">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <!-- Wallet Connection Status -->
        <div v-if="isWalletReady && !isConnected" class="text-center py-12">
          <div class="bg-slate-800/60 backdrop-blur-md border border-emerald-300/30 rounded-2xl shadow-lg p-8 max-w-md mx-auto">
            <div class="w-16 h-16 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
              </svg>
            </div>
            <h3 class="text-xl font-bold text-white mb-4">請先連接錢包</h3>
            <p class="text-emerald-200 mb-6">連接您的錢包以開始使用 GasPass 儲值卡管理功能</p>
            <button @click="connectWallet" class="btn-primary w-full">
              連接錢包
            </button>
          </div>
        </div>

        <!-- Network Check -->
        <div v-if="isConnected && !isArbitrum" class="text-center py-12">
          <div class="bg-slate-800/60 backdrop-blur-md border border-red-300/30 rounded-2xl shadow-lg p-8 max-w-md mx-auto">
            <div class="w-16 h-16 bg-gradient-to-br from-red-400 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
              </svg>
            </div>
            <h3 class="text-xl font-bold text-white mb-4">請切換到 Arbitrum Mainnet</h3>
            <p class="text-red-200 mb-6">您的合約部署在 Arbitrum Mainnet 上，請切換網絡以繼續使用</p>
            <button @click="switchToArbitrum" class="btn-primary w-full">
              切換到 Arbitrum Mainnet
            </button>
          </div>
        </div>

        <!-- Connected State -->
        <div v-else>
          <!-- Vincent Agent 登入銜接卡片（尚未取得 JWT 時顯示） -->
          <div v-if="!vincentJwt" class="mb-8">
            <div class="bg-slate-800/60 backdrop-blur-md border border-emerald-300/30 rounded-2xl shadow-lg p-8 relative overflow-hidden group">
              <div class="absolute inset-0 bg-gradient-to-br from-emerald-50/10 to-teal-50/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div class="relative z-10">
                <div class="flex items-center justify-between mb-6">
                  <div class="flex items-center gap-3">
                    <div class="w-8 h-8 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-lg flex items-center justify-center">
                      <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                      </svg>
                    </div>
                    <h3 class="text-2xl font-bold text-white">連接 Vincent Agent</h3>
                  </div>
                  <span v-if="vincentRedirecting" class="text-sm text-emerald-300">正在導向登入頁...</span>
                </div>
                <p class="text-emerald-200 mb-6">
                  為了啟用跨鏈 Gas 兌換與自動監測，請先完成 Vincent Agent 登入授權。
                </p>
              <div class="flex items-center gap-4">
                  <button 
                    class="btn-primary"
                    :disabled="vincentRedirecting"
                    @click="handleVincentConnectClick"
                  >
                    前往 Vincent 登入
                  </button>
                  <div v-if="vincentRedirecting" class="flex items-center gap-1 text-gray-500">
                    <span class="loading-dot">•</span>
                    <span class="loading-dot">•</span>
                    <span class="loading-dot">•</span>
                  </div>
                </div>

                <!-- 導轉前確認區塊 -->
                <div v-if="confirmVincentVisible" class="mt-6 p-4 bg-emerald-500/10 border border-emerald-400/30 rounded-xl">
                  <p class="text-white mb-4">即將離開 GasPass 前往 Vincent 登入，完成後會自動返回。是否繼續？</p>
                  <div class="flex items-center justify-between">
                    <label class="flex items-center gap-2 text-sm text-emerald-200">
                      <input type="checkbox" v-model="skipVincentConfirm" @change="setSkipVincentConfirm(skipVincentConfirm)" />
                      下次不再顯示
                    </label>
                    <div class="flex items-center gap-3">
                      <button class="btn-secondary-sm" @click="confirmVincentCancel">取消</button>
                      <button class="btn-primary" @click="confirmVincentProceed">繼續</button>
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
              <div class="bg-slate-800/60 backdrop-blur-md border border-emerald-300/30 rounded-2xl shadow-lg p-12 max-w-4xl mx-auto relative overflow-hidden">
                <!-- 背景裝飾 -->
                <div class="absolute inset-0 bg-gradient-to-br from-emerald-50/10 to-teal-50/10"></div>
                <div class="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-emerald-200/20 to-teal-200/20 rounded-full -translate-y-32 translate-x-32"></div>
                <div class="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-emerald-200/20 to-teal-200/20 rounded-full translate-y-24 -translate-x-24"></div>
                
                <div class="relative z-10">
                  <div class="flex items-center justify-center gap-3 mb-6">
                    <div class="w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-lg flex items-center justify-center">
                      <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
                      </svg>
                    </div>
                    <h3 class="text-3xl font-bold text-white">歡迎使用 GasPass！</h3>
                  </div>
                  <p class="text-xl text-emerald-200 mb-12 max-w-2xl mx-auto">
                    您還沒有儲值卡，讓我們為您創建第一個可愛的 GasPass 儲值罐，開始您的無憂 DeFi 之旅！
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
                  <div class="bg-slate-800/60 backdrop-blur-md border border-emerald-300/30 rounded-2xl shadow-lg p-8 relative overflow-hidden group">
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
                          <h3 class="text-2xl font-bold text-white">我的儲值卡</h3>
                        </div>
                        <button @click="refreshCards" class="btn-secondary-sm group">
                          <svg class="w-4 h-4 group-hover:rotate-180 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                        </svg>
                        刷新
                      </button>
                  </div>
                  
                      <div v-for="card in userCards" :key="card.tokenId" class="card-item-enhanced">
                    <div class="flex items-center justify-between">
                          <div class="flex items-center gap-6">
                            <div class="w-20 h-20 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-3xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                              <svg class="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
                          </svg>
                        </div>
                        <div>
                              <h4 class="text-2xl font-bold text-white mb-2">GasPass #{{ card.tokenId }}</h4>
                              <p class="text-lg text-emerald-200 mb-1">餘額: {{ card.balance }} USDC</p>
                          <p class="text-sm text-emerald-300">最後更新: {{ card.lastUpdate }}</p>
                        </div>
                      </div>
                      <div class="text-right">
                            <div class="text-3xl font-bold text-white mb-1">{{ card.balance }} USDC</div>
                        <div class="text-sm text-emerald-300">可用餘額</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
                </div>

                <!-- 快速儲值 -->
                <div class="bg-slate-800/60 backdrop-blur-md border border-emerald-300/30 rounded-2xl shadow-lg p-8 relative overflow-hidden group">
                  <!-- 背景光效 -->
                  <div class="absolute inset-0 bg-gradient-to-br from-emerald-50/10 to-teal-50/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  
                  <div class="relative z-10">
                    <div class="flex items-center gap-3 mb-6">
                      <div class="w-8 h-8 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-lg flex items-center justify-center">
                        <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
                        </svg>
                      </div>
                      <h4 class="text-xl font-bold text-white">快速儲值</h4>
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
          <div v-if="vincentJwt" class="bg-slate-800/60 backdrop-blur-md border border-emerald-300/30 rounded-2xl shadow-lg p-8 relative overflow-hidden">
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
                <h3 class="text-2xl font-bold text-white">Gas 兌換管理</h3>
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
                      手動兌換
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
                      Agent 自動監測
                      </span>
                    </button>
                  </div>
                </div>

              <!-- 手動兌換 Gas -->
              <div v-if="activeTab === 'manual'" class="space-y-6">
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <!-- 兌換設定 -->
                  <div class="bg-slate-700/50 backdrop-blur-sm rounded-2xl p-6 border border-emerald-400/30">
                    <div class="flex items-center gap-3 mb-6">
                      <div class="w-8 h-8 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-lg flex items-center justify-center">
                        <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                        </svg>
                      </div>
                      <h4 class="text-xl font-bold text-white">手動兌換設定</h4>
                    </div>
                    
                    <div class="space-y-4">
                      <div>
                        <label class="block text-sm font-semibold text-emerald-200 mb-2">選擇目標鏈</label>
                        <select v-model="manualRefuel.chainId" class="w-full p-3 bg-slate-600/50 border border-emerald-400/30 rounded-xl focus:border-emerald-400 focus:outline-none transition-colors text-white">
                          <option value="1">Ethereum Mainnet</option>
                          <option value="42161">Arbitrum One</option>
                          <option value="10">Optimism</option>
                          <option value="137">Polygon</option>
                          <option value="8453">Base</option>
                        </select>
                      </div>
                      
                      <div>
                        <label class="block text-sm font-semibold text-emerald-200 mb-2">兌換金額 (USDC)</label>
                        <input 
                          v-model="manualRefuel.amount"
                          type="number"
                          step="0.01"
                          min="1"
                          placeholder="輸入兌換金額"
                          class="w-full p-3 bg-slate-600/50 border border-emerald-400/30 rounded-xl focus:border-emerald-400 focus:outline-none transition-colors text-white placeholder-emerald-300"
                        />
                      </div>
                      
                      <div>
                        <label class="block text-sm font-semibold text-emerald-200 mb-2">接收地址</label>
                        <input 
                          v-model="manualRefuel.recipient"
                          type="text"
                          placeholder="輸入接收地址"
                          class="w-full p-3 bg-slate-600/50 border border-emerald-400/30 rounded-xl focus:border-emerald-400 focus:outline-none transition-colors text-white placeholder-emerald-300"
                        />
              </div>
            </div>

                    <button 
                      @click="executeManualRefuel"
                      :disabled="!canExecuteManualRefuel"
                      class="w-full mt-6 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 disabled:from-gray-300 disabled:to-gray-400 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 disabled:cursor-not-allowed"
                    >
                      立即兌換 Gas
                    </button>
                  </div>
                  
                  <!-- 兌換預覽 -->
                  <div class="bg-slate-700/50 backdrop-blur-sm rounded-2xl p-6 border border-emerald-400/30">
                    <div class="flex items-center gap-3 mb-6">
                      <div class="w-8 h-8 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-lg flex items-center justify-center">
                        <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                      </div>
                      <h4 class="text-xl font-bold text-white">兌換預覽</h4>
                    </div>
                    
                    <div class="space-y-4">
                      <div class="flex justify-between items-center py-2 border-b border-emerald-400/20">
                        <span class="text-emerald-200">兌換金額:</span>
                        <span class="font-semibold text-white">{{ manualRefuel.amount || '0' }} USDC</span>
                      </div>
                      <div class="flex justify-between items-center py-2 border-b border-emerald-400/20">
                        <span class="text-emerald-200">目標鏈:</span>
                        <span class="font-semibold text-white">{{ getChainName(manualRefuel.chainId) }}</span>
                      </div>
                      <div class="flex justify-between items-center py-2 border-b border-emerald-400/20">
                        <span class="text-emerald-200">手續費:</span>
                        <span class="font-semibold text-white">0.5%</span>
                      </div>
                      <div class="flex justify-between items-center py-2">
                        <span class="text-emerald-200">實際到賬:</span>
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
                  <div class="bg-slate-700/50 backdrop-blur-sm rounded-2xl p-6 border border-emerald-400/30">
                    <div class="flex items-center gap-3 mb-6">
                      <div class="w-8 h-8 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-lg flex items-center justify-center">
                        <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
                        </svg>
                      </div>
                      <h4 class="text-xl font-bold text-white">Agent 自動監測設定</h4>
                    </div>
                    
                    <div class="space-y-4">
                      <div>
                        <label class="block text-sm font-semibold text-emerald-200 mb-2">監測鏈</label>
                        <select v-model="agentRefuel.chainId" class="w-full p-3 bg-slate-600/50 border border-emerald-400/30 rounded-xl focus:border-emerald-400 focus:outline-none transition-colors text-white">
                          <option value="1">Ethereum Mainnet</option>
                          <option value="42161">Arbitrum One</option>
                          <option value="10">Optimism</option>
                          <option value="137">Polygon</option>
                          <option value="8453">Base</option>
                        </select>
                      </div>
                      
                      <div>
                        <label class="block text-sm font-semibold text-emerald-200 mb-2">觸發閾值 (ETH)</label>
                        <input 
                          v-model="agentRefuel.threshold"
                          type="number"
                          step="0.001"
                          min="0.001"
                          placeholder="當餘額低於此值時觸發"
                          class="w-full p-3 bg-slate-600/50 border border-emerald-400/30 rounded-xl focus:border-emerald-400 focus:outline-none transition-colors text-white placeholder-emerald-300"
                        />
                      </div>
                      
                      <div>
                        <label class="block text-sm font-semibold text-emerald-200 mb-2">補充金額 (USDC)</label>
                        <input 
                          v-model="agentRefuel.amount"
                          type="number"
                          step="0.01"
                          min="1"
                          placeholder="每次補充的金額"
                          class="w-full p-3 bg-slate-600/50 border border-emerald-400/30 rounded-xl focus:border-emerald-400 focus:outline-none transition-colors text-white placeholder-emerald-300"
                        />
                      </div>
                      
                      <div>
                        <label class="block text-sm font-semibold text-emerald-200 mb-2">接收地址</label>
                        <input 
                          v-model="agentRefuel.recipient"
                          type="text"
                          placeholder="輸入接收地址"
                          class="w-full p-3 bg-slate-600/50 border border-emerald-400/30 rounded-xl focus:border-emerald-400 focus:outline-none transition-colors text-white placeholder-emerald-300"
                        />
                      </div>
                    </div>
                    
                    <button 
                      @click="setupAgentRefuel"
                      :disabled="!canSetupAgentRefuel"
                      class="w-full mt-6 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 disabled:from-gray-300 disabled:to-gray-400 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 disabled:cursor-not-allowed"
                    >
                      設定 Agent 監測
                    </button>
                  </div>
                  
                  <!-- Agent 狀態 -->
                  <div class="bg-slate-700/50 backdrop-blur-sm rounded-2xl p-6 border border-emerald-400/30">
                    <div class="flex items-center gap-3 mb-6">
                      <div class="w-8 h-8 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-lg flex items-center justify-center">
                        <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                      </div>
                      <h4 class="text-xl font-bold text-white">Agent 狀態</h4>
                    </div>
                    
                    <div class="space-y-4">
                      <div class="flex items-center justify-between">
                        <span class="text-emerald-200">監測狀態:</span>
                        <span class="px-3 py-1 rounded-full text-sm font-semibold" :class="agentStatus.active ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30' : 'bg-slate-600/50 text-slate-300 border border-slate-500/30'">
                          {{ agentStatus.active ? '運行中' : '未啟動' }}
                        </span>
                      </div>
                      <div class="flex items-center justify-between">
                        <span class="text-emerald-200">監測鏈:</span>
                        <span class="font-semibold text-white">{{ getChainName(agentRefuel.chainId) }}</span>
                      </div>
                      <div class="flex items-center justify-between">
                        <span class="text-emerald-200">觸發閾值:</span>
                        <span class="font-semibold text-white">{{ agentRefuel.threshold || '0' }} ETH</span>
                      </div>
                      <div class="flex items-center justify-between">
                        <span class="text-emerald-200">補充金額:</span>
                        <span class="font-semibold text-white">{{ agentRefuel.amount || '0' }} USDC</span>
                      </div>
                      <div class="flex items-center justify-between">
                        <span class="text-emerald-200">最後檢查:</span>
                        <span class="font-semibold text-white">{{ agentStatus.lastCheck || '從未檢查' }}</span>
                      </div>
                    </div>
                    
                    <div v-if="agentStatus.active" class="mt-6 p-4 bg-emerald-500/10 border border-emerald-400/30 rounded-xl">
                      <div class="flex items-center gap-2 text-emerald-300">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                        <span class="font-semibold">Agent 正在監測您的錢包餘額</span>
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

  // 無論是否已連接錢包，都先檢查本地 JWT 是否有效（若過期將自動清除）
  try {
    await ensureAuth(undefined, { allowRedirect: false })
  } catch (e) {
    console.error('Vincent JWT 檢查失敗:', e)
  }

  if (isConnected.value) {
    try {
      const result = await ensureAuth(undefined, { allowRedirect: false })
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
      const result = await ensureAuth(undefined, { allowRedirect: false })
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
    await ensureAuth(undefined, { allowRedirect: true })
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
.btn-primary {
  @apply bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-emerald-500/30 focus:ring-offset-2 shadow-lg hover:shadow-xl hover:scale-105;
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
