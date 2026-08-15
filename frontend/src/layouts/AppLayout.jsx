import { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  Archive,
  Boxes,
  Building2,
  ChartColumnBig,
  ChevronLeft,
  LayoutDashboard,
  LogOut,
  Menu,
  Moon,
  PackagePlus,
  Repeat2,
  Settings,
  Sun,
  Tags,
  UserRound,
  Users,
  Wrench
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import { initials } from '../utils/format.js';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, group: 'Overview' },
  { to: '/assets', label: 'Asset register', icon: Boxes, group: 'Inventory' },
  { to: '/assets/new', label: 'Add asset', icon: PackagePlus, group: 'Inventory', roles: ['Admin', 'Asset Manager'] },
  { to: '/categories', label: 'Categories', icon: Tags, group: 'Inventory' },
  { to: '/assignments', label: 'Assignments', icon: Repeat2, group: 'Operations' },
  { to: '/returns', label: 'Returns', icon: Archive, group: 'Operations', roles: ['Admin', 'Asset Manager'] },
  { to: '/maintenance', label: 'Maintenance', icon: Wrench, group: 'Operations' },
  { to: '/reports', label: 'Reports', icon: ChartColumnBig, group: 'Insights', roles: ['Admin', 'Asset Manager'] },
  { to: '/users', label: 'Users', icon: Users, group: 'Workspace', roles: ['Admin'] },
  { to: '/profile', label: 'Profile', icon: UserRound, group: 'Workspace' },
  { to: '/settings', label: 'Settings', icon: Settings, group: 'Workspace' }
];

const navGroups = ['Overview', 'Inventory', 'Operations', 'Insights', 'Workspace'];

export function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { logout, user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const visibleItems = navItems.filter((item) => !item.roles || item.roles.includes(user?.role));
  const currentItem = [...visibleItems]
    .sort((first, second) => second.to.length - first.to.length)
    .find((item) => location.pathname === item.to || location.pathname.startsWith(`${item.to}/`));

  useEffect(() => {
    if (!sidebarOpen) return undefined;

    const closeOnEscape = (event) => {
      if (event.key === 'Escape') setSidebarOpen(false);
    };

    document.addEventListener('keydown', closeOnEscape);
    document.body.classList.add('nav-open');

    return () => {
      document.removeEventListener('keydown', closeOnEscape);
      document.body.classList.remove('nav-open');
    };
  }, [sidebarOpen]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">
        Skip to main content
      </a>
      <button
        className={`nav-backdrop ${sidebarOpen ? 'visible' : ''}`}
        type="button"
        aria-label="Close navigation"
        tabIndex={sidebarOpen ? 0 : -1}
        onClick={() => setSidebarOpen(false)}
      />
      <aside id="primary-navigation" className={`sidebar ${sidebarOpen ? 'open' : ''}`} aria-label="Primary navigation">
        <div className="brand-lockup">
          <div className="brand-mark">
            <Building2 size={22} aria-hidden="true" />
          </div>
          <div>
            <strong>AssetOrbit</strong>
            <span>EAM Console</span>
          </div>
          <button
            className="icon-button sidebar-collapse"
            type="button"
            aria-label="Close navigation"
            onClick={() => setSidebarOpen(false)}
          >
            <ChevronLeft size={18} />
          </button>
        </div>
        <nav className="sidebar-nav" aria-label="AssetOrbit sections">
          {navGroups.map((group) => {
            const groupItems = visibleItems.filter((item) => item.group === group);

            if (!groupItems.length) return null;

            return (
              <div className="nav-group" key={group}>
                <span className="nav-group-label">{group}</span>
                {groupItems.map((item) => {
                  const Icon = item.icon;

                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      end={item.to === '/assets'}
                      onClick={() => setSidebarOpen(false)}
                    >
                      <Icon size={18} aria-hidden="true" />
                      <span>{item.label}</span>
                    </NavLink>
                  );
                })}
              </div>
            );
          })}
        </nav>
        <div className="sidebar-meta">
          <span>Workspace</span>
          <strong>Asset lifecycle</strong>
        </div>
      </aside>

      <div className="workspace">
        <header className="topbar">
          <button
            className="icon-button menu-button"
            type="button"
            aria-label="Open navigation"
            aria-controls="primary-navigation"
            aria-expanded={sidebarOpen}
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={20} aria-hidden="true" />
          </button>
          <div className="topbar-title">
            <span>Asset operations / {currentItem?.group || 'Workspace'}</span>
            <strong>{currentItem?.label || 'AssetOrbit'}</strong>
          </div>
          <div className="topbar-actions">
            <button
              className="icon-button"
              type="button"
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
              title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
              onClick={toggleTheme}
            >
              {theme === 'dark' ? <Sun size={19} aria-hidden="true" /> : <Moon size={19} aria-hidden="true" />}
            </button>
            <div className="user-chip">
              <span>{initials(user?.name)}</span>
              <div>
                <strong>{user?.name}</strong>
                <small>{user?.email}</small>
              </div>
            </div>
            <button className="icon-button" type="button" aria-label="Log out" title="Log out" onClick={handleLogout}>
              <LogOut size={19} aria-hidden="true" />
            </button>
          </div>
        </header>
        <main id="main-content" className="content" tabIndex="-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
