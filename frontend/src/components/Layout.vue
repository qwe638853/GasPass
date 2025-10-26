<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-800 via-slate-900 to-gray-900 overflow-hidden metallic-bg">
    <!-- Enhanced Background Elements -->
    <div class="absolute inset-0 overflow-hidden">
      <!-- Metallic gradient overlays -->
      <div class="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-teal-500/5"></div>
      <div class="absolute inset-0 bg-gradient-to-tl from-cyan-400/3 via-transparent to-emerald-400/3"></div>
      
      <!-- Metallic particle system -->
      <div class="particles-container">
        <div class="particle metallic-particle" v-for="n in 30" :key="n" :style="getParticleStyle(n)"></div>
      </div>
      
      <!-- Metallic grid pattern overlay -->
      <div class="absolute inset-0 bg-metallic-grid opacity-15"></div>
      
      <!-- Tech Grid Lines -->
      <div class="tech-grid-lines">
        <div class="grid-line horizontal" v-for="n in 8" :key="`h-${n}`" :style="getGridLineStyle('horizontal', n)"></div>
        <div class="grid-line vertical" v-for="n in 12" :key="`v-${n}`" :style="getGridLineStyle('vertical', n)"></div>
      </div>
      
      <!-- Floating Tech Elements -->
      <div class="tech-elements">
        <div class="tech-element" v-for="n in 6" :key="n" :style="getTechElementStyle(n)">
        </div>
      </div>
      
      <!-- Data Streams -->
      <div class="data-streams">
        <div class="data-stream" v-for="n in 4" :key="n" :style="getDataStreamStyle(n)"></div>
      </div>
      
      <!-- Holographic Effects -->
      <div class="holographic-overlay"></div>
      
      <!-- Metallic Wave Lines -->
      <div class="metallic-waves">
        <div class="wave-line wave-1"></div>
        <div class="wave-line wave-2"></div>
        <div class="wave-line wave-3"></div>
        <div class="wave-line wave-4"></div>
      </div>
    </div>

    <!-- Navigation -->
    <nav class="bg-transparent backdrop-blur-xl sticky top-0 z-50 transition-all duration-300 metallic-nav relative">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-20">
          <!-- Logo -->
          <div class="flex items-center -ml-2">
            <router-link to="/" class="flex items-center space-x-3">
              <img src="../assets/GaspassLogo-removebg.png" alt="GasPass" class="h-20 w-auto logo-fluorescent" />
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
                Home
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
                Card Management
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
                Exchange Gas
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
                Gift Cards
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
          <div class="hidden md:flex items-center space-x-4 justify-end">
            <!-- Network Status -->
            <div v-if="isConnected" class="network-status">
              <div v-if="isArbitrum" class="nav-link group relative overflow-hidden">
                <div class="absolute inset-0 bg-gradient-to-r from-emerald-100/50 to-teal-100/50 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <span class="relative flex items-center gap-2 z-10 justify-end">
                  <div class="w-2 h-2 rounded-full bg-emerald-500"></div>
                  <span class="text-sm font-medium">Arbitrum</span>
                </span>
              </div>
              <div v-else class="nav-link group relative overflow-hidden">
                <div class="absolute inset-0 bg-gradient-to-r from-red-100/50 to-pink-100/50 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <span class="relative flex items-center gap-2 z-10 justify-end">
                  <div class="w-2 h-2 rounded-full bg-red-500"></div>
                  <span class="text-sm font-medium">Wrong Network</span>
                  <button @click="switchToArbitrum" class="ml-2 px-2 py-1 bg-red-500 hover:bg-red-600 text-white text-xs rounded-lg transition-colors">
                    Switch
                  </button>
                </span>
              </div>
            </div>
            
            
            <!-- Web3Modal Button -->
            <div v-if="!isConnected" class="web3modal-container">
              <button @click="connectWallet" class="nav-link group relative overflow-hidden">
                <div class="absolute inset-0 bg-gradient-to-r from-emerald-100/50 to-teal-100/50 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <span class="relative flex items-center gap-2 z-10">
                  <svg class="w-4 h-4 group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path>
                  </svg>
                  Connect Wallet
                </span>
              </button>
            </div>
            
            <!-- Connected Wallet -->
            <div v-else class="wallet-info">
              <div class="nav-link group relative overflow-hidden">
                <div class="absolute inset-0 bg-gradient-to-r from-emerald-100/50 to-teal-100/50 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <span class="relative flex items-center gap-3 z-10">
                  <div class="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center">
                    <div class="w-3 h-3 bg-white rounded-full"></div>
                  </div>
                  <div class="wallet-details text-right">
                    <div class="wallet-address text-sm font-medium">{{ formatAddress(account) }}</div>
                    <div class="wallet-status text-xs text-emerald-600">Connected</div>
                  </div>
                </span>
              </div>
              <button 
                @click="disconnectWallet"
                class="nav-link group relative overflow-hidden"
                title="Disconnect Wallet"
              >
                <div class="absolute inset-0 bg-gradient-to-r from-red-100/50 to-pink-100/50 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <span class="relative flex items-center gap-2 z-10">
                  <svg class="w-4 h-4 group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
                  </svg>
                </span>
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
              Home
            </router-link>
            <router-link to="/card-management" class="mobile-nav-link" @click="showMobileMenu = false">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path>
              </svg>
              Card Management
            </router-link>
            <router-link to="/gas-exchange" class="mobile-nav-link" @click="showMobileMenu = false">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
              </svg>
              Exchange Gas
            </router-link>
          </div>
          
          <!-- Mobile Wallet Section -->
          <div class="mobile-wallet-section">
            <div v-if="!isConnected" class="mobile-wallet-card">
              <button @click="connectWallet" class="mobile-connect-btn">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path>
                </svg>
                Connect Wallet
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
                    <div class="mobile-wallet-status">Connected</div>
                  </div>
                </div>
                
                <button @click="disconnectWallet" class="mobile-disconnect-btn">
                  Disconnect Wallet
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
    
    <!-- Main Content -->
    <main class="flex-1 relative z-10">
      <slot />
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useWeb3 } from '../composables/useWeb3'

const showMobileMenu = ref(false)

const { account, chainId, isConnected, isArbitrum, connectWallet, disconnectWallet, switchToArbitrum, formatAddress } = useWeb3()

// Metallic particle system
const getParticleStyle = (index) => {
  const size = Math.random() * 6 + 3
  const x = Math.random() * 100
  const y = Math.random() * 100
  const delay = Math.random() * 5
  const duration = Math.random() * 15 + 10
  
  // Metallic colors
  const metallicColors = [
    'linear-gradient(45deg, #37b694, #5ee4b9, #ffffff)',
    'linear-gradient(45deg, #10b981, #34d399, #6ee7b7)',
    'linear-gradient(45deg, #059669, #10b981, #34d399)',
    'linear-gradient(45deg, #047857, #059669, #10b981)'
  ]
  
  return {
    position: 'absolute',
    width: `${size}px`,
    height: `${size}px`,
    left: `${x}%`,
    top: `${y}%`,
    background: metallicColors[Math.floor(Math.random() * metallicColors.length)],
    borderRadius: '50%',
    opacity: Math.random() * 0.8 + 0.3,
    animation: `metallic-float-particle ${duration}s ${delay}s infinite linear`,
    pointerEvents: 'none',
    boxShadow: '0 0 10px rgba(55, 182, 148, 0.5), inset 0 0 5px rgba(255, 255, 255, 0.3)',
    filter: 'blur(0.5px)'
  }
}

// Tech Animation Functions
const getGridLineStyle = (type, index) => {
  const delay = Math.random() * 3
  const duration = Math.random() * 4 + 6
  
  if (type === 'horizontal') {
    return {
      position: 'absolute',
      top: `${(index - 1) * 12.5}%`,
      left: '0',
      width: '100%',
      height: '1px',
      background: 'linear-gradient(90deg, transparent, rgba(55, 182, 148, 0.6), transparent)',
      animation: `grid-line-horizontal ${duration}s ${delay}s infinite ease-in-out`,
      pointerEvents: 'none'
    }
  } else {
    return {
      position: 'absolute',
      left: `${(index - 1) * 8.33}%`,
      top: '0',
      width: '1px',
      height: '100%',
      background: 'linear-gradient(180deg, transparent, rgba(55, 182, 148, 0.6), transparent)',
      animation: `grid-line-vertical ${duration}s ${delay}s infinite ease-in-out`,
      pointerEvents: 'none'
    }
  }
}

const getTechElementStyle = (index) => {
  const size = Math.random() * 20 + 15
  const x = Math.random() * 100
  const y = Math.random() * 100
  const delay = Math.random() * 5
  const duration = Math.random() * 8 + 6
  
  return {
    position: 'absolute',
    width: `${size}px`,
    height: `${size}px`,
    left: `${x}%`,
    top: `${y}%`,
    animation: `tech-element-float ${duration}s ${delay}s infinite ease-in-out`,
    pointerEvents: 'none',
    opacity: Math.random() * 0.6 + 0.3
  }
}

const getDataStreamStyle = (index) => {
  const width = Math.random() * 3 + 2
  const delay = Math.random() * 2
  const duration = Math.random() * 3 + 4
  
  const positions = [
    { top: '20%', left: '10%', angle: '45deg' },
    { top: '60%', left: '80%', angle: '135deg' },
    { top: '40%', left: '20%', angle: '90deg' },
    { top: '80%', left: '70%', angle: '0deg' }
  ]
  
  const pos = positions[index - 1] || positions[0]
  
  return {
    position: 'absolute',
    width: `${width}px`,
    height: '200px',
    top: pos.top,
    left: pos.left,
    background: 'linear-gradient(180deg, transparent, rgba(94, 228, 185, 0.8), transparent)',
    animation: `data-stream-flow ${duration}s ${delay}s infinite ease-in-out`,
    pointerEvents: 'none',
    transform: `rotate(${pos.angle})`,
    opacity: Math.random() * 0.7 + 0.3
  }
}

onMounted(() => {
  // Component mounted
})

// Watch for connection changes
watch([isConnected, isArbitrum], (newValues, oldValues) => {
  console.log('Layout: Connection state changed', {
    isConnected: newValues[0],
    isArbitrum: newValues[1],
    account: account.value,
    chainId: chainId.value
  })
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
  @apply flex items-center gap-2 text-white/80 hover:text-emerald-300 hover:bg-white/10 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 hover:scale-105;
}

.nav-link-active {
  @apply text-emerald-300 bg-white/10 shadow-sm;
}

.mobile-menu-btn {
  @apply p-2 text-white/80 hover:text-white transition-colors;
}

/* Wallet Info */
.wallet-info {
  @apply flex items-center gap-3;
}

.wallet-details {
  @apply flex flex-col;
}

.wallet-address {
  @apply text-sm font-medium text-white/90;
}

.wallet-status {
  @apply text-xs text-emerald-300;
}

.disconnect-btn {
  @apply p-2 text-gray-400 hover:text-red-600 transition-colors;
}

/* Mobile Menu */
.mobile-menu {
  @apply hidden bg-transparent backdrop-blur-md shadow-lg;
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
  @apply flex items-center gap-3 text-white/80 hover:text-emerald-300 hover:bg-white/10 px-4 py-3 rounded-xl font-medium transition-all duration-300;
}

/* Mobile Wallet */
.mobile-wallet-section {
  @apply pt-6;
}

.mobile-wallet-card {
  @apply bg-white/10 backdrop-blur-md rounded-xl p-4;
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
  @apply font-medium text-white/90;
}

.mobile-wallet-status {
  @apply text-sm text-emerald-300;
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
  @apply w-full bg-white/10 hover:bg-white/20 text-white/90 font-semibold py-2 px-4 rounded-xl transition-all duration-300;
}

/* Web3Modal styles - completely rewritten */
.web3modal-container {
  @apply relative;
}

/* Completely override Web3Modal button styles */
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

/* Remove all inner element styles */
.web3modal-container :deep(w3m-button) * {
  background: transparent !important;
  border: none !important;
  box-shadow: none !important;
  color: white !important;
  font-weight: 600 !important;
}

/* Ensure button content styles */
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

/* Remove any possible inner containers */
.web3modal-container :deep(w3m-button) > div,
.web3modal-container :deep(w3m-button) > span {
  background: transparent !important;
  border: none !important;
  box-shadow: none !important;
  display: inline !important;
}

/* Custom connect button styles */
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

/* Metallic Navigation */
.metallic-nav {
  position: relative;
  overflow: hidden;
}

.metallic-nav::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(55, 182, 148, 0.05), transparent);
  animation: metallic-sweep 12s ease-in-out infinite;
}

@keyframes metallic-sweep {
  0% { left: -100%; }
  50% { left: 100%; }
  100% { left: -100%; }
}

/* Metallic Background */
.metallic-bg {
  background: 
    linear-gradient(135deg, #1e293b 0%, #334155 25%, #475569 50%, #334155 75%, #1e293b 100%),
    radial-gradient(circle at 20% 80%, rgba(55, 182, 148, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, rgba(20, 184, 166, 0.1) 0%, transparent 50%);
  background-size: 100% 100%, 800px 800px, 600px 600px;
  animation: metallic-shift 20s ease-in-out infinite;
}

/* Metallic Grid */
.bg-metallic-grid {
  background-image: 
    linear-gradient(rgba(55, 182, 148, 0.1) 1px, transparent 1px),
    linear-gradient(90deg, rgba(55, 182, 148, 0.1) 1px, transparent 1px),
    linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px);
  background-size: 50px 50px, 50px 50px, 10px 10px, 10px 10px;
}

/* Particle container */
.particles-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  overflow: hidden;
}

/* Tech Animation Styles */
.tech-grid-lines {
  @apply absolute inset-0 pointer-events-none;
}

.grid-line {
  @apply absolute;
}

.tech-elements {
  @apply absolute inset-0 pointer-events-none;
}

.tech-element {
  @apply absolute flex items-center justify-center;
}

.data-streams {
  @apply absolute inset-0 pointer-events-none;
}

.data-stream {
  @apply absolute;
}

.holographic-overlay {
  @apply absolute inset-0 pointer-events-none;
  background: 
    radial-gradient(circle at 20% 20%, rgba(55, 182, 148, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 80% 80%, rgba(20, 184, 166, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 40% 60%, rgba(94, 228, 185, 0.05) 0%, transparent 50%);
  animation: holographic-shift 15s ease-in-out infinite;
}

/* Metallic Wave Lines */
.metallic-waves {
  @apply absolute top-0 right-0 w-1/3 h-1/2 pointer-events-none;
}

.wave-line {
  @apply absolute;
  background: linear-gradient(135deg, 
    transparent 0%, 
    rgba(55, 182, 148, 0.1) 20%, 
    rgba(94, 228, 185, 0.3) 50%, 
    rgba(55, 182, 148, 0.1) 80%, 
    transparent 100%);
  filter: blur(1px);
  animation: wave-flow 8s ease-in-out infinite;
}

.wave-1 {
  top: 10%;
  right: 5%;
  width: 200px;
  height: 2px;
  animation-delay: 0s;
  transform: rotate(-15deg);
}

.wave-2 {
  top: 20%;
  right: 10%;
  width: 180px;
  height: 2px;
  animation-delay: 2s;
  transform: rotate(-10deg);
}

.wave-3 {
  top: 30%;
  right: 8%;
  width: 160px;
  height: 2px;
  animation-delay: 4s;
  transform: rotate(-20deg);
}

.wave-4 {
  top: 40%;
  right: 12%;
  width: 140px;
  height: 2px;
  animation-delay: 6s;
  transform: rotate(-5deg);
}

/* Metallic Animations */
@keyframes metallic-shift {
  0%, 100% { background-position: 0% 0%, 0% 0%, 100% 100%; }
  50% { background-position: 100% 100%, 100% 100%, 0% 0%; }
}

@keyframes metallic-float-particle {
  0% { transform: translateY(100vh) rotate(0deg) scale(0.5); opacity: 0; }
  10% { opacity: 1; transform: scale(1); }
  90% { opacity: 1; transform: scale(1); }
  100% { transform: translateY(-100px) rotate(360deg) scale(0.5); opacity: 0; }
}

/* Tech Animations */
@keyframes grid-line-horizontal {
  0%, 100% { 
    opacity: 0; 
    transform: scaleX(0); 
  }
  50% { 
    opacity: 0.8; 
    transform: scaleX(1); 
  }
}

@keyframes grid-line-vertical {
  0%, 100% { 
    opacity: 0; 
    transform: scaleY(0); 
  }
  50% { 
    opacity: 0.8; 
    transform: scaleY(1); 
  }
}

@keyframes tech-element-float {
  0%, 100% { 
    transform: translateY(0) rotate(0deg) scale(1); 
    opacity: 0.3; 
  }
  25% { 
    transform: translateY(-20px) rotate(90deg) scale(1.1); 
    opacity: 0.6; 
  }
  50% { 
    transform: translateY(-40px) rotate(180deg) scale(1.2); 
    opacity: 0.8; 
  }
  75% { 
    transform: translateY(-20px) rotate(270deg) scale(1.1); 
    opacity: 0.6; 
  }
}

@keyframes data-stream-flow {
  0% { 
    opacity: 0; 
    transform: translateY(-100px) scaleY(0.5); 
  }
  50% { 
    opacity: 0.8; 
    transform: translateY(0) scaleY(1); 
  }
  100% { 
    opacity: 0; 
    transform: translateY(100px) scaleY(0.5); 
  }
}

@keyframes wave-flow {
  0%, 100% { 
    opacity: 0.2; 
    transform: scaleX(0.8) translateX(20px); 
  }
  50% { 
    opacity: 0.8; 
    transform: scaleX(1.2) translateX(-10px); 
  }
}

@keyframes holographic-shift {
  0%, 100% { 
    background-position: 0% 0%, 100% 100%, 50% 50%; 
  }
  33% { 
    background-position: 100% 0%, 0% 100%, 25% 75%; 
  }
  66% { 
    background-position: 0% 100%, 100% 0%, 75% 25%; 
  }
}

/* Logo Fluorescent Effect */
.logo-fluorescent {
  filter: 
    drop-shadow(0 0 15px rgba(55, 182, 148, 1))
    drop-shadow(0 0 25px rgba(94, 228, 185, 0.8))
    drop-shadow(0 0 35px rgba(55, 182, 148, 0.6))
    drop-shadow(0 0 45px rgba(94, 228, 185, 0.4))
    brightness(1.2)
    contrast(1.2);
  animation: logo-fluorescent-glow 4s ease-in-out infinite;
  transition: all 0.3s ease;
}

.logo-fluorescent:hover {
  filter: 
    drop-shadow(0 0 20px rgba(55, 182, 148, 1))
    drop-shadow(0 0 30px rgba(94, 228, 185, 1))
    drop-shadow(0 0 40px rgba(55, 182, 148, 0.8))
    drop-shadow(0 0 50px rgba(94, 228, 185, 0.6))
    drop-shadow(0 0 60px rgba(55, 182, 148, 0.4))
    brightness(1.3)
    contrast(1.3);
  transform: scale(1.05);
}

@keyframes logo-fluorescent-glow {
  0%, 100% { 
    filter: 
      drop-shadow(0 0 15px rgba(55, 182, 148, 1))
      drop-shadow(0 0 25px rgba(94, 228, 185, 0.8))
      drop-shadow(0 0 35px rgba(55, 182, 148, 0.6))
      drop-shadow(0 0 45px rgba(94, 228, 185, 0.4))
      brightness(1.2)
      contrast(1.2);
  }
  50% { 
    filter: 
      drop-shadow(0 0 18px rgba(55, 182, 148, 1))
      drop-shadow(0 0 28px rgba(94, 228, 185, 0.9))
      drop-shadow(0 0 38px rgba(55, 182, 148, 0.7))
      drop-shadow(0 0 48px rgba(94, 228, 185, 0.5))
      brightness(1.25)
      contrast(1.25);
  }
}
</style>