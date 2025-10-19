import { ethers } from 'ethers';
import { LitNodeClient } from '@lit-protocol/lit-node-client';
import { bundledVincentAbility } from '@lit-protocol/vincent-ability-debridge';
import { getVincentAbilityClient } from '@lit-protocol/vincent-app-sdk/abilityClient';


const rpcUrl = ='https://yellowstone-rpc.litprotocol.com/';
const litNetwork = 'datil';

const delegateePrivateKey = process.env.DELEGATEE_PRIVATE_KEY;
if (!delegateePrivateKey) {
  throw new Error('delegateePrivateKey 環境變數未設定');
}

const provider = new ethers.JsonRpcProvider(rpcUrl);
const delegateeSigner = new ethers.Wallet(delegateePrivateKey, provider);
// eslint-disable-next-line no-console
console.log('Delegatee address:', delegateeSigner.address);

const litNodeClient = new LitNodeClient({ litNetwork, debug: true });
await litNodeClient.connect();
// eslint-disable-next-line no-console
console.log('Connected to Lit Network');

const abilityClient = getVincentAbilityClient({
    bundledVincentAbility,
    ethersSigner: delegateeSigner,
});



export function getDelegateeAddress() {
  return delegateeSigner ? delegateeSigner.address : null;
}

export { abilityClient , rpcUrl};
