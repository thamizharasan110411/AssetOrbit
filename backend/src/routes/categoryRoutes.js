import { Router } from 'express';
import {
  getCategories,
  postCategory,
  putCategory,
  removeCategory
} from '../controllers/categoryController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { categoryValidation } from '../validations/categoryValidation.js';

export const categoryRoutes = Router();

categoryRoutes.use(authenticate);
categoryRoutes.get('/', getCategories);
categoryRoutes.post('/', authorize('Admin'), validate(categoryValidation), postCategory);
categoryRoutes.put('/:id', authorize('Admin'), validate(categoryValidation), putCategory);
categoryRoutes.delete('/:id', authorize('Admin'), removeCategory);
