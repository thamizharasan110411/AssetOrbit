import { Router } from 'express';
import {
  getAssignments,
  postAssignment,
  returnAsset
} from '../controllers/assignmentController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import {
  createAssignmentValidation,
  returnAssignmentValidation
} from '../validations/assignmentValidation.js';

export const assignmentRoutes = Router();

assignmentRoutes.use(authenticate);
assignmentRoutes.get('/', getAssignments);
assignmentRoutes.post(
  '/',
  authorize('Admin', 'Asset Manager'),
  validate(createAssignmentValidation),
  postAssignment
);
assignmentRoutes.put(
  '/:id/return',
  authorize('Admin', 'Asset Manager'),
  validate(returnAssignmentValidation),
  returnAsset
);
