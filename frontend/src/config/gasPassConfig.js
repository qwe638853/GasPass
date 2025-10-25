/**
 * GasPass 前端配置文件
 * 包含合約地址、ABI 和網絡配置
 */

export const GAS_PASS_CONFIG = {
  // 合約地址
  contractAddress: '0xdB140B58D6E3988F5C453E192295748c1438d8D4',
  
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
  relayerUrl: import.meta.env.VITE_RELAYER_URL || 'http://localhost:3001'
};

// GasPass 合約 ABI（前端版本）
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
