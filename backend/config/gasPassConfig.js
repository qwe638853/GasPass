/**
 * GasPass 統一配置文件
 * 包含合約地址、ABI 和網絡配置
 */

export const GAS_PASS_CONFIG = {
  // 合約地址
  contractAddress: '0x98519ccdb35C9ed521bbcd00435fE2ab2D1305f7',
  
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

// GasPass Contract ABI (updated)
export const GAS_PASS_ABI = [
  // ===== View (public getters) =====
  'function name() view returns (string)',
  'function symbol() view returns (string)',
  'function decimals() view returns (uint8)',

  'function totalSupply() view returns (uint256)',
  'function tokenByIndex(uint256) view returns (uint256)',
  'function ownerOf(uint256) view returns (address)',
  'function balanceOf(uint256 tokenId) view returns (uint256)',

  // mappings / public vars
  'function nonces(uint256 tokenId) view returns (uint256)',
  'function ownerNonces(address owner) view returns (uint256)',
  'function agentToWallet(address agent) view returns (address)',
  'function stablecoin() view returns (address)',
  'function relayer() view returns (address)',
  'function bungeeGateway() view returns (address)',
  'function bungeeInbox() view returns (address)',

  // chainPolicies now returns lastRefueled as well
  'function chainPolicies(uint256 tokenId, uint256 chainId) view returns (uint128 gasAmount, uint128 threshold, address agent, uint256 lastRefueled)',

  // (可選) 常數型別雜湊的 getter（若前端需要本地計算/校驗可保留）
  'function SET_REFUEL_POLICY_TYPEHASH() view returns (bytes32)',
  'function CANCEL_REFUEL_POLICY_TYPEHASH() view returns (bytes32)',
  'function STABLECOIN_PERMIT_TYPEHASH() view returns (bytes32)',
  'function MINT_WITH_SIG_TYPEHASH() view returns (bytes32)',
  'function DEPOSIT_WITH_SIG_TYPEHASH() view returns (bytes32)',
  'function MINT_BATCH_WITH_SIG_TYPEHASH() view returns (bytes32)',
  'function SET_AGENT_TO_WALLET_WITH_SIG_TYPEHASH() view returns (bytes32)',

  // ===== Write (external) =====

  // Mint / Deposit（含 EIP-2612 permit 參數）
  'function mintWithSig((address to,uint256 value,(address owner,address spender,uint256 value,uint256 deadline,uint8 v,bytes32 r,bytes32 s) permitData,address agent,uint256 nonce,uint256 deadline) typedData, bytes signature) external',

  'function mintBatchWithSig((address to,uint256 amount,uint256 singleValue,address agent,(address owner,address spender,uint256 value,uint256 deadline,uint8 v,bytes32 r,bytes32 s) permitData,uint256 nonce,uint256 deadline) typedData, bytes signature) external',

  'function depositWithSig((uint256 tokenId,uint256 amount,(address owner,address spender,uint256 value,uint256 deadline,uint8 v,bytes32 r,bytes32 s) permitData,uint256 nonce,uint256 deadline) typedData, bytes signature) external',

  // Agent 綁定（簽章版）
  'function setAgentToWalletWithSig((address agent,address wallet,uint256 nonce,uint256 deadline) typedData, bytes signature) external',

  // Refuel Policy（直呼 / 簽章版）
  'function setRefuelPolicy(uint256 tokenId, uint256 targetChainId, uint128 gasAmount, uint128 threshold, address agent) external',
  'function setRefuelPolicyWithSig((uint256 tokenId,uint256 targetChainId,uint128 gasAmount,uint128 threshold,address agent,uint256 nonce,uint256 deadline) policy, bytes signature) external',
  'function cancelRefuelPolicy(uint256 tokenId, uint256 targetChainId) external',
  'function cancelRefuelPolicyWithSig((uint256 tokenId,uint256 targetChainId,uint256 nonce,uint256 deadline) typedData, bytes signature) external',

  // Auto Refuel（新版 5 參數；req 為巢狀 tuple，依 IBungeeInbox.Request 推導）
  // 注意：若 IBungeeInbox.Request 實際欄位不同，請提供介面以便我精準同步
  'function autoRefuel(uint256 tokenId, address inbox, ( (uint256 originChainId,uint256 destinationChainId,uint256 deadline,uint256 nonce,address sender,address receiver,address delegate,address bungeeGateway,uint256 switchboardId,address inputToken,uint256 inputAmount,address outputToken,uint256 minOutputAmount,uint256 refuelAmount) basicReq, address swapOutputToken, uint256 minSwapOutput, bytes extraData ) req, bytes32 expectedSorHash, uint256 targetChainId) external',

  // Withdraw / Admin
  'function withdrawAllUSDC(uint256 tokenId, address to) external',
  'function withdrawFees(address to) external',
  'function setRelayer(address _relayer) external',

  // (測試用、onlyOwner)
  'function withdrawUSDC() external'
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
