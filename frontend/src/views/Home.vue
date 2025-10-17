<template>
  <Layout>
    <!-- Hero Section -->
    <section class="relative bg-gradient-to-br from-gray-50 to-gray-100 py-20">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center">
          <div class="flex justify-center mb-8">
            <img src="../assets/GasPass.png" alt="GasPass" class="h-24 w-auto" />
          </div>
          <h1 class="text-4xl sm:text-6xl font-bold text-gray-900 mb-6">
            跨鏈 Gas 管理的
            <span class="text-orange-500">全新解決方案</span>
          </h1>
          <p class="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            透過 ERC-3525 儲值卡技術，讓您輕鬆管理多鏈 Gas 費用。支援自動補充、手動轉帳和 AI Agent 智能監控，讓跨鏈交易變得簡單無憂。
          </p>
          <div class="flex flex-col sm:flex-row gap-4 justify-center">
            <router-link to="/mint" class="btn-primary-large">
              立即開始
            </router-link>
            <a href="#features" class="btn-secondary-large">
              了解更多
            </a>
          </div>
        </div>
      </div>
      
      <!-- Background decoration -->
      <div class="absolute inset-0 overflow-hidden pointer-events-none">
        <div class="absolute -top-40 -right-40 w-80 h-80 bg-orange-100 rounded-full opacity-20"></div>
        <div class="absolute -bottom-40 -left-40 w-80 h-80 bg-gray-200 rounded-full opacity-20"></div>
      </div>
    </section>

    <!-- Features Section -->
    <section id="features" class="py-20 bg-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-16">
          <h2 class="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            核心功能特色
          </h2>
          <p class="text-lg text-gray-600 max-w-2xl mx-auto">
            GasPass 提供完整的跨鏈 Gas 管理解決方案，讓您的 DeFi 體驗更加順暢
          </p>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <!-- Feature 1 -->
          <div class="feature-card">
            <div class="feature-icon bg-orange-100">
              <svg class="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
              </svg>
            </div>
            <h3 class="text-xl font-semibold text-gray-900 mb-3">ERC-3525 儲值卡</h3>
            <p class="text-gray-600">
              基於 ERC-3525 標準的創新儲值卡設計，支援轉贈和靈活的價值管理
            </p>
          </div>
          
          <!-- Feature 2 -->
          <div class="feature-card">
            <div class="feature-icon bg-blue-100">
              <svg class="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
              </svg>
            </div>
            <h3 class="text-xl font-semibold text-gray-900 mb-3">自動 Gas 補充</h3>
            <p class="text-gray-600">
              設定閾值後自動監控並補充 Gas，確保您的交易永不因 Gas 不足而失敗
            </p>
          </div>
          
          <!-- Feature 3 -->
          <div class="feature-card">
            <div class="feature-icon bg-green-100">
              <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <h3 class="text-xl font-semibold text-gray-900 mb-3">無 Gas 體驗</h3>
            <p class="text-gray-600">
              透過簽名機制實現無 Gas 操作，即使沒有 Arbitrum Gas 也能使用服務
            </p>
          </div>
          
          <!-- Feature 4 -->
          <div class="feature-card">
            <div class="feature-icon bg-purple-100">
              <svg class="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
              </svg>
            </div>
            <h3 class="text-xl font-semibold text-gray-900 mb-3">AI Agent 智能監控</h3>
            <p class="text-gray-600">
              整合 Lit Protocol 的 AI Agent，提供智能的跨鏈 Gas 管理策略
            </p>
          </div>
          
          <!-- Feature 5 -->
          <div class="feature-card">
            <div class="feature-icon bg-indigo-100">
              <svg class="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
              </svg>
            </div>
            <h3 class="text-xl font-semibold text-gray-900 mb-3">多鏈橋接支援</h3>
            <p class="text-gray-600">
              整合 Avail SDK 和 debridge 等多種橋接協議，支援主流區塊鏈網路
            </p>
          </div>
          
          <!-- Feature 6 -->
          <div class="feature-card">
            <div class="feature-icon bg-red-100">
              <svg class="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
              </svg>
            </div>
            <h3 class="text-xl font-semibold text-gray-900 mb-3">安全可靠</h3>
            <p class="text-gray-600">
              經過完整的安全審計，採用業界標準的加密技術保護您的資產安全
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- How it works -->
    <section class="py-20 bg-gray-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-16">
          <h2 class="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            使用流程
          </h2>
          <p class="text-lg text-gray-600 max-w-2xl mx-auto">
            簡單三步驟，輕鬆解決跨鏈 Gas 問題
          </p>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div class="text-center">
            <div class="step-number">1</div>
            <h3 class="text-xl font-semibold text-gray-900 mb-3">鑄造儲值卡</h3>
            <p class="text-gray-600">
              使用 USDC 鑄造您的專屬 GasPass 儲值卡，開始您的跨鏈 Gas 管理之旅
            </p>
          </div>
          
          <div class="text-center">
            <div class="step-number">2</div>
            <h3 class="text-xl font-semibold text-gray-900 mb-3">設定策略</h3>
            <p class="text-gray-600">
              選擇手動補充或設定自動補充策略，讓 AI Agent 為您智能管理 Gas 費用
            </p>
          </div>
          
          <div class="text-center">
            <div class="step-number">3</div>
            <h3 class="text-xl font-semibold text-gray-900 mb-3">享受便利</h3>
            <p class="text-gray-600">
              無需擔心 Gas 不足問題，專注於您的 DeFi 操作和投資策略
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="py-20 bg-gradient-to-r from-orange-500 to-orange-600">
      <div class="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
        <h2 class="text-3xl sm:text-4xl font-bold text-white mb-6">
          準備好體驗無憂的跨鏈交易了嗎？
        </h2>
        <p class="text-xl text-orange-100 mb-8">
          立即開始使用 GasPass，讓複雜的跨鏈 Gas 管理變得簡單輕鬆
        </p>
        <router-link to="/mint" class="btn-white-large">
          開始使用 GasPass
        </router-link>
      </div>
    </section>
  </Layout>
</template>

<script setup>
import Layout from '../components/Layout.vue'
</script>

<style scoped>
.btn-primary-large {
  @apply bg-orange-500 hover:bg-orange-600 text-white font-semibold py-4 px-8 rounded-lg text-lg transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2;
}

.btn-secondary-large {
  @apply border-2 border-gray-300 hover:border-gray-400 text-gray-700 font-semibold py-4 px-8 rounded-lg text-lg transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2;
}

.btn-white-large {
  @apply bg-white hover:bg-gray-50 text-orange-600 font-semibold py-4 px-8 rounded-lg text-lg transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2;
}

.feature-card {
  @apply bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100;
}

.feature-icon {
  @apply w-16 h-16 rounded-full flex items-center justify-center mb-6;
}

.step-number {
  @apply w-16 h-16 bg-orange-500 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6;
}
</style>