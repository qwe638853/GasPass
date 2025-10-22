import 'dotenv/config';
import { ethers } from 'ethers';

/*
環境變量設定說明：
在 backend 目錄下創建 .env 文件，包含以下變量：

# 必須設定
GASPASS_ADDRESS=0x...  # GasPass 合約地址（部署後填入）

# 可選設定
BASE_RPC_URL=https://sepolia.base.org  # GasPass 合約部署的鏈（測試網用 Base Sepolia）
MONITOR_INTERVAL=1  # 監聽間隔（分鐘，預設 1 分鐘）

# 注意：目前只測試監測功能，不實際觸發 autoRefuel

# 測試網 RPC 覆蓋（可選）
# ARB_SEPOLIA_RPC_URL=https://sepolia-rollup.arbitrum.io/rpc
# BASE_SEPOLIA_RPC_URL=https://sepolia.base.org
# ETH_SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR-API-KEY
# POLYGON_AMOY_RPC_URL=https://rpc-amoy.polygon.technology

# 主網 RPC 覆蓋（可選）
# ETH_RPC_URL=https://mainnet.infura.io/v3/YOUR-API-KEY
# ARB_RPC_URL=https://arb1.arbitrum.io/rpc
# OP_RPC_URL=https://mainnet.optimism.io
# POLYGON_RPC_URL=https://polygon-rpc.com
*/

// 測試網和主網的 RPC 配置
const CHAIN_CONFIGS = {
  // 測試網
  421614: {
    rpc: 'https://sepolia-rollup.arbitrum.io/rpc', // testnet
    name: 'Arbitrum Sepolia',
    nativeSymbol: 'ETH',
    nativeName: 'Arbitrum Sepolia Ether'
  },
  84532: {
    rpc: 'https://sepolia.base.org',// testnet
    name: 'Base Sepolia',
    nativeSymbol: 'ETH',
    nativeName: 'Base Sepolia Ether'
  },
  11155111: {
    rpc: 'https://sepolia.infura.io/v3/YOUR-API-KEY',// testnet
    name: 'Ethereum Sepolia',
    nativeSymbol: 'ETH',
    nativeName: 'Ethereum Sepolia Ether'
  },
  80002: {
    rpc: 'https://rpc-amoy.polygon.technology',// testnet
    name: 'Polygon Amoy',
    nativeSymbol: 'MATIC',
    nativeName: 'Polygon Amoy'
  },
  
  // 主網（保留原有配置）
  1: {
    rpc: 'https://mainnet.infura.io/v3/YOUR-API-KEY',
    name: 'Ethereum',
    nativeSymbol: 'ETH',
    nativeName: 'Ether'
  },
  42161: {
    rpc: 'https://arb1.arbitrum.io/rpc',
    name: 'Arbitrum One',
    nativeSymbol: 'ETH',
    nativeName: 'Ether'
  },
  8453: {
    rpc: 'https://mainnet.base.org',
    name: 'Base Mainnet',
    nativeSymbol: 'ETH',
    nativeName: 'Ether'
  },
  43114: {
    rpc: 'https://api.avax.network/ext/bc/C/rpc',
    name: 'Avalanche C-Chain',
    nativeSymbol: 'AVAX',
    nativeName: 'Avalanche'
  },
  56: {
    rpc: 'https://bsc-dataseed.binance.org/',
    name: 'Binance Smart Chain',
    nativeSymbol: 'BNB',
    nativeName: 'Binance Coin'
  },
  100: {
    rpc: 'https://rpc.gnosischain.com',
    name: 'Gnosis Chain',
    nativeSymbol: 'xDAI',
    nativeName: 'Gnosis'
  },
  5000: {
    rpc: 'https://rpc.mantle.xyz/',
    name: 'Mantle Network',
    nativeSymbol: 'MNT',
    nativeName: 'Mantle'
  },
  34443: {
    rpc: 'https://mainnet.mode.network/',
    name: 'Mode Mainnet',
    nativeSymbol: 'ETH',
    nativeName: 'Ether'
  },
  130: {
    rpc: 'https://mainnet.unichain.org',
    name: 'Unichain Mainnet',
    nativeSymbol: 'UNIETH',
    nativeName: 'Uni Ether'
  },
  1868: {
    rpc: 'https://rpc.soneium.org/',
    name: 'Soneium Mainnet',
    nativeSymbol: 'Soneium',
    nativeName: 'Soneium'
  },
  57073: {
    rpc: 'https://rpc-qnd.inkonchain.com',
    name: 'Ink Mainnet',
    nativeSymbol: 'INK',
    nativeName: 'Ink'
  },
  81457: {
    rpc: 'https://rpc.ankr.com/blast',
    name: 'Blast Mainnet',
    nativeSymbol: 'BLAST',
    nativeName: 'Blast'
  },
  59144: {
    rpc: 'https://linea-rpc.publicnode.com',
    name: 'Linea',
    nativeSymbol: 'ETH',
    nativeName: 'Ether'
  },
  137: {
    rpc: 'https://polygon-rpc.com',
    name: 'Polygon',
    nativeSymbol: 'MATIC',
    nativeName: 'Polygon'
  },
  534352: {
    rpc: 'https://scroll-rpc.publicnode.com',
    name: 'Scroll',
    nativeSymbol: 'ETH',
    nativeName: 'Ether'
  },
  146: {
    rpc: 'https://rpc.soniclabs.com',
    name: 'Sonic',
    nativeSymbol: 'S',
    nativeName: 'Sonic'
  },
  10: {
    rpc: 'https://mainnet.optimism.io',
    name: 'Optimism',
    nativeSymbol: 'ETH',
    nativeName: 'Ether'
  },
  80094: {
    rpc: 'https://rpc.berachain.com',
    name: 'Berachain',
    nativeSymbol: 'BERA',
    nativeName: 'Berachain'
  }
};

// 完整的 GasPass ABI
const GAS_PASS_ABI = [
  'function totalSupply() view returns (uint256)',
  'function tokenByIndex(uint256) view returns (uint256)',
  'function ownerOf(uint256) view returns (address)',
  'function chainPolicies(uint256, uint256) view returns (uint128 gasAmount, uint128 threshold, address agent)',
  'function autoRefuel(uint256 tokenId, uint256 targetChainId) external',
  'function balanceOf(uint256 tokenId) view returns (uint256)'
];

// 創建多鏈 Provider 緩存
const providerCache = new Map();

function getProvider(chainId = null) {
  const rpcUrl = chainId 
    ? CHAIN_CONFIGS[chainId]?.rpc || process.env.BASE_RPC_URL || 'http://127.0.0.1:8545'
    : process.env.BASE_RPC_URL || process.env.AVAIL_RPC_URL || process.env.MONITOR_RPC_URL || 'http://127.0.0.1:8545';
  
  if (!providerCache.has(rpcUrl)) {
    providerCache.set(rpcUrl, new ethers.JsonRpcProvider(rpcUrl));
  }
  return providerCache.get(rpcUrl);
}

function getGasPassContract() {
  const provider = getProvider();
  const address = process.env.GASPASS_ADDRESS || "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
  if (!address) throw new Error('GASPASS_ADDRESS 未設定');

  return new ethers.Contract(address, GAS_PASS_ABI, provider);
}

// 檢查特定鏈的錢包餘額
async function checkBalance(walletAddress, chainId) {
  try {
    const config = CHAIN_CONFIGS[chainId];
    if (!config) {
      console.warn(`⚠️  不支援的鏈 ID: ${chainId}`);
      return null;
    }

    const provider = getProvider(chainId);
    const balance = await provider.getBalance(walletAddress);
    const balanceInEth = ethers.utils.formatEther(balance);
    
    console.log(`💰 ${config.name}: ${walletAddress} 餘額 = ${balanceInEth} ${config.nativeSymbol}`);
    return parseFloat(balanceInEth);
  } catch (error) {
    console.error(`❌ 查詢 ${CHAIN_CONFIGS[chainId]?.name || chainId} 餘額失敗:`, error.message);
    return null;
  }
}

// 模擬觸發自動補氣（僅測試監測功能）
async function triggerAutoRefuel(tokenId, chainId) {
  try {
    console.log(`🚀 [模擬] 觸發 autoRefuel: tokenId=${tokenId}, chainId=${chainId}`);
    console.log(`📝 [模擬] 這裡會呼叫合約的 autoRefuel 函數`);
    console.log(`📝 [模擬] 合約會扣除 GasPass token 餘額並轉給 agent`);
    console.log(`📝 [模擬] Agent 收到 USDC 後會透過 Lit Protocol 執行跨鏈`);
    
    // 模擬成功
    return { hash: '0x' + Math.random().toString(16).substr(2, 64) };
  } catch (error) {
    console.error(`❌ 模擬觸發 autoRefuel 失敗:`, error.message);
    throw error;
  }
}

// 檢查所有策略
async function checkAllPolicies() {
  try {
    console.log('\n🔍 開始掃描所有策略...');
    
    const contract = getGasPassContract();
    const totalSupply = await contract.totalSupply();
    const totalSupplyNum = Number(totalSupply);
    
    console.log(`📊 總共發現 ${totalSupplyNum} 個 token`);
    
    if (totalSupplyNum === 0) {
      console.log('ℹ️  沒有 token，跳過掃描');
      return;
    }

    let policiesFound = 0;
    let refuelsTriggered = 0;

    // 遍歷所有 tokenId
    for (let i = 0; i < totalSupplyNum; i++) {
      const tokenId = await contract.tokenByIndex(i);
      const tokenIdNum = Number(tokenId);
      
      console.log(`\n🎫 檢查 TokenId #${tokenIdNum}`);
      
      // 獲取 token 擁有者
      const owner = await contract.ownerOf(tokenId);
      console.log(`👤 擁有者: ${owner}`);
      
      // 遍歷所有支援的鏈
      for (const [chainId, config] of Object.entries(CHAIN_CONFIGS)) {
        try {
          const policy = await contract.chainPolicies(tokenIdNum, chainId);
          const threshold = parseFloat(ethers.utils.formatEther(policy.threshold));
          
          if (threshold > 0) {
            policiesFound++;
            console.log(`📋 發現策略: ${config.name} (threshold: ${threshold} ${config.nativeSymbol})`);
            
            // 檢查餘額
            const balance = await checkBalance(owner, parseInt(chainId));
            
            if (balance !== null && balance < threshold) {
              console.log(`⚠️  餘額不足! ${balance} < ${threshold} ${config.nativeSymbol}`);
              
              // 觸發自動補氣
              try {
                await triggerAutoRefuel(tokenIdNum, chainId);
                refuelsTriggered++;
                console.log(`✅ 已觸發補氣: TokenId #${tokenIdNum} -> ${config.name}`);
              } catch (error) {
                console.error(`❌ 補氣失敗:`, error.message);
              }
            } else if (balance !== null) {
              console.log(`✅ 餘額充足: ${balance} >= ${threshold} ${config.nativeSymbol}`);
            }
          }
        } catch (error) {
          console.error(`❌ 檢查策略失敗 (TokenId: ${tokenIdNum}, Chain: ${chainId}):`, error.message);
        }
      }
    }

    console.log(`\n📈 掃描完成: 發現 ${policiesFound} 個策略，觸發 ${refuelsTriggered} 次補氣`);
    
  } catch (error) {
    console.error('❌ 掃描策略失敗:', error.message);
  }
}

// 定時執行監聽
function startMonitoring(intervalMinutes = 1) {
  console.log(`🕐 開始監聽，每 ${intervalMinutes} 分鐘執行一次`);
  
  // 立即執行一次
  checkAllPolicies();
  
  // 設定定時器
  setInterval(() => {
    console.log(`\n⏰ ${new Date().toLocaleString('zh-TW')} - 開始新一輪掃描`);
    checkAllPolicies();
  }, intervalMinutes * 60 * 1000);
}

// 導出函數
export async function getMaxTokenId(contractAddress) {
  const contract = getGasPassContract();
  const code = await getProvider().getCode(contract.address);
  if (!code || code === '0x') {
    throw new Error(`地址無合約碼: ${contract.address}`);
  }

  const supply = await contract.totalSupply();
  const totalSupplyNum = Number(supply);
  if (totalSupplyNum === 0) return 0;

  let maxId = 0;
  for (let i = 0; i < totalSupplyNum; i++) {
    const id = await contract.tokenByIndex(i);
    const idNum = Number(id);
    if (idNum > maxId) maxId = idNum;
  }
  return maxId;
}

export async function monitor() {
  const maxId = await getMaxTokenId();
  console.log('Max tokenId:', maxId.toString());
}

export { checkAllPolicies, startMonitoring, checkBalance, triggerAutoRefuel };

// 如果直接執行此文件，開始監聽
console.log('🔍 檢查執行條件...');
console.log('import.meta.url:', import.meta.url);
console.log('process.argv[1]:', process.argv[1]);

// 修正路徑比較
const currentFile = import.meta.url.replace('file:///', '').replace(/\//g, '\\');
const isMainModule = currentFile === process.argv[1];
console.log('修正後比較:', currentFile, '===', process.argv[1], '=', isMainModule);

if (isMainModule) {
  console.log('🚀 Monitor 啟動中...');
  console.log('📋 環境變量檢查:');
  console.log('  GASPASS_ADDRESS:', process.env.GASPASS_ADDRESS || '未設定');
  console.log('  BASE_RPC_URL:', process.env.BASE_RPC_URL || '未設定');
  console.log('');
  
  try {
    startMonitoring();
  } catch (error) {
    console.error('❌ Monitor 啟動失敗:', error.message);
    console.error(error.stack);
  }
} else {
  console.log('❌ 條件不匹配，程序退出');
}

