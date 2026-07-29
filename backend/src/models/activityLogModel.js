import { query } from '../config/db.js';

function dbRunner(client) {
  return client || { query };
}

export async function logActivity({ userId = null, assetId = null, action, details = null }, client) {
  await dbRunner(client).query(
    `INSERT INTO activity_logs (user_id, asset_id, action, details)
     VALUES ($1, $2, $3, $4)`,
    [userId, assetId, action, details]
  );
}

export async function listRecentActivity(limit = 10, userId = null) {
  const params = [limit];
  const employeeScope = userId
    ? `WHERE EXISTS (
        SELECT 1
        FROM asset_assignments scoped
        WHERE scoped.asset_id = al.asset_id
          AND scoped.employee_id = $2
          AND scoped.returned_date IS NULL
      )`
    : '';

  if (userId) {
    params.push(userId);
  }

  const { rows } = await query(
    `SELECT
        al.id,
        al.action,
        al.details,
        al.timestamp,
        u.name AS user_name,
        a.asset_code,
        a.asset_name
      FROM activity_logs al
      LEFT JOIN users u ON u.id = al.user_id
      LEFT JOIN assets a ON a.id = al.asset_id
      ${employeeScope}
      ORDER BY al.timestamp DESC
      LIMIT $1`,
    params
  );

  return rows;
}
