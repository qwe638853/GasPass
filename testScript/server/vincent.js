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

const LIT_RPC_URL = 'https://1rpc.io/arb';
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
  console.log('yellowstoneProvider:', yellowstoneProvider);
  delegateeSigner = new ethers.Wallet(DELEGATEE_PRIVATE_KEY, yellowstoneProvider);
  console.log('Delegatee address:', delegateeSigner.address);

  litNodeClient = new LitNodeClient({ litNetwork: 'datil', debug: true });
  
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
  
  // 直接呼叫 Bungee Quote API
  const BUNGEE_API_BASE_URL = "https://public-backend.bungee.exchange";
  console.log('Bungee API Base URL:', BUNGEE_API_BASE_URL);
  const quoteParams = {
    userAddress: delegatorPkpEthAddress,
    receiverAddress: bridgeParams.recipient,
    originChainId: parseInt(params.fromChainId),
    destinationChainId: parseInt(params.toChainId),
    inputToken: params.fromToken,
    outputToken: params.toToken,
    inputAmount: params.amount
  };
  
  try {
    const url = `${BUNGEE_API_BASE_URL}/api/v1/bungee/quote`;
    const queryParams = new URLSearchParams(quoteParams);
    const fullUrl = `${url}?${queryParams}`;
    
    console.log('Bungee Quote API URL:', fullUrl);
    
    const response = await fetch(fullUrl);
    const data = await response.json();
    const serverReqId = response.headers.get("server-req-id");
    
    console.log('Bungee Quote Response:', { 
      success: data.success, 
      statusCode: data.statusCode,
      serverReqId 
    });

    console.log('Bungee Quote Full Response:', JSON.stringify(data, null, 2));
    
    if (!data.success) {
      throw new Error(
        `Quote error: ${data.statusCode}: ${data.message}. server-req-id: ${serverReqId}`
      );
    }
    
    if (!data.result?.autoRoute) {
      throw new Error(`No autoRoute available. server-req-id: ${serverReqId}`);
    }
    
    const autoRoute = data.result.autoRoute;
    const quoteId = autoRoute.quoteId;
    const requestType = autoRoute.requestType;
    let witness = null;
    let signTypedData = null;
    
    console.log('AutoRoute structure:', {
      quoteId: !!quoteId,
      requestType: !!requestType,
      hasSignTypedData: !!autoRoute.signTypedData,
      hasApprovalData: !!autoRoute.approvalData
    });
    
    if (autoRoute.signTypedData) {
      signTypedData = autoRoute.signTypedData;
      console.log('SignTypedData structure:', {
        hasDomain: !!signTypedData.domain,
        hasTypes: !!signTypedData.types,
        hasValues: !!signTypedData.values,
        hasWitness: !!(signTypedData.values && signTypedData.values.witness)
      });
      
      // 完整印出 signTypedData 內容
      console.log('📋 Complete signTypedData content:');
      console.log(JSON.stringify(signTypedData, null, 2));
      
      if (signTypedData.values && signTypedData.values.witness) {
        witness = signTypedData.values.witness;
        console.log('✅ Witness extracted successfully:', {
          hasWitness: !!witness,
          witnessType: typeof witness,
          witnessKeys: witness ? Object.keys(witness) : null
        });
        
        // 也印出 witness 的完整內容
        console.log('📋 Complete witness content:');
        console.log(JSON.stringify(witness, null, 2));
      } else {
        console.log('❌ Failed to extract witness:', {
          hasValues: !!signTypedData.values,
          hasWitness: !!(signTypedData.values && signTypedData.values.witness),
          valuesKeys: signTypedData.values ? Object.keys(signTypedData.values) : null
        });
      }
    } else {
      console.log('⚠️ No signTypedData in autoRoute');
    }
    
    const approvalData = autoRoute.approvalData;
    
    console.log('📤 Final result structure:', {
      quoteId: !!quoteId,
      requestType: !!requestType,
      witness: !!witness,
      signTypedData: !!signTypedData,
      approvalData: !!approvalData
    });
    
    return {
      success: true,
      result: {
        quoteId,
        requestType,
        witness,
        signTypedData,
        approvalData,
        autoRoute,
        fullResponse: data,
        serverReqId
      }
    };
  } catch (error) {
    console.error('Bungee Quote API Error:', error);
    return {
      success: false,
      error: error.message || String(error)
    };
  }
}

export async function execute(bridgeParams, { delegatorPkpEthAddress }) {
  await ensureInitialized();
  console.log('🔍 vincentExecute 接收到的參數:');
  console.log('bridgeParams:', JSON.stringify(bridgeParams, null, 2));
  console.log('delegatorPkpEthAddress:', delegatorPkpEthAddress);
  
  const params = withEnvDefaults(bridgeParams);
  console.log('🔍 withEnvDefaults 處理後的參數:');
  console.log('params:', JSON.stringify(params, null, 2));
  
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
