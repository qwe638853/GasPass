import { sponsorAbilityClient, bungeeAbilityClient , alchemyGasSponsorApiKey, alchemyGasSponsorPolicyId } from './vincentEnv.js';

// Submit to Bungee API
async function submitToBungee({ requestType, witness, userSignature, quoteId }) {
    const BUNGEE_API_BASE_URL = 'https://public-backend.bungee.exchange';
    
    const requestBody = {
        requestType,
        request: witness,
        userSignature,
        quoteId,
    };
    
    const response = await fetch(`${BUNGEE_API_BASE_URL}/api/v1/bungee/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
    });
    
    const httpStatus = response.status;
    const serverReqId = response.headers.get('server-req-id') || null;
    let data = null;
    
    try {
        data = await response.json();
    } catch {
        data = null;
    }
    
    const submitResult = {
        success: !!(data && data.success),
        httpStatus,
        serverReqId,
        result: data && data.result ? data.result : null,
        requestHash: data && data.result && data.result.requestHash ? data.result.requestHash : null,
        error: data && !data.success ? (data.error?.message || data.message || null) : null,
    };
    
    if (!submitResult.success) {
        console.error('Bungee submit failed:', submitResult);
    }
    
    return submitResult;
}

// 傳入贊助參數，執行贊助自動補油
export async function executeSponsorAutoRefuel(sponsorParams, { delegatorPkpEthAddress, rpcUrl } = {}) {
    
    const params = {
        chainId: sponsorParams.chainId,
        sponsorApiKey: alchemyGasSponsorApiKey,
        sponsorPolicyId: alchemyGasSponsorPolicyId,
        contractAddress: sponsorParams.contractAddress,
        functionName: sponsorParams.functionName,
        args: sponsorParams.args,
        abi: sponsorParams.abi,
        value: sponsorParams.value,
    };
    return await sponsorAbilityClient.execute(params, { delegatorPkpEthAddress });
}

// 執行 Bungee 橋接
export async function executeBungeeBridge(bungeeParams, { delegatorPkpEthAddress, rpcUrl } = {}) {
    const precheckResult = await precheckBungee(bungeeParams, { delegatorPkpEthAddress, rpcUrl });
    if (!precheckResult.success) {
        throw new Error('Bungee precheck failed');
    }
    const result = precheckResult.result;
    
    const params = {
        fromChainId: bungeeParams.fromChainId,
        toChainId: bungeeParams.toChainId,
        fromToken: bungeeParams.fromToken,
        toToken: bungeeParams.toToken,
        amount: bungeeParams.amount,
        recipient: bungeeParams.recipient,
        slippageBps: bungeeParams.slippageBps,
        signTypedData: result.bestRoute.signTypedData,
        quoteId: result.quoteId,
        requestType: result.requestType,
    };
    
    const executeResult = await bungeeAbilityClient.execute(params, { delegatorPkpEthAddress });
    
    // Submit to Bungee API
    const submitResult = await submitToBungee({
        requestType: executeResult.requestType,
        witness: executeResult.witness,
        userSignature: executeResult.userSignature,
        quoteId: executeResult.quoteId
    });
    
    return {
        execute: executeResult,
        submit: submitResult
    };
}

async function precheckBungee(precheckBungeeParams, { delegatorPkpEthAddress, rpcUrl } = {}) {
    const params = {
        fromChainId: precheckBungeeParams.fromChainId,
        toChainId: precheckBungeeParams.toChainId,
        fromToken: precheckBungeeParams.fromToken,
        toToken: precheckBungeeParams.toToken,
        amount: precheckBungeeParams.amount,
        recipient: precheckBungeeParams.recipient,
        slippageBps: precheckBungeeParams.slippageBps,
    };
    return await bungeeAbilityClient.precheck(params, { delegatorPkpEthAddress });
}
