import { Router } from 'express';
import {
  changePassword,
  getProfile,
  refreshProfile,
  updateProfile
} from '../controllers/profileController.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { changePasswordValidation } from '../validations/authValidation.js';
import { updateProfileValidation } from '../validations/userValidation.js';

export const profileRoutes = Router();

profileRoutes.use(authenticate);
profileRoutes.get('/', getProfile);
profileRoutes.get('/refresh', refreshProfile);
profileRoutes.put('/', validate(updateProfileValidation), updateProfile);
profileRoutes.put('/password', validate(changePasswordValidation), changePassword);
