import { ethers } from "ethers";
import { LitNodeClient } from '@lit-protocol/lit-node-client';
import { bundledVincentAbility } from '@qwe638853/ability-bungee';
import { bundledVincentAbility as approvalBundledVincentAbility } from '@lit-protocol/vincent-ability-erc20-approval';
import { bundledVincentAbility as sponsorBundledVincentAbility } from '@qwe638853/ability-sponsor-transaction';
import { getVincentAbilityClient } from '@lit-protocol/vincent-app-sdk/abilityClient';
import dotenv from 'dotenv';
import { alchemyGasSponsorApiKey, alchemyGasSponsorPolicyId, getAlchemySponsorConfig } from './alchemy.mjs';

dotenv.config();

let litNodeClient = null;
let abilityClient = null;
let approvalAbilityClient = null;
let sponsorAbilityClient = null;
let delegateeSigner = null;

// 環境設定（提供預設值）
const LIT_NETWORK = process.env.LIT_NETWORK || 'datil';
const LIT_RPC_URL = process.env.LIT_RPC_URL || 'https://yellowstone-rpc.litprotocol.com/';
const DEFAULT_RPC_URL = process.env.VINCENT_DEFAULT_RPC_URL || '';
const DEFAULT_SLIPPAGE_BPS = process.env.VINCENT_DEFAULT_SLIPPAGE_BPS
  ? Number(process.env.VINCENT_DEFAULT_SLIPPAGE_BPS)
  : undefined;
// 僅使用 Permit2 流程，不使用贊助與原生交易
const DEFAULT_SEPARATE_APPROVAL = false;

function withEnvDefaults(bridgeParams = {}) {
  const merged = { ...bridgeParams };
  // 預設 RPC URL
  if (!merged.rpcUrl && DEFAULT_RPC_URL) merged.rpcUrl = DEFAULT_RPC_URL;
  // 預設 slippageBps
  if (merged.slippageBps == null && DEFAULT_SLIPPAGE_BPS != null) merged.slippageBps = DEFAULT_SLIPPAGE_BPS;
  // 預設是否分開核准
  merged.separateApproval = DEFAULT_SEPARATE_APPROVAL;
  // 清除贊助相關欄位（確保不會送出）
  delete merged.isSponsored;
  delete merged.sponsorApiKey;
  delete merged.sponsorPolicyId;
  return merged;
}

export async function ensureInitialized() {
  if (litNodeClient && abilityClient && approvalAbilityClient && sponsorAbilityClient && delegateeSigner) return;

  const DELEGATEE_PRIVATE_KEY = process.env.DELEGATEE_PRIVATE_KEY;
  if (!DELEGATEE_PRIVATE_KEY) {
    throw new Error('DELEGATEE_PRIVATE_KEY 環境變數未設定');
  }

  const yellowstoneProvider = new ethers.JsonRpcProvider(LIT_RPC_URL);
  delegateeSigner = new ethers.Wallet(DELEGATEE_PRIVATE_KEY, yellowstoneProvider);
  console.log('Delegatee address:', delegateeSigner.address);

  litNodeClient = new LitNodeClient({ litNetwork: LIT_NETWORK, debug: true });
  await litNodeClient.connect();
  console.log('Connected to Lit Network');

  abilityClient = getVincentAbilityClient({
    bundledVincentAbility: bundledVincentAbility,
    ethersSigner: delegateeSigner,
  });

  // 初始化 ERC20 Approve Ability Client（Permit2）
  approvalAbilityClient = getVincentAbilityClient({
    bundledVincentAbility: approvalBundledVincentAbility,
    ethersSigner: delegateeSigner,
  });

  // 初始化 Sponsor Transaction Ability Client
  sponsorAbilityClient = getVincentAbilityClient({
    bundledVincentAbility: sponsorBundledVincentAbility,
    ethersSigner: delegateeSigner,
  });
}

export function getDelegateeAddress() {
  return delegateeSigner ? delegateeSigner.address : null;
}

export async function precheck(bridgeParams, { delegatorPkpEthAddress }) {
  await ensureInitialized();
  const params = withEnvDefaults(bridgeParams);
  const precheckResult = await abilityClient.precheck(params, {
    delegatorPkpEthAddress,
  });
  
  if (precheckResult.success) {
    const r = precheckResult.result || {};
    const estAmount = r.estimatedToAmount ?? r.data?.estimatedDestinationAmount;
    const estFees = r.estimatedFees ?? r.data?.estimatedFees;
    const estTime = r.estimatedExecutionTime ?? r.data?.estimatedExecutionTime;
    if (estAmount != null) console.log('Estimated destination amount:', estAmount);
    if (estFees?.protocolFee != null) console.log('Protocol fee:', estFees.protocolFee);
    if (estTime != null) console.log('Estimated execution time:', String(estTime) + ' seconds');
  } else {
    // Handle different types of failures
    if (precheckResult.runtimeError) {
      console.error('Runtime error:', precheckResult.runtimeError);
    }
    if (precheckResult.schemaValidationError) {
      console.error('Schema validation error:', precheckResult.schemaValidationError);
    }
    if (precheckResult.result) {
      
      console.error('Bridge precheck failed:', precheckResult.result.error);
    }
  }
  return await precheckResult;
}

export async function getSignedBridgeQuote(bridgeParams, { delegatorPkpEthAddress }) {
  await ensureInitialized();
  const params = withEnvDefaults(bridgeParams);
  return await abilityClient.getSignedBridgeQuote(params, {
    delegatorPkpEthAddress,
  });
}

export async function execute(bridgeParams, { delegatorPkpEthAddress }) {
  await ensureInitialized();
  const params = withEnvDefaults(bridgeParams);
  return await abilityClient.execute(params, { delegatorPkpEthAddress });
}

// Combined flow: auto-approve then bridge in單一呼叫
export async function executeCombined(bridgeParams, { delegatorPkpEthAddress }) {
  await ensureInitialized();
  const merged = { ...withEnvDefaults(bridgeParams), separateApproval: false };
  return await abilityClient.execute(merged, { delegatorPkpEthAddress });
}

// -------- Permit2 ERC20 Approval Ability --------
// Params: { chainId: string|number, tokenIn: string, amountIn: string, rpcUrl: string }
export async function approvePermit2Precheck(approvalParams, { delegatorPkpEthAddress }) {
  await ensureInitialized();
  const params = { ...approvalParams };
  const normalized = {
    rpcUrl: String(params.rpcUrl),
    chainId: Number(params.chainId),
    spenderAddress: params?.spenderAddress && params.spenderAddress !== '0'
      ? String(params.spenderAddress)
      : '0x000000000022D473030F116dDEE9F6B43aC78BA3',
    tokenAddress: String(params.tokenIn || params.tokenAddress),
    tokenAmount: String(params.amountIn || params.tokenAmount),
  };
  return await approvalAbilityClient.precheck(normalized, { delegatorPkpEthAddress });
}

export async function sponsorTransactionPrecheck(sponsorParams, { delegatorPkpEthAddress }) {
  await ensureInitialized();
  // 從環境變數補充 sponsorApiKey 和 sponsorPolicyId
  const envConfig = getAlchemySponsorConfig();
  console.log('Alchemy Sponsor Config:', { 
    apiKey: envConfig.apiKey ? `${envConfig.apiKey.substring(0, 10)}...` : 'empty',
    policyId: envConfig.policyId || 'empty',
    enabled: envConfig.enabled 
  });
  
  const params = {
    ...sponsorParams,
    sponsorApiKey: sponsorParams.sponsorApiKey || alchemyGasSponsorApiKey || envConfig.apiKey,
    sponsorPolicyId: sponsorParams.sponsorPolicyId || alchemyGasSponsorPolicyId || envConfig.policyId,
  };
  
  console.log('Sponsor params:', {
    ...params,
    sponsorApiKey: params.sponsorApiKey ? `${params.sponsorApiKey.substring(0, 10)}...` : 'empty',
    sponsorPolicyId: params.sponsorPolicyId || 'empty'
  });
  
  return await sponsorAbilityClient.precheck(params, { delegatorPkpEthAddress });
}

export async function sponsorTransactionExecute(sponsorParams, { delegatorPkpEthAddress }) {
  await ensureInitialized();
  // 從環境變數補充 sponsorApiKey 和 sponsorPolicyId
  const envConfig = getAlchemySponsorConfig();
  console.log('Alchemy Sponsor Config:', { 
    apiKey: envConfig.apiKey ? `${envConfig.apiKey.substring(0, 10)}...` : 'empty',
    policyId: envConfig.policyId || 'empty',
    enabled: envConfig.enabled 
  });
  
  const params = {
    ...sponsorParams,
    sponsorApiKey: sponsorParams.sponsorApiKey || alchemyGasSponsorApiKey || envConfig.apiKey,
    sponsorPolicyId: sponsorParams.sponsorPolicyId || alchemyGasSponsorPolicyId || envConfig.policyId,
  };
  
  console.log('Sponsor params:', {
    ...params,
    sponsorApiKey: params.sponsorApiKey ? `${params.sponsorApiKey.substring(0, 10)}...` : 'empty',
    sponsorPolicyId: params.sponsorPolicyId || 'empty'
  });
  
  return await sponsorAbilityClient.execute(params, { delegatorPkpEthAddress });
}

export async function approvePermit2Execute(approvalParams, { delegatorPkpEthAddress }) {
  await ensureInitialized();
  // 允許透過 env 傳入贊助參數，以便底層採用 UserOp 贊助
  const params = { ...approvalParams };
  const normalized = {
    rpcUrl: String(params.rpcUrl),
    chainId: Number(params.chainId),
    spenderAddress: params?.spenderAddress && params.spenderAddress !== '0'
      ? String(params.spenderAddress)
      : '0x000000000022D473030F116dDEE9F6B43aC78BA3',
    tokenAddress: String(params.tokenIn || params.tokenAddress),
    tokenAmount: String(params.amountIn || params.tokenAmount),
    // 強制僅允許贊助交易
    alchemyGasSponsor: true,
    alchemyGasSponsorApiKey: params.alchemyGasSponsorApiKey || alchemyGasSponsorApiKey || getAlchemySponsorConfig().apiKey,
    alchemyGasSponsorPolicyId: params.alchemyGasSponsorPolicyId || alchemyGasSponsorPolicyId || getAlchemySponsorConfig().policyId,
  };
  if (!normalized.alchemyGasSponsorApiKey || !normalized.alchemyGasSponsorPolicyId) {
    throw new Error('Alchemy sponsor is required for approval: missing API key or policy id');
  }
  return await approvalAbilityClient.execute(normalized, { delegatorPkpEthAddress });
}