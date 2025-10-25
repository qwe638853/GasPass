import { sponsorAbilityClient, bungeeAbilityClient , alchemyGasSponsorApiKey, alchemyGasSponsorPolicyId } from './vincentEnv.js';


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



async function getQuote(quoteParams) {
      // 直接呼叫 Bungee Quote API
  const BUNGEE_API_BASE_URL = "https://public-backend.bungee.exchange";
  console.log('Bungee API Base URL:', BUNGEE_API_BASE_URL);
  const quoteParams = {
    userAddress: quoteParams.userAddress,
    receiverAddress: quoteParams.receiverAddress,
    originChainId: parseInt(quoteParams.originChainId),
    destinationChainId: parseInt(quoteParams.destinationChainId),
    inputToken: quoteParams.inputToken,
    outputToken: quoteParams.outputToken,
    inputAmount: quoteParams.inputAmount
  };
  

    return await bungeeAbilityClient.getQuote(params, { delegatorPkpEthAddress });
}