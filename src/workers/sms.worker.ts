import 'dotenv/config';
import { Worker, Queue } from 'bullmq';
import IORedis from 'ioredis';
import { smsService } from '../services/sms.service';
import { logger } from '../services/logger.service';

const connection = new IORedis(process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: null,
});

export const smsQueue = new Queue('sms', { connection });

const worker = new Worker(
  'sms',
  async (job) => {
    const { messageId, to, body } = job.data;
    logger.info('Processing SMS job', { jobId: job.id, messageId, to });
    await smsService.sendImmediate(messageId, to, body);
  },
  {
    connection,
    concurrency: 10, // Process up to 10 messages concurrently
  }
);

worker.on('completed', (job) => {
  logger.info('SMS job completed', { jobId: job.id });
});

worker.on('failed', (job, err) => {
  logger.error('SMS job failed', { jobId: job?.id, error: err.message });
});

worker.on('error', (err) => {
  logger.error('Worker error', { error: err.message });
});

logger.info('SMS Worker started');

export default worker;
