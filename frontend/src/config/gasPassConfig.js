/**
 * GasPass 前端配置文件
 * 包含合約地址、ABI 和網絡配置
 */

export const GAS_PASS_CONFIG = {
  // 合約地址
  contractAddress: '0xF0f26bAfEf9D969a5A1660959C886907D6312cF7',
  
  // 網絡配置
  network: {
    name: 'Arbitrum One',
    chainId: 42161,
    rpcUrl: 'https://arb1.arbitrum.io/rpc',
    backupRpcUrls: [
      'https://arbitrum-mainnet.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161',
      'https://arbitrum-mainnet.g.alchemy.com/v2/demo',
      'https://rpc.ankr.com/arbitrum'
    ],
    explorerUrl: 'https://arbiscan.io'
  },
  
  // USDC 配置
  usdc: {
    address: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
    decimals: 6,
    symbol: 'USDC'
  },
  
  // 服務配置
  relayerUrl: import.meta.env.VITE_RELAYER_URL || 'http://localhost:3001'
};

// GasPass 合約 ABI（前端版本）
export const GAS_PASS_ABI = [
  // View functions
  'function totalSupply() view returns (uint256)',
  'function tokenByIndex(uint256) view returns (uint256)',
  'function ownerOf(uint256) view returns (address)',
  'function balanceOf(uint256 tokenId) view returns (uint256)',
  'function ownerNonces(address) view returns (uint256)',
  'function nonces(uint256) view returns (uint256)',
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
    name: 'Ethereum',
    nativeSymbol: 'ETH',
    nativeName: 'Ether'
  },
  42161: {
    name: 'Arbitrum One',
    nativeSymbol: 'ETH',
    nativeName: 'Ether'
  },
  8453: {
    name: 'Base Mainnet',
    nativeSymbol: 'ETH',
    nativeName: 'Ether'
  },
  43114: {
    name: 'Avalanche C-Chain',
    nativeSymbol: 'AVAX',
    nativeName: 'Avalanche'
  },
  56: {
    name: 'Binance Smart Chain',
    nativeSymbol: 'BNB',
    nativeName: 'Binance Coin'
  },
  100: {
    name: 'Gnosis Chain',
    nativeSymbol: 'xDAI',
    nativeName: 'Gnosis'
  },
  5000: {
    name: 'Mantle Network',
    nativeSymbol: 'MNT',
    nativeName: 'Mantle'
  },
  34443: {
    name: 'Mode Mainnet',
    nativeSymbol: 'ETH',
    nativeName: 'Ether'
  },
  130: {
    name: 'Unichain Mainnet',
    nativeSymbol: 'UNIETH',
    nativeName: 'Uni Ether'
  },
  1868: {
    name: 'Soneium Mainnet',
    nativeSymbol: 'Soneium',
    nativeName: 'Soneium'
  },
  57073: {
    name: 'Ink Mainnet',
    nativeSymbol: 'INK',
    nativeName: 'Ink'
  },
  81457: {
    name: 'Blast Mainnet',
    nativeSymbol: 'BLAST',
    nativeName: 'Blast'
  },
  59144: {
    name: 'Linea',
    nativeSymbol: 'ETH',
    nativeName: 'Ether'
  },
  137: {
    name: 'Polygon',
    nativeSymbol: 'MATIC',
    nativeName: 'Polygon'
  },
  534352: {
    name: 'Scroll',
    nativeSymbol: 'ETH',
    nativeName: 'Ether'
  },
  146: {
    name: 'Sonic',
    nativeSymbol: 'S',
    nativeName: 'Sonic'
  },
  10: {
    name: 'Optimism',
    nativeSymbol: 'ETH',
    nativeName: 'Ether'
  },
  80094: {
    name: 'Berachain',
    nativeSymbol: 'BERA',
    nativeName: 'Berachain'
  }
};

export default GAS_PASS_CONFIG;
