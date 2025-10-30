import { Router } from 'express';
import { register, login, signup, signin } from '../controllers/authController';
import { validate } from '../middleware/validate';
import { registerSchema, loginSchema } from '../schemas/user.schema';

const router = Router();

// Original endpoints
router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);

// Tier 1 endpoints (aliases)
router.post('/signup', validate(registerSchema), signup);
router.post('/signin', validate(loginSchema), signin);

export default router;
