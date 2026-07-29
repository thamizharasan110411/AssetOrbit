import { Router } from 'express';
import {
  deleteAsset,
  getAsset,
  getAssets,
  postAsset,
  putAsset
} from '../controllers/assetController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import {
  createAssetValidation,
  updateAssetValidation
} from '../validations/assetValidation.js';

export const assetRoutes = Router();

assetRoutes.use(authenticate);
assetRoutes.get('/', getAssets);
assetRoutes.get('/:id', getAsset);
assetRoutes.post('/', authorize('Admin', 'Asset Manager'), validate(createAssetValidation), postAsset);
assetRoutes.put('/:id', authorize('Admin', 'Asset Manager'), validate(updateAssetValidation), putAsset);
assetRoutes.delete('/:id', authorize('Admin'), deleteAsset);
