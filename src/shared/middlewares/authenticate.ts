import { Request, Response, NextFunction } from 'express';
import { JwtService } from '../utils/jwt.ts';
import { AppError } from '../errors/app-error.ts';

export const authenticate = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new AppError('Unauthorized: Missing or invalid token', 401));
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = JwtService.verifyToken(token);
    req.user = decoded;
    next();
  } catch {
    return next(new AppError('Unauthorized: Token is invalid or expired', 401));
  }
};
