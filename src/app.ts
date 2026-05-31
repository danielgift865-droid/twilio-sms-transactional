import 'dotenv/config';
import express from 'express';
import rateLimit from 'express-rate-limit';
import { router } from './routes';
import { logger } from './services/logger.service';

const app = express();
const PORT = process.env.PORT || 3000;

// Trust proxy (for rate limiting behind load balancers)
app.set('trust proxy', 1);

// Parse raw body for Twilio signature validation
app.use('/webhooks', express.urlencoded({ extended: false }));
app.use(express.json());

// Rate limiting for API routes
const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100,
  message: { error: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', apiLimiter);

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/', router);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  logger.error('Unhandled error', { error: err.message, stack: err.stack });
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  logger.info(`SMS Transactional Server running on port ${PORT}`);
});

export default app;
