import pg from 'pg';
import { env } from './env.js';

const { Pool } = pg;

const poolConfig = env.databaseUrl
  ? {
      connectionString: env.databaseUrl,
      ssl: env.databaseUrl.includes('sslmode=require')
        ? { rejectUnauthorized: false }
        : undefined
    }
  : env.db;

export const pool = new Pool(poolConfig);

export function query(text, params) {
  return pool.query(text, params);
}

export async function transaction(work) {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    const result = await work(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}
