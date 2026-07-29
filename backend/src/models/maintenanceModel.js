import { query } from '../config/db.js';

function dbRunner(client) {
  return client || { query };
}

export async function listMaintenance(filters = {}, user = null) {
  const params = [];
  const where = [];
  const addParam = (value) => {
    params.push(value);
    return `$${params.length}`;
  };

  if (user?.role === 'Employee') {
    const employeeParam = addParam(user.id);
    where.push(
      `EXISTS (
        SELECT 1
        FROM asset_assignments scoped
        WHERE scoped.asset_id = m.asset_id
          AND scoped.employee_id = ${employeeParam}
          AND scoped.returned_date IS NULL
      )`
    );
  }

  if (filters.status) {
    where.push(`m.status = ${addParam(filters.status)}`);
  }

  if (filters.asset_id) {
    where.push(`m.asset_id = ${addParam(filters.asset_id)}`);
  }

  if (filters.search) {
    const searchParam = addParam(`%${filters.search}%`);
    where.push(
      `(m.issue ILIKE ${searchParam}
        OR m.vendor ILIKE ${searchParam}
        OR a.asset_name ILIKE ${searchParam}
        OR a.asset_code ILIKE ${searchParam})`
    );
  }

  const { rows } = await query(
    `SELECT
        m.*,
        a.asset_code,
        a.asset_name,
        a.status AS asset_status
      FROM maintenance m
      JOIN assets a ON a.id = m.asset_id
      ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
      ORDER BY m.maintenance_date DESC, m.id DESC`,
    params
  );

  return rows;
}

export async function getMaintenanceById(id, client = null) {
  const { rows } = await dbRunner(client).query(
    `SELECT *
     FROM maintenance
     WHERE id = $1`,
    [id]
  );

  return rows[0] || null;
}

export async function createMaintenance(data, client = null) {
  const { rows } = await dbRunner(client).query(
    `INSERT INTO maintenance (
      asset_id,
      issue,
      description,
      vendor,
      maintenance_date,
      next_service_date,
      maintenance_cost,
      status,
      remarks
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    RETURNING *`,
    [
      data.asset_id,
      data.issue,
      data.description || null,
      data.vendor || null,
      data.maintenance_date || new Date().toISOString().slice(0, 10),
      data.next_service_date || null,
      data.maintenance_cost ?? 0,
      data.status || 'Scheduled',
      data.remarks || null
    ]
  );

  return rows[0];
}

export async function updateMaintenance(id, data, client = null) {
  const allowedFields = [
    'issue',
    'description',
    'vendor',
    'maintenance_date',
    'next_service_date',
    'maintenance_cost',
    'status',
    'remarks'
  ];
  const entries = Object.entries(data).filter(([field, value]) => {
    return allowedFields.includes(field) && value !== undefined;
  });

  if (!entries.length) {
    return getMaintenanceById(id, client);
  }

  const values = entries.map(([, value]) => value);
  const sets = entries.map(([field], index) => `${field} = $${index + 1}`);
  values.push(id);

  const { rows } = await dbRunner(client).query(
    `UPDATE maintenance
     SET ${sets.join(', ')}, updated_at = NOW()
     WHERE id = $${values.length}
     RETURNING *`,
    values
  );

  return rows[0] || null;
}
