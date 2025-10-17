<template>
  <div class="modal-overlay" @click="$emit('close')">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h2 class="modal-title">{{ title }}</h2>
        <button @click="$emit('close')" class="close-btn">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>

      <div class="modal-body">
        <!-- Search -->
        <div class="search-section">
          <div class="search-wrapper">
            <svg class="w-5 h-5 text-gaspass-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
            <input 
              v-model="searchQuery"
              type="text" 
              placeholder="搜尋區塊鏈..."
              class="search-input"
            />
          </div>
        </div>

        <!-- Chain List -->
        <div class="chains-list">
          <div 
            v-for="chain in filteredChains" 
            :key="chain.id"
            class="chain-item"
            :class="{ 'selected': selectedChain?.id === chain.id }"
            @click="selectChain(chain)"
          >
            <div class="chain-main">
              <div class="chain-icon">{{ chain.icon }}</div>
              <div class="chain-info">
                <div class="chain-name">{{ chain.name }}</div>
                <div class="chain-symbol">{{ chain.symbol }}</div>
              </div>
            </div>
            
            <div class="chain-meta">
              <div class="gas-price-indicator" :class="getGasPriceColor(chain.gasPrice)">
                <div class="gas-dot"></div>
                <span class="gas-text">{{ chain.gasPrice }}</span>
              </div>
              <div class="confirm-time">{{ chain.avgConfirmTime }}</div>
            </div>
            
            <div v-if="selectedChain?.id === chain.id" class="selected-indicator">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-if="filteredChains.length === 0" class="empty-state">
          <div class="empty-icon">🔍</div>
          <p class="empty-text">找不到符合條件的區塊鏈</p>
          <p class="empty-description">請嘗試其他搜尋關鍵字</p>
        </div>

        <!-- Chain Info Footer -->
        <div class="chain-info-footer">
          <div class="info-item">
            <div class="info-icon gas-high">🔴</div>
            <span class="info-text">高 Gas 費</span>
          </div>
          <div class="info-item">
            <div class="info-icon gas-medium">🟡</div>
            <span class="info-text">中等 Gas 費</span>
          </div>
          <div class="info-item">
            <div class="info-icon gas-low">🟢</div>
            <span class="info-text">低 Gas 費</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  chains: {
    type: Array,
    required: true
  },
  selectedChain: {
    type: Object,
    default: null
  },
  title: {
    type: String,
    default: '選擇區塊鏈'
  }
})

const emit = defineEmits(['close', 'select'])

// Data
const searchQuery = ref('')

// Computed
const filteredChains = computed(() => {
  if (!searchQuery.value) return props.chains
  
  const query = searchQuery.value.toLowerCase()
  return props.chains.filter(chain => 
    chain.name.toLowerCase().includes(query) ||
    chain.symbol.toLowerCase().includes(query)
  )
})

// Methods
const selectChain = (chain) => {
  emit('select', chain)
}

const getGasPriceColor = (gasPrice) => {
  const colors = {
    'High': 'gas-high',
    'Medium': 'gas-medium',
    'Low': 'gas-low'
  }
  return colors[gasPrice] || 'gas-medium'
}
</script>

<style scoped>
.modal-overlay {
  @apply fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4;
}

.modal-content {
  @apply bg-white rounded-xl shadow-xl max-w-md w-full max-h-90vh overflow-hidden;
}

.modal-header {
  @apply flex items-center justify-between p-6 border-b border-gaspass-gray-200;
}

.modal-title {
  @apply text-xl font-bold text-gaspass-gray-800;
}

.close-btn {
  @apply text-gaspass-gray-400 hover:text-gaspass-gray-600 transition-colors;
}

.modal-body {
  @apply p-6;
}

.search-section {
  @apply mb-6;
}

.search-wrapper {
  @apply relative;
}

.search-wrapper svg {
  @apply absolute left-3 top-1/2 transform -translate-y-1/2;
}

.search-input {
  @apply w-full pl-10 pr-4 py-3 border-2 border-gaspass-gray-200 rounded-lg focus:border-gaspass-yellow-400 focus:outline-none transition-colors;
}

.chains-list {
  @apply space-y-3 max-h-96 overflow-y-auto;
}

.chain-item {
  @apply flex items-center justify-between p-4 border-2 border-gaspass-gray-200 rounded-lg cursor-pointer hover:border-gaspass-yellow-400 transition-all;
}

.chain-item.selected {
  @apply border-gaspass-yellow-400 bg-gaspass-yellow-50;
}

.chain-main {
  @apply flex items-center gap-3;
}

.chain-icon {
  @apply text-2xl;
}

.chain-info {
  @apply flex-1;
}

.chain-name {
  @apply font-semibold text-gaspass-gray-800;
}

.chain-symbol {
  @apply text-sm text-gaspass-gray-600;
}

.chain-meta {
  @apply flex flex-col items-end gap-1;
}

.gas-price-indicator {
  @apply flex items-center gap-2;
}

.gas-dot {
  @apply w-2 h-2 rounded-full;
}

.gas-price-indicator.gas-high .gas-dot {
  @apply bg-red-500;
}

.gas-price-indicator.gas-medium .gas-dot {
  @apply bg-yellow-500;
}

.gas-price-indicator.gas-low .gas-dot {
  @apply bg-green-500;
}

.gas-text {
  @apply text-xs font-medium;
}

.gas-price-indicator.gas-high .gas-text {
  @apply text-red-600;
}

.gas-price-indicator.gas-medium .gas-text {
  @apply text-yellow-600;
}

.gas-price-indicator.gas-low .gas-text {
  @apply text-green-600;
}

.confirm-time {
  @apply text-xs text-gaspass-gray-500;
}

.selected-indicator {
  @apply text-gaspass-yellow-600;
}

.empty-state {
  @apply text-center py-12;
}

.empty-icon {
  @apply text-4xl mb-4;
}

.empty-text {
  @apply text-lg font-semibold text-gaspass-gray-800 mb-2;
}

.empty-description {
  @apply text-gaspass-gray-600;
}

.chain-info-footer {
  @apply flex justify-center gap-6 mt-6 pt-6 border-t border-gaspass-gray-200;
}

.info-item {
  @apply flex items-center gap-2;
}

.info-icon {
  @apply text-sm;
}

.info-text {
  @apply text-xs text-gaspass-gray-600;
}
</style>