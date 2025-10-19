import 'dotenv/config';
import express from 'express';
import cors from 'cors';

import routes from './routes/index.js';
import notFound from './middleware/notFound.js';
import errorHandler from './middleware/errorHandler.js';
import { monitor } from './monitor/monitor.js';

const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api', routes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`Server listening on http://localhost:${PORT}`);
    const intervalMs = parseInt(process.env.MONITOR_INTERVAL_MS || '3000', 10);
    // eslint-disable-next-line no-console
    console.log(`Monitor started: every ${intervalMs}ms`);
    setInterval(() => {
        monitor().catch((err) => console.error('Monitor error:', err));
    }, intervalMs);
});

