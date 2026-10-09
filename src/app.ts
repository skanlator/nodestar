import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import pinoHttp from 'pino-http';
import { env } from './config/env.ts';
import { logger } from './shared/logger/index.ts';
import { globalRateLimiter } from './shared/middlewares/rate-limiter.ts';
import { errorHandler } from './shared/middlewares/error-handler.ts';
import { authRouter } from './modules/auth/auth.routes.ts';

export const app = express();

// 1. HTTP request logging
app.use(pinoHttp({ logger }));

// 2. Security headers & CORS policy
app.use(helmet());
app.use(cors({ origin: env.CORS_ORIGIN }));

// 3. Global rate limiting
app.use(globalRateLimiter);

// 4. Body parsing
app.use(express.json());

// 5. Domain Routes
app.use('/api/auth', authRouter);

// 6. Global error handling middleware
app.use(errorHandler);
