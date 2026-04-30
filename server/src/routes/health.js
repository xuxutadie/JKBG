import { Router } from 'express';
import { config } from '../config.js';
import { prisma } from '../lib/prisma.js';

const router = Router();

router.get('/', async (_req, res, next) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({
      status: 'ok',
      service: 'health-platform-server',
      timestamp: new Date().toISOString(),
      ai: {
        apiKeyConfigured: Boolean(config.ai.apiKey),
        baseUrlConfigured: Boolean(config.ai.baseUrl),
        modelConfigured: Boolean(config.ai.model),
        baseUrl: config.ai.baseUrl || null,
        model: config.ai.model || null
      }
    });
  } catch (error) {
    next(error);
  }
});

export default router;
