import { Router } from 'express';
import { createVincentAuth } from '../middleware/vincentAuth.mjs';
import { executeCompleteAutoRefuel, executeManualRefuelByAgent } from '../vincent/bridge.js';
import { ethers } from 'ethers';
import { GAS_PASS_CONFIG, GAS_PASS_ABI } from '../config/gasPassConfig.js';

const router = Router();

// Create Vincent authentication middleware (consistent with testScript)
const allowedAudience = 'http://127.0.0.1:5173/';
const requiredAppId = parseInt(process.env.VITE_VINCENT_APP_ID) || undefined;

const { middleware: vincentAuth, handler: withVincentAuth } = createVincentAuth({
  allowedAudience,
  requiredAppId,
  userKey: 'vincentUser',
});



// Vincent status check
router.get('/status', vincentAuth, withVincentAuth(async (req, res) => {
  try {
    const delegatorPkpEthAddress = req.vincentUser.decodedJWT?.payload?.pkpInfo?.ethAddress ?? 
                                  req.vincentUser.decodedJWT?.pkp?.ethAddress;
    
    res.json({
      success: true,
      result: {
        pkpAddress: delegatorPkpEthAddress,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Vincent Status failed:', error);
    res.status(400).json({
      success: false,
      error: error.message || String(error)
    });
  }
}));


router.post('/triggerManualRefuel', vincentAuth, withVincentAuth(async (req, res) => {
  try {
    const { tokenId, chainId, gasAmount } = req.body;
    
    // Validate required parameters
    if (!tokenId || !chainId || !gasAmount) {
      return res.status(400).json({
        success: false,
        error: 'Missing required parameters: tokenId, chainId, gasAmount'
      });
    }

    console.log('🚀 Frontend triggered manual refuel:', { tokenId, chainId, gasAmount });

    // Get PKP address
    const delegatorPkpEthAddress = req.vincentUser.decodedJWT?.payload?.pkpInfo?.ethAddress ?? 
                                  req.vincentUser.decodedJWT?.pkp?.ethAddress;

    if (!delegatorPkpEthAddress) {
      return res.status(400).json({
        success: false,
        error: 'Unable to get PKP address'
      });
    }

    // Create contract instance - use environment variable or fallback RPC
    const rpcUrl = 'https://1rpc.io/arb';
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const contract = new ethers.Contract(
      GAS_PASS_CONFIG.contractAddress,
      GAS_PASS_ABI,
      provider
    );

    // Get token owner
    const owner = await contract.ownerOf(tokenId);
    console.log('👤 Token owner:', owner);

    // Get USDC contract address
    const usdcAddress = await contract.stablecoin();
    console.log('💰 USDC contract address:', usdcAddress);
    
    // Get USDC decimals
    const usdcContract = new ethers.Contract(usdcAddress, ['function decimals() view returns (uint8)'], provider);
    const usdcDecimals = await usdcContract.decimals();
    console.log('📏 USDC decimals:', usdcDecimals);

    // Convert gasAmount (actual amount) to minimum unit (wei)
    // Example: 3 USDC -> 3 * 10^6 = 3000000
    const inputAmountWei = ethers.parseUnits(gasAmount.toString(), usdcDecimals).toString();
    console.log('💵 Amount conversion:', { original: gasAmount, decimals: usdcDecimals, wei: inputAmountWei });

    // Get current block information
    const blockNumber = await contract.runner.provider.getBlockNumber();
    console.log('📦 Current block number:', blockNumber);

    // Close provider to release resources
    provider.destroy();
    console.log('🔌 Provider closed');

    // Call executeManualRefuelByAgent (manual refuel, no policy required)
    const result = await executeManualRefuelByAgent({
      tokenId: parseInt(tokenId),
      destinationChainId: parseInt(chainId),
      receiver: owner,
      inputToken: usdcAddress,
      inputAmount: inputAmountWei, // Use converted wei format
      contractAddress: contract.target,
      blockNumber,
      gasLeft: 1000000,
      deadlineDelta: 600
    }, { delegatorPkpEthAddress });

    console.log('✅ Manual refuel successful:', result);

    res.json({
      success: true,
      result: {
        tokenId: parseInt(tokenId),
        chainId: parseInt(chainId),
        gasAmount,
        owner,
        txHash: result.result?.txHash,
        requestData: result.requestData,
        minOutputAmount: result.minOutputAmount,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ Trigger manual refuel failed:', error);
    res.status(500).json({
      success: false,
      error: error.message || String(error)
    });
  }
}));

export default router;
