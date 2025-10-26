import 'dotenv/config';
import { ethers } from 'ethers';

/*
User USDC withdrawal script (simplified version)

Usage:
1. Set environment variables:
   - GASPASS_ADDRESS: GasPass contract address
   - PRIVATE_KEY: User's private key
   - RPC_URL: RPC endpoint URL
   - TOKEN_ID: GasPass tokenId to withdraw
   - WITHDRAW_TO: Address to receive USDC (optional, defaults to user address)

2. Execute:
   node withdrawUserUSDC.js

3. Example:
   GASPASS_ADDRESS=0x... PRIVATE_KEY=0x... TOKEN_ID=1 node withdrawUserUSDC.js
*/

// GasPass ABI (only required functions)
const GAS_PASS_ABI = [
  'function balanceOf(uint256 tokenId) view returns (uint256)',
  'function ownerOf(uint256 tokenId) view returns (address)',
  'function withdrawAllUSDC(uint256 tokenId, address to) external'
];

async function withdrawUserUSDC() {
  try {
    // Environment variable validation
    const required = ['GASPASS_ADDRESS', 'PRIVATE_KEY', 'RPC_URL', 'TOKEN_ID'];
    const missing = required.filter(key => !process.env[key]);
    
    if (missing.length > 0) {
      throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    }

    // Set parameters
    const contractAddress = process.env.GASPASS_ADDRESS;
    const privateKey = process.env.PRIVATE_KEY;
    const rpcUrl = process.env.RPC_URL;
    const tokenId = process.env.TOKEN_ID;
    const withdrawTo = process.env.WITHDRAW_TO || null;

    console.log('🚀 Starting user USDC withdrawal...');
    console.log(`📋 Contract address: ${contractAddress}`);
    console.log(`🎫 Token ID: ${tokenId}`);
    console.log(`🌐 RPC endpoint: ${rpcUrl}`);

    // Create provider and wallet
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const wallet = new ethers.Wallet(privateKey, provider);
    
    console.log(`👤 User address: ${wallet.address}`);

    // Create contract instance
    const contract = new ethers.Contract(contractAddress, GAS_PASS_ABI, wallet);

    // Check token owner
    const tokenOwner = await contract.ownerOf(tokenId);
    if (tokenOwner.toLowerCase() !== wallet.address.toLowerCase()) {
      throw new Error(`Address ${wallet.address} is not Token #${tokenId} Owner (Owner: ${tokenOwner})`);
    }
    console.log(`✅ Confirm Token #${tokenId} Owner`);

    // Check balance
    const balance = await contract.balanceOf(tokenId);
    const balanceFormatted = ethers.formatUnits(balance, 6); // USDC has 6 decimals
    
    console.log(`💰 Token #${tokenId} Balance: ${balanceFormatted} USDC`);
    
    if (balance === 0n) {
      console.log('ℹ️  No USDC available to withdraw');
      return;
    }

    // Determine withdraw address
    const finalWithdrawTo = withdrawTo || wallet.address;
    console.log(`🎯 Withdraw to address: ${finalWithdrawTo}`);

    // Check ETH balance
    const ethBalance = await provider.getBalance(wallet.address);
    const ethBalanceFormatted = ethers.formatEther(ethBalance);
    console.log(`💳 Wallet ETH balance: ${ethBalanceFormatted} ETH`);

    if (ethBalance < ethers.parseEther('0.001')) {
      console.warn('⚠️  ETH balance may be insufficient to pay gas fees');
    }

    // Withdraw all
    console.log(`📤 Withdrawing all ${balanceFormatted} USDC...`);
    const tx = await contract.withdrawAllUSDC(tokenId, finalWithdrawTo);

    console.log(`📝 Transaction hash: ${tx.hash}`);
    console.log('⏳ Waiting for transaction confirmation...');

    const receipt = await tx.wait();
    console.log(`✅ Transaction confirmed! Gas used: ${receipt.gasUsed.toString()}`);

    // Verify withdrawal result
    const remainingBalance = await contract.balanceOf(tokenId);
    const remainingBalanceFormatted = ethers.formatUnits(remainingBalance, 6);
    console.log(`💰 Remaining balance: ${remainingBalanceFormatted} USDC`);

    if (remainingBalance === 0n) {
      console.log('🎉 USDC withdrawal completed!');
    } else {
      console.log('ℹ️  Some balance remains unwithdrawn');
    }

  } catch (error) {
    console.error('❌ Withdrawal failed:', error.message);
    if (error.code) {
      console.error(`Error code: ${error.code}`);
    }
    if (error.reason) {
      console.error(`Error reason: ${error.reason}`);
    }
    process.exit(1);
  }
}

// If this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  withdrawUserUSDC();
}

export { withdrawUserUSDC };
