import express, { Express, Request, Response } from 'express';
import { env } from './config/env.ts';
import { errorHandler } from './shared/middlewares/error.middleware.ts';
import { authRoutes } from './modules/auth/auth.routes.ts';

const app: Express = express();

// Core middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Base health check route
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// Domain modules
app.use('/auth', authRoutes);

// Global error handling middleware (must be registered last)
app.use(errorHandler);

// Start server if not running in test mode
if (env.NODE_ENV !== 'test') {
  app.listen(env.PORT, () => {
    console.log(`[nodestar] Server running on http://localhost:${env.PORT}`);
  });
}

export default app;
