### Rate Limiting Strategy

#### 1. Global Application (All Routes)
By declaring `app.use(globalRateLimiter)` in `src/app.ts` prior to domain routers, every incoming HTTP request (`GET`, `POST`, `PUT`, `DELETE`) passes through the global rate limiter (e.g., 100 requests per 15-minute window per IP).

#### 2. Endpoint-Specific Application (Sensitive Routes)
For routes vulnerable to brute-force attacks (such as `/api/auth/login` or `/api/auth/register`), a stricter rate limiter (`authRateLimiter`, capped at 10 requests per 15 minutes) can be layered on top.

This middleware is applied directly within the specific module's router file (`src/modules/auth/auth.routes.ts`):

```typescript
import { Router } from 'express';
import { authRateLimiter } from '../../shared/middlewares/rate-limiter.ts';
import { AuthService } from './auth.service.ts';

export const authRouter = Router();

// The authRateLimiter middleware applies strictly to this endpoint
authRouter.post('/login', authRateLimiter, async (req, res, next) => {
  try {
    const result = await AuthService.login(req.body);
    res.json(result);
  } catch (error) {
    next(error);
  }
});
