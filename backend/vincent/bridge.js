import { abilityClient } from './vincentEnv.js';

export async function executeBridge(bridgeParams, { delegatorPkpEthAddress, rpcUrl } = {}) {
    
    const precheckResult = await abilityClient.precheck(bridgeParams, {
      delegatorPkpEthAddress,
    });
  
    if (!precheckResult.success) {
        if (precheckResult.runtimeError) {
            // eslint-disable-next-line no-console
            console.error('Runtime error:', precheckResult.runtimeError);
        }
        if (precheckResult.schemaValidationError) {
            // eslint-disable-next-line no-console
            console.error('Schema validation error:', precheckResult.schemaValidationError);
        }
        if (precheckResult.result) {
            // eslint-disable-next-line no-console
            console.error('Bridge precheck failed:', precheckResult.result.error);
        }
        return precheckResult;
    }

    const { data } = precheckResult.result;
    // eslint-disable-next-line no-console
    console.log('Estimated destination amount:', data.estimatedDestinationAmount);
    // eslint-disable-next-line no-console
    console.log('Protocol fee:', data.estimatedFees.protocolFee);
    // eslint-disable-next-line no-console
    console.log('Estimated execution time:', data.estimatedExecutionTime + ' seconds');

    console.log('Start execute...');
    const executeRes = await abilityClient.execute(bridgeParams, {
      delegatorPkpEthAddress,
    });
    return executeRes;
}


  
 
  
  
  