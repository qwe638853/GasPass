import { Router } from 'express';
import vincentModule from './vincent.js';
import gaspassRouter from './gaspass.js';
import relayerRouter from '../relayer/index.js';
import monitorRouter from './monitor.js';

const router = Router();

// Basic API endpoints
router.get('/', (req, res) => {
  res.json({ 
    message: 'GasPass API is reachable',
    version: '1.0.0',
    endpoints: {
      vincent: '/api/vincent',
      gaspass: '/api/gaspass',
      relayer: '/api/relayer',
      monitor: '/api/monitor'
    }
  });
});

// Integrate all sub-routes
router.use('/vincent', vincentModule);
router.use('/gaspass', gaspassRouter);
router.use('/relayer', relayerRouter);
router.use('/monitor', monitorRouter);

export default router;


