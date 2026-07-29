import { body } from 'express-validator';

export const createAssignmentValidation = [
  body('asset_id').isInt({ min: 1 }).withMessage('Asset is required.'),
  body('employee_id').isInt({ min: 1 }).withMessage('Employee is required.'),
  body('assigned_date').optional({ nullable: true, checkFalsy: true }).isISO8601().toDate(),
  body('expected_return_date').optional({ nullable: true, checkFalsy: true }).isISO8601().toDate(),
  body('asset_condition').optional({ nullable: true }).trim().isLength({ max: 120 }),
  body('remarks').optional({ nullable: true }).trim()
];

export const returnAssignmentValidation = [
  body('returned_date').optional({ nullable: true, checkFalsy: true }).isISO8601().toDate(),
  body('asset_condition').trim().notEmpty().withMessage('Returned condition is required.').isLength({ max: 120 }),
  body('remarks').optional({ nullable: true }).trim()
];
