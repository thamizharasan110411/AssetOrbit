import { query } from '../config/db.js';

function dbRunner(client) {
  return client || { query };
}

async function generateAssetCode(client) {
  const year = new Date().getFullYear();
  const { rows } = await client.query(
    `SELECT asset_code
     FROM assets
     WHERE asset_code LIKE $1
     ORDER BY id DESC
     LIMIT 1`,
    [`AO-${year}-%`]
  );

  const lastSequence = rows[0]?.asset_code?.split('-').pop();
  const nextSequence = Number(lastSequence || 0) + 1;

  return `AO-${year}-${String(nextSequence).padStart(4, '0')}`;
}

export async function listAssets(filters = {}, user = null) {
  const page = Math.max(Number(filters.page || 1), 1);
  const limit = Math.min(Math.max(Number(filters.limit || 10), 1), 100);
  const offset = (page - 1) * limit;
  const params = [];
  const where = ['a.is_deleted = FALSE'];

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
        WHERE scoped.asset_id = a.id
          AND scoped.employee_id = ${employeeParam}
          AND scoped.returned_date IS NULL
      )`
    );
  }

  if (filters.search) {
    const searchParam = addParam(`%${filters.search}%`);
    where.push(
      `(a.asset_name ILIKE ${searchParam}
        OR a.asset_code ILIKE ${searchParam}
        OR a.serial_number ILIKE ${searchParam}
        OR a.vendor ILIKE ${searchParam}
        OR u.name ILIKE ${searchParam})`
    );
  }

  if (filters.category_id) {
    where.push(`a.category_id = ${addParam(filters.category_id)}`);
  }

  if (filters.status) {
    where.push(`a.status = ${addParam(filters.status)}`);
  }

  if (filters.department) {
    where.push(`a.department = ${addParam(filters.department)}`);
  }

  if (filters.location) {
    where.push(`a.location = ${addParam(filters.location)}`);
  }

  if (filters.purchase_from) {
    where.push(`a.purchase_date >= ${addParam(filters.purchase_from)}`);
  }

  if (filters.purchase_to) {
    where.push(`a.purchase_date <= ${addParam(filters.purchase_to)}`);
  }

  if (filters.warranty_status === 'expiring') {
    where.push(`a.warranty_end BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '30 days'`);
  }

  if (filters.warranty_status === 'expired') {
    where.push(`a.warranty_end < CURRENT_DATE`);
  }

  if (filters.warranty_status === 'none') {
    where.push(`a.warranty_end IS NULL`);
  }

  if (filters.warranty_status === 'active') {
    where.push(`a.warranty_end >= CURRENT_DATE + INTERVAL '31 days'`);
  }

  const sortMap = {
    purchase_date: 'a.purchase_date',
    warranty_end: 'a.warranty_end',
    purchase_cost: 'a.purchase_cost',
    created_at: 'a.created_at',
    asset_name: 'a.asset_name'
  };
  const sortColumn = sortMap[filters.sort_by] || 'a.created_at';
  const sortDirection = filters.sort_direction === 'asc' ? 'ASC' : 'DESC';

  const joins = `
    LEFT JOIN categories c ON c.id = a.category_id
    LEFT JOIN asset_assignments aa ON aa.asset_id = a.id AND aa.returned_date IS NULL
    LEFT JOIN users u ON u.id = aa.employee_id
  `;

  const countResult = await query(
    `SELECT COUNT(DISTINCT a.id)::int AS total
     FROM assets a
     ${joins}
     WHERE ${where.join(' AND ')}`,
    params
  );

  const dataParams = [...params, limit, offset];
  const { rows } = await query(
    `SELECT
        a.*,
        c.category_name,
        u.name AS assigned_employee,
        aa.id AS active_assignment_id
      FROM assets a
      ${joins}
      WHERE ${where.join(' AND ')}
      ORDER BY ${sortColumn} ${sortDirection} NULLS LAST
      LIMIT $${dataParams.length - 1}
      OFFSET $${dataParams.length}`,
    dataParams
  );

  return {
    data: rows,
    pagination: {
      page,
      limit,
      total: countResult.rows[0].total,
      totalPages: Math.ceil(countResult.rows[0].total / limit) || 1
    }
  };
}

export async function getAssetById(id, user = null) {
  const params = [id];
  const where = ['a.id = $1', 'a.is_deleted = FALSE'];

  if (user?.role === 'Employee') {
    params.push(user.id);
    where.push(
      `EXISTS (
        SELECT 1
        FROM asset_assignments scoped
        WHERE scoped.asset_id = a.id
          AND scoped.employee_id = $2
          AND scoped.returned_date IS NULL
      )`
    );
  }

  const { rows } = await query(
    `SELECT
        a.*,
        c.category_name,
        u.name AS assigned_employee,
        aa.id AS active_assignment_id
      FROM assets a
      LEFT JOIN categories c ON c.id = a.category_id
      LEFT JOIN asset_assignments aa ON aa.asset_id = a.id AND aa.returned_date IS NULL
      LEFT JOIN users u ON u.id = aa.employee_id
      WHERE ${where.join(' AND ')}`,
    params
  );

  return rows[0] || null;
}

export async function createAsset(data, client = null) {
  const runner = dbRunner(client);
  const assetCode = await generateAssetCode(runner);
  const qrCodeValue = data.qr_code_value || assetCode;

  const { rows } = await runner.query(
    `INSERT INTO assets (
      asset_code, asset_name, category_id, brand, model, serial_number,
      purchase_date, purchase_cost, vendor, warranty_start, warranty_end,
      status, location, department, description, qr_code_value
    )
    VALUES (
      $1, $2, $3, $4, $5, $6,
      $7, $8, $9, $10, $11,
      $12, $13, $14, $15, $16
    )
    RETURNING *`,
    [
      assetCode,
      data.asset_name,
      data.category_id || null,
      data.brand || null,
      data.model || null,
      data.serial_number,
      data.purchase_date || null,
      data.purchase_cost ?? 0,
      data.vendor || null,
      data.warranty_start || null,
      data.warranty_end || null,
      data.status || 'Available',
      data.location || null,
      data.department || null,
      data.description || null,
      qrCodeValue
    ]
  );

  return rows[0];
}

export async function updateAsset(id, data, client = null) {
  const allowedFields = [
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

  const entries = Object.entries(data).filter(([field, value]) => {
    return allowedFields.includes(field) && value !== undefined;
  });

  if (!entries.length) {
    return getAssetById(id);
  }

  const values = entries.map(([, value]) => value);
  const sets = entries.map(([field], index) => `${field} = $${index + 1}`);
  values.push(id);

  const { rows } = await dbRunner(client).query(
    `UPDATE assets
     SET ${sets.join(', ')}, updated_at = NOW()
     WHERE id = $${values.length} AND is_deleted = FALSE
     RETURNING *`,
    values
  );

  return rows[0] || null;
}

export async function setAssetStatus(id, status, client = null) {
  const { rows } = await dbRunner(client).query(
    `UPDATE assets
     SET status = $1, updated_at = NOW()
     WHERE id = $2 AND is_deleted = FALSE
     RETURNING *`,
    [status, id]
  );

  return rows[0] || null;
}

export async function softDeleteAsset(id, client = null) {
  const { rows } = await dbRunner(client).query(
    `UPDATE assets
     SET is_deleted = TRUE, status = 'Retired', updated_at = NOW()
     WHERE id = $1 AND is_deleted = FALSE
     RETURNING *`,
    [id]
  );

  return rows[0] || null;
}

export async function hasActiveAssignment(assetId, client = null) {
  const { rows } = await dbRunner(client).query(
    `SELECT id
     FROM asset_assignments
     WHERE asset_id = $1 AND returned_date IS NULL
     LIMIT 1`,
    [assetId]
  );

  return rows[0] || null;
}

export async function getAssetHistory(assetId) {
  const { rows } = await query(
    `SELECT
        al.id,
        al.action,
        al.details,
        al.timestamp,
        u.name AS user_name
      FROM activity_logs al
      LEFT JOIN users u ON u.id = al.user_id
      WHERE al.asset_id = $1
      ORDER BY al.timestamp DESC`,
    [assetId]
  );

  return rows;
}

export async function getAssetAssignments(assetId) {
  const { rows } = await query(
    `SELECT
        aa.*,
        e.name AS employee_name,
        b.name AS assigned_by_name
      FROM asset_assignments aa
      JOIN users e ON e.id = aa.employee_id
      JOIN users b ON b.id = aa.assigned_by
      WHERE aa.asset_id = $1
      ORDER BY aa.assigned_date DESC, aa.id DESC`,
    [assetId]
  );

  return rows;
}

export async function getAssetMaintenance(assetId) {
  const { rows } = await query(
    `SELECT *
     FROM maintenance
     WHERE asset_id = $1
     ORDER BY maintenance_date DESC, id DESC`,
    [assetId]
  );

  return rows;
}
