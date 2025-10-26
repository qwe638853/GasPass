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
          <!-- Vincent Agent login prompt card (shown when JWT is not available) -->
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

                <!-- Pre-redirect confirmation block -->
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
          <!-- Top Section: Card Management -->
          <div v-if="vincentJwt" class="mb-12">
            <!-- No cards scenario -->
            <div v-if="!hasCard" class="py-8 -mt-8">
              <div class="premium-card-main px-8 py-4 max-w-5xl mx-auto relative overflow-hidden">
                <!-- Background decoration -->
                <div class="absolute inset-0 bg-gradient-to-br from-emerald-50/10 to-teal-50/10"></div>
                <div class="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-emerald-200/20 to-teal-200/20 rounded-full -translate-y-32 translate-x-32"></div>
                <div class="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-emerald-200/20 to-teal-200/20 rounded-full translate-y-24 -translate-x-24"></div>
                
                <!-- Wallet address -->
                <div class="card-number-display">
                  <span class="number-segment">{{ getAddressSegment(0) }}</span>
                  <span class="number-segment">{{ getAddressSegment(1) }}</span>
                  <span class="number-segment">{{ getAddressSegment(2) }}</span>
                  <span class="number-segment">{{ getAddressSegment(3) }}</span>
                </div>
                
                <div class="relative z-10 flex items-center gap-12">
                  <!-- Left side text content -->
                  <div class="flex-1 -mt-8">
                    <div class="flex items-center gap-3 mb-6">
                      <h3 class="text-4xl font-black text-gray-600">Welcome to GasPass!</h3>
                    </div>
                    <p class="text-xl text-emerald-200 mb-8 max-w-2xl">
                      You don't have a card yet, let's create your first GasPass<br>
                      to start your worry-free DeFi journey!
                    </p>
                  </div>
                  
                  <!-- Right side Cute Gas Jar Component -->
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

            <!-- Has cards scenario - keep consistency with no cards view -->
            <div v-else class="py-8 -mt-8">
              <!-- Card selector when multiple cards exist -->
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

              <!-- Main card area - keep consistency with no cards view -->
              <div class="premium-card-main px-8 py-4 max-w-5xl mx-auto relative overflow-hidden">
                <!-- Background decoration -->
                <div class="absolute inset-0 bg-gradient-to-br from-emerald-50/10 to-teal-50/10"></div>
                <div class="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-emerald-200/20 to-teal-200/20 rounded-full -translate-y-32 translate-x-32"></div>
                <div class="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-teal-200/20 to-emerald-200/20 rounded-full translate-y-24 -translate-x-24"></div>
                
                <!-- Wallet address -->
                <div class="card-number-display">
                  <span class="number-segment">{{ getAddressSegment(0) }}</span>
                  <span class="number-segment">{{ getAddressSegment(1) }}</span>
                  <span class="number-segment">{{ getAddressSegment(2) }}</span>
                  <span class="number-segment">{{ getAddressSegment(3) }}</span>
                    </div>
                    
                 <!-- Card info - top left corner -->
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
                   <!-- Left side text content -->
                   <div class="flex-1 -mt-8">
                     <div class="flex items-center gap-3 mb-6">
                       <h3 class="text-4xl font-black text-gray-600">Welcome back!</h3>
                     </div>
                     
                     <!-- Professional status information -->
                     <div class="status-info-container mb-8">
                       <div class="status-description">
                         <p class="primary-text">Your GasPass infrastructure is ready</p>
                         <p class="secondary-text">Deposit USDC to maintain optimal gas reserves across chains</p>
                       </div>
                     </div>
                   </div>
                   
                   <!-- Right side Cute Gas Jar Component -->
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

          <!-- Bottom Section: Gas Exchange Management -->
          <div v-if="hasCard && showGasExchange && selectedTokenId" class="premium-card-exchange p-8 relative overflow-hidden">
            <!-- Background decoration -->
            <div class="absolute inset-0 bg-gradient-to-br from-emerald-50/5 to-teal-50/5"></div>
            <div class="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-200/20 to-teal-200/20 rounded-full -translate-y-16 translate-x-16"></div>
            
            <div class="relative z-10">
              <!-- Title -->
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
              
              <!-- Tab switching -->
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

              <!-- Manual Gas Exchange -->
              <div v-if="activeTab === 'manual'" class="space-y-6">
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <!-- Exchange settings -->
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

                         <!-- Quick buttons -->
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
                  
                  <!-- Exchange preview -->
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

              <!-- Agent Auto Monitoring -->
              <div v-else class="space-y-6">
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <!-- Agent Settings -->
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
                  
                  <!-- Agent Status -->
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

// Vincent Auth composable (uses hardcoded App ID)
const { ensureAuth, loadFromStorage, vincentJwt, vincentRedirecting, vincentPkpEthAddress } = useVincentAuth()

// Expose SUPPORTED_CHAINS for template use
const supportedChains = SUPPORTED_CHAINS

// Vincent JWT status monitoring (optional debugging)
// watch(vincentJwt, (newVal) => {
//   console.log('[CardManagement] vincentJwt changed:', !!newVal, newVal)
// }, { immediate: true })

// Data
const userCards = ref([])
const transactionHistory = ref([])
const usdcBalance = ref('0.00')
const showManualRefuel = ref(false)
const showAutoRefuel = ref(false)
const showGasJar = ref(false) // New: Control Gas Jar display
const selectedTokenId = ref(null) // New: Selected Token ID
const showGasExchange = ref(false) // New: Control Gas Exchange display

// New: Manual exchange success modal
const showManualRefuelSuccess = ref(false)
const manualRefuelSuccessData = ref({
  txHash: '',
  amount: '',
  chainId: '',
  chainName: ''
})

// New: Agent Set success modal
const showAgentSetSuccess = ref(false)
const agentSetSuccessData = ref({
  chainName: '',
  threshold: '',
  amount: ''
})

// New: Tab switching
const activeTab = ref('manual')

// New: Manual exchange settings
const manualRefuel = ref({
  chainId: '42161', // Default Arbitrum
  amount: '',
  recipient: ''
})

// New: Agent auto monitoring settings
const agentRefuel = ref({
  chainId: '42161', // Default Arbitrum
  threshold: '',
  amount: ''
})

// New: Agent status
const agentStatus = ref({
  active: false,
  lastCheck: null
})

// New: Modal state
const showManualChainModal = ref(false)
const showAgentChainModal = ref(false)
const manualChainSearch = ref('')
const agentChainSearch = ref('')

// New: Quote related state
const actualAmount = ref('0.000000')
const isLoadingQuote = ref(false)
const quoteError = ref('')

// Computed
const hasCard = computed(() => userCards.value.length > 0)

// Manual exchange validation
const canExecuteManualRefuel = computed(() => {
  return manualRefuel.value.amount && 
         parseFloat(manualRefuel.value.amount) > 0 &&
         manualRefuel.value.recipient &&
         hasCard.value
})

// Agent settings validation
const canSetupAgentRefuel = computed(() => {
  return agentRefuel.value.threshold && 
         parseFloat(agentRefuel.value.threshold) > 0 &&
         agentRefuel.value.amount && 
         parseFloat(agentRefuel.value.amount) > 0 &&
         hasCard.value
})

// Methods
const loadUserData = async () => {
  console.log('🔍 loadUserData starting execution')
  console.log('🔍 Checking conditions:', {
    account: account.value,
    provider: !!provider.value,
    signer: !!signer.value,
    isConnected: isConnected.value
  })
  
  if (!account.value || !provider.value || !signer.value) {
    console.warn('⚠️ Missing required parameters, cannot load user data')
    return
  }
  
  try {
    console.log('🔍 Starting contract service initialization...')
    // Initialize contract service
    await contractService.init(provider.value, signer.value)
    
    console.log('🔍 Checking for GasPass cards...')
    // Check for GasPass cards
    const hasCard = await contractService.hasGasPassCard(account.value)
    console.log('🔍 hasCard result:', hasCard)
    
    if (hasCard) {
      console.log('🔍 Loading user cards...')
      // Load user cards
      userCards.value = await contractService.getUserCards(account.value)
      console.log('🔍 Loaded cards:', userCards.value)
      console.log('📊 Card details:')
      userCards.value.forEach((card, index) => {
        console.log(`  Card ${index + 1}: ID=${card.tokenId}, Balance=${card.balance} USDC`)
      })
      
      // If no card is selected, default to first card and show Gas Exchange Management
      if (!selectedTokenId.value && userCards.value.length > 0) {
        selectedTokenId.value = userCards.value[0].tokenId
        showGasExchange.value = true
        console.log('🔍 Default selected card:', selectedTokenId.value, 'and show Gas Exchange Management')
      }
    } else {
      console.log('🔍 User has no cards')
      userCards.value = []
      selectedTokenId.value = null
      showGasExchange.value = false
    }
    
    // Load transaction history (temporary mock data)
    transactionHistory.value = await gasPassService.getTransactionHistory()
    
    // Load USDC balance
    usdcBalance.value = await contractService.getUSDCBalance(account.value)
    
    // Load Agent status
    await loadAgentStatus()
    
    console.log('✅ loadUserData completed')
  } catch (error) {
    console.error('❌ Failed to load user data:', error)
  }
}

const refreshCards = async () => {
  await loadUserData()
}

const handleMintSuccess = async () => {
  console.log('🎉 Mint successful, refreshing user data...')
  
  // Add delay to ensure blockchain state update
  await new Promise(resolve => setTimeout(resolve, 2000))
  
  // Retry mechanism: up to 3 retries
  let retryCount = 0
  const maxRetries = 3
  
  while (retryCount < maxRetries) {
    try {
  await loadUserData()
      
      // Check if cards are successfully loaded
      if (userCards.value.length > 0) {
  console.log('✅ User data refreshed, should now display card view')
        break
      } else {
        console.log(`⏳ Retry ${retryCount + 1}/${maxRetries}, waiting for blockchain confirmation...`)
        retryCount++
        if (retryCount < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, 3000))
        }
      }
    } catch (error) {
      console.error('❌ Failed to load user data:', error)
      retryCount++
      if (retryCount < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, 3000))
      }
    }
  }
  
  if (retryCount >= maxRetries && userCards.value.length === 0) {
    console.warn('⚠️ Unable to load cards after multiple retries, may need manual refresh')
    // Can show a prompt to the user here
  }
}

const handleDepositSuccess = async (data) => {
  console.log('💰 Deposit success event triggered, received data:', data)
  console.log('💰 Starting balance refresh...')
  
  try {
    // Refresh immediately to get latest data
    console.log('🔄 Immediately attempting to refresh balance...')
    await loadUserData()
    
    // Print current card balance for debugging
    const currentCard = userCards.value.find(card => card.tokenId === selectedTokenId.value?.toString())
    if (currentCard) {
      console.log('📊 Current card balance:', currentCard.balance)
    }
    
    // Add delay to ensure blockchain state update
    await new Promise(resolve => setTimeout(resolve, 3000))
    
    // Refresh again
    console.log('🔄 Second balance refresh...')
    await loadUserData()
    
    // Print updated card balance for debugging
    const updatedCard = userCards.value.find(card => card.tokenId === selectedTokenId.value?.toString())
    if (updatedCard) {
      console.log('📊 Updated card balance:', updatedCard.balance)
    }
    
    console.log('✅ Balance refresh completed')
  } catch (error) {
    console.error('❌ Balance refresh failed:', error)
  }
}

const handleManualRefuelSuccess = async () => {
  console.log('⚡️ Manual refuel successful, starting balance refresh...')
  await new Promise(resolve => setTimeout(resolve, 2000))
  await loadUserData()
  console.log('✅ Balance updated')
}

const handleAutoRefuelSuccess = async () => {
  console.log('🔥 Auto refuel successful, starting balance refresh...')
  await new Promise(resolve => setTimeout(resolve, 2000))
  await loadUserData()
  console.log('✅ Balance updated')
}

const handleError = (error) => {
  console.error('Operation failed:', error)
  // You can add toast notification here
}

// New: Card selection on click
const selectCard = (tokenId) => {
  selectedTokenId.value = tokenId
  showGasExchange.value = true
  console.log('🎯 Selected card:', tokenId, 'show Gas Exchange Management')
  
  // Remove auto-scroll effect
}

// New: Get selected card
const getSelectedCard = () => {
  if (!selectedTokenId.value) return null
  return userCards.value.find(card => card.tokenId === selectedTokenId.value)
}

// New: Get selected card balance
const getSelectedCardBalance = () => {
  const card = getSelectedCard()
  return card ? card.balance : '0'
}

// New: Chain name mapping
const getChainName = (chainId) => {
  return SUPPORTED_CHAINS[chainId]?.name || 'Unknown Chain'
}

// New: Get target chain native token symbol
const getChainNativeSymbol = (chainId) => {
  return SUPPORTED_CHAINS[chainId]?.nativeSymbol || 'ETH'
}

// New: Calculate actual received amount (using real quote)
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
    console.error('❌ Failed to calculate actual amount:', error)
    quoteError.value = error.message
    // Return fallback calculation (deduct 0.5% fee)
    const fee = parseFloat(amount) * 0.005
    const fallbackAmount = (parseFloat(amount) - fee).toFixed(6)
    actualAmount.value = fallbackAmount
    return fallbackAmount
  } finally {
    isLoadingQuote.value = false
  }
}

// New: Filter chain list
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

// New: Select chain function
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

// New: Image error handling
const handleImageError = (event) => {
  console.log('Image load failed:', event.target.src)
  
  // Try using fallback image source
  const currentSrc = event.target.src
  if (currentSrc.includes('cryptologos.cc')) {
    // If cryptologos.cc fails, try using CoinGecko
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

// New: Image load success handling
const handleImageLoad = (event) => {
  // Hide emoji fallback when image loads successfully
  const parent = event.target.parentElement
  if (parent) {
    const emojiSpan = parent.querySelector('.emoji-fallback')
    if (emojiSpan) {
      emojiSpan.style.display = 'none'
    }
  }
}

// New: Current Token ID (use selected Token ID)
const currentTokenId = computed(() => {
  return selectedTokenId.value || (userCards.value.length > 0 ? userCards.value[0].tokenId : null)
})

// New: Current card balance
const currentCardBalance = computed(() => {
  if (!currentTokenId.value) return 0
  const card = userCards.value.find(card => card.tokenId === currentTokenId.value)
  return card ? parseFloat(card.balance) : 0
})

// New: Quick button function
const setExchangeAmount = (percentage) => {
  const amount = (currentCardBalance.value * percentage / 100).toFixed(2)
  manualRefuel.value.amount = amount
}

// New: Split wallet address into four segments
const getAddressSegment = (index) => {
  if (!account.value) return 'Not Connected'
  
  const address = account.value
  if (address.length < 8) return address
  
  // Remove 0x prefix
  const cleanAddress = address.startsWith('0x') ? address.slice(2) : address
  
  // 4 characters per segment
  const segmentLength = Math.ceil(cleanAddress.length / 4)
  const start = index * segmentLength
  const end = Math.min(start + segmentLength, cleanAddress.length)
  
  return cleanAddress.slice(start, end).toUpperCase()
}

// New: Execute manual exchange
const executeManualRefuel = async () => {
  if (!canExecuteManualRefuel.value) return
  
  try {
    console.log('🚀 Executing manual exchange:', manualRefuel.value)
    
    // Check if Token ID is selected
    if (!currentTokenId.value) {
      throw new Error('Please select a GasPass card first')
    }
    
    // Check if balance is sufficient
    const exchangeAmount = parseFloat(manualRefuel.value.amount)
    if (exchangeAmount > currentCardBalance.value) {
      throw new Error(`Insufficient balance! Current balance: ${currentCardBalance.value.toFixed(2)} USDC`)
    }
    
    // Use gasPassService to execute manual exchange
    const result = await gasPassService.manualRefuel({
      tokenId: currentTokenId.value,
      targetChainId: manualRefuel.value.chainId,
      gasAmount: exchangeAmount,
      recipientAddress: manualRefuel.value.recipient
    })
    
    if (!result.success) {
      throw new Error(result.error)
    }
    
    console.log('✅ Exchange successful:', result)
    
    // Reset form after success
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
    alert('Exchange failed: ' + error.message)
  }
}

// New: Setup Agent monitoring
const setupAgentRefuel = async () => {
  if (!canSetupAgentRefuel.value) return
  
  try {
    // Get PKP address
    const pkpAddress = getStoredPkpEthAddress()
    if (!pkpAddress) {
      alert('Please login to Vincent first to get PKP address')
      return
    }
    
    // Check wallet connection
    if (!account.value) {
      alert('Please connect wallet first')
      return
    }
    
    // Check if Token ID exists
    if (!currentTokenId.value) {
      alert('Please create a GasPass card first')
      return
    }
    
    // Validate input values
    if (!agentRefuel.value.threshold || !agentRefuel.value.amount) {
      alert('Please fill in complete Agent settings')
      return
    }
    
    // Convert to numbers and validate
    const thresholdNum = parseFloat(agentRefuel.value.threshold)
    const amountNum = parseFloat(agentRefuel.value.amount)
    
    if (isNaN(thresholdNum) || isNaN(amountNum) || thresholdNum <= 0 || amountNum <= 0) {
      alert('Please enter valid values')
      return
    }
    
    // Convert USDC to smallest unit (1 USDC = 1000000 smallest units)
    const thresholdInWei = parseUnits(thresholdNum.toString(), 6) // USDC has 6 decimals
    const amountInWei = parseUnits(amountNum.toString(), 6)
    
    console.log('Setting up Agent monitoring:', {
      tokenId: currentTokenId.value,
      chainId: agentRefuel.value.chainId,
      threshold: agentRefuel.value.threshold,
      amount: agentRefuel.value.amount,
      thresholdInWei: thresholdInWei.toString(),
      amountInWei: amountInWei.toString(),
      agent: pkpAddress
    })
    
     // Check if agent mapping is correct
     console.log('🔧 Checking Agent mapping...')
     const { gaspassRead } = contractService.getContracts()
     
     // Add retry mechanism
     let agentToWallet = null
     let retryCount = 0
     const maxRetries = 3
     
     while (retryCount < maxRetries && agentToWallet === null) {
       try {
         agentToWallet = await gaspassRead.agentToWallet(pkpAddress)
         console.log('🔍 Agent mapping status:', { 
           pkpAddress, 
           currentWallet: account.value, 
           mappedWallet: agentToWallet 
         })
         break
       } catch (error) {
         retryCount++
         console.warn(`⚠️ Failed to get Agent mapping (attempt ${retryCount}/${maxRetries}):`, error.message)
        
        if (retryCount < maxRetries) {
          console.log('⏳ Waiting 1 second before retry...')
          await new Promise(resolve => setTimeout(resolve, 1000))
        } else {
          console.error('❌ Failed to get Agent mapping, skipping check')
          // If unable to get mapping, skip check and proceed directly
          agentToWallet = account.value // Assume mapping is correct
         }
       }
     }
     
     if (agentToWallet && agentToWallet.toLowerCase() !== account.value.toLowerCase()) {
      throw new Error(`PKP Agent address ${pkpAddress} is already bound to another wallet ${agentToWallet}. Please use the same wallet or re-login to Vincent.`)
    }
    
    console.log('✅ Agent mapping check passed')
    
    // If Agent is not bound, bind it first
    if (!agentToWallet || agentToWallet === '0x0000000000000000000000000000000000000000') {
      console.log('🔧 Agent not bound, binding first...')
      const bindResult = await contractService.setAgentToWallet(pkpAddress, account.value)
      if (!bindResult.success) {
        throw new Error(`Agent binding failed: ${bindResult.error}`)
      }
      console.log('✅ Agent binding successful')
    }
    
    // Set refuel policy
    console.log('🔧 Setting Refuel Policy...')
    console.log('🔍 Signer address (user wallet):', account.value)
    console.log('🔍 Agent address (PKP):', pkpAddress)
    console.log('🔍 Token owner check: signer must be token owner')
     
     const result = await contractService.setRefuelPolicy(
      currentTokenId.value, // Current Token ID
      agentRefuel.value.chainId, // Target chain ID
      amountInWei.toString(), // Refuel amount (USDC smallest unit)
      thresholdInWei.toString(), // Trigger threshold (USDC smallest unit)
      pkpAddress // PKP address as agent
     )
    
    console.log('Agent policy setting result:', result)
    
    // Check result
    if (!result.success) {
      throw new Error(result.error || 'Setup failed')
    }
    
    // Update Agent status
    agentStatus.value = {
      active: true,
      lastCheck: new Date().toLocaleString()
    }
    
    // Show success modal
    const chainName = getChainName(agentRefuel.value.chainId)
    agentSetSuccessData.value = {
      chainName: chainName,
      threshold: agentRefuel.value.threshold,
      amount: agentRefuel.value.amount
    }
    showAgentSetSuccess.value = true
    
  } catch (error) {
    console.error('Agent setup failed:', error)
    alert('Setup failed: ' + error.message)
  }
}

// New: Load Agent status
const loadAgentStatus = async () => {
  try {
    // This will load Agent status from backend
    // Temporarily using mock data
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
  // Try to restore Vincent JWT from localStorage (avoid state loss after refresh)
  loadFromStorage()

  // Check and clear mismatched JWT
  const currentOrigin = window.location.origin
  console.log('🔍 Current page origin:', currentOrigin)
  console.log('🔍 Current page href:', window.location.href)
  
  // Check if JWT in localStorage matches current origin
  const storedJwt = localStorage.getItem('VINCENT_AUTH_JWT')
  if (storedJwt) {
    try {
      // Try parsing JWT payload to check audience
      const payload = JSON.parse(atob(storedJwt.split('.')[1]))
      console.log('🔍 Stored JWT payload:', payload)
      console.log('🔍 JWT audience:', payload.aud)
      
      if (payload.aud && payload.aud !== currentOrigin + '/') {
        console.warn('⚠️ JWT audience mismatch, clearing old JWT')
        console.warn('⚠️ Expected:', currentOrigin + '/', 'Actual:', payload.aud)
        localStorage.removeItem('VINCENT_AUTH_JWT')
        localStorage.removeItem('VINCENT_AUTH_JWT_DECODED')
        localStorage.removeItem('VINCENT_PKP_ETH_ADDRESS')
      }
    } catch (e) {
      console.warn('⚠️ Unable to parse stored JWT, clearing it')
      localStorage.removeItem('VINCENT_AUTH_JWT')
      localStorage.removeItem('VINCENT_AUTH_JWT_DECODED')
      localStorage.removeItem('VINCENT_PKP_ETH_ADDRESS')
    }
  }

  // Check local JWT validity first regardless of wallet connection (expired ones will be automatically cleared)
  try {
    await ensureAuth(currentOrigin, { allowRedirect: false })
  } catch (e) {
    console.error('Vincent JWT check failed:', e)
  }

  if (isConnected.value) {
    try {
      const currentOrigin = window.location.origin
      const result = await ensureAuth(currentOrigin, { allowRedirect: false })
      if (!result.needsRedirect) {
        await loadUserData()
      }
    } catch (e) {
      console.error('Vincent Auth initialization failed:', e)
      await loadUserData()
    }
  } else {
    console.log('🔍 Wallet not connected, waiting for connection...')
  }

  // Don't actively open wallet UI when returning; auto-reconnect handled by wagmi autoConnect/reconnect
  
  // Fill current wallet address by default
  if (account.value) {
    manualRefuel.value.recipient = account.value
  }
})

// Monitor wallet connection and trigger Vincent login flow
watch(isConnected, async (connected) => {
  console.log('🔍 isConnected changed:', connected)
  if (connected) {
    try {
      const currentOrigin = window.location.origin
      const result = await ensureAuth(currentOrigin, { allowRedirect: false })
      if (!result.needsRedirect) {
        await loadUserData()
      }
    } catch (e) {
      console.error('Vincent Auth startup failed:', e)
      await loadUserData()
    }
  }
})

// Monitor account changes to ensure data is loaded after wallet connection
watch(account, async (newAccount, oldAccount) => {
  console.log('🔍 account changed:', { newAccount, oldAccount, isConnected: isConnected.value })
  if (newAccount && isConnected.value) {
    console.log('🔍 New account detected, attempting to load user data...')
    // Update Manual Exchange default address
    manualRefuel.value.recipient = newAccount
    // Delay slightly to ensure provider and signer are updated
    setTimeout(async () => {
      await loadUserData()
    }, 1000)
  }
})

// Monitor manual exchange parameter changes and auto-update quote
watch([() => manualRefuel.value.amount, () => manualRefuel.value.chainId], async ([amount, chainId]) => {
  if (amount && chainId && account.value) {
    console.log('🔄 Parameters changed, updating quote:', { amount, chainId })
    await calculateActualAmount(amount)
  }
}, { deep: true })

// Trigger Vincent login (redirect) from UI
const handleVincentConnect = async () => {
  try {
    const currentOrigin = window.location.origin
    await ensureAuth(currentOrigin, { allowRedirect: true })
  } catch (e) {
    console.error('Vincent login startup failed:', e)
  }
}

// Pre-redirect confirmation and preferences
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
/* Card background design */
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

/* Premium card styles */
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

/* Animation effects */
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

/* Button styles */
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

/* New: Tab switching animation */
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

/* New: Form input style enhancements */
input:focus,
select:focus {
  @apply ring-2 ring-emerald-500/20 border-emerald-400;
}

/* New: Button hover effect enhancements */
button:not(:disabled):hover {
  transform: translateY(-1px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}

button:not(:disabled):active {
  transform: translateY(0);
}

/* New: Card hover effects */
.card-item-enhanced:hover {
  transform: translateY(-2px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
}

/* New: Gradient background animation */
@keyframes gradient-shift {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

.bg-gradient-animated {
  background-size: 200% 200%;
  animation: gradient-shift 3s ease infinite;
}

/* New: Glow effect animation */
@keyframes glow-pulse {
  0%, 100% { box-shadow: 0 0 20px rgba(16, 185, 129, 0.3); }
  50% { box-shadow: 0 0 40px rgba(16, 185, 129, 0.6); }
}

.glow-pulse {
  animation: glow-pulse 2s ease-in-out infinite;
}

/* New: Loading animation */
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

/* New: Hide number input arrows */
input[type="number"]::-webkit-outer-spin-button,
input[type="number"]::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

input[type="number"] {
  -moz-appearance: textfield;
  appearance: textfield;
}

/* New: Responsive design enhancements */
@media (max-width: 768px) {
  .card-item-enhanced {
    @apply p-4;
  }
  
  .grid-cols-1.lg\\:grid-cols-2 {
    @apply gap-4;
  }
}



/* Wallet address styles */
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

/* New: Dark mode support (reserved) */
@media (prefers-color-scheme: dark) {
  .card-item-enhanced {
    @apply bg-slate-800/50 border-emerald-400/30;
  }
}

/* Modal window styles */
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

/* Professional status information styles */
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
