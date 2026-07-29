import { body } from 'express-validator';
import { ASSET_STATUSES } from '../utils/status.js';

const optionalDate = (field) =>
  body(field).optional({ nullable: true, checkFalsy: true }).isISO8601().toDate();

export const createAssetValidation = [
  body('asset_name').trim().notEmpty().withMessage('Asset name is required.').isLength({ max: 160 }),
  body('category_id').optional({ nullable: true, checkFalsy: true }).isInt({ min: 1 }),
  body('brand').optional({ nullable: true }).trim().isLength({ max: 120 }),
  body('model').optional({ nullable: true }).trim().isLength({ max: 120 }),
  body('serial_number').trim().notEmpty().withMessage('Serial number is required.').isLength({ max: 160 }),
  optionalDate('purchase_date'),
  body('purchase_cost').optional({ nullable: true, checkFalsy: true }).isFloat({ min: 0 }),
  body('vendor').optional({ nullable: true }).trim().isLength({ max: 160 }),
  optionalDate('warranty_start'),
  optionalDate('warranty_end'),
  body('status').optional().isIn(ASSET_STATUSES),
  body('location').optional({ nullable: true }).trim().isLength({ max: 160 }),
  body('department').optional({ nullable: true }).trim().isLength({ max: 120 }),
  body('description').optional({ nullable: true }).trim(),
  body('qr_code_value').optional({ nullable: true }).trim().isLength({ max: 240 })
];

export const updateAssetValidation = [
  body('asset_name').optional().trim().notEmpty().isLength({ max: 160 }),
  body('category_id').optional({ nullable: true, checkFalsy: true }).isInt({ min: 1 }),
  body('brand').optional({ nullable: true }).trim().isLength({ max: 120 }),
  body('model').optional({ nullable: true }).trim().isLength({ max: 120 }),
  body('serial_number').optional().trim().notEmpty().isLength({ max: 160 }),
  optionalDate('purchase_date'),
  body('purchase_cost').optional({ nullable: true, checkFalsy: true }).isFloat({ min: 0 }),
  body('vendor').optional({ nullable: true }).trim().isLength({ max: 160 }),
  optionalDate('warranty_start'),
  optionalDate('warranty_end'),
  body('status').optional().isIn(ASSET_STATUSES),
  body('location').optional({ nullable: true }).trim().isLength({ max: 160 }),
  body('department').optional({ nullable: true }).trim().isLength({ max: 120 }),
  body('description').optional({ nullable: true }).trim(),
  body('qr_code_value').optional({ nullable: true }).trim().isLength({ max: 240 })
];
