import { ethers } from 'ethers';
import { LitNodeClient } from '@lit-protocol/lit-node-client';
import { bundledVincentAbility as sponsorBundledVincentAbility } from '@qwe638853/ability-sponsor-transaction';
import { bundledVincentAbility as bungeeBundledVincentAbility } from '@qwe638853/ability-bungee';
import { getVincentAbilityClient } from '@lit-protocol/vincent-app-sdk/abilityClient';

let litNodeClient = null;
let sponsorAbilityClient = null;
let bungeeAbilityClient = null;
let delegateeSigner = null;

// Environment settings
const LIT_NETWORK = process.env.LIT_NETWORK || 'datil';
const LIT_RPC_URL = process.env.LIT_RPC_URL || 'https://yellowstone-rpc.litprotocol.com/';

const alchemyGasSponsorApiKey = process.env.ALCHEMY_GAS_SPONSOR_API_KEY;
const alchemyGasSponsorPolicyId = process.env.ALCHEMY_GAS_SPONSOR_POLICY_ID;
const delegateePrivateKey = process.env.DELEGATEE_PRIVATE_KEY;
if (!delegateePrivateKey) {
  throw new Error('delegateePrivateKey environment variable not set');
}
if (!alchemyGasSponsorApiKey) {
  throw new Error('alchemyGasSponsorApiKey environment variable not set');
}
if (!alchemyGasSponsorPolicyId) {
  throw new Error('alchemyGasSponsorPolicyId environment variable not set');
}
export async function ensureInitialized() {
  if (litNodeClient && sponsorAbilityClient && bungeeAbilityClient && delegateeSigner) return;

  const provider = new ethers.JsonRpcProvider(LIT_RPC_URL);
  delegateeSigner = new ethers.Wallet(delegateePrivateKey, provider);
  console.log('Delegatee address:', delegateeSigner.address);

  litNodeClient = new LitNodeClient({ litNetwork: LIT_NETWORK, debug: true });
  await litNodeClient.connect();
  console.log('Connected to Lit Network');

  sponsorAbilityClient = getVincentAbilityClient({
    bundledVincentAbility: sponsorBundledVincentAbility,
    ethersSigner: delegateeSigner,
    litNodeClient: litNodeClient,
  });

  bungeeAbilityClient = getVincentAbilityClient({
    bundledVincentAbility: bungeeBundledVincentAbility,
    ethersSigner: delegateeSigner,
    litNodeClient: litNodeClient,
  });
}

export function getDelegateeAddress() {
  return delegateeSigner ? delegateeSigner.address : null;
}

export { sponsorAbilityClient, bungeeAbilityClient, alchemyGasSponsorApiKey, alchemyGasSponsorPolicyId};
