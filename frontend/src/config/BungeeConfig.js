export const BUNGEE_CONFIG = {
  baseUrl: 'https://public-backend.bungee.exchange',
  inboxAddress: '0xA3BF43451CdEb6DEC588B8833838fC419CE4F54c',
  gatewayAddress: '0xCdEa28Ee7BD5bf7710B294d9391e1b6A318d809a',
  gasPassAddress: '0xF0f26bAfEf9D969a5A1660959C886907D6312cF7',
  gasPassAbi: [
    'function autoRefuel(uint256 tokenId, address inbox, bytes request, bytes32 sorHash, uint256 destinationChainId) external'
  ],
  // Token List API
  tokenListApi: 'https://public-backend.bungee.exchange/api/v1/tokens/list'
};

// Supported chains configuration
export const SUPPORTED_CHAINS = {
  1: {
    rpc: 'https://mainnet.infura.io/v3/YOUR-API-KEY',
    name: 'Ethereum',
    nativeSymbol: 'ETH',
    nativeName: 'Ether',
    icon: '⟠',
    logo: 'https://media.socket.tech/networks/ethereum.svg'
  },
  42161: {
    rpc: 'https://arb1.arbitrum.io/rpc',
    name: 'Arbitrum One',
    nativeSymbol: 'ETH',
    nativeName: 'Ether',
    icon: '🔷',
    logo: 'https://media.socket.tech/networks/arbitrum.svg'
  },
  8453: {
    rpc: 'https://mainnet.base.org',
    name: 'Base Mainnet',
    nativeSymbol: 'ETH',
    nativeName: 'Ether',
    icon: '🔵',
    logo: 'https://media.socket.tech/networks/base.svg'
  },
  43114: {
    rpc: 'https://api.avax.network/ext/bc/C/rpc',
    name: 'Avalanche C-Chain',
    nativeSymbol: 'AVAX',
    nativeName: 'Avalanche',
    icon: '🔺',
    logo: 'https://media.socket.tech/networks/avalanche.svg'
  },
  56: {
    rpc: 'https://bsc-dataseed.binance.org/',
    name: 'Binance Smart Chain',
    nativeSymbol: 'BNB',
    nativeName: 'Binance Coin',
    icon: '🟡',
    logo: 'https://media.socket.tech/networks/bsc.svg'
  },
  100: {
    rpc: 'https://rpc.gnosischain.com',
    name: 'Gnosis Chain',
    nativeSymbol: 'xDAI',
    nativeName: 'Gnosis',
    icon: '🟣',
    logo: 'https://media.socket.tech/networks/gnosis.svg'
  },
  5000: {
    rpc: 'https://rpc.mantle.xyz/',
    name: 'Mantle Network',
    nativeSymbol: 'MNT',
    nativeName: 'Mantle',
    icon: '🟤',
    logo: 'https://media.socket.tech/networks/mantle.png'
  },
  34443: {
    rpc: 'https://mainnet.mode.network/',
    name: 'Mode Mainnet',
    nativeSymbol: 'ETH',
    nativeName: 'Ether',
    icon: '🟠',
    logo: 'https://media.socket.tech/networks/mode.svg'
  },
  130: {
    rpc: 'https://mainnet.unichain.org',
    name: 'Unichain Mainnet',
    nativeSymbol: 'UNIETH',
    nativeName: 'Uni Ether',
    icon: '🔗',
    logo: 'https://media.socket.tech/networks/unichain.png'
  },
  1868: {
    rpc: 'https://rpc.soneium.org/',
    name: 'Soneium Mainnet',
    nativeSymbol: 'Soneium',
    nativeName: 'Soneium',
    icon: '🎵',
    logo: 'https://media.socket.tech/networks/soneium.png'
  },
  57073: {
    rpc: 'https://rpc-qnd.inkonchain.com',
    name: 'Ink Mainnet',
    nativeSymbol: 'INK',
    nativeName: 'Ink',
    icon: '🖋️',
    logo: 'https://media.socket.tech/networks/ink.svg'
  },
  81457: {
    rpc: 'https://rpc.ankr.com/blast',
    name: 'Blast Mainnet',
    nativeSymbol: 'BLAST',
    nativeName: 'Blast',
    icon: '💥',
    logo: 'https://media.socket.tech/networks/blast.svg'
  },
  59144: {
    rpc: 'https://linea-rpc.publicnode.com',
    name: 'Linea',
    nativeSymbol: 'ETH',
    nativeName: 'Ether',
    icon: '📏',
    logo: 'https://media.socket.tech/networks/linea.svg'
  },
  137: {
    rpc: 'https://polygon-rpc.com',
    name: 'Polygon',
    nativeSymbol: 'MATIC',
    nativeName: 'Polygon',
    icon: '🔷',
    logo: 'https://media.socket.tech/networks/polygon.svg'
  },
  534352: {
    rpc: 'https://scroll-rpc.publicnode.com',
    name: 'Scroll',
    nativeSymbol: 'ETH',
    nativeName: 'Ether',
    icon: '📜',
    logo: 'https://media.socket.tech/networks/scroll.svg'
  },
  146: {
    rpc: 'https://rpc.soniclabs.com',
    name: 'Sonic',
    nativeSymbol: 'S',
    nativeName: 'Sonic',
    icon: '🎵',
    logo: 'https://media.socket.tech/networks/sonic.svg'
  },
  10: {
    rpc: 'https://mainnet.optimism.io',
    name: 'Optimism',
    nativeSymbol: 'ETH',
    nativeName: 'Ether',
    icon: '🔴',
    logo: 'https://media.socket.tech/networks/optimism.svg'
  },
  80094: {
    rpc: 'https://rpc.berachain.com',
    name: 'Berachain',
    nativeSymbol: 'BERA',
    nativeName: 'Berachain',
    icon: '🐻',
    logo: 'https://media.socket.tech/networks/berachain.svg'
  }
};
