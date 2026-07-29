import { Bell, Database, Moon, Sun } from 'lucide-react';
import { PageHeader } from '../components/PageHeader.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import { API_BASE } from '../services/api.js';

export function SettingsPage() {
  const { theme, setTheme } = useTheme();

  return (
    <>
      <PageHeader eyebrow="Workspace" title="Settings" />

      <section className="settings-grid">
        <article className="panel">
          <div className="panel-header">
            <h2>Appearance</h2>
            {theme === 'dark' ? <Moon size={20} /> : <Sun size={20} />}
          </div>
          <div className="segmented-control" role="group" aria-label="Theme">
            <button className={theme === 'light' ? 'active' : ''} type="button" onClick={() => setTheme('light')}>
              <Sun size={17} />
              Light
            </button>
            <button className={theme === 'dark' ? 'active' : ''} type="button" onClick={() => setTheme('dark')}>
              <Moon size={17} />
              Dark
            </button>
          </div>
        </article>
        <article className="panel">
          <div className="panel-header">
            <h2>Notifications</h2>
            <Bell size={20} />
          </div>
          <label className="toggle-row">
            <span>Warranty expiry alerts</span>
            <input type="checkbox" defaultChecked />
          </label>
          <label className="toggle-row">
            <span>Service due alerts</span>
            <input type="checkbox" defaultChecked />
          </label>
          <label className="toggle-row">
            <span>Return overdue alerts</span>
            <input type="checkbox" defaultChecked />
          </label>
        </article>
        <article className="panel">
          <div className="panel-header">
            <h2>API</h2>
            <Database size={20} />
          </div>
          <label>
            Base URL
            <input value={API_BASE} readOnly />
          </label>
        </article>
      </section>
    </>
  );
}
