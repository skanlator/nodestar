import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/app-error.ts';

/**
 * Global error handling middleware for Express applications
 */
export const errorHandler = (
  err: Error & { statusCode?: number | string },
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  // Check if it's an operational error (AppError) with a valid status code
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

  // Log unhandled errors for debugging purposes
  console.error('[Unhandled Error]:', err);

  return res.status(500).json({
    status: 'error',
    message: 'Internal server error',
  });
};
