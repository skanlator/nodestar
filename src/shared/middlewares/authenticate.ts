import { Request, Response, NextFunction } from 'express';
import { JwtService } from '../utils/jwt';
import { AppError } from '../errors/app-error';

export const authenticate = (req: Request, _res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError(401, 'Authorization token missing or malformed');
    }

    const token = authHeader.split(' ')[1];
    const payload = JwtService.verifyToken(token); 

    req.user = payload as any;
    next();
  } catch (error) {
    
    next(new AppError(401, 'Invalid or expired token'));
  }
};
