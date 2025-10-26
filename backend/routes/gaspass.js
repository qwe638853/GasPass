import { Router } from 'express';
import { ethers } from 'ethers';
import { GAS_PASS_CONFIG, GAS_PASS_ABI } from '../config/gasPassConfig.js';
import { SUPPORTED_CHAINS } from '../config/BungeeConfig.js';

const router = Router();

// Helper function to create contract instance
function createContractInstance(wallet) {
  return new ethers.Contract(GAS_PASS_CONFIG.contractAddress, GAS_PASS_ABI, wallet);
}

// GasPass Relayer related endpoints
router.post('/relay/mint', async (req, res) => {
  try {
    const { typedData, signature } = req.body;
    
    console.log(`📤 Relaying mintWithSig transaction...`);
    console.log(`👤 User: ${typedData.to}`);
    console.log(`💰 Amount: ${ethers.formatUnits(typedData.value, 6)} USDC`);
    console.log(`🔍 Signature: ${signature}`);
    
    // Get wallet and contract from main server
    const { wallet, contract } = req.app.locals;
    
    if (!wallet || !contract) {
      throw new Error('Relayer service not initialized');
    }
    
    // Prepare contract call data
    const mintData = {
      to: typedData.to,
      value: typedData.value,
      permitData: typedData.permitData,
      agent: typedData.agent,
      nonce: typedData.nonce,
      deadline: typedData.deadline
    };
    
    console.log(`🔍 mintData:`, mintData);
    
    // Call contract's mintWithSig function
    const tx = await contract.mintWithSig(mintData, signature);
    console.log(`📝 Transaction submitted: ${tx.hash}`);
    
    // Wait for transaction confirmation (wait for 1 confirmation)
    const receipt = await tx.wait(1);
    console.log(`✅ Transaction confirmed: ${receipt.hash}`);
    console.log(`📊 Confirmations: ${receipt.confirmations}`);
    console.log(`📊 Status: ${receipt.status === 1 ? 'Success' : 'Failed'}`);
    console.log(`⛽ Gas used: ${receipt.gasUsed.toString()}`);
    
    // Check transaction status
    if (receipt.status !== 1) {
      throw new Error(`Transaction failed, status code: ${receipt.status}`);
    }
    
    // Extract tokenId from events
    const mintEvent = receipt.logs.find(log => {
      try {
        const parsed = contract.interface.parseLog(log);
        return parsed.name === 'Minted';
      } catch (e) {
        return false;
      }
    });
    
    let tokenId = null;
    if (mintEvent) {
      const parsed = contract.interface.parseLog(mintEvent);
      tokenId = parsed.args.value.toString();
      console.log(`🎫 Minted Token ID: ${tokenId}`);
    } else {
      console.warn('⚠️ Minted event not found, contract ABI may not match');
    }
    
    res.json({
      success: true,
      txHash: receipt.hash,
      tokenId: tokenId,
      confirmations: receipt.confirmations,
      gasUsed: receipt.gasUsed.toString(),
      status: receipt.status === 1 ? 'success' : 'failed',
      receipt: {
        hash: receipt.hash,
        blockNumber: receipt.blockNumber,
        blockHash: receipt.blockHash,
        confirmations: receipt.confirmations,
        gasUsed: receipt.gasUsed.toString(),
        status: receipt.status
      }
    });
    
  } catch (error) {
    console.error('❌ mintWithSig Failed:', error.message);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

router.post('/relay/mint-batch', async (req, res) => {
  try {
    const { typedData, signature } = req.body;
    
    console.log(`📤 Relaying mintBatchWithSig transaction...`);
    console.log(`👤 User: ${typedData.to}`);
    console.log(`📦 Amount: ${typedData.amount}`);
    console.log(`💰 Single price: ${ethers.formatUnits(typedData.singleValue, 6)} USDC`);
    
    res.json({
      success: true,
      message: 'Mint batch relay endpoint - implementation in main server'
    });
    
  } catch (error) {
    console.error('❌ mintBatchWithSig Failed:', error.message);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

router.post('/relay/deposit', async (req, res) => {
  try {
    const { typedData, signature } = req.body;
    
    console.log(`📤 Relaying depositWithSig transaction...`);
    console.log(`🎫 Token ID: ${typedData.tokenId}`);
    console.log(`💰 Amount: ${ethers.formatUnits(typedData.amount, 6)} USDC`);
    console.log(`🔍 Signature: ${signature}`);
    
    // Get wallet and contract from main server
    const { wallet, contract } = req.app.locals;
    
    if (!wallet || !contract) {
      throw new Error('Relayer service not initialized');
    }
    
    // Prepare contract call data (DepositWithSigTypedData structure)
    const depositData = {
      tokenId: BigInt(typedData.tokenId),
      amount: BigInt(typedData.amount),
      permitData: {
        owner: typedData.permitData.owner,
        spender: typedData.permitData.spender,
        value: BigInt(typedData.permitData.value),
        deadline: BigInt(typedData.permitData.deadline),
        v: parseInt(typedData.permitData.v),
        r: typedData.permitData.r,
        s: typedData.permitData.s
      },
      nonce: BigInt(typedData.nonce),
      deadline: BigInt(typedData.deadline)
    };
    
    console.log(`🔍 depositData:`, depositData);
    
    // Call contract's depositWithSig function
    const tx = await contract.depositWithSig(depositData, signature);
    console.log(`📝 Transaction submitted: ${tx.hash}`);
    
    // Wait for transaction confirmation (wait for 1 confirmation)
    const receipt = await tx.wait(1);
    console.log(`✅ Transaction confirmed: ${receipt.hash}`);
    console.log(`📊 Confirmations: ${receipt.confirmations}`);
    console.log(`📊 Status: ${receipt.status === 1 ? 'Success' : 'Failed'}`);
    console.log(`⛽ Gas used: ${receipt.gasUsed.toString()}`);
    
    // Check transaction status
    if (receipt.status !== 1) {
      throw new Error(`Transaction failed, status code: ${receipt.status}`);
    }
    
    res.json({
      success: true,
      txHash: receipt.hash,
      confirmations: receipt.confirmations,
      gasUsed: receipt.gasUsed.toString(),
      status: receipt.status === 1 ? 'success' : 'failed',
      receipt: {
        hash: receipt.hash,
        blockNumber: receipt.blockNumber,
        blockHash: receipt.blockHash,
        confirmations: receipt.confirmations,
        gasUsed: receipt.gasUsed.toString(),
        status: receipt.status
      }
    });
    
  } catch (error) {
    console.error('❌ depositWithSig Failed:', error.message);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

router.post('/relay/set-refuel-policy', async (req, res) => {
  try {
    const { typedData, signature } = req.body;
    
    console.log(`📤 Relaying setRefuelPolicyWithSig transaction...`);
    console.log(`🎫 Token ID: ${typedData.tokenId}`);
    console.log(`⛓️ Target chain: ${typedData.targetChainId}`);
    console.log(`💰 Gas Amount: ${ethers.formatUnits(typedData.gasAmount, 6)} USDC`);
    console.log(`⚠️ Trigger threshold: ${ethers.formatUnits(typedData.threshold, 6)} USDC`);
    console.log(`🤖 Agent: ${typedData.agent}`);
    
    // Get wallet and contract from main server
    const { wallet, contract } = req.app.locals;
    
    if (!wallet || !contract) {
      throw new Error('Relayer service not initialized');
    }
    
    // Create contract instance
    const gasPassContract = new ethers.Contract(
      GAS_PASS_CONFIG.contractAddress,
      GAS_PASS_CONFIG.abi,
      wallet
    );
    
    // Create tuple-format policy data, compatible with contract ABI
    // Ensure uint128 range: 0 to 2^128 - 1
    const uint128Max = BigInt('0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF');
    const gasAmountUint128 = ethers.toBigInt(typedData.gasAmount) & uint128Max;
    const thresholdUint128 = ethers.toBigInt(typedData.threshold) & uint128Max;
    
    // Create tuple in order defined by ABI
    const policyData = [
      ethers.toBigInt(typedData.tokenId),        // tokenId: uint256
      ethers.toBigInt(typedData.targetChainId),  // targetChainId: uint256
      gasAmountUint128,                          // gasAmount: uint128
      thresholdUint128,                          // threshold: uint128
      typedData.agent,                           // agent: address
      ethers.toBigInt(typedData.nonce),          // nonce: uint256
      ethers.toBigInt(typedData.deadline)        // deadline: uint256
    ];
    
    console.log(`🔍 Policy Tuple:`, policyData);
    
    // Four-hash comparison method - for debugging
    try {
      const { TypedDataEncoder } = await import('ethers');
      const domain = {
        name: "GasPass",
        version: "1",
        chainId: 42161,
        verifyingContract: GAS_PASS_CONFIG.contractAddress, // Use checksum format, do not convert to lowercase
      };
        const types = {
          SetRefuelPolicy: [
            { name: "tokenId", type: "uint256" },
            { name: "targetChainId", type: "uint256" },
            { name: "gasAmount", type: "uint128" },  // Contract expects uint128
            { name: "threshold", type: "uint128" },  // Contract expects uint128
            { name: "agent", type: "address" },
            { name: "nonce", type: "uint256" },
            { name: "deadline", type: "uint256" },
          ],
        };
      const message = {
        tokenId: ethers.toBigInt(typedData.tokenId),
        targetChainId: ethers.toBigInt(typedData.targetChainId),
        gasAmount: ethers.toBigInt(typedData.gasAmount),
        threshold: ethers.toBigInt(typedData.threshold),
        agent: typedData.agent,
        nonce: ethers.toBigInt(typedData.nonce),
        deadline: ethers.toBigInt(typedData.deadline),
      };
      
      const typeHash = TypedDataEncoder.hashType('SetRefuelPolicy', types);
      const structHash = TypedDataEncoder.from(types).hash(message);
      const domainSeparator = TypedDataEncoder.hashDomain(domain);
      const digest = TypedDataEncoder.hash(domain, types, message);
      
      console.log('🔍 Backend four-hash comparison method:');
      console.log('  typeHash:', typeHash);
      console.log('  structHash:', structHash);
      console.log('  domainSeparator:', domainSeparator);
      console.log('  digest:', digest);
    } catch (error) {
      console.error('❌ Backend four-hash calculation failed:', error);
    }
    
    // Call setRefuelPolicyWithSig
    const tx = await gasPassContract.setRefuelPolicyWithSig(policyData, signature);
    console.log(`📝 Transaction sent: ${tx.hash}`);
    
    // Wait for confirmation
    const receipt = await tx.wait();
    console.log(`✅ Transaction confirmed: ${receipt.transactionHash}`);
    
    res.json({
      success: true,
      txHash: tx.hash,
      receipt: {
        transactionHash: receipt.transactionHash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString(),
        status: receipt.status
      },
      message: 'Refuel policy set successfully'
    });
    
  } catch (error) {
    console.error('❌ setRefuelPolicyWithSig Failed:', error.message);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

router.post('/relay/cancel-refuel-policy', async (req, res) => {
  try {
    const { typedData, signature } = req.body;
    
    console.log(`📤 Relaying cancelRefuelPolicyWithSig transaction...`);
    console.log(`🎫 Token ID: ${typedData.tokenId}`);
    console.log(`⛓️ Target chain: ${typedData.targetChainId}`);
    
    res.json({
      success: true,
      message: 'Cancel refuel policy relay endpoint - implementation in main server'
    });
    
  } catch (error) {
    console.error('❌ cancelRefuelPolicyWithSig Failed:', error.message);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

router.post('/relay/set-agent', async (req, res) => {
  try {
    const { typedData, signature } = req.body;
    
    console.log(`📤 Relaying setAgentToWalletWithSig transaction...`);
    console.log(`🤖 Agent: ${typedData.agent}`);
    console.log(`👤 Wallet: ${typedData.wallet}`);
    
    res.json({
      success: true,
      message: 'Set agent relay endpoint - implementation in main server'
    });
    
  } catch (error) {
    console.error('❌ setAgentToWalletWithSig Failed:', error.message);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// GasPass Monitor 相關端點
router.post('/monitor/scan', async (req, res) => {
  try {
    console.log('🔍 Manually trigger monitoring scan...');
    res.json({ 
      success: true, 
      message: 'Monitor scan endpoint - implementation in main server' 
    });
  } catch (error) {
    console.error('❌ Monitor scanFailed:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/monitor/status', async (req, res) => {
  try {
    res.json({
      success: true,
      message: 'Monitor status endpoint - implementation in main server',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Get monitoring statusFailed:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// GasPass Configuration endpoints
router.get('/config', (req, res) => {
  res.json({
    contractAddress: GAS_PASS_CONFIG.contractAddress,
    network: GAS_PASS_CONFIG.network,
    usdc: GAS_PASS_CONFIG.usdc,
    supportedChains: Object.keys(SUPPORTED_CHAINS).map(chainId => ({
      chainId: parseInt(chainId),
      name: SUPPORTED_CHAINS[chainId].name,
      nativeSymbol: SUPPORTED_CHAINS[chainId].nativeSymbol
    }))
  });
});

// Get cross-chain exchange quote
router.post('/quote', async (req, res) => {
  try {
    const { destinationChainId, amount, userAddress } = req.body;
    
    console.log('📊 Get cross-chain exchange quote...');
    console.log(`⛓️ Target chain: ${destinationChainId}`);
    console.log(`💰 Amount: ${amount} USDC`);
    console.log(`👤 User address: ${userAddress}`);
    
    // Import getQuote function from bridge.js
    const { getQuote } = await import('../vincent/bridge.js');
    
    const quoteParams = {
      userAddress: userAddress,
      destinationChainId: destinationChainId,
      fromToken: GAS_PASS_CONFIG.usdc.address, // USDC contract address
      amount: amount // Amount in USDC
    };
    
    const minOutputAmount = await getQuote(quoteParams);
    console.log('✅ Quote fetchedSuccess:', minOutputAmount);
    
    res.json({
      success: true,
      minOutputAmount: minOutputAmount,
      inputAmount: amount,
      destinationChainId: destinationChainId,
      fromToken: GAS_PASS_CONFIG.usdc.address
    });
    
  } catch (error) {
    console.error('❌ Fetch quoteFailed:', error.message);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

router.get('/relayer', (req, res) => {
  res.json({
    message: 'Relayer info endpoint - implementation in main server',
    network: GAS_PASS_CONFIG.network.name,
    chainId: GAS_PASS_CONFIG.network.chainId
  });
});

export default router;
