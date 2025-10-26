import 'dotenv/config';
import { ethers } from 'ethers';
import express from 'express';
import cors from 'cors';
import { GAS_PASS_CONFIG, GAS_PASS_ABI } from './config/gasPassConfig.js';
import { SUPPORTED_CHAINS } from './config/BungeeConfig.js';
import apiRouter from './routes/index.js';
import { createRelayerService } from './relayer/index.js';

/**
 * GasPass 統一服務器
 * 整合 Relayer 和 Monitor 功能
 */

const app = express();
app.use(cors());
app.use(express.json());

// 環境變量驗證
const required = ['PRIVATE_KEY', 'RPC_URL'];
const missing = required.filter(key => !process.env[key]);

if (missing.length > 0) {
  console.error(`❌ 缺少必要的環境變量: ${missing.join(', ')}`);
  process.exit(1);
}

// 設定
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const RPC_URL = process.env.RPC_URL || GAS_PASS_CONFIG.network.rpc;
const PORT = process.env.PORT || GAS_PASS_CONFIG.service.port;

// 創建 provider 和 wallet
const provider = new ethers.JsonRpcProvider(RPC_URL);
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

// 創建合約實例
const contract = new ethers.Contract(GAS_PASS_CONFIG.contractAddress, GAS_PASS_ABI, wallet);

console.log(`🚀 GasPass 統一服務器啟動中...`);
console.log(`👤 Relayer 地址: ${wallet.address}`);
console.log(`🌐 RPC 端點: ${RPC_URL}`);
console.log(`📋 合約地址: ${GAS_PASS_CONFIG.contractAddress}`);
console.log(`🔗 網絡: ${GAS_PASS_CONFIG.network.name} (${GAS_PASS_CONFIG.network.chainId})`);

// 初始化 Relayer 服務
const relayerService = createRelayerService(wallet);
console.log(`🔧 Relayer 服務已初始化: ${relayerService.getRelayerInfo().address}`);

// 將 wallet 和 contract 存儲到 app.locals 供路由使用
app.locals.wallet = wallet;
app.locals.contract = contract;

// 整合 API 路由
app.use('/api', apiRouter);

// ==================== 基本端點 ====================

// 健康檢查
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'GasPass Unified Server',
    relayer: wallet.address,
    contract: GAS_PASS_CONFIG.contractAddress,
    network: GAS_PASS_CONFIG.network.name,
    chainId: GAS_PASS_CONFIG.network.chainId,
    timestamp: new Date().toISOString()
  });
});

// 獲取 Relayer 地址
app.get('/relayer', (req, res) => {
  res.json({
    address: wallet.address,
    network: GAS_PASS_CONFIG.network.name,
    chainId: GAS_PASS_CONFIG.network.chainId
  });
});

// 獲取合約配置
app.get('/config', (req, res) => {
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

// ==================== 定時監控功能 ====================

// 定時執行監聽
function startMonitoring(intervalMinutes = 1) {
  console.log(`🕐 開始監聽，每 ${intervalMinutes} 分鐘執行一次`);
  
  // 立即執行一次
  triggerMonitorScan();
  
  // 設定定時器
  setInterval(() => {
    console.log(`\n⏰ ${new Date().toLocaleString('zh-TW')} - 開始新一輪掃描`);
    triggerMonitorScan();
  }, intervalMinutes * 60 * 1000);
}

// 觸發監控掃描
async function triggerMonitorScan() {
  try {
    // 模擬 POST 請求到 monitor router
    const mockReq = {
      app: {
        locals: { contract, wallet }
      }
    };
    const mockRes = {
      json: (data) => {
        if (data.success) {
          console.log('✅ 監控掃描完成:', data.data);
        } else {
          console.error('❌ 監控掃描失敗:', data.error);
        }
      },
      status: () => ({
        json: (data) => {
          console.error('❌ 監控掃描失敗:', data.error);
        }
      })
    };
    
    // 直接調用 checkAllPolicies 函數
    const { checkAllPolicies } = await import('./routes/monitor.js');
    
    const defaultRpcUrl = process.env.RPC_URL || GAS_PASS_CONFIG.network.rpc;
    console.log('🔍 使用 RPC 端點:', defaultRpcUrl);
    const result = await checkAllPolicies(contract, defaultRpcUrl, wallet);
    console.log('✅ 監控掃描完成:', result);
  } catch (error) {
    console.error('❌ 觸發監控掃描失敗:', error.message);
  }
}

// 啟動監控
startMonitoring();

// 啟動服務
app.listen(PORT, () => {
  console.log(`🌐 GasPass 統一服務器運行在端口 ${PORT}`);
  console.log(`📡 API 端點: http://localhost:${PORT}`);
  console.log(`🔍 健康檢查: http://localhost:${PORT}/health`);
  console.log(`📊 監控狀態: http://localhost:${PORT}/api/monitor/status`);
  console.log(`🔗 Vincent API: http://localhost:${PORT}/api/vincent`);
  console.log(`⚡ GasPass API: http://localhost:${PORT}/api/gaspass`);
  console.log(`🚀 Relayer API: http://localhost:${PORT}/api/relayer`);
  console.log(`📈 Monitor API: http://localhost:${PORT}/api/monitor`);
});

export default app;
