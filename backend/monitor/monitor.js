import 'dotenv/config';
import { ethers } from 'ethers';

/*
環境變量設定說明：
在 backend 目錄下創建 .env 文件，包含以下變量：

# 必須設定
GASPASS_ADDRESS=0x...  # GasPass 合約地址（部署後填入）
AGENT_PRIVATE_KEY=0x...  # Agent 私鑰（用於觸發 autoRefuel）

# 可選設定
BASE_RPC_URL=https://mainnet.base.org  # GasPass 合約部署的鏈（預設 Base）
MONITOR_INTERVAL=1  # 監聽間隔（分鐘，預設 1 分鐘）

# 可選：覆蓋特定鏈的 RPC URL
# ETH_RPC_URL=https://mainnet.infura.io/v3/YOUR-API-KEY
# ARB_RPC_URL=https://arb1.arbitrum.io/rpc
# OP_RPC_URL=https://mainnet.optimism.io
# POLYGON_RPC_URL=https://polygon-rpc.com
*/

// 18 條鏈的 RPC 配置
const CHAIN_CONFIGS = {
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

// 觸發自動補氣
async function triggerAutoRefuel(tokenId, chainId) {
  try {
    const contract = getGasPassContract();
    const agentWallet = new ethers.Wallet(process.env.AGENT_PRIVATE_KEY, getProvider());
    const contractWithSigner = contract.connect(agentWallet);
    
    console.log(`🚀 觸發 autoRefuel: tokenId=${tokenId}, chainId=${chainId}`);
    
    // 實際調用合約（測試時可以先註解掉）
    const tx = await contractWithSigner.autoRefuel(tokenId, chainId);
    console.log(`✅ autoRefuel 交易已發送: ${tx.hash}`);
    
    return tx;
  } catch (error) {
    console.error(`❌ 觸發 autoRefuel 失敗:`, error.message);
    throw error;
  }
}

// 檢查所有策略
async function checkAllPolicies() {
  try {
    console.log('\n🔍 開始掃描所有策略...');
    
    const contract = getGasPassContract();
    const totalSupply = await contract.totalSupply();
    const totalSupplyNum = totalSupply.toNumber();
    
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
      const tokenIdNum = tokenId.toNumber();
      
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
  const supplyBn = ethers.BigNumber.isBigNumber(supply) ? supply : ethers.BigNumber.from(supply);
  if (supplyBn.isZero()) return ethers.BigNumber.from(0);

  let maxId = ethers.BigNumber.from(0);
  const total = supplyBn.toNumber();
  for (let i = 0; i < total; i++) {
    const id = await contract.tokenByIndex(i);
    const idBn = ethers.BigNumber.isBigNumber(id) ? id : ethers.BigNumber.from(id);
    if (idBn.gt(maxId)) maxId = idBn;
  }
  return maxId;
}

export async function monitor() {
  const maxId = await getMaxTokenId();
  console.log('Max tokenId:', maxId.toString());
}

export { checkAllPolicies, startMonitoring, checkBalance, triggerAutoRefuel };

// 如果直接執行此文件，開始監聽
if (import.meta.url === `file://${process.argv[1]}`) {
  startMonitoring();
}

