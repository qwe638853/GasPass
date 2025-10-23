<template>
  <div class="cute-gas-jar-container">
    <!-- 可愛的儲值罐 -->
    <div class="gas-jar" :class="{ 'wiggle': isWiggling, 'filling': isFilling }">
      <!-- 背景光效 -->
      <div class="jar-glow"></div>
      
      <!-- 罐子主體 -->
      <div class="jar-body">
        <!-- 液體填充效果 -->
        <div class="liquid" :style="{ height: liquidHeight + '%' }">
          <div class="liquid-wave"></div>
          <!-- 氣泡效果 -->
          <div class="bubbles">
            <div class="bubble" v-for="n in 5" :key="n" :style="getBubbleStyle(n)"></div>
          </div>
        </div>
        
        <!-- 可愛的表情 -->
        <div class="jar-face">
          <div class="eyes">
            <div class="eye left" :class="{ 'blink': isBlinking }"></div>
            <div class="eye right" :class="{ 'blink': isBlinking }"></div>
          </div>
          <div class="mouth" :class="mouthExpression"></div>
        </div>
        
        <!-- Gas 符號裝飾 -->
        <div class="gas-symbols">
          <div class="symbol" v-for="n in 3" :key="n" :style="symbolStyle(n)">⛽</div>
        </div>
      </div>
      
      <!-- 罐子蓋子 -->
      <div class="jar-lid">
        <div class="lid-handle"></div>
      </div>
      
      <!-- 閃光效果 -->
      <div class="sparkles" v-if="showSparkles">
        <div class="sparkle" v-for="n in 6" :key="n" :style="sparkleStyle(n)">✨</div>
      </div>
    </div>

    <!-- 標題和描述 -->
    <div class="jar-content">
      <h2 class="jar-title">
        {{ isFirstTime ? '創建你的第一個 GasPass！' : '為儲值罐充值' }}
      </h2>
      <p class="jar-description">
        {{ isFirstTime 
          ? '使用 USDC 鑄造可愛的跨鏈 Gas 儲值罐，開始你的無憂 DeFi 之旅！' 
          : '為你的可愛儲值罐充值更多 USDC，保持 Gas 充足！' 
        }}
      </p>
      
      <!-- 金額輸入 -->
      <div class="amount-input-container">
        <div class="amount-input-wrapper">
          <input 
            v-model="amount"
            type="number" 
            step="0.01"
            min="10"
            placeholder="輸入金額"
            class="amount-input"
            @input="onAmountChange"
            @focus="startWiggle"
            @blur="stopWiggle"
          />
          <span class="currency-label">USDC</span>
        </div>
        
        <!-- 快速選擇按鈕 -->
        <div class="quick-amounts">
          <button 
            v-for="quickAmount in quickAmounts" 
            :key="quickAmount"
            @click="selectQuickAmount(quickAmount)"
            class="quick-amount-btn"
            :class="{ 'active': amount === quickAmount }"
          >
            {{ quickAmount }}
          </button>
        </div>
      </div>

      <!-- 費用預估 -->
      <div v-if="costEstimate" class="cost-estimate">
        <div class="estimate-row">
          <span>{{ isFirstTime ? '鑄造' : '儲值' }}金額:</span>
          <span class="highlight">{{ amount }} USDC</span>
        </div>
        <div class="estimate-row">
          <span>Gas 費用:</span>
          <span>≈ {{ costEstimate.gas }} ETH</span>
        </div>
        <div class="estimate-row total">
          <span>總費用:</span>
          <span class="highlight">{{ costEstimate.total }} USDC</span>
        </div>
      </div>

      <!-- 操作按鈕 -->
      <button 
        @click="handleSubmit"
        :disabled="!canSubmit"
        class="submit-btn"
        :class="{ 'loading': isLoading }"
      >
        <span v-if="isLoading" class="loading-content">
          <div class="loading-spinner"></div>
          {{ isFirstTime ? '鑄造中...' : '儲值中...' }}
        </span>
        <span v-else>
          {{ isFirstTime ? '🎉 創建 GasPass' : '💰 立即儲值' }}
        </span>
      </button>

      <!-- 成功訊息 -->
      <div v-if="showSuccess" class="success-message">
        <div class="success-icon">🎉</div>
        <h3>{{ isFirstTime ? '恭喜！儲值罐創建成功！' : '儲值完成！' }}</h3>
        <p>{{ successMessage }}</p>
        <button @click="$emit('success')" class="continue-btn">
          繼續探索 GasPass
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { gasPassService } from '../services/gasPassService.js'
import { contractService } from '../services/contractService.js'
import { useWeb3 } from '../composables/useWeb3.js'

// Props
const props = defineProps({
  isFirstTime: {
    type: Boolean,
    default: true
  },
  existingCard: {
    type: Object,
    default: null
  }
})

// Emits
const emit = defineEmits(['success', 'error'])

// Web3 composable
const { account, provider, signer } = useWeb3()

// Data
const amount = ref('')
const isLoading = ref(false)
const isWiggling = ref(false)
const isBlinking = ref(false)
const isFilling = ref(false)
const showSparkles = ref(false)
const showSuccess = ref(false)
const costEstimate = ref(null)
const successMessage = ref('')

const quickAmounts = ['10', '50', '100', '500']

// Computed
const liquidHeight = computed(() => {
  if (!amount.value) return 10
  const maxAmount = 1000
  const percentage = Math.min((parseFloat(amount.value) / maxAmount) * 80 + 10, 90)
  return percentage
})

const mouthExpression = computed(() => {
  if (isLoading.value) return 'mouth-nervous'
  if (showSuccess.value) return 'mouth-happy'
  if (amount.value && parseFloat(amount.value) >= 100) return 'mouth-excited'
  if (amount.value && parseFloat(amount.value) >= 10) return 'mouth-smile'
  return 'mouth-neutral'
})

const canSubmit = computed(() => {
  return amount.value && 
         parseFloat(amount.value) >= 10 && 
         !isLoading.value &&
         !showSuccess.value
})

// Methods
const onAmountChange = async () => {
  if (amount.value && parseFloat(amount.value) >= 10) {
    // 模擬費用估算
    await new Promise(resolve => setTimeout(resolve, 300))
    costEstimate.value = {
      gas: '0.001',
      total: (parseFloat(amount.value) + 0.5).toFixed(2)
    }
    
    // 觸發填充動畫
    isFilling.value = true
    setTimeout(() => {
      isFilling.value = false
    }, 1000)
  } else {
    costEstimate.value = null
  }
}

const selectQuickAmount = (quickAmount) => {
  amount.value = quickAmount
  onAmountChange()
  startWiggle()
}

const startWiggle = () => {
  isWiggling.value = true
}

const stopWiggle = () => {
  setTimeout(() => {
    isWiggling.value = false
  }, 500)
}

const startBlinking = () => {
  const blink = () => {
    isBlinking.value = true
    setTimeout(() => {
      isBlinking.value = false
    }, 150)
  }
  
  blink()
  return setInterval(blink, 3000)
}

const handleSubmit = async () => {
  if (!account.value || !provider.value || !signer.value) {
    emit('error', '請先連接錢包')
    return
  }

  isLoading.value = true
  showSparkles.value = true
  
  try {
    // 初始化合約服務
    await contractService.init(provider.value, signer.value)
    
    let result
    
    if (props.isFirstTime) {
      // 鑄造新儲值卡
      result = await contractService.mintGasPassCard({
        to: account.value,
        amount: amount.value,
        agent: account.value // 暫時使用用戶地址作為 agent
      })
      
      if (result.success) {
        successMessage.value = `成功創建儲值卡 #${result.tokenId}，充值了 ${amount.value} USDC！`
      }
    } else {
      // 為現有卡片儲值
      result = await contractService.depositToCard({
        tokenId: props.existingCard.tokenId,
        amount: amount.value
      })
      
      if (result.success) {
        successMessage.value = `成功為儲值卡充值 ${amount.value} USDC！`
      }
    }
    
    if (result.success) {
      showSuccess.value = true
      // 觸發慶祝動畫
      celebrateSuccess()
    } else {
      throw new Error(result.error || '操作失敗')
    }
    
  } catch (error) {
    console.error('Submit failed:', error)
    emit('error', error.message)
  } finally {
    isLoading.value = false
    showSparkles.value = false
  }
}

const celebrateSuccess = () => {
  // 連續閃爍
  let blinkCount = 0
  const blinkInterval = setInterval(() => {
    isBlinking.value = !isBlinking.value
    blinkCount++
    if (blinkCount >= 6) {
      clearInterval(blinkInterval)
      isBlinking.value = false
    }
  }, 200)
  
  // 閃光效果
  showSparkles.value = true
  setTimeout(() => {
    showSparkles.value = false
  }, 2000)
}

const symbolStyle = (index) => {
  const positions = [
    { top: '20%', left: '15%', animationDelay: '0s' },
    { top: '40%', right: '10%', animationDelay: '1s' },
    { top: '60%', left: '20%', animationDelay: '2s' }
  ]
  return {
    ...positions[index - 1],
    fontSize: '0.8rem',
    opacity: '0.6'
  }
}

const sparkleStyle = (index) => {
  const angle = (index - 1) * 60
  const radius = 80
  const x = Math.cos(angle * Math.PI / 180) * radius
  const y = Math.sin(angle * Math.PI / 180) * radius
  
  return {
    transform: `translate(${x}px, ${y}px)`,
    animationDelay: `${index * 0.1}s`
  }
}

const getBubbleStyle = (index) => {
  const size = Math.random() * 8 + 4
  const x = Math.random() * 80 + 10
  const delay = Math.random() * 3
  const duration = Math.random() * 4 + 3
  
  return {
    position: 'absolute',
    width: `${size}px`,
    height: `${size}px`,
    left: `${x}%`,
    bottom: '0',
    background: 'rgba(255, 255, 255, 0.6)',
    borderRadius: '50%',
    animation: `bubble-rise ${duration}s ${delay}s infinite ease-out`,
    pointerEvents: 'none'
  }
}

// Lifecycle
let blinkInterval = null

onMounted(() => {
  blinkInterval = startBlinking()
})

onUnmounted(() => {
  if (blinkInterval) {
    clearInterval(blinkInterval)
  }
})

// Watch
watch(amount, (newValue) => {
  if (newValue && parseFloat(newValue) > 0) {
    startWiggle()
  }
})
</script>

<style scoped>
.cute-gas-jar-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  max-width: 500px;
  margin: 0 auto;
  padding: 2rem;
}

.gas-jar {
  position: relative;
  margin-bottom: 2rem;
  transition: transform 0.3s ease;
}

.gas-jar.wiggle {
  animation: wiggle 0.5s ease-in-out;
}

.jar-body {
  position: relative;
  width: 150px;
  height: 180px;
  background: linear-gradient(145deg, #f3f4f6, #e5e7eb);
  border-radius: 10px 10px 25px 25px;
  border: 3px solid #9ca3af;
  overflow: hidden;
  box-shadow: 
    0 10px 30px rgba(0,0,0,0.1),
    inset 0 2px 10px rgba(255,255,255,0.3);
}

.liquid {
  position: absolute;
  bottom: 0;
  width: 100%;
  background: linear-gradient(45deg, #f59e0b, #d97706);
  transition: height 0.8s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 0 0 20px 20px;
}

.liquid-wave {
  position: absolute;
  top: -10px;
  left: 0;
  width: 100%;
  height: 20px;
  background: radial-gradient(ellipse at center, rgba(245,158,11,0.8) 0%, transparent 70%);
  animation: wave 2s ease-in-out infinite;
}

.jar-face {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 10;
}

.eyes {
  display: flex;
  gap: 15px;
  justify-content: center;
  margin-bottom: 8px;
}

.eye {
  width: 12px;
  height: 12px;
  background: #374151;
  border-radius: 50%;
  transition: height 0.1s ease;
}

.eye.blink {
  height: 2px;
}

.mouth {
  width: 20px;
  height: 10px;
  margin: 0 auto;
  border-radius: 0 0 20px 20px;
  transition: all 0.3s ease;
}

.mouth-neutral {
  border: 2px solid #9ca3af;
  border-top: none;
}

.mouth-smile {
  border: 2px solid #f59e0b;
  border-top: none;
  transform: scale(1.1);
}

.mouth-excited {
  background: #f59e0b;
  border-radius: 50%;
  animation: bounce-slow 2s infinite;
}

.mouth-happy {
  background: #f59e0b;
  border-radius: 50%;
  width: 25px;
  height: 15px;
  animation: pulse-slow 1s infinite;
}

.mouth-nervous {
  border: 2px solid #f59e0b;
  border-radius: 50%;
  border-top: none;
  animation: wiggle 0.5s infinite;
}

.gas-symbols {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.symbol {
  position: absolute;
  color: #9ca3af;
  animation: float 3s ease-in-out infinite;
}

.jar-lid {
  position: relative;
  width: 160px;
  height: 15px;
  background: linear-gradient(145deg, #d1d5db, #9ca3af);
  border-radius: 8px;
  margin: -3px auto 0;
  box-shadow: 0 5px 15px rgba(0,0,0,0.2);
}

.lid-handle {
  position: absolute;
  top: -8px;
  left: 50%;
  transform: translateX(-50%);
  width: 20px;
  height: 16px;
  background: linear-gradient(145deg, #d1d5db, #9ca3af);
  border-radius: 50%;
  box-shadow: inset 0 2px 5px rgba(0,0,0,0.2);
}

.sparkles {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.sparkle {
  position: absolute;
  font-size: 1.5rem;
  animation: sparkle 1s ease-out infinite;
}

.jar-content {
  text-align: center;
  width: 100%;
}

.jar-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #374151;
  margin-bottom: 0.5rem;
}

.jar-description {
  color: #6b7280;
  margin-bottom: 1.5rem;
  line-height: 1.5;
}

.amount-input-container {
  margin-bottom: 1.5rem;
}

.amount-input-wrapper {
  position: relative;
  margin-bottom: 1rem;
}

.amount-input {
  width: 100%;
  padding: 1rem 4rem 1rem 1rem;
  border: 3px solid #dee2e6;
  border-radius: 12px;
  font-size: 1.2rem;
  font-weight: 600;
  text-align: center;
  background: white;
  transition: all 0.3s ease;
}

.amount-input:focus {
  outline: none;
  border-color: #f59e0b;
  box-shadow: 0 0 0 3px rgba(245,158,11,0.2);
}

.currency-label {
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  font-weight: 600;
  color: #6b7280;
}

.quick-amounts {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.5rem;
}

.quick-amount-btn {
  padding: 0.5rem;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  background: white;
  color: #6b7280;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.quick-amount-btn:hover {
  border-color: #f59e0b;
  color: #d97706;
}

.quick-amount-btn.active {
  border-color: #f59e0b;
  background: #f59e0b;
  color: white;
}

.cost-estimate {
  background: #f9fafb;
  border-radius: 12px;
  padding: 1rem;
  margin-bottom: 1.5rem;
  border: 2px solid #e5e7eb;
}

.estimate-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
}

.estimate-row:last-child {
  margin-bottom: 0;
}

.estimate-row.total {
  border-top: 1px solid #e5e7eb;
  padding-top: 0.5rem;
  font-weight: 600;
}

.highlight {
  color: #d97706;
  font-weight: 600;
}

.submit-btn {
  width: 100%;
  padding: 1rem 2rem;
  background: linear-gradient(145deg, #f59e0b, #d97706);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(245,158,11,0.3);
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(245,158,11,0.4);
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.loading-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.loading-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.success-message {
  background: linear-gradient(145deg, #d4edda, #c3e6cb);
  border: 2px solid #28a745;
  border-radius: 12px;
  padding: 2rem;
  margin-top: 1.5rem;
  text-align: center;
}

.success-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.success-message h3 {
  color: #155724;
  margin-bottom: 0.5rem;
}

.success-message p {
  color: #155724;
  margin-bottom: 1.5rem;
}

.continue-btn {
  background: #28a745;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.3s ease;
}

.continue-btn:hover {
  background: #218838;
}

/* Animations */
@keyframes wiggle {
  0%, 100% { transform: rotate(-3deg); }
  50% { transform: rotate(3deg); }
}

@keyframes wave {
  0%, 100% { transform: translateX(0); }
  50% { transform: translateX(5px); }
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

@keyframes sparkle {
  0% { transform: scale(0) rotate(0deg); opacity: 1; }
  100% { transform: scale(1) rotate(180deg); opacity: 0; }
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@keyframes bounce-slow {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-5px); }
}

@keyframes pulse-slow {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

@keyframes bubble-rise {
  0% { 
    transform: translateY(0) scale(0.8);
    opacity: 0.8;
  }
  50% { 
    transform: translateY(-50px) scale(1);
    opacity: 0.6;
  }
  100% { 
    transform: translateY(-100px) scale(0.6);
    opacity: 0;
  }
}

/* Jar glow effect */
.jar-glow {
  position: absolute;
  top: -20px;
  left: -20px;
  right: -20px;
  bottom: -20px;
  background: radial-gradient(circle, rgba(245, 158, 11, 0.3) 0%, transparent 70%);
  border-radius: 50%;
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: none;
}

.gas-jar:hover .jar-glow {
  opacity: 1;
}

/* Bubbles container */
.bubbles {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  overflow: hidden;
}
</style>