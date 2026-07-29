CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(160) NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role VARCHAR(40) NOT NULL CHECK (role IN ('Admin', 'Asset Manager', 'Employee')),
  department VARCHAR(120),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  category_name VARCHAR(120) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS assets (
  id SERIAL PRIMARY KEY,
  asset_code VARCHAR(40) NOT NULL UNIQUE,
  asset_name VARCHAR(160) NOT NULL,
  category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
  brand VARCHAR(120),
  model VARCHAR(120),
  serial_number VARCHAR(160) NOT NULL UNIQUE,
  purchase_date DATE,
  purchase_cost NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (purchase_cost >= 0),
  vendor VARCHAR(160),
  warranty_start DATE,
  warranty_end DATE,
  status VARCHAR(40) NOT NULL DEFAULT 'Available' CHECK (status IN ('Available', 'Assigned', 'Under Maintenance', 'Retired')),
  location VARCHAR(160),
  department VARCHAR(120),
  description TEXT,
  qr_code_value VARCHAR(240),
  is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS asset_assignments (
  id SERIAL PRIMARY KEY,
  asset_id INTEGER NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
  employee_id INTEGER NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  assigned_by INTEGER NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  assigned_date DATE NOT NULL DEFAULT CURRENT_DATE,
  expected_return_date DATE,
  returned_date DATE,
  asset_condition VARCHAR(120),
  remarks TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_active_assignment_per_asset
  ON asset_assignments(asset_id)
  WHERE returned_date IS NULL;

CREATE TABLE IF NOT EXISTS maintenance (
  id SERIAL PRIMARY KEY,
  asset_id INTEGER NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
  issue VARCHAR(180) NOT NULL,
  description TEXT,
  vendor VARCHAR(160),
  maintenance_date DATE NOT NULL DEFAULT CURRENT_DATE,
  next_service_date DATE,
  maintenance_cost NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (maintenance_cost >= 0),
  status VARCHAR(40) NOT NULL DEFAULT 'Scheduled' CHECK (status IN ('Scheduled', 'In Progress', 'Completed')),
  remarks TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS activity_logs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  asset_id INTEGER REFERENCES assets(id) ON DELETE SET NULL,
  action VARCHAR(120) NOT NULL,
  details JSONB,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_assets_status ON assets(status);
CREATE INDEX IF NOT EXISTS idx_assets_department ON assets(department);
CREATE INDEX IF NOT EXISTS idx_assets_warranty_end ON assets(warranty_end);
CREATE INDEX IF NOT EXISTS idx_assignments_employee ON asset_assignments(employee_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_asset ON maintenance(asset_id);
CREATE INDEX IF NOT EXISTS idx_activity_timestamp ON activity_logs(timestamp DESC);
