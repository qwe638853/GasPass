<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
    <!-- Navigation -->
    <nav class="bg-emerald-500/10 backdrop-blur-xl shadow-xl border-b border-emerald-300/30 sticky top-0 z-40 transition-all duration-300 hover:shadow-2xl">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-20">
          <!-- Logo -->
          <div class="flex items-center -ml-2">
            <router-link to="/" class="flex items-center space-x-3">
              <img src="../assets/GaspassLogo-removebg.png" alt="GasPass" class="h-20 w-auto" />
            </router-link>
          </div>
          
          <!-- Navigation Links -->
          <div class="hidden md:flex items-center space-x-1">
            <router-link 
              to="/" 
              class="nav-link group relative overflow-hidden"
              :class="{ 'nav-link-active': $route.name === 'Home' }"
            >
              <div class="absolute inset-0 bg-gradient-to-r from-emerald-100/50 to-teal-100/50 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <span class="relative flex items-center gap-2 z-10">
                <svg class="w-4 h-4 group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
                </svg>
                首頁
              </span>
            </router-link>
            <router-link 
              to="/card-management" 
              class="nav-link group relative overflow-hidden"
              :class="{ 'nav-link-active': $route.name === 'CardManagement' }"
            >
              <div class="absolute inset-0 bg-gradient-to-r from-emerald-100/50 to-teal-100/50 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <span class="relative flex items-center gap-2 z-10">
                <svg class="w-4 h-4 group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path>
                </svg>
                儲值卡管理
              </span>
            </router-link>
            <router-link 
              to="/gas-exchange" 
              class="nav-link group relative overflow-hidden"
              :class="{ 'nav-link-active': $route.name === 'GasExchange' }"
            >
              <div class="absolute inset-0 bg-gradient-to-r from-emerald-100/50 to-teal-100/50 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <span class="relative flex items-center gap-2 z-10">
                <svg class="w-4 h-4 group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                </svg>
                兌換Gas
              </span>
            </router-link>
            <router-link 
              to="/gift-cards" 
              class="nav-link group relative overflow-hidden"
              :class="{ 'nav-link-active': $route.name === 'GiftCards' }"
            >
              <div class="absolute inset-0 bg-gradient-to-r from-emerald-100/50 to-teal-100/50 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <span class="relative flex items-center gap-2 z-10">
                <svg class="w-4 h-4 group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"></path>
                </svg>
                贈送儲值卡
              </span>
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
            
            <!-- Web3Modal Button -->
            <div v-if="!isConnected" class="web3modal-container">
              <button @click="connectWallet" class="custom-connect-btn">
                <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path>
                </svg>
                連接錢包
              </button>
            </div>
            
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
            <router-link to="/card-management" class="mobile-nav-link" @click="showMobileMenu = false">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path>
              </svg>
              儲值卡管理
            </router-link>
            <router-link to="/gas-exchange" class="mobile-nav-link" @click="showMobileMenu = false">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
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
watch([isConnected, isArbitrum], (newValues, oldValues) => {
  console.log('Layout: Connection state changed', {
    isConnected: newValues[0],
    isArbitrum: newValues[1],
    account: account.value,
    chainId: chainId.value
  })
  loadBalance()
})

// Watch account changes
watch(account, (newAccount, oldAccount) => {
  console.log('Layout: Account changed', { newAccount, oldAccount })
})

// Watch isConnected changes
watch(isConnected, (newConnected, oldConnected) => {
  console.log('Layout: isConnected changed', { newConnected, oldConnected })
})
</script>

<style scoped>
/* Logo */
.logo-container {
  @apply flex items-center gap-3;
}

.logo-icon {
  @apply text-3xl;
}

.logo-text {
  @apply font-bold text-2xl;
}

.logo-gas {
  @apply text-slate-800;
}

.logo-pass {
  @apply bg-gradient-to-r from-amber-500 to-orange-600 bg-clip-text text-transparent;
}

/* Navigation */
.nav-link {
  @apply flex items-center gap-2 text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 hover:scale-105;
}

.nav-link-active {
  @apply text-emerald-600 bg-gradient-to-r from-emerald-50 to-teal-50 shadow-sm;
}

.mobile-menu-btn {
  @apply p-2 text-gray-600 hover:text-gray-800 transition-colors;
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
  @apply flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-xl;
}

.balance-icon {
  @apply text-lg;
}

.balance-amount {
  @apply font-bold text-gray-800;
}

.balance-label {
  @apply text-xs text-gray-600;
}

/* Wallet Connection */
.connect-btn {
  @apply flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-amber-500/30 focus:ring-offset-2 shadow-lg hover:shadow-xl hover:scale-105;
  background: linear-gradient(135deg, #f59e0b, #d97706);
  box-shadow: 0 4px 15px rgba(245, 158, 11, 0.3);
}

.connect-btn:hover {
  background: linear-gradient(135deg, #d97706, #b45309);
  box-shadow: 0 6px 20px rgba(245, 158, 11, 0.4);
  transform: translateY(-2px) scale(1.02);
}

.wallet-info {
  @apply flex items-center gap-3;
}

.wallet-display {
  @apply flex items-center gap-3 bg-gray-50 px-3 py-2 rounded-xl;
}

.wallet-avatar {
  @apply w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center;
}

.avatar-dot {
  @apply w-3 h-3 bg-white rounded-full;
}

.wallet-details {
  @apply flex flex-col;
}

.wallet-address {
  @apply text-sm font-medium text-gray-800;
}

.wallet-status {
  @apply text-xs text-gray-600;
}

.disconnect-btn {
  @apply p-2 text-gray-400 hover:text-red-600 transition-colors;
}

/* Mobile Menu */
.mobile-menu {
  @apply hidden bg-emerald-500/10 backdrop-blur-md border-t border-emerald-300/30 shadow-lg;
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
  @apply flex items-center gap-3 text-gray-700 hover:text-emerald-600 hover:bg-emerald-50 px-4 py-3 rounded-xl font-medium transition-all duration-300;
}

/* Mobile Wallet */
.mobile-wallet-section {
  @apply border-t border-gray-200 pt-6;
}

.mobile-wallet-card {
  @apply bg-gray-50 rounded-xl p-4;
}

.mobile-connect-btn {
  @apply flex items-center justify-center gap-2 w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl;
  background: linear-gradient(135deg, #f59e0b, #d97706);
  box-shadow: 0 4px 15px rgba(245, 158, 11, 0.3);
}

.mobile-connect-btn:hover {
  background: linear-gradient(135deg, #d97706, #b45309);
  box-shadow: 0 6px 20px rgba(245, 158, 11, 0.4);
  transform: translateY(-2px) scale(1.02);
}

.mobile-wallet-info {
  @apply space-y-4;
}

.mobile-wallet-header {
  @apply flex items-center gap-3;
}

.mobile-avatar {
  @apply w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center;
}

.mobile-avatar-dot {
  @apply w-4 h-4 bg-white rounded-full;
}

.mobile-wallet-details {
  @apply flex-1;
}

.mobile-wallet-address {
  @apply font-medium text-gray-800;
}

.mobile-wallet-status {
  @apply text-sm text-gray-600;
}

.mobile-balance {
  @apply flex justify-between items-center;
}

.mobile-balance-label {
  @apply text-sm text-gray-600;
}

.mobile-balance-amount {
  @apply font-bold text-gray-800;
}

.mobile-network-warning {
  @apply space-y-2;
}

.warning-text {
  @apply text-sm text-red-600 font-medium;
}

.mobile-switch-btn {
  @apply w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl;
}

.mobile-disconnect-btn {
  @apply w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded-xl transition-all duration-300;
}

/* Web3Modal 樣式 - 完全重寫 */
.web3modal-container {
  @apply relative;
}

/* 完全覆蓋 Web3Modal 按鈕樣式 */
.web3modal-container :deep(w3m-button) {
  background: linear-gradient(135deg, #f59e0b, #d97706) !important;
  border: none !important;
  border-radius: 12px !important;
  padding: 12px 24px !important;
  font-weight: 600 !important;
  color: white !important;
  box-shadow: 0 4px 15px rgba(245, 158, 11, 0.3) !important;
  transition: all 0.3s ease !important;
  position: relative !important;
  overflow: hidden !important;
}

.web3modal-container :deep(w3m-button):hover {
  background: linear-gradient(135deg, #d97706, #b45309) !important;
  box-shadow: 0 6px 20px rgba(245, 158, 11, 0.4) !important;
  transform: translateY(-2px) scale(1.02) !important;
}

/* 移除所有內層元素樣式 */
.web3modal-container :deep(w3m-button) * {
  background: transparent !important;
  border: none !important;
  box-shadow: none !important;
  color: white !important;
  font-weight: 600 !important;
}

/* 確保按鈕內容樣式 */
.web3modal-container :deep(w3m-button) span,
.web3modal-container :deep(w3m-button) div,
.web3modal-container :deep(w3m-button) p {
  color: white !important;
  font-weight: 600 !important;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1) !important;
  background: transparent !important;
  border: none !important;
  margin: 0 !important;
  padding: 0 !important;
}

/* 移除任何可能的內層容器 */
.web3modal-container :deep(w3m-button) > div,
.web3modal-container :deep(w3m-button) > span {
  background: transparent !important;
  border: none !important;
  box-shadow: none !important;
  display: inline !important;
}

/* 自定義連接按鈕樣式 */
.custom-connect-btn {
  @apply flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-amber-500/30 focus:ring-offset-2 shadow-lg hover:shadow-xl hover:scale-105;
  background: linear-gradient(135deg, #f59e0b, #d97706);
  box-shadow: 0 4px 15px rgba(245, 158, 11, 0.3);
}

.custom-connect-btn:hover {
  background: linear-gradient(135deg, #d97706, #b45309);
  box-shadow: 0 6px 20px rgba(245, 158, 11, 0.4);
  transform: translateY(-2px) scale(1.02);
}
</style>