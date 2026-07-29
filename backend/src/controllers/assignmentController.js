import { transaction } from '../config/db.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { createAssignment, getAssignmentById, listAssignments, returnAssignment } from '../models/assignmentModel.js';
import { logActivity } from '../models/activityLogModel.js';
import { setAssetStatus } from '../models/assetModel.js';

export const getAssignments = asyncHandler(async (req, res) => {
  const assignments = await listAssignments(req.query, req.user);
  res.json({ data: assignments });
});

export const postAssignment = asyncHandler(async (req, res) => {
  const assignment = await transaction(async (client) => {
    const assetResult = await client.query(
      `SELECT *
       FROM assets
       WHERE id = $1 AND is_deleted = FALSE
       FOR UPDATE`,
      [req.body.asset_id]
    );
    const asset = assetResult.rows[0];

    if (!asset) {
      throw new ApiError(404, 'Asset not found.');
    }

    if (asset.status !== 'Available') {
      throw new ApiError(409, 'Only available assets can be assigned.');
    }

    const employeeResult = await client.query(
      'SELECT id, role FROM users WHERE id = $1',
      [req.body.employee_id]
    );
    const employee = employeeResult.rows[0];

    if (!employee || employee.role !== 'Employee') {
      throw new ApiError(400, 'Assets can only be assigned to employee users.');
    }

    const createdAssignment = await createAssignment(
      {
        ...req.body,
        assigned_by: req.user.id
      },
      client
    );
    await setAssetStatus(asset.id, 'Assigned', client);
    await logActivity(
      {
        userId: req.user.id,
        assetId: asset.id,
        action: 'Asset Assigned',
        details: {
          assignment_id: createdAssignment.id,
          employee_id: createdAssignment.employee_id
        }
      },
      client
    );

    return createdAssignment;
  });

  res.status(201).json({ assignment });
});

export const returnAsset = asyncHandler(async (req, res) => {
  const assignment = await transaction(async (client) => {
    const existingAssignment = await getAssignmentById(req.params.id, client);

    if (!existingAssignment) {
      throw new ApiError(404, 'Assignment not found.');
    }

    if (existingAssignment.returned_date) {
      throw new ApiError(409, 'This assignment has already been returned.');
    }

    const returnedAssignment = await returnAssignment(req.params.id, req.body, client);
    await setAssetStatus(existingAssignment.asset_id, 'Available', client);
    await logActivity(
      {
        userId: req.user.id,
        assetId: existingAssignment.asset_id,
        action: 'Asset Returned',
        details: {
          assignment_id: returnedAssignment.id,
          condition: returnedAssignment.asset_condition
        }
      },
      client
    );

    return returnedAssignment;
  });

  res.json({ assignment });
});
