# AssetOrbit

AssetOrbit is a full-stack Enterprise Asset Management System for tracking company assets from procurement through assignment, maintenance, return, warranty monitoring, reporting, and retirement.

## Stack

- Frontend: React, React Router, Bootstrap, CSS
- Backend: Node.js, Express
- Database: PostgreSQL
- Auth: JWT with bcrypt-compatible password hashing

## Quick Start

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create a PostgreSQL database and copy the environment files:

   ```bash
   cp backend/.env.example backend/.env
   cp frontend/.env.example frontend/.env
   ```

3. Update `backend/.env` with your `DATABASE_URL`.

4. Initialize schema and demo data:

   ```bash
   npm run db:init
   ```

5. Start both apps:

   ```bash
   npm run dev
   ```

Default demo users created by `db:init`:

- Admin: `admin@assetorbit.local` / `Password123!`
- Asset Manager: `manager@assetorbit.local` / `Password123!`
- Employee: `employee@assetorbit.local` / `Password123!`

## API

The API is available under `/api` and also exposes the requested route groups without the `/api` prefix, for example `/api/assets` and `/assets`.

## Project Layout

```text
backend/
  src/
    controllers/
    database/
    middleware/
    models/
    routes/
    services/
    utils/
    validations/
frontend/
  src/
    components/
    context/
    hooks/
    layouts/
    pages/
    services/
    utils/
```
