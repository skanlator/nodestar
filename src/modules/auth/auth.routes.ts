import { Router } from 'express';
import { AuthController } from './auth.controller.ts';
import { validate } from '../../shared/middlewares/validate.middleware.ts';
import { registerSchema, loginSchema } from './auth.schema.ts';

const router = Router();

router.post('/register', validate(registerSchema), AuthController.register);
router.post('/login', validate(loginSchema), AuthController.login);

export default router;
