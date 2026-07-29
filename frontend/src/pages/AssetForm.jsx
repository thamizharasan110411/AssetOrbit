import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { PageHeader } from '../components/PageHeader.jsx';
import { RoleGate } from '../components/RoleGate.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { assetService } from '../services/assetService.js';
import { categoryService } from '../services/categoryService.js';
import { toDateInput } from '../utils/format.js';

const blankForm = {
  asset_name: '',
  category_id: '',
  brand: '',
  model: '',
  serial_number: '',
  purchase_date: '',
  purchase_cost: 0,
  vendor: '',
  warranty_start: '',
  warranty_end: '',
  status: 'Available',
  location: '',
  department: '',
  description: '',
  qr_code_value: ''
};

export function AssetForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const [form, setForm] = useState(blankForm);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();
  const { addToast } = useToast();

  const title = useMemo(() => (isEdit ? 'Edit Asset' : 'Add Asset'), [isEdit]);

  useEffect(() => {
    async function load() {
      setLoading(true);

      try {
        const categoryResult = await categoryService.list();
        setCategories(categoryResult.data);

        if (isEdit) {
          const result = await assetService.get(id);
          setForm({
            ...blankForm,
            ...result.asset,
            category_id: result.asset.category_id || '',
            purchase_cost: result.asset.purchase_cost || 0,
            purchase_date: toDateInput(result.asset.purchase_date),
            warranty_start: toDateInput(result.asset.warranty_start),
            warranty_end: toDateInput(result.asset.warranty_end)
          });
        }
      } catch (error) {
        addToast(error.message, 'error');
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [id, isEdit]);

  const update = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const payload = {
    ...form,
    category_id: form.category_id || null,
    purchase_cost: Number(form.purchase_cost || 0),
    purchase_date: form.purchase_date || null,
    warranty_start: form.warranty_start || null,
    warranty_end: form.warranty_end || null,
    qr_code_value: form.qr_code_value || null
  };

  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);

    try {
      const result = isEdit ? await assetService.update(id, payload) : await assetService.create(payload);
      addToast(isEdit ? 'Asset updated.' : 'Asset created.');
      navigate(`/assets/${result.asset.id}`);
    } catch (error) {
      addToast(error.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <RoleGate roles={['Admin', 'Asset Manager']}>
      <PageHeader
        eyebrow="Inventory"
        title={title}
        actions={
          <Link className="btn btn-outline-secondary icon-text" to={isEdit ? `/assets/${id}` : '/assets'}>
            <ArrowLeft size={17} />
            Back
          </Link>
        }
      />

      <section className="panel">
        {loading ? (
          <div className="loading-state">
            <div className="spinner-border spinner-border-sm" role="status" />
            <span>Loading asset</span>
          </div>
        ) : (
          <form className="entity-form" onSubmit={submit}>
            <div className="form-grid">
              <label>
                Asset Name
                <input value={form.asset_name} onChange={(event) => update('asset_name', event.target.value)} required />
              </label>
              <label>
                Category
                <select value={form.category_id} onChange={(event) => update('category_id', event.target.value)}>
                  <option value="">Uncategorized</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.category_name}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Brand
                <input value={form.brand || ''} onChange={(event) => update('brand', event.target.value)} />
              </label>
              <label>
                Model
                <input value={form.model || ''} onChange={(event) => update('model', event.target.value)} />
              </label>
              <label>
                Serial Number
                <input
                  value={form.serial_number}
                  onChange={(event) => update('serial_number', event.target.value)}
                  required
                />
              </label>
              <label>
                Purchase Cost
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.purchase_cost}
                  onChange={(event) => update('purchase_cost', event.target.value)}
                />
              </label>
              <label>
                Purchase Date
                <input
                  type="date"
                  value={form.purchase_date || ''}
                  onChange={(event) => update('purchase_date', event.target.value)}
                />
              </label>
              <label>
                Vendor
                <input value={form.vendor || ''} onChange={(event) => update('vendor', event.target.value)} />
              </label>
              <label>
                Warranty Start
                <input
                  type="date"
                  value={form.warranty_start || ''}
                  onChange={(event) => update('warranty_start', event.target.value)}
                />
              </label>
              <label>
                Warranty End
                <input
                  type="date"
                  value={form.warranty_end || ''}
                  onChange={(event) => update('warranty_end', event.target.value)}
                />
              </label>
              <label>
                Status
                <select value={form.status} onChange={(event) => update('status', event.target.value)}>
                  <option>Available</option>
                  <option>Under Maintenance</option>
                  <option>Retired</option>
                </select>
              </label>
              <label>
                Office Location
                <input value={form.location || ''} onChange={(event) => update('location', event.target.value)} />
              </label>
              <label>
                Department
                <input value={form.department || ''} onChange={(event) => update('department', event.target.value)} />
              </label>
              <label>
                QR / Barcode Value
                <input value={form.qr_code_value || ''} onChange={(event) => update('qr_code_value', event.target.value)} />
              </label>
            </div>
            <label className="full-width">
              Description
              <textarea value={form.description || ''} onChange={(event) => update('description', event.target.value)} rows={4} />
            </label>
            <div className="form-actions">
              <button className="btn btn-primary icon-text" type="submit" disabled={saving}>
                <Save size={17} />
                {saving ? 'Saving...' : 'Save Asset'}
              </button>
            </div>
          </form>
        )}
      </section>
    </RoleGate>
  );
}
