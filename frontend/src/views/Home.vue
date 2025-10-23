<template>
  <Layout>
    <!-- Hero Section -->
    <section class="relative min-h-screen bg-gradient-to-br from-slate-800 via-slate-900 to-gray-900 overflow-hidden metallic-bg flex items-center">
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

      <div class="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div class="flex flex-col lg:flex-row items-center gap-8 justify-center">
          <!-- Left Content -->
          <div class="flex-1 lg:flex-none lg:w-2/3 text-left">

            <!-- Main Heading -->
            <h1 class="text-4xl sm:text-5xl font-bold text-white mb-6 leading-tight">
              <span class="bg-gradient-to-r from-emerald-400 to-teal-500 bg-clip-text text-transparent">
                GasPass
              </span>
              <br>
              <span class="text-xl sm:text-2xl text-emerald-100 font-light">
                The New Era of Cross-Chain Gas Management
              </span>
            </h1>

            <!-- Subtitle -->
            <p class="text-lg sm:text-xl text-emerald-100 mb-8 leading-relaxed">
              Innovative prepaid card system based on <span class="text-emerald-300 font-semibold">ERC-3525</span> technology,
              enabling seamless multi-chain Gas management for a truly
              <span class="text-teal-300 font-semibold">Gas-free experience</span>
            </p>

            <!-- CTA Buttons -->
            <div class="flex flex-col sm:flex-row gap-4 mb-8">
            <router-link to="/card-management" class="btn-primary-hero metallic-btn group relative overflow-hidden">
              <!-- Metallic glow effect -->
              <div class="absolute inset-0 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-xl blur-lg opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>
              <!-- Metallic shine overlay -->
              <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12 metallic-shine-overlay"></div>
              <!-- Button content -->
              <span class="relative flex items-center justify-center gap-3 z-10">
                <svg class="w-6 h-6 group-hover:rotate-12 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
                </svg>
                Get Started with GasPass
                <svg class="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path>
                </svg>
              </span>
              <!-- Animated shimmer effect -->
              <div class="absolute inset-0 -top-2 -left-2 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 group-hover:animate-shimmer"></div>
              <!-- Metallic border -->
              <div class="absolute inset-0 rounded-xl border border-emerald-300/50 group-hover:border-emerald-200/80 transition-colors duration-300"></div>
            </router-link>
            <router-link to="/gas-exchange" class="btn-secondary-hero metallic-btn-secondary group relative overflow-hidden">
              <!-- Metallic glow effect -->
              <div class="absolute inset-0 bg-gradient-to-r from-emerald-100/20 to-teal-100/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <!-- Metallic shine overlay -->
              <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 metallic-shine-overlay"></div>
              <!-- Button content -->
              <span class="relative flex items-center justify-center gap-3 z-10">
                <svg class="w-6 h-6 group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                </svg>
                Exchange Gas
              </span>
              <!-- Metallic border -->
              <div class="absolute inset-0 rounded-xl border border-emerald-300/30 group-hover:border-emerald-200/60 transition-colors duration-300"></div>
            </router-link>
          </div>

          </div>

          <!-- Right Content - Gas Tank Animation -->
          <div class="flex-1 lg:flex-none lg:w-1/3 flex justify-center lg:justify-center">
            <div class="grenade-container">
              <div class="grenade">
                <!-- Grenade Head -->
                <div class="grenade-head">
                  <div class="grenade-valve"></div>
                  <div class="grenade-handle"></div>
                </div>
                
                <!-- Grenade Body -->
                <div class="grenade-body">
                  <!-- Energy Level Indicator -->
                  <div class="energy-level">
                    <div class="energy-fill"></div>
                    <div class="energy-particles">
                      <div class="particle" v-for="n in 8" :key="n" :style="getEnergyParticleStyle(n)"></div>
                    </div>
                  </div>
                </div>
                
                <!-- Grenade Base -->
                <div class="grenade-base"></div>
                
                <!-- Gas Flow Animation -->
                <div class="gas-flow">
                  <div class="flow-stream" v-for="n in 3" :key="n" :style="getFlowStreamStyle(n)"></div>
                </div>
                
                <!-- Floating Gas Drops -->
                <div class="gas-drops">
                  <div class="gas-drop" v-for="n in 5" :key="n" :style="getGasDropStyle(n)"></div>
                </div>
              </div>
              
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
            Why Choose <span class="bg-gradient-to-r from-emerald-400 to-teal-500 bg-clip-text text-transparent">GasPass</span>
          </h2>
          <p class="text-xl text-emerald-100 max-w-3xl mx-auto">
            Revolutionary cross-chain Gas management solution for seamless DeFi experience
          </p>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <!-- Feature 1 -->
          <div class="feature-card-modern metallic-feature-card group relative overflow-hidden">
            <!-- Card glow effect -->
            <div class="absolute inset-0 bg-gradient-to-br from-emerald-100/30 to-teal-100/30 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <!-- Metallic border -->
            <div class="metallic-border"></div>
            <!-- Metallic shine -->
            <div class="metallic-shine"></div>
            <!-- Card content -->
            <div class="relative z-10">
              <div class="feature-icon-modern metallic-icon bg-gradient-to-br from-emerald-400 to-teal-500 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                <svg class="w-8 h-8 text-white group-hover:animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
                </svg>
              </div>
              <h3 class="text-xl font-bold text-white mb-3 group-hover:text-emerald-300 transition-colors duration-300">ERC-3525 Prepaid Cards</h3>
              <p class="text-emerald-100 leading-relaxed group-hover:text-emerald-200 transition-colors duration-300">
                Innovative prepaid card design based on the latest ERC-3525 standard, supporting transfers and flexible value management
              </p>
            </div>
            <!-- Shimmer effect -->
            <div class="absolute inset-0 -top-2 -left-2 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12 group-hover:animate-shimmer opacity-0 group-hover:opacity-100"></div>
          </div>
          
          <!-- Feature 2 -->
          <div class="feature-card-modern metallic-feature-card group relative overflow-hidden">
            <!-- Card glow effect -->
            <div class="absolute inset-0 bg-gradient-to-br from-emerald-100/30 to-teal-100/30 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <!-- Metallic border -->
            <div class="metallic-border"></div>
            <!-- Metallic shine -->
            <div class="metallic-shine"></div>
            <!-- Card content -->
            <div class="relative z-10">
              <div class="feature-icon-modern metallic-icon bg-gradient-to-br from-cyan-500 to-emerald-500 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                <svg class="w-8 h-8 text-white group-hover:animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                </svg>
              </div>
              <h3 class="text-xl font-bold text-white mb-3 group-hover:text-emerald-300 transition-colors duration-300">Smart Auto-Refill</h3>
              <p class="text-emerald-100 leading-relaxed group-hover:text-emerald-200 transition-colors duration-300">
                Set thresholds for automatic monitoring and refilling of Gas, ensuring your transactions never fail due to insufficient Gas
              </p>
            </div>
            <!-- Shimmer effect -->
            <div class="absolute inset-0 -top-2 -left-2 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12 group-hover:animate-shimmer opacity-0 group-hover:opacity-100"></div>
          </div>
          
          <!-- Feature 3 -->
          <div class="feature-card-modern metallic-feature-card group relative overflow-hidden">
            <!-- Card glow effect -->
            <div class="absolute inset-0 bg-gradient-to-br from-emerald-100/30 to-teal-100/30 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <!-- Metallic border -->
            <div class="metallic-border"></div>
            <!-- Metallic shine -->
            <div class="metallic-shine"></div>
            <!-- Card content -->
            <div class="relative z-10">
              <div class="feature-icon-modern metallic-icon bg-gradient-to-br from-teal-500 to-emerald-500 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                <svg class="w-8 h-8 text-white group-hover:animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <h3 class="text-xl font-bold text-white mb-3 group-hover:text-emerald-300 transition-colors duration-300">True Gas-Free Experience</h3>
              <p class="text-emerald-100 leading-relaxed group-hover:text-emerald-200 transition-colors duration-300">
                Achieve Gas-free operations through EIP-712 signature mechanism, enabling service usage even without Arbitrum Gas
              </p>
            </div>
            <!-- Shimmer effect -->
            <div class="absolute inset-0 -top-2 -left-2 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12 group-hover:animate-shimmer opacity-0 group-hover:opacity-100"></div>
          </div>
          
          <!-- Feature 4 -->
          <div class="feature-card-modern metallic-feature-card group relative overflow-hidden">
            <!-- Card glow effect -->
            <div class="absolute inset-0 bg-gradient-to-br from-emerald-100/30 to-teal-100/30 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <!-- Metallic border -->
            <div class="metallic-border"></div>
            <!-- Metallic shine -->
            <div class="metallic-shine"></div>
            <!-- Card content -->
            <div class="relative z-10">
              <div class="feature-icon-modern metallic-icon bg-gradient-to-br from-emerald-500 to-teal-500 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                <svg class="w-8 h-8 text-white group-hover:animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
                </svg>
              </div>
              <h3 class="text-xl font-bold text-white mb-3 group-hover:text-emerald-300 transition-colors duration-300">AI Agent Smart Monitoring</h3>
              <p class="text-emerald-100 leading-relaxed group-hover:text-emerald-200 transition-colors duration-300">
                Integrated Lit Protocol AI Agent providing intelligent cross-chain Gas management strategies
              </p>
            </div>
            <!-- Shimmer effect -->
            <div class="absolute inset-0 -top-2 -left-2 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12 group-hover:animate-shimmer opacity-0 group-hover:opacity-100"></div>
          </div>
          
          <!-- Feature 5 -->
          <div class="feature-card-modern metallic-feature-card group relative overflow-hidden">
            <!-- Card glow effect -->
            <div class="absolute inset-0 bg-gradient-to-br from-emerald-100/30 to-teal-100/30 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <!-- Metallic border -->
            <div class="metallic-border"></div>
            <!-- Metallic shine -->
            <div class="metallic-shine"></div>
            <!-- Card content -->
            <div class="relative z-10">
              <div class="feature-icon-modern metallic-icon bg-gradient-to-br from-teal-500 to-cyan-500 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                <svg class="w-8 h-8 text-white group-hover:animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                </svg>
              </div>
              <h3 class="text-xl font-bold text-white mb-3 group-hover:text-emerald-300 transition-colors duration-300">Multi-Chain Bridge Support</h3>
              <p class="text-emerald-100 leading-relaxed group-hover:text-emerald-200 transition-colors duration-300">
                Integrated Avail SDK and debridge protocols supporting mainstream blockchain networks
              </p>
            </div>
            <!-- Shimmer effect -->
            <div class="absolute inset-0 -top-2 -left-2 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12 group-hover:animate-shimmer opacity-0 group-hover:opacity-100"></div>
          </div>
          
          <!-- Feature 6 -->
          <div class="feature-card-modern metallic-feature-card group relative overflow-hidden">
            <!-- Card glow effect -->
            <div class="absolute inset-0 bg-gradient-to-br from-emerald-100/30 to-teal-100/30 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <!-- Metallic border -->
            <div class="metallic-border"></div>
            <!-- Metallic shine -->
            <div class="metallic-shine"></div>
            <!-- Card content -->
            <div class="relative z-10">
              <div class="feature-icon-modern metallic-icon bg-gradient-to-br from-emerald-600 to-teal-600 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                <svg class="w-8 h-8 text-white group-hover:animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                </svg>
              </div>
              <h3 class="text-xl font-bold text-white mb-3 group-hover:text-emerald-300 transition-colors duration-300">Enterprise-Grade Security</h3>
              <p class="text-emerald-100 leading-relaxed group-hover:text-emerald-200 transition-colors duration-300">
                Complete security audit with industry-standard encryption technology protecting your assets
              </p>
            </div>
            <!-- Shimmer effect -->
            <div class="absolute inset-0 -top-2 -left-2 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12 group-hover:animate-shimmer opacity-0 group-hover:opacity-100"></div>
          </div>
        </div>
      </div>
    </section>

  </Layout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import Layout from '../components/Layout.vue'

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

// Gas Tank Animation Functions
const getEnergyParticleStyle = (index) => {
  const size = Math.random() * 3 + 2
  const x = Math.random() * 80 + 10
  const y = Math.random() * 60 + 20
  const delay = Math.random() * 2
  const duration = Math.random() * 3 + 2
  
  return {
    position: 'absolute',
    width: `${size}px`,
    height: `${size}px`,
    left: `${x}%`,
    top: `${y}%`,
    background: 'radial-gradient(circle, #5ee4b9, #37b694)',
    borderRadius: '50%',
    opacity: Math.random() * 0.8 + 0.4,
    animation: `energy-bubble ${duration}s ${delay}s infinite ease-in-out`,
    pointerEvents: 'none',
    boxShadow: '0 0 8px rgba(94, 228, 185, 0.6)'
  }
}

const getFlowStreamStyle = (index) => {
  const width = Math.random() * 2 + 1
  const delay = Math.random() * 1
  const duration = Math.random() * 2 + 1.5
  
  return {
    position: 'absolute',
    width: `${width}px`,
    height: '40px',
    left: `${20 + index * 15}%`,
    top: '0',
    background: 'linear-gradient(to bottom, transparent, #5ee4b9, transparent)',
    opacity: Math.random() * 0.6 + 0.4,
    animation: `gas-flow-stream ${duration}s ${delay}s infinite ease-in-out`,
    pointerEvents: 'none',
    borderRadius: '2px'
  }
}

const getGasDropStyle = (index) => {
  const size = Math.random() * 4 + 3
  const x = Math.random() * 100
  const delay = Math.random() * 3
  const duration = Math.random() * 4 + 3
  
  return {
    position: 'absolute',
    width: `${size}px`,
    height: `${size}px`,
    left: `${x}%`,
    top: '100%',
    background: 'radial-gradient(circle, #5ee4b9, #37b694)',
    borderRadius: '50%',
    opacity: Math.random() * 0.7 + 0.3,
    animation: `gas-drop-float ${duration}s ${delay}s infinite ease-in-out`,
    pointerEvents: 'none',
    boxShadow: '0 0 6px rgba(94, 228, 185, 0.5)'
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
  // Add any initialization logic here
})
</script>

<style scoped>
/* Hero Buttons */
.btn-primary-hero {
  @apply bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold py-4 px-8 rounded-xl text-lg transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-emerald-500/30 focus:ring-offset-2 shadow-lg hover:shadow-xl hover:scale-105 backdrop-blur-sm whitespace-nowrap;
}

.btn-secondary-hero {
  @apply bg-white/10 backdrop-blur-md border-2 border-emerald-300/30 hover:border-emerald-400 text-white hover:text-emerald-200 font-bold py-4 px-8 rounded-xl text-lg transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-emerald-500/30 focus:ring-offset-2 hover:bg-emerald-500/20 whitespace-nowrap;
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

/* Metallic Background */
.metallic-bg {
  background: 
    linear-gradient(135deg, #1e293b 0%, #334155 25%, #475569 50%, #334155 75%, #1e293b 100%),
    radial-gradient(circle at 20% 80%, rgba(55, 182, 148, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, rgba(20, 184, 166, 0.1) 0%, transparent 50%);
  background-size: 100% 100%, 800px 800px, 600px 600px;
  animation: metallic-shift 20s ease-in-out infinite;
}

/* Metallic Orbs */
.metallic-orb {
  background: 
    radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.3) 0%, transparent 50%),
    radial-gradient(circle at 70% 70%, rgba(55, 182, 148, 0.4) 0%, transparent 50%);
  box-shadow: 
    0 0 60px rgba(55, 182, 148, 0.3),
    inset 0 0 30px rgba(255, 255, 255, 0.1);
}

.metallic-shine {
  background: 
    linear-gradient(45deg, transparent 30%, rgba(255, 255, 255, 0.2) 50%, transparent 70%);
  animation: metallic-gleam 3s ease-in-out infinite;
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

/* Metallic Buttons */
.metallic-btn {
  background: 
    linear-gradient(135deg, #37b694 0%, #10b981 25%, #059669 50%, #10b981 75%, #37b694 100%);
  box-shadow: 
    0 8px 32px rgba(55, 182, 148, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.3),
    inset 0 -1px 0 rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.2);
  position: relative;
  overflow: hidden;
}

.metallic-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
  transition: left 0.6s ease;
}

.metallic-btn:hover::before {
  left: 100%;
}

.metallic-btn-secondary {
  background: 
    linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(55, 182, 148, 0.1) 100%);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(55, 182, 148, 0.3);
  box-shadow: 
    0 8px 32px rgba(55, 182, 148, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
}

.metallic-shine-overlay {
  animation: metallic-shimmer 2s ease-in-out infinite;
}

/* Metallic Cards */
.metallic-card {
  background: 
    linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(55, 182, 148, 0.05) 100%);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(55, 182, 148, 0.3);
  box-shadow: 
    0 8px 32px rgba(55, 182, 148, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.2),
    inset 0 -1px 0 rgba(0, 0, 0, 0.1);
  position: relative;
  overflow: hidden;
}

.metallic-feature-card {
  background: 
    linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(55, 182, 148, 0.05) 100%);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(55, 182, 148, 0.2);
  box-shadow: 
    0 8px 32px rgba(55, 182, 148, 0.15),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
  position: relative;
  overflow: hidden;
}

.metallic-border {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: inherit;
  padding: 1px;
  background: linear-gradient(45deg, rgba(55, 182, 148, 0.5), rgba(20, 184, 166, 0.5), rgba(55, 182, 148, 0.5));
  mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  mask-composite: xor;
  animation: metallic-border-glow 3s ease-in-out infinite;
}

.metallic-shine {
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  animation: metallic-shine-sweep 4s ease-in-out infinite;
}

.metallic-icon {
  background: 
    linear-gradient(135deg, #37b694 0%, #10b981 25%, #059669 50%, #10b981 75%, #37b694 100%);
  box-shadow: 
    0 8px 32px rgba(55, 182, 148, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.3),
    inset 0 -1px 0 rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

/* Metallic Animations */
@keyframes metallic-shift {
  0%, 100% { background-position: 0% 0%, 0% 0%, 100% 100%; }
  50% { background-position: 100% 100%, 100% 100%, 0% 0%; }
}

@keyframes metallic-gleam {
  0%, 100% { opacity: 0.3; transform: scale(1); }
  50% { opacity: 0.8; transform: scale(1.05); }
}

@keyframes metallic-shimmer {
  0% { transform: translateX(-100%) skewX(-12deg); opacity: 0; }
  50% { opacity: 1; }
  100% { transform: translateX(200%) skewX(-12deg); opacity: 0; }
}

@keyframes metallic-border-glow {
  0%, 100% { opacity: 0.5; }
  50% { opacity: 1; }
}

@keyframes metallic-shine-sweep {
  0% { left: -100%; }
  100% { left: 100%; }
}

@keyframes metallic-float-particle {
  0% { transform: translateY(100vh) rotate(0deg) scale(0.5); opacity: 0; }
  10% { opacity: 1; transform: scale(1); }
  90% { opacity: 1; transform: scale(1); }
  100% { transform: translateY(-100px) rotate(360deg) scale(0.5); opacity: 0; }
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

/* Grenade Animation Styles */
.grenade-container {
  @apply flex flex-col items-center justify-center;
}

.grenade {
  @apply relative w-48 h-72 mx-auto;
}

.grenade-head {
  @apply absolute top-0 left-1/2 transform -translate-x-1/2 w-12 h-8 bg-gradient-to-br from-gray-500 to-gray-700;
  box-shadow: 
    inset 0 1px 2px rgba(0, 0, 0, 0.3),
    0 2px 4px rgba(0, 0, 0, 0.2);
  clip-path: polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%);
}

.grenade-body {
  @apply relative w-full h-56 bg-gradient-to-br from-gray-600 to-gray-800 border-2 border-gray-500 mt-8;
  box-shadow: 
    inset 0 2px 4px rgba(0, 0, 0, 0.3),
    0 4px 8px rgba(0, 0, 0, 0.2);
  transform: perspective(100px) rotateX(5deg);
  clip-path: polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%);
}

.energy-level {
  @apply absolute inset-4 overflow-hidden;
  background: linear-gradient(180deg, rgba(0, 0, 0, 0.3) 0%, rgba(0, 0, 0, 0.1) 100%);
  clip-path: polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%);
}

.energy-fill {
  @apply absolute bottom-0 left-0 right-0 h-3/4;
  background: linear-gradient(180deg, #5ee4b9 0%, #37b694 50%, #10b981 100%);
  animation: energy-pulse 2s ease-in-out infinite;
  box-shadow: 
    inset 0 2px 4px rgba(255, 255, 255, 0.2),
    0 0 10px rgba(94, 228, 185, 0.4);
  clip-path: polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%);
}

.grenade-valve {
  @apply absolute top-1 right-1 w-3 h-3 bg-gray-400 rounded-full;
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.3);
}

.grenade-handle {
  @apply absolute top-2 left-1 w-6 h-1 bg-gray-500 rounded;
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.3);
}

.grenade-base {
  @apply absolute bottom-0 left-1/2 transform -translate-x-1/2 w-20 h-10 bg-gradient-to-br from-gray-700 to-gray-900;
  box-shadow: 
    inset 0 2px 4px rgba(0, 0, 0, 0.3),
    0 2px 4px rgba(0, 0, 0, 0.2);
  clip-path: polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%);
}

.gas-flow {
  @apply absolute top-0 left-1/2 transform -translate-x-1/2 w-16 h-12;
}

.flow-stream {
  @apply absolute;
}

.gas-drops {
  @apply absolute top-full left-0 right-0 h-20;
}

.gas-drop {
  @apply absolute;
}

/* Gas Tank Animations */
@keyframes energy-pulse {
  0%, 100% { 
    transform: scaleY(1); 
    opacity: 0.8; 
  }
  50% { 
    transform: scaleY(1.05); 
    opacity: 1; 
  }
}

@keyframes energy-bubble {
  0% { 
    transform: translateY(0) scale(0.8); 
    opacity: 0.4; 
  }
  50% { 
    transform: translateY(-10px) scale(1.2); 
    opacity: 0.8; 
  }
  100% { 
    transform: translateY(-20px) scale(0.6); 
    opacity: 0.2; 
  }
}

@keyframes gas-flow-stream {
  0% { 
    transform: translateY(-40px); 
    opacity: 0; 
  }
  50% { 
    opacity: 0.6; 
  }
  100% { 
    transform: translateY(40px); 
    opacity: 0; 
  }
}

@keyframes gas-drop-float {
  0% { 
    transform: translateY(0) scale(0.5); 
    opacity: 0.3; 
  }
  50% { 
    transform: translateY(-30px) scale(1); 
    opacity: 0.7; 
  }
  100% { 
    transform: translateY(-60px) scale(0.3); 
    opacity: 0; 
  }
}
</style>