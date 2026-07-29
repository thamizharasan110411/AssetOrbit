import { useEffect, useState } from 'react';
import { Edit3, Plus, Save, Trash2, X } from 'lucide-react';
import { ConfirmModal } from '../components/ConfirmModal.jsx';
import { DataTable } from '../components/DataTable.jsx';
import { PageHeader } from '../components/PageHeader.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { categoryService } from '../services/categoryService.js';

const blankCategory = {
  category_name: '',
  description: ''
};

export function Categories() {
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(blankCategory);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const { user } = useAuth();
  const { addToast } = useToast();
  const isAdmin = user?.role === 'Admin';

  const load = async () => {
    setLoading(true);

    try {
      const result = await categoryService.list();
      setCategories(result.data);
    } catch (error) {
      addToast(error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const reset = () => {
    setForm(blankCategory);
    setEditing(null);
  };

  const submit = async (event) => {
    event.preventDefault();

    try {
      if (editing) {
        await categoryService.update(editing.id, form);
        addToast('Category updated.');
      } else {
        await categoryService.create(form);
        addToast('Category created.');
      }

      reset();
      load();
    } catch (error) {
      addToast(error.message, 'error');
    }
  };

  const remove = async () => {
    if (!deleteTarget) {
      return;
    }

    try {
      await categoryService.remove(deleteTarget.id);
      addToast('Category deleted.');
      setDeleteTarget(null);
      load();
    } catch (error) {
      addToast(error.message, 'error');
    }
  };

  const columns = [
    { key: 'category_name', header: 'Category' },
    { key: 'description', header: 'Description', render: (row) => row.description || 'No description' },
    {
      key: 'actions',
      header: '',
      render: (row) =>
        isAdmin ? (
          <div className="row-actions">
            <button
              className="icon-button"
              type="button"
              aria-label="Edit category"
              onClick={() => {
                setEditing(row);
                setForm({ category_name: row.category_name, description: row.description || '' });
              }}
            >
              <Edit3 size={17} />
            </button>
            <button className="icon-button danger" type="button" aria-label="Delete category" onClick={() => setDeleteTarget(row)}>
              <Trash2 size={17} />
            </button>
          </div>
        ) : (
          'Read only'
        )
    }
  ];

  return (
    <>
      <PageHeader eyebrow="Inventory" title="Categories" />

      <section className={isAdmin ? 'split-grid uneven' : ''}>
        <article className="panel">
          <div className="panel-header">
            <h2>Category Register</h2>
          </div>
          <DataTable columns={columns} rows={categories} loading={loading} emptyTitle="No categories yet" />
        </article>
        {isAdmin ? (
          <article className="panel">
            <div className="panel-header">
              <h2>{editing ? 'Edit Category' : 'Add Category'}</h2>
            </div>
            <form className="entity-form" onSubmit={submit}>
              <label>
                Category Name
                <input
                  value={form.category_name}
                  onChange={(event) => setForm({ ...form, category_name: event.target.value })}
                  required
                />
              </label>
              <label>
                Description
                <textarea
                  rows={5}
                  value={form.description}
                  onChange={(event) => setForm({ ...form, description: event.target.value })}
                />
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
                  {editing ? 'Save' : 'Add'}
                </button>
              </div>
            </form>
          </article>
        ) : null}
      </section>

      <ConfirmModal
        open={Boolean(deleteTarget)}
        title="Delete category"
        message={`${deleteTarget?.category_name || 'This category'} will be removed. Existing assets become uncategorized.`}
        confirmLabel="Delete"
        onCancel={() => setDeleteTarget(null)}
        onConfirm={remove}
      />
    </>
  );
}
