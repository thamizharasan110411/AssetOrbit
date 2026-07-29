import { Router } from 'express';
import {
  getAssetReport,
  getMaintenanceReport,
  getWarrantyReport
} from '../controllers/reportController.js';
import { authenticate, authorize } from '../middleware/auth.js';

export const reportRoutes = Router();

reportRoutes.use(authenticate, authorize('Admin', 'Asset Manager'));
reportRoutes.get('/assets', getAssetReport);
reportRoutes.get('/maintenance', getMaintenanceReport);
reportRoutes.get('/warranty', getWarrantyReport);
