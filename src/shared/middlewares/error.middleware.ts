import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/app-error.ts';
import { ZodError } from 'zod';

/**
 * Global error handling middleware for Express applications
 */
export const errorHandler = (
  err: Error & { statusCode?: number | string; errors?: any[] },
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  // 1. Handle Zod validation errors explicitly (returns 400 Bad Request)
  if (err instanceof ZodError) {
    const message = err.errors.map((e) => e.message).join(', ');
    return res.status(400).json({
      status: 'error',
      message,
    });
  }

  // 2. Check if it's an operational error (AppError) with a valid status code
  if (err instanceof AppError || (err.statusCode !== undefined)) {
    const rawStatus = err.statusCode;
    const statusCode = typeof rawStatus === 'number' 
      ? rawStatus 
      : (typeof rawStatus === 'string' && !isNaN(Number(rawStatus)) ? Number(rawStatus) : 500);

    return res.status(statusCode).json({
      status: 'error',
      message: err.message || 'An error occurred',
    });
  }

  // 3. Log unhandled errors for debugging purposes
  console.error('[Unhandled Error]:', err);

  return res.status(500).json({
    status: 'error',
    message: 'Internal server error',
  });
};