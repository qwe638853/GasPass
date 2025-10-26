import { sponsorAbilityClient, alchemyGasSponsorApiKey, alchemyGasSponsorPolicyId ,ensureInitialized} from './vincentEnv.js';
import { BUNGEE_CONFIG } from '../config/BungeeConfig.js';
import { GAS_PASS_CONFIG, AUTO_REFUEL_ABI, MANUAL_REFUEL_ABI } from '../config/gasPassConfig.js';
import { ethers } from 'ethers';
import crypto from 'crypto';

// Normalize request parameters, convert numbers to strings
function normalizeRequest(params) {
  const normalized = { ...params };
  
  // Convert number fields to strings
  if (normalized.tokenId !== undefined) {
    normalized.tokenId = String(normalized.tokenId);
  }
  if (normalized.destinationChainId !== undefined) {
    normalized.destinationChainId = String(normalized.destinationChainId);
  }
  if (normalized.inputAmount !== undefined) {
    normalized.inputAmount = String(normalized.inputAmount);
  }
  if (normalized.blockNumber !== undefined) {
    normalized.blockNumber = String(normalized.blockNumber);
  }
  if (normalized.gasLeft !== undefined) {
    normalized.gasLeft = String(normalized.gasLeft);
  }
  if (normalized.deadlineDelta !== undefined) {
    normalized.deadlineDelta = String(normalized.deadlineDelta);
  }
  
  // Ensure address fields are strings
  if (normalized.receiver !== undefined) {
    normalized.receiver = String(normalized.receiver);
  }
  if (normalized.inputToken !== undefined) {
    normalized.inputToken = String(normalized.inputToken);
  }
  if (normalized.contractAddress !== undefined) {
    normalized.contractAddress = String(normalized.contractAddress);
  }
  
  return normalized;
}

// Pass sponsor parameters and execute sponsored auto refuel
async function executeSponsorAutoRefuel(sponsorParams, { delegatorPkpEthAddress } = {}) {
    console.log('GAS_PASS_CONFIG.contractAddress:', GAS_PASS_CONFIG.contractAddress);
    console.log('sponsorParams:', sponsorParams);
    console.log(sponsorParams.args[2].basicReq);
    const params = {
        chainId: 42161,
        sponsorApiKey: alchemyGasSponsorApiKey,
        sponsorPolicyId: alchemyGasSponsorPolicyId,
        contractAddress: GAS_PASS_CONFIG.contractAddress,
        functionName: sponsorParams.functionName,
        args: sponsorParams.args,
        abi: sponsorParams.abi,
        value: sponsorParams.value,
    };
    console.log('params:', params);
    return await sponsorAbilityClient.execute(params, { delegatorPkpEthAddress:delegatorPkpEthAddress });
}


// 完整的 autoRefuel 流程函數
export async function executeCompleteAutoRefuel(params, { delegatorPkpEthAddress } = {}) {
    // Ensure Vincent is initialized
    await ensureInitialized();
    console.log('executeCompleteAutoRefuel params:', params);
    // Normalize request parameters, convert numbers to strings
    const normalizedParams = normalizeRequest(params);
    
    const {
        tokenId,
        destinationChainId,
        receiver,
        inputToken,
        inputAmount,
        contractAddress,
        blockNumber,
        gasLeft = 1000000,
        deadlineDelta = 600
    } = normalizedParams;
    console.log('delegatorPkpEthAddress:', delegatorPkpEthAddress);
    try {
        // 1. Get quote
        console.log('Getting quote...');
        const quoteParams = {
            userAddress: receiver,
            destinationChainId,
            fromToken: inputToken,
            amount: inputAmount
        };
        
        const minOutputAmount = await getQuote(quoteParams);
        console.log('Quote received, minOutputAmount:', minOutputAmount);

        // 2. Build complete request
        console.log('Building complete request...');
        const requestData = buildCompleteRequest({
            destinationChainId,
            receiver,
            inputToken,
            inputAmount,
            minOutputAmount,
            deadlineDelta,
            contractAddress,
            blockNumber,
            gasLeft
        });

        const expectedSorHash = await getExpectedSorHash(requestData.request);
        // 3. Execute autoRefuel
        console.log('Executing autoRefuel...');
        const sponsorAutoRefuelParams = {
            functionName: 'autoRefuel',
            args: [tokenId, BUNGEE_CONFIG.inboxAddress, requestData.request, expectedSorHash, destinationChainId],
            abi: AUTO_REFUEL_ABI,
            value: 0
        };

        const result = await executeSponsorAutoRefuel(sponsorAutoRefuelParams, { delegatorPkpEthAddress });
    
        return {
            success: true,
            result,
            requestData,
            minOutputAmount
        };

    } catch (error) {
        console.error('Error in complete autoRefuel flow:', error);
        throw error;
    }
}

// 手動補油流程函數 (使用 manualRefuelByAgent)
export async function executeManualRefuelByAgent(params, { delegatorPkpEthAddress } = {}) {
    // Ensure Vincent is initialized
    await ensureInitialized();
    
    // Normalize request parameters, convert numbers to strings
    const normalizedParams = normalizeRequest(params);
    
    const {
        tokenId,
        destinationChainId,
        receiver,
        inputToken,
        inputAmount,
        contractAddress,
        blockNumber,
        gasLeft = 1000000,
        deadlineDelta = 600
    } = normalizedParams;
    
    console.log('🚀 Execute manual refuel:', { tokenId, destinationChainId, inputAmount });
    console.log('delegatorPkpEthAddress:', delegatorPkpEthAddress);
    
    try {
        // 1. Get quote
        console.log('Getting quote for manual refuel...');
        const quoteParams = {
            userAddress: receiver,
            destinationChainId,
            fromToken: inputToken,
            amount: inputAmount
        };
        
        const minOutputAmount = await getQuote(quoteParams);
        console.log('Quote received, minOutputAmount:', minOutputAmount);

        // 2. Build complete request
        console.log('Building complete request for manual refuel...');
        const requestData = buildCompleteRequest({
            destinationChainId,
            receiver,
            inputToken,
            inputAmount,
            minOutputAmount,
            deadlineDelta,
            contractAddress,
            blockNumber,
            gasLeft
        });

        const expectedSorHash = await getExpectedSorHash(requestData.request);
        
        // 3. Execute manualRefuelByAgent
        console.log('Executing manualRefuelByAgent...');
        const sponsorManualRefuelParams = {
            functionName: 'manualRefuelByAgent',
            args: [tokenId, BUNGEE_CONFIG.inboxAddress, requestData.request, expectedSorHash, destinationChainId],
            abi: MANUAL_REFUEL_ABI,
            value: 0
        };

        const result = await executeSponsorAutoRefuel(sponsorManualRefuelParams, { delegatorPkpEthAddress });
    
        return {
            success: true,
            result,
            requestData,
            minOutputAmount,
            txHash: result?.txHash || result?.hash
        };

    } catch (error) {
        console.error('Error in manual refuel flow:', error);
        throw error;
    }
}

// Complete construction example function
function buildCompleteRequest(params) {
    // Normalize parameters, ensure numbers converted to strings
    const normalizedParams = normalizeRequest(params);
    
    const {
        destinationChainId,
        receiver,
        inputToken,
        inputAmount,
        minOutputAmount,
        deadlineDelta = 600, // 10 minutes default
        contractAddress,
        blockNumber,
        gasLeft = 1000000 // default value
    } = normalizedParams;
  
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const deadline = currentTimestamp + deadlineDelta;
    
    // Generate nonce
    const nonce = generateNonce(
        currentTimestamp,
        blockNumber,
        contractAddress,
        inputAmount,
        destinationChainId,
        gasLeft
    );
  
    // 建構 BasicRequest
    const basicReq = buildBasicRequest({
        destinationChainId,
        deadline,
        nonce,
        receiver,
        inputToken,
        inputAmount,
        minOutputAmount
    });
  
    // 建構完整 Request
    const request = buildRequest({
        basicReq
    });
  
    return {
        basicReq,
        request,
        nonce,
        deadline
    };
}
  

// Build BasicRequest structure
function buildBasicRequest(params) {
  const {
    destinationChainId,
    deadline,
    nonce,
    receiver,
    inputToken,
    inputAmount,
    minOutputAmount
  } = params;

  return {
    originChainId: 42161, // Arbitrum mainnet
    destinationChainId,
    deadline,
    nonce,
    sender: BUNGEE_CONFIG.inboxAddress,
    receiver,
    delegate: receiver,
    bungeeGateway: BUNGEE_CONFIG.gatewayAddress,
    switchboardId: 1,
    inputToken,
    inputAmount,
    outputToken: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE', // ETH
    minOutputAmount,
    refuelAmount: 0
  };
}

// Build complete Request structure
function buildRequest(params) {
  const {
    basicReq
  } = params;

  return {
    basicReq,
    swapOutputToken: '0x0000000000000000000000000000000000000000',
    minSwapOutput: 0,
    metadata: '0x0000000000000000000000000000000000000000000000000000000000000000',
    affiliateFees: '0x',
    minDestGas: 0,
    destinationPayload: '0x',
    exclusiveTransmitter: '0x0000000000000000000000000000000000000000'
  };
}

// Generate nonce 的輔助函數
function generateNonce(timestamp, blockNumber, contractAddress, inputAmount, chainId, gasLeft) {
  // Simulate Solidity keccak256 and bytes4 operations
  const data = `${timestamp}${blockNumber}${contractAddress}${inputAmount}${chainId}${gasLeft}`;
  const hash = crypto.createHash('sha256').update(data).digest('hex');
  // Use first 8 characters as nonce (32位)
  return parseInt(hash.substring(0, 8), 16);
}







export async function getQuote(quoteParams) {
  const BUNGEE_API_BASE_URL = BUNGEE_CONFIG.baseUrl;
  console.log('Bungee API Base URL:', BUNGEE_API_BASE_URL);
  console.log('Input amount (from params):', quoteParams.amount);
  
  // quoteParams.amount 可能是：
  // 1. 前端傳入的實際 USDC 金額（如 "1"）-> 需要轉換
  // 2. 後端已轉換的最小單位（如 "1000000"）-> 不需要轉換
  
  // 判斷是否需要轉換：如果數值小於 1000000，認為是實際金額需要轉換
  const amountValue = parseFloat(quoteParams.amount);
  const shouldConvert = amountValue < 1000000;
  
  let inputAmountInWei;
  if (shouldConvert) {
    // 將 USDC 金額轉換為最小單位 (USDC 有 6 位小數)
    // 例如: 1 USDC = 1000000 (最小單位)
    inputAmountInWei = Math.floor(amountValue * Math.pow(10, 6));
    console.log('Converting:', quoteParams.amount, '=> Min unit:', inputAmountInWei);
  } else {
    // 已經是最小單位，直接使用
    inputAmountInWei = Math.floor(amountValue);
    console.log('Already in min unit:', inputAmountInWei);
  }
  // Convert USDC amount to minimum unit (USDC has 6 decimals)
  //const inputAmountInWei = Math.floor(parseFloat(quoteParams.amount) * Math.pow(10, 6));
  
  const apiParams = {
    userAddress: BUNGEE_CONFIG.inboxAddress,
    receiverAddress: quoteParams.userAddress,
    originChainId: 42161, 
    destinationChainId: quoteParams.destinationChainId,
    inputToken: quoteParams.fromToken,
    outputToken: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
    inputAmount: inputAmountInWei.toString(),
    slippage: 1
  };
  
  try {
    const url = `${BUNGEE_API_BASE_URL}/api/v1/bungee/quote`;
    
    // Convert parameters to query string
    const queryParams = new URLSearchParams();
    Object.entries(apiParams).forEach(([key, value]) => {
      queryParams.append(key, value.toString());
    });
    
    const fullUrl = `${url}?${queryParams.toString()}`;
    console.log('Requesting quote from:', fullUrl);
    const response = await fetch(fullUrl);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    console.log('Quote response:', data);
    
    if (!data.result || !data.result.autoRoute) {
      throw new Error('No Routes available');
    }
    // Get the minimum amount out of the autoRoute
    return data.result.autoRoute.output.minAmountOut;

  } catch (error) {
    console.error('Error getting quote:', error);
    throw error;
  }
}

function getExpectedSorHash(request) {
    // 1. Define BASIC_REQUEST_TYPE (corresponds to BASIC_REQUEST_TYPE in Solidity)
    const BASIC_REQUEST_TYPE = ethers.solidityPacked(
        ["string"],
        ["BasicRequest(uint256 originChainId,uint256 destinationChainId,uint256 deadline,uint256 nonce,address sender,address receiver,address delegate,address bungeeGateway,uint32 switchboardId,address inputToken,uint256 inputAmount,address outputToken,uint256 minOutputAmount,uint256 refuelAmount)"]
    );
    
    // 2. Calculate BASIC_REQUEST_TYPE_HASH
    const BASIC_REQUEST_TYPE_HASH = ethers.keccak256(BASIC_REQUEST_TYPE);
    
    // 3. Define REQUEST_TYPE
    const REQUEST_TYPE = ethers.solidityPacked(
        ["string"],
        ["Request(BasicRequest basicReq,address swapOutputToken,uint256 minSwapOutput,bytes32 metadata,bytes affiliateFees,uint256 minDestGas,bytes destinationPayload,address exclusiveTransmitter)"]
    );
    
    // 4. Define BUNGEE_REQUEST_TYPE (REQUEST_TYPE + BASIC_REQUEST_TYPE)
    const BUNGEE_REQUEST_TYPE = ethers.solidityPacked(
        ["bytes", "bytes"],
        [REQUEST_TYPE, BASIC_REQUEST_TYPE]
    );
    
    // 5. Calculate BUNGEE_REQUEST_TYPE_HASH
    const BUNGEE_REQUEST_TYPE_HASH = ethers.keccak256(BUNGEE_REQUEST_TYPE);

    // 6. Calculate basicReq.originHash() (corresponds to originHash function in Solidity)
    const basicReq = request.basicReq;
    const originHash = ethers.keccak256(
        ethers.solidityPacked(
            ["bytes32", "bytes"],
            [
                BASIC_REQUEST_TYPE_HASH,
                ethers.AbiCoder.defaultAbiCoder().encode(
                    [
                        "uint256", // originChainId (使用Current chain ID)
                        "uint256", // destinationChainId
                        "uint256", // deadline
                        "uint256", // nonce
                        "address", // sender
                        "address", // receiver
                        "address", // delegate
                        "address", // bungeeGateway
                        "uint32",  // switchboardId (Note: this is uint32)
                        "address", // inputToken
                        "uint256", // inputAmount
                        "address", // outputToken
                        "uint256", // minOutputAmount
                        "uint256"  // refuelAmount
                    ],
                    [
                        basicReq.originChainId, // Current chain ID
                        basicReq.destinationChainId,
                        basicReq.deadline,
                        basicReq.nonce,
                        basicReq.sender,
                        basicReq.receiver,
                        basicReq.delegate,
                        basicReq.bungeeGateway,
                        basicReq.switchboardId,
                        basicReq.inputToken,
                        basicReq.inputAmount,
                        basicReq.outputToken,
                        basicReq.minOutputAmount,
                        basicReq.refuelAmount
                    ]
                )
            ]
        )
    );

    // 7. Calculate affiliateFees hash
    const affiliateFeesHash = ethers.keccak256(request.affiliateFees);
    
    // 8. Calculate destinationPayload hash
    const destinationPayloadHash = ethers.keccak256(request.destinationPayload);

    // 9. Calculate final SOR Hash (corresponds to createSORHash in Solidity)
    const sorHash = ethers.keccak256(
        ethers.AbiCoder.defaultAbiCoder().encode(
            [
                "bytes32", // BUNGEE_REQUEST_TYPE_HASH
                "bytes32", // originHash (Note: this is bytes32, not uint128)
                "address", // swapOutputToken
                "uint256", // minSwapOutput
                "bytes32", // metadata
                "bytes32", // affiliateFeesHash
                "uint256", // minDestGas
                "bytes32", // destinationPayloadHash
                "address"  // exclusiveTransmitter
            ],
            [
                BUNGEE_REQUEST_TYPE_HASH,
                originHash,
                request.swapOutputToken,
                request.minSwapOutput,
                request.metadata,
                affiliateFeesHash,
                request.minDestGas,
                destinationPayloadHash,
                request.exclusiveTransmitter
            ]
        )
    );

    return sorHash;
}