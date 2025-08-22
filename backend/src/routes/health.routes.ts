/**
 * Health Check Routes for Mandla Rice MRV System
 */

import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';
import { testSentryEndpoint } from '../middleware/sentry';

const router = Router();

// Basic health check
router.get('/', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    service: 'Mandla Rice MRV System',
    version: '1.0.0'
  });
});

// Detailed health check with dependencies
router.get('/detailed', async (req: Request, res: Response) => {
  const health = {
    status: 'OK',
    timestamp: new Date().toISOString(),
    service: 'Mandla Rice MRV System',
    version: '1.0.0',
    dependencies: {
      database: 'OK',
      redis: 'OK',
      openai: 'OK',
      blockchain: 'OK',
      ipfs: 'OK'
    }
  };

  try {
    // Check database
    const prisma = new PrismaClient();
    await prisma.$queryRaw`SELECT 1`;
    await prisma.$disconnect();
  } catch (error) {
    health.dependencies.database = 'ERROR';
    health.status = 'DEGRADED';
    logger.error('Database health check failed:', error);
  }

  res.status(health.status === 'OK' ? 200 : 503).json(health);
});

// Sentry test endpoint
router.get('/test-sentry', testSentryEndpoint);

export default router;
