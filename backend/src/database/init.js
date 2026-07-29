import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import bcrypt from 'bcryptjs';
import { pool, query } from '../config/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const demoPassword = 'Password123!';

async function upsertDemoUser({ name, email, role, department }) {
  const passwordHash = await bcrypt.hash(demoPassword, 12);

  await query(
    `INSERT INTO users (name, email, password_hash, role, department)
     VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT (email)
     DO UPDATE SET name = EXCLUDED.name, role = EXCLUDED.role, department = EXCLUDED.department, updated_at = NOW()`,
    [name, email, passwordHash, role, department]
  );
}

async function seedCategories() {
  const categories = [
    ['Laptop', 'Portable computers assigned to employees.'],
    ['Desktop', 'Workstations and tower systems.'],
    ['Monitor', 'External displays and conference room screens.'],
    ['Printer', 'Office printing and scanning assets.'],
    ['Mobile', 'Phones and tablets.'],
    ['Keyboard', 'Input devices.'],
    ['Mouse', 'Pointing devices.'],
    ['Projector', 'Presentation and room equipment.'],
    ['Vehicle', 'Company vehicles.'],
    ['Furniture', 'Office furniture.'],
    ['Networking Devices', 'Routers, switches, access points, and firewalls.'],
    ['Other', 'Assets that do not fit a standard category.']
  ];

  for (const [categoryName, description] of categories) {
    await query(
      `INSERT INTO categories (category_name, description)
       VALUES ($1, $2)
       ON CONFLICT (category_name)
       DO UPDATE SET description = EXCLUDED.description, updated_at = NOW()`,
      [categoryName, description]
    );
  }
}

async function seedAssets() {
  const laptopCategory = await query('SELECT id FROM categories WHERE category_name = $1', ['Laptop']);
  const monitorCategory = await query('SELECT id FROM categories WHERE category_name = $1', ['Monitor']);
  const networkingCategory = await query('SELECT id FROM categories WHERE category_name = $1', ['Networking Devices']);

  const assets = [
    {
      asset_code: 'AO-2026-0001',
      asset_name: 'Latitude 7450 Executive Laptop',
      category_id: laptopCategory.rows[0]?.id,
      brand: 'Dell',
      model: 'Latitude 7450',
      serial_number: 'DL-7450-AO-1001',
      purchase_date: '2026-01-15',
      purchase_cost: 1420,
      vendor: 'Dell Business',
      warranty_start: '2026-01-15',
      warranty_end: '2029-01-14',
      status: 'Available',
      location: 'New York HQ',
      department: 'IT',
      description: 'Standard executive laptop build with extended warranty.',
      qr_code_value: 'AO-2026-0001'
    },
    {
      asset_code: 'AO-2026-0002',
      asset_name: 'UltraSharp 27 Monitor',
      category_id: monitorCategory.rows[0]?.id,
      brand: 'Dell',
      model: 'U2724D',
      serial_number: 'MON-U2724D-4217',
      purchase_date: '2025-12-12',
      purchase_cost: 380,
      vendor: 'CDW',
      warranty_start: '2025-12-12',
      warranty_end: '2026-08-20',
      status: 'Available',
      location: 'New York HQ',
      department: 'Finance',
      description: 'Finance analyst desk display.',
      qr_code_value: 'AO-2026-0002'
    },
    {
      asset_code: 'AO-2026-0003',
      asset_name: 'Core Switch - Floor 4',
      category_id: networkingCategory.rows[0]?.id,
      brand: 'Cisco',
      model: 'Catalyst 9300',
      serial_number: 'CSC9300-F4-9001',
      purchase_date: '2024-05-03',
      purchase_cost: 6400,
      vendor: 'Insight',
      warranty_start: '2024-05-03',
      warranty_end: '2027-05-02',
      status: 'Under Maintenance',
      location: 'New York HQ',
      department: 'Infrastructure',
      description: 'Primary network switch for floor four.',
      qr_code_value: 'AO-2026-0003'
    }
  ];

  for (const asset of assets) {
    await query(
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
      ON CONFLICT (serial_number)
      DO UPDATE SET
        asset_name = EXCLUDED.asset_name,
        status = EXCLUDED.status,
        location = EXCLUDED.location,
        department = EXCLUDED.department,
        updated_at = NOW()`,
      [
        asset.asset_code,
        asset.asset_name,
        asset.category_id,
        asset.brand,
        asset.model,
        asset.serial_number,
        asset.purchase_date,
        asset.purchase_cost,
        asset.vendor,
        asset.warranty_start,
        asset.warranty_end,
        asset.status,
        asset.location,
        asset.department,
        asset.description,
        asset.qr_code_value
      ]
    );
  }
}

async function main() {
  const schemaPath = path.join(__dirname, 'schema.sql');
  const schema = await fs.readFile(schemaPath, 'utf8');

  await query(schema);
  await seedCategories();
  await upsertDemoUser({
    name: 'Avery Stone',
    email: 'admin@assetorbit.local',
    role: 'Admin',
    department: 'IT'
  });
  await upsertDemoUser({
    name: 'Maya Kapoor',
    email: 'manager@assetorbit.local',
    role: 'Asset Manager',
    department: 'IT'
  });
  await upsertDemoUser({
    name: 'Jordan Lee',
    email: 'employee@assetorbit.local',
    role: 'Employee',
    department: 'Finance'
  });
  await seedAssets();

  console.log('AssetOrbit database initialized.');
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });
