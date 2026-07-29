import { body } from 'express-validator';
import { ROLES } from '../utils/status.js';

export const updateProfileValidation = [
  body('name').optional().trim().notEmpty().isLength({ max: 120 }),
  body('department').optional({ nullable: true }).trim().isLength({ max: 120 })
];

export const updateUserValidation = [
  body('name').optional().trim().notEmpty().isLength({ max: 120 }),
  body('email').optional().trim().isEmail().normalizeEmail(),
  body('role').optional().isIn(ROLES),
  body('department').optional({ nullable: true }).trim().isLength({ max: 120 })
];
