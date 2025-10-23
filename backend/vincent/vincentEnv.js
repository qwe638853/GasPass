import { ethers } from 'ethers';
import { LitNodeClient } from '@lit-protocol/lit-node-client';
import { bundledVincentAbility as sponsorBundledVincentAbility } from '@qwe638853/ability-sponsor-transaction';
import { bundledVincentAbility as bungeeBundledVincentAbility } from '@qwe638853/ability-bungee';
import { getVincentAbilityClient } from '@lit-protocol/vincent-app-sdk/abilityClient';


const rpcUrl = 'https://yellowstone-rpc.litprotocol.com/';
const litNetwork = 'datil';

const delegateePrivateKey = process.env.DELEGATEE_PRIVATE_KEY;
const alchemyGasSponsorApiKey = process.env.ALCHEMY_GAS_SPONSOR_API_KEY;
const alchemyGasSponsorPolicyId = process.env.ALCHEMY_GAS_SPONSOR_POLICY_ID;
if (!delegateePrivateKey) {
  throw new Error('delegateePrivateKey 環境變數未設定');
}
if (!alchemyGasSponsorApiKey) {
  throw new Error('alchemyGasSponsorApiKey 環境變數未設定');
}
if (!alchemyGasSponsorPolicyId) {
  throw new Error('alchemyGasSponsorPolicyId 環境變數未設定');
}

const provider = new ethers.JsonRpcProvider(rpcUrl);
const delegateeSigner = new ethers.Wallet(delegateePrivateKey, provider);
// eslint-disable-next-line no-console
console.log('Delegatee address:', delegateeSigner.address);

const litNodeClient = new LitNodeClient({ litNetwork, debug: true });
await litNodeClient.connect();
// eslint-disable-next-line no-console
console.log('Connected to Lit Network');

const sponsorAbilityClient = getVincentAbilityClient({
  sponsorBundledVincentAbility,
  ethersSigner: delegateeSigner,
});

const bungeeAbilityClient = getVincentAbilityClient({
  bungeeBundledVincentAbility,
  ethersSigner: delegateeSigner,
});


export function getDelegateeAddress() {
  return delegateeSigner ? delegateeSigner.address : null;
}

export { sponsorAbilityClient, bungeeAbilityClient, rpcUrl};
