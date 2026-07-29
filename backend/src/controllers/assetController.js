import { transaction } from '../config/db.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { pickDefined } from '../utils/normalize.js';
import {
  createAsset,
  getAssetAssignments,
  getAssetById,
  getAssetHistory,
  getAssetMaintenance,
  hasActiveAssignment,
  listAssets,
  softDeleteAsset,
  updateAsset
} from '../models/assetModel.js';
import { logActivity } from '../models/activityLogModel.js';

const assetFields = [
  'asset_name',
  'category_id',
  'brand',
  'model',
  'serial_number',
  'purchase_date',
  'purchase_cost',
  'vendor',
  'warranty_start',
  'warranty_end',
  'status',
  'location',
  'department',
  'description',
  'qr_code_value'
];

export const getAssets = asyncHandler(async (req, res) => {
  const result = await listAssets(req.query, req.user);
  res.json(result);
});

export const getAsset = asyncHandler(async (req, res) => {
  const asset = await getAssetById(req.params.id, req.user);

  if (!asset) {
    throw new ApiError(404, 'Asset not found.');
  }

  const [history, assignments, maintenance] = await Promise.all([
    getAssetHistory(asset.id),
    getAssetAssignments(asset.id),
    getAssetMaintenance(asset.id)
  ]);

  res.json({
    asset,
    history,
    assignments,
    maintenance
  });
});

export const postAsset = asyncHandler(async (req, res) => {
  const payload = pickDefined(req.body, assetFields);

  const asset = await transaction(async (client) => {
    const createdAsset = await createAsset(payload, client);
    await logActivity(
      {
        userId: req.user.id,
        assetId: createdAsset.id,
        action: 'Asset Created',
        details: { asset_code: createdAsset.asset_code }
      },
      client
    );

    return createdAsset;
  });

  res.status(201).json({ asset });
});

export const putAsset = asyncHandler(async (req, res) => {
  const payload = pickDefined(req.body, assetFields);

  if (payload.status === 'Assigned') {
    throw new ApiError(400, 'Use the assignment workflow to set an asset as Assigned.');
  }

  const existingAsset = await getAssetById(req.params.id);

  if (!existingAsset) {
    throw new ApiError(404, 'Asset not found.');
  }

  if (existingAsset.status === 'Assigned' && payload.status === 'Available') {
    throw new ApiError(400, 'Use the return workflow to make an assigned asset available.');
  }

  const asset = await transaction(async (client) => {
    const updatedAsset = await updateAsset(req.params.id, payload, client);
    await logActivity(
      {
        userId: req.user.id,
        assetId: updatedAsset.id,
        action: 'Asset Updated',
        details: payload
      },
      client
    );

    return updatedAsset;
  });

  res.json({ asset });
});

export const deleteAsset = asyncHandler(async (req, res) => {
  const asset = await getAssetById(req.params.id);

  if (!asset) {
    throw new ApiError(404, 'Asset not found.');
  }

  const activeAssignment = await hasActiveAssignment(asset.id);

  if (activeAssignment) {
    throw new ApiError(409, 'Assigned assets must be returned before they can be retired.');
  }

  await transaction(async (client) => {
    const retiredAsset = await softDeleteAsset(asset.id, client);
    await logActivity(
      {
        userId: req.user.id,
        assetId: retiredAsset.id,
        action: 'Asset Retired',
        details: { asset_code: retiredAsset.asset_code }
      },
      client
    );
  });

  res.json({ message: 'Asset retired successfully.' });
});
