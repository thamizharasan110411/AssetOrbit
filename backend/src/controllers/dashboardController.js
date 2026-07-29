import { query } from '../config/db.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { listRecentActivity } from '../models/activityLogModel.js';

function assetScope(user) {
  if (user.role !== 'Employee') {
    return {
      where: 'a.is_deleted = FALSE',
      params: []
    };
  }

  return {
    where: `a.is_deleted = FALSE
      AND EXISTS (
        SELECT 1
        FROM asset_assignments scoped
        WHERE scoped.asset_id = a.id
          AND scoped.employee_id = $1
          AND scoped.returned_date IS NULL
      )`,
    params: [user.id]
  };
}

export const getDashboard = asyncHandler(async (req, res) => {
  const scope = assetScope(req.user);
  const activityUserId = req.user.role === 'Employee' ? req.user.id : null;

  const metricsResult = await query(
    `SELECT
        COUNT(*)::int AS total_assets,
        COUNT(*) FILTER (WHERE a.status = 'Available')::int AS available_assets,
        COUNT(*) FILTER (WHERE a.status = 'Assigned')::int AS assigned_assets,
        COUNT(*) FILTER (WHERE a.status = 'Under Maintenance')::int AS maintenance_assets,
        COUNT(*) FILTER (WHERE a.status = 'Retired')::int AS retired_assets,
        COUNT(*) FILTER (
          WHERE a.warranty_end BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '30 days'
        )::int AS warranty_expiring_soon,
        COUNT(*) FILTER (WHERE a.warranty_end < CURRENT_DATE)::int AS warranty_expired,
        COUNT(*) FILTER (WHERE a.warranty_end IS NULL)::int AS assets_without_warranty,
        COALESCE(SUM(a.purchase_cost), 0)::numeric(12, 2) AS total_asset_value
      FROM assets a
      WHERE ${scope.where}`,
    scope.params
  );

  const dueServiceResult = await query(
    `SELECT COUNT(DISTINCT m.asset_id)::int AS due_for_service
     FROM maintenance m
     JOIN assets a ON a.id = m.asset_id
     WHERE ${scope.where}
       AND m.next_service_date IS NOT NULL
       AND m.next_service_date <= CURRENT_DATE + INTERVAL '14 days'
       AND m.status <> 'Completed'`,
    scope.params
  );

  const statusBreakdownResult = await query(
    `SELECT a.status, COUNT(*)::int AS count
     FROM assets a
     WHERE ${scope.where}
     GROUP BY a.status
     ORDER BY a.status`,
    scope.params
  );

  const departmentBreakdownResult = await query(
    `SELECT COALESCE(a.department, 'Unassigned') AS department, COUNT(*)::int AS count
     FROM assets a
     WHERE ${scope.where}
     GROUP BY COALESCE(a.department, 'Unassigned')
     ORDER BY count DESC
     LIMIT 8`,
    scope.params
  );

  const assignmentParams = req.user.role === 'Employee' ? [req.user.id] : [];
  const assignmentWhere = req.user.role === 'Employee' ? 'WHERE aa.employee_id = $1' : '';
  const recentAssignmentsResult = await query(
    `SELECT
        aa.id,
        aa.assigned_date,
        aa.expected_return_date,
        aa.returned_date,
        a.asset_code,
        a.asset_name,
        e.name AS employee_name,
        b.name AS assigned_by_name
      FROM asset_assignments aa
      JOIN assets a ON a.id = aa.asset_id
      JOIN users e ON e.id = aa.employee_id
      JOIN users b ON b.id = aa.assigned_by
      ${assignmentWhere}
      ORDER BY aa.assigned_date DESC, aa.id DESC
      LIMIT 6`,
    assignmentParams
  );

  const recentActivity = await listRecentActivity(8, activityUserId);

  res.json({
    metrics: {
      ...metricsResult.rows[0],
      assets_due_for_service: dueServiceResult.rows[0].due_for_service
    },
    statusBreakdown: statusBreakdownResult.rows,
    departmentBreakdown: departmentBreakdownResult.rows,
    recentActivity,
    recentAssignments: recentAssignmentsResult.rows
  });
});
