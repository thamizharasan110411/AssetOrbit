import { useEffect, useState } from 'react';
import { Download, FileSpreadsheet, ShieldCheck, Wrench } from 'lucide-react';
import { ChartBarList } from '../components/ChartBarList.jsx';
import { DataTable } from '../components/DataTable.jsx';
import { MetricCard } from '../components/MetricCard.jsx';
import { PageHeader } from '../components/PageHeader.jsx';
import { RoleGate } from '../components/RoleGate.jsx';
import { reportService } from '../services/reportService.js';
import { exportCsv, formatCurrency, formatDate } from '../utils/format.js';
import { useToast } from '../context/ToastContext.jsx';

export function Reports() {
  const [reports, setReports] = useState(null);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  useEffect(() => {
    async function load() {
      setLoading(true);

      try {
        const [assets, maintenance, warranty] = await Promise.all([
          reportService.assets(),
          reportService.maintenance(),
          reportService.warranty()
        ]);
        setReports({ assets, maintenance, warranty });
      } catch (error) {
        addToast(error.message, 'error');
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  const assetSummary = reports?.assets?.summary || {};
  const maintenanceSummary = reports?.maintenance?.summary || {};
  const warrantySummary = reports?.warranty?.summary || {};

  const recentColumns = [
    { key: 'asset_code', header: 'Asset ID' },
    { key: 'asset_name', header: 'Asset' },
    { key: 'vendor', header: 'Vendor', render: (row) => row.vendor || 'Not set' },
    { key: 'purchase_date', header: 'Purchased', render: (row) => formatDate(row.purchase_date) },
    { key: 'purchase_cost', header: 'Cost', render: (row) => formatCurrency(row.purchase_cost) }
  ];

  const warrantyColumns = [
    { key: 'asset_code', header: 'Asset ID' },
    { key: 'asset_name', header: 'Asset' },
    { key: 'vendor', header: 'Vendor', render: (row) => row.vendor || 'Not set' },
    { key: 'warranty_end', header: 'Warranty End', render: (row) => formatDate(row.warranty_end) }
  ];

  const depreciationColumns = [
    { key: 'asset_code', header: 'Asset ID' },
    { key: 'asset_name', header: 'Asset' },
    { key: 'purchase_cost', header: 'Original Cost', render: (row) => formatCurrency(row.purchase_cost) },
    { key: 'estimated_book_value', header: 'Book Value', render: (row) => formatCurrency(row.estimated_book_value) }
  ];

  return (
    <RoleGate roles={['Admin', 'Asset Manager']}>
      <PageHeader eyebrow="Analytics" title="Reports" />

      <section className="metric-grid compact">
        <MetricCard title="Asset Value" value={formatCurrency(assetSummary.total_value)} icon={FileSpreadsheet} tone="teal" />
        <MetricCard title="Assigned Assets" value={assetSummary.assigned_assets || 0} icon={ShieldCheck} tone="indigo" />
        <MetricCard title="Maintenance Cost" value={formatCurrency(maintenanceSummary.total_cost)} icon={Wrench} tone="orange" />
        <MetricCard title="Warranty Alerts" value={warrantySummary.expiring_soon || 0} icon={ShieldCheck} tone="amber" />
      </section>

      <section className="dashboard-grid">
        <article className="panel">
          <div className="panel-header">
            <div>
              <span className="eyebrow">Assets</span>
              <h2>By Category</h2>
            </div>
            <button
              className="icon-button"
              type="button"
              aria-label="Export category report"
              onClick={() => exportCsv('asset-category-report.csv', reports?.assets?.byCategory)}
            >
              <Download size={18} />
            </button>
          </div>
          <ChartBarList items={reports?.assets?.byCategory || []} />
        </article>
        <article className="panel">
          <div className="panel-header">
            <div>
              <span className="eyebrow">Assets</span>
              <h2>By Department</h2>
            </div>
            <button
              className="icon-button"
              type="button"
              aria-label="Export department report"
              onClick={() => exportCsv('asset-department-report.csv', reports?.assets?.byDepartment)}
            >
              <Download size={18} />
            </button>
          </div>
          <ChartBarList items={reports?.assets?.byDepartment || []} />
        </article>
      </section>

      <section className="split-grid">
        <article className="panel">
          <div className="panel-header">
            <h2>Recently Purchased</h2>
          </div>
          <DataTable
            columns={recentColumns}
            rows={reports?.assets?.recentlyPurchased || []}
            loading={loading}
            emptyTitle="No purchased assets"
          />
        </article>
        <article className="panel">
          <div className="panel-header">
            <h2>Depreciation</h2>
          </div>
          <DataTable
            columns={depreciationColumns}
            rows={reports?.assets?.depreciation || []}
            loading={loading}
            emptyTitle="No depreciation data"
          />
        </article>
      </section>

      <section className="split-grid">
        <article className="panel">
          <div className="panel-header">
            <h2>Warranty Expiring Soon</h2>
          </div>
          <DataTable
            columns={warrantyColumns}
            rows={reports?.warranty?.expiringSoon || []}
            loading={loading}
            emptyTitle="No expiring warranties"
          />
        </article>
        <article className="panel">
          <div className="panel-header">
            <h2>Maintenance Vendors</h2>
          </div>
          <ChartBarList items={reports?.maintenance?.byVendor || []} />
        </article>
      </section>
    </RoleGate>
  );
}
