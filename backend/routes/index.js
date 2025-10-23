import { Router } from 'express';
import vincentRouter from './vincent.js';
import gaspassRouter from './gaspass.js';
import relayerRouter from '../relayer/index.js';

const router = Router();

// 基本 API 端點
router.get('/', (req, res) => {
  res.json({ 
    message: 'GasPass API is reachable',
    version: '1.0.0',
    endpoints: {
      vincent: '/api/vincent',
      gaspass: '/api/gaspass',
      relayer: '/api/relayer'
    }
  });
});

// 整合所有子路由
router.use('/vincent', vincentRouter);
router.use('/gaspass', gaspassRouter);
router.use('/relayer', relayerRouter);

export default router;


