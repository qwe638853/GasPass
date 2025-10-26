/**
 * GasPass 統一配置文件
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
  
  // Fee related functions
  'function totalFeesCollected() view returns (uint256)',
  'function getWithdrawableFees() view returns (uint256)',

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

// Auto Refuel ABI - 用於自動補氣功能
export const AUTO_REFUEL_ABI = [
  'function autoRefuel(uint256 tokenId, address inbox, ( (uint256 originChainId,uint256 destinationChainId,uint256 deadline,uint256 nonce,address sender,address receiver,address delegate,address bungeeGateway,uint256 switchboardId,address inputToken,uint256 inputAmount,address outputToken,uint256 minOutputAmount,uint256 refuelAmount) basicReq, address swapOutputToken, uint256 minSwapOutput, bytes extraData ) req, bytes32 expectedSorHash, uint256 targetChainId) external'
];

// Manual Refuel ABI - 用於手動補氣功能
export const MANUAL_REFUEL_ABI = [
  'function withdrawAllUSDC(uint256 tokenId, address to) external'
];

export default GAS_PASS_CONFIG;
