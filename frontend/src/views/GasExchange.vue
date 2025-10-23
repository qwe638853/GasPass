<template>
  <Layout>

    <!-- Main Content -->
    <section class="py-12 bg-gradient-to-br from-slate-900/80 to-gray-900/90 backdrop-blur-xl min-h-screen">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <!-- Wallet Connection Status -->
        <div v-if="!isConnected" class="text-center py-12">
          <div class="bg-slate-800/60 backdrop-blur-md border border-emerald-300/30 rounded-2xl shadow-lg p-8 max-w-md mx-auto">
            <div class="w-16 h-16 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
              </svg>
            </div>
            <h3 class="text-xl font-bold text-white mb-4">請先連接錢包</h3>
            <p class="text-emerald-100 mb-6">連接您的錢包以開始使用跨鏈 Gas 兌換功能</p>
            <button @click="connectWallet" class="btn-primary w-full">
              連接錢包
            </button>
          </div>
        </div>

        <!-- Connected State -->
        <div v-else>
          <!-- Nexus Initialization -->
          <div v-if="!nexusState.initialized" class="text-center py-12">
            <div class="bg-slate-800/60 backdrop-blur-md border border-emerald-300/30 rounded-2xl shadow-lg p-8 max-w-md mx-auto">
              <div class="w-16 h-16 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                </svg>
              </div>
              <h3 class="text-xl font-bold text-white mb-4">初始化 Nexus SDK</h3>
              <p class="text-emerald-100 mb-6">正在初始化跨鏈服務，請稍候...</p>
              <button @click="initNexus" :disabled="nexusState.loading" class="btn-primary w-full">
                <span v-if="nexusState.loading" class="flex items-center justify-center gap-2">
                  <div class="loading-spinner"></div>
                  初始化中...
                </span>
                <span v-else>初始化 Nexus</span>
              </button>
            </div>
          </div>

          <!-- Main Interface -->
          <div v-else>
            <!-- Unified Balance Overview -->
            <div class="mb-12">
              <!-- Title + Controls (token switch moved here) -->
              <div class="flex items-center justify-between mb-8 px-2">
                <div class="flex items-center gap-4">
                  <div class="flex items-center gap-3">
                    <div class="w-2 h-10 bg-gradient-to-b from-emerald-400 to-teal-500 rounded-full shadow-lg"></div>
                    <div class="flex flex-col">
                      <h3 class="text-xl font-bold text-white tracking-wide">全鏈 {{ nexusState.selectedToken }} 餘額</h3>
                      <p class="text-sm text-emerald-200/80 font-medium">跨鏈資產統一管理</p>
                    </div>
                  </div>
                </div>
                <div class="flex items-center gap-3">
                  <div class="token-switch">
                    <button :class="['token-btn', nexusState.selectedToken==='USDC' && 'active']" @click="onSelectToken('USDC')">USDC</button>
                    <button :class="['token-btn', nexusState.selectedToken==='USDT' && 'active']" @click="onSelectToken('USDT')">USDT</button>
                    <button :class="['token-btn', nexusState.selectedToken==='ETH' && 'active']" @click="onSelectToken('ETH')">ETH</button>
                  </div>
                  <button @click="refreshBalances" :disabled="nexusState.loading" class="refresh-header-btn">
                    <svg class="w-5 h-5" :class="{ 'animate-spin': nexusState.loading }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                    </svg>
                    刷新
                  </button>
                </div>
              </div>


              

              <!-- Compact, elegant list for per-chain balances -->
              <div class="balance-list">
                <div 
                  v-for="balance in visibleBalances" 
                  :key="balance.chainId" 
                  class="balance-row"
                >
                  <div class="row-left">
                    <div class="logo-wrap">
                      <img v-if="getChainLogo(balance.chainId)" 
                           :src="getChainLogo(balance.chainId)" 
                           :alt="balance.chainName"
                           class="w-8 h-8 rounded-full shadow-sm"
                      />
                      <div v-else class="fallback-logo">🌐</div>
                    </div>
                    <div class="ml-3">
                      <div class="row-chain-name">{{ balance.chainName }}</div>
                      <div class="row-sub">ID: {{ balance.chainId }}</div>
                    </div>
                  </div>
                  <div class="row-right">
                    <div class="row-amount">{{ balance.formattedBalance }}</div>
                    <div class="row-symbol">{{ nexusState.selectedToken }}</div>
                  </div>
                </div>
              </div>

              <!-- Toggle more/less -->
              <div v-if="hiddenCount > 0" class="mt-4 flex justify-center">
                <button class="toggle-list-btn" @click="showAllBalances = !showAllBalances">
                  <span v-if="!showAllBalances">顯示其餘 {{ hiddenCount }} 條</span>
                  <span v-else>收合清單</span>
                </button>
              </div>
            </div>

            <!-- Modern Swap Interface -->
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <!-- Main Swap Panel -->
              <div class="lg:col-span-2">
                <div class="swap-main-card">
                  <!-- Header -->
                  <div class="swap-header">
                    <div class="swap-title-container">
                      <div class="title-icon">
                        <div class="icon-bg"></div>
                        <div class="icon-accent"></div>
                      </div>
                      <h3 class="swap-title">跨鏈 Gas 兌換</h3>
                    </div>
                    <div class="swap-subtitle">
                      使用你的代幣兌換任何鏈的原生 Gas
                    </div>
                  </div>

                  <!-- Swap Form -->
                  <div class="swap-form">
                    <!-- From Section -->
                    <div class="swap-section">
                      <div class="section-header">
                        <span class="section-title">選擇來源鏈與代幣</span>
                        <span v-if="selectedFromToken" class="balance-hint">
                          餘額: {{ getTokenBalance(selectedFromToken, selectedFromChain) }}
                        </span>
                      </div>
                      
                      <div class="swap-input-group">
                        <div class="token-selector" @click="showFromTokenModal = true">
                          <div v-if="selectedFromToken && selectedFromChain" class="selected-token">
                            <div class="token-icon">
                              <img v-if="selectedFromToken.logo" 
                                   :src="selectedFromToken.logo" 
                                   :alt="selectedFromToken.symbol"
                                   class="w-8 h-8 rounded-full"
                              />
                              <span v-else class="text-xl">{{ selectedFromToken.symbol.charAt(0) }}</span>
                            </div>
                            <div class="token-details">
                              <div class="token-symbol">{{ selectedFromToken.symbol }}</div>
                              <div class="chain-name">{{ getChainName(selectedFromChain) }}</div>
                            </div>
                          </div>
                          <div v-else class="placeholder-token">
                            <span class="placeholder-text">選擇來源代幣</span>
                          </div>
                          <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                          </svg>
                        </div>
                        
                        <div class="amount-input-wrapper">
                          <input 
                            v-model="fromAmount"
                            placeholder="輸入數量"
                            class="amount-input"
                            @input="handleFromAmountChange"
                          />
                          <button 
                            v-if="selectedFromToken"
                            @click="setMaxFromAmount"
                            class="max-button"
                          >
                            MAX
                          </button>
                        </div>
                      </div>
                    </div>

                    <!-- Swap Arrow -->
                    <div class="swap-arrow-section">
                      <button class="swap-arrow" @click="reverseSwap">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"></path>
                        </svg>
                      </button>
                    </div>

                    <!-- To Section -->
                    <div class="swap-section">
                      <div class="section-header">
                        <span class="section-title">兌換為目標鏈 Gas</span>
                        <span v-if="selectedToChain" class="balance-hint">
                          將兌換為 {{ getChainName(selectedToChain) }} 的 {{ getChainGasSymbol(selectedToChain) }}
                        </span>
                      </div>
                      
                      <div class="swap-input-group">
                        <div class="chain-selector" @click="showToChainModal = true">
                          <div v-if="selectedToChain" class="selected-chain">
                            <div class="chain-icon">
                              <img v-if="getChainLogo(selectedToChain)" 
                                   :src="getChainLogo(selectedToChain)" 
                                   :alt="getChainName(selectedToChain)"
                                   class="w-8 h-8 rounded-full"
                              />
                              <span v-else class="text-xl">🌐</span>
                            </div>
                            <div class="chain-details">
                              <div class="chain-symbol">{{ getChainGasSymbol(selectedToChain) }}</div>
                              <div class="chain-name">{{ getChainName(selectedToChain) }}</div>
                            </div>
                          </div>
                          <div v-else class="placeholder-chain">
                            <span class="placeholder-text">選擇目標鏈</span>
                          </div>
                          <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                          </svg>
                        </div>
                        
                        <div class="amount-input-wrapper">
                          <input 
                            v-model="toAmount"
                            placeholder="預估數量"
                            type="number"
                            step="0.000001"
                            min="0"
                            class="amount-input"
                            disabled
                          />
                        </div>
                      </div>
                    </div>

                    <!-- Swap Info -->
                    <div v-if="swapEstimate" class="swap-info">
                      <div class="info-header">
                        <h4 class="info-title">💱 兌換信息</h4>
                        <button @click="refreshEstimate" class="refresh-btn">
                          <svg class="w-4 h-4" :class="{ 'animate-spin': estimating }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                          </svg>
                        </button>
                      </div>
                      
                      <div class="info-content">
                        <div class="info-row">
                          <span>匯率:</span>
                          <span class="font-semibold">{{ swapEstimate.rate }}</span>
                        </div>
                        <div class="info-row">
                          <span>預估費用:</span>
                          <span class="font-semibold">{{ swapEstimate.fees }} {{ selectedFromToken?.symbol }}</span>
                        </div>
                        <div class="info-row">
                          <span>預估時間:</span>
                          <span class="font-semibold">{{ swapEstimate.estimatedTime }}</span>
                        </div>
                        <div v-if="swapEstimate.route" class="info-row">
                          <span>路由:</span>
                          <span class="text-sm text-gray-600">{{ swapEstimate.route }}</span>
                        </div>
                      </div>
                    </div>

                    <!-- Progress Section -->
                    <div v-if="nexusState.swapProgress.steps.length > 0" class="swap-progress">
                       <h4 class="progress-title">
                         🔄 交易進度 
                         <span class="progress-counter">
                           {{ getCompletedStepsCount() }} / {{ nexusState.swapProgress.steps.length }}
                         </span>
                       </h4>
                      <div class="progress-steps">
                        <div v-for="(step, index) in nexusState.swapProgress.steps" :key="index" class="progress-step">
                          <div class="step-indicator" :class="{ 
                            'completed': step.completed,
                            'current': nexusState.swapProgress.currentStep === step.type 
                          }">
                             <svg v-if="step.completed" class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                               <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                             </svg>
                             <span v-else>{{ index + 1 }}</span>
                          </div>
                          <div class="step-content">
                            <div class="step-title">{{ getStepTitle(step.type) }}</div>
                            <div v-if="step.explorerURL" class="step-link">
                              <a :href="step.explorerURL" target="_blank" class="text-blue-600 hover:text-blue-800 text-sm">
                                查看交易 ↗
                              </a>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <!-- Swap Button -->
                    <button 
                      @click="executeSwap"
                       :disabled="!canSwap || nexusState.swapLoading"
                      class="swap-execute-btn"
                      :class="{ 'loading': nexusState.swapLoading }"
                    >
                      <span v-if="nexusState.swapLoading" class="flex items-center justify-center gap-2">
                        <div class="loading-spinner"></div>
                        {{ getSwapLoadingText() }}
                      </span>
                      <span v-else class="flex items-center justify-center gap-2">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"></path>
                        </svg>
                        {{ getSwapButtonText() }}
                      </span>
                    </button>

                     <!-- Swap Success with Fees -->
                     <div v-if="swapSuccess && swapFees" class="swap-success">
                       <h4 class="success-title">✅ Swap 成功完成</h4>
                       <div class="fees-breakdown">
                         <h5 class="fees-title">💰 費用詳情</h5>
                         <div class="fees-list">
                           <div class="fee-item">
                             <span class="fee-label">總費用:</span>
                             <span class="fee-value">{{ formatFee(swapFees.totalFees) }} {{ swapFees.currency }}</span>
                           </div>
                           <div class="fee-item">
                             <span class="fee-label">Gas 費用:</span>
                             <span class="fee-value">{{ formatFee(swapFees.gasFees) }} {{ swapFees.currency }}</span>
                           </div>
                           <div class="fee-item">
                             <span class="fee-label">橋接費用:</span>
                             <span class="fee-value">{{ formatFee(swapFees.bridgeFees) }} {{ swapFees.currency }}</span>
                           </div>
                           <div class="fee-item">
                             <span class="fee-label">Swap 費用:</span>
                             <span class="fee-value">{{ formatFee(swapFees.swapFees) }} {{ swapFees.currency }}</span>
                           </div>
                         </div>
                       </div>
                     </div>

                    <!-- Error Message -->
                    <div v-if="nexusState.swapError" class="error-message">
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                      {{ nexusState.swapError }}
                    </div>
                  </div>
                </div>
              </div>

              <!-- Side Panel -->
              <div class="space-y-6">
                <!-- Recent Transactions -->
                <div class="bg-slate-800/40 backdrop-blur-md border border-emerald-300/30 rounded-2xl shadow-lg p-6">
                  <div class="flex items-center gap-3 mb-4">
                    <div class="transaction-icon">
                      <div class="icon-bg"></div>
                      <div class="icon-accent"></div>
                    </div>
                    <h4 class="text-lg font-bold text-white">最近交易</h4>
                  </div>
                  <div v-if="recentTransactions.length === 0" class="text-center py-4 text-emerald-300">
                    暫無交易記錄
                  </div>
                  <div v-else class="space-y-3">
                    <div v-for="tx in visibleTransactions" :key="tx.id" class="transaction-item">
                      <div class="flex items-center justify-between">
                        <div class="flex-1">
                          <div class="font-semibold text-white">{{ tx.amount }} {{ tx.symbol }}</div>
                          <div class="text-sm text-emerald-200">{{ tx.chain }}</div>
                          <div class="text-xs text-emerald-300 mt-1">{{ tx.timestamp }}</div>
                        </div>
                        <div class="text-right">
                          <div class="text-sm text-emerald-200">{{ tx.cost }} {{ tx.costSymbol }}</div>
                          <div class="text-sm" :class="getStatusClass(tx.status)">{{ getStatusText(tx.status) }}</div>
                          <div v-if="tx.explorerURL" class="mt-1">
                            <a :href="tx.explorerURL" target="_blank" class="text-xs text-emerald-400 hover:text-emerald-300">
                              查看詳情 ↗
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <!-- Toggle more/less -->
                    <div v-if="hiddenTransactionCount > 0" class="pt-2">
                      <button 
                        @click="showAllTransactions = !showAllTransactions"
                        class="w-full py-2 px-4 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 hover:text-white border border-emerald-400/30 rounded-lg transition-all duration-300 font-medium text-sm"
                      >
                        {{ showAllTransactions ? '收合' : `顯示其餘 ${hiddenTransactionCount} 筆交易` }}
                      </button>
                    </div>
                  </div>
                </div>

                <!-- Supported Chains -->
                <div class="bg-slate-800/40 backdrop-blur-md border border-emerald-300/30 rounded-2xl shadow-lg p-6">
                  <div class="flex items-center gap-3 mb-4">
                    <div class="chains-icon">
                      <div class="icon-bg"></div>
                      <div class="icon-accent"></div>
                    </div>
                    <h4 class="text-lg font-bold text-white">Nexus 支援的主網</h4>
                  </div>
                  <div v-if="supportedChains.length === 0" class="text-center py-4 text-emerald-300">
                    <p class="text-sm">載入中...</p>
                  </div>
                  <div v-else class="space-y-3">
                    <div v-for="chain in visibleSupportedChains" :key="chain.id" class="supported-chain-item">
                      <div class="flex items-center gap-3">
                        <div class="chain-icon">
                          <img v-if="chain.logo" 
                               :src="chain.logo" 
                               :alt="chain.name"
                               class="w-8 h-8 rounded-full"
                          />
                          <span v-else class="text-2xl">{{ chain.icon }}</span>
                        </div>
                        <div>
                          <div class="font-semibold text-white">{{ chain.name }}</div>
                          <div class="text-sm text-emerald-200">{{ chain.symbol }} • ID: {{ chain.id }}</div>
                        </div>
                      </div>
                    </div>
                    
                    <!-- 展開/收合按鈕 -->
                    <div v-if="hiddenChainCount > 0" class="pt-2">
                      <button 
                        @click="showAllChains = !showAllChains"
                        class="w-full py-2 px-4 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 hover:text-white border border-emerald-400/30 rounded-lg transition-all duration-300 font-medium text-sm"
                      >
                        {{ showAllChains ? '收合' : `顯示其餘 ${hiddenChainCount} 條` }}
                      </button>
                    </div>
                  </div>
                  <div v-if="supportedChains.length > 0" class="mt-4 text-xs text-emerald-300 text-center">
                    由 Avail Nexus API 動態提供
                  </div>
                </div>

                  </div>
                  </div>
                </div>
        </div>
      </div>
    </section>

    <!-- From Token Selection Modal -->
    <div v-if="showFromTokenModal" class="modal-overlay" @click="showFromTokenModal = false">
      <div class="modal-container" @click.stop>
        <div class="modal-header">
          <h3 class="modal-title">選擇來源代幣</h3>
          <button @click="showFromTokenModal = false" class="modal-close">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        
        <div class="modal-content">
          <div class="search-box">
            <input 
              v-model="fromTokenSearch"
              placeholder="搜尋代幣或鏈..."
              class="search-input"
            />
          </div>
          
          <div class="chains-tokens-container">
            <!-- 左側：來源鏈列表 -->
            <div class="chains-section">
              <h4 class="section-title">Source Chain</h4>
              <div class="chains-list">
                <div 
                  v-for="chain in filteredFromChains" 
                  :key="chain.id"
                  @click="selectFromChain(chain.id)"
                  :class="['chain-option', { active: selectedFromChain === chain.id }]"
                >
                  <div class="chain-icon">
                    <img v-if="chain.logo" :src="chain.logo" :alt="chain.name" class="w-8 h-8 rounded-full" />
                    <span v-else class="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs">🌐</span>
                  </div>
                  <div class="chain-name">{{ chain.name }}</div>
                </div>
              </div>
              </div>
              
            <!-- 右側：來源代幣列表 -->
            <div class="tokens-section">
              <h4 class="section-title">Source Token</h4>
              <div class="tokens-list">
                <div 
                  v-for="token in getFilteredFromTokens(fromTokenSearch)" 
                  :key="`${selectedFromChain}-${token.symbol}`"
                  @click="selectFromToken(token, selectedFromChain)"
                  class="token-option"
                >
                  <div class="token-info">
                    <div class="token-icon">
                      <img v-if="token.logo" :src="token.logo" :alt="token.symbol" class="w-8 h-8 rounded-full" />
                      <span v-else class="fallback-icon">{{ token.symbol.charAt(0) }}</span>
                    </div>
                    <div class="token-details">
                      <div class="token-symbol">{{ token.symbol }}</div>
                      <div class="token-name">{{ token.name || token.symbol }}</div>
                      <div class="token-balance">{{ getTokenBalance(token, selectedFromChain) }}</div>
                      <div class="token-chains">{{ getTokenChainCount(token) }} chains</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- To Chain Selection Modal -->
    <div v-if="showToChainModal" class="modal-overlay" @click="showToChainModal = false">
      <div class="modal-container" @click.stop>
        <div class="modal-header">
          <h3 class="modal-title">選擇目標鏈</h3>
          <button @click="showToChainModal = false" class="modal-close">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        
        <div class="modal-content">
          <div class="search-box">
            <input 
              v-model="toTokenSearch"
              placeholder="搜尋鏈..."
              class="search-input"
            />
          </div>
          
          <div class="chains-grid">
            <div 
              v-for="chain in filteredToChains" 
              :key="chain.id"
              @click="selectToChain(chain.id)"
              :class="['chain-card', { active: selectedToChain === chain.id }]"
            >
              <div class="chain-icon">
                <img v-if="chain.logo" :src="chain.logo" :alt="chain.name" class="w-10 h-10 rounded-full" />
                <span v-else class="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-lg">🌐</span>
              </div>
              <div class="chain-info">
                <div class="chain-name">{{ chain.name }}</div>
                <div class="chain-gas-symbol">{{ getChainGasSymbol(chain.id) }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
     </div>

     <!-- Swap Processing Modal -->
     <div v-if="showSwapProcessing" class="modal-overlay">
       <div class="modal-container processing-modal" @click.stop>
         <div class="processing-content">
           <!-- Gas Pass 風格 Loading 動畫 -->
           <div class="processing-icon">
             <div v-if="!nexusState.swapProgress.completed" class="gas-pass-loader">
               <div class="gas-bottle"></div>
             </div>
             <div v-else class="processing-checkmark">
               <div class="success-icon-gas">
                 <svg class="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path>
                 </svg>
               </div>
             </div>
           </div>
           
           <!-- Title -->
           <h3 class="processing-title">
             <span v-if="!nexusState.swapProgress.completed">交易處理中</span>
             <span v-else>交易已完成</span>
           </h3>
           
           <!-- Subtitle -->
           <p class="processing-subtitle">
             <span v-if="!nexusState.swapProgress.completed">正在處理您的跨鏈交易，請稍候</span>
             <span v-else>您的跨鏈交易已成功完成</span>
           </p>
           
           <!-- Progress Steps -->
           <div v-if="nexusState.swapProgress.steps.length > 0" class="progress-steps">
             <div v-for="(step, index) in nexusState.swapProgress.steps" :key="index" class="progress-step">
               <div class="step-indicator" :class="{ 
                 'completed': step.completed,
                 'current': nexusState.swapProgress.currentStep === step.type 
               }">
                 <svg v-if="step.completed" class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                   <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                 </svg>
                 <span v-else>{{ index + 1 }}</span>
               </div>
               <div class="step-content">
                 <div class="step-title">{{ getStepTitle(step.type) }}</div>
                 <div v-if="step.explorerURL" class="step-link">
                   <a :href="step.explorerURL" target="_blank" class="explorer-link">
                     查看交易 ↗
                   </a>
                 </div>
               </div>
             </div>
           </div>
           
           <!-- Loading Animation -->
           <div v-if="!nexusState.swapProgress.completed" class="loading-animation">
             <div class="loading-dots">
               <div class="dot"></div>
               <div class="dot"></div>
               <div class="dot"></div>
             </div>
           </div>
         </div>
       </div>
     </div>

     <!-- Swap Success Modal -->
     <div v-if="showSwapSuccess" class="modal-overlay">
       <div class="modal-container success-modal" @click.stop>
         <div class="success-content">
           <!-- Gas Pass 風格成功圖標 -->
           <div class="success-icon">
             <div class="success-icon-gas">
               <div class="success-circle">
                 <svg class="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path>
                 </svg>
               </div>
             </div>
           </div>
           
           <!-- Success Title -->
           <h3 class="success-title">交易成功完成</h3>
           <p class="success-subtitle">您的跨鏈交易已成功執行</p>
           
           <!-- Transaction Details -->
           <div class="transaction-details">
             <div class="detail-card">
               <div class="detail-header">
                 <span class="detail-label">交易詳情</span>
               </div>
               <div class="detail-content">
                 <div class="detail-row">
                   <span class="row-label">來源:</span>
                   <span class="row-value">{{ fromAmount }} {{ selectedFromToken?.symbol }} ({{ getChainName(selectedFromChain) }})</span>
                 </div>
                 <div class="detail-row">
                   <span class="row-label">目標:</span>
                   <span class="row-value">{{ toAmount }} {{ selectedToToken?.symbol }} ({{ getChainName(selectedToChain) }})</span>
                 </div>
               </div>
             </div>
             
             <!-- Fees Breakdown -->
             <div v-if="swapFees" class="detail-card">
               <div class="detail-header">
                 <span class="detail-label">費用詳情</span>
               </div>
               <div class="detail-content">
                 <div class="fee-row">
                   <span class="fee-label">總費用:</span>
                   <span class="fee-value">{{ formatFee(swapFees.totalFees) }} {{ swapFees.currency }}</span>
                 </div>
                 <div class="fee-row">
                   <span class="fee-label">Gas 費用:</span>
                   <span class="fee-value">{{ formatFee(swapFees.gasFees) }} {{ swapFees.currency }}</span>
                 </div>
                 <div class="fee-row">
                   <span class="fee-label">橋接費用:</span>
                   <span class="fee-value">{{ formatFee(swapFees.bridgeFees) }} {{ swapFees.currency }}</span>
                 </div>
                 <div class="fee-row">
                   <span class="fee-label">Swap 費用:</span>
                   <span class="fee-value">{{ formatFee(swapFees.swapFees) }} {{ swapFees.currency }}</span>
                 </div>
               </div>
             </div>
           </div>
           
           <!-- Action Buttons -->
           <div class="success-actions">
             <button v-if="lastSwapResult?.explorerURL" @click="openExplorer" class="explorer-btn">
               <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
               </svg>
               查看交易詳情
             </button>
             <button @click="closeSuccessModal" class="close-btn">
               完成
             </button>
          </div>
        </div>
      </div>
    </div>

  </Layout>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useWeb3 } from '../composables/useWeb3.js'
import { 
  nexusState, 
  initializeNexus, 
  fetchUnifiedUSDC,
  fetchUnifiedToken,
  getSelectedTokenBalances,
  getSelectedTokenTotal,
  getSupportedTargetChains,
  getSwapSupportedChainsAndTokens,
  swapWithExactIn,
  swapWithExactOut,
  getDestinationTokens,
  formatSwapAmount,
  parseSwapAmount,
  getChainMetadata,
  sdk
} from '../composables/useNexus.js'
import Layout from '../components/Layout.vue'

// Web3 composable
const { account, isConnected, connectWallet } = useWeb3()

// Data
const recentTransactions = ref([])
const showAllTransactions = ref(false)

// Swap processing and success modals
const showSwapProcessing = ref(false)
const showSwapSuccess = ref(false)
const lastSwapResult = ref(null)

// Swap related data
const selectedFromToken = ref(null)
const selectedFromChain = ref(null)
const selectedToToken = ref(null)
const selectedToChain = ref(null)
const fromAmount = ref('')
const toAmount = ref('')
const swapEstimate = ref(null)
const estimating = ref(false)
const swapSuccess = ref(false)
const swapFees = ref(null)

// Modal states
const showFromTokenModal = ref(false)
const showToTokenModal = ref(false)
const showToChainModal = ref(false)
const fromTokenSearch = ref('')
const toTokenSearch = ref('')

// Last estimation time for throttling
const lastEstimationTime = ref(null)

// Computed
const totalUSDCBalance = getSelectedTokenTotal
const usdcBalances = getSelectedTokenBalances

// show more/less for chain list
const showAllBalances = ref(false)
const showAllChains = ref(false)
const visibleBalances = computed(() => {
  const list = getSelectedTokenBalances.value || []
  
  // 按餘額大小排序（從大到小）
  const sortedList = [...list].sort((a, b) => {
    const balanceA = parseFloat(a.formattedBalance) || 0
    const balanceB = parseFloat(b.formattedBalance) || 0
    return balanceB - balanceA
  })
  
  if (showAllBalances.value) return sortedList
  return sortedList.slice(0, 3)
})
const hiddenCount = computed(() => {
  const total = (getSelectedTokenBalances.value || []).length
  return total > 3 ? total - 3 : 0
})

// 可見的支援主網列表
const visibleSupportedChains = computed(() => {
  const chains = supportedChains.value || []
  if (showAllChains.value) return chains
  return chains.slice(0, 4) // 預設顯示前4個
})

// 隱藏的主網數量
const hiddenChainCount = computed(() => {
  const total = (supportedChains.value || []).length
  return total > 4 ? total - 4 : 0
})

// 交易記錄相關 computed
const visibleTransactions = computed(() => {
  const list = recentTransactions.value || []
  if (showAllTransactions.value) return list
  return list.slice(0, 4) // 預設顯示前4筆
})

const hiddenTransactionCount = computed(() => {
  const total = (recentTransactions.value || []).length
  return total > 4 ? total - 4 : 0
})

const supportedChains = computed(() => {
  const chains = getSupportedTargetChains()
  return chains.map(chain => ({
    id: chain.id,
    name: chain.name,
    symbol: chain.symbol,
    icon: chain.icon,
    logo: chain.logo // 添加 Nexus SDK 提供的 logo
  }))
})

// Swap related computed properties
const availableFromChains = computed(() => {
  // 來源代幣：使用 getSwapSupportedChainsAndTokens 返回的完整數據
  const chains = nexusState.swapSupportedChains || []
  console.log('[GasExchange] 可用來源鏈:', chains)
  return chains.filter(chain => chain.tokens && chain.tokens.length > 0)
})

const availableToChains = computed(() => {
  // 目標代幣：使用 DESTINATION_SWAP_TOKENS 提供的數據
  const chains = []
  if (nexusState.destinationTokens && nexusState.destinationTokens.size > 0) {
    // 從 destinationTokens Map 構建鏈列表
    for (const [chainId, tokens] of nexusState.destinationTokens) {
      if (tokens && tokens.length > 0) {
        // 使用代幣中的鏈信息，如果沒有則嘗試獲取 metadata
        const chainInfo = tokens[0] || {}
        const chainMetadata = getChainMetadata(chainId)
        
        chains.push({
          id: chainId,
          name: chainInfo.chainName || chainMetadata?.name || `Chain ${chainId}`,
          logo: chainInfo.chainLogo || chainMetadata?.logo,
          tokens: tokens
        })
      }
    }
  }
  console.log('[GasExchange] 可用目標鏈:', chains)
  return chains
})

// 過濾後的來源鏈（基於搜尋）
const filteredFromChains = computed(() => {
  if (!fromTokenSearch.value) return availableFromChains.value
  
  const search = fromTokenSearch.value.toLowerCase()
  return availableFromChains.value.filter(chain => {
    // 檢查鏈名稱是否匹配
    if (chain.name.toLowerCase().includes(search)) return true
    
    // 檢查是否有代幣匹配
    const tokens = getChainTokens(chain.id)
    return tokens.some(token => 
      token.symbol.toLowerCase().includes(search) ||
      (token.name && token.name.toLowerCase().includes(search))
    )
  })
})

// 過濾後的目標鏈（基於搜尋）
const filteredToChains = computed(() => {
  if (!toTokenSearch.value) return availableToChains.value
  
  const search = toTokenSearch.value.toLowerCase()
  return availableToChains.value.filter(chain => {
    // 檢查鏈名稱是否匹配
    if (chain.name.toLowerCase().includes(search)) return true
    
    // 檢查是否有代幣匹配
    const tokens = getChainTokens(chain.id)
    return tokens.some(token => 
      token.symbol.toLowerCase().includes(search) ||
      (token.name && token.name.toLowerCase().includes(search))
    )
  })
})

const canSwap = computed(() => {
  if (nexusState.swapLoading || estimating.value) return false
  
  return selectedFromToken.value && 
         selectedFromChain.value && 
         selectedToChain.value && 
         fromAmount.value && 
         parseFloat(fromAmount.value) > 0
})

// Methods
const initNexus = async () => {
  try {
    await initializeNexus()
    await onSelectToken('USDC')
    await loadRecentTransactions()
  } catch (error) {
    console.error('Failed to initialize Nexus:', error)
  }
}

const refreshBalances = async () => {
  try {
    await onSelectToken(nexusState.selectedToken || 'USDC')
  } catch (error) {
    console.error('Failed to refresh balances:', error)
  }
}


// Token selection handler
const onSelectToken = async (symbol) => {
  try {
    if (symbol === 'USDC') {
      await fetchUnifiedUSDC()
    } else {
      await fetchUnifiedToken(symbol)
    }
    // 收合清單回到預設
    showAllBalances.value = false
  } catch (e) {
    console.error('Select token failed:', e)
  }
}


const loadRecentTransactions = async () => {
  try {
    // 從 localStorage 載入交易記錄
    const savedTransactions = localStorage.getItem('gasPassTransactions')
    if (savedTransactions) {
      recentTransactions.value = JSON.parse(savedTransactions)
    } else {
      // 如果沒有記錄，初始化為空數組
      recentTransactions.value = []
    }
  } catch (error) {
    console.error('載入交易記錄失敗:', error)
    recentTransactions.value = []
  }
}

// 保存交易記錄到 localStorage
const saveTransactions = () => {
  try {
    localStorage.setItem('gasPassTransactions', JSON.stringify(recentTransactions.value))
  } catch (error) {
    console.error('保存交易記錄失敗:', error)
  }
}

// 添加新交易記錄
const addTransaction = (transaction) => {
  const newTransaction = {
    id: Date.now(), // 使用時間戳作為唯一 ID
    amount: transaction.amount,
    symbol: transaction.symbol,
    chain: transaction.chain,
    cost: transaction.cost,
    costSymbol: transaction.costSymbol || 'USDC',
    status: transaction.status || 'completed',
    timestamp: new Date().toLocaleString('zh-TW', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }),
    explorerURL: transaction.explorerURL
  }
  
  // 添加到數組開頭（最新的在前面）
  recentTransactions.value.unshift(newTransaction)
  
  // 限制最多保存 50 筆交易記錄
  if (recentTransactions.value.length > 50) {
    recentTransactions.value = recentTransactions.value.slice(0, 50)
  }
  
  // 保存到 localStorage
  saveTransactions()
}

// 獲取狀態文字
const getStatusText = (status) => {
  const statusMap = {
    'completed': '已完成',
    'pending': '處理中',
    'failed': '失敗',
    'cancelled': '已取消'
  }
  return statusMap[status] || status
}

// 獲取狀態樣式類別
const getStatusClass = (status) => {
  const classMap = {
    'completed': 'text-emerald-400',
    'pending': 'text-yellow-400',
    'failed': 'text-red-400',
    'cancelled': 'text-emerald-300'
  }
  return classMap[status] || 'text-emerald-300'
}

// ===== Swap 相關方法 =====

// 選擇來源鏈
const selectFromChain = (chainId) => {
  selectedFromChain.value = chainId
  // 清空已選的代幣，因為鏈改變了
  selectedFromToken.value = null
  // 清空搜尋
  fromTokenSearch.value = ''
  console.log('[GasExchange] 選擇來源鏈:', chainId)
}


// 選擇來源代幣
const selectFromToken = (token, chainId) => {
  selectedFromToken.value = token
  selectedFromChain.value = chainId || token.chainId
  showFromTokenModal.value = false
  fromTokenSearch.value = ''
  
  // 清除舊的估算
  swapEstimate.value = null
  
  // 如果有金額，重新估算
  if (fromAmount.value) {
    estimateSwap()
  }
}

// 選擇目標代幣
const selectToToken = (token, chainId) => {
  selectedToToken.value = token
  selectedToChain.value = chainId || token.chainId
  showToTokenModal.value = false
  toTokenSearch.value = ''
  
  // 清除舊的估算
  swapEstimate.value = null
  toAmount.value = ''
  
  // 如果有金額，重新估算
  if (fromAmount.value) {
    estimateSwap()
  }
}

// 選擇目標鏈
const selectToChain = (chainId) => {
  selectedToChain.value = chainId
  selectedToToken.value = null // 清空代幣選擇，因為我們只選擇鏈
  showToChainModal.value = false
  
  // 清除舊的估算
  swapEstimate.value = null
  toAmount.value = ''
  
  // 如果有金額，重新估算
  if (fromAmount.value) {
    estimateSwap()
  }
}

// 處理輸入金額變化
const handleFromAmountChange = () => {
  toAmount.value = '' // 清空輸出金額
  estimateSwap()
}

// 設置最大輸入金額
const setMaxFromAmount = () => {
  if (!selectedFromToken.value || !selectedFromChain.value) return
  
  const balance = getTokenBalance(selectedFromToken.value, selectedFromChain.value)
  const numericBalance = parseFloat(balance) || 0
  
  // 保留一些代幣作為 gas（如果是原生代幣）
  if (selectedFromToken.value.address === '0x0000000000000000000000000000000000000000') {
    fromAmount.value = Math.max(0, numericBalance - 0.01).toString()
  } else {
    fromAmount.value = numericBalance.toString()
  }
  
  handleFromAmountChange()
}

// 反轉 swap（暫時禁用，因為目標是固定選擇鏈的原生代幣）
const reverseSwap = () => {
  // 暫時不實現，因為目標是選擇鏈的原生代幣
}

// 估算 swap
const estimateSwap = async () => {
  if (!canSwap.value) return
  
  // 節流：防止頻繁請求
  const now = Date.now()
  if (lastEstimationTime.value && (now - lastEstimationTime.value) < 1000) {
    return
  }
  lastEstimationTime.value = now
  
  try {
    estimating.value = true
    
    // 模擬估算（實際應該使用 Nexus API 或第三方價格源）
    await new Promise(resolve => setTimeout(resolve, 800))
    
    const inputAmount = parseFloat(fromAmount.value)
    const estimatedOutput = inputAmount * 0.998 // 簡單的模擬匯率
    toAmount.value = estimatedOutput.toFixed(6)
    
    swapEstimate.value = {
      rate: `1 ${selectedFromToken.value.symbol} = 0.998 ${getChainGasSymbol(selectedToChain.value)}`,
      fees: '0.002',
      estimatedTime: '2-5 分鐘',
      route: `${getChainName(selectedFromChain.value)} → ${getChainName(selectedToChain.value)}`
    }
    
  } catch (error) {
    console.error('[GasExchange] 估算失敗:', error)
    swapEstimate.value = null
  } finally {
    estimating.value = false
  }
}

// 刷新估算
const refreshEstimate = () => {
  lastEstimationTime.value = null
  estimateSwap()
}

// 執行 swap
const executeSwap = async () => {
  if (!canSwap.value) return
  
  try {
    // 驗證必要參數  
    console.log('[GasExchange] 開始驗證 swap 參數...')
    console.log('[GasExchange] selectedFromToken:', selectedFromToken.value)
    console.log('[GasExchange] selectedFromChain:', selectedFromChain.value)
    console.log('[GasExchange] selectedToChain:', selectedToChain.value)
    console.log('[GasExchange] fromAmount:', fromAmount.value)
    
    if (!selectedFromToken.value) {
      throw new Error('請選擇有效的來源代幣')
    }
    
    if (!selectedFromChain.value) {
      throw new Error('請選擇來源鏈')
    }
    
    if (!selectedToChain.value) {
      throw new Error('請選擇目標鏈')
    }
    
    if (!fromAmount.value || parseFloat(fromAmount.value) <= 0) {
      throw new Error('請輸入有效的數量')
    }
    
    // 檢查代幣是否有正確的地址屬性（根據 Nexus API 結構）
    const fromTokenAddress = selectedFromToken.value.tokenAddress || selectedFromToken.value.contractAddress
    const fromDecimals = selectedFromToken.value.decimals
    
    // 對於目標鏈，我們使用原生 Gas 代幣，不需要代幣地址
    // 目標鏈的 Gas 代幣由鏈本身決定（ETH、BNB、MATIC 等）
    
    console.log('[GasExchange] 代幣地址檢查:')
    console.log('  - selectedFromToken:', selectedFromToken.value)
    console.log('  - selectedToChain:', selectedToChain.value)
    console.log('  - fromTokenAddress (tokenAddress):', selectedFromToken.value.tokenAddress)
    console.log('  - fromTokenAddress (contractAddress):', selectedFromToken.value.contractAddress)
    console.log('  - fromTokenAddress (final):', fromTokenAddress)
    console.log('  - fromDecimals:', fromDecimals)
    console.log('  - targetGasSymbol:', getChainGasSymbol(selectedToChain.value))
    
    if (!fromTokenAddress) {
      console.error('[GasExchange] 來源代幣缺少地址:', selectedFromToken.value)
      throw new Error('來源代幣缺少合約地址')
    }
    
    // 獲取目標鏈的原生代幣地址（通常是零地址）
    const toTokenAddress = '0x0000000000000000000000000000000000000000' // 原生代幣地址
    
    console.log('[GasExchange] 使用地址:')
    console.log('  - fromTokenAddress:', fromTokenAddress)
    console.log('  - fromDecimals:', fromDecimals)
    console.log('  - targetGasSymbol:', getChainGasSymbol(selectedToChain.value))
    console.log('  - toTokenAddress (native):', toTokenAddress)
    
    const params = {
      fromChainId: selectedFromChain.value,
      fromTokenAddress: fromTokenAddress,
      fromAmount: parseSwapAmount(fromAmount.value, fromDecimals),
      toChainId: selectedToChain.value,
      toTokenAddress: toTokenAddress
    }
    
    console.log('[GasExchange] EXACT_IN 參數:', params)
    
    // 顯示處理中 modal
    showSwapProcessing.value = true
    showSwapSuccess.value = false
    
    try {
      // 執行 swap
    const result = await swapWithExactIn(params)
    
    if (result.success) {
        // 設置成功狀態和費用詳情
        swapSuccess.value = true
        swapFees.value = result.fees
        lastSwapResult.value = result
        
        // 添加交易記錄
        addTransaction({
          amount: fromAmount.value,
          symbol: selectedFromToken.value.symbol,
          chain: getChainName(selectedFromChain.value),
          cost: result.fees?.totalFees || '0',
          costSymbol: result.fees?.currency || 'USDC',
          status: 'completed',
          explorerURL: result.explorerURL
        })
        
        // 等待一下讓用戶看到完成狀態
        setTimeout(() => {
          showSwapProcessing.value = false
          showSwapSuccess.value = true
        }, 1500)
      
      // 刷新餘額
      await refreshBalances()
    } else {
      throw new Error(result.error || 'Swap 失敗')
      }
    } catch (error) {
      // 隱藏處理中 modal
      showSwapProcessing.value = false
      throw error
    }
    
  } catch (error) {
    console.error('[GasExchange] Swap 執行失敗:', error)
    
    // 根據錯誤類型提供更詳細的錯誤信息
    let errorMessage = error.message
    if (error.message.includes('Failed to fetch')) {
      errorMessage = '網路連接失敗，請檢查網路連接或稍後重試'
    } else if (error.message.includes('CORS')) {
      errorMessage = '跨域請求被阻止，請檢查網路設置'
    } else if (error.message.includes('502')) {
      errorMessage = '服務器暫時不可用，請稍後重試'
    }
    
    alert(`Swap 失敗: ${errorMessage}`)
  }
}

// 重置 swap 表單
const resetSwapForm = () => {
  fromAmount.value = ''
  toAmount.value = ''
  swapEstimate.value = null
  swapSuccess.value = false
  swapFees.value = null
  nexusState.swapProgress.steps = []
  nexusState.swapProgress.completed = false
}

// 打開瀏覽器查看交易
const openExplorer = () => {
  if (lastSwapResult.value?.explorerURL) {
    window.open(lastSwapResult.value.explorerURL, '_blank')
  }
}

// 關閉成功 Modal
const closeSuccessModal = () => {
  showSwapSuccess.value = false
  lastSwapResult.value = null
  swapFees.value = null
  swapSuccess.value = false
}

// 獲取步驟標題
const getStepTitle = (stepType) => {
  const stepTitles = {
    'ALLOWANCE': '檢查授權',
    'SOURCE_SWAP_HASH': '來源鏈交易',
    'DESTINATION_SWAP_HASH': '目標鏈交易',
    'SWAP_COMPLETE': '交易完成',
    'BRIDGE_HASH': '橋接交易',
    'EXECUTE_HASH': '執行交易'
  }
  return stepTitles[stepType] || stepType
}

// ===== 輔助方法 =====

// 獲取代幣餘額
const getTokenBalance = (token, chainId) => {
  if (!token || !chainId) return '0.00'
  
  // 嘗試從統一餘額中查找匹配的代幣
  const balances = usdcBalances.value || []
  const chainBalance = balances.find(b => b.chainId === chainId)
  
  if (chainBalance) {
    // 檢查是否是當前選擇的代幣類型
    if (token.symbol === nexusState.selectedToken) {
      return chainBalance.formattedBalance
    }
    
    // 如果是其他代幣類型，需要獲取對應的餘額
    // 這裡需要實際調用 SDK 來獲取該代幣的餘額
    // 暫時返回 0，因為我們沒有其他代幣的實際餘額
    return '0.00'
  }
  
  // 如果完全沒有該鏈的數據，返回 0
  return '0.00'
}

// 獲取鏈名稱
const getChainName = (chainId) => {
  // 首先嘗試從 supportedChains 獲取
  const chain = supportedChains.value.find(c => c.id === chainId)
  if (chain) {
    return chain.name
  }
  
  // 然後嘗試從 swapSupportedChains 獲取
  const swapChain = nexusState.swapSupportedChains.find(c => c.id === chainId)
  if (swapChain) {
    return swapChain.name
  }
  
  // 最後嘗試從 destinationTokens 的鏈獲取
  if (nexusState.destinationTokens.has(chainId)) {
    const chainMetadata = getChainMetadata(chainId)
    if (chainMetadata) {
      return chainMetadata.name
    }
  }
  
  return `Chain ${chainId}`
}

// 獲取鏈的代幣列表
const getChainTokens = (chainId) => {
  // 對於來源代幣，使用 swapSupportedChains
  const fromChain = nexusState.swapSupportedChains.find(c => c.id === chainId)
  if (fromChain && fromChain.tokens) {
    return fromChain.tokens
  }
  
  // 對於目標代幣，使用 destinationTokens
  const toTokens = nexusState.destinationTokens.get(chainId)
  if (toTokens) {
    return toTokens
  }
  
  return []
}

// 獲取過濾後的代幣列表
const getFilteredChainTokens = (chainId, searchTerm) => {
  const tokens = getChainTokens(chainId)
  if (!searchTerm) return tokens
  
  const search = searchTerm.toLowerCase()
  return tokens.filter(token => 
    token.symbol.toLowerCase().includes(search) ||
    (token.name && token.name.toLowerCase().includes(search))
  )
}

// 格式化地址
const formatAddress = (address) => {
  if (!address) return ''
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}


// 獲取鏈的原生代幣符號
const getChainSymbol = (chainId) => {
  const chain = supportedChains.value.find(c => c.id === chainId)
  return chain?.symbol || 'Gas'
}

// 獲取鏈的 Gas 代幣符號
const getChainGasSymbol = (chainId) => {
  const gasSymbolMap = {
    1: 'ETH',        // Ethereum
    10: 'ETH',       // OP Mainnet
    56: 'BNB',       // BSC
    137: 'MATIC',    // Polygon
    250: 'FTM',      // Fantom
    42161: 'ETH',    // Arbitrum One
    43114: 'AVAX',   // Avalanche
    8453: 'ETH',     // Base
    534352: 'ETH',   // Scroll
    59144: 'ETH',    // Linea
    81457: 'ETH',    // Blast
  }
  return gasSymbolMap[chainId] || 'ETH'
}

// 獲取代幣圖標 - 使用官方提供的 logo
const getTokenIcon = (token) => {
  return token.logo
}

// 獲取鏈圖標 - 使用官方提供的 logo
const getChainIcon = (chain) => {
  return chain.logo
}

// 獲取代幣元數據（包括圖標）
const getTokenMetadata = async (tokenSymbol) => {
  try {
    if (sdk && sdk.utils && sdk.isInitialized && sdk.isInitialized()) {
      const metadata = sdk.utils.getTokenMetadata(tokenSymbol)
      console.log(`[GasExchange] 獲取代幣 ${tokenSymbol} 的元數據:`, metadata)
      return metadata
    }
  } catch (error) {
    console.warn(`[GasExchange] 無法獲取代幣 ${tokenSymbol} 的元數據:`, error.message)
  }
  return null
}

// 獲取過濾後的來源代幣列表（根據選定的鏈）
const getFilteredFromTokens = (searchTerm) => {
  if (!nexusState.swapSupportedChains) return []
  
  // 如果沒有選定鏈，返回空數組
  if (!selectedFromChain.value) {
    console.log('[GasExchange] 沒有選定來源鏈，返回空代幣列表')
    return []
  }
  
  // 找到選定的鏈
  const selectedChain = nexusState.swapSupportedChains.find(chain => chain.id === selectedFromChain.value)
  if (!selectedChain || !selectedChain.tokens) {
    console.log('[GasExchange] 找不到鏈或鏈沒有代幣:', selectedFromChain.value)
    return []
  }
  
  console.log(`[GasExchange] 獲取鏈 ${selectedChain.name} (${selectedFromChain.value}) 的代幣:`, selectedChain.tokens)
  
  // 獲取該鏈的代幣，並嘗試獲取代幣元數據
  let tokens = selectedChain.tokens.map(token => {
    // 嘗試從 SDK 獲取代幣元數據
    let tokenMetadata = null
    try {
      if (sdk && sdk.utils && sdk.isInitialized && sdk.isInitialized()) {
        tokenMetadata = sdk.utils.getTokenMetadata(token.symbol)
        console.log(`[GasExchange] 代幣 ${token.symbol} 的元數據:`, tokenMetadata)
        if (tokenMetadata) {
          console.log(`[GasExchange] 代幣 ${token.symbol} 圖標:`, {
            icon: tokenMetadata.icon,
            logo: tokenMetadata.logo,
            hasIcon: !!tokenMetadata.icon,
            hasLogo: !!tokenMetadata.logo
          })
        }
      } else {
        console.log(`[GasExchange] SDK 未初始化，跳過代幣元數據獲取`)
      }
    } catch (error) {
      console.warn(`[GasExchange] 無法獲取代幣 ${token.symbol} 的元數據:`, error.message)
    }
    
    // 檢查原始 token 數據中是否有 logo
    console.log(`[GasExchange] 原始代幣數據 ${token.symbol}:`, {
      symbol: token.symbol,
      name: token.name,
      logo: token.logo,
      tokenAddress: token.tokenAddress
    })
    
    return {
      ...token,
      chainId: selectedChain.id,
      chainName: selectedChain.name,
      chainLogo: selectedChain.logo,
      // 使用元數據中的 icon，如果沒有則使用 token 中的 logo
      logo: tokenMetadata?.icon || tokenMetadata?.logo || token.logo || null
    }
  })
  
  // 應用搜尋過濾
  if (searchTerm) {
    const term = searchTerm.toLowerCase()
    tokens = tokens.filter(token => 
      token.symbol.toLowerCase().includes(term) ||
      token.name.toLowerCase().includes(term)
    )
  }
  
  console.log(`[GasExchange] 過濾後的代幣數量: ${tokens.length}`)
  console.log(`[GasExchange] 代幣圖標檢查:`, tokens.map(t => ({ 
    symbol: t.symbol, 
    logo: t.logo,
    hasIcon: !!t.logo,
    iconUrl: t.logo
  })))
  return tokens
}

// 獲取過濾後的目標代幣列表（根據選定的鏈）
const getFilteredToTokens = (searchTerm) => {
  if (!nexusState.destinationTokens) return []
  
  // 如果沒有選定鏈，返回空數組
  if (!selectedToChain.value) {
    console.log('[GasExchange] 沒有選定目標鏈，返回空代幣列表')
    return []
  }
  
  // 獲取該鏈的目標代幣
  const tokens = nexusState.destinationTokens.get(selectedToChain.value)
  if (!tokens || !Array.isArray(tokens)) {
    console.log('[GasExchange] 找不到目標鏈的代幣:', selectedToChain.value)
    return []
  }
  
  console.log(`[GasExchange] 獲取目標鏈 ${selectedToChain.value} 的代幣:`, tokens)
  
  // 處理代幣數據
  let processedTokens = tokens.map(token => ({
    ...token,
    chainId: selectedToChain.value,
    chainName: token.chainName || `Chain ${selectedToChain.value}`,
    chainLogo: token.chainLogo
  }))
  
  // 應用搜尋過濾
  if (searchTerm) {
    const term = searchTerm.toLowerCase()
    processedTokens = processedTokens.filter(token => 
      token.symbol.toLowerCase().includes(term) ||
      token.name.toLowerCase().includes(term)
    )
  }
  
  console.log(`[GasExchange] 過濾後的目標代幣數量: ${processedTokens.length}`)
  return processedTokens
}

// 獲取代幣支援的鏈數量
const getTokenChainCount = (token) => {
  // 現在我們只顯示特定鏈的代幣，所以返回 1
  return 1
}

// 獲取 swap 按鈕文字
const getSwapButtonText = () => {
  if (!selectedFromToken.value) {
    return '兌換Gas'
  }
  
  if (!selectedToToken.value) {
    return '選擇目標代幣'
  }
  
  if (!fromAmount.value || parseFloat(fromAmount.value) <= 0) {
    return '輸入數量'
  }
  
  return `Swap ${fromAmount.value} ${selectedFromToken.value.symbol} → ${selectedToToken.value.symbol}`
}

// 獲取載入中文字
const getSwapLoadingText = () => {
  const step = nexusState.swapProgress.currentStep
  if (step === 'intent_approval') return '等待確認...'
  if (step === 'SOURCE_SWAP_HASH') return '處理來源交易...'
  if (step === 'DESTINATION_SWAP_HASH') return '處理目標交易...'
  return 'Swap 進行中...'
}

// 獲取已完成步驟數量
const getCompletedStepsCount = () => {
  return nexusState.swapProgress.steps.filter(step => step.completed).length
}

// 格式化費用
const formatFee = (fee) => {
  if (!fee || fee === '0') return '0.00'
  const num = parseFloat(fee)
  return isNaN(num) ? '0.00' : num.toFixed(6)
}

// 獲取鏈的 logo (優先使用 Nexus SDK 提供的)
const getChainLogo = (chainId) => {
  const chain = supportedChains.value.find(c => c.id === chainId)
  return chain?.logo || null
}

// Watch for connection changes
watch(isConnected, (connected) => {
  if (connected && !nexusState.initialized) {
    initNexus()
  }
})


// Lifecycle
onMounted(() => {
  if (isConnected.value && !nexusState.initialized) {
    initNexus()
  }
  
  // 不再需要事件監聽器，因為我們直接控制 Modal 顯示
})
</script>

<style scoped>
.btn-primary {
  @apply bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-emerald-500/30 focus:ring-offset-2 shadow-lg hover:shadow-xl hover:scale-105;
}

.refresh-btn {
  @apply flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-all duration-300;
}

.total-balance-card {
  @apply bg-white/10 backdrop-blur-md border border-emerald-300/30 p-8 rounded-3xl shadow-lg text-center transition-all duration-300 hover:shadow-xl;
}

/* Premium styling for total card */
.total-balance-card.premium {
  @apply relative overflow-hidden bg-white border-0 shadow-xl;
}
.total-balance-card.premium::before {
  content: '';
  position: absolute;
  inset: -1px;
  border-radius: 1.5rem;
  background: radial-gradient(1200px 300px at 50% -200px, rgba(251,191,36,0.25), transparent 60%), radial-gradient(800px 200px at -100px -100px, rgba(59,130,246,0.12), transparent 60%);
  pointer-events: none;
}
.total-header {
  @apply text-sm font-semibold tracking-wide text-emerald-100;
}
.total-amount {
  @apply text-6xl font-extrabold tracking-tight my-2 text-white tabular-nums;
}
.total-symbol {
  @apply text-sm text-emerald-200 uppercase tracking-wider;
}

.chain-balance-card {
  @apply bg-white p-6 rounded-2xl shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col items-center justify-start text-center h-full border border-gray-100 hover:border-gray-200;
}
.balance-list {
  @apply bg-slate-800/50 backdrop-blur-md rounded-3xl border border-emerald-300/30 divide-y divide-emerald-300/20 overflow-hidden shadow;
}

.balance-row {
  @apply flex items-center justify-between px-6 py-5 hover:bg-emerald-500/10 transition-colors;
}

.row-left {
  @apply flex items-center;
}

.logo-wrap {
  @apply relative flex items-center justify-center;
}

.fallback-logo {
  @apply w-8 h-8 flex items-center justify-center rounded-full bg-emerald-500/20 text-emerald-300 text-sm;
}

.row-chain-name {
  @apply text-sm font-semibold text-white;
}

.row-sub {
  @apply text-xs text-emerald-200;
}

.row-right {
  @apply text-right;
}

.row-amount {
  @apply text-lg font-bold tracking-tight text-white;
}

.row-symbol {
  @apply text-xs text-emerald-200;
}

.toggle-list-btn {
  @apply px-4 py-2 text-sm font-semibold text-emerald-300 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400/30 rounded-lg transition-colors;
}


.token-switch {
  @apply inline-flex items-center bg-white/10 backdrop-blur-md border border-emerald-300/30 rounded-2xl p-1 shadow;
}
.token-btn {
  @apply px-5 py-2 text-sm font-semibold rounded-xl text-emerald-200 hover:text-white hover:bg-emerald-500/20 transition-colors;
}
.token-btn.active {
  @apply bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md hover:from-emerald-600 hover:to-teal-700;
}

/* Text styles are now applied directly in the template for more granular control */
.balance-icon, .chain-icon {
  /* This class is kept for potential fallback but is mostly superseded by classes in the template */
}

.balance-label, .chain-name {
  @apply text-sm text-gray-600;
}

.balance-amount, .chain-balance {
  @apply font-bold text-gray-900;
}

.chain-selector {
  @apply flex items-center justify-between p-4 bg-gray-50 border-2 border-gray-200 rounded-xl cursor-pointer hover:border-amber-400 transition-all duration-300;
}

.selected-chain {
  @apply flex items-center gap-3;
}

.chain-details {
  @apply flex-1;
}

.chain-name {
  @apply font-semibold text-gray-900;
}

.chain-symbol {
  @apply text-sm text-gray-600;
}

.placeholder-chain {
  @apply flex items-center gap-3 text-gray-500;
}

.placeholder-icon {
  @apply text-2xl;
}

.amount-input-container {
  @apply flex bg-white border-2 border-gray-200 rounded-xl focus-within:border-amber-400 transition-colors;
}

.amount-input {
  @apply flex-1 px-4 py-3 text-lg font-semibold text-gray-900 bg-transparent border-none outline-none;
}

.amount-actions {
  @apply flex items-center pr-4;
}

.max-btn {
  @apply px-3 py-1 bg-amber-400 hover:bg-amber-500 text-gray-800 text-sm font-semibold rounded-md transition-colors disabled:opacity-50;
}

.address-input {
  @apply w-full p-3 border-2 border-gray-200 rounded-xl focus:border-amber-400 focus:ring-4 focus:ring-amber-400/30 focus:outline-none transition-all duration-300;
}

.cost-preview {
  @apply bg-blue-50 border border-blue-200 rounded-xl p-4;
}

.refuel-btn {
  @apply w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold py-4 px-6 rounded-xl text-lg transition-all duration-300 transform hover:scale-105 disabled:transform-none;
}

.error-message {
  @apply flex items-center gap-2 text-red-600 text-sm bg-red-50 p-3 rounded-lg border border-red-200;
}

.transaction-item {
  @apply border-b border-gray-100 py-3 last:border-b-0;
}

.supported-chain-item {
  @apply flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors;
}

.chain-option {
  @apply flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors;
}

.close-btn {
  @apply w-full mt-4 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded-lg transition-colors;
}

.loading-spinner {
  @apply w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin;
}
</style>

<style scoped>
.btn-primary {
  @apply bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-emerald-500/30 focus:ring-offset-2 shadow-lg hover:shadow-xl hover:scale-105;
}

.refresh-btn {
  @apply flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-all duration-300;
}

.total-balance-card {
  @apply bg-white/10 backdrop-blur-md border border-emerald-300/30 p-8 rounded-3xl shadow-lg text-center transition-all duration-300 hover:shadow-xl;
}

.chain-balance-card {
  @apply bg-white p-6 rounded-2xl shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col items-center justify-start text-center h-full border border-gray-100 hover:border-gray-200;
}

/* Text styles are now applied directly in the template for more granular control */
.balance-icon, .chain-icon {
  /* This class is kept for potential fallback but is mostly superseded by classes in the template */
}

.balance-label, .chain-name {
  @apply text-sm text-gray-600;
}

.balance-amount, .chain-balance {
  @apply font-bold text-gray-900;
}

.chain-selector {
  @apply flex items-center justify-between p-4 bg-gray-50 border-2 border-gray-200 rounded-xl cursor-pointer hover:border-amber-400 transition-all duration-300;
}

.selected-chain {
  @apply flex items-center gap-3;
}

.chain-details {
  @apply flex-1;
}

.chain-name {
  @apply font-semibold text-gray-900;
}

.chain-symbol {
  @apply text-sm text-gray-600;
}

.placeholder-chain {
  @apply flex items-center gap-3 text-gray-500;
}

.placeholder-icon {
  @apply text-2xl;
}

.amount-input-container {
  @apply flex bg-white border-2 border-gray-200 rounded-xl focus-within:border-amber-400 transition-colors;
}

.amount-input {
  @apply flex-1 px-4 py-3 text-lg font-semibold text-gray-900 bg-transparent border-none outline-none;
}

.amount-actions {
  @apply flex items-center pr-4;
}

.max-btn {
  @apply px-3 py-1 bg-amber-400 hover:bg-amber-500 text-gray-800 text-sm font-semibold rounded-md transition-colors disabled:opacity-50;
}

.address-input {
  @apply w-full p-3 border-2 border-gray-200 rounded-xl focus:border-amber-400 focus:ring-4 focus:ring-amber-400/30 focus:outline-none transition-all duration-300;
}

.cost-preview {
  @apply bg-blue-50 border border-blue-200 rounded-xl p-4;
}

.refuel-btn {
  @apply w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold py-4 px-6 rounded-xl text-lg transition-all duration-300 transform hover:scale-105 disabled:transform-none;
}

.error-message {
  @apply flex items-center gap-2 text-red-600 text-sm bg-red-50 p-3 rounded-lg border border-red-200;
}

.transaction-item {
  @apply border-b border-gray-100 py-3 last:border-b-0;
}

.supported-chain-item {
  @apply flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors;
}

.chain-option {
  @apply flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors;
}

.close-btn {
  @apply w-full mt-4 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded-lg transition-colors;
}

.loading-spinner {
  @apply w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin;
}

.progress-section {
  @apply bg-blue-50 border border-blue-200 rounded-xl p-4 mt-4;
}

.progress-indicator {
  @apply w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold bg-gray-200 text-gray-600;
}

.progress-indicator.completed {
  @apply bg-green-500 text-white;
}

.progress-indicator.current {
  @apply bg-blue-500 text-white animate-pulse;
}

.suggestion-btn {
  @apply px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-medium rounded-md transition-colors cursor-pointer;
}

.suggestion-btn:hover {
  @apply bg-amber-100 text-amber-700;
}

/* ===== Modern Swap Interface Styles ===== */

/* Main Swap Card */
.swap-main-card {
  @apply rounded-2xl shadow-2xl border border-emerald-400/30 overflow-hidden;
  background: linear-gradient(135deg, rgba(15, 23, 42, 0.98) 0%, rgba(30, 41, 59, 0.98) 50%, rgba(15, 23, 42, 0.98) 100%);
  backdrop-filter: blur(20px);
  box-shadow: 
    0 20px 40px -12px rgba(0, 0, 0, 0.3),
    0 0 0 1px rgba(16, 185, 129, 0.15),
    inset 0 1px 0 rgba(255, 255, 255, 0.08);
  position: relative;
}

.swap-main-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent 0%, rgba(16, 185, 129, 0.3) 50%, transparent 100%);
}

/* Header */
.swap-header {
  @apply flex items-center justify-between p-5 border-b border-emerald-400/20;
  background: linear-gradient(90deg, rgba(16, 185, 129, 0.03) 0%, rgba(20, 184, 166, 0.03) 100%);
}

/* Title Container */
.swap-title-container {
  @apply flex items-center gap-3;
}

/* Title Icons */
.title-icon,
.transaction-icon,
.chains-icon {
  @apply relative w-8 h-8 flex items-center justify-center;
}

.icon-bg {
  @apply absolute inset-0 rounded-lg;
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(20, 184, 166, 0.2) 100%);
  border: 1px solid rgba(16, 185, 129, 0.3);
}

.icon-accent {
  @apply absolute inset-1 rounded-md;
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.4) 0%, rgba(20, 184, 166, 0.4) 100%);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

/* Specific icon designs */
.title-icon::before {
  content: '';
  @apply absolute w-3 h-3 bg-emerald-400 rounded-sm z-10;
  transform: rotate(45deg);
  box-shadow: 0 0 8px rgba(16, 185, 129, 0.4);
}

.title-icon::after {
  content: '';
  @apply absolute w-2 h-2 bg-emerald-300 rounded-sm z-10;
  transform: rotate(45deg) translate(2px, -2px);
  box-shadow: 0 0 6px rgba(16, 185, 129, 0.3);
}

.transaction-icon::before {
  content: '';
  @apply absolute w-4 h-0.5 bg-emerald-400 z-10;
  transform: rotate(45deg);
  box-shadow: 0 0 8px rgba(16, 185, 129, 0.4);
}

.transaction-icon::after {
  content: '';
  @apply absolute w-0.5 h-4 bg-emerald-400 z-10;
  transform: translate(1px, -1px);
  box-shadow: 0 0 8px rgba(16, 185, 129, 0.4);
}

.chains-icon::before {
  content: '';
  @apply absolute w-3 h-3 border-2 border-emerald-400 rounded-full z-10;
  box-shadow: 0 0 8px rgba(16, 185, 129, 0.4);
}

.chains-icon::after {
  content: '';
  @apply absolute w-2 h-2 border border-emerald-300 rounded-full z-10;
  transform: translate(1px, 1px);
  box-shadow: 0 0 6px rgba(16, 185, 129, 0.3);
}

.swap-title {
  @apply text-xl font-bold text-white;
}

.swap-subtitle {
  @apply text-sm text-emerald-200/80 mt-1;
}

/* Mode Toggle */
.swap-mode-toggle {
  @apply inline-flex bg-gray-100 rounded-2xl p-1 shadow-inner;
}

.mode-btn {
  @apply px-4 py-2 text-sm font-semibold rounded-xl transition-all duration-300 text-gray-600 hover:text-gray-900;
}

.mode-btn.active {
  @apply bg-white text-gray-900 shadow-md;
  transform: translateY(-1px);
}

/* Swap Form */
.swap-form {
  @apply p-6 space-y-6;
}

/* Swap Sections */
.swap-section {
  @apply space-y-4 p-5;
}

.section-header {
  @apply flex items-center justify-between;
}

.section-title {
  @apply text-base font-semibold text-white;
}

.balance-hint {
  @apply text-sm text-emerald-300/80;
}

/* Input Groups */
.swap-input-group {
  @apply flex gap-4;
}

.token-selector {
  @apply flex items-center justify-between p-4 bg-white/5 backdrop-blur-md border border-emerald-300/20 rounded-xl cursor-pointer transition-all duration-300 hover:border-emerald-400/40 hover:bg-emerald-500/10 min-w-[200px];
}

.token-selector:hover {
  box-shadow: 0 4px 20px rgba(16, 185, 129, 0.2);
}

.selected-token {
  @apply flex items-center gap-3;
}

.token-icon {
  @apply w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center;
}

.token-details {
  @apply flex-1;
}

.token-symbol {
  @apply font-bold text-white;
}

.chain-name {
  @apply text-sm text-emerald-200;
}

.placeholder-token {
  @apply flex items-center gap-3 text-emerald-300;
}

.placeholder-text {
  @apply font-medium;
}

/* Amount Input */
.amount-input-wrapper {
  @apply flex-1 relative;
}

.amount-input {
  @apply w-full px-4 py-4 text-lg font-semibold text-white bg-white/5 backdrop-blur-md border border-emerald-300/20 rounded-xl focus:border-emerald-400/40 focus:ring-2 focus:ring-emerald-400/20 focus:outline-none transition-all duration-300 disabled:bg-emerald-500/10 disabled:text-emerald-300;
}

.max-button {
  @apply absolute right-3 top-1/2 transform -translate-y-1/2 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg transition-all duration-300 hover:scale-105;
}

/* Swap Arrow */
.swap-arrow-section {
  @apply flex justify-center relative;
}

.swap-arrow {
  @apply w-10 h-10 bg-white/5 backdrop-blur-md border border-emerald-300/20 rounded-full flex items-center justify-center text-emerald-300 hover:text-emerald-400 hover:border-emerald-400/40 hover:bg-emerald-500/10 transition-all duration-300 transform hover:scale-105 hover:rotate-180 shadow-md z-10;
}

/* Swap Info */
.swap-info {
  @apply rounded-2xl p-6 relative overflow-hidden;
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.12) 0%, rgba(20, 184, 166, 0.12) 50%, rgba(16, 185, 129, 0.12) 100%);
  border: 1px solid rgba(16, 185, 129, 0.4);
  box-shadow: 
    0 8px 32px rgba(16, 185, 129, 0.1),
    0 0 0 1px rgba(16, 185, 129, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  animation: infoGlow 3s ease-in-out infinite;
}

@keyframes infoGlow {
  0%, 100% {
    box-shadow: 
      0 8px 32px rgba(16, 185, 129, 0.1),
      0 0 0 1px rgba(16, 185, 129, 0.2),
      inset 0 1px 0 rgba(255, 255, 255, 0.1);
  }
  50% {
    box-shadow: 
      0 12px 40px rgba(16, 185, 129, 0.15),
      0 0 0 1px rgba(16, 185, 129, 0.3),
      inset 0 1px 0 rgba(255, 255, 255, 0.15);
  }
}

.info-header {
  @apply flex items-center justify-between mb-3;
}

.info-title {
  @apply text-xl font-bold text-white;
  background: linear-gradient(135deg, #10b981 0%, #14b8a6 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-shadow: 0 0 20px rgba(16, 185, 129, 0.3);
}

.refresh-btn {
  @apply p-3 text-emerald-300 hover:text-white hover:bg-emerald-500/30 rounded-xl transition-all duration-300;
  background: rgba(16, 185, 129, 0.1);
  border: 1px solid rgba(16, 185, 129, 0.3);
  box-shadow: 0 2px 8px rgba(16, 185, 129, 0.1);
}

.info-content {
  @apply space-y-3;
}

.info-row {
  @apply flex justify-between items-center py-2 px-3 rounded-lg;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(16, 185, 129, 0.2);
  transition: all 0.3s ease;
}

.info-row:hover {
  background: rgba(16, 185, 129, 0.1);
  border-color: rgba(16, 185, 129, 0.3);
  transform: translateY(-1px);
}

.info-row span:first-child {
  @apply text-emerald-200 font-medium text-sm;
}

.info-row span:last-child {
  @apply text-white font-semibold text-sm;
}

/* Progress */
.swap-progress {
  @apply bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-300/30 rounded-2xl p-4;
}

.progress-title {
  @apply text-lg font-bold text-emerald-200 mb-4;
}

.progress-counter {
  @apply text-sm font-normal text-emerald-300 bg-emerald-500/20 px-2 py-1 rounded-full ml-2;
}

.progress-steps {
  @apply space-y-3;
}

.progress-step {
  @apply flex items-center gap-4;
}

.step-indicator {
  @apply w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold bg-emerald-500/20 text-emerald-300 transition-all duration-300;
}

.step-indicator.completed {
  @apply bg-emerald-500 text-white;
}

.step-indicator.current {
  @apply bg-teal-500 text-white animate-pulse;
}

.step-content {
  @apply flex-1;
}

.step-title {
  @apply font-semibold text-white;
}

.step-link {
  @apply mt-1;
}

/* Swap Execute Button */
.swap-execute-btn {
  @apply w-full py-4 px-6 text-base font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 disabled:transform-none;
  background: linear-gradient(135deg, #10b981 0%, #14b8a6 100%);
  color: white;
  box-shadow: 0 6px 20px rgba(16, 185, 129, 0.25);
}

.swap-execute-btn:hover:not(:disabled) {
  box-shadow: 0 8px 25px rgba(16, 185, 129, 0.35);
}

.swap-execute-btn:disabled {
  @apply bg-gray-300 text-gray-500 cursor-not-allowed;
  box-shadow: none;
}

.swap-execute-btn.loading {
  @apply cursor-not-allowed;
  background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%);
}

/* Modal Styles */
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
    0 25px 50px -12px rgba(0, 0, 0, 0.6),
    0 0 0 1px rgba(16, 185, 129, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  animation: slideUp 0.3s ease-out;
}

.modal-header {
  @apply flex items-center justify-between p-4 border-b border-emerald-400/30;
  background: linear-gradient(90deg, rgba(16, 185, 129, 0.05) 0%, rgba(20, 184, 166, 0.05) 100%);
}

.modal-title {
  @apply text-xl font-bold text-white;
}

.modal-close {
  @apply p-2 text-emerald-300 hover:text-white hover:bg-emerald-500/20 rounded-lg transition-all duration-300;
}

.modal-content {
  @apply p-4 max-h-[50vh] overflow-y-auto;
}

/* Search Box */
.search-box {
  @apply mb-3;
}

.search-input {
  @apply w-full px-4 py-3 border-2 border-emerald-400/30 rounded-xl focus:border-emerald-400 focus:ring-4 focus:ring-emerald-400/20 focus:outline-none transition-all duration-300 bg-white/5 text-white placeholder-emerald-300;
}

/* Chain Tabs */
.chain-tabs {
  @apply flex flex-wrap gap-2 mb-4;
}

.chain-tab {
  @apply flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-blue-100 text-gray-700 hover:text-blue-700 rounded-lg transition-all duration-300 text-sm font-medium;
}

.chain-tab.active {
  @apply bg-blue-600 text-white hover:bg-blue-700;
}

/* Token List */
.token-list {
  @apply space-y-2;
}

.token-section {
  @apply space-y-2;
}

.chain-header {
  @apply flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg;
}

.chain-name {
  @apply text-sm font-semibold text-white;
}

.token-option {
  @apply flex items-center p-3 hover:bg-emerald-500/10 rounded-lg cursor-pointer transition-all duration-300;
}

.token-info {
  @apply flex items-center gap-3 flex-1;
}

.token-details {
  @apply flex-1 space-y-1;
}

.token-symbol {
  @apply text-sm font-semibold text-white;
}

.token-name {
  @apply text-xs text-emerald-200;
}

.token-balance {
  @apply text-xs font-medium text-white;
}

.token-chains {
  @apply text-xs text-emerald-300;
}

.fallback-icon {
  @apply w-6 h-6 bg-white text-emerald-600 rounded-full flex items-center justify-center font-bold text-xs;
}

/* 新的清單容器樣式 */
.chains-tokens-container {
  @apply flex gap-4;
}

.chains-section {
  @apply w-1/2;
}

.tokens-section {
  @apply w-1/2;
}

.section-title {
  @apply text-base font-semibold text-white mb-3;
}

.chains-list {
  @apply space-y-1;
}

.tokens-list {
  @apply space-y-1;
}

.chain-option {
  @apply flex items-center p-3 hover:bg-emerald-500/10 rounded-lg cursor-pointer transition-all duration-300;
}

.chain-option.active {
  @apply bg-emerald-500/20 border border-emerald-400/50;
}

.chain-option .chain-icon {
  @apply flex-shrink-0 mr-3;
}

.chain-option .chain-icon img,
.chain-option .chain-icon span {
  @apply w-8 h-8 rounded-full;
}

.chain-option .chain-name {
  @apply text-sm font-semibold text-white;
}

/* Chain Selection Grid */
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

.chain-card .chain-info {
  @apply text-center;
}

.chain-card .chain-name {
  @apply text-sm font-semibold text-white mb-1;
}

.chain-gas-symbol {
  @apply text-xs text-emerald-300 font-medium;
}

.chain-selector {
  @apply flex items-center justify-between p-4 bg-white/5 backdrop-blur-md border border-emerald-300/20 rounded-xl cursor-pointer transition-all duration-300 hover:border-emerald-400/40 hover:bg-emerald-500/10 min-w-[200px];
}

.selected-chain {
  @apply flex items-center gap-3;
}

.chain-details {
  @apply flex-1;
}

.chain-symbol {
  @apply font-bold text-white;
}

.placeholder-chain {
  @apply flex items-center gap-3 text-emerald-300;
}

.chain-icon {
  @apply flex-shrink-0;
}

.token-chains {
  @apply text-xs text-gray-400;
}

/* Animations */
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Chain Selector Grid */
.chain-selector-grid {
  @apply grid grid-cols-1 sm:grid-cols-2 gap-3;
}

.chain-card {
  @apply relative p-4 bg-gray-50 border-2 border-gray-200 rounded-2xl cursor-pointer transition-all duration-300 hover:border-blue-300 hover:bg-blue-50 hover:shadow-md;
}

.chain-card.selected {
  @apply border-blue-500 bg-blue-50 shadow-lg;
}

.chain-card:hover {
  transform: translateY(-2px);
}

.chain-card .chain-icon {
  @apply mb-3;
}

.chain-card .chain-info {
  @apply space-y-1;
}

.chain-card .chain-name {
  @apply font-bold text-gray-900;
}

.chain-card .chain-symbol {
  @apply text-sm text-gray-600;
}

.selected-indicator {
  @apply absolute top-3 right-3;
}

/* Estimated Output */
.estimated-output {
  @apply mt-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl;
}

.output-label {
  @apply text-sm font-semibold text-green-700 mb-1;
}

.output-amount {
  @apply text-2xl font-bold text-green-900;
}

/* Swap Success */
.swap-success {
  @apply bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-4;
}

.success-title {
  @apply text-lg font-bold text-green-900 mb-4;
}

.fees-breakdown {
  @apply space-y-3;
}

.fees-title {
  @apply text-base font-semibold text-green-800 mb-2;
}

.fees-list {
  @apply space-y-2;
}

.fee-item {
  @apply flex justify-between items-center py-2 px-3 bg-white rounded-lg border border-green-100;
}

.fee-label {
  @apply text-sm text-gray-600;
}

.fee-value {
  @apply text-sm font-semibold text-green-800;
}

/* Swap Confirmation Modal Styles */
.swap-details {
  @apply mb-6 p-4 bg-gray-50 rounded-xl border border-gray-200;
}

.details-title {
  @apply text-lg font-bold text-gray-900 mb-4;
}

.details-grid {
  @apply space-y-3;
}

.detail-item {
  @apply flex justify-between items-center;
}

.detail-label {
  @apply text-sm font-medium text-gray-600;
}

.detail-value {
  @apply text-sm font-semibold text-gray-900;
}

.intent-details {
  @apply mb-6 p-4 bg-blue-50 rounded-xl border border-blue-200;
}

.fees-grid {
  @apply space-y-2;
}

.fee-item {
  @apply flex justify-between items-center py-2;
}

.fee-item.total {
  @apply border-t border-blue-300 pt-3 mt-3;
}

.fee-label {
  @apply text-sm font-medium text-blue-700;
}

.fee-value {
  @apply text-sm font-bold text-blue-900;
}

.modal-actions {
  @apply flex gap-3 pt-4 border-t border-gray-200;
}

.cancel-btn {
  @apply flex-1 px-4 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-lg transition-colors;
}

.confirm-btn {
  @apply flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-semibold rounded-lg transition-colors;
}

/* ===== Gas Pass 品牌風格 Swap Modal 樣式 ===== */

/* Processing Modal - 樸素灰色風格 */
.processing-modal {
  @apply max-w-md w-full mx-4;
  background: linear-gradient(135deg, rgba(15, 23, 42, 0.98) 0%, rgba(30, 41, 59, 0.98) 50%, rgba(15, 23, 42, 0.98) 100%);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(16, 185, 129, 0.3);
  border-radius: 16px;
  box-shadow: 
    0 25px 50px -12px rgba(0, 0, 0, 0.6),
    0 0 0 1px rgba(16, 185, 129, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  position: relative;
  overflow: hidden;
}

.processing-modal::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(45deg, transparent 30%, rgba(255, 255, 255, 0.1) 50%, transparent 70%);
  animation: shimmer 3s ease-in-out infinite;
}

.processing-content {
  @apply p-8 text-center text-white relative z-10;
}

.processing-icon {
  @apply relative mb-8;
}

/* Gas Pass 風格的 Loading 動畫 - 融入 Logo 元素 */
.gas-pass-loader {
  @apply w-24 h-24 mx-auto relative;
}

.gas-pass-loader::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 80px;
  height: 80px;
  border: 3px solid rgba(255, 255, 255, 0.2);
  border-top: 3px solid #ffffff;
  border-radius: 50%;
  animation: gasSpin 1.2s linear infinite;
}

.gas-pass-loader::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 60px;
  height: 60px;
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-right: 2px solid #FFD700;
  border-radius: 50%;
  animation: gasSpin 0.8s linear infinite reverse;
}

/* Gas 瓶子/電池動畫 */
.gas-bottle {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 40px;
  height: 50px;
  background: linear-gradient(to bottom, #FFD700 0%, #F7931A 100%);
  border-radius: 8px 8px 4px 4px;
  animation: gasFill 2s ease-in-out infinite;
}

.gas-bottle::before {
  content: '';
  position: absolute;
  top: -4px;
  left: 50%;
  transform: translateX(-50%);
  width: 20px;
  height: 8px;
  background: #555;
  border-radius: 2px;
}

.gas-bottle::after {
  content: '';
  position: absolute;
  top: 10px;
  left: 50%;
  transform: translateX(-50%);
  width: 30px;
  height: 30px;
  background: linear-gradient(to bottom, #FFD700 0%, #F7931A 100%);
  border-radius: 4px;
  animation: gasPulse 1.5s ease-in-out infinite;
}

.processing-checkmark {
  @apply absolute inset-0 flex items-center justify-center;
}

.processing-title {
  @apply text-2xl font-bold mb-2 text-white;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}

.processing-subtitle {
  @apply text-emerald-200 mb-6;
  font-weight: 400;
}

.progress-steps {
  @apply space-y-3 mb-6;
}

.progress-step {
  @apply flex items-center gap-3 text-left;
}

.step-indicator {
  @apply w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold bg-gray-200 text-gray-600 transition-all duration-300;
}

.step-indicator.completed {
  @apply bg-green-500 text-white;
  animation: checkmark 0.5s ease-in-out;
}

.step-indicator.current {
  @apply bg-yellow-400 text-gray-800;
  animation: pulse 2s infinite;
}

.step-content {
  @apply flex-1;
}

.step-title {
  @apply font-semibold text-gray-700;
}

.step-link {
  @apply mt-1;
}

.explorer-link {
  @apply text-gray-600 hover:text-gray-800 text-sm underline transition-colors;
}

.loading-animation {
  @apply mt-6;
}

.loading-dots {
  @apply flex justify-center gap-2;
}

.dot {
  @apply w-3 h-3 bg-gray-400 rounded-full;
  animation: bounce 1.4s ease-in-out infinite both;
}

.dot:nth-child(1) { animation-delay: -0.32s; }
.dot:nth-child(2) { animation-delay: -0.16s; }
.dot:nth-child(3) { animation-delay: 0s; }

/* Success Modal - 樸素灰色風格 */
.success-modal {
  @apply max-w-lg w-full mx-4;
  background: linear-gradient(135deg, rgba(15, 23, 42, 0.98) 0%, rgba(30, 41, 59, 0.98) 50%, rgba(15, 23, 42, 0.98) 100%);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(16, 185, 129, 0.3);
  border-radius: 16px;
  box-shadow: 
    0 25px 50px -12px rgba(0, 0, 0, 0.6),
    0 0 0 1px rgba(16, 185, 129, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  position: relative;
  overflow: hidden;
}

.success-modal::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(45deg, transparent 30%, rgba(247, 147, 26, 0.1) 50%, transparent 70%);
  animation: shimmer 4s ease-in-out infinite;
}

.success-content {
  @apply p-8 text-center text-white relative z-10;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 500px;
  padding-top: 5rem;
}

.success-icon {
  @apply mb-6;
}

/* Gas Pass 風格成功圖標 */
.success-icon-gas {
  @apply w-24 h-24 mx-auto relative;
}

.success-circle {
  @apply w-20 h-20 mx-auto rounded-full flex items-center justify-center relative;
  background: linear-gradient(135deg, #F7931A 0%, #FFD700 100%);
  box-shadow: 
    0 4px 15px rgba(247, 147, 26, 0.3),
    inset 0 1px 2px rgba(255, 255, 255, 0.2);
  animation: successPulse 0.8s ease-out;
}

.success-circle::before {
  content: '';
  position: absolute;
  top: -2px;
  left: -2px;
  right: -2px;
  bottom: -2px;
  background: linear-gradient(135deg, #F7931A, #FFD700, #F7931A);
  border-radius: 50%;
  z-index: -1;
  animation: successGlow 2s ease-in-out infinite;
}

.success-title {
  @apply text-3xl font-bold mb-3 text-white;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}

.success-subtitle {
  @apply text-emerald-200 mb-6;
  font-weight: 400;
}

.transaction-details {
  @apply space-y-4 mb-6;
}

.detail-card {
  @apply rounded-lg p-4 relative;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(16, 185, 129, 0.3);
  box-shadow: 
    0 4px 12px rgba(0, 0, 0, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

.detail-header {
  @apply flex items-center gap-2 mb-3;
}

.detail-icon {
  @apply text-xl;
}

.detail-label {
  @apply font-semibold text-white;
}

.detail-content {
  @apply space-y-2;
}

.detail-row {
  @apply flex justify-between items-center;
}

.row-label {
  @apply text-emerald-200 text-sm;
}

.row-value {
  @apply text-white font-semibold text-sm;
}

.fee-row {
  @apply flex justify-between items-center py-1;
}

.fee-label {
  @apply text-emerald-200 text-sm;
}

.fee-value {
  @apply text-white font-semibold text-sm;
}

.success-actions {
  @apply flex gap-3;
}

.explorer-btn,
.close-btn {
  @apply flex-1 flex items-center justify-center gap-2 px-6 py-4 font-semibold rounded-lg transition-all duration-200;
  background: rgba(16, 185, 129, 0.2);
  color: #10b981;
  border: 1px solid rgba(16, 185, 129, 0.3);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  min-height: 56px; /* 增加最小高度 */
  width: 100%; /* 確保寬度一致 */
  white-space: nowrap; /* 防止文字換行 */
  font-size: 0.95rem; /* 稍微調整字體大小 */
}

.explorer-btn:hover,
.close-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  background: rgba(16, 185, 129, 0.3);
  color: #ffffff;
}

/* Gas Pass 品牌動畫效果 */
@keyframes gasSpin {
  0% { transform: translate(-50%, -50%) rotate(0deg); }
  100% { transform: translate(-50%, -50%) rotate(360deg); }
}

@keyframes gasFill {
  0%, 100% { 
    transform: translate(-50%, -50%) scaleY(0.3);
    opacity: 0.7;
  }
  50% { 
    transform: translate(-50%, -50%) scaleY(1);
    opacity: 1;
  }
}

@keyframes gasPulse {
  0%, 100% { 
    transform: translateX(-50%) scale(1);
    opacity: 0.8;
  }
  50% { 
    transform: translateX(-50%) scale(1.1);
    opacity: 1;
  }
}

@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

@keyframes successGlow {
  0%, 100% { 
    opacity: 0.5;
    transform: scale(1);
  }
  50% { 
    opacity: 0.8;
    transform: scale(1.05);
  }
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@keyframes bounce {
  0%, 80%, 100% {
    transform: scale(0);
  }
  40% {
    transform: scale(1);
  }
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

@keyframes checkmark {
  0% {
    transform: scale(0);
  }
  50% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
  }
}

@keyframes successPulse {
  0% {
    transform: scale(0);
    opacity: 0;
  }
  50% {
    transform: scale(1.1);
    opacity: 1;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

/* 添加首頁的動畫效果 */
@keyframes float-slow {
  0%, 100% { transform: translateY(0px) translateX(0px); }
  33% { transform: translateY(-15px) translateX(10px); }
  66% { transform: translateY(-5px) translateX(-5px); }
}

@keyframes float-reverse {
  0%, 100% { transform: translateY(0px) translateX(0px); }
  33% { transform: translateY(15px) translateX(-10px); }
  66% { transform: translateY(5px) translateX(5px); }
}

@keyframes pulse-slow {
  0%, 100% { transform: scale(1); opacity: 0.1; }
  50% { transform: scale(1.1); opacity: 0.2; }
}

.animate-float-slow {
  animation: float-slow 8s ease-in-out infinite;
}

.animate-float-reverse {
  animation: float-reverse 6s ease-in-out infinite;
}

.animate-pulse-slow {
  animation: pulse-slow 4s ease-in-out infinite;
}

.refresh-header-btn {
  @apply flex items-center gap-2 px-4 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 hover:text-white border border-emerald-400/30 rounded-xl transition-all duration-300 font-semibold;
}

/* 響應式設計 */
@media (max-width: 640px) {
  .processing-modal,
  .success-modal {
    @apply mx-2;
  }
  
  .processing-content,
  .success-content {
    @apply p-6;
  }
  
  .success-title {
    @apply text-2xl;
  }
  
  .success-actions {
    @apply flex-col;
  }
}
</style>
