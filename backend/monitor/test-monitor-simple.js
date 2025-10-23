import 'dotenv/config';
import { ethers } from 'ethers';

// 測試網和主網的 RPC 配置
const CHAIN_CONFIGS = {
  // 測試網
  421614: {
    rpc: 'https://sepolia-rollup.arbitrum.io/rpc',
    name: 'Arbitrum Sepolia',
    nativeSymbol: 'ETH',
    nativeName: 'Arbitrum Sepolia Ether'
  },
  84532: {
    rpc: 'https://sepolia.base.org',
    name: 'Base Sepolia',
    nativeSymbol: 'ETH',
    nativeName: 'Base Sepolia Ether'
  },
  11155111: {
    rpc: 'https://sepolia.infura.io/v3/YOUR-API-KEY',
    name: 'Ethereum Sepolia',
    nativeSymbol: 'ETH',
    nativeName: 'Ethereum Sepolia Ether'
  },
  // 主網
  1: {
    rpc: 'https://mainnet.infura.io/v3/YOUR-API-KEY',
    name: 'Ethereum Mainnet',
    nativeSymbol: 'ETH',
    nativeName: 'Ether'
  },
  42161: {
    rpc: 'https://arb1.arbitrum.io/rpc',
    name: 'Arbitrum One',
    nativeSymbol: 'ETH',
    nativeName: 'Ether'
  },
  10: {
    rpc: 'https://mainnet.optimism.io',
    name: 'Optimism',
    nativeSymbol: 'ETH',
    nativeName: 'Ether'
  },
  137: {
    rpc: 'https://polygon-rpc.com',
    name: 'Polygon',
    nativeSymbol: 'MATIC',
    nativeName: 'Polygon'
  }
};

// 檢查指定地址在指定鏈上的餘額
async function checkBalance(walletAddress, chainId) {
  try {
    const config = CHAIN_CONFIGS[chainId];
    if (!config) {
      console.log(`❌ 不支援的鏈 ID: ${chainId}`);
      return null;
    }

    console.log(`🔍 檢查 ${config.name} 上的餘額...`);
    console.log(`📍 地址: ${walletAddress}`);
    console.log(`🌐 RPC: ${config.rpc}`);

    const provider = new ethers.JsonRpcProvider(config.rpc);
    const balance = await provider.getBalance(walletAddress);
    const balanceInEth = parseFloat(ethers.formatEther(balance));
    
    console.log(`💰 餘額: ${balanceInEth} ${config.nativeSymbol}`);
    return balanceInEth;
  } catch (error) {
    console.error(`❌ 檢查餘額失敗 (Chain ${chainId}):`, error.message);
    return null;
  }
}

// 測試多個地址和多個鏈
async function testMonitoring() {
  console.log('🚀 開始測試 monitor.js 的監測功能...\n');
  
  // 測試地址列表（你可以替換成真實地址）
  const testAddresses = [
    '0x2ccb42B46e63BdA5eecc216bFDFC7a4a26A2e841', // 你的地址
    '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045', // Vitalik 的地址
    '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6'  // 另一個測試地址
  ];
  
  // 測試鏈列表
  const testChains = [421614, 84532, 1, 42161, 10, 137]; // 包含測試網和主網
  
  console.log(`📋 測試 ${testAddresses.length} 個地址在 ${testChains.length} 條鏈上的餘額\n`);
  
  for (const address of testAddresses) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`👤 測試地址: ${address}`);
    console.log(`${'='.repeat(60)}`);
    
    for (const chainId of testChains) {
      await checkBalance(address, chainId);
      console.log(''); // 空行分隔
    }
  }
  
  console.log('\n✅ 測試完成！');
}

// 模擬策略檢查
async function simulatePolicyCheck() {
  console.log('\n🎯 模擬策略檢查...\n');
  
  const testAddress = '0x2ccb42B46e63BdA5eecc216bFDFC7a4a26A2e841';
  const testPolicies = [
    { chainId: 421614, threshold: 0.001, name: 'Arbitrum Sepolia' },
    { chainId: 1, threshold: 0.01, name: 'Ethereum Mainnet' },
    { chainId: 42161, threshold: 0.005, name: 'Arbitrum One' }
  ];
  
  for (const policy of testPolicies) {
    console.log(`\n📋 檢查策略: ${policy.name} (threshold: ${policy.threshold} ETH)`);
    
    const balance = await checkBalance(testAddress, policy.chainId);
    
    if (balance !== null) {
      if (balance < policy.threshold) {
        console.log(`⚠️  餘額不足! ${balance} < ${policy.threshold} ETH`);
        console.log(`🔄 應該觸發自動補氣...`);
      } else {
        console.log(`✅ 餘額充足: ${balance} >= ${policy.threshold} ETH`);
      }
    }
  }
}

// 主函數
async function main() {
  try {
    await testMonitoring();
    await simulatePolicyCheck();
  } catch (error) {
    console.error('❌ 測試失敗:', error);
  }
}

// 如果直接運行此腳本
const isMainModule = import.meta.url === `file://${process.argv[1]}` || 
                     import.meta.url.endsWith(process.argv[1]) ||
                     process.argv[1].includes('test-monitor-simple.js');

if (isMainModule) {
  console.log('🚀 啟動測試腳本...');
  main();
}

export { checkBalance, testMonitoring, simulatePolicyCheck };
