import { Router } from 'express';
import { login, logout, register } from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { loginValidation, registerValidation } from '../validations/authValidation.js';

export const authRoutes = Router();

authRoutes.post('/register', validate(registerValidation), register);
authRoutes.post('/login', validate(loginValidation), login);
authRoutes.post('/logout', authenticate, logout);
