import { body } from 'express-validator';
import { MAINTENANCE_STATUSES } from '../utils/status.js';

export const createMaintenanceValidation = [
  body('asset_id').isInt({ min: 1 }).withMessage('Asset is required.'),
  body('issue').trim().notEmpty().withMessage('Issue is required.').isLength({ max: 180 }),
  body('description').optional({ nullable: true }).trim(),
  body('vendor').optional({ nullable: true }).trim().isLength({ max: 160 }),
  body('maintenance_date').optional({ nullable: true, checkFalsy: true }).isISO8601().toDate(),
  body('next_service_date').optional({ nullable: true, checkFalsy: true }).isISO8601().toDate(),
  body('maintenance_cost').optional({ nullable: true, checkFalsy: true }).isFloat({ min: 0 }),
  body('status').optional().isIn(MAINTENANCE_STATUSES),
  body('remarks').optional({ nullable: true }).trim()
];

export const updateMaintenanceValidation = [
  body('issue').optional().trim().notEmpty().isLength({ max: 180 }),
  body('description').optional({ nullable: true }).trim(),
  body('vendor').optional({ nullable: true }).trim().isLength({ max: 160 }),
  body('maintenance_date').optional({ nullable: true, checkFalsy: true }).isISO8601().toDate(),
  body('next_service_date').optional({ nullable: true, checkFalsy: true }).isISO8601().toDate(),
  body('maintenance_cost').optional({ nullable: true, checkFalsy: true }).isFloat({ min: 0 }),
  body('status').optional().isIn(MAINTENANCE_STATUSES),
  body('remarks').optional({ nullable: true }).trim()
];
