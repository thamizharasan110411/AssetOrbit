import { body } from 'express-validator';
import { ROLES } from '../utils/status.js';

export const registerValidation = [
  body('name').trim().notEmpty().withMessage('Name is required.').isLength({ max: 120 }),
  body('email').trim().isEmail().withMessage('A valid email is required.').normalizeEmail(),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters.'),
  body('role').optional().isIn(ROLES).withMessage('Role is invalid.'),
  body('department').optional({ nullable: true }).trim().isLength({ max: 120 })
];

export const loginValidation = [
  body('email').trim().isEmail().withMessage('A valid email is required.').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required.')
];

export const changePasswordValidation = [
  body('currentPassword').notEmpty().withMessage('Current password is required.'),
  body('newPassword')
    .isLength({ min: 8 })
    .withMessage('New password must be at least 8 characters.')
];
