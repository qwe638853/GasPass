export const BUNGEE_CONFIG = {
  baseUrl: 'https://public-backend.bungee.exchange',
  inboxAddress: '0xA3BF43451CdEb6DEC588B8833838fC419CE4F54c',
  gatewayAddress: '0xCdEa28Ee7BD5bf7710B294d9391e1b6A318d809a',
  gasPassAddress: '0x98519ccdb35C9ed521bbcd00435fE2ab2D1305f7',
  gasPassAbi: [
    'function autoRefuel(uint256 tokenId, address inbox, bytes request, bytes32 sorHash, uint256 destinationChainId) external'
  ]
};

// 支援的鏈配置
export const SUPPORTED_CHAINS = {
  1: {
    rpc: 'https://mainnet.infura.io/v3/YOUR-API-KEY',
    name: 'Ethereum',
    nativeSymbol: 'ETH',
    nativeName: 'Ether',
    icon: '⟠',
    logo: null
  },
  42161: {
    rpc: 'https://arb1.arbitrum.io/rpc',
    name: 'Arbitrum One',
    nativeSymbol: 'ETH',
    nativeName: 'Ether',
    icon: '🔷',
    logo: null
  },
  8453: {
    rpc: 'https://mainnet.base.org',
    name: 'Base Mainnet',
    nativeSymbol: 'ETH',
    nativeName: 'Ether',
    icon: '🔵',
    logo: null
  },
  43114: {
    rpc: 'https://api.avax.network/ext/bc/C/rpc',
    name: 'Avalanche C-Chain',
    nativeSymbol: 'AVAX',
    nativeName: 'Avalanche',
    icon: '🔺',
    logo: null
  },
  56: {
    rpc: 'https://bsc-dataseed.binance.org/',
    name: 'Binance Smart Chain',
    nativeSymbol: 'BNB',
    nativeName: 'Binance Coin',
    icon: '🟡',
    logo: null
  },
  100: {
    rpc: 'https://rpc.gnosischain.com',
    name: 'Gnosis Chain',
    nativeSymbol: 'xDAI',
    nativeName: 'Gnosis',
    icon: '🟣',
    logo: null
  },
  5000: {
    rpc: 'https://rpc.mantle.xyz/',
    name: 'Mantle Network',
    nativeSymbol: 'MNT',
    nativeName: 'Mantle',
    icon: '🟤',
    logo: null
  },
  34443: {
    rpc: 'https://mainnet.mode.network/',
    name: 'Mode Mainnet',
    nativeSymbol: 'ETH',
    nativeName: 'Ether',
    icon: '🟠',
    logo: null
  },
  130: {
    rpc: 'https://mainnet.unichain.org',
    name: 'Unichain Mainnet',
    nativeSymbol: 'UNIETH',
    nativeName: 'Uni Ether',
    icon: '🔗',
    logo: null
  },
  1868: {
    rpc: 'https://rpc.soneium.org/',
    name: 'Soneium Mainnet',
    nativeSymbol: 'Soneium',
    nativeName: 'Soneium',
    icon: '🎵',
    logo: null
  },
  57073: {
    rpc: 'https://rpc-qnd.inkonchain.com',
    name: 'Ink Mainnet',
    nativeSymbol: 'INK',
    nativeName: 'Ink',
    icon: '🖋️',
    logo: null
  },
  81457: {
    rpc: 'https://rpc.ankr.com/blast',
    name: 'Blast Mainnet',
    nativeSymbol: 'BLAST',
    nativeName: 'Blast',
    icon: '💥',
    logo: null
  },
  59144: {
    rpc: 'https://linea-rpc.publicnode.com',
    name: 'Linea',
    nativeSymbol: 'ETH',
    nativeName: 'Ether',
    icon: '📏',
    logo: null
  },
  137: {
    rpc: 'https://polygon-rpc.com',
    name: 'Polygon',
    nativeSymbol: 'MATIC',
    nativeName: 'Polygon',
    icon: '🔷',
    logo: null
  },
  534352: {
    rpc: 'https://scroll-rpc.publicnode.com',
    name: 'Scroll',
    nativeSymbol: 'ETH',
    nativeName: 'Ether',
    icon: '📜',
    logo: null
  },
  146: {
    rpc: 'https://rpc.soniclabs.com',
    name: 'Sonic',
    nativeSymbol: 'S',
    nativeName: 'Sonic',
    icon: '🎵',
    logo: null
  },
  10: {
    rpc: 'https://mainnet.optimism.io',
    name: 'Optimism',
    nativeSymbol: 'ETH',
    nativeName: 'Ether',
    icon: '🔴',
    logo: null
  },
  80094: {
    rpc: 'https://rpc.berachain.com',
    name: 'Berachain',
    nativeSymbol: 'BERA',
    nativeName: 'Berachain',
    icon: '🐻',
    logo: null
  }
};
