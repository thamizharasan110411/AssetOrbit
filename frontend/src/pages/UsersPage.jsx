import { useEffect, useState } from 'react';
import { Save, Search } from 'lucide-react';
import { DataTable } from '../components/DataTable.jsx';
import { PageHeader } from '../components/PageHeader.jsx';
import { RoleGate } from '../components/RoleGate.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { userService } from '../services/userService.js';
import { formatDate } from '../utils/format.js';

export function UsersPage() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);
  const { addToast } = useToast();

  const load = async () => {
    setLoading(true);

    try {
      const result = await userService.list({ search });
      setUsers(result.data);
    } catch (error) {
      addToast(error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const updateLocal = (id, field, value) => {
    setUsers((current) => current.map((user) => (user.id === id ? { ...user, [field]: value } : user)));
  };

  const save = async (user) => {
    setSavingId(user.id);

    try {
      await userService.update(user.id, {
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department
      });
      addToast('User updated.');
    } catch (error) {
      addToast(error.message, 'error');
    } finally {
      setSavingId(null);
    }
  };

  const columns = [
    {
      key: 'name',
      header: 'Name',
      render: (row) => <input value={row.name} onChange={(event) => updateLocal(row.id, 'name', event.target.value)} />
    },
    { key: 'email', header: 'Email' },
    {
      key: 'role',
      header: 'Role',
      render: (row) => (
        <select value={row.role} onChange={(event) => updateLocal(row.id, 'role', event.target.value)}>
          <option>Admin</option>
          <option>Asset Manager</option>
          <option>Employee</option>
        </select>
      )
    },
    {
      key: 'department',
      header: 'Department',
      render: (row) => (
        <input
          value={row.department || ''}
          onChange={(event) => updateLocal(row.id, 'department', event.target.value)}
        />
      )
    },
    { key: 'created_at', header: 'Created', render: (row) => formatDate(row.created_at) },
    {
      key: 'actions',
      header: '',
      render: (row) => (
        <button className="icon-button" type="button" aria-label="Save user" onClick={() => save(row)} disabled={savingId === row.id}>
          <Save size={17} />
        </button>
      )
    }
  ];

  return (
    <RoleGate roles={['Admin']}>
      <PageHeader eyebrow="Admin" title="Users" />

      <section className="panel">
        <div className="filter-panel compact">
          <div className="search-field">
            <Search size={18} />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  load();
                }
              }}
              placeholder="Search users"
            />
          </div>
          <button className="btn btn-outline-secondary" type="button" onClick={load}>
            Search
          </button>
        </div>
        <DataTable columns={columns} rows={users} loading={loading} emptyTitle="No users found" />
      </section>
    </RoleGate>
  );
}
