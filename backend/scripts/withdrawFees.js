import 'dotenv/config';
import { ethers } from 'ethers';

/*
Fee withdrawal script

Usage:
1. Set environment variables:
   - GASPASS_ADDRESS: GasPass contract address
   - PRIVATE_KEY: Contract owner's private key
   - RPC_URL: RPC endpoint URL
   - WITHDRAW_TO: Address to receive fees (optional, defaults to owner address)

2. Execute:
   node withdrawFees.js

3. Example:
   GASPASS_ADDRESS=0x... PRIVATE_KEY=0x... node withdrawFees.js
   GASPASS_ADDRESS=0x... PRIVATE_KEY=0x... WITHDRAW_TO=0x... node withdrawFees.js
*/

// GasPass ABI (only required functions)
const GAS_PASS_ABI = [
  'function getWithdrawableFees() view returns (uint256)',
  'function withdrawFees(address to) external',
  'function owner() view returns (address)'
];

async function withdrawFees() {
  try {
    // Environment variable validation
    const required = ['GASPASS_ADDRESS', 'PRIVATE_KEY', 'RPC_URL'];
    const missing = required.filter(key => !process.env[key]);
    
    if (missing.length > 0) {
      throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    }

    // Set parameters
    const contractAddress = process.env.GASPASS_ADDRESS;
    const privateKey = process.env.PRIVATE_KEY;
    const rpcUrl = process.env.RPC_URL;
    const withdrawTo = process.env.WITHDRAW_TO || null; // If not set, will use owner address

    console.log('🚀 Starting fee withdrawal...');
    console.log(`📋 Contract address: ${contractAddress}`);
    console.log(`🌐 RPC endpoint: ${rpcUrl}`);

    // Create provider and wallet
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const wallet = new ethers.Wallet(privateKey, provider);
    
    console.log(`👤 Wallet address: ${wallet.address}`);

    // Create contract instance
    const contract = new ethers.Contract(contractAddress, GAS_PASS_ABI, wallet);

    // Check contract owner
    const contractOwner = await contract.owner();
    if (contractOwner.toLowerCase() !== wallet.address.toLowerCase()) {
      throw new Error(`Wallet address ${wallet.address} 不是合約 owner (${contractOwner})`);
    }
    console.log(`✅ 確認是合約 owner`);

    // 檢查可提領的手續費
    const withdrawableFees = await contract.getWithdrawableFees();
    const withdrawableFeesFormatted = ethers.formatUnits(withdrawableFees, 6);
    
    console.log(`💰 可提領手續費: ${withdrawableFeesFormatted} USDC`);
    
    if (withdrawableFees === 0n) {
      console.log('ℹ️  沒有可提領的手續費');
      return;
    }

    // 決定提領地址
    const finalWithdrawTo = withdrawTo || wallet.address;
    console.log(`🎯 提領到地址: ${finalWithdrawTo}`);

    // 檢查餘額
    const balance = await provider.getBalance(wallet.address);
    const balanceEth = ethers.formatEther(balance);
    console.log(`💳 錢包 ETH 餘額: ${balanceEth} ETH`);

    if (balance < ethers.parseEther('0.001')) {
      console.warn('⚠️  ETH balance may be insufficient to pay gas fees');
    }

    // 執行提領
    console.log('📤 Withdrawing fees...');
    const tx = await contract.withdrawFees(finalWithdrawTo);
    console.log(`📝 Transaction hash: ${tx.hash}`);
    console.log('⏳ Waiting for transaction confirmation...');

    const receipt = await tx.wait();
    console.log(`✅ Transaction confirmed! Gas used: ${receipt.gasUsed.toString()}`);

    // Verify withdrawal result
    const remainingFees = await contract.getWithdrawableFees();
    console.log(`💰 Remaining fees: ${ethers.formatUnits(remainingFees, 6)} USDC`);

    if (remainingFees === 0n) {
      console.log('🎉 Fee withdrawal completed！');
    } else {
      console.log('⚠️  Some fees remain unwithdrawn，Please check if transaction succeeded');
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
  withdrawFees();
}

export { withdrawFees };
