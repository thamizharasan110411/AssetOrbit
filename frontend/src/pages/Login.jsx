import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { ArrowRight, Building2, Lock, Mail } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';

export function Login() {
  const [form, setForm] = useState({
    email: 'admin@assetorbit.local',
    password: 'Password123!'
  });
  const [loading, setLoading] = useState(false);
  const { login, isAuthenticated } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/dashboard';

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const submit = async (event, override = null) => {
    event?.preventDefault();
    setLoading(true);

    try {
      await login(override || form);
      addToast('Welcome back to AssetOrbit.');
      navigate(from, { replace: true });
    } catch (error) {
      addToast(error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const demoLogin = (email) => {
    const credentials = { email, password: 'Password123!' };
    setForm(credentials);
    submit(null, credentials);
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
        <h1>Sign in</h1>
        <form onSubmit={submit} className="auth-form">
          <label>
            Email
            <span className="input-icon">
              <Mail size={17} />
              <input
                type="email"
                value={form.email}
                onChange={(event) => setForm({ ...form, email: event.target.value })}
                required
              />
            </span>
          </label>
          <label>
            Password
            <span className="input-icon">
              <Lock size={17} />
              <input
                type="password"
                value={form.password}
                onChange={(event) => setForm({ ...form, password: event.target.value })}
                required
              />
            </span>
          </label>
          <button className="btn btn-primary icon-text w-100" type="submit" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign in'}
            <ArrowRight size={17} />
          </button>
        </form>
        <div className="demo-logins">
          <button type="button" onClick={() => demoLogin('admin@assetorbit.local')}>
            Admin
          </button>
          <button type="button" onClick={() => demoLogin('manager@assetorbit.local')}>
            Manager
          </button>
          <button type="button" onClick={() => demoLogin('employee@assetorbit.local')}>
            Employee
          </button>
        </div>
        <p className="auth-link">
          New workspace? <Link to="/register">Create the first account</Link>
        </p>
      </section>
      <section className="auth-side">
        <div className="orbit-visual">
          <span />
          <span />
          <span />
          <strong>Lifecycle visibility</strong>
        </div>
      </section>
    </main>
  );
}
