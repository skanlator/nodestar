import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import pinoHttp from 'pino-http';
import { sql } from 'drizzle-orm';
import { env } from './config/env.ts';
import { logger } from './shared/logger/index.ts';
import { db } from './shared/db/index.ts';
import { globalRateLimiter } from './shared/middlewares/rate-limiter.ts';
import { errorHandler } from './shared/middlewares/error-handler.ts';
import { authRouter } from './modules/auth/auth.routes.ts';

export const app = express();

// 1. HTTP request logging
app.use(pinoHttp({ logger }));

// 2. Security headers & CORS policy
app.use(helmet());
app.use(cors({ origin: env.CORS_ORIGIN }));

// 3. Healthcheck endpoint (placed before global rate limiter for monitoring/load balancers)
app.get('/health', async (_req, res) => {
  try {
    // Ping PostgreSQL connection via Drizzle ORM
    await db.execute(sql`SELECT 1`);

    res.status(200).json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: 'connected',
    });
  } catch (error) {
    logger.error({ err: error }, 'Healthcheck failed - database unreachable');
    
    res.status(503).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      database: 'disconnected',
    });
  }
});

// 4. Global rate limiting
app.use(globalRateLimiter);

// 5. Body parsing
app.use(express.json());

// 6. Domain Routes
app.use('/api/auth', authRouter);

// 7. Global error handling middleware
app.use(errorHandler);
