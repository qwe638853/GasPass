import 'dotenv/config';
import { ethers } from 'ethers';

/*
用戶提領 USDC 腳本（簡化版）

使用方法：
1. 設定環境變量：
   - GASPASS_ADDRESS: GasPass 合約地址
   - PRIVATE_KEY: 用戶的私鑰
   - RPC_URL: RPC 端點 URL
   - TOKEN_ID: 要提領的 GasPass tokenId
   - WITHDRAW_TO: 接收 USDC 的地址（可選，預設為用戶地址）

2. 執行：
   node withdrawUserUSDC.js

3. 範例：
   GASPASS_ADDRESS=0x... PRIVATE_KEY=0x... TOKEN_ID=1 node withdrawUserUSDC.js
*/

// GasPass ABI（僅包含需要的函數）
const GAS_PASS_ABI = [
  'function balanceOf(uint256 tokenId) view returns (uint256)',
  'function ownerOf(uint256 tokenId) view returns (address)',
  'function withdrawAllUSDC(uint256 tokenId, address to) external'
];

async function withdrawUserUSDC() {
  try {
    // 環境變量驗證
    const required = ['GASPASS_ADDRESS', 'PRIVATE_KEY', 'RPC_URL', 'TOKEN_ID'];
    const missing = required.filter(key => !process.env[key]);
    
    if (missing.length > 0) {
      throw new Error(`缺少必要的環境變量: ${missing.join(', ')}`);
    }

    // 設定參數
    const contractAddress = process.env.GASPASS_ADDRESS;
    const privateKey = process.env.PRIVATE_KEY;
    const rpcUrl = process.env.RPC_URL;
    const tokenId = process.env.TOKEN_ID;
    const withdrawTo = process.env.WITHDRAW_TO || null;

    console.log('🚀 開始提領用戶 USDC...');
    console.log(`📋 合約地址: ${contractAddress}`);
    console.log(`🎫 Token ID: ${tokenId}`);
    console.log(`🌐 RPC 端點: ${rpcUrl}`);

    // 創建 provider 和 wallet
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const wallet = new ethers.Wallet(privateKey, provider);
    
    console.log(`👤 用戶地址: ${wallet.address}`);

    // 創建合約實例
    const contract = new ethers.Contract(contractAddress, GAS_PASS_ABI, wallet);

    // 檢查 token 擁有者
    const tokenOwner = await contract.ownerOf(tokenId);
    if (tokenOwner.toLowerCase() !== wallet.address.toLowerCase()) {
      throw new Error(`地址 ${wallet.address} 不是 Token #${tokenId} 的擁有者 (擁有者: ${tokenOwner})`);
    }
    console.log(`✅ 確認是 Token #${tokenId} 的擁有者`);

    // 檢查餘額
    const balance = await contract.balanceOf(tokenId);
    const balanceFormatted = ethers.formatUnits(balance, 6); // USDC 是 6 位小數
    
    console.log(`💰 Token #${tokenId} 餘額: ${balanceFormatted} USDC`);
    
    if (balance === 0n) {
      console.log('ℹ️  沒有可提領的 USDC');
      return;
    }

    // 決定提領地址
    const finalWithdrawTo = withdrawTo || wallet.address;
    console.log(`🎯 提領到地址: ${finalWithdrawTo}`);

    // 檢查 ETH 餘額
    const ethBalance = await provider.getBalance(wallet.address);
    const ethBalanceFormatted = ethers.formatEther(ethBalance);
    console.log(`💳 錢包 ETH 餘額: ${ethBalanceFormatted} ETH`);

    if (ethBalance < ethers.parseEther('0.001')) {
      console.warn('⚠️  ETH 餘額可能不足以支付 gas 費用');
    }

    // 提領全部
    console.log(`📤 正在提領全部 ${balanceFormatted} USDC...`);
    const tx = await contract.withdrawAllUSDC(tokenId, finalWithdrawTo);

    console.log(`📝 交易哈希: ${tx.hash}`);
    console.log('⏳ 等待交易確認...');

    const receipt = await tx.wait();
    console.log(`✅ 交易確認！Gas 使用量: ${receipt.gasUsed.toString()}`);

    // 驗證提領結果
    const remainingBalance = await contract.balanceOf(tokenId);
    const remainingBalanceFormatted = ethers.formatUnits(remainingBalance, 6);
    console.log(`💰 剩餘餘額: ${remainingBalanceFormatted} USDC`);

    if (remainingBalance === 0n) {
      console.log('🎉 USDC 提領完成！');
    } else {
      console.log('ℹ️  仍有部分餘額未提領');
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
  withdrawUserUSDC();
}

export { withdrawUserUSDC };
