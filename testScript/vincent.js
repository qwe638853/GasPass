import { ethers } from "ethers";
import { LitNodeClient } from '@lit-protocol/lit-node-client';
import { bundledVincentAbility } from '@lit-protocol/vincent-ability-debridge';
import { getVincentAbilityClient } from '@lit-protocol/vincent-app-sdk/abilityClient';

import dotenv from 'dotenv';

// 載入環境變數
dotenv.config();

const DELEGATEE_PRIVATE_KEY = process.env.DELEGATEE_PRIVATE_KEY;
const delegatorPkpEthAddress = process.env.DELEGATOR_PKP_ETH_ADDRESS;
const RPC_URL = process.env.RPC_URL || "https://sepolia-rollup.arbitrum.io/rpc";
const CHAIN_ID = parseInt(process.env.CHAIN_ID) || 8453;

// 驗證必要的環境變數
if (!DELEGATEE_PRIVATE_KEY) {
  throw new Error('DELEGATEE_PRIVATE_KEY 環境變數未設定');
}
if (!delegatorPkpEthAddress) {
  throw new Error('DELEGATOR_PKP_ETH_ADDRESS 環境變數未設定');
}

const yellowstoneProvider = new ethers.JsonRpcProvider("https://yellowstone-rpc.litprotocol.com/");
const delegateeSigner = new ethers.Wallet(DELEGATEE_PRIVATE_KEY, yellowstoneProvider);

console.log('Delegatee address:', delegateeSigner.address);

console.log('Initializing Lit Node Client...');
const litNodeClient = new LitNodeClient({
  litNetwork: 'datil',
  debug: true,
});


await litNodeClient.connect();
console.log('Connected to Lit Network');


console.log('Generating signed Uniswap quote...');
// Create ability client
const abilityClient = getVincentAbilityClient({
    bundledVincentAbility: bundledVincentAbility,
    ethersSigner: delegateeSigner,
});





// Prepare bridge parameters - Example: Bridge 0.1 ETH from Base to Arbitrum
const bridgeParams = {
    operation: 'BRIDGE',
    rpcUrl: RPC_URL,
    sourceChain: "421614", // Arbitrum
    destinationChain: '84532', // Base
    sourceToken: '0x0000000000000000000000000000000000000000', // Native ETH
    destinationToken: '0x0000000000000000000000000000000000000000', // Native ETH
    amount: '100000000000000000', // 0.1 ETH in wei
    slippageBps: 100, // 1% slippage
};
  
const precheckResult = await abilityClient.precheck(bridgeParams, {
    delegatorPkpEthAddress: delegatorPkpEthAddress, // The Vincent App User's Vincent Wallet address
    rpcUrl: "https://yellowstone-rpc.litprotocol.com/",
});


console.log('Precheck result:', precheckResult);

console.log('Getting signed bridge quote...');
const signedBridgeQuote = await abilityClient.getSignedBridgeQuote(bridgeParams, {
    delegatorPkpEthAddress: delegatorPkpEthAddress,
});

console.log('Signed bridge quote:', signedBridgeQuote);

if (precheckResult.success) {
    const { data } = precheckResult.result;
    console.log('Estimated destination amount:', data.estimatedDestinationAmount);
    console.log('Protocol fee:', data.estimatedFees.protocolFee);
    console.log('Estimated execution time:', data.estimatedExecutionTime + ' seconds');
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

const executeResult = await abilityClient.execute(bridgeParams, {
    delegatorPkpEthAddress: delegatorPkpEthAddress, // The Vincent App User's Vincent Wallet address
});


if (executeResult.success) {
    const { data } = executeResult.result;
  
    console.log('Bridge transaction hash:', data.txHash);
    console.log('Order ID for tracking:', data.orderId);
    console.log('Bridged amount:', data.sourceAmount);
  } else {
    // Handle different types of failures
    if (executeResult.runtimeError) {
      console.error('Runtime error:', executeResult.runtimeError);
    }
    if (executeResult.schemaValidationError) {
      console.error('Schema validation error:', executeResult.schemaValidationError);
    }
    if (executeResult.result) {
      console.error('Bridge execution failed:', executeResult.result.error);
    }
  }