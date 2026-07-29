import { query } from '../config/db.js';

const publicFields = 'id, name, email, role, department, created_at, updated_at';

function dbRunner(client) {
  return client || { query };
}

export async function countUsers() {
  const { rows } = await query('SELECT COUNT(*)::int AS count FROM users');
  return rows[0].count;
}

export async function createUser({ name, email, passwordHash, role, department }, client = null) {
  const { rows } = await dbRunner(client).query(
    `INSERT INTO users (name, email, password_hash, role, department)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING ${publicFields}`,
    [name, email, passwordHash, role, department || null]
  );

  return rows[0];
}

export async function findUserByEmail(email, includePassword = false) {
  const fields = includePassword ? `${publicFields}, password_hash` : publicFields;
  const { rows } = await query(`SELECT ${fields} FROM users WHERE email = $1`, [email]);
  return rows[0] || null;
}

export async function findUserById(id) {
  const { rows } = await query(`SELECT ${publicFields} FROM users WHERE id = $1`, [id]);
  return rows[0] || null;
}

export async function listUsers({ role, department, search } = {}) {
  const params = [];
  const where = [];

  if (role) {
    params.push(role);
    where.push(`role = $${params.length}`);
  }

  if (department) {
    params.push(department);
    where.push(`department = $${params.length}`);
  }

  if (search) {
    params.push(`%${search}%`);
    where.push(`(name ILIKE $${params.length} OR email ILIKE $${params.length})`);
  }

  const { rows } = await query(
    `SELECT ${publicFields}
     FROM users
     ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
     ORDER BY name ASC`,
    params
  );

  return rows;
}

export async function updateUser(id, data) {
  const allowedFields = ['name', 'email', 'role', 'department'];
  const entries = Object.entries(data).filter(([field, value]) => {
    return allowedFields.includes(field) && value !== undefined;
  });

  if (!entries.length) {
    return findUserById(id);
  }

  const sets = entries.map(([field], index) => `${field} = $${index + 1}`);
  const values = entries.map(([, value]) => value);
  values.push(id);

  const { rows } = await query(
    `UPDATE users
     SET ${sets.join(', ')}, updated_at = NOW()
     WHERE id = $${values.length}
     RETURNING ${publicFields}`,
    values
  );

  return rows[0] || null;
}

export async function updatePassword(id, passwordHash) {
  await query(
    `UPDATE users
     SET password_hash = $1, updated_at = NOW()
     WHERE id = $2`,
    [passwordHash, id]
  );
}
