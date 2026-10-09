import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import pinoHttp from 'pino-http';
import { env } from './config/env.ts';
import { logger } from './shared/logger/index.ts';
import { globalRateLimiter } from './shared/middlewares/rate-limiter.ts';
import { errorHandler } from './shared/middlewares/error-handler.ts';

export const app = express();

// 1. Logging HTTP
app.use(pinoHttp({ logger }));

// 2. Cabeceras de seguridad e integración CORS
app.use(helmet());
app.use(cors({ origin: env.CORS_ORIGIN }));

// 3. Rate Limiting Global
app.use(globalRateLimiter);

// 4. Body parsing
app.use(express.json());

// 5. Rutas
// app.use('/api', apiRouter);

// 6. Manejo global de errores
app.use(errorHandler);
