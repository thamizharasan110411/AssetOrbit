import { useEffect, useMemo, useState } from 'react';
import { Edit3, Plus, RotateCw, Save, X } from 'lucide-react';
import { DataTable } from '../components/DataTable.jsx';
import { PageHeader } from '../components/PageHeader.jsx';
import { StatusBadge } from '../components/StatusBadge.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { assetService } from '../services/assetService.js';
import { maintenanceService } from '../services/maintenanceService.js';
import { formatCurrency, formatDate, toDateInput } from '../utils/format.js';

const blankMaintenance = {
  asset_id: '',
  issue: '',
  description: '',
  vendor: '',
  maintenance_date: new Date().toISOString().slice(0, 10),
  next_service_date: '',
  maintenance_cost: 0,
  status: 'Scheduled',
  remarks: ''
};

export function Maintenance() {
  const [records, setRecords] = useState([]);
  const [assets, setAssets] = useState([]);
  const [form, setForm] = useState(blankMaintenance);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { addToast } = useToast();
  const canManage = ['Admin', 'Asset Manager'].includes(user?.role);

  const load = async () => {
    setLoading(true);

    try {
      const [maintenanceResult, assetResult] = await Promise.all([
        maintenanceService.list(),
        assetService.list({ limit: 100 })
      ]);
      setRecords(maintenanceResult.data);
      setAssets(assetResult.data);
    } catch (error) {
      addToast(error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openRecords = useMemo(
    () => records.filter((record) => record.status !== 'Completed').length,
    [records]
  );

  const update = (field, value) => setForm((current) => ({ ...current, [field]: value }));

  const reset = () => {
    setForm(blankMaintenance);
    setEditing(null);
  };

  const submit = async (event) => {
    event.preventDefault();
    const payload = {
      ...form,
      maintenance_cost: Number(form.maintenance_cost || 0),
      maintenance_date: form.maintenance_date || null,
      next_service_date: form.next_service_date || null
    };

    try {
      if (editing) {
        await maintenanceService.update(editing.id, payload);
        addToast('Maintenance updated.');
      } else {
        await maintenanceService.create(payload);
        addToast('Maintenance record created.');
      }

      reset();
      load();
    } catch (error) {
      addToast(error.message, 'error');
    }
  };

  const columns = [
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
    { key: 'issue', header: 'Issue' },
    { key: 'vendor', header: 'Vendor', render: (row) => row.vendor || 'Internal' },
    { key: 'maintenance_date', header: 'Date', render: (row) => formatDate(row.maintenance_date) },
    { key: 'next_service_date', header: 'Next Service', render: (row) => formatDate(row.next_service_date) },
    { key: 'maintenance_cost', header: 'Cost', render: (row) => formatCurrency(row.maintenance_cost) },
    { key: 'status', header: 'Status', render: (row) => <StatusBadge value={row.status} /> },
    {
      key: 'actions',
      header: '',
      render: (row) =>
        canManage ? (
          <button
            className="icon-button"
            type="button"
            aria-label="Edit maintenance"
            onClick={() => {
              setEditing(row);
              setForm({
                asset_id: row.asset_id,
                issue: row.issue,
                description: row.description || '',
                vendor: row.vendor || '',
                maintenance_date: toDateInput(row.maintenance_date),
                next_service_date: toDateInput(row.next_service_date),
                maintenance_cost: row.maintenance_cost || 0,
                status: row.status,
                remarks: row.remarks || ''
              });
            }}
          >
            <Edit3 size={17} />
          </button>
        ) : (
          ''
        )
    }
  ];

  return (
    <>
      <PageHeader eyebrow="Service" title="Maintenance" />

      <section className="split-grid uneven">
        <article className="panel">
          <div className="panel-header">
            <div>
              <span className="eyebrow">{openRecords} open</span>
              <h2>Service Ledger</h2>
            </div>
            <button className="icon-button" type="button" aria-label="Refresh" onClick={load}>
              <RotateCw size={18} />
            </button>
          </div>
          <DataTable columns={columns} rows={records} loading={loading} emptyTitle="No maintenance records" />
        </article>

        <article className="panel">
          <div className="panel-header">
            <h2>{editing ? 'Edit Maintenance' : canManage ? 'Create Maintenance' : 'Report Issue'}</h2>
          </div>
          <form className="entity-form" onSubmit={submit}>
            <label>
              Asset
              <select
                value={form.asset_id}
                onChange={(event) => update('asset_id', event.target.value)}
                disabled={Boolean(editing)}
                required
              >
                <option value="">Select asset</option>
                {assets.map((asset) => (
                  <option key={asset.id} value={asset.id}>
                    {asset.asset_code} - {asset.asset_name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Issue
              <input value={form.issue} onChange={(event) => update('issue', event.target.value)} required />
            </label>
            <label>
              Description
              <textarea rows={3} value={form.description} onChange={(event) => update('description', event.target.value)} />
            </label>
            <div className="form-grid two">
              <label>
                Vendor
                <input value={form.vendor} onChange={(event) => update('vendor', event.target.value)} />
              </label>
              <label>
                Cost
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.maintenance_cost}
                  onChange={(event) => update('maintenance_cost', event.target.value)}
                />
              </label>
            </div>
            <div className="form-grid two">
              <label>
                Maintenance Date
                <input
                  type="date"
                  value={form.maintenance_date}
                  onChange={(event) => update('maintenance_date', event.target.value)}
                />
              </label>
              <label>
                Next Service
                <input
                  type="date"
                  value={form.next_service_date}
                  onChange={(event) => update('next_service_date', event.target.value)}
                />
              </label>
            </div>
            <label>
              Status
              <select value={form.status} onChange={(event) => update('status', event.target.value)} disabled={!canManage}>
                <option>Scheduled</option>
                <option>In Progress</option>
                <option>Completed</option>
              </select>
            </label>
            <label>
              Remarks
              <textarea rows={3} value={form.remarks} onChange={(event) => update('remarks', event.target.value)} />
            </label>
            <div className="form-actions">
              {editing ? (
                <button className="btn btn-outline-secondary icon-text" type="button" onClick={reset}>
                  <X size={17} />
                  Clear
                </button>
              ) : null}
              <button className="btn btn-primary icon-text" type="submit">
                {editing ? <Save size={17} /> : <Plus size={17} />}
                {editing ? 'Save' : 'Create'}
              </button>
            </div>
          </form>
        </article>
      </section>
    </>
  );
}
