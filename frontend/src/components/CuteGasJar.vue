<template>
  <div class="cute-gas-jar-container">
    <!-- Cute Grenade -->
    <div class="grenade" :class="{ 'wiggle': isWiggling, 'filling': isFilling }">
      <!-- Background Glow Effect -->
      <div class="jar-glow"></div>
      
      <!-- Grenade Head -->
      <div class="grenade-head">
        <div class="grenade-valve"></div>
        <div class="grenade-handle"></div>
      </div>
      
      <!-- Grenade Body -->
      <div class="grenade-body">
        <!-- Energy Level Indicator -->
        <div class="energy-level">
          <div class="energy-fill" :style="{ height: liquidHeight + '%' }"></div>
          <div class="energy-particles">
            <div class="particle" v-for="n in 8" :key="n" :style="getEnergyParticleStyle(n)"></div>
          </div>
        </div>
        
        <!-- Cute Face -->
        <div class="jar-face">
          <div class="eyes">
            <div class="eye left" :class="{ 'blink': isBlinking }"></div>
            <div class="eye right" :class="{ 'blink': isBlinking }"></div>
          </div>
          <div class="mouth" :class="mouthExpression"></div>
        </div>
        
        
        <!-- Decorative Lines -->
        <div class="decorative-lines">
          <div class="line line-1"></div>
          <div class="line line-2"></div>
          <div class="line line-3"></div>
        </div>
        
        <!-- Energy Indicators -->
        <div class="energy-indicators">
          <div class="indicator" v-for="n in 4" :key="n" :class="{ 'active': liquidHeight > n * 20 }"></div>
        </div>
      </div>
      
      
      <!-- Gas Flow Animation -->
      <div class="gas-flow">
        <div class="flow-stream" v-for="n in 3" :key="n" :style="getFlowStreamStyle(n)"></div>
      </div>
      
      <!-- Floating Gas Drops -->
      <div class="gas-drops">
        <div class="gas-drop" v-for="n in 5" :key="n" :style="getGasDropStyle(n)"></div>
      </div>
      
      <!-- Sparkle Effects -->
      <div class="sparkles" v-if="showSparkles">
        <div class="sparkle" v-for="n in 6" :key="n" :style="sparkleStyle(n)">✨</div>
      </div>
    </div>

    <!-- Title and Description -->
    <div class="jar-content">
      <h2 class="jar-title">
        {{ isFirstTime ? 'Create Your First GasPass!' : 'Refill Your GasPass' }}
      </h2>
      <p class="jar-description">
        {{ isFirstTime 
          ? '' 
          : 'Refill your GasPass with more USDC to keep your Gas topped up!' 
        }}
      </p>
      
      <!-- Amount Input -->
      <div class="amount-input-container">
        <div class="amount-input-wrapper">
          <input 
            v-model="amount"
            type="text" 
            placeholder="Enter amount"
            class="amount-input"
            @input="onAmountChange"
            @focus="startWiggle"
            @blur="stopWiggle"
          />
          <span class="currency-label">USDC</span>
        </div>
        
        <!-- Quick Selection Buttons -->
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


      <!-- Action Button -->
      <button 
        @click="handleSubmit"
        :disabled="!canSubmit"
        class="submit-btn"
        :class="{ 'loading': isLoading }"
      >
        <span v-if="isLoading" class="loading-content">
          <div class="loading-spinner"></div>
          {{ isFirstTime ? 'Minting...' : 'Refilling...' }}
        </span>
        <span v-else>
          {{ isFirstTime ? 'Create GasPass' : 'Refill Now' }}
        </span>
      </button>

      <!-- Success Modal -->
      <div v-if="showSuccess" class="success-modal-overlay" @click="handleModalClick">
        <div class="success-modal" @click.stop>
          <div class="success-modal-content">
            <div class="success-icon">🎉</div>
            <h3>{{ isFirstTime ? 'Congratulations! Gas jar created successfully!' : 'Refill completed!' }}</h3>
            <p>{{ successMessage }}</p>
            <button @click="handleContinue" class="continue-btn">
              Continue Exploring GasPass
            </button>
          </div>
        </div>
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
         parseFloat(amount.value) > 0 && 
         !isLoading.value &&
         !showSuccess.value
})

// Methods
const onAmountChange = async () => {
  if (amount.value && parseFloat(amount.value) > 0) {
    // Simulate cost estimation
    await new Promise(resolve => setTimeout(resolve, 300))
    costEstimate.value = {
      gas: '0.001',
      total: (parseFloat(amount.value) + 0.5).toFixed(2)
    }
    
    // Trigger fill animation
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
    emit('error', 'Please connect your wallet first')
    return
  }

  isLoading.value = true
  showSparkles.value = true
  
  try {
    // Initialize contract service
    await contractService.init(provider.value, signer.value)
    
    let result
    
    if (props.isFirstTime) {
      // Mint new GasPass card
      result = await contractService.mintGasPassCard({
        to: account.value,
        amount: amount.value,
      })
      
      if (result.success) {
        successMessage.value = `Successfully created GasPass card #${result.tokenId} with ${amount.value} USDC!`
      }
    } else {
      // Refill existing card
      result = await contractService.depositToCard({
        tokenId: props.existingCard.tokenId,
        amount: amount.value
      })
      
      if (result.success) {
        successMessage.value = `Successfully refilled GasPass card with ${amount.value} USDC!`
      }
    }
    
    if (result.success) {
      showSuccess.value = true
      // Trigger celebration animation
      celebrateSuccess()
      // Send success event for parent component to refresh data
      console.log('✅ Refuel successful, sending success event')
      emit('success', {
        type: props.isFirstTime ? 'mint' : 'deposit',
        result: result
      })
    } else {
      throw new Error(result.error || 'Operation failed')
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
  // Continuous blinking
  let blinkCount = 0
  const blinkInterval = setInterval(() => {
    isBlinking.value = !isBlinking.value
    blinkCount++
    if (blinkCount >= 6) {
      clearInterval(blinkInterval)
      isBlinking.value = false
    }
  }, 200)
  
  // Sparkle effect
  showSparkles.value = true
  setTimeout(() => {
    showSparkles.value = false
  }, 2000)
}

// Handle modal click
const handleModalClick = () => {
  // Click background to close modal
  handleContinue()
}

// Handle continue button
const handleContinue = () => {
  showSuccess.value = false
  // If first time creation, send success event for parent component to switch view
  if (props.isFirstTime) {
    console.log('🎉 User clicked continue, sending success event...')
    emit('success')
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
  max-width: 900px;
  margin: 0 auto;
  padding: 1.5rem;
  margin-top: 0;
}


.grenade {
  position: relative;
  margin-bottom: 1.5rem;
  transition: transform 0.3s ease;
  width: 150px;
  height: 190px;
  margin: -0.5rem auto 0;
}

.grenade.wiggle {
  animation: wiggle 0.5s ease-in-out;
}


.grenade-head {
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 60px;
  height: 40px;
  background: 
    linear-gradient(145deg, #8b949e, #6b7280, #4b5563),
    radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.3) 0%, transparent 50%),
    radial-gradient(circle at 70% 70%, rgba(0, 0, 0, 0.2) 0%, transparent 50%);
  box-shadow: 
    inset 0 1px 2px rgba(0, 0, 0, 0.3),
    inset 0 -1px 2px rgba(255, 255, 255, 0.1),
    0 2px 4px rgba(0, 0, 0, 0.2),
    0 0 8px rgba(139, 148, 158, 0.3);
  clip-path: polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.grenade-valve {
  position: absolute;
  top: 5px;
  right: 5px;
  width: 15px;
  height: 15px;
  background: 
    radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.4) 0%, transparent 50%),
    linear-gradient(145deg, #d1d5db, #9ca3af, #6b7280);
  border-radius: 50%;
  box-shadow: 
    inset 0 1px 2px rgba(0, 0, 0, 0.3),
    inset 0 -1px 1px rgba(255, 255, 255, 0.2),
    0 1px 2px rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.grenade-handle {
  position: absolute;
  top: 10px;
  left: 5px;
  width: 30px;
  height: 5px;
  background: 
    linear-gradient(90deg, #8b949e, #6b7280, #4b5563),
    radial-gradient(circle at 20% 50%, rgba(255, 255, 255, 0.2) 0%, transparent 50%);
  border-radius: 2px;
  box-shadow: 
    inset 0 1px 2px rgba(0, 0, 0, 0.3),
    inset 0 -1px 1px rgba(255, 255, 255, 0.1),
    0 1px 2px rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.grenade-body {
  position: relative;
  width: 100%;
  height: 170px;
  background: 
    linear-gradient(145deg, #6b7280, #4b5563, #374151),
    radial-gradient(circle at 20% 20%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 80% 80%, rgba(0, 0, 0, 0.3) 0%, transparent 50%);
  border: 2px solid rgba(139, 148, 158, 0.4);
  margin-top: 40px;
  box-shadow: 
    inset 0 2px 4px rgba(0, 0, 0, 0.3),
    inset 0 -2px 4px rgba(255, 255, 255, 0.1),
    0 4px 8px rgba(0, 0, 0, 0.2),
    0 0 12px rgba(139, 148, 158, 0.2);
  transform: perspective(100px) rotateX(5deg);
  clip-path: polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%);
  position: relative;
  overflow: hidden;
}

.grenade-body::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  animation: metallic-shine-sweep 4s ease-in-out infinite;
}

.energy-level {
  position: absolute;
  inset: 20px;
  overflow: hidden;
  background: linear-gradient(180deg, rgba(0, 0, 0, 0.3) 0%, rgba(0, 0, 0, 0.1) 100%);
  clip-path: polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%);
}

.energy-fill {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(180deg, #5ee4b9 0%, #37b694 50%, #10b981 100%);
  animation: energy-pulse 2s ease-in-out infinite;
  box-shadow: 
    inset 0 2px 4px rgba(255, 255, 255, 0.2),
    0 0 10px rgba(94, 228, 185, 0.4);
  clip-path: polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%);
  transition: height 0.8s cubic-bezier(0.4, 0, 0.2, 1);
}

.grenade:hover .energy-particles .particle {
  animation: energy-bubble 1.5s ease-in-out infinite, particle-dance 0.6s ease-in-out infinite;
}


.gas-flow {
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 80px;
  height: 60px;
}

.flow-stream {
  position: absolute;
}

.gas-drops {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  height: 100px;
}

.gas-drop {
  position: absolute;
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
  gap: 25px;
  justify-content: center;
  margin-bottom: 15px;
}

.eye {
  width: 20px;
  height: 20px;
  background: 
    radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.4) 0%, transparent 50%),
    linear-gradient(145deg, #10b981, #059669, #047857);
  border-radius: 50%;
  transition: all 0.3s ease;
  box-shadow: 
    0 0 15px rgba(16, 185, 129, 0.6),
    inset 0 2px 4px rgba(255,255,255,0.3),
    inset 0 -1px 2px rgba(0, 0, 0, 0.2);
  position: relative;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.eye::after {
  content: '';
  position: absolute;
  top: 4px;
  left: 4px;
  width: 8px;
  height: 8px;
  background: rgba(255,255,255,0.8);
  border-radius: 50%;
}

.eye.blink {
  height: 2px;
}

.mouth {
  width: 30px;
  height: 15px;
  margin: 0 auto;
  border-radius: 0 0 30px 30px;
  transition: all 0.3s ease;
  position: relative;
}

.mouth-neutral {
  border: 2px solid #6b7280;
  border-top: none;
  background: linear-gradient(180deg, transparent 0%, rgba(107, 114, 128, 0.1) 100%);
}

.mouth-smile {
  border: 2px solid #10b981;
  border-top: none;
  transform: scale(1.1);
  background: linear-gradient(180deg, transparent 0%, rgba(16, 185, 129, 0.2) 100%);
  box-shadow: 0 0 12px rgba(16, 185, 129, 0.4);
}

.mouth-excited {
  background: 
    radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.3) 0%, transparent 50%),
    linear-gradient(145deg, #10b981, #059669, #047857);
  border-radius: 50%;
  animation: bounce-slow 2s infinite;
  box-shadow: 
    0 0 15px rgba(16, 185, 129, 0.6),
    inset 0 2px 4px rgba(255,255,255,0.3),
    inset 0 -1px 2px rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.mouth-happy {
  background: 
    radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.3) 0%, transparent 50%),
    linear-gradient(145deg, #10b981, #059669, #047857);
  border-radius: 50%;
  width: 35px;
  height: 20px;
  animation: pulse-slow 1s infinite;
  box-shadow: 
    0 0 15px rgba(16, 185, 129, 0.6),
    inset 0 2px 4px rgba(255,255,255,0.3),
    inset 0 -1px 2px rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.mouth-nervous {
  border: 2px solid #10b981;
  border-radius: 50%;
  border-top: none;
  background: linear-gradient(180deg, transparent 0%, rgba(16, 185, 129, 0.2) 100%);
  animation: wiggle 0.5s infinite;
  box-shadow: 0 0 12px rgba(16, 185, 129, 0.4);
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
  padding: 0 2rem;
}

.jar-title {
  font-size: 1.4rem;
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 0.5rem;
  margin-top: 2.5rem;
  text-shadow: 0 0 10px rgba(16, 185, 129, 0.3);
  line-height: 1.3;
}

.jar-description {
  color: #a7f3d0;
  margin-bottom: 1rem;
  line-height: 1.5;
  font-size: 0.85rem;
}

.amount-input-container {
  margin-bottom: 1rem;
}

.amount-input-wrapper {
  position: relative;
  margin-bottom: 0.75rem;
}

.amount-input {
  width: 100%;
  padding: 0.6rem 2.5rem 0.6rem 0.6rem;
  border: 2px solid #10b981;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  text-align: center;
  background: rgba(30, 41, 59, 0.8);
  color: #ffffff;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}

.amount-input:focus {
  outline: none;
  border-color: #10b981;
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.2), 0 0 20px rgba(16, 185, 129, 0.3);
}

.amount-input::placeholder {
  color: #a7f3d0;
}

.currency-label {
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  font-weight: 600;
  color: #10b981;
  font-size: 0.9rem;
}

.quick-amounts {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.5rem;
}

.quick-amount-btn {
  padding: 0.4rem;
  border: 2px solid #10b981;
  border-radius: 6px;
  background: rgba(30, 41, 59, 0.8);
  color: #a7f3d0;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}

.quick-amount-btn:hover {
  border-color: #10b981;
  color: #ffffff;
  background: rgba(16, 185, 129, 0.2);
  box-shadow: 0 0 10px rgba(16, 185, 129, 0.3);
}

.quick-amount-btn.active {
  border-color: #10b981;
  background: #10b981;
  color: white;
  box-shadow: 0 0 15px rgba(16, 185, 129, 0.5);
}

.cost-estimate {
  background: rgba(30, 41, 59, 0.8);
  border-radius: 12px;
  padding: 1rem;
  margin-bottom: 1.5rem;
  border: 2px solid #10b981;
  backdrop-filter: blur(10px);
}

.estimate-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
  color: #a7f3d0;
}

.estimate-row:last-child {
  margin-bottom: 0;
}

.estimate-row.total {
  border-top: 1px solid #10b981;
  padding-top: 0.5rem;
  font-weight: 600;
  color: #ffffff;
}

.highlight {
  color: #10b981;
  font-weight: 600;
}

.submit-btn {
  width: 100%;
  padding: 0.6rem 1.25rem;
  background: linear-gradient(145deg, #10b981, #059669);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(16, 185, 129, 0.4);
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
  background: linear-gradient(145deg, rgba(16, 185, 129, 0.1), rgba(5, 150, 105, 0.1));
  border: 2px solid #10b981;
  border-radius: 12px;
  padding: 2rem;
  margin-top: 1.5rem;
  text-align: center;
  backdrop-filter: blur(10px);
}

.success-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.success-message h3 {
  color: #ffffff;
  margin-bottom: 0.5rem;
  text-shadow: 0 0 10px rgba(16, 185, 129, 0.3);
}

.success-message p {
  color: #a7f3d0;
  margin-bottom: 1.5rem;
}

.continue-btn {
  background: #10b981;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);
}

.continue-btn:hover {
  background: #059669;
  box-shadow: 0 6px 20px rgba(16, 185, 129, 0.4);
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

@keyframes particle-dance {
  0%, 100% { 
    transform: translateX(0) translateY(0) scale(1); 
    opacity: 0.4; 
  }
  25% { 
    transform: translateX(-3px) translateY(-2px) scale(1.1); 
    opacity: 0.7; 
  }
  50% { 
    transform: translateX(0) translateY(-4px) scale(1.2); 
    opacity: 0.8; 
  }
  75% { 
    transform: translateX(3px) translateY(-2px) scale(1.1); 
    opacity: 0.7; 
  }
}

/* Jar glow effect */
.jar-glow {
  position: absolute;
  top: -20px;
  left: -20px;
  right: -20px;
  bottom: -20px;
  background: radial-gradient(circle, rgba(16, 185, 129, 0.3) 0%, transparent 70%);
  border-radius: 50%;
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: none;
}

.grenade:hover .jar-glow {
  opacity: 1;
}


/* Decorative Lines */
.decorative-lines {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.line {
  position: absolute;
  background: linear-gradient(90deg, transparent, rgba(16, 185, 129, 0.3), transparent);
  height: 1px;
  animation: line-glow 4s ease-in-out infinite;
}

.line-1 {
  top: 20%;
  left: 10%;
  width: 80%;
  animation-delay: 0s;
}

.line-2 {
  top: 40%;
  left: 15%;
  width: 70%;
  animation-delay: 1.3s;
}

.line-3 {
  top: 60%;
  left: 20%;
  width: 60%;
  animation-delay: 2.6s;
}

/* Energy Indicators */
.energy-indicators {
  position: absolute;
  right: 8px;
  top: 20px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  pointer-events: none;
}

.indicator {
  width: 4px;
  height: 12px;
  background: rgba(16, 185, 129, 0.2);
  border-radius: 2px;
  transition: all 0.3s ease;
}

.indicator.active {
  background: linear-gradient(180deg, #10b981, #059669);
  box-shadow: 0 0 8px rgba(16, 185, 129, 0.6);
}

/* Line Glow Animation */
@keyframes line-glow {
  0%, 100% { 
    opacity: 0.3;
    transform: scaleX(0.8);
  }
  50% { 
    opacity: 0.8;
    transform: scaleX(1);
  }
}

/* Success Modal Styles */
.success-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: modalFadeIn 0.3s ease-out;
}

.success-modal {
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
  animation: modalSlideIn 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  max-width: 500px;
  width: 90%;
  margin: 20px;
}

.success-modal::before {
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
  border-radius: 28px;
  opacity: 0;
  transition: opacity 0.4s ease;
}

.success-modal:hover::before {
  opacity: 1;
}

.success-modal-content {
  position: relative;
  z-index: 10;
  padding: 40px;
  text-align: center;
}

.success-icon {
  font-size: 4rem;
  margin-bottom: 20px;
  animation: bounce 0.6s ease-out;
}

.success-modal h3 {
  color: #ffffff;
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 16px;
  line-height: 1.4;
}

.success-modal p {
  color: #10b981;
  font-size: 1rem;
  margin-bottom: 32px;
  line-height: 1.5;
}

.continue-btn {
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  border: none;
  padding: 12px 32px;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);
}

.continue-btn:hover {
  background: linear-gradient(135deg, #059669, #047857);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(16, 185, 129, 0.4);
}

.continue-btn:active {
  transform: translateY(0);
}

@keyframes modalFadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: translateY(-50px) scale(0.9);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes bounce {
  0%, 20%, 50%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-20px);
  }
  60% {
    transform: translateY(-10px);
  }
}

/* Responsive Design */
@media (max-width: 768px) {
  .cute-gas-jar-container {
    max-width: 100%;
    padding: 1rem;
  }
  
  .grenade {
    width: 130px;
    height: 170px;
    margin-bottom: 1rem;
  }
  
  .grenade-body {
    height: 150px;
  }
  
  .jar-title {
    font-size: 1.2rem;
    margin-top: 1.5rem;
  }
  
  .jar-content {
    padding: 0 1rem;
  }
}

@media (max-width: 480px) {
  .cute-gas-jar-container {
    padding: 0.5rem;
  }
  
  .grenade {
    width: 110px;
    height: 150px;
    margin-bottom: 0.5rem;
  }
  
  .grenade-body {
    height: 130px;
  }
  
  .jar-title {
    font-size: 1.1rem;
    margin-top: 1.2rem;
  }
  
  .jar-content {
    padding: 0 0.5rem;
  }
  
  .amount-input {
    font-size: 0.8rem;
    padding: 0.5rem 2rem 0.5rem 0.5rem;
  }
  
  .quick-amount-btn {
    padding: 0.3rem;
    font-size: 0.8rem;
  }
  
  .submit-btn {
    padding: 0.5rem 1rem;
    font-size: 0.8rem;
  }
}
</style>