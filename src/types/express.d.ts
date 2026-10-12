import { JwtPayload } from '../shared/utils/jwt';

declare global {
  namespace Express {
    interface Request {
      /**
       * Authenticated user payload attached by the auth middleware
       */
      user?: JwtPayload & { sub: string };
    }
  }
}
