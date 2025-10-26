import { Router } from 'express';
import { RelayerService } from './relayerService.js';

const router = Router();

// Factory function to create RelayerService instance
let relayerService = null;

export function createRelayerService(wallet) {
  relayerService = new RelayerService(wallet);
  return relayerService;
}

export function getRelayerService() {
  if (!relayerService) {
    throw new Error('RelayerService not initialized. Call createRelayerService() first.');
  }
  return relayerService;
}

// 代送 mintWithSig 交易
router.post('/mint', async (req, res) => {
  try {
    const { typedData, signature } = req.body;
    const service = getRelayerService();
    
    const result = await service.relayMint(typedData, signature);
    res.json(result);
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// 代送 mintBatchWithSig 交易
router.post('/mint-batch', async (req, res) => {
  try {
    const { typedData, signature } = req.body;
    const service = getRelayerService();
    
    const result = await service.relayMintBatch(typedData, signature);
    res.json(result);
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// 代送 depositWithSig 交易
router.post('/deposit', async (req, res) => {
  try {
    const { typedData, signature } = req.body;
    const service = getRelayerService();
    
    const result = await service.relayDeposit(typedData, signature);
    res.json(result);
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// 代送 setRefuelPolicyWithSig 交易
router.post('/set-refuel-policy', async (req, res) => {
  try {
    const { typedData, signature } = req.body;
    const service = getRelayerService();
    
    const result = await service.relaySetRefuelPolicy(typedData, signature);
    res.json(result);
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// 代送 cancelRefuelPolicyWithSig 交易
router.post('/cancel-refuel-policy', async (req, res) => {
  try {
    const { typedData, signature } = req.body;
    const service = getRelayerService();
    
    const result = await service.relayCancelRefuelPolicy(typedData, signature);
    res.json(result);
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// 代送 setAgentToWalletWithSig 交易
router.post('/set-agent', async (req, res) => {
  try {
    const { typedData, signature } = req.body;
    const service = getRelayerService();
    
    const result = await service.relaySetAgent(typedData, signature);
    res.json(result);
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// 獲取 Relayer 資訊
router.get('/info', (req, res) => {
  try {
    const service = getRelayerService();
    const info = service.getRelayerInfo();
    res.json(info);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;
