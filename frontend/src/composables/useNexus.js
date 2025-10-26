import { reactive, computed } from 'vue'
import { NexusSDK } from '@avail-project/nexus-core'
import { getAccount, getWalletClient } from '@wagmi/core'
import { walletService } from '../services/walletService.js'

// Create SDK instance (using mainnet)
console.log('[useNexus] 🔧 Creating Nexus SDK instance, configuring mainnet...')

// Check environment variables and possible configuration options
console.log('[useNexus] 🌍 Current environment check:')
console.log('  - NODE_ENV:', import.meta.env.NODE_ENV || 'undefined')
console.log('  - MODE:', import.meta.env.MODE || 'undefined') 
console.log('  - DEV:', import.meta.env.DEV || 'undefined')
console.log('  - Current URL:', window.location.href)

// Use mainnet configuration
let sdk

// Export sdk instance for use by other components
export { sdk }
try {
  // Method 1: Standard mainnet configuration (according to documentation)
  const config = { network: 'mainnet' }
  console.log('[useNexus] 🌐 Attempting configuration:', config)
  sdk = new NexusSDK(config)
  console.log('[useNexus] ✅ SDK created, method 1 (standard):', config)
} catch (error) {
  console.log('[useNexus] ❌ Method 1 failed:', error.message)
  
  try {
    // Method 2: No parameter initialization, default is mainnet
    console.log('[useNexus] 🌐 Attempting configuration: No parameters (default mainnet)')
    sdk = new NexusSDK()
    console.log('[useNexus] ✅ SDK created, method 2: No parameters (default mainnet)')
  } catch (error2) {
    console.log('[useNexus] ❌ Method 2 failed:', error2.message)
    
    try {
      // Method 3: Try explicit string configuration
      console.log('[useNexus] 🌐 Attempting configuration: mainnet string')
      sdk = new NexusSDK('mainnet')
      console.log('[useNexus] ✅ SDK created, method 3: mainnet string')
    } catch (error3) {
      console.log('[useNexus] ❌ All configuration methods failed:', error3.message)
      throw new Error('Unable to create Nexus SDK instance')
    }
  }
}

// Immediately check if SDK is properly configured
if (sdk && typeof sdk.utils === 'object') {
  console.log('[useNexus] ✅ SDK utils available')
  
  // Immediately test getSupportedChains before initialization
  try {
    const preInitChains = sdk.utils.getSupportedChains()
    console.log('[useNexus] 🧪 Supported chains before initialization (should be empty or default):', preInitChains)
  } catch (preError) {
    console.log('[useNexus] ⚠️ Unable to get supported chains before initialization:', preError.message)
  }
} else {
  console.log('[useNexus] ❌ SDK utils not available')
}

// Remove hardcoded chain icon mappings - SDK will provide logo

// Reactive state
export const nexusState = reactive({
  initialized: false,
  usdcAsset: null, // Store the original asset object
  usdcBalances: null, // Store normalized balances
  // Generic: currently selected asset and its balance
  selectedToken: 'USDC',
  currentAsset: null,
  currentBalances: null,
  supportedChains: [], // Supported chains list
  swapSupport: null, // Swap support information
  loading: false,
  error: null,
  // Progress tracking
  currentOperation: null,
  operationSteps: [],
  completedSteps: [],
  // Swap related state
  swapSupportedChains: [], // Chains and tokens that support swap
  destinationTokens: new Map(), // Destination token suggestions chainId -> tokens[]
  swapProgress: {
    steps: [],
    currentStep: null,
    sourceSwapHash: null,
    destinationSwapHash: null,
    completed: false
  },
  swapLoading: false,
  swapError: null
})

// Error handling
const handleError = (error, context = '') => {
  console.error(`Nexus ${context} error:`, error)
  nexusState.error = error.message || 'Unknown error'
  nexusState.loading = false
}

// Initialize Nexus SDK (using mainnet)
export async function initializeNexus() {
  try {
    nexusState.loading = true
    nexusState.error = null

    const account = getAccount(walletService.wagmiConfig)
    if (!account.isConnected) {
      throw new Error('Please connect your wallet first')
    }

    const walletClient = await getWalletClient(walletService.wagmiConfig)
    if (!walletClient) throw new Error('Unable to get WalletClient, please connect wallet first')

    console.log('[useNexus] 🔗 Current wallet chain ID:', walletClient.chain.id)
    console.log('[useNexus] 🌐 Using Nexus mainnet mode')

    // Check current wallet chain ID
    const currentChainId = walletClient.chain.id
    console.log('[useNexus] Current wallet chain ID:', currentChainId)

    const isEip1193 = (p) => !!p && typeof p.request === 'function'

    const providerFromWalletClient = (wc) => {
      const p = wc?.transport?.value
      if (p && typeof p.request === 'function' && typeof p.on === 'function') {
        return p
      }
      return {
        request: ({ method, params }) => wc.request({ method, params }),
        on: (event, handler) => {
          if (wc?.transport?.on) return wc.transport.on(event, handler)
          if (typeof window !== 'undefined' && window.ethereum?.on) {
            return window.ethereum.on(event, handler)
          }
        },
        removeListener: (event, handler) => {
          if (wc?.transport?.off) return wc.transport.off(event, handler)
          if (typeof window !== 'undefined' && window.ethereum?.removeListener) {
            return window.ethereum.removeListener(event, handler)
          }
        }
      }
    }

    const provider = providerFromWalletClient(walletClient)
    if (!isEip1193(provider)) throw new Error('Unable to get EIP-1193 Provider')

    if (!sdk.isInitialized()) {
      console.log('[useNexus] 🚀 Initializing Nexus SDK (mainnet mode)...')
      console.log('[useNexus] SDK configuration:', { network: 'mainnet' })
      
      // Check if SDK is properly configured as mainnet before initialization
      console.log('[useNexus] Before initialization - checking SDK network configuration...')
      
      // Pay special attention here - this is where the signature request appears
      console.log('[useNexus] 🔐 About to call sdk.initialize() - signature request will appear here')
      console.log('[useNexus] 🔐 Expected: signature request should display mainnet Chain ID')
      console.log('[useNexus] 🔐 Current wallet chain ID:', walletClient.chain.id)
      
      await sdk.initialize(provider)
      
      console.log('[useNexus] ✅ SDK initialization complete')
      console.log('[useNexus] After initialization - current wallet chain ID:', walletClient.chain.id)
      
      // Check actual status after signature
      console.log('[useNexus] 🔍 Checking status after signature...')
      try {
        // Try to get current connected chain information
        if (typeof sdk.getCurrentChainId === 'function') {
          const sdkChainId = sdk.getCurrentChainId()
          console.log('[useNexus] SDK reported current chain ID:', sdkChainId)
        }
        
        // Check provider status
        const chainIdHex = await provider.request({ method: 'eth_chainId' })
        const chainIdDecimal = parseInt(chainIdHex, 16)
        console.log('[useNexus] Provider reported chain ID:', chainIdDecimal, '(hex:', chainIdHex, ')')
        
      } catch (statusError) {
        console.log('[useNexus] ⚠️ Error checking status after signature:', statusError.message)
      }
      
      // Immediately check if SDK returns correct mainnet chains
      const immediateCheck = sdk.utils.getSupportedChains()
      console.log('[useNexus] 🔍 Immediately check supported chains after initialization:', immediateCheck)
      
      if (immediateCheck && immediateCheck.length > 0) {
        const chainIds = immediateCheck.map(c => c.id)
        
        console.log('[useNexus] 📊 Chains returned by SDK:', {
          total: chainIds.length,
          chainIdList: chainIds
        })
        
        console.log('[useNexus] ✅ SDK successfully returned supported chains')
      }
      
      nexusState.initialized = true
    }

    // First explore supported chains, populate nexusState.supportedChains, then fetch balances
    await exploreNexusCapabilities()
    await fetchUnifiedUSDC()
    
    // Get swap supported chains and tokens
    await getSwapSupportedChainsAndTokens()
    
    // Set up default hooks
    setupIntentHook()
    setupAllowanceHook()
    
    // Set up progress tracking
    setupProgressTracking()
    setupSwapProgressTracking()
  } catch (error) {
    handleError(error, 'initialization')
    throw error
  } finally {
    nexusState.loading = false
  }
}

// Convert getUnifiedBalance('USDC') return to { [chainId]: { balance, decimals, address, chainName } }
function normalizeUSDC(asset) {
  const map = {}
  if (!asset || !Array.isArray(asset.breakdown)) return map
  for (const item of asset.breakdown) {
    const cid = String(item?.chain?.id ?? '')
    if (!cid) continue
    map[cid] = {
      balance: item.balance ?? '0',
      decimals: item.decimals ?? asset.decimals ?? 6,
      address: item.contractAddress ?? '',
      chainName: item.chain?.name ?? ''
    }
  }
  return map
}

// Specifically get USDC unified balance and normalize
export async function fetchUnifiedUSDC() {
  try {
    if (!sdk.isInitialized()) throw new Error('Nexus SDK not initialized')
    nexusState.loading = true
    const usdcAsset = await sdk.getUnifiedBalance('USDC')
    console.log('Raw USDC asset:', usdcAsset)

    nexusState.usdcAsset = usdcAsset // Save original object
    nexusState.usdcBalances = normalizeUSDC(usdcAsset)
    nexusState.selectedToken = 'USDC' // Set selected token
    console.log('Normalized USDC balances:', JSON.parse(JSON.stringify(nexusState.usdcBalances)))

    return nexusState.usdcBalances
  } catch (error) {
    handleError(error, 'fetching USDC balance')
    throw error
  } finally {
    nexusState.loading = false
  }
}

// Get unified balance of any token and normalize
export async function fetchUnifiedToken(symbol) {
  try {
    if (!sdk.isInitialized()) throw new Error('Nexus SDK not initialized')
    nexusState.loading = true
    const asset = await sdk.getUnifiedBalance(symbol)
    nexusState.currentAsset = asset
    nexusState.currentBalances = normalizeUSDC(asset)
    nexusState.selectedToken = symbol
    return nexusState.currentBalances
  } catch (error) {
    handleError(error, `fetching ${symbol} balance`)
    throw error
  } finally {
    nexusState.loading = false
  }
}

// Computed property: USDC balance list for UI use
export const getUSDCBalances = computed(() => {
  if (!nexusState.usdcBalances) return []
  return Object.entries(nexusState.usdcBalances).map(([chainId, data]) => ({
    chainId: parseInt(chainId),
    chainName: data.chainName,
    balance: data.balance,
    formattedBalance: Number(data.balance || '0').toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 6
    })
  }))
})

// For UI use: balance list of currently selected token
export const getSelectedTokenBalances = computed(() => {
  // Select correct data source based on selected token type
  const src = nexusState.selectedToken === 'USDC' ? nexusState.usdcBalances : nexusState.currentBalances
  if (!src) return []
  return Object.entries(src).map(([chainId, data]) => ({
    chainId: parseInt(chainId),
    chainName: data.chainName,
    balance: data.balance,
    formattedBalance: Number(data.balance || '0').toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 6
    })
  }))
})

// Computed property: total USDC balance across all chains
export const getTotalUSDCBalance = computed(() => {
  if (!nexusState.usdcAsset) return '0.00'
  if (nexusState.usdcAsset.balance) {
    return parseFloat(nexusState.usdcAsset.balance).toFixed(2)
  }

  if (!nexusState.usdcBalances) return '0.00'
  let total = 0
  for (const cid of Object.keys(nexusState.usdcBalances)) {
    const v = Number(nexusState.usdcBalances[cid].balance || '0')
    if (!Number.isNaN(v)) total += v
  }
  return total.toFixed(2)
})

// Total balance of currently selected token
export const getSelectedTokenTotal = computed(() => {
  // Select correct data source based on selected token type
  if (nexusState.selectedToken === 'USDC') {
    return getTotalUSDCBalance.value
  } else if (nexusState.currentAsset?.balance) {
    return parseFloat(nexusState.currentAsset.balance).toFixed(2)
  }
  return '0.00'
})

// Explore Nexus capabilities and supported chains (using official SDK utilities)
export async function exploreNexusCapabilities() {
  try {
    if (!sdk.isInitialized()) throw new Error('Nexus SDK not initialized')
    
    console.log('[useNexus] Exploring Nexus capabilities (mainnet mode)...')
    
    // Detailed check of SDK status and configuration
    console.log('[useNexus] 🔍 Detailed SDK check:')
    console.log('  - isInitialized:', sdk.isInitialized())
    console.log('  - Our configuration: network: mainnet')
    console.log('  - SDK methods:', Object.keys(sdk).filter(k => typeof sdk[k] === 'function'))
    console.log('  - Utils methods:', Object.keys(sdk.utils).filter(k => typeof sdk.utils[k] === 'function'))
    
    // Try to check SDK's internal network configuration (if possible)
    try {
      // Check if there's a method to verify current network mode
      if (typeof sdk.getNetwork === 'function') {
        const currentNetwork = sdk.getNetwork()
        console.log('[useNexus] 🌐 SDK current network mode:', currentNetwork)
      } else {
        console.log('[useNexus] ℹ️ SDK does not have getNetwork method')
      }
      
      // Check SDK configuration object (if accessible)
      if (sdk.config) {
        console.log('[useNexus] ⚙️ SDK configuration object:', sdk.config)
      } else {
        console.log('[useNexus] ℹ️ SDK configuration object not accessible')
      }
    } catch (configError) {
      console.log('[useNexus] ⚠️ Error checking SDK configuration:', configError.message)
    }
    
    // Use official SDK utilities to get supported chains
    const supportedChains = sdk.utils.getSupportedChains()
    console.log('[useNexus] sdk.utils.getSupportedChains() full result:', supportedChains)
    console.log('[useNexus] supportedChains type:', typeof supportedChains, Array.isArray(supportedChains))
    
    // Get swap support information
    const swapSupport = sdk.utils.getSwapSupportedChainsAndTokens()
    console.log('[useNexus] sdk.utils.getSwapSupportedChainsAndTokens() result:', swapSupport)
    console.log('[useNexus] swapSupport type:', typeof swapSupport)
    
    // Try more SDK utilities methods
    try {
      // Check supported tokens
      if (typeof sdk.utils.isSupportedToken === 'function') {
        const tokens = ['USDC', 'ETH', 'USDT']
        tokens.forEach(token => {
          const supported = sdk.utils.isSupportedToken(token)
          console.log(`[useNexus] Token ${token} support status:`, supported)
        })
      }
      
      // Check if specific chain is supported - using SDK provided chain list
      if (typeof sdk.utils.isSupportedChain === 'function' && supportedChains) {
        supportedChains.forEach(chain => {
          const supported = sdk.utils.isSupportedChain(chain.id)
          console.log(`[useNexus] Chain ${chain.id} (${chain.name}) support status:`, supported)
        })
      }
      
      // Try to get chain metadata - using SDK provided chain list
      if (typeof sdk.utils.getChainMetadata === 'function' && supportedChains) {
        supportedChains.forEach(chain => {
          const metadata = sdk.utils.getChainMetadata(chain.id)
          console.log(`[useNexus] Chain ${chain.id} (${chain.name}) metadata:`, metadata)
        })
      }
      
    } catch (utilsError) {
      console.log('[useNexus] Error exploring utils methods:', utilsError.message)
    }
    
    // Process getSupportedChains results
    let finalChains = []
    
    // Use getSupportedChains() to get mainnet chains
    console.log('[useNexus] 🌐 Using getSupportedChains() to get mainnet chains')
    
    let actualMainnetChains = []
    
    // Method 1: Get actual available mainnet chains from USDC balances
    if (nexusState.usdcBalances && Object.keys(nexusState.usdcBalances).length > 0) {
      const usdcChainIds = Object.keys(nexusState.usdcBalances).map(id => parseInt(id))
      console.log('[useNexus] 📊 Actual available chains discovered from USDC balances:', usdcChainIds)
      
      // Get metadata for these chains
      actualMainnetChains = usdcChainIds.map(chainId => {
        const metadata = sdk.utils.getChainMetadata(chainId)
        if (metadata) {
          return {
            id: metadata.id,
            name: metadata.name,
            symbol: metadata.nativeCurrency?.symbol || 'ETH',
            icon: metadata.logo || '🌐',
            logo: metadata.logo
          }
        } else {
          // If SDK does not provide metadata, use basic information
          return {
            id: chainId,
            name: `Chain ${chainId}`,
            symbol: 'ETH',
            icon: '🌐'
          }
        }
      }).filter(Boolean)
      
      console.log('[useNexus] ✅ Mainnet chains built from actual USDC balances:', actualMainnetChains)
    }
    
    // Method 2: If no USDC balances, use getSupportedChains results
    if (actualMainnetChains.length === 0 && supportedChains && Array.isArray(supportedChains)) {
      console.log('[useNexus] 📋 Fallback: using mainnet chains returned by getSupportedChains')
      
      actualMainnetChains = supportedChains.map(chain => ({
        id: chain.id,
        name: chain.name,
        symbol: chain.symbol || 'ETH',
        icon: chain.logo || '🌐',
        logo: chain.logo
      }))
      
      console.log('[useNexus] 📋 Chains from getSupportedChains:', actualMainnetChains)
    }
    
    finalChains = actualMainnetChains
    
    // Log getSupportedChains results
    if (supportedChains && Array.isArray(supportedChains) && supportedChains.length > 0) {
      console.log('[useNexus] ✅ Mainnet chains returned by getSupportedChains():')
      supportedChains.forEach((chain, index) => {
        console.log(`  [${index}] ID: ${chain.id}, Name: ${chain.name}, Logo: ${chain.logo}`)
      })
    }
    
    // Update state
    nexusState.supportedChains = finalChains
    nexusState.swapSupport = swapSupport
    
    console.log('[useNexus] Final chain list used (total', finalChains.length, 'chains):', finalChains)
    
    return { supportedChains: finalChains, swapSupport }
  } catch (error) {
    console.error('[useNexus] Exploration failed:', error)
    console.error('[useNexus] Error stack:', error.stack)
    return { supportedChains: [], swapSupport: null }
  }
}

// Get supported target chain list
export function getSupportedTargetChains() {
  if (nexusState.supportedChains && nexusState.supportedChains.length > 0) {
    return nexusState.supportedChains
  }
  
  console.log('[useNexus] No supported chains explored yet, returning empty list')
  return []
}



// Get chain information (from Nexus data)
export function getChainMetadata(chainId) {
  if (!nexusState.supportedChains) return null
  return nexusState.supportedChains.find(chain => chain.id === chainId) || null
}

// Format token amount
export function formatTokenAmount(amount, symbol) {
  const num = parseFloat(amount || '0')
  return `${num.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 6
  })} ${symbol}`
}

// Set up Intent Hook (user confirms transaction intent)
export function setupIntentHook(confirmCallback) {
  if (!sdk.isInitialized()) return
  
  sdk.setOnIntentHook(({ intent, allow, deny, refresh }) => {
    console.log('[useNexus] Intent Hook:', intent)
    
    // Call external confirmation callback
    if (confirmCallback) {
      confirmCallback({ intent, allow, deny, refresh })
    } else {
      // Default auto-confirm (development phase)
      console.log('[useNexus] Auto-confirming Intent')
      allow()
    }
  })
}

// Set up Allowance Hook (user confirms authorization)
export function setupAllowanceHook(allowanceCallback) {
  if (!sdk.isInitialized()) return
  
  sdk.setOnAllowanceHook(({ allow, deny, sources }) => {
    console.log('[useNexus] Allowance Hook:', sources)
    
    // Call external authorization callback
    if (allowanceCallback) {
      allowanceCallback({ allow, deny, sources })
    } else {
      // Default use minimum authorization
      console.log('[useNexus] Auto-confirming Allowance (min)')
      allow(sources.map(() => 'min'))
    }
  })
}

// Set up progress event listeners
export function setupProgressTracking() {
  if (!sdk.isInitialized()) return
  
  // Transfer and Bridge progress
  const unsubscribeExpected = sdk.nexusEvents.on('expected_steps', (steps) => {
    console.log('[useNexus] Expected steps:', steps)
    nexusState.operationSteps = steps
  })
  
  const unsubscribeCompleted = sdk.nexusEvents.on('step_complete', (step) => {
    console.log('[useNexus] Completed step:', step)
    nexusState.completedSteps.push(step)
    
    if (step.typeID === 'IS' && step.data.explorerURL) {
      console.log('[useNexus] Transaction explorer:', step.data.explorerURL)
    }
  })
  
  // Bridge & Execute progress
  const unsubscribeBridgeExpected = sdk.nexusEvents.on('bridge_execute_expected_steps', (steps) => {
    console.log('[useNexus] Bridge Execute expected steps:', steps)
    nexusState.operationSteps = steps
  })
  
  const unsubscribeBridgeCompleted = sdk.nexusEvents.on('bridge_execute_completed_steps', (step) => {
    console.log('[useNexus] Bridge Execute completed step:', step)
    nexusState.completedSteps.push(step)
  })
  
  // Return cleanup function
  return () => {
    unsubscribeExpected()
    unsubscribeCompleted()
    unsubscribeBridgeExpected()
    unsubscribeBridgeCompleted()
  }
}

// Special diagnostic function for SDK network mode
export async function diagnoseSDKNetworkMode() {
  try {
    console.log('=== SDK Network Mode Deep Diagnosis ===')
    
    // Check SDK configuration on creation
    console.log('🔧 SDK creation configuration check:')
    console.log('  - SDK instance exists:', !!sdk)
    console.log('  - SDK type:', typeof sdk)
    
    if (!sdk) {
      return { error: 'SDK instance does not exist' }
    }
    
    // Check SDK internal possible configuration attributes
    console.log('🔍 SDK internal check:')
    const sdkKeys = Object.keys(sdk)
    console.log('  - SDK attributes:', sdkKeys)
    
    // Try to find network configuration related attributes
    const configKeys = sdkKeys.filter(key => 
      key.toLowerCase().includes('config') || 
      key.toLowerCase().includes('network') ||
      key.toLowerCase().includes('mode')
    )
    console.log('  - Possible configuration attributes:', configKeys)
    
    configKeys.forEach(key => {
      try {
        console.log(`  - ${key}:`, sdk[key])
      } catch (error) {
        console.log(`  - ${key}: Unable to access (${error.message})`)
      }
    })
    
    // Check getSupportedChains results at different times
    console.log('⛓️ getSupportedChains test:')
    
    const beforeInitChains = sdk.utils.getSupportedChains()
    console.log('  - Before initialization:', beforeInitChains)
    
    if (beforeInitChains && beforeInitChains.length > 0) {
      const chainIds = beforeInitChains.map(c => c.id)
      const isMainnet = chainIds.some(id => [1, 137, 42161, 10, 8453].includes(id))
      const isTestnet = chainIds.some(id => [11155420, 80002, 421614, 84532, 11155111, 1014].includes(id))
      
      console.log('  - Analysis results:')
      console.log('    * Chain count:', chainIds.length)
      console.log('    * Contains mainnet chains:', isMainnet)
      console.log('    * Contains testnet chains:', isTestnet)
      console.log('    * All chain IDs:', chainIds)
      
      if (isMainnet && !isTestnet) {
        console.log('  ❌ Issue confirmed: SDK returns mainnet chains, testnet configuration invalid')
        return {
          issue: 'SDK_MAINNET_MODE',
          description: 'SDK configured as testnet but returns mainnet chains',
          evidence: { chainIds, isMainnet, isTestnet }
        }
      } else if (isTestnet) {
        console.log('  ✅ SDK correctly configured as testnet mode')
        return {
          status: 'OK',
          description: 'SDK correctly returns testnet chains',
          evidence: { chainIds, isMainnet, isTestnet }
        }
      }
    }
    
    return { status: 'UNKNOWN', description: 'Unable to determine SDK network mode' }
    
  } catch (error) {
    console.error('❌ SDK network mode diagnosis failed:', error)
    return { error: error.message }
  }
}

// Diagnostic function: check testnet environment and USDC support (using official SDK utilities)
export async function diagnoseBridgeSupport() {
  try {
    console.log('=== Nexus Testnet Diagnosis (using official SDK utilities) ===')
    
    if (!sdk.isInitialized()) {
      console.log('❌ SDK not initialized')
      return { error: 'SDK not initialized' }
    }
    
    console.log('✅ SDK initialized')
    
    // Use official SDK utilities to check basic capabilities
    const supportedChains = sdk.utils.getSupportedChains()
    const swapSupport = sdk.utils.getSwapSupportedChainsAndTokens()
    
    console.log('🔗 sdk.utils.getSupportedChains() result:', supportedChains)
    console.log('💱 sdk.utils.getSwapSupportedChainsAndTokens() result:', swapSupport)
    
    // Use SDK utilities to check token support
    const tokenSupportResults = {}
    const tokens = ['USDC', 'ETH', 'USDT']
    if (typeof sdk.utils.isSupportedToken === 'function') {
      tokens.forEach(token => {
        const isSupported = sdk.utils.isSupportedToken(token)
        tokenSupportResults[token] = isSupported
        console.log(`🪙 sdk.utils.isSupportedToken('${token}'):`, isSupported)
      })
    }
    
    // Use SDK utilities to check chain support
    const chainSupportResults = {}
    const testnetChainIds = [11155420, 80002, 421614, 84532, 11155111, 1014]
    if (typeof sdk.utils.isSupportedChain === 'function') {
      testnetChainIds.forEach(chainId => {
        const isSupported = sdk.utils.isSupportedChain(chainId)
        chainSupportResults[chainId] = isSupported
        console.log(`⛓️ sdk.utils.isSupportedChain(${chainId}):`, isSupported)
      })
    }
    
    // Use SDK utilities to get chain metadata
    const chainMetadataResults = {}
    if (typeof sdk.utils.getChainMetadata === 'function') {
      testnetChainIds.forEach(chainId => {
        const metadata = sdk.utils.getChainMetadata(chainId)
        chainMetadataResults[chainId] = metadata
        console.log(`📋 sdk.utils.getChainMetadata(${chainId}):`, metadata)
      })
    }
    
    // Check USDC balance and supported chains
    let usdcChains = []
    try {
      const usdcAsset = await sdk.getUnifiedBalance('USDC')
      if (usdcAsset && usdcAsset.breakdown) {
        usdcChains = usdcAsset.breakdown.map(b => b.chain?.id).filter(Boolean)
        console.log('💰 USDC available chains (from getUnifiedBalance):', usdcChains)
      }
    } catch (usdcError) {
      console.log('❌ USDC balance check failed:', usdcError.message)
    }
    
    // Try to simulate only chains that SDK explicitly supports
    const supportedTestnetChains = testnetChainIds.filter(chainId => 
      chainSupportResults[chainId] === true
    )
    
    console.log(`🧪 Will simulate the following SDK-supported testnet chains:`, supportedTestnetChains)
    
    const simulationResults = {}
    
    for (const chainId of supportedTestnetChains) {
      try {
        console.log(`🧪 Testing chain ${chainId} (SDK confirmed support)...`)
        
        const simulation = await sdk.simulateTransfer({
          token: 'USDC',
          amount: 1,
          chainId: chainId,
          recipient: '0x742d35Cc6634C0532925a3b8D28F1eC21a9B7b5'
        })
        
        simulationResults[chainId] = { success: true, simulation }
        console.log(`✅ Chain ${chainId} simulation successful:`, simulation)
      } catch (error) {
        simulationResults[chainId] = { success: false, error: error.message }
        console.log(`❌ Chain ${chainId} simulation failed:`, error.message)
      }
    }
    
    // If no chains are explicitly supported by SDK, also test chains mentioned in documentation
    if (supportedTestnetChains.length === 0) {
      console.log('⚠️ SDK does not explicitly support any testnet chains, trying testnet chains from documentation')
      const fallbackChains = [11155420, 80002, 421614, 84532, 11155111]
      
      for (const chainId of fallbackChains) {
        try {
          console.log(`🧪 Attempting to test chain ${chainId} (fallback test)...`)
          
          const simulation = await sdk.simulateTransfer({
            token: 'USDC',
            amount: 1,
            chainId: chainId,
            recipient: '0x742d35Cc6634C0532925a3b8D28F1eC21a9B7b5'
          })
          
          simulationResults[chainId] = { success: true, simulation }
          console.log(`✅ Chain ${chainId} fallback test successful`)
        } catch (error) {
          simulationResults[chainId] = { success: false, error: error.message }
          console.log(`❌ Chain ${chainId} fallback test failed:`, error.message)
        }
      }
    }
    
    const summary = {
      sdkInitialized: true,
      supportedChainsFromSDK: supportedChains,
      supportedChainsCount: supportedChains?.length || 0,
      hasSwapSupport: !!swapSupport,
      tokenSupportResults,
      chainSupportResults,
      chainMetadataResults,
      usdcSupportedChains: usdcChains,
      simulationResults,
      recommendations: []
    }
    
    // Generate recommendations
    if (usdcChains.length === 0) {
      summary.recommendations.push('Need to get USDC balance on testnet first')
    }
    
    const successfulChains = Object.keys(simulationResults).filter(id => simulationResults[id].success)
    if (successfulChains.length === 0) {
      summary.recommendations.push('No chains support USDC transfer simulation, testnet environment may need checking')
    } else {
      summary.recommendations.push(`Recommended to use supported chains: ${successfulChains.join(', ')}`)
    }
    
    // Check if SDK correctly returns testnet chains
    if (supportedChains && supportedChains.length > 0) {
      const chainIds = supportedChains.map(c => c.id)
      const hasMainnetChains = chainIds.some(id => [1, 137, 42161, 10, 8453].includes(id))
      const hasTestnetChains = chainIds.some(id => [11155420, 80002, 421614, 84532, 11155111, 1014].includes(id))
      
      if (hasMainnetChains && !hasTestnetChains) {
        summary.recommendations.push('SDK returns mainnet chains instead of testnet chains, configuration may have issues')
      } else if (hasTestnetChains) {
        summary.recommendations.push('SDK correctly returns testnet chains')
      }
    }
    
    console.log('📊 Complete diagnosis summary:', summary)
    return summary
    
  } catch (error) {
    console.error('❌ Diagnosis failed:', error)
    return { error: error.message }
  }
}

// ===== Swap Function Implementation =====

// Get swap supported chains and tokens
export async function getSwapSupportedChainsAndTokens() {
  try {
    if (!sdk.isInitialized()) throw new Error('Nexus SDK not initialized')
    
    console.log('[useNexus] Getting swap supported chains and tokens...')
    
    // Use official API to get supported source chains and tokens
    const supportedOptions = sdk.utils.getSwapSupportedChainsAndTokens()
    console.log('[useNexus] Supported source chains and tokens:', supportedOptions)
    
    // Detailed check of each chain and token data structure
    if (supportedOptions && Array.isArray(supportedOptions)) {
      supportedOptions.forEach((chain, index) => {
        console.log(`[useNexus] Chain ${index}:`, {
          id: chain.id,
          name: chain.name,
          logo: chain.logo,
          tokens: chain.tokens?.map(token => ({
            symbol: token.symbol,
            name: token.name,
            logo: token.logo,
            tokenAddress: token.tokenAddress,
            decimals: token.decimals
          }))
        })
      })
    }
    
    // According to official docs, this returns source chains and tokens
    nexusState.swapSupportedChains = supportedOptions
    
    // Get destination tokens - using official DESTINATION_SWAP_TOKENS
    await getDestinationSwapTokens()
    
    console.log('[useNexus] Source chains and tokens:', nexusState.swapSupportedChains)
    console.log('[useNexus] Destination token list:', nexusState.destinationTokens)
    
    return nexusState.swapSupportedChains
    
  } catch (error) {
    console.error('[useNexus] Failed to get swap support:', error)
    return []
  }
}

// Get destination tokens - using official DESTINATION_SWAP_TOKENS
export async function getDestinationSwapTokens() {
  try {
    if (!sdk.isInitialized()) throw new Error('Nexus SDK not initialized')
    
    console.log('[useNexus] Getting destination tokens...')
    
    // Clear existing destination tokens
    nexusState.destinationTokens.clear()
    
    // Get supported chain list
    const supportedChains = sdk.utils.getSupportedChains()
    console.log('[useNexus] Supported chains:', supportedChains)
    
    // 使用官方 DESTINATION_SWAP_TOKENS
    const { DESTINATION_SWAP_TOKENS } = await import('@avail-project/nexus-core')
    
    // 為每個支援的鏈獲取建議的目標代幣
    if (supportedChains && Array.isArray(supportedChains)) {
      for (const chain of supportedChains) {
        const destinationTokens = DESTINATION_SWAP_TOKENS.get(chain.id)
        
        if (destinationTokens && Array.isArray(destinationTokens)) {
          // 為每個代幣添加鏈信息
          const tokensWithChainInfo = destinationTokens.map(token => ({
            ...token,
            chainId: chain.id,
            chainName: chain.name,
            chainLogo: chain.logo
          }))
          
          nexusState.destinationTokens.set(chain.id, tokensWithChainInfo)
          console.log(`[useNexus] 鏈 ${chain.id} (${chain.name}) 的目標代幣:`, tokensWithChainInfo)
        }
      }
    }
    
    console.log('[useNexus] 最終目標代幣清單:', nexusState.destinationTokens)
    
  } catch (error) {
    console.error('[useNexus] 獲取目標代幣失敗:', error)
  }
}

// EXACT_IN Swap - 指定輸入金額
export async function swapWithExactIn(params) {
  try {
    if (!sdk.isInitialized()) throw new Error('Nexus SDK 未初始化')
    
    const { fromChainId, fromTokenAddress, fromAmount, toChainId, toTokenAddress } = params
    
    console.log('[useNexus] 開始 EXACT_IN Swap:', params)
    
    nexusState.swapLoading = true
    nexusState.swapError = null
    nexusState.swapProgress.completed = false
    nexusState.swapProgress.steps = []
    
    // 按照官方文檔構建 ExactInSwapInput
    const swapWithExactInInput = {
      from: [
        {
          chainId: fromChainId,
          amount: BigInt(fromAmount),
          tokenAddress: fromTokenAddress
        }
      ],
      toChainId: toChainId,
      toTokenAddress: toTokenAddress
    }
    
    console.log('[useNexus] Swap 輸入參數:', swapWithExactInInput)
    
    // 設置進度追蹤
    setupSwapProgressTracking()
    
    // 存儲費用詳情
    let swapFees = null
    
    // 執行 swap - 完全按照官方文檔格式
    const swapWithExactInResult = await sdk.swapWithExactIn(swapWithExactInInput, {
      swapIntentHook: async (data) => {
        console.log('[useNexus] Swap Intent Hook:', data)
        
        const { intent, allow, reject, refresh } = data
        
        // 更新 UI 狀態以顯示 intent 給用戶
        nexusState.swapProgress.currentStep = 'intent_approval'
        
        // 顯示 intent 信息給用戶
        console.log('[useNexus] Intent 詳情:', intent)
        
        // 提取費用詳情
        if (intent && intent.fees) {
          swapFees = {
            totalFees: intent.fees.totalFees || '0',
            gasFees: intent.fees.gasFees || '0',
            bridgeFees: intent.fees.bridgeFees || '0',
            swapFees: intent.fees.swapFees || '0',
            currency: intent.fees.currency || 'USDC'
          }
          console.log('[useNexus] 費用詳情:', swapFees)
        }
        
        // 直接允許，因為我們在 GasExchange.vue 中控制 Modal 顯示
        allow()
      }
    })
    
    console.log('[useNexus] Swap 結果:', swapWithExactInResult)
    
    // 處理 swap 結果 - 按照官方文檔格式
    if (swapWithExactInResult.success) {
      console.log('✅ Swap successful!')
      console.log('Source transaction:', swapWithExactInResult.result.sourceSwaps)
      console.log('Destination transaction:', swapWithExactInResult.result.destinationSwap)
      console.log('Explorer URL:', swapWithExactInResult.result.explorerURL)
      console.log('Full result object:', swapWithExactInResult.result)
      console.log('Destination swap details:', swapWithExactInResult.result.destinationSwap)
      
      // 檢查是否有其他可用的 explorer URL
      let actualExplorerURL = swapWithExactInResult.result.explorerURL
      
      // 如果有 destination swap，優先使用其 explorer URL
      if (swapWithExactInResult.result.destinationSwap?.explorerURL) {
        actualExplorerURL = swapWithExactInResult.result.destinationSwap.explorerURL
        console.log('使用 destination swap explorer URL:', actualExplorerURL)
      } else if (swapWithExactInResult.result.destinationSwap?.txHash) { // 這邊是因為nexus的bug，有時候會沒有explorerURL，但是有txHash，所以我先用手動的方式去跳轉到scan上，應該是Avail那邊的問題啦
        // 如果沒有 explorerURL 但有 txHash，根據 chainId 構建 URL
        const chainId = swapWithExactInResult.result.destinationSwap.chainId
        const txHash = swapWithExactInResult.result.destinationSwap.txHash
        
        // 根據 chainId 構建對應的 explorer URL
        if (chainId === 42161) { // Arbitrum One
          actualExplorerURL = `https://arbiscan.io/tx/${txHash}`
        } else if (chainId === 1) { // Ethereum
          actualExplorerURL = `https://etherscan.io/tx/${txHash}`
        } else if (chainId === 137) { // Polygon
          actualExplorerURL = `https://polygonscan.com/tx/${txHash}`
        } else if (chainId === 10) { // Optimism
          actualExplorerURL = `https://optimistic.etherscan.io/tx/${txHash}`
        } else if (chainId === 8453) { // Base
          actualExplorerURL = `https://basescan.org/tx/${txHash}`
        } else if (chainId === 56) { // BSC
          actualExplorerURL = `https://bscscan.com/tx/${txHash}`
        } else if (chainId === 43114) { // Avalanche
          actualExplorerURL = `https://snowtrace.io/tx/${txHash}`
        } else {
          // 預設使用通用的 explorer
          actualExplorerURL = `https://explorer.nexus.availproject.org/intent/0`
        }
        
        console.log('構建 destination swap explorer URL:', actualExplorerURL)
      }
      
      // 如果有 source swap，也可以使用其 explorer URL
      if (swapWithExactInResult.result.sourceSwaps?.[0]?.explorerURL) {
        actualExplorerURL = swapWithExactInResult.result.sourceSwaps[0].explorerURL
        console.log('使用 source swap explorer URL:', actualExplorerURL)
      } else if (swapWithExactInResult.result.sourceSwaps?.[0]?.txHash) {
        // 如果沒有 explorerURL 但有 txHash，根據 chainId 構建 URL
        const chainId = swapWithExactInResult.result.sourceSwaps[0].chainId
        const txHash = swapWithExactInResult.result.sourceSwaps[0].txHash
        
        // 根據 chainId 構建對應的 explorer URL
        if (chainId === 42161) { // Arbitrum One
          actualExplorerURL = `https://arbiscan.io/tx/${txHash}`
        } else if (chainId === 1) { // Ethereum
          actualExplorerURL = `https://etherscan.io/tx/${txHash}`
        } else if (chainId === 137) { // Polygon
          actualExplorerURL = `https://polygonscan.com/tx/${txHash}`
        } else if (chainId === 10) { // Optimism
          actualExplorerURL = `https://optimistic.etherscan.io/tx/${txHash}`
        } else if (chainId === 8453) { // Base
          actualExplorerURL = `https://basescan.org/tx/${txHash}`
        } else if (chainId === 56) { // BSC
          actualExplorerURL = `https://bscscan.com/tx/${txHash}`
        } else if (chainId === 43114) { // Avalanche
          actualExplorerURL = `https://snowtrace.io/tx/${txHash}`
        }
        
        console.log('構建 source swap explorer URL:', actualExplorerURL)
      }
      
      nexusState.swapProgress.completed = true
      nexusState.swapProgress.sourceSwapHash = swapWithExactInResult.result?.sourceSwaps?.[0]?.hash
      nexusState.swapProgress.destinationSwapHash = swapWithExactInResult.result?.destinationSwap?.hash
      
      // 刷新餘額
      await refreshBalanceAfterSwap()
      
      return {
        success: true,
        result: swapWithExactInResult.result,
        sourceSwaps: swapWithExactInResult.result?.sourceSwaps,
        destinationSwap: swapWithExactInResult.result?.destinationSwap,
        explorerURL: actualExplorerURL, // 使用正確的 explorer URL
        fees: swapFees
      }
    } else {
      console.error('❌ Swap failed:', swapWithExactInResult.error)
      throw new Error(swapWithExactInResult.error || 'Swap 執行失敗')
    }
    
  } catch (error) {
    console.error('[useNexus] EXACT_IN Swap 失敗:', error)
    nexusState.swapError = error.message
    return {
      success: false,
      error: error.message
    }
  } finally {
    nexusState.swapLoading = false
  }
}

// EXACT_OUT Swap - 指定輸出金額
export async function swapWithExactOut(params) {
  try {
    if (!sdk.isInitialized()) throw new Error('Nexus SDK 未初始化')
    
    const { toChainId, toTokenAddress, toAmount } = params
    
    console.log('[useNexus] 開始 EXACT_OUT Swap:', params)
    
    nexusState.swapLoading = true
    nexusState.swapError = null
    nexusState.swapProgress.completed = false
    nexusState.swapProgress.steps = []
    
    // 按照官方文檔構建 ExactOutSwapInput
    const swapWithExactOutInput = {
      toChainId: toChainId,
      toTokenAddress: toTokenAddress,
      toAmount: BigInt(toAmount)
    }
    
    console.log('[useNexus] Swap 輸入參數:', swapWithExactOutInput)
    
    // 執行 swap - 完全按照官方文檔格式
    const swapWithExactOutResult = await sdk.swapWithExactOut(swapWithExactOutInput, {
      swapIntentHook: async (data) => {
        console.log('[useNexus] Swap Intent Hook:', data)
        
        const { intent, allow, reject, refresh } = data
        
        nexusState.swapProgress.currentStep = 'intent_approval'
        
        // 顯示 intent 信息給用戶
        console.log('[useNexus] Intent 詳情:', intent)
        
        // 直接允許 intent（按照官方文檔示例）
        allow()
      }
    })
    
    console.log('[useNexus] Swap 結果:', swapWithExactOutResult)
    
    // 處理 swap 結果 - 按照官方文檔格式
    if (swapWithExactOutResult.success) {
      console.log('✅ Swap successful!')
      console.log('Source transaction:', swapWithExactOutResult.result.sourceSwaps)
      console.log('Destination transaction:', swapWithExactOutResult.result.destinationSwap)
      console.log('Explorer URL:', swapWithExactOutResult.result.explorerURL)
      
      nexusState.swapProgress.completed = true
      nexusState.swapProgress.sourceSwapHash = swapWithExactOutResult.result?.sourceSwaps?.[0]?.hash
      nexusState.swapProgress.destinationSwapHash = swapWithExactOutResult.result?.destinationSwap?.hash
      
      // 刷新餘額
      await refreshBalanceAfterSwap()
      
      return {
        success: true,
        result: swapWithExactOutResult.result,
        sourceSwaps: swapWithExactOutResult.result?.sourceSwaps,
        destinationSwap: swapWithExactOutResult.result?.destinationSwap,
        explorerURL: swapWithExactOutResult.result?.explorerURL
      }
    } else {
      console.error('❌ Swap failed:', swapWithExactOutResult.error)
      throw new Error(swapWithExactOutResult.error || 'Swap 執行失敗')
    }
    
  } catch (error) {
    console.error('[useNexus] EXACT_OUT Swap 失敗:', error)
    nexusState.swapError = error.message
    return {
      success: false,
      error: error.message
    }
  } finally {
    nexusState.swapLoading = false
  }
}

// 設置 Swap 進度追蹤
export function setupSwapProgressTracking() {
  if (!sdk.isInitialized()) return
  
  console.log('[useNexus] 設置 Swap 進度追蹤...')
  
  // 監聽 swap 步驟事件 - 使用官方 NEXUS_EVENTS
  const unsubscribeSwapSteps = sdk.nexusEvents.on('SWAP_STEPS', (step) => {
    console.log('[useNexus] Swap 步驟:', step)
    
    nexusState.swapProgress.steps.push(step)
    nexusState.swapProgress.currentStep = step.type
    
    if (step.type === 'SOURCE_SWAP_HASH' && step.explorerURL) {
      console.log('[useNexus] 來源交易:', step.explorerURL)
    }
    
    if (step.type === 'DESTINATION_SWAP_HASH' && step.explorerURL) {
      console.log('[useNexus] 目標交易:', step.explorerURL)
    }
    
    if (step.type === 'SWAP_COMPLETE' && step.completed) {
      console.log('[useNexus] ✅ Swap 完成!')
    }
  })
  
  // 返回清理函數
  return () => {
    unsubscribeSwapSteps()
  }
}

// 刷新 swap 後的餘額
async function refreshBalanceAfterSwap() {
  try {
    // 刷新當前選擇的代幣餘額
    if (nexusState.selectedToken === 'USDC') {
      await fetchUnifiedUSDC()
    } else {
      await fetchUnifiedToken(nexusState.selectedToken)
    }
  } catch (error) {
    console.error('[useNexus] 刷新餘額失敗:', error)
  }
}

// 獲取目標鏈的建議代幣
export function getDestinationTokens(chainId) {
  return nexusState.destinationTokens.get(chainId) || []
}

// 格式化 swap 金額（處理 BigInt 和小數）
export function formatSwapAmount(amount, decimals) {
  try {
    if (typeof amount === 'bigint') {
      // 將 BigInt 轉換為字符串，然後格式化
      const divisor = BigInt(10 ** decimals)
      const quotient = amount / divisor
      const remainder = amount % divisor
      
      if (remainder === 0n) {
        return quotient.toString()
      } else {
        const remainderStr = remainder.toString().padStart(decimals, '0')
        const trimmedRemainder = remainderStr.replace(/0+$/, '')
        return trimmedRemainder ? `${quotient.toString()}.${trimmedRemainder}` : quotient.toString()
      }
    } else {
      return parseFloat(amount || '0').toFixed(decimals)
    }
  } catch (error) {
    console.error('[useNexus] 格式化金額失敗:', error)
    return '0'
  }
}

// 解析 swap 金額（將字符串轉換為 BigInt）
export function parseSwapAmount(amount, decimals) {
  try {
    const amountStr = amount.toString()
    const [whole, fraction = ''] = amountStr.split('.')
    const paddedFraction = fraction.padEnd(decimals, '0').slice(0, decimals)
    return BigInt(whole + paddedFraction)
  } catch (error) {
    console.error('[useNexus] 解析金額失敗:', error)
    return 0n
  }
}
