import { Router } from 'express';
import { AuthService } from './auth.service.ts';
import { registerSchema, loginSchema, refreshTokenSchema } from './auth.schema.ts';
import { validateRequest } from '../../shared/middlewares/validate-request.ts';
import { authRateLimiter } from '../../shared/middlewares/rate-limiter.ts';
import { authenticate } from '../../shared/middlewares/authenticate.ts';
import { authorize } from '../../shared/middlewares/authorize.ts';

export const authRouter = Router();

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user account
 * @access  Public
 */
authRouter.post(
  '/register',
  authRateLimiter,
  validateRequest(registerSchema),
  async (req, res, next) => {
    try {
      const user = await AuthService.register(req.body);
      res.status(201).json({
        status: 'success',
        data: { user },
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user and return JWT tokens
 * @access  Public
 */
authRouter.post(
  '/login',
  authRateLimiter,
  validateRequest(loginSchema),
  async (req, res, next) => {
    try {
      const result = await AuthService.login(req.body);
      res.status(200).json({
        status: 'success',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route   POST /api/auth/refresh
 * @desc    Rotate access token using refresh token
 * @access  Public
 */
authRouter.post(
  '/refresh',
  validateRequest(refreshTokenSchema),
  async (req, res, next) => {
    try {
      const tokens = await AuthService.refresh(req.body);
      res.status(200).json({
        status: 'success',
        data: { tokens },
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route   POST /api/auth/logout
 * @desc    Revoke current refresh token
 * @access  Private (Authenticated)
 */
authRouter.post('/logout', authenticate, async (req, res, next) => {
  try {
    await AuthService.logout(req.user.sub);
    res.status(200).json({
      status: 'success',
      message: 'Logged out successfully',
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/auth/me
 * @desc    Get profile of currently authenticated user
 * @access  Private (Authenticated)
 */
authRouter.get('/me', authenticate, async (req, res, next) => {
  try {
    res.status(200).json({
      status: 'success',
      data: { user: req.user },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/auth/admin/dashboard
 * @desc    Admin panel endpoint protected by RBAC
 * @access  Private (Admin role only)
 */
authRouter.get(
  '/admin/dashboard',
  authenticate,
  authorize('admin'),
  async (_req, res, next) => {
    try {
      res.status(200).json({
        status: 'success',
        message: 'Welcome to the Admin Panel',
      });
    } catch (error) {
      next(error);
    }
  }
);
