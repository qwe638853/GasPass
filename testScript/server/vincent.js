import { ethers } from "ethers";
import { LitNodeClient } from '@lit-protocol/lit-node-client';
import { bundledVincentAbility } from '@qwe638853/ability-bungee';
import { getVincentAbilityClient } from '@lit-protocol/vincent-app-sdk/abilityClient';
import dotenv from 'dotenv';

dotenv.config();

let litNodeClient = null;
let abilityClient = null;
let delegateeSigner = null;

export async function ensureInitialized() {
  if (litNodeClient && abilityClient && delegateeSigner) return;

  const DELEGATEE_PRIVATE_KEY = process.env.DELEGATEE_PRIVATE_KEY;
  if (!DELEGATEE_PRIVATE_KEY) {
    throw new Error('DELEGATEE_PRIVATE_KEY 環境變數未設定');
  }

  const yellowstoneProvider = new ethers.JsonRpcProvider("https://yellowstone-rpc.litprotocol.com/");
  delegateeSigner = new ethers.Wallet(DELEGATEE_PRIVATE_KEY, yellowstoneProvider);
  console.log('Delegatee address:', delegateeSigner.address);

  litNodeClient = new LitNodeClient({ litNetwork: 'datil', debug: true });
  await litNodeClient.connect();
  console.log('Connected to Lit Network');

  abilityClient = getVincentAbilityClient({
    bundledVincentAbility: bundledVincentAbility,
    ethersSigner: delegateeSigner,
  });
}

export function getDelegateeAddress() {
  return delegateeSigner ? delegateeSigner.address : null;
}

export async function precheck(bridgeParams, { delegatorPkpEthAddress }) {
  await ensureInitialized();
  const precheckResult = await abilityClient.precheck(bridgeParams, {
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
  return await abilityClient.getSignedBridgeQuote(bridgeParams, {
    delegatorPkpEthAddress,
  });
}

export async function execute(bridgeParams, { delegatorPkpEthAddress }) {
  await ensureInitialized();
  return await abilityClient.execute(bridgeParams, { delegatorPkpEthAddress });
}

// Combined flow: auto-approve then bridge in單一呼叫
export async function executeCombined(bridgeParams, { delegatorPkpEthAddress }) {
  await ensureInitialized();
  const merged = { ...bridgeParams, separateApproval: false };
  return await abilityClient.execute(merged, { delegatorPkpEthAddress });
}