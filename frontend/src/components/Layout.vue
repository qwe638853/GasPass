<template>
  <div class="min-h-screen bg-gaspass-gray-100">
    <!-- Navigation -->
    <nav class="bg-white shadow-lg border-b border-gaspass-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <!-- Logo -->
          <div class="flex items-center">
            <router-link to="/" class="flex items-center space-x-3">
              <div class="logo-container">
                <div class="logo-icon">⛽</div>
                <div class="logo-text">
                  <span class="logo-gas">Gas</span><span class="logo-pass">Pass</span>
                </div>
              </div>
            </router-link>
          </div>
          
          <!-- Navigation Links -->
          <div class="hidden md:flex items-center space-x-1">
            <router-link 
              to="/" 
              class="nav-link"
              :class="{ 'nav-link-active': $route.name === 'Home' }"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
              </svg>
              首頁
            </router-link>
            <router-link 
              to="/wallet-management" 
              class="nav-link"
              :class="{ 'nav-link-active': $route.name === 'WalletManagement' }"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path>
              </svg>
              儲值卡管理
            </router-link>
            <router-link 
              to="/deposit" 
              class="nav-link"
              :class="{ 'nav-link-active': $route.name === 'Deposit' }"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
              </svg>
              測試用
            </router-link>
            <router-link 
              to="/cross-chain-swap" 
              class="nav-link"
              :class="{ 'nav-link-active': $route.name === 'CrossChainSwap' }"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"></path>
              </svg>
              兌換Gas
            </router-link>
          </div>

          <!-- Mobile menu button -->
          <div class="md:hidden flex items-center">
            <button 
              @click="showMobileMenu = !showMobileMenu"
              class="mobile-menu-btn"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
              </svg>
            </button>
          </div>
          
          <!-- Wallet Connection -->
          <div class="hidden md:flex items-center space-x-4">
            <!-- Network Status -->
            <div v-if="isConnected" class="network-status">
              <div v-if="isArbitrum" class="network-indicator arbitrum">
                <div class="network-dot"></div>
                <span class="network-name">Arbitrum</span>
              </div>
              <div v-else class="network-indicator wrong">
                <div class="network-dot"></div>
                <span class="network-name">錯誤網路</span>
                <button @click="switchToArbitrum" class="switch-network-btn">
                  切換
                </button>
              </div>
            </div>
            
            <!-- USDC Balance -->
            <div v-if="isConnected && isArbitrum" class="balance-display">
              <div class="balance-icon">💰</div>
              <div class="balance-info">
                <div class="balance-amount">${{ usdcBalance }}</div>
                <div class="balance-label">USDC</div>
              </div>
            </div>
            
            <!-- Wallet Connection Button -->
            <button 
              v-if="!isConnected" 
              @click="connectWallet"
              class="connect-btn"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path>
              </svg>
              連接錢包
            </button>
            
            <!-- Connected Wallet -->
            <div v-else class="wallet-info">
              <div class="wallet-display">
                <div class="wallet-avatar">
                  <div class="avatar-dot"></div>
                </div>
                <div class="wallet-details">
                  <div class="wallet-address">{{ formatAddress(account) }}</div>
                  <div class="wallet-status">已連接</div>
                </div>
              </div>
              <button 
                @click="disconnectWallet"
                class="disconnect-btn"
                title="斷開錢包"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Mobile menu -->
      <div class="md:hidden mobile-menu" :class="{ 'mobile-menu-open': showMobileMenu }">
        <div class="mobile-menu-content">
          <!-- Mobile Navigation Links -->
          <div class="mobile-nav-links">
            <router-link to="/" class="mobile-nav-link" @click="showMobileMenu = false">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
              </svg>
              首頁
            </router-link>
            <router-link to="/wallet-management" class="mobile-nav-link" @click="showMobileMenu = false">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path>
              </svg>
              儲值卡管理
            </router-link>
            <router-link to="/test" class="mobile-nav-link" @click="showMobileMenu = false">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path>
              </svg>
              測試用
            </router-link>
            <router-link to="/cross-chain-swap" class="mobile-nav-link" @click="showMobileMenu = false">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"></path>
              </svg>
              兌換Gas
            </router-link>
          </div>
          
          <!-- Mobile Wallet Section -->
          <div class="mobile-wallet-section">
            <div v-if="!isConnected" class="mobile-wallet-card">
              <button @click="connectWallet" class="mobile-connect-btn">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path>
                </svg>
                連接錢包
              </button>
            </div>
            
            <div v-else class="mobile-wallet-card">
              <div class="mobile-wallet-info">
                <div class="mobile-wallet-header">
                  <div class="mobile-avatar">
                    <div class="mobile-avatar-dot"></div>
                  </div>
                  <div class="mobile-wallet-details">
                    <div class="mobile-wallet-address">{{ formatAddress(account) }}</div>
                    <div class="mobile-wallet-status">已連接</div>
                  </div>
                </div>
                
                <div v-if="isArbitrum" class="mobile-balance">
                  <div class="mobile-balance-label">USDC 餘額</div>
                  <div class="mobile-balance-amount">${{ usdcBalance }}</div>
                </div>
                
                <div v-else class="mobile-network-warning">
                  <div class="warning-text">請切換到 Arbitrum 網路</div>
                  <button @click="switchToArbitrum" class="mobile-switch-btn">
                    切換網路
                  </button>
                </div>
                
                <button @click="disconnectWallet" class="mobile-disconnect-btn">
                  斷開錢包
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
    
    <!-- Main Content -->
    <main class="flex-1">
      <slot />
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useWeb3 } from '../composables/useWeb3'

const showMobileMenu = ref(false)
const usdcBalance = ref('0.00')

const { account, chainId, isConnected, isArbitrum, connectWallet, disconnectWallet, switchToArbitrum, formatAddress, getUSDCBalance } = useWeb3()

// Load USDC balance
const loadBalance = async () => {
  if (isConnected.value && isArbitrum.value) {
    try {
      usdcBalance.value = await getUSDCBalance()
    } catch (error) {
      console.error('Failed to load USDC balance:', error)
    }
  }
}

onMounted(() => {
  loadBalance()
})

// Watch for connection changes
watch([isConnected, isArbitrum], () => {
  loadBalance()
})
</script>

<style scoped>
/* Logo */
.logo-container {
  @apply flex items-center gap-2;
}

.logo-icon {
  @apply text-2xl;
}

.logo-text {
  @apply font-bold text-xl;
}

.logo-gas {
  @apply text-gaspass-gray-800;
}

.logo-pass {
  @apply text-gaspass-yellow-600;
}

/* Navigation */
.nav-link {
  @apply flex items-center gap-2 text-gaspass-gray-600 hover:text-gaspass-yellow-600 hover:bg-gaspass-yellow-50 px-3 py-2 rounded-lg text-sm font-medium transition-all;
}

.nav-link-active {
  @apply text-gaspass-yellow-600 bg-gaspass-yellow-50;
}

.mobile-menu-btn {
  @apply p-2 text-gaspass-gray-600 hover:text-gaspass-gray-800 transition-colors;
}

/* Network Status */
.network-status {
  @apply flex items-center;
}

.network-indicator {
  @apply flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium;
}

.network-indicator.arbitrum {
  @apply bg-blue-100 text-blue-800;
}

.network-indicator.wrong {
  @apply bg-red-100 text-red-800;
}

.network-dot {
  @apply w-2 h-2 rounded-full;
}

.network-indicator.arbitrum .network-dot {
  @apply bg-blue-500;
}

.network-indicator.wrong .network-dot {
  @apply bg-red-500;
}

.switch-network-btn {
  @apply ml-2 px-2 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded transition-colors;
}

/* Balance Display */
.balance-display {
  @apply flex items-center gap-2 bg-gaspass-gray-50 px-3 py-2 rounded-lg;
}

.balance-icon {
  @apply text-lg;
}

.balance-amount {
  @apply font-bold text-gaspass-gray-800;
}

.balance-label {
  @apply text-xs text-gaspass-gray-600;
}

/* Wallet Connection */
.connect-btn {
  @apply flex items-center gap-2 bg-gaspass-yellow-400 hover:bg-gaspass-yellow-500 text-gaspass-gray-800 font-semibold py-2 px-4 rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-gaspass-yellow-400 focus:ring-offset-2;
}

.wallet-info {
  @apply flex items-center gap-3;
}

.wallet-display {
  @apply flex items-center gap-3 bg-gaspass-gray-50 px-3 py-2 rounded-lg;
}

.wallet-avatar {
  @apply w-8 h-8 rounded-full bg-gaspass-yellow-400 flex items-center justify-center;
}

.avatar-dot {
  @apply w-3 h-3 bg-gaspass-gray-800 rounded-full;
}

.wallet-details {
  @apply flex flex-col;
}

.wallet-address {
  @apply text-sm font-medium text-gaspass-gray-800;
}

.wallet-status {
  @apply text-xs text-gaspass-gray-600;
}

.disconnect-btn {
  @apply p-2 text-gaspass-gray-400 hover:text-red-600 transition-colors;
}

/* Mobile Menu */
.mobile-menu {
  @apply hidden bg-white border-t border-gaspass-gray-200 shadow-lg;
}

.mobile-menu-open {
  @apply block;
}

.mobile-menu-content {
  @apply p-4 space-y-6;
}

.mobile-nav-links {
  @apply space-y-2;
}

.mobile-nav-link {
  @apply flex items-center gap-3 text-gaspass-gray-700 hover:text-gaspass-yellow-600 hover:bg-gaspass-yellow-50 px-4 py-3 rounded-lg font-medium transition-all;
}

/* Mobile Wallet */
.mobile-wallet-section {
  @apply border-t border-gaspass-gray-200 pt-6;
}

.mobile-wallet-card {
  @apply bg-gaspass-gray-50 rounded-xl p-4;
}

.mobile-connect-btn {
  @apply flex items-center justify-center gap-2 w-full bg-gaspass-yellow-400 hover:bg-gaspass-yellow-500 text-gaspass-gray-800 font-semibold py-3 px-4 rounded-lg transition-colors;
}

.mobile-wallet-info {
  @apply space-y-4;
}

.mobile-wallet-header {
  @apply flex items-center gap-3;
}

.mobile-avatar {
  @apply w-10 h-10 rounded-full bg-gaspass-yellow-400 flex items-center justify-center;
}

.mobile-avatar-dot {
  @apply w-4 h-4 bg-gaspass-gray-800 rounded-full;
}

.mobile-wallet-details {
  @apply flex-1;
}

.mobile-wallet-address {
  @apply font-medium text-gaspass-gray-800;
}

.mobile-wallet-status {
  @apply text-sm text-gaspass-gray-600;
}

.mobile-balance {
  @apply flex justify-between items-center;
}

.mobile-balance-label {
  @apply text-sm text-gaspass-gray-600;
}

.mobile-balance-amount {
  @apply font-bold text-gaspass-gray-800;
}

.mobile-network-warning {
  @apply space-y-2;
}

.warning-text {
  @apply text-sm text-red-600 font-medium;
}

.mobile-switch-btn {
  @apply w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors;
}

.mobile-disconnect-btn {
  @apply w-full bg-gaspass-gray-200 hover:bg-gaspass-gray-300 text-gaspass-gray-800 font-semibold py-2 px-4 rounded-lg transition-colors;
}
</style>