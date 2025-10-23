import 'dotenv/config';
import { ethers } from 'ethers';

/*
手續費提領腳本

使用方法：
1. 設定環境變量：
   - GASPASS_ADDRESS: GasPass 合約地址
   - PRIVATE_KEY: 合約 owner 的私鑰
   - RPC_URL: RPC 端點 URL
   - WITHDRAW_TO: 接收手續費的地址（可選，預設為 owner 地址）

2. 執行：
   node withdrawFees.js

3. 範例：
   GASPASS_ADDRESS=0x... PRIVATE_KEY=0x... node withdrawFees.js
   GASPASS_ADDRESS=0x... PRIVATE_KEY=0x... WITHDRAW_TO=0x... node withdrawFees.js
*/

// GasPass ABI（僅包含需要的函數）
const GAS_PASS_ABI = [
  'function getWithdrawableFees() view returns (uint256)',
  'function withdrawFees(address to) external',
  'function owner() view returns (address)'
];

async function withdrawFees() {
  try {
    // 環境變量驗證
    const required = ['GASPASS_ADDRESS', 'PRIVATE_KEY', 'RPC_URL'];
    const missing = required.filter(key => !process.env[key]);
    
    if (missing.length > 0) {
      throw new Error(`缺少必要的環境變量: ${missing.join(', ')}`);
    }

    // 設定參數
    const contractAddress = process.env.GASPASS_ADDRESS;
    const privateKey = process.env.PRIVATE_KEY;
    const rpcUrl = process.env.RPC_URL;
    const withdrawTo = process.env.WITHDRAW_TO || null; // 如果未設定，將使用 owner 地址

    console.log('🚀 開始提領手續費...');
    console.log(`📋 合約地址: ${contractAddress}`);
    console.log(`🌐 RPC 端點: ${rpcUrl}`);

    // 創建 provider 和 wallet
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const wallet = new ethers.Wallet(privateKey, provider);
    
    console.log(`👤 錢包地址: ${wallet.address}`);

    // 創建合約實例
    const contract = new ethers.Contract(contractAddress, GAS_PASS_ABI, wallet);

    // 檢查合約 owner
    const contractOwner = await contract.owner();
    if (contractOwner.toLowerCase() !== wallet.address.toLowerCase()) {
      throw new Error(`錢包地址 ${wallet.address} 不是合約 owner (${contractOwner})`);
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
      console.warn('⚠️  ETH 餘額可能不足以支付 gas 費用');
    }

    // 執行提領
    console.log('📤 正在提領手續費...');
    const tx = await contract.withdrawFees(finalWithdrawTo);
    console.log(`📝 交易哈希: ${tx.hash}`);
    console.log('⏳ 等待交易確認...');

    const receipt = await tx.wait();
    console.log(`✅ 交易確認！Gas 使用量: ${receipt.gasUsed.toString()}`);

    // 驗證提領結果
    const remainingFees = await contract.getWithdrawableFees();
    console.log(`💰 剩餘手續費: ${ethers.formatUnits(remainingFees, 6)} USDC`);

    if (remainingFees === 0n) {
      console.log('🎉 手續費提領完成！');
    } else {
      console.log('⚠️  仍有手續費未提領，請檢查交易是否成功');
    }

  } catch (error) {
    console.error('❌ 提領失敗:', error.message);
    if (error.code) {
      console.error(`錯誤代碼: ${error.code}`);
    }
    if (error.reason) {
      console.error(`錯誤原因: ${error.reason}`);
    }
    process.exit(1);
  }
}

// 如果直接執行此文件
if (import.meta.url === `file://${process.argv[1]}`) {
  withdrawFees();
}

export { withdrawFees };
