import { Router } from 'express';
import {
  getMaintenance,
  postMaintenance,
  putMaintenance
} from '../controllers/maintenanceController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import {
  createMaintenanceValidation,
  updateMaintenanceValidation
} from '../validations/maintenanceValidation.js';

export const maintenanceRoutes = Router();

maintenanceRoutes.use(authenticate);
maintenanceRoutes.get('/', getMaintenance);
maintenanceRoutes.post('/', validate(createMaintenanceValidation), postMaintenance);
maintenanceRoutes.put(
  '/:id',
  authorize('Admin', 'Asset Manager'),
  validate(updateMaintenanceValidation),
  putMaintenance
);
