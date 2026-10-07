import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/app-error.ts';

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      status: 'error',
      message: err.message,
    });
  }

  // Log de errores no controlados para depuración
  console.error('[Unhandled Error]:', err);

  return res.status(500).json({
    status: 'error',
    message: 'Internal server error',
  });
};
