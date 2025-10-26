import 'dotenv/config';
import { ethers } from 'ethers';
import express from 'express';
import cors from 'cors';
import { GAS_PASS_CONFIG, GAS_PASS_ABI } from './config/gasPassConfig.js';
import { SUPPORTED_CHAINS } from './config/BungeeConfig.js';
import apiRouter from './routes/index.js';
import { createRelayerService } from './relayer/index.js';

/**
 * GasPass Unified Server
 * Integrates Relayer and Monitor functionality
 */

const app = express();
app.use(cors());
app.use(express.json());

// Environment variable validation
const required = ['PRIVATE_KEY', 'RPC_URL'];
const missing = required.filter(key => !process.env[key]);

if (missing.length > 0) {
  console.error(`❌ Missing required environment variables: ${missing.join(', ')}`);
  process.exit(1);
}

// Settings
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const RPC_URL = process.env.RPC_URL || GAS_PASS_CONFIG.network.rpc;
const PORT = process.env.PORT || GAS_PASS_CONFIG.service.port;

// Create provider and wallet
const provider = new ethers.JsonRpcProvider(RPC_URL);
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

// Create contract instance
const contract = new ethers.Contract(GAS_PASS_CONFIG.contractAddress, GAS_PASS_ABI, wallet);

console.log(`🚀 GasPass unified server starting...`);
console.log(`👤 Relayer address: ${wallet.address}`);
console.log(`🌐 RPC endpoint: ${RPC_URL}`);
console.log(`📋 Contract address: ${GAS_PASS_CONFIG.contractAddress}`);
console.log(`🔗 Network: ${GAS_PASS_CONFIG.network.name} (${GAS_PASS_CONFIG.network.chainId})`);

// Initialize Relayer service
const relayerService = createRelayerService(wallet);
console.log(`🔧 Relayer service initialized: ${relayerService.getRelayerInfo().address}`);

// Store wallet and contract in app.locals for use in routes
app.locals.wallet = wallet;
app.locals.contract = contract;

// Integrate API routes
app.use('/api', apiRouter);

// ==================== Basic Endpoints ====================

// Health check
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

// Get Relayer address
app.get('/relayer', (req, res) => {
  res.json({
    address: wallet.address,
    network: GAS_PASS_CONFIG.network.name,
    chainId: GAS_PASS_CONFIG.network.chainId
  });
});

// Get contract configuration
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

// ==================== Scheduled Monitoring Functionality ====================

// Scheduled monitoring execution
function startMonitoring(intervalMinutes = 1) {
  console.log(`🕐 Starting monitoring, executing every ${intervalMinutes} minutes`);
  
  // Execute immediately
  triggerMonitorScan();
  
  // Set interval timer
  setInterval(() => {
    console.log(`\n⏰ ${new Date().toLocaleString()} - Starting new scan`);
    triggerMonitorScan();
  }, intervalMinutes * 60 * 1000);
}

// Trigger monitoring scan
async function triggerMonitorScan() {
  try {
    // Simulate POST request to monitor router
    const mockReq = {
      app: {
        locals: { contract, wallet }
      }
    };
    const mockRes = {
      json: (data) => {
        if (data.success) {
          console.log('✅ Monitoring scan completed:', data.data);
        } else {
          console.error('❌ Monitoring scan failed:', data.error);
        }
      },
      status: () => ({
        json: (data) => {
          console.error('❌ Monitoring scan failed:', data.error);
        }
      })
    };
    
    // Call checkAllPolicies function directly
    const { checkAllPolicies } = await import('./routes/monitor.js');
    
    const defaultRpcUrl = process.env.RPC_URL || GAS_PASS_CONFIG.network.rpc;
    console.log('🔍 Using RPC endpoint:', defaultRpcUrl);
    const result = await checkAllPolicies(contract, defaultRpcUrl, wallet);
    console.log('✅ Monitoring scan completed:', result);
  } catch (error) {
    console.error('❌ Trigger monitoring scan failed:', error.message);
  }
}

// Start monitoring
startMonitoring();

// Start server
app.listen(PORT, () => {
  console.log(`🌐 GasPass unified server running on port ${PORT}`);
  console.log(`📡 API endpoint: http://localhost:${PORT}`);
  console.log(`🔍 Health check: http://localhost:${PORT}/health`);
  console.log(`📊 Monitor status: http://localhost:${PORT}/api/monitor/status`);
  console.log(`🔗 Vincent API: http://localhost:${PORT}/api/vincent`);
  console.log(`⚡ GasPass API: http://localhost:${PORT}/api/gaspass`);
  console.log(`🚀 Relayer API: http://localhost:${PORT}/api/relayer`);
  console.log(`📈 Monitor API: http://localhost:${PORT}/api/monitor`);
});

export default app;
