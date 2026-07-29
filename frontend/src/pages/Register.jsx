import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { ArrowRight, Building2, Lock, Mail, UserRound } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';

export function Register() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    department: ''
  });
  const [loading, setLoading] = useState(false);
  const { register, isAuthenticated } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const update = (field, value) => setForm((current) => ({ ...current, [field]: value }));

  const submit = async (event) => {
    event.preventDefault();
    setLoading(true);

    try {
      await register(form);
      addToast('Account created.');
      navigate('/dashboard', { replace: true });
    } catch (error) {
      addToast(error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page">
      <section className="auth-panel">
        <div className="brand-lockup auth-brand">
          <div className="brand-mark">
            <Building2 size={24} />
          </div>
          <div>
            <strong>AssetOrbit</strong>
            <span>Enterprise Asset Management</span>
          </div>
        </div>
        <h1>Create account</h1>
        <form onSubmit={submit} className="auth-form">
          <label>
            Name
            <span className="input-icon">
              <UserRound size={17} />
              <input value={form.name} onChange={(event) => update('name', event.target.value)} required />
            </span>
          </label>
          <label>
            Email
            <span className="input-icon">
              <Mail size={17} />
              <input
                type="email"
                value={form.email}
                onChange={(event) => update('email', event.target.value)}
                required
              />
            </span>
          </label>
          <label>
            Department
            <input value={form.department} onChange={(event) => update('department', event.target.value)} />
          </label>
          <label>
            Password
            <span className="input-icon">
              <Lock size={17} />
              <input
                type="password"
                value={form.password}
                onChange={(event) => update('password', event.target.value)}
                minLength={8}
                required
              />
            </span>
          </label>
          <button className="btn btn-primary icon-text w-100" type="submit" disabled={loading}>
            {loading ? 'Creating...' : 'Create account'}
            <ArrowRight size={17} />
          </button>
        </form>
        <p className="auth-link">
          Already registered? <Link to="/login">Sign in</Link>
        </p>
      </section>
      <section className="auth-side">
        <div className="orbit-visual">
          <span />
          <span />
          <span />
          <strong>Governed access</strong>
        </div>
      </section>
    </main>
  );
}
