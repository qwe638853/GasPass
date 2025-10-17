// 模擬數據

export const mockGasPassCards = [
  {
    tokenId: 1,
    owner: '0x742d35Cc6635C0532925a3b8D400A296',
    balance: '150.25',
    createdAt: '2024-01-10T10:30:00Z',
    lastUpdate: '2024-01-15 14:30',
    activePolicies: 2
  },
  {
    tokenId: 3,
    owner: '0x742d35Cc6635C0532925a3b8D400A296',
    balance: '89.50',
    createdAt: '2024-01-05T15:20:00Z',
    lastUpdate: '2024-01-14 10:20',
    activePolicies: 1
  }
]

export const mockTransactionHistory = [
  {
    id: 1,
    hash: '0x123abc456def789ghi012jkl345mno678pqr901stu234vwx567yz890',
    type: '鑄造儲值卡',
    amount: '100.00',
    tokenId: 1,
    timestamp: '2024-01-15 14:30',
    status: 'completed'
  },
  {
    id: 2,
    hash: '0x456def789ghi012jkl345mno678pqr901stu234vwx567yz890abc123',
    type: '儲值',
    amount: '50.25',
    tokenId: 1,
    timestamp: '2024-01-14 16:45',
    status: 'completed'
  },
  {
    id: 3,
    hash: '0x789ghi012jkl345mno678pqr901stu234vwx567yz890abc123def456',
    type: '手動補 Gas',
    amount: '0.01',
    chainId: 1,
    cost: '20.1',
    timestamp: '2024-01-13 09:20',
    status: 'completed'
  }
]

export const mockRefuelPolicies = [
  {
    id: 1,
    tokenId: 1,
    chainId: 1,
    chainName: 'Ethereum',
    symbol: 'ETH',
    threshold: '0.01',
    gasAmount: '0.02',
    status: 'active',
    createdAt: '2024-01-10T10:30:00Z',
    lastTriggered: '2024-01-15 14:30',
    executeCount: 5
  },
  {
    id: 2,
    tokenId: 1,
    chainId: 137,
    chainName: 'Polygon',
    symbol: 'MATIC',
    threshold: '0.5',
    gasAmount: '1.0',
    status: 'active',
    createdAt: '2024-01-08T14:20:00Z',
    lastTriggered: '2024-01-14 10:20',
    executeCount: 3
  }
]

export const supportedChains = [
  {
    id: 1,
    name: 'Ethereum',
    symbol: 'ETH',
    icon: '🔷',
    color: '#627EEA',
    recommended: '0.01',
    quickAmounts: ['0.005', '0.01', '0.02'],
    gasPrice: 'High',
    avgConfirmTime: '1-2 min'
  },
  {
    id: 137,
    name: 'Polygon',
    symbol: 'MATIC',
    icon: '🟣',
    color: '#8247E5',
    recommended: '50',
    quickAmounts: ['10', '50', '100'],
    gasPrice: 'Low',
    avgConfirmTime: '10-30 sec'
  },
  {
    id: 56,
    name: 'BNB Chain',
    symbol: 'BNB',
    icon: '🟡',
    color: '#F3BA2F',
    recommended: '0.1',
    quickAmounts: ['0.05', '0.1', '0.2'],
    gasPrice: 'Low',
    avgConfirmTime: '5-15 sec'
  },
  {
    id: 43114,
    name: 'Avalanche',
    symbol: 'AVAX',
    icon: '🔺',
    color: '#E84142',
    recommended: '2',
    quickAmounts: ['1', '2', '5'],
    gasPrice: 'Medium',
    avgConfirmTime: '2-5 sec'
  },
  {
    id: 10,
    name: 'Optimism',
    symbol: 'ETH',
    icon: '🔴',
    color: '#FF0420',
    recommended: '0.01',
    quickAmounts: ['0.005', '0.01', '0.02'],
    gasPrice: 'Low',
    avgConfirmTime: '10-30 sec'
  },
  {
    id: 250,
    name: 'Fantom',
    symbol: 'FTM',
    icon: '👻',
    color: '#1969FF',
    recommended: '100',
    quickAmounts: ['50', '100', '200'],
    gasPrice: 'Low',
    avgConfirmTime: '1-3 sec'
  }
]

export const mockAgentActivity = [
  {
    id: 1,
    type: 'execution',
    title: 'Ethereum Gas 補充',
    description: '為 0x123...abc 補充 0.01 ETH，消耗 20.1 USDC',
    timestamp: '15:30',
    chainId: 1
  },
  {
    id: 2,
    type: 'execution',
    title: 'Polygon Gas 補充',
    description: '為 0x123...abc 補充 50 MATIC，消耗 40 USDC',
    timestamp: '14:20',
    chainId: 137
  },
  {
    id: 3,
    type: 'alert',
    title: '餘額警告',
    description: 'Token ID 1 餘額不足 10 USDC，建議充值',
    timestamp: '13:45'
  },
  {
    id: 4,
    type: 'error',
    title: '橋接失敗',
    description: 'BNB Chain 橋接超時，將在下次檢查時重試',
    timestamp: '12:30',
    chainId: 56
  }
]

export const mockSwapHistory = [
  {
    id: 1,
    hash: '0xabc123def456ghi789jkl012mno345pqr678stu901vwx234yz567',
    fromChain: { id: 1, name: 'Ethereum', symbol: 'ETH' },
    toChain: { id: 137, name: 'Polygon', symbol: 'MATIC' },
    inputAmount: '0.1',
    outputAmount: '250.5',
    recipientAddress: '0x742d35Cc6635C0532925a3b8D400A296',
    status: 'completed',
    timestamp: '2024-01-15 16:20',
    bridgeFee: '0.15',
    gasFee: '0.01'
  },
  {
    id: 2,
    hash: '0xdef456ghi789jkl012mno345pqr678stu901vwx234yz567abc123',
    fromChain: { id: 56, name: 'BNB Chain', symbol: 'BNB' },
    toChain: { id: 43114, name: 'Avalanche', symbol: 'AVAX' },
    inputAmount: '1.0',
    outputAmount: '10.2',
    recipientAddress: '0x742d35Cc6635C0532925a3b8D400A296',
    status: 'completed',
    timestamp: '2024-01-14 11:30',
    bridgeFee: '0.3',
    gasFee: '0.5'
  }
]

// 用戶偏好設定
export const mockUserPreferences = {
  theme: 'light',
  language: 'zh-TW',
  currency: 'USD',
  notifications: {
    email: true,
    push: false,
    sms: false
  },
  autoRefuel: {
    enabled: true,
    defaultThreshold: '0.01',
    maxDailySpend: '100'
  }
}

// Gas 價格數據
export const mockGasPrices = {
  1: { slow: 20, standard: 25, fast: 35, unit: 'gwei' },
  137: { slow: 30, standard: 35, fast: 45, unit: 'gwei' },
  56: { slow: 5, standard: 6, fast: 8, unit: 'gwei' },
  43114: { slow: 25, standard: 30, fast: 40, unit: 'nAVAX' },
  10: { slow: 0.001, standard: 0.002, fast: 0.005, unit: 'gwei' },
  250: { slow: 100, standard: 150, fast: 200, unit: 'gwei' }
}

// 價格數據 (USD)
export const mockTokenPrices = {
  'ETH': 2500,
  'MATIC': 0.9,
  'BNB': 320,
  'AVAX': 40,
  'FTM': 0.6,
  'USDC': 1.0
}