<template>
  <div class="modal-overlay" @click="$emit('close')">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h2 class="modal-title">🤖 AI Agent 智能補充設定</h2>
        <button @click="$emit('close')" class="close-btn">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>

      <div class="modal-body">
        <!-- Agent Status Overview -->
        <div class="section">
          <div class="agent-status-card">
            <div class="status-header">
              <div class="agent-avatar">🤖</div>
              <div class="agent-info">
                <h3 class="agent-name">GasPass AI Agent</h3>
                <p class="agent-description">為您智能管理多鏈 Gas 餘額</p>
              </div>
              <div class="agent-toggle">
                <label class="toggle-switch">
                  <input 
                    v-model="agentEnabled" 
                    type="checkbox" 
                    @change="toggleAgent"
                  />
                  <span class="toggle-slider"></span>
                </label>
              </div>
            </div>
            
            <div v-if="agentEnabled" class="status-stats">
              <div class="stat-item">
                <span class="stat-value">{{ activePolicies.length }}</span>
                <span class="stat-label">活躍策略</span>
              </div>
              <div class="stat-item">
                <span class="stat-value">{{ totalExecutions }}</span>
                <span class="stat-label">執行次數</span>
              </div>
              <div class="stat-item">
                <span class="stat-value">${{ totalSaved }}</span>
                <span class="stat-label">節省費用</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Existing Policies -->
        <div v-if="agentEnabled" class="section">
          <div class="section-header">
            <h3 class="section-title">現有監控策略</h3>
            <button @click="showAddPolicy = true" class="add-policy-btn">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
              </svg>
              新增策略
            </button>
          </div>

          <div v-if="policies.length === 0" class="empty-state">
            <div class="empty-icon">📝</div>
            <p class="empty-title">尚未設定任何監控策略</p>
            <p class="empty-description">點擊上方按鈕創建您的第一個智能補充策略</p>
          </div>

          <div v-else class="policies-grid">
            <div 
              v-for="policy in policies" 
              :key="policy.id"
              class="policy-card"
              :class="{ 'active': policy.status === 'active', 'inactive': policy.status === 'inactive' }"
            >
              <div class="policy-header">
                <div class="chain-info">
                  <span class="chain-icon">{{ getChainIcon(policy.chainId) }}</span>
                  <div>
                    <div class="chain-name">{{ policy.chainName }}</div>
                    <div class="chain-symbol">{{ policy.symbol }}</div>
                  </div>
                </div>
                <div class="policy-status">
                  <label class="status-toggle">
                    <input 
                      v-model="policy.status" 
                      type="checkbox" 
                      :value="'active'"
                      :true-value="'active'"
                      :false-value="'inactive'"
                      @change="updatePolicyStatus(policy)"
                    />
                    <span class="status-slider"></span>
                  </label>
                </div>
              </div>

              <div class="policy-details">
                <div class="detail-row">
                  <span class="detail-label">觸發閾值:</span>
                  <span class="detail-value">< {{ policy.threshold }} {{ policy.symbol }}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">補充數量:</span>
                  <span class="detail-value">{{ policy.gasAmount }} {{ policy.symbol }}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">最後執行:</span>
                  <span class="detail-value">{{ policy.lastTriggered || '未執行' }}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">執行次數:</span>
                  <span class="detail-value">{{ policy.executeCount }} 次</span>
                </div>
              </div>

              <div class="policy-actions">
                <button @click="editPolicy(policy)" class="action-btn edit">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                  </svg>
                  編輯
                </button>
                <button @click="deletePolicy(policy)" class="action-btn delete">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                  </svg>
                  刪除
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Global Settings -->
        <div v-if="agentEnabled" class="section">
          <h3 class="section-title">全域設定</h3>
          <div class="settings-grid">
            <div class="setting-item">
              <label class="setting-label">每日最大支出限制</label>
              <div class="setting-input-wrapper">
                <input 
                  v-model="globalSettings.maxDailySpend"
                  type="number" 
                  step="10"
                  min="0"
                  class="setting-input"
                />
                <span class="setting-unit">USDC</span>
              </div>
            </div>
            
            <div class="setting-item">
              <label class="setting-label">檢查頻率</label>
              <select v-model="globalSettings.checkInterval" class="setting-select">
                <option value="5">每 5 分鐘</option>
                <option value="15">每 15 分鐘</option>
                <option value="30">每 30 分鐘</option>
                <option value="60">每小時</option>
              </select>
            </div>

            <div class="setting-item">
              <label class="setting-label">通知設定</label>
              <div class="notification-toggles">
                <label class="notification-item">
                  <input 
                    v-model="globalSettings.notifications.execution" 
                    type="checkbox"
                  />
                  <span>執行通知</span>
                </label>
                <label class="notification-item">
                  <input 
                    v-model="globalSettings.notifications.errors" 
                    type="checkbox"
                  />
                  <span>錯誤通知</span>
                </label>
                <label class="notification-item">
                  <input 
                    v-model="globalSettings.notifications.lowBalance" 
                    type="checkbox"
                  />
                  <span>餘額不足警告</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        <!-- Save Button -->
        <div v-if="agentEnabled" class="section">
          <button @click="saveSettings" class="save-btn" :disabled="isLoading">
            <span v-if="isLoading" class="loading-content">
              <div class="loading-spinner"></div>
              儲存中...
            </span>
            <span v-else>
              💾 儲存設定
            </span>
          </button>
        </div>
      </div>
    </div>

    <!-- Add/Edit Policy Modal -->
    <PolicyFormModal 
      v-if="showAddPolicy || editingPolicy"
      :policy="editingPolicy"
      :supported-chains="supportedChains"
      @close="closeAddPolicy"
      @success="handlePolicySuccess"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { gasPassService } from '../services/gasPassService.js'
import { supportedChains } from '../utils/mockData.js'
import PolicyFormModal from './PolicyFormModal.vue'

const props = defineProps({
  selectedCard: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['close', 'success'])

// Data
const agentEnabled = ref(false)
const policies = ref([])
const isLoading = ref(false)
const showAddPolicy = ref(false)
const editingPolicy = ref(null)

const globalSettings = ref({
  maxDailySpend: '100',
  checkInterval: '15',
  notifications: {
    execution: true,
    errors: true,
    lowBalance: true
  }
})

// Computed
const activePolicies = computed(() => {
  return policies.value.filter(p => p.status === 'active')
})

const totalExecutions = computed(() => {
  return policies.value.reduce((total, policy) => total + policy.executeCount, 0)
})

const totalSaved = computed(() => {
  return (totalExecutions.value * 2.5).toFixed(1)
})

// Methods
const loadAgentSettings = async () => {
  try {
    const settings = await gasPassService.getAgentSettings(props.selectedCard.tokenId)
    agentEnabled.value = settings.enabled
    policies.value = settings.policies || []
    
    if (settings.globalSettings) {
      globalSettings.value = { ...globalSettings.value, ...settings.globalSettings }
    }
  } catch (error) {
    console.error('Failed to load agent settings:', error)
  }
}

const toggleAgent = async () => {
  try {
    await gasPassService.toggleAgent(props.selectedCard.tokenId, agentEnabled.value)
    if (!agentEnabled.value) {
      policies.value = []
    }
  } catch (error) {
    console.error('Failed to toggle agent:', error)
    agentEnabled.value = !agentEnabled.value // 回復狀態
  }
}

const updatePolicyStatus = async (policy) => {
  try {
    await gasPassService.updatePolicyStatus(policy.id, policy.status)
  } catch (error) {
    console.error('Failed to update policy status:', error)
  }
}

const editPolicy = (policy) => {
  editingPolicy.value = { ...policy }
  showAddPolicy.value = true
}

const deletePolicy = async (policy) => {
  if (confirm(`確定要刪除 ${policy.chainName} 的監控策略嗎？`)) {
    try {
      await gasPassService.deletePolicy(policy.id)
      policies.value = policies.value.filter(p => p.id !== policy.id)
    } catch (error) {
      console.error('Failed to delete policy:', error)
    }
  }
}

const closeAddPolicy = () => {
  showAddPolicy.value = false
  editingPolicy.value = null
}

const handlePolicySuccess = (policyData) => {
  if (editingPolicy.value) {
    const index = policies.value.findIndex(p => p.id === editingPolicy.value.id)
    if (index !== -1) {
      policies.value[index] = policyData
    }
  } else {
    policies.value.push(policyData)
  }
  closeAddPolicy()
}

const getChainIcon = (chainId) => {
  const chain = supportedChains.find(c => c.id === chainId)
  return chain ? chain.icon : '🔗'
}

const saveSettings = async () => {
  isLoading.value = true
  try {
    await gasPassService.saveAgentSettings(props.selectedCard.tokenId, {
      enabled: agentEnabled.value,
      policies: policies.value,
      globalSettings: globalSettings.value
    })
    
    emit('success')
  } catch (error) {
    console.error('Failed to save settings:', error)
    alert('儲存設定失敗：' + error.message)
  } finally {
    isLoading.value = false
  }
}

// Lifecycle
onMounted(() => {
  loadAgentSettings()
})
</script>

<style scoped>
.modal-overlay {
  @apply fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4;
}

.modal-content {
  @apply bg-white rounded-xl shadow-xl max-w-5xl w-full max-h-90vh overflow-y-auto;
}

.modal-header {
  @apply flex items-center justify-between p-6 border-b border-gaspass-gray-200;
}

.modal-title {
  @apply text-2xl font-bold text-gaspass-gray-800;
}

.close-btn {
  @apply text-gaspass-gray-400 hover:text-gaspass-gray-600 transition-colors;
}

.modal-body {
  @apply p-6 space-y-8;
}

.section {
  @apply space-y-4;
}

.section-header {
  @apply flex items-center justify-between;
}

.section-title {
  @apply text-lg font-semibold text-gaspass-gray-800;
}

.agent-status-card {
  @apply bg-gradient-to-r from-gaspass-gray-50 to-gaspass-gray-100 rounded-xl p-6 border border-gaspass-gray-200;
}

.status-header {
  @apply flex items-center gap-4 mb-4;
}

.agent-avatar {
  @apply text-4xl;
}

.agent-info {
  @apply flex-1;
}

.agent-name {
  @apply text-xl font-bold text-gaspass-gray-800;
}

.agent-description {
  @apply text-gaspass-gray-600;
}

.agent-toggle {
  @apply flex-shrink-0;
}

.toggle-switch {
  @apply relative inline-block w-12 h-6;
}

.toggle-switch input {
  @apply opacity-0 w-0 h-0;
}

.toggle-slider {
  @apply absolute cursor-pointer top-0 left-0 right-0 bottom-0 bg-gaspass-gray-300 rounded-full transition-all duration-300;
}

.toggle-slider:before {
  @apply absolute content-[''] h-5 w-5 left-0.5 bottom-0.5 bg-white rounded-full transition-all duration-300;
}

input:checked + .toggle-slider {
  @apply bg-gaspass-yellow-400;
}

input:checked + .toggle-slider:before {
  @apply transform translate-x-6;
}

.status-stats {
  @apply grid grid-cols-3 gap-4;
}

.stat-item {
  @apply text-center;
}

.stat-value {
  @apply block text-2xl font-bold text-gaspass-gray-800;
}

.stat-label {
  @apply text-sm text-gaspass-gray-600;
}

.add-policy-btn {
  @apply flex items-center gap-2 bg-gaspass-yellow-400 hover:bg-gaspass-yellow-500 text-gaspass-gray-800 font-semibold px-4 py-2 rounded-lg transition-colors;
}

.empty-state {
  @apply text-center py-12;
}

.empty-icon {
  @apply text-6xl mb-4;
}

.empty-title {
  @apply text-xl font-semibold text-gaspass-gray-800 mb-2;
}

.empty-description {
  @apply text-gaspass-gray-600;
}

.policies-grid {
  @apply grid grid-cols-1 md:grid-cols-2 gap-4;
}

.policy-card {
  @apply bg-white border-2 rounded-xl p-4 transition-all;
}

.policy-card.active {
  @apply border-gaspass-yellow-400 bg-gaspass-yellow-50;
}

.policy-card.inactive {
  @apply border-gaspass-gray-200 bg-gaspass-gray-50;
}

.policy-header {
  @apply flex items-center justify-between mb-4;
}

.chain-info {
  @apply flex items-center gap-3;
}

.chain-icon {
  @apply text-2xl;
}

.chain-name {
  @apply font-semibold text-gaspass-gray-800;
}

.chain-symbol {
  @apply text-sm text-gaspass-gray-600;
}

.policy-status {
  @apply flex-shrink-0;
}

.status-toggle {
  @apply relative inline-block w-10 h-5;
}

.status-toggle input {
  @apply opacity-0 w-0 h-0;
}

.status-slider {
  @apply absolute cursor-pointer top-0 left-0 right-0 bottom-0 bg-gaspass-gray-300 rounded-full transition-all duration-300;
}

.status-slider:before {
  @apply absolute content-[''] h-4 w-4 left-0.5 bottom-0.5 bg-white rounded-full transition-all duration-300;
}

input:checked + .status-slider {
  @apply bg-gaspass-yellow-400;
}

input:checked + .status-slider:before {
  @apply transform translate-x-5;
}

.policy-details {
  @apply space-y-2 mb-4;
}

.detail-row {
  @apply flex justify-between text-sm;
}

.detail-label {
  @apply text-gaspass-gray-600;
}

.detail-value {
  @apply font-medium text-gaspass-gray-800;
}

.policy-actions {
  @apply flex gap-2;
}

.action-btn {
  @apply flex items-center gap-1 px-3 py-1 rounded-lg text-sm font-medium transition-colors;
}

.action-btn.edit {
  @apply bg-blue-100 text-blue-700 hover:bg-blue-200;
}

.action-btn.delete {
  @apply bg-red-100 text-red-700 hover:bg-red-200;
}

.settings-grid {
  @apply grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6;
}

.setting-item {
  @apply space-y-2;
}

.setting-label {
  @apply block text-sm font-medium text-gaspass-gray-700;
}

.setting-input-wrapper {
  @apply relative;
}

.setting-input {
  @apply w-full px-3 py-2 pr-16 border-2 border-gaspass-gray-200 rounded-lg focus:border-gaspass-yellow-400 focus:outline-none transition-colors;
}

.setting-unit {
  @apply absolute right-3 top-1/2 transform -translate-y-1/2 text-sm font-medium text-gaspass-gray-600;
}

.setting-select {
  @apply w-full px-3 py-2 border-2 border-gaspass-gray-200 rounded-lg focus:border-gaspass-yellow-400 focus:outline-none transition-colors bg-white;
}

.notification-toggles {
  @apply space-y-2;
}

.notification-item {
  @apply flex items-center gap-2 text-sm;
}

.notification-item input {
  @apply w-4 h-4 text-gaspass-yellow-400 border-gaspass-gray-300 rounded focus:ring-gaspass-yellow-400;
}

.save-btn {
  @apply w-full bg-gaspass-yellow-400 hover:bg-gaspass-yellow-500 disabled:bg-gaspass-gray-300 disabled:cursor-not-allowed text-gaspass-gray-800 font-semibold py-4 px-6 rounded-lg transition-all;
}

.loading-content {
  @apply flex items-center justify-center gap-2;
}

.loading-spinner {
  @apply w-5 h-5 border-2 border-gaspass-gray-600 border-t-transparent rounded-full animate-spin;
}
</style>