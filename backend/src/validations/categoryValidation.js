import { body } from 'express-validator';

export const categoryValidation = [
  body('category_name').trim().notEmpty().withMessage('Category name is required.').isLength({ max: 120 }),
  body('description').optional({ nullable: true }).trim()
];
