import { query } from '../config/db.js';

function dbRunner(client) {
  return client || { query };
}

export async function listCategories() {
  const { rows } = await query(
    `SELECT id, category_name, description, created_at, updated_at
     FROM categories
     ORDER BY category_name ASC`
  );

  return rows;
}

export async function createCategory({ category_name, description }, client = null) {
  const { rows } = await dbRunner(client).query(
    `INSERT INTO categories (category_name, description)
     VALUES ($1, $2)
     RETURNING id, category_name, description, created_at, updated_at`,
    [category_name, description || null]
  );

  return rows[0];
}

export async function updateCategory(id, { category_name, description }) {
  const { rows } = await query(
    `UPDATE categories
     SET category_name = COALESCE($1, category_name),
         description = $2,
         updated_at = NOW()
     WHERE id = $3
     RETURNING id, category_name, description, created_at, updated_at`,
    [category_name, description || null, id]
  );

  return rows[0] || null;
}

export async function deleteCategory(id) {
  const { rowCount } = await query('DELETE FROM categories WHERE id = $1', [id]);
  return rowCount > 0;
}
