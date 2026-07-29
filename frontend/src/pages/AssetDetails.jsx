import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { QRCodeCanvas } from 'qrcode.react';
import { ArrowLeft, Edit3 } from 'lucide-react';
import { DataTable } from '../components/DataTable.jsx';
import { LoadingState } from '../components/LoadingState.jsx';
import { PageHeader } from '../components/PageHeader.jsx';
import { StatusBadge } from '../components/StatusBadge.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { assetService } from '../services/assetService.js';
import { formatCurrency, formatDate, getWarrantyState } from '../utils/format.js';

export function AssetDetails() {
  const { id } = useParams();
  const [record, setRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { addToast } = useToast();
  const canManage = ['Admin', 'Asset Manager'].includes(user?.role);

  useEffect(() => {
    async function load() {
      setLoading(true);

      try {
        const result = await assetService.get(id);
        setRecord(result);
      } catch (error) {
        addToast(error.message, 'error');
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [id]);

  if (loading) {
    return <LoadingState label="Loading asset" />;
  }

  if (!record?.asset) {
    return null;
  }

  const { asset, history, assignments, maintenance } = record;
  const qrValue = asset.qr_code_value || asset.asset_code;

  const historyColumns = [
    { key: 'action', header: 'Action' },
    { key: 'user_name', header: 'User', render: (row) => row.user_name || 'System' },
    { key: 'timestamp', header: 'Timestamp', render: (row) => formatDate(row.timestamp) }
  ];

  const assignmentColumns = [
    { key: 'employee_name', header: 'Employee' },
    { key: 'assigned_by_name', header: 'Assigned By' },
    { key: 'assigned_date', header: 'Assigned', render: (row) => formatDate(row.assigned_date) },
    { key: 'expected_return_date', header: 'Expected Return', render: (row) => formatDate(row.expected_return_date) },
    {
      key: 'returned_date',
      header: 'Returned',
      render: (row) => (row.returned_date ? formatDate(row.returned_date) : 'Active')
    }
  ];

  const maintenanceColumns = [
    { key: 'issue', header: 'Issue' },
    { key: 'vendor', header: 'Vendor', render: (row) => row.vendor || 'Internal' },
    { key: 'maintenance_date', header: 'Date', render: (row) => formatDate(row.maintenance_date) },
    { key: 'maintenance_cost', header: 'Cost', render: (row) => formatCurrency(row.maintenance_cost) },
    { key: 'status', header: 'Status', render: (row) => <StatusBadge value={row.status} /> }
  ];

  return (
    <>
      <PageHeader
        eyebrow={asset.asset_code}
        title={asset.asset_name}
        actions={
          <>
            <Link className="btn btn-outline-secondary icon-text" to="/assets">
              <ArrowLeft size={17} />
              Back
            </Link>
            {canManage ? (
              <Link className="btn btn-primary icon-text" to={`/assets/${asset.id}/edit`}>
                <Edit3 size={17} />
                Edit
              </Link>
            ) : null}
          </>
        }
      />

      <section className="asset-detail-grid">
        <article className="panel">
          <div className="asset-summary">
            <div>
              <span className="eyebrow">Status</span>
              <StatusBadge value={asset.status} />
            </div>
            <div>
              <span className="eyebrow">Warranty</span>
              <StatusBadge value={getWarrantyState(asset)} />
            </div>
            <div>
              <span className="eyebrow">Value</span>
              <strong>{formatCurrency(asset.purchase_cost)}</strong>
            </div>
          </div>
          <dl className="detail-list">
            <div>
              <dt>Category</dt>
              <dd>{asset.category_name || 'Uncategorized'}</dd>
            </div>
            <div>
              <dt>Serial Number</dt>
              <dd>{asset.serial_number}</dd>
            </div>
            <div>
              <dt>Brand / Model</dt>
              <dd>{[asset.brand, asset.model].filter(Boolean).join(' / ') || 'Not set'}</dd>
            </div>
            <div>
              <dt>Vendor</dt>
              <dd>{asset.vendor || 'Not set'}</dd>
            </div>
            <div>
              <dt>Location</dt>
              <dd>{asset.location || 'Not set'}</dd>
            </div>
            <div>
              <dt>Department</dt>
              <dd>{asset.department || 'Not set'}</dd>
            </div>
            <div>
              <dt>Purchase Date</dt>
              <dd>{formatDate(asset.purchase_date)}</dd>
            </div>
            <div>
              <dt>Warranty End</dt>
              <dd>{formatDate(asset.warranty_end)}</dd>
            </div>
          </dl>
          {asset.description ? <p className="detail-description">{asset.description}</p> : null}
        </article>
        <article className="panel qr-panel">
          <span className="eyebrow">QR / Barcode</span>
          <QRCodeCanvas value={qrValue} size={168} level="M" includeMargin />
          <strong>{qrValue}</strong>
        </article>
      </section>

      <section className="split-grid">
        <article className="panel">
          <div className="panel-header">
            <h2>Assignment History</h2>
          </div>
          <DataTable columns={assignmentColumns} rows={assignments} emptyTitle="No assignment history" />
        </article>
        <article className="panel">
          <div className="panel-header">
            <h2>Maintenance</h2>
          </div>
          <DataTable columns={maintenanceColumns} rows={maintenance} emptyTitle="No maintenance records" />
        </article>
      </section>

      <section className="panel">
        <div className="panel-header">
          <h2>Activity Log</h2>
        </div>
        <DataTable columns={historyColumns} rows={history} emptyTitle="No activity recorded" />
      </section>
    </>
  );
}
