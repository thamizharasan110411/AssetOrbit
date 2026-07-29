import {
  AlertTriangle,
  Archive,
  Boxes,
  CheckCircle2,
  CircleDollarSign,
  ClipboardList,
  Clock3,
  PackageCheck,
  Wrench
} from 'lucide-react';
import { ChartBarList } from '../components/ChartBarList.jsx';
import { DataTable } from '../components/DataTable.jsx';
import { MetricCard } from '../components/MetricCard.jsx';
import { PageHeader } from '../components/PageHeader.jsx';
import { StatusBadge } from '../components/StatusBadge.jsx';
import { useAsync } from '../hooks/useAsync.js';
import { dashboardService } from '../services/dashboardService.js';
import { formatCurrency, formatDate } from '../utils/format.js';

export function Dashboard() {
  const { data, loading, error } = useAsync(() => dashboardService.get(), []);
  const metrics = data?.metrics || {};

  const metricCards = [
    {
      title: 'Total Assets',
      value: metrics.total_assets || 0,
      icon: Boxes,
      tone: 'blue'
    },
    {
      title: 'Available',
      value: metrics.available_assets || 0,
      icon: CheckCircle2,
      tone: 'green'
    },
    {
      title: 'Assigned',
      value: metrics.assigned_assets || 0,
      icon: PackageCheck,
      tone: 'indigo'
    },
    {
      title: 'Maintenance',
      value: metrics.maintenance_assets || 0,
      icon: Wrench,
      tone: 'orange'
    },
    {
      title: 'Retired',
      value: metrics.retired_assets || 0,
      icon: Archive,
      tone: 'slate'
    },
    {
      title: 'Warranty Alert',
      value: metrics.warranty_expiring_soon || 0,
      icon: AlertTriangle,
      tone: 'amber',
      detail: `${metrics.warranty_expired || 0} expired`
    },
    {
      title: 'Due Service',
      value: metrics.assets_due_for_service || 0,
      icon: Clock3,
      tone: 'red'
    },
    {
      title: 'Asset Value',
      value: formatCurrency(metrics.total_asset_value),
      icon: CircleDollarSign,
      tone: 'teal'
    }
  ];

  const assignmentColumns = [
    {
      key: 'asset',
      header: 'Asset',
      render: (row) => (
        <div className="table-identity">
          <strong>{row.asset_name}</strong>
          <span>{row.asset_code}</span>
        </div>
      )
    },
    { key: 'employee_name', header: 'Employee' },
    { key: 'assigned_by_name', header: 'Assigned By' },
    { key: 'assigned_date', header: 'Assigned', render: (row) => formatDate(row.assigned_date) },
    {
      key: 'state',
      header: 'State',
      render: (row) => <StatusBadge value={row.returned_date ? 'Returned' : 'Assigned'} />
    }
  ];

  const activityColumns = [
    { key: 'action', header: 'Action' },
    {
      key: 'asset',
      header: 'Asset',
      render: (row) => row.asset_name || row.asset_code || 'System'
    },
    { key: 'user_name', header: 'User', render: (row) => row.user_name || 'System' },
    { key: 'timestamp', header: 'Time', render: (row) => formatDate(row.timestamp) }
  ];

  return (
    <>
      <PageHeader eyebrow="Operations" title="Dashboard">
        Live asset position, warranty risk, service due dates, assignments, and recent audit activity.
      </PageHeader>

      {error ? <div className="alert alert-danger">{error}</div> : null}

      <section className="metric-grid">
        {metricCards.map((card) => (
          <MetricCard key={card.title} {...card} />
        ))}
      </section>

      <section className="dashboard-grid">
        <article className="panel">
          <div className="panel-header">
            <div>
              <span className="eyebrow">Inventory</span>
              <h2>Status Breakdown</h2>
            </div>
            <ClipboardList size={20} />
          </div>
          <ChartBarList items={data?.statusBreakdown || []} labelKey="status" />
        </article>
        <article className="panel">
          <div className="panel-header">
            <div>
              <span className="eyebrow">Utilization</span>
              <h2>Departments</h2>
            </div>
            <Boxes size={20} />
          </div>
          <ChartBarList items={data?.departmentBreakdown || []} labelKey="department" />
        </article>
      </section>

      <section className="split-grid">
        <article className="panel">
          <div className="panel-header">
            <div>
              <span className="eyebrow">Recent</span>
              <h2>Assignments</h2>
            </div>
          </div>
          <DataTable
            columns={assignmentColumns}
            rows={data?.recentAssignments || []}
            loading={loading}
            emptyTitle="No assignments yet"
          />
        </article>
        <article className="panel">
          <div className="panel-header">
            <div>
              <span className="eyebrow">Audit</span>
              <h2>Activity</h2>
            </div>
          </div>
          <DataTable
            columns={activityColumns}
            rows={data?.recentActivity || []}
            loading={loading}
            emptyTitle="No audit activity yet"
          />
        </article>
      </section>
    </>
  );
}
