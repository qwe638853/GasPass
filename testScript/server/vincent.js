import { ethers } from "ethers";
import { LitNodeClient } from '@lit-protocol/lit-node-client';
import { bundledVincentAbility } from '@lit-protocol/vincent-ability-debridge';
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
    bundledVincentAbility,
    ethersSigner: delegateeSigner,
  });
}

export function getDelegateeAddress() {
  return delegateeSigner ? delegateeSigner.address : null;
}

export async function precheck(bridgeParams, { delegatorPkpEthAddress, rpcUrl }) {
  await ensureInitialized();
  return await abilityClient.precheck(bridgeParams, {
    delegatorPkpEthAddress,
    rpcUrl,
  });
}

export async function getSignedBridgeQuote(bridgeParams, { delegatorPkpEthAddress }) {
  await ensureInitialized();
  return await abilityClient.getSignedBridgeQuote(bridgeParams, {
    delegatorPkpEthAddress,
  });
}

export async function execute(bridgeParams, { delegatorPkpEthAddress }) {
  await ensureInitialized();
  return await abilityClient.execute(bridgeParams, {
    delegatorPkpEthAddress,
  });
}