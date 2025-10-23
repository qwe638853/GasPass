/**
 * GasPass 統一配置文件
 * 包含合約地址、ABI 和網絡配置
 */

export const GAS_PASS_CONFIG = {
  // 合約地址
  contractAddress: '0x6F2997d9929C1b4eAF49F7fe4F4Dc12A5588D6d6',
  
  // 網絡配置
  network: {
    name: 'Arbitrum One',
    chainId: 42161,
    rpcUrl: 'https://arb1.arbitrum.io/rpc',
    explorerUrl: 'https://arbiscan.io'
  },
  
  // USDC 配置
  usdc: {
    address: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
    decimals: 6,
    symbol: 'USDC'
  },
  
  // 服務配置
  service: {
    port: 3001,
    monitorInterval: 60000, // 1 分鐘
    maxRetries: 3
  }
};

// GasPass 合約 ABI
export const GAS_PASS_ABI = [
  // View functions
  'function totalSupply() view returns (uint256)',
  'function tokenByIndex(uint256) view returns (uint256)',
  'function ownerOf(uint256) view returns (address)',
  'function balanceOf(uint256 tokenId) view returns (uint256)',
  'function chainPolicies(uint256, uint256) view returns (uint128 gasAmount, uint128 threshold, address agent)',
  'function totalFeesCollected() view returns (uint256)',
  'function getWithdrawableFees() view returns (uint256)',
  'function getAgentToWallet(address agent) view returns (address)',
  
  // Write functions
  'function mintWithSig(tuple(address to, uint256 value, tuple(address owner, address spender, uint256 value, uint256 deadline, uint8 v, bytes32 r, bytes32 s) permitData, address agent, uint256 nonce, uint256 deadline) typedData, bytes signature) external',
  'function mintBatchWithSig(tuple(address to, uint256 amount, uint256 singleValue, address agent, tuple(address owner, address spender, uint256 value, uint256 deadline, uint8 v, bytes32 r, bytes32 s) permitData, uint256 nonce, uint256 deadline) typedData, bytes signature) external',
  'function depositWithSig(tuple(uint256 tokenId, uint256 amount, tuple(address owner, address spender, uint256 value, uint256 deadline, uint8 v, bytes32 r, bytes32 s) permitData, uint256 nonce, uint256 deadline) typedData, bytes signature) external',
  'function setRefuelPolicyWithSig(tuple(uint256 tokenId, uint256 targetChainId, uint128 gasAmount, uint128 threshold, address agent, uint256 nonce, uint256 deadline) policy, bytes signature) external',
  'function cancelRefuelPolicyWithSig(tuple(uint256 tokenId, uint256 targetChainId, uint256 nonce, uint256 deadline) typedData, bytes signature) external',
  'function setAgentToWalletWithSig(tuple(address agent, address wallet, uint256 nonce, uint256 deadline) typedData, bytes signature) external',
  'function autoRefuel(uint256 tokenId, uint256 targetChainId) external',
  'function withdrawAllUSDC(uint256 tokenId, address to) external',
  'function withdrawFees(address to) external',
  'function setRelayer(address _relayer) external'
];

// 支援的鏈配置
export const SUPPORTED_CHAINS = {
  1: {
    rpc: 'https://mainnet.infura.io/v3/YOUR-API-KEY',
    name: 'Ethereum',
    nativeSymbol: 'ETH',
    nativeName: 'Ether'
  },
  42161: {
    rpc: 'https://arb1.arbitrum.io/rpc',
    name: 'Arbitrum One',
    nativeSymbol: 'ETH',
    nativeName: 'Ether'
  },
  8453: {
    rpc: 'https://mainnet.base.org',
    name: 'Base Mainnet',
    nativeSymbol: 'ETH',
    nativeName: 'Ether'
  },
  43114: {
    rpc: 'https://api.avax.network/ext/bc/C/rpc',
    name: 'Avalanche C-Chain',
    nativeSymbol: 'AVAX',
    nativeName: 'Avalanche'
  },
  56: {
    rpc: 'https://bsc-dataseed.binance.org/',
    name: 'Binance Smart Chain',
    nativeSymbol: 'BNB',
    nativeName: 'Binance Coin'
  },
  100: {
    rpc: 'https://rpc.gnosischain.com',
    name: 'Gnosis Chain',
    nativeSymbol: 'xDAI',
    nativeName: 'Gnosis'
  },
  5000: {
    rpc: 'https://rpc.mantle.xyz/',
    name: 'Mantle Network',
    nativeSymbol: 'MNT',
    nativeName: 'Mantle'
  },
  34443: {
    rpc: 'https://mainnet.mode.network/',
    name: 'Mode Mainnet',
    nativeSymbol: 'ETH',
    nativeName: 'Ether'
  },
  130: {
    rpc: 'https://mainnet.unichain.org',
    name: 'Unichain Mainnet',
    nativeSymbol: 'UNIETH',
    nativeName: 'Uni Ether'
  },
  1868: {
    rpc: 'https://rpc.soneium.org/',
    name: 'Soneium Mainnet',
    nativeSymbol: 'Soneium',
    nativeName: 'Soneium'
  },
  57073: {
    rpc: 'https://rpc-qnd.inkonchain.com',
    name: 'Ink Mainnet',
    nativeSymbol: 'INK',
    nativeName: 'Ink'
  },
  81457: {
    rpc: 'https://rpc.ankr.com/blast',
    name: 'Blast Mainnet',
    nativeSymbol: 'BLAST',
    nativeName: 'Blast'
  },
  59144: {
    rpc: 'https://linea-rpc.publicnode.com',
    name: 'Linea',
    nativeSymbol: 'ETH',
    nativeName: 'Ether'
  },
  137: {
    rpc: 'https://polygon-rpc.com',
    name: 'Polygon',
    nativeSymbol: 'MATIC',
    nativeName: 'Polygon'
  },
  534352: {
    rpc: 'https://scroll-rpc.publicnode.com',
    name: 'Scroll',
    nativeSymbol: 'ETH',
    nativeName: 'Ether'
  },
  146: {
    rpc: 'https://rpc.soniclabs.com',
    name: 'Sonic',
    nativeSymbol: 'S',
    nativeName: 'Sonic'
  },
  10: {
    rpc: 'https://mainnet.optimism.io',
    name: 'Optimism',
    nativeSymbol: 'ETH',
    nativeName: 'Ether'
  },
  80094: {
    rpc: 'https://rpc.berachain.com',
    name: 'Berachain',
    nativeSymbol: 'BERA',
    nativeName: 'Berachain'
  }
};

export default GAS_PASS_CONFIG;
