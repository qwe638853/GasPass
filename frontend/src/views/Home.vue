<template>
  <Layout>
    <!-- Hero Section -->
    <section class="relative min-h-screen bg-gradient-to-br from-slate-800 via-slate-900 to-gray-900 overflow-hidden">
      <!-- Enhanced Background Elements -->
      <div class="absolute inset-0 overflow-hidden">
        <!-- Animated gradient orbs -->
        <div class="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-emerald-200/20 to-teal-300/20 rounded-full blur-3xl animate-float-slow"></div>
        <div class="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-cyan-200/15 to-emerald-300/15 rounded-full blur-3xl animate-float-reverse"></div>
        <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-teal-100/8 to-emerald-200/8 rounded-full blur-3xl animate-pulse-slow"></div>
        
        <!-- Additional floating elements -->
        <div class="absolute top-20 left-20 w-32 h-32 bg-gradient-to-br from-emerald-300/15 to-teal-400/15 rounded-full blur-2xl animate-float-delayed"></div>
        <div class="absolute bottom-20 right-20 w-24 h-24 bg-gradient-to-br from-cyan-300/20 to-emerald-400/20 rounded-full blur-xl animate-float-slow"></div>
        
        <!-- Particle system -->
        <div class="particles-container">
          <div class="particle" v-for="n in 20" :key="n" :style="getParticleStyle(n)"></div>
        </div>
        
        <!-- Grid pattern overlay -->
        <div class="absolute inset-0 bg-grid-pattern opacity-10"></div>
      </div>

      <div class="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div class="text-center">

          <!-- Main Heading -->
          <h1 class="text-5xl sm:text-7xl font-bold text-white mb-8 leading-tight">
            <span class="bg-gradient-to-r from-emerald-400 to-teal-500 bg-clip-text text-transparent">
              GasPass
            </span>
            <br>
            <span class="text-3xl sm:text-5xl text-emerald-100 font-light">
              跨鏈 Gas 管理的新時代
            </span>
          </h1>

          <!-- Subtitle -->
          <p class="text-xl sm:text-2xl text-emerald-100 mb-12 max-w-4xl mx-auto leading-relaxed">
            基於 <span class="text-emerald-300 font-semibold">ERC-3525</span> 技術的創新儲值卡系統，
            讓您輕鬆管理多鏈 Gas 費用，享受真正的
            <span class="text-teal-300 font-semibold">無 Gas 體驗</span>
          </p>

          <!-- CTA Buttons -->
          <div class="flex flex-col sm:flex-row gap-6 justify-center mb-16">
            <router-link to="/card-management" class="btn-primary-hero group relative overflow-hidden">
              <!-- Glow effect -->
              <div class="absolute inset-0 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-xl blur-lg opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>
              <!-- Button content -->
              <span class="relative flex items-center justify-center gap-3 z-10">
                <svg class="w-6 h-6 group-hover:rotate-12 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
                </svg>
                開始使用 GasPass
                <svg class="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path>
                </svg>
              </span>
              <!-- Shimmer effect -->
              <div class="absolute inset-0 -top-2 -left-2 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 group-hover:animate-shimmer"></div>
            </router-link>
            <router-link to="/gas-exchange" class="btn-secondary-hero group relative overflow-hidden">
              <!-- Subtle glow effect -->
              <div class="absolute inset-0 bg-gradient-to-r from-emerald-100/20 to-teal-100/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <!-- Button content -->
              <span class="relative flex items-center justify-center gap-3 z-10">
                <svg class="w-6 h-6 group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                </svg>
                兌換 Gas
              </span>
            </router-link>
          </div>

          <!-- Stats -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div class="stat-card group">
              <div class="stat-card-glow"></div>
              <div class="stat-number group-hover:scale-110 transition-transform duration-300">ERC-3525</div>
              <div class="stat-label">創新儲值卡技術</div>
              <div class="stat-icon">💎</div>
            </div>
            <div class="stat-card group">
              <div class="stat-card-glow"></div>
              <div class="stat-number group-hover:scale-110 transition-transform duration-300">0 Gas</div>
              <div class="stat-label">無 Gas 操作體驗</div>
              <div class="stat-icon">⚡</div>
            </div>
            <div class="stat-card group">
              <div class="stat-card-glow"></div>
              <div class="stat-number group-hover:scale-110 transition-transform duration-300">AI Agent</div>
              <div class="stat-label">智能自動管理</div>
              <div class="stat-icon">🤖</div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section class="py-24 bg-gradient-to-br from-slate-800/50 to-gray-900/50 backdrop-blur-xl">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-20">
          <h2 class="text-4xl sm:text-5xl font-bold text-white mb-6">
            為什麼選擇 <span class="bg-gradient-to-r from-emerald-400 to-teal-500 bg-clip-text text-transparent">GasPass</span>
          </h2>
          <p class="text-xl text-emerald-100 max-w-3xl mx-auto">
            革命性的跨鏈 Gas 管理解決方案，讓您的 DeFi 體驗更加順暢無憂
          </p>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <!-- Feature 1 -->
          <div class="feature-card-modern group relative overflow-hidden">
            <!-- Card glow effect -->
            <div class="absolute inset-0 bg-gradient-to-br from-emerald-100/30 to-teal-100/30 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <!-- Card content -->
            <div class="relative z-10">
              <div class="feature-icon-modern bg-gradient-to-br from-emerald-400 to-teal-500 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                <svg class="w-8 h-8 text-white group-hover:animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
                </svg>
              </div>
              <h3 class="text-xl font-bold text-white mb-3 group-hover:text-emerald-300 transition-colors duration-300">ERC-3525 儲值卡</h3>
              <p class="text-emerald-100 leading-relaxed group-hover:text-emerald-200 transition-colors duration-300">
                基於最新 ERC-3525 標準的創新儲值卡設計，支援轉贈和靈活的價值管理
              </p>
            </div>
            <!-- Shimmer effect -->
            <div class="absolute inset-0 -top-2 -left-2 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12 group-hover:animate-shimmer opacity-0 group-hover:opacity-100"></div>
          </div>
          
          <!-- Feature 2 -->
          <div class="feature-card-modern group">
            <div class="feature-icon-modern bg-gradient-to-br from-cyan-500 to-emerald-500">
              <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
              </svg>
            </div>
            <h3 class="text-xl font-bold text-white mb-3">智能自動補充</h3>
            <p class="text-emerald-100 leading-relaxed">
              設定閾值後自動監控並補充 Gas，確保您的交易永不因 Gas 不足而失敗
            </p>
          </div>
          
          <!-- Feature 3 -->
          <div class="feature-card-modern group">
            <div class="feature-icon-modern bg-gradient-to-br from-teal-500 to-emerald-500">
              <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <h3 class="text-xl font-bold text-white mb-3">真正的無 Gas 體驗</h3>
            <p class="text-emerald-100 leading-relaxed">
              透過 EIP-712 簽名機制實現無 Gas 操作，即使沒有 Arbitrum Gas 也能使用服務
            </p>
          </div>
          
          <!-- Feature 4 -->
          <div class="feature-card-modern group">
            <div class="feature-icon-modern bg-gradient-to-br from-emerald-500 to-teal-500">
              <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
              </svg>
            </div>
            <h3 class="text-xl font-bold text-white mb-3">AI Agent 智能監控</h3>
            <p class="text-emerald-100 leading-relaxed">
              整合 Lit Protocol 的 AI Agent，提供智能的跨鏈 Gas 管理策略
            </p>
          </div>
          
          <!-- Feature 5 -->
          <div class="feature-card-modern group">
            <div class="feature-icon-modern bg-gradient-to-br from-teal-500 to-cyan-500">
              <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
              </svg>
            </div>
            <h3 class="text-xl font-bold text-white mb-3">多鏈橋接支援</h3>
            <p class="text-emerald-100 leading-relaxed">
              整合 Avail SDK 和 debridge 等多種橋接協議，支援主流區塊鏈網路
            </p>
          </div>
          
          <!-- Feature 6 -->
          <div class="feature-card-modern group">
            <div class="feature-icon-modern bg-gradient-to-br from-emerald-600 to-teal-600">
              <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
              </svg>
            </div>
            <h3 class="text-xl font-bold text-white mb-3">企業級安全</h3>
            <p class="text-emerald-100 leading-relaxed">
              經過完整的安全審計，採用業界標準的加密技術保護您的資產安全
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- How it works -->
    <section class="py-24 bg-gradient-to-br from-slate-700/30 to-gray-800/30 backdrop-blur-xl">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-20">
          <h2 class="text-4xl sm:text-5xl font-bold text-white mb-6">
            簡單三步驟
          </h2>
          <p class="text-xl text-emerald-100 max-w-3xl mx-auto">
            輕鬆解決跨鏈 Gas 問題，享受無憂的 DeFi 體驗
          </p>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div class="text-center group">
            <div class="step-number-modern group-hover:scale-110 transition-transform duration-300">
              <span class="step-text">1</span>
            </div>
            <h3 class="text-2xl font-bold text-white mb-4">鑄造儲值卡</h3>
            <p class="text-emerald-100 leading-relaxed">
              使用 USDC 鑄造您的專屬 GasPass 儲值卡，開始您的跨鏈 Gas 管理之旅
            </p>
          </div>
          
          <div class="text-center group">
            <div class="step-number-modern group-hover:scale-110 transition-transform duration-300">
              <span class="step-text">2</span>
            </div>
            <h3 class="text-2xl font-bold text-white mb-4">設定策略</h3>
            <p class="text-emerald-100 leading-relaxed">
              選擇手動補充或設定自動補充策略，讓 AI Agent 為您智能管理 Gas 費用
            </p>
          </div>
          
          <div class="text-center group">
            <div class="step-number-modern group-hover:scale-110 transition-transform duration-300">
              <span class="step-text">3</span>
            </div>
            <h3 class="text-2xl font-bold text-white mb-4">享受便利</h3>
            <p class="text-emerald-100 leading-relaxed">
              無需擔心 Gas 不足問題，專注於您的 DeFi 操作和投資策略
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="py-24 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 relative overflow-hidden">
      <div class="absolute inset-0 bg-black/10"></div>
      <div class="relative z-10 max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
        <h2 class="text-4xl sm:text-5xl font-bold text-white mb-6">
          準備好體驗無憂的跨鏈交易了嗎？
        </h2>
        <p class="text-xl text-emerald-100 mb-12 max-w-3xl mx-auto">
          立即開始使用 GasPass，讓複雜的跨鏈 Gas 管理變得簡單輕鬆
        </p>
        <div class="flex flex-col sm:flex-row gap-6 justify-center">
          <router-link to="/card-management" class="btn-cta-primary group">
            <span class="flex items-center justify-center gap-3">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
              </svg>
              開始使用 GasPass
              <svg class="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path>
              </svg>
            </span>
          </router-link>
          <router-link to="/gas-exchange" class="btn-cta-secondary group">
            <span class="flex items-center justify-center gap-3">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
              </svg>
              兌換 Gas
            </span>
          </router-link>
        </div>
      </div>
    </section>
  </Layout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import Layout from '../components/Layout.vue'

// Particle system
const getParticleStyle = (index) => {
  const size = Math.random() * 4 + 2
  const x = Math.random() * 100
  const y = Math.random() * 100
  const delay = Math.random() * 5
  const duration = Math.random() * 10 + 10
  
  return {
    position: 'absolute',
    width: `${size}px`,
    height: `${size}px`,
    left: `${x}%`,
    top: `${y}%`,
    background: 'linear-gradient(45deg, #37b694, #5ee4b9)',
    borderRadius: '50%',
    opacity: Math.random() * 0.6 + 0.2,
    animation: `float-particle ${duration}s ${delay}s infinite linear`,
    pointerEvents: 'none'
  }
}

onMounted(() => {
  // Add any initialization logic here
})
</script>

<style scoped>
/* Hero Buttons */
.btn-primary-hero {
  @apply bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold py-4 px-8 rounded-xl text-lg transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-emerald-500/30 focus:ring-offset-2 shadow-lg hover:shadow-xl hover:scale-105 backdrop-blur-sm;
}

.btn-secondary-hero {
  @apply bg-white/10 backdrop-blur-md border-2 border-emerald-300/30 hover:border-emerald-400 text-white hover:text-emerald-200 font-bold py-4 px-8 rounded-xl text-lg transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-emerald-500/30 focus:ring-offset-2 hover:bg-emerald-500/20;
}

/* Stats Cards */
.stat-card {
  @apply bg-white/10 backdrop-blur-md border border-emerald-300/30 rounded-2xl p-6 text-center hover:shadow-2xl transition-all duration-500 hover:border-emerald-400 relative overflow-hidden;
}

.stat-number {
  @apply text-3xl font-bold text-white mb-2;
}

.stat-label {
  @apply text-emerald-100 text-sm;
}

/* Feature Cards */
.feature-card-modern {
  @apply bg-white/10 backdrop-blur-md p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-emerald-300/20 hover:border-emerald-400/40 hover:-translate-y-2;
}

.feature-icon-modern {
  @apply w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shadow-lg;
}

/* Step Numbers */
.step-number-modern {
  @apply w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-2xl flex items-center justify-center text-3xl font-bold mx-auto mb-6 shadow-lg backdrop-blur-sm;
}

.step-text {
  @apply drop-shadow-lg;
}

/* CTA Buttons */
.btn-cta-primary {
  @apply bg-white/20 backdrop-blur-md hover:bg-white/30 text-emerald-600 font-bold py-4 px-8 rounded-xl text-lg transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-white/30 focus:ring-offset-2 shadow-lg hover:shadow-xl hover:scale-105 border border-white/20;
}

.btn-cta-secondary {
  @apply bg-white/10 backdrop-blur-sm border-2 border-white/30 hover:border-white/50 text-white font-bold py-4 px-8 rounded-xl text-lg transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-white/30 focus:ring-offset-2 hover:bg-white/20;
}

/* Enhanced Animations */
@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
}

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

@keyframes float-delayed {
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-20px) rotate(180deg); }
}

@keyframes pulse-slow {
  0%, 100% { transform: scale(1); opacity: 0.1; }
  50% { transform: scale(1.1); opacity: 0.2; }
}

@keyframes shimmer {
  0% { transform: translateX(-100%) skewX(-12deg); }
  100% { transform: translateX(200%) skewX(-12deg); }
}

@keyframes float-particle {
  0% { transform: translateY(100vh) rotate(0deg); opacity: 0; }
  10% { opacity: 1; }
  90% { opacity: 1; }
  100% { transform: translateY(-100px) rotate(360deg); opacity: 0; }
}

.animate-float {
  animation: float 3s ease-in-out infinite;
}

.animate-float-slow {
  animation: float-slow 8s ease-in-out infinite;
}

.animate-float-reverse {
  animation: float-reverse 6s ease-in-out infinite;
}

.animate-float-delayed {
  animation: float-delayed 10s ease-in-out infinite;
}

.animate-pulse-slow {
  animation: pulse-slow 4s ease-in-out infinite;
}

.animate-shimmer {
  animation: shimmer 2s ease-in-out;
}

/* Grid pattern */
.bg-grid-pattern {
  background-image: 
    linear-gradient(rgba(55, 182, 148, 0.1) 1px, transparent 1px),
    linear-gradient(90deg, rgba(55, 182, 148, 0.1) 1px, transparent 1px);
  background-size: 20px 20px;
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

/* Enhanced stat cards */
.stat-card {
  @apply bg-white/10 backdrop-blur-md border border-emerald-300/30 rounded-2xl p-6 text-center hover:shadow-2xl transition-all duration-500 hover:border-emerald-400 relative overflow-hidden;
}

.stat-card-glow {
  @apply absolute inset-0 bg-gradient-to-br from-emerald-100/20 to-teal-100/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500;
}

.stat-icon {
  @apply text-2xl mb-2 group-hover:scale-125 transition-transform duration-300;
}
</style>