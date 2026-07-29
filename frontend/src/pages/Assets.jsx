import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Edit3, Eye, Plus, Trash2 } from 'lucide-react';
import { ConfirmModal } from '../components/ConfirmModal.jsx';
import { DataTable } from '../components/DataTable.jsx';
import { FilterPanel } from '../components/FilterPanel.jsx';
import { PageHeader } from '../components/PageHeader.jsx';
import { StatusBadge } from '../components/StatusBadge.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { assetService } from '../services/assetService.js';
import { categoryService } from '../services/categoryService.js';
import { formatCurrency, formatDate, getWarrantyState } from '../utils/format.js';

const initialFilters = {
  search: '',
  category_id: '',
  status: '',
  warranty_status: '',
  sort_by: 'created_at',
  sort_direction: 'desc',
  page: 1,
  limit: 10
};

export function Assets() {
  const [filters, setFilters] = useState(initialFilters);
  const [assets, setAssets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [error, setError] = useState('');
  const { user } = useAuth();
  const { addToast } = useToast();

  const canManage = ['Admin', 'Asset Manager'].includes(user?.role);
  const canDelete = user?.role === 'Admin';

  const loadAssets = async () => {
    setLoading(true);
    setError('');

    try {
      const [assetResult, categoryResult] = await Promise.all([
        assetService.list(filters),
        categoryService.list()
      ]);
      setAssets(assetResult.data);
      setPagination(assetResult.pagination);
      setCategories(categoryResult.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAssets();
  }, [filters]);

  const confirmDelete = async () => {
    if (!deleteTarget) {
      return;
    }

    try {
      await assetService.remove(deleteTarget.id);
      addToast('Asset retired.');
      setDeleteTarget(null);
      loadAssets();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const columns = [
    {
      key: 'asset',
      header: 'Asset',
      render: (asset) => (
        <div className="table-identity">
          <strong>{asset.asset_name}</strong>
          <span>{asset.asset_code}</span>
        </div>
      )
    },
    { key: 'category_name', header: 'Category', render: (asset) => asset.category_name || 'Uncategorized' },
    { key: 'serial_number', header: 'Serial Number' },
    { key: 'assigned_employee', header: 'Owner', render: (asset) => asset.assigned_employee || 'Inventory' },
    { key: 'department', header: 'Department', render: (asset) => asset.department || 'Unassigned' },
    { key: 'status', header: 'Status', render: (asset) => <StatusBadge value={asset.status} /> },
    { key: 'warranty', header: 'Warranty', render: (asset) => <StatusBadge value={getWarrantyState(asset)} /> },
    { key: 'purchase_cost', header: 'Value', render: (asset) => formatCurrency(asset.purchase_cost) },
    {
      key: 'actions',
      header: '',
      render: (asset) => (
        <div className="row-actions">
          <Link className="icon-button" aria-label="View asset" to={`/assets/${asset.id}`}>
            <Eye size={17} />
          </Link>
          {canManage ? (
            <Link className="icon-button" aria-label="Edit asset" to={`/assets/${asset.id}/edit`}>
              <Edit3 size={17} />
            </Link>
          ) : null}
          {canDelete ? (
            <button className="icon-button danger" type="button" aria-label="Retire asset" onClick={() => setDeleteTarget(asset)}>
              <Trash2 size={17} />
            </button>
          ) : null}
        </div>
      )
    }
  ];

  return (
    <>
      <PageHeader
        eyebrow="Inventory"
        title="Assets"
        actions={
          canManage ? (
            <Link className="btn btn-primary icon-text" to="/assets/new">
              <Plus size={17} />
              Add Asset
            </Link>
          ) : null
        }
      />

      {error ? <div className="alert alert-danger">{error}</div> : null}

      <FilterPanel
        filters={filters}
        categories={categories}
        onChange={setFilters}
        onReset={() => setFilters(initialFilters)}
      />

      <section className="panel">
        <div className="panel-header">
          <div>
            <span className="eyebrow">{pagination.total} records</span>
            <h2>Asset Register</h2>
          </div>
        </div>
        <DataTable columns={columns} rows={assets} loading={loading} emptyTitle="No assets match this view" />
        <div className="pagination-bar">
          <span>
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <div>
            <button
              className="btn btn-outline-secondary"
              type="button"
              disabled={filters.page <= 1}
              onClick={() => setFilters((current) => ({ ...current, page: current.page - 1 }))}
            >
              Previous
            </button>
            <button
              className="btn btn-outline-secondary"
              type="button"
              disabled={filters.page >= pagination.totalPages}
              onClick={() => setFilters((current) => ({ ...current, page: current.page + 1 }))}
            >
              Next
            </button>
          </div>
        </div>
      </section>

      <ConfirmModal
        open={Boolean(deleteTarget)}
        title="Retire asset"
        message={`${deleteTarget?.asset_code || 'This asset'} will be removed from active inventory.`}
        confirmLabel="Retire"
        onCancel={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
      />
    </>
  );
}
