import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;

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

// Start server if not running in test mode
if (process.env.NODE_ENV !== 'test') {
  app.listen(port, () => {
    console.log(`[nodestar] Server running on http://localhost:${port}`);
  });
}

export default app;
