import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, RotateCw } from 'lucide-react';
import { DataTable } from '../components/DataTable.jsx';
import { PageHeader } from '../components/PageHeader.jsx';
import { RoleGate } from '../components/RoleGate.jsx';
import { StatusBadge } from '../components/StatusBadge.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { assetService } from '../services/assetService.js';
import { assignmentService } from '../services/assignmentService.js';
import { userService } from '../services/userService.js';
import { formatDate } from '../utils/format.js';

const blankAssignment = {
  asset_id: '',
  employee_id: '',
  assigned_date: new Date().toISOString().slice(0, 10),
  expected_return_date: '',
  asset_condition: 'Good',
  remarks: ''
};

export function Assignments() {
  const [assignments, setAssignments] = useState([]);
  const [assets, setAssets] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [form, setForm] = useState(blankAssignment);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { addToast } = useToast();
  const canAssign = ['Admin', 'Asset Manager'].includes(user?.role);

  const load = async () => {
    setLoading(true);

    try {
      const assignmentResult = await assignmentService.list();
      setAssignments(assignmentResult.data);

      if (canAssign) {
        const [assetResult, userResult] = await Promise.all([
          assetService.list({ status: 'Available', limit: 100 }),
          userService.list({ role: 'Employee' })
        ]);
        setAssets(assetResult.data);
        setEmployees(userResult.data);
      }
    } catch (error) {
      addToast(error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const activeCount = useMemo(
    () => assignments.filter((assignment) => !assignment.returned_date).length,
    [assignments]
  );

  const update = (field, value) => setForm((current) => ({ ...current, [field]: value }));

  const submit = async (event) => {
    event.preventDefault();

    try {
      await assignmentService.create({
        ...form,
        assigned_date: form.assigned_date || null,
        expected_return_date: form.expected_return_date || null
      });
      addToast('Asset assigned.');
      setForm(blankAssignment);
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
        <Link className="table-link" to={`/assets/${row.asset_id}`}>
          <strong>{row.asset_name}</strong>
          <span>{row.asset_code}</span>
        </Link>
      )
    },
    { key: 'employee_name', header: 'Employee' },
    { key: 'assigned_by_name', header: 'Assigned By' },
    { key: 'assigned_date', header: 'Assigned', render: (row) => formatDate(row.assigned_date) },
    { key: 'expected_return_date', header: 'Expected Return', render: (row) => formatDate(row.expected_return_date) },
    {
      key: 'status',
      header: 'Status',
      render: (row) => <StatusBadge value={row.returned_date ? 'Returned' : 'Assigned'} />
    }
  ];

  return (
    <>
      <PageHeader eyebrow="Lifecycle" title="Assignments" />

      <section className={canAssign ? 'split-grid uneven' : 'panel'}>
        <article className="panel">
          <div className="panel-header">
            <div>
              <span className="eyebrow">{activeCount} active</span>
              <h2>Assignment Ledger</h2>
            </div>
            <button className="icon-button" type="button" aria-label="Refresh" onClick={load}>
              <RotateCw size={18} />
            </button>
          </div>
          <DataTable columns={columns} rows={assignments} loading={loading} emptyTitle="No assignments yet" />
        </article>

        {canAssign ? (
          <RoleGate roles={['Admin', 'Asset Manager']}>
            <article className="panel">
              <div className="panel-header">
                <h2>Assign Asset</h2>
              </div>
              <form className="entity-form" onSubmit={submit}>
                <label>
                  Asset
                  <select value={form.asset_id} onChange={(event) => update('asset_id', event.target.value)} required>
                    <option value="">Select available asset</option>
                    {assets.map((asset) => (
                      <option key={asset.id} value={asset.id}>
                        {asset.asset_code} - {asset.asset_name}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Employee
                  <select value={form.employee_id} onChange={(event) => update('employee_id', event.target.value)} required>
                    <option value="">Select employee</option>
                    {employees.map((employee) => (
                      <option key={employee.id} value={employee.id}>
                        {employee.name} - {employee.department || 'No department'}
                      </option>
                    ))}
                  </select>
                </label>
                <div className="form-grid two">
                  <label>
                    Assigned Date
                    <input type="date" value={form.assigned_date} onChange={(event) => update('assigned_date', event.target.value)} />
                  </label>
                  <label>
                    Expected Return
                    <input
                      type="date"
                      value={form.expected_return_date}
                      onChange={(event) => update('expected_return_date', event.target.value)}
                    />
                  </label>
                </div>
                <label>
                  Current Condition
                  <input value={form.asset_condition} onChange={(event) => update('asset_condition', event.target.value)} />
                </label>
                <label>
                  Remarks
                  <textarea rows={4} value={form.remarks} onChange={(event) => update('remarks', event.target.value)} />
                </label>
                <div className="form-actions">
                  <button className="btn btn-primary icon-text" type="submit">
                    <Plus size={17} />
                    Assign
                  </button>
                </div>
              </form>
            </article>
          </RoleGate>
        ) : null}
      </section>
    </>
  );
}
