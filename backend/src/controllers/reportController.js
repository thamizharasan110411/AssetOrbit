import { query } from '../config/db.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getAssetReport = asyncHandler(async (_req, res) => {
  const [summary, byCategory, byDepartment, recentlyPurchased, depreciation] = await Promise.all([
    query(
      `SELECT
          COUNT(*)::int AS total_assets,
          COALESCE(SUM(purchase_cost), 0)::numeric(12, 2) AS total_value,
          COUNT(*) FILTER (WHERE status = 'Assigned')::int AS assigned_assets,
          COUNT(*) FILTER (WHERE status = 'Available')::int AS available_assets,
          COUNT(*) FILTER (WHERE status = 'Under Maintenance')::int AS maintenance_assets,
          COUNT(*) FILTER (WHERE status = 'Retired')::int AS retired_assets
        FROM assets
        WHERE is_deleted = FALSE`
    ),
    query(
      `SELECT COALESCE(c.category_name, 'Uncategorized') AS label,
              COUNT(*)::int AS count,
              COALESCE(SUM(a.purchase_cost), 0)::numeric(12, 2) AS value
       FROM assets a
       LEFT JOIN categories c ON c.id = a.category_id
       WHERE a.is_deleted = FALSE
       GROUP BY COALESCE(c.category_name, 'Uncategorized')
       ORDER BY count DESC`
    ),
    query(
      `SELECT COALESCE(department, 'Unassigned') AS label,
              COUNT(*)::int AS count,
              COALESCE(SUM(purchase_cost), 0)::numeric(12, 2) AS value
       FROM assets
       WHERE is_deleted = FALSE
       GROUP BY COALESCE(department, 'Unassigned')
       ORDER BY count DESC`
    ),
    query(
      `SELECT asset_code, asset_name, purchase_date, purchase_cost, vendor
       FROM assets
       WHERE is_deleted = FALSE
       ORDER BY purchase_date DESC NULLS LAST
       LIMIT 10`
    ),
    query(
      `SELECT
          asset_code,
          asset_name,
          purchase_date,
          purchase_cost,
          CASE
            WHEN purchase_date IS NULL THEN purchase_cost
            ELSE GREATEST(
              0,
              purchase_cost - (
                purchase_cost * LEAST(EXTRACT(YEAR FROM AGE(CURRENT_DATE, purchase_date)) / 5, 1)
              )
            )::numeric(12, 2)
          END AS estimated_book_value
       FROM assets
       WHERE is_deleted = FALSE
       ORDER BY purchase_cost DESC
       LIMIT 10`
    )
  ]);

  res.json({
    summary: summary.rows[0],
    byCategory: byCategory.rows,
    byDepartment: byDepartment.rows,
    recentlyPurchased: recentlyPurchased.rows,
    depreciation: depreciation.rows
  });
});

export const getMaintenanceReport = asyncHandler(async (_req, res) => {
  const [summary, byStatus, byVendor, byMonth] = await Promise.all([
    query(
      `SELECT
          COUNT(*)::int AS total_records,
          COALESCE(SUM(maintenance_cost), 0)::numeric(12, 2) AS total_cost,
          COALESCE(AVG(maintenance_cost), 0)::numeric(12, 2) AS average_cost
       FROM maintenance`
    ),
    query(
      `SELECT status AS label, COUNT(*)::int AS count, COALESCE(SUM(maintenance_cost), 0)::numeric(12, 2) AS cost
       FROM maintenance
       GROUP BY status
       ORDER BY count DESC`
    ),
    query(
      `SELECT COALESCE(vendor, 'Internal') AS label, COUNT(*)::int AS count, COALESCE(SUM(maintenance_cost), 0)::numeric(12, 2) AS cost
       FROM maintenance
       GROUP BY COALESCE(vendor, 'Internal')
       ORDER BY cost DESC
       LIMIT 10`
    ),
    query(
      `SELECT TO_CHAR(DATE_TRUNC('month', maintenance_date), 'YYYY-MM') AS month,
              COUNT(*)::int AS count,
              COALESCE(SUM(maintenance_cost), 0)::numeric(12, 2) AS cost
       FROM maintenance
       GROUP BY DATE_TRUNC('month', maintenance_date)
       ORDER BY month DESC
       LIMIT 12`
    )
  ]);

  res.json({
    summary: summary.rows[0],
    byStatus: byStatus.rows,
    byVendor: byVendor.rows,
    byMonth: byMonth.rows
  });
});

export const getWarrantyReport = asyncHandler(async (_req, res) => {
  const [summary, expiringSoon, expired, withoutWarranty] = await Promise.all([
    query(
      `SELECT
          COUNT(*) FILTER (WHERE warranty_end BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '30 days')::int AS expiring_soon,
          COUNT(*) FILTER (WHERE warranty_end < CURRENT_DATE)::int AS expired,
          COUNT(*) FILTER (WHERE warranty_end IS NULL)::int AS without_warranty,
          COUNT(*) FILTER (WHERE warranty_end >= CURRENT_DATE + INTERVAL '31 days')::int AS active
       FROM assets
       WHERE is_deleted = FALSE`
    ),
    query(
      `SELECT asset_code, asset_name, warranty_end, vendor
       FROM assets
       WHERE is_deleted = FALSE
         AND warranty_end BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '30 days'
       ORDER BY warranty_end ASC`
    ),
    query(
      `SELECT asset_code, asset_name, warranty_end, vendor
       FROM assets
       WHERE is_deleted = FALSE
         AND warranty_end < CURRENT_DATE
       ORDER BY warranty_end ASC`
    ),
    query(
      `SELECT asset_code, asset_name, vendor
       FROM assets
       WHERE is_deleted = FALSE
         AND warranty_end IS NULL
       ORDER BY asset_name ASC`
    )
  ]);

  res.json({
    summary: summary.rows[0],
    expiringSoon: expiringSoon.rows,
    expired: expired.rows,
    withoutWarranty: withoutWarranty.rows
  });
});
