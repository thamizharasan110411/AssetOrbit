import { useEffect, useMemo, useState } from 'react';
import { ArchiveRestore, RotateCw } from 'lucide-react';
import { DataTable } from '../components/DataTable.jsx';
import { PageHeader } from '../components/PageHeader.jsx';
import { RoleGate } from '../components/RoleGate.jsx';
import { StatusBadge } from '../components/StatusBadge.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { assignmentService } from '../services/assignmentService.js';
import { formatDate } from '../utils/format.js';

const blankReturn = {
  assignment_id: '',
  returned_date: new Date().toISOString().slice(0, 10),
  asset_condition: 'Good',
  remarks: ''
};

export function Returns() {
  const [assignments, setAssignments] = useState([]);
  const [form, setForm] = useState(blankReturn);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  const load = async () => {
    setLoading(true);

    try {
      const result = await assignmentService.list();
      setAssignments(result.data);
    } catch (error) {
      addToast(error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const activeAssignments = useMemo(
    () => assignments.filter((assignment) => !assignment.returned_date),
    [assignments]
  );
  const returnedAssignments = useMemo(
    () => assignments.filter((assignment) => assignment.returned_date),
    [assignments]
  );

  const update = (field, value) => setForm((current) => ({ ...current, [field]: value }));

  const submit = async (event) => {
    event.preventDefault();

    try {
      await assignmentService.returnAsset(form.assignment_id, {
        returned_date: form.returned_date || null,
        asset_condition: form.asset_condition,
        remarks: form.remarks
      });
      addToast('Return verified.');
      setForm(blankReturn);
      load();
    } catch (error) {
      addToast(error.message, 'error');
    }
  };

  const columns = [
    { key: 'asset_name', header: 'Asset' },
    { key: 'asset_code', header: 'Asset ID' },
    { key: 'employee_name', header: 'Employee' },
    { key: 'assigned_date', header: 'Assigned', render: (row) => formatDate(row.assigned_date) },
    { key: 'returned_date', header: 'Returned', render: (row) => formatDate(row.returned_date) },
    { key: 'status', header: 'Status', render: (row) => <StatusBadge value={row.returned_date ? 'Returned' : 'Assigned'} /> }
  ];

  return (
    <RoleGate roles={['Admin', 'Asset Manager']}>
      <PageHeader eyebrow="Lifecycle" title="Asset Returns" />

      <section className="split-grid uneven">
        <article className="panel">
          <div className="panel-header">
            <div>
              <span className="eyebrow">{activeAssignments.length} awaiting return</span>
              <h2>Verify Return</h2>
            </div>
            <button className="icon-button" type="button" aria-label="Refresh" onClick={load}>
              <RotateCw size={18} />
            </button>
          </div>
          <form className="entity-form" onSubmit={submit}>
            <label>
              Assignment
              <select value={form.assignment_id} onChange={(event) => update('assignment_id', event.target.value)} required>
                <option value="">Select active assignment</option>
                {activeAssignments.map((assignment) => (
                  <option key={assignment.id} value={assignment.id}>
                    {assignment.asset_code} - {assignment.employee_name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Return Date
              <input type="date" value={form.returned_date} onChange={(event) => update('returned_date', event.target.value)} />
            </label>
            <label>
              Physical Condition
              <input value={form.asset_condition} onChange={(event) => update('asset_condition', event.target.value)} required />
            </label>
            <label>
              Remarks
              <textarea rows={4} value={form.remarks} onChange={(event) => update('remarks', event.target.value)} />
            </label>
            <div className="form-actions">
              <button className="btn btn-primary icon-text" type="submit">
                <ArchiveRestore size={17} />
                Verify Return
              </button>
            </div>
          </form>
        </article>

        <article className="panel">
          <div className="panel-header">
            <h2>Return Ledger</h2>
          </div>
          <DataTable columns={columns} rows={returnedAssignments} loading={loading} emptyTitle="No returned assets yet" />
        </article>
      </section>
    </RoleGate>
  );
}
