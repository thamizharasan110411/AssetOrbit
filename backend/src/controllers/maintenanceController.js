import { transaction } from '../config/db.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { canManageAssets } from '../utils/status.js';
import { employeeHasAsset } from '../models/assignmentModel.js';
import { logActivity } from '../models/activityLogModel.js';
import { getAssetById, hasActiveAssignment, setAssetStatus } from '../models/assetModel.js';
import {
  createMaintenance,
  getMaintenanceById,
  listMaintenance,
  updateMaintenance
} from '../models/maintenanceModel.js';

export const getMaintenance = asyncHandler(async (req, res) => {
  const maintenance = await listMaintenance(req.query, req.user);
  res.json({ data: maintenance });
});

export const postMaintenance = asyncHandler(async (req, res) => {
  const asset = await getAssetById(req.body.asset_id);

  if (!asset) {
    throw new ApiError(404, 'Asset not found.');
  }

  if (!canManageAssets(req.user)) {
    const ownsAsset = await employeeHasAsset(req.body.asset_id, req.user.id);

    if (!ownsAsset) {
      throw new ApiError(403, 'Employees can only report issues for their assigned assets.');
    }
  }

  const maintenance = await transaction(async (client) => {
    const createdMaintenance = await createMaintenance(req.body, client);

    if (createdMaintenance.status !== 'Completed') {
      await setAssetStatus(createdMaintenance.asset_id, 'Under Maintenance', client);
    }

    await logActivity(
      {
        userId: req.user.id,
        assetId: createdMaintenance.asset_id,
        action: 'Maintenance Created',
        details: {
          maintenance_id: createdMaintenance.id,
          issue: createdMaintenance.issue,
          status: createdMaintenance.status
        }
      },
      client
    );

    return createdMaintenance;
  });

  res.status(201).json({ maintenance });
});

export const putMaintenance = asyncHandler(async (req, res) => {
  const existing = await getMaintenanceById(req.params.id);

  if (!existing) {
    throw new ApiError(404, 'Maintenance record not found.');
  }

  const maintenance = await transaction(async (client) => {
    const updatedMaintenance = await updateMaintenance(req.params.id, req.body, client);

    if (updatedMaintenance.status === 'Completed') {
      const activeAssignment = await hasActiveAssignment(updatedMaintenance.asset_id, client);
      await setAssetStatus(
        updatedMaintenance.asset_id,
        activeAssignment ? 'Assigned' : 'Available',
        client
      );
    } else {
      await setAssetStatus(updatedMaintenance.asset_id, 'Under Maintenance', client);
    }

    await logActivity(
      {
        userId: req.user.id,
        assetId: updatedMaintenance.asset_id,
        action: 'Maintenance Updated',
        details: {
          maintenance_id: updatedMaintenance.id,
          status: updatedMaintenance.status
        }
      },
      client
    );

    return updatedMaintenance;
  });

  res.json({ maintenance });
});
