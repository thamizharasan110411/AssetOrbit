import { Router } from 'express';
import { getUsers, patchUser } from '../controllers/userController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { updateUserValidation } from '../validations/userValidation.js';

export const userRoutes = Router();

userRoutes.use(authenticate);
userRoutes.get('/', authorize('Admin', 'Asset Manager'), getUsers);
userRoutes.put('/:id', authorize('Admin'), validate(updateUserValidation), patchUser);
