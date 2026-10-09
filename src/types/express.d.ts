import { JwtPayload } from '../shared/utils/jwt.ts';

declare global {
  namespace Express {
    interface Request {
      user: JwtPayload;
    }
  }
}
