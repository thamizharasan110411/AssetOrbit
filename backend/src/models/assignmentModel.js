import { query } from '../config/db.js';

function dbRunner(client) {
  return client || { query };
}

export async function listAssignments(filters = {}, user = null) {
  const params = [];
  const where = [];
  const addParam = (value) => {
    params.push(value);
    return `$${params.length}`;
  };

  if (user?.role === 'Employee') {
    where.push(`aa.employee_id = ${addParam(user.id)}`);
  }

  if (filters.status === 'Active') {
    where.push('aa.returned_date IS NULL');
  }

  if (filters.status === 'Returned') {
    where.push('aa.returned_date IS NOT NULL');
  }

  if (filters.employee_id) {
    where.push(`aa.employee_id = ${addParam(filters.employee_id)}`);
  }

  if (filters.asset_id) {
    where.push(`aa.asset_id = ${addParam(filters.asset_id)}`);
  }

  if (filters.search) {
    const searchParam = addParam(`%${filters.search}%`);
    where.push(
      `(a.asset_name ILIKE ${searchParam}
        OR a.asset_code ILIKE ${searchParam}
        OR e.name ILIKE ${searchParam}
        OR e.email ILIKE ${searchParam})`
    );
  }

  const { rows } = await query(
    `SELECT
        aa.*,
        a.asset_code,
        a.asset_name,
        a.status AS asset_status,
        e.name AS employee_name,
        e.email AS employee_email,
        b.name AS assigned_by_name
      FROM asset_assignments aa
      JOIN assets a ON a.id = aa.asset_id
      JOIN users e ON e.id = aa.employee_id
      JOIN users b ON b.id = aa.assigned_by
      ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
      ORDER BY aa.assigned_date DESC, aa.id DESC`,
    params
  );

  return rows;
}

export async function getAssignmentById(id, client = null) {
  const { rows } = await dbRunner(client).query(
    `SELECT
        aa.*,
        a.status AS asset_status,
        a.asset_name,
        e.name AS employee_name
      FROM asset_assignments aa
      JOIN assets a ON a.id = aa.asset_id
      JOIN users e ON e.id = aa.employee_id
      WHERE aa.id = $1`,
    [id]
  );

  return rows[0] || null;
}

export async function createAssignment(data, client = null) {
  const { rows } = await dbRunner(client).query(
    `INSERT INTO asset_assignments (
      asset_id,
      employee_id,
      assigned_by,
      assigned_date,
      expected_return_date,
      asset_condition,
      remarks
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING *`,
    [
      data.asset_id,
      data.employee_id,
      data.assigned_by,
      data.assigned_date || new Date().toISOString().slice(0, 10),
      data.expected_return_date || null,
      data.asset_condition || null,
      data.remarks || null
    ]
  );

  return rows[0];
}

export async function returnAssignment(id, data, client = null) {
  const { rows } = await dbRunner(client).query(
    `UPDATE asset_assignments
     SET returned_date = $1,
         asset_condition = $2,
         remarks = $3,
         updated_at = NOW()
     WHERE id = $4 AND returned_date IS NULL
     RETURNING *`,
    [
      data.returned_date || new Date().toISOString().slice(0, 10),
      data.asset_condition || null,
      data.remarks || null,
      id
    ]
  );

  return rows[0] || null;
}

export async function employeeHasAsset(assetId, employeeId) {
  const { rows } = await query(
    `SELECT id
     FROM asset_assignments
     WHERE asset_id = $1
       AND employee_id = $2
       AND returned_date IS NULL
     LIMIT 1`,
    [assetId, employeeId]
  );

  return Boolean(rows[0]);
}
