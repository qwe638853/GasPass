import { ethers } from 'ethers';
import { GAS_PASS_CONFIG } from '../config/gasPassConfig.js';
import { SUPPORTED_CHAINS } from '../config/BungeeConfig.js';
import { executeCompleteAutoRefuel } from '../vincent/bridge.js';
import express from 'express';

// ETH price cache
const priceCache = new Map();
const PRICE_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Get ETH price（USDC）
async function getETHPrice() {
  const now = Date.now();
  const cached = priceCache.get('ETH_USDC');
  
  if (cached && (now - cached.timestamp) < PRICE_CACHE_DURATION) {
    return cached.price;
  }
  
  try {
    // Use CoinGecko API to get ETH price
    const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd');
    const data = await response.json();
    
    if (data.ethereum && data.ethereum.usd) {
      const price = data.ethereum.usd;
      priceCache.set('ETH_USDC', { price, timestamp: now });
      console.log(`💰 ETH Price updated to: $${price}`);
      return price;
    }
    
    throw new Error('Failed to get ETH price');
  } catch (error) {
    console.error('❌ Failed to get ETH price:', error.message);
    
    // If fetching fails, use cached price or default price
    if (cached) {
      console.log('🔄 Using cached ETH price:', cached.price);
      return cached.price;
    }
    
    // Default price $3000
    console.log('⚠️  Using default ETH price: $3000');
    return 3000;
  }
}

const router = express.Router();

// Create multi-chain Provider cache
const providerCache = new Map();

function getProvider(chainId = null, defaultRpcUrl) {
  const rpcUrl = chainId 
    ? SUPPORTED_CHAINS[chainId]?.rpc || defaultRpcUrl
    : defaultRpcUrl;
  
  if (!providerCache.has(rpcUrl)) {
    providerCache.set(rpcUrl, new ethers.JsonRpcProvider(rpcUrl));
  }
  return providerCache.get(rpcUrl);
}

// Check wallet balance for specific chain (with retry mechanism)
async function checkBalance(walletAddress, chainId, defaultRpcUrl, retries = 3) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const config = SUPPORTED_CHAINS[chainId];
      if (!config) {
        console.warn(`Unsupported chain ID: ${chainId}`);
        return null;
      }

      const provider = getProvider(chainId, defaultRpcUrl);
      const balance = await provider.getBalance(walletAddress);
      const balanceInEth = ethers.formatEther(balance);
      
      // If it is ETH chain, need to convert to USDC unit for comparison
      if (config.nativeSymbol === 'ETH') {
        const ethPrice = await getETHPrice();
        const balanceInUsd = parseFloat(balanceInEth) * ethPrice;
        const balanceInUsdc = Math.floor(balanceInUsd * 1000000); // USDC minimum unit (6 decimals)
        
        console.log(`💰 ${config.name}: ${walletAddress}`);
        console.log(`   ETH balance: ${balanceInEth} ETH`);
        console.log(`   ETH price: $${ethPrice}`);
        console.log(`   converted to: $${balanceInUsd.toFixed(2)} = ${balanceInUsdc} USDC (minimum unit)`);
        
        return {
          nativeBalance: parseFloat(balanceInEth),
          nativeSymbol: config.nativeSymbol,
          usdcBalance: balanceInUsdc, // USDC minimum unit
          ethPrice: ethPrice
        };
      } else {
        // Other chains return native balance directly
        console.log(`💰 ${config.name}: ${walletAddress} balance = ${balanceInEth} ${config.nativeSymbol}`);
        
        return {
          nativeBalance: parseFloat(balanceInEth),
          nativeSymbol: config.nativeSymbol,
          usdcBalance: null,
          ethPrice: null
        };
      }
    } catch (error) {
      console.error(`Failed to check balance for ${SUPPORTED_CHAINS[chainId]?.name || chainId} (attempt ${attempt}/${retries}):`, error.message);
      
      if (attempt === retries) {
        console.error(`Out of retries, skipping this chain`);
        return null;
      }
      
      // wait then retry
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
    }
  }
  return null;
}

// Trigger auto refuel
async function triggerAutoRefuel(tokenId, chainId, contract) {
  try {
    console.log(`🚀 trigger autoRefuel: tokenId=${tokenId}, chainId=${chainId}`);
    
    // Get policy info
    const policy = await contract.chainPolicies(tokenId, chainId);
    const gasAmount = policy.gasAmount;
    const policyAgent = policy.policyAgent;
    
    // Get token owner
    const owner = await contract.ownerOf(tokenId);
    
    // Get USDC contract address
    const usdcAddress = await contract.stablecoin();
    
    // Get current block info
    const blockNumber = await contract.runner.provider.getBlockNumber();
    
    // Call executeCompleteAutoRefuel
    const result = await executeCompleteAutoRefuel({
      tokenId,
      destinationChainId: parseInt(chainId),
      receiver: owner,
      inputToken: usdcAddress,
      inputAmount: gasAmount,
      contractAddress: contract.target,
      blockNumber,
      gasLeft: 1000000,
      deadlineDelta: 600
    }, { delegatorPkpEthAddress: policyAgent });

    console.log(`✅ AutoRefuel triggered successfully:`, result);
    return { success: true, tokenId, chainId, result };
  } catch (error) {
    console.error(`❌ Failed to trigger autoRefuel:`, error.message);
    throw error;
  }
}

// Check all policies
async function checkAllPolicies(contract, defaultRpcUrl, wallet) {
  try {
    console.log('\n🔍 Start scanning all policies...');
    
    const totalSupply = await contract.totalSupply();
    const totalSupplyNum = Number(totalSupply);
    
    // Get accumulated fees
    const totalFees = await contract.totalFeesCollected();
    const withdrawableFees = await contract.getWithdrawableFees();
    const totalFeesFormatted = ethers.formatUnits(totalFees, 6);
    const withdrawableFeesFormatted = ethers.formatUnits(withdrawableFees, 6);
    
    console.log(`📊 found in total ${totalSupplyNum} tokens`);
    console.log(`💰 Accumulated fee revenue: ${totalFeesFormatted} USDC`);
    console.log(`💎 Withdrawable fees: ${withdrawableFeesFormatted} USDC`);
    
    if (totalSupplyNum === 0) {
      console.log('ℹ️  No tokens found, skip scan');
      return {
        totalTokens: 0,
        policiesFound: 0,
        refuelsTriggered: 0,
        totalPotentialFees: 0,
        totalFees: totalFeesFormatted,
        withdrawableFees: withdrawableFeesFormatted
      };
    }

    let policiesFound = 0;
    let refuelsTriggered = 0;
    let totalPotentialFees = 0;

    // iterate all tokenId
    for (let i = 0; i < totalSupplyNum; i++) {
      const tokenId = await contract.tokenByIndex(i);
      
      const tokenIdNum = Number(tokenId);
      console.log(`\n🎫 check TokenId #${tokenIdNum}`);
      
      // Get token owner
      const owner = await contract.ownerOf(tokenId);
      console.log(`👤 owner: ${owner}`);
      
      // get token balance
      const tokenBalance = await contract.balanceOf(tokenIdNum);
      const tokenBalanceFormatted = ethers.formatUnits(tokenBalance, 6);
      console.log(`💰 Token balance: ${tokenBalanceFormatted} USDC`);
      
      // iterate allsupportedchain
      for (const [chainId, config] of Object.entries(SUPPORTED_CHAINS)) {
        try {
          const policy = await contract.chainPolicies(tokenIdNum, chainId);
          const threshold = parseFloat(ethers.formatEther(policy.threshold));
          
          if (threshold > 0) {
            policiesFound++;
            console.log(`📋 Policy found: ${config.name} (threshold: ${threshold} ${config.nativeSymbol})`);
            
            // check Token balance（USDC）
            const tokenBalance = await contract.balanceOf(tokenIdNum);
            const tokenBalanceInUsdc = parseFloat(ethers.formatUnits(tokenBalance, 6));
            
            console.log(`💰 Token balance: ${tokenBalanceInUsdc} USDC`);
            
            // checkchainonbalance
            const balanceInfo = await checkBalance(owner, parseInt(chainId), defaultRpcUrl);
            
            if (balanceInfo !== null) {
              // unified comparison logic：所有chainbothUSDC minimum unitfor comparison
              let currentBalanceInUsdc;
              let needsRefuel = false;
              let thresholdInUsdc;
              
              if (config.nativeSymbol === 'ETH') {
                // ETH chain：使用priceconverted USDC 值
                currentBalanceInUsdc = balanceInfo.usdcBalance;
                thresholdInUsdc = policy.threshold; // policy.threshold is already USDC minimum unit
                needsRefuel = currentBalanceInUsdc < thresholdInUsdc;
                
                console.log(`💱 ${config.name} balancecheck:`);
                console.log(`   ETH balance: ${balanceInfo.nativeBalance} ETH`);
                console.log(`   ETH price: $${balanceInfo.ethPrice}`);
                console.log(`   after conversion: ${currentBalanceInUsdc} USDC (minimum unit)`);
                console.log(`   threshold: ${thresholdInUsdc} USDC (minimum unit)`);
                console.log(`   comparison result: ${currentBalanceInUsdc} ${needsRefuel ? '<' : '>='} ${thresholdInUsdc}`);
                
              } else {
                // Other chains: directly use native unit (assume policy.threshold is native unit)
                // Need to adjust based on actual situation, if other chains policy.threshold is also USDC unit
                currentBalanceInUsdc = balanceInfo.nativeBalance;
                thresholdInUsdc = threshold;
                needsRefuel = currentBalanceInUsdc < thresholdInUsdc;
                
                console.log(`💰 ${config.name} balancecheck:`);
                console.log(`   原生balance: ${balanceInfo.nativeBalance} ${config.nativeSymbol}`);
                console.log(`   threshold: ${thresholdInUsdc} ${config.nativeSymbol}`);
                console.log(`   comparison result: ${currentBalanceInUsdc} ${needsRefuel ? '<' : '>='} ${thresholdInUsdc}`);
              }
              
              // Unified refuel logic: need to check Token balance and chain balance
              if (needsRefuel) {
                if (tokenBalanceInUsdc <= 0) {
                  console.log(`❌ Token balance insufficient (${tokenBalanceInUsdc} USDC), skip refuel`);
                } else {
                  console.log(`⚠️  Chain balance insufficient, but Token balance sufficient (${tokenBalanceInUsdc} USDC), trigger auto refuel...`);
                  
                  try {
                    await triggerAutoRefuel(tokenIdNum, chainId, contract, wallet);
                    refuelsTriggered++;
                    console.log(`✅ AutoRefuel triggered: TokenId #${tokenIdNum} -> ${config.name}`);
                  } catch (error) {
                    console.error(`❌ Failed to trigger autoRefuel:`, error.message);
                  }
                }
              } else {
                console.log(`✅ Chain balance sufficient, no refuel needed`);
              }
            }
          }
        } catch (error) {
          console.error(`❌ Failed to check policy (TokenId: ${tokenIdNum}, Chain: ${chainId}):`, error.message);
        }
      }
    }

    console.log(`\n📈 Scan completion statistics:`);
    console.log(`  📋 Policy found: ${policiesFound} policies`);
    console.log(`  🚀 Refuels triggered: ${refuelsTriggered} times`);
    console.log(`  💰 Potential fees: ${totalPotentialFees.toFixed(6)} USDC`);
    console.log(`  💎 Accumulated fees: ${totalFeesFormatted} USDC`);
    console.log(`  🏦 Withdrawable fees: ${withdrawableFeesFormatted} USDC`);
    
    return {
      totalTokens: totalSupplyNum,
      policiesFound,
      refuelsTriggered,
      totalPotentialFees,
      totalFees: totalFeesFormatted,
      withdrawableFees: withdrawableFeesFormatted
    };
    
  } catch (error) {
    console.error('❌ Failed to scan policies:', error.message);
    throw error;
  }
}

// ==================== API Endpoints ====================

// Manually trigger monitoring scan
router.post('/scan', async (req, res) => {
  try {
    console.log('🔍 Manually trigger monitoring scan...');
    const { contract, wallet } = req.app.locals;
    const defaultRpcUrl = process.env.RPC_URL || GAS_PASS_CONFIG.network.rpc;
    
    const result = await checkAllPolicies(contract, defaultRpcUrl, wallet);
    res.json({ 
      success: true, 
      message: 'Monitoring scan completed',
      data: result
    });
  } catch (error) {
    console.error('❌ Manual scan failed:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get monitoring status
router.get('/status', async (req, res) => {
  try {
    const { contract } = req.app.locals;
    const totalSupply = await contract.totalSupply();
    const totalFees = await contract.totalFeesCollected();
    const withdrawableFees = await contract.getWithdrawableFees();
    
    res.json({
      success: true,
      totalTokens: Number(totalSupply),
      totalFees: ethers.formatUnits(totalFees, 6),
      withdrawableFees: ethers.formatUnits(withdrawableFees, 6),
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Failed to get monitoring status:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get supported chains list
router.get('/chains', (req, res) => {
  try {
    const chains = Object.keys(SUPPORTED_CHAINS).map(chainId => ({
      chainId: parseInt(chainId),
      name: SUPPORTED_CHAINS[chainId].name,
      nativeSymbol: SUPPORTED_CHAINS[chainId].nativeSymbol,
      rpc: SUPPORTED_CHAINS[chainId].rpc
    }));
    
    res.json({
      success: true,
      chains,
      total: chains.length
    });
  } catch (error) {
    console.error('❌ Failed to get supported chains list:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Check specific token policy
router.get('/token/:tokenId', async (req, res) => {
  try {
    const { tokenId } = req.params;
    const { contract } = req.app.locals;
    const defaultRpcUrl = process.env.RPC_URL || GAS_PASS_CONFIG.network.rpc;
    
    const tokenIdNum = parseInt(tokenId);
    
    // Get token owner
    const owner = await contract.ownerOf(tokenIdNum);
    
    // get token balance
    const tokenBalance = await contract.balanceOf(tokenIdNum);
    const tokenBalanceFormatted = ethers.formatUnits(tokenBalance, 6);
    
    const policies = [];
    
    // iterate allsupportedchain
    for (const [chainId, config] of Object.entries(SUPPORTED_CHAINS)) {
      try {
        const policy = await contract.chainPolicies(tokenIdNum, chainId);
        const threshold = parseFloat(ethers.formatEther(policy.threshold));
        
        if (threshold > 0) {
          // check Token balance
          const tokenBalance = await contract.balanceOf(tokenIdNum);
          const tokenBalanceInUsdc = parseFloat(ethers.formatUnits(tokenBalance, 6));
          
          // checkchainonbalance
          const balanceInfo = await checkBalance(owner, parseInt(chainId), defaultRpcUrl);
          
          let needsRefuel = false;
          let currentBalanceInUsdc = null;
          let thresholdInUsdc = null;
          
          if (balanceInfo !== null) {
            if (config.nativeSymbol === 'ETH') {
              // ETH chain: use USDC unit for comparison
              currentBalanceInUsdc = balanceInfo.usdcBalance;
              thresholdInUsdc = policy.threshold;
              needsRefuel = balanceInfo.usdcBalance < thresholdInUsdc;
            } else {
              // Other chains: use native unit for comparison
              currentBalanceInUsdc = balanceInfo.nativeBalance;
              thresholdInUsdc = threshold;
              needsRefuel = balanceInfo.nativeBalance < threshold;
            }
          }
          
          // Check if refuel is possible (require Token balance sufficient)
          const canRefuel = tokenBalanceInUsdc > 0;
          
          policies.push({
            chainId: parseInt(chainId),
            chainName: config.name,
            nativeSymbol: config.nativeSymbol,
            threshold: thresholdInUsdc,
            thresholdUnit: config.nativeSymbol === 'ETH' ? 'USDC' : config.nativeSymbol,
            gasAmount: ethers.formatUnits(policy.gasAmount, 6),
            currentBalance: currentBalanceInUsdc,
            currentBalanceUnit: config.nativeSymbol === 'ETH' ? 'USDC' : config.nativeSymbol,
            nativeBalance: balanceInfo?.nativeBalance || null,
            usdcBalance: balanceInfo?.usdcBalance || null,
            ethPrice: balanceInfo?.ethPrice || null,
            tokenBalance: tokenBalanceInUsdc,
            needsRefuel: needsRefuel,
            canRefuel: canRefuel,
            policyAgent: policy.policyAgent,
            lastRefuel: policy.lastRefuel
          });
        }
        } catch (error) {
          console.error(`❌ Failed to check policy (TokenId: ${tokenIdNum}, Chain: ${chainId}):`, error.message);
        }
    }
    
    res.json({
      success: true,
      tokenId: tokenIdNum,
      owner,
      tokenBalance: tokenBalanceFormatted,
      policies,
      totalPolicies: policies.length
    });
  } catch (error) {
    console.error('❌ Failed to get token policy:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Export function for use by server.js
export { checkAllPolicies };

export default router;
