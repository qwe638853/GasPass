import { sponsorAbilityClient, alchemyGasSponsorApiKey, alchemyGasSponsorPolicyId ,ensureInitialized} from './vincentEnv.js';
import { BUNGEE_CONFIG } from '../config/BungeeConfig.js';
import { GAS_PASS_CONFIG, AUTO_REFUEL_ABI, MANUAL_REFUEL_ABI } from '../config/gasPassConfig.js';
import { ethers } from 'ethers';
import crypto from 'crypto';

// 正規化請求參數，將數字轉換為字符串
function normalizeRequest(params) {
  const normalized = { ...params };
  
  // 將數字欄位轉換為字符串
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
  
  // 確保地址欄位是字符串
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

// 傳入贊助參數，執行贊助自動補油
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
    // 確保 Vincent 已初始化
    await ensureInitialized();
    
    // 正規化請求參數，將數字轉換為字符串
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
        // 1. 獲取報價
        console.log('Getting quote...');
        const quoteParams = {
            userAddress: receiver,
            destinationChainId,
            fromToken: inputToken,
            amount: inputAmount
        };
        
        const minOutputAmount = await getQuote(quoteParams);
        console.log('Quote received, minOutputAmount:', minOutputAmount);

        // 2. 建構完整的請求
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
        // 3. 執行 autoRefuel
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
    // 確保 Vincent 已初始化
    await ensureInitialized();
    
    // 正規化請求參數，將數字轉換為字符串
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
    
    console.log('🚀 執行手動補油:', { tokenId, destinationChainId, inputAmount });
    console.log('delegatorPkpEthAddress:', delegatorPkpEthAddress);
    
    try {
        // 1. 獲取報價
        console.log('Getting quote for manual refuel...');
        const quoteParams = {
            userAddress: receiver,
            destinationChainId,
            fromToken: inputToken,
            amount: inputAmount
        };
        
        const minOutputAmount = await getQuote(quoteParams);
        console.log('Quote received, minOutputAmount:', minOutputAmount);

        // 2. 建構完整的請求
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
        
        // 3. 執行 manualRefuelByAgent
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

// 完整的建構範例函數
function buildCompleteRequest(params) {
    // 正規化參數，確保數字轉換為字符串
    const normalizedParams = normalizeRequest(params);
    
    const {
        destinationChainId,
        receiver,
        inputToken,
        inputAmount,
        minOutputAmount,
        deadlineDelta = 600, // 10 分鐘預設
        contractAddress,
        blockNumber,
        gasLeft = 1000000 // 預設值
    } = normalizedParams;
  
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const deadline = currentTimestamp + deadlineDelta;
    
    // 生成 nonce
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
  

// 建構 BasicRequest 結構
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
    originChainId: 42161, // Arbitrum 主網
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

// 建構完整的 Request 結構
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

// 生成 nonce 的輔助函數
function generateNonce(timestamp, blockNumber, contractAddress, inputAmount, chainId, gasLeft) {
  // 模擬 Solidity 的 keccak256 和 bytes4 操作
  const data = `${timestamp}${blockNumber}${contractAddress}${inputAmount}${chainId}${gasLeft}`;
  const hash = crypto.createHash('sha256').update(data).digest('hex');
  // 取前 8 個字符作為 nonce (32位)
  return parseInt(hash.substring(0, 8), 16);
}







async function getQuote(quoteParams) {
  const BUNGEE_API_BASE_URL = BUNGEE_CONFIG.baseUrl;
  console.log('Bungee API Base URL:', BUNGEE_API_BASE_URL);
  
  const apiParams = {
    userAddress: BUNGEE_CONFIG.inboxAddress,
    receiverAddress: quoteParams.userAddress,
    originChainId: 42161, 
    destinationChainId: quoteParams.destinationChainId,
    inputToken: quoteParams.fromToken,
    outputToken: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
    inputAmount: quoteParams.amount,
    slippage: 0.5
  };
  
  try {
    const url = `${BUNGEE_API_BASE_URL}/api/v1/bungee/quote`;
    
    // 將參數轉換為查詢字串
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
    // 1. 定義 BASIC_REQUEST_TYPE (對應 Solidity 中的 BASIC_REQUEST_TYPE)
    const BASIC_REQUEST_TYPE = ethers.solidityPacked(
        ["string"],
        ["BasicRequest(uint256 originChainId,uint256 destinationChainId,uint256 deadline,uint256 nonce,address sender,address receiver,address delegate,address bungeeGateway,uint32 switchboardId,address inputToken,uint256 inputAmount,address outputToken,uint256 minOutputAmount,uint256 refuelAmount)"]
    );
    
    // 2. 計算 BASIC_REQUEST_TYPE_HASH
    const BASIC_REQUEST_TYPE_HASH = ethers.keccak256(BASIC_REQUEST_TYPE);
    
    // 3. 定義 REQUEST_TYPE
    const REQUEST_TYPE = ethers.solidityPacked(
        ["string"],
        ["Request(BasicRequest basicReq,address swapOutputToken,uint256 minSwapOutput,bytes32 metadata,bytes affiliateFees,uint256 minDestGas,bytes destinationPayload,address exclusiveTransmitter)"]
    );
    
    // 4. 定義 BUNGEE_REQUEST_TYPE (REQUEST_TYPE + BASIC_REQUEST_TYPE)
    const BUNGEE_REQUEST_TYPE = ethers.solidityPacked(
        ["bytes", "bytes"],
        [REQUEST_TYPE, BASIC_REQUEST_TYPE]
    );
    
    // 5. 計算 BUNGEE_REQUEST_TYPE_HASH
    const BUNGEE_REQUEST_TYPE_HASH = ethers.keccak256(BUNGEE_REQUEST_TYPE);

    // 6. 計算 basicReq.originHash() (對應 Solidity 中的 originHash 函數)
    const basicReq = request.basicReq;
    const originHash = ethers.keccak256(
        ethers.solidityPacked(
            ["bytes32", "bytes"],
            [
                BASIC_REQUEST_TYPE_HASH,
                ethers.AbiCoder.defaultAbiCoder().encode(
                    [
                        "uint256", // originChainId (使用當前鏈 ID)
                        "uint256", // destinationChainId
                        "uint256", // deadline
                        "uint256", // nonce
                        "address", // sender
                        "address", // receiver
                        "address", // delegate
                        "address", // bungeeGateway
                        "uint32",  // switchboardId (注意是 uint32)
                        "address", // inputToken
                        "uint256", // inputAmount
                        "address", // outputToken
                        "uint256", // minOutputAmount
                        "uint256"  // refuelAmount
                    ],
                    [
                        basicReq.originChainId, // 當前鏈 ID
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

    // 7. 計算 affiliateFees 的 hash
    const affiliateFeesHash = ethers.keccak256(request.affiliateFees);
    
    // 8. 計算 destinationPayload 的 hash
    const destinationPayloadHash = ethers.keccak256(request.destinationPayload);

    // 9. 計算最終的 SOR Hash (對應 Solidity 中的 createSORHash)
    const sorHash = ethers.keccak256(
        ethers.AbiCoder.defaultAbiCoder().encode(
            [
                "bytes32", // BUNGEE_REQUEST_TYPE_HASH
                "bytes32", // originHash (注意是 bytes32，不是 uint128)
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