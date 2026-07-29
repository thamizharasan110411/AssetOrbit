import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
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
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/assets', label: 'Assets', icon: Boxes },
  { to: '/assets/new', label: 'Add Asset', icon: PackagePlus, roles: ['Admin', 'Asset Manager'] },
  { to: '/categories', label: 'Categories', icon: Tags },
  { to: '/assignments', label: 'Assignments', icon: Repeat2 },
  { to: '/returns', label: 'Returns', icon: Archive, roles: ['Admin', 'Asset Manager'] },
  { to: '/maintenance', label: 'Maintenance', icon: Wrench },
  { to: '/reports', label: 'Reports', icon: ChartColumnBig, roles: ['Admin', 'Asset Manager'] },
  { to: '/users', label: 'Users', icon: Users, roles: ['Admin'] },
  { to: '/profile', label: 'Profile', icon: UserRound },
  { to: '/settings', label: 'Settings', icon: Settings }
];

export function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { logout, user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const visibleItems = navItems.filter((item) => !item.roles || item.roles.includes(user?.role));

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="app-shell">
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="brand-lockup">
          <div className="brand-mark">
            <Building2 size={22} />
          </div>
          <div>
            <strong>AssetOrbit</strong>
            <span>EAM Console</span>
          </div>
          <button className="icon-button sidebar-collapse" type="button" onClick={() => setSidebarOpen(false)}>
            <ChevronLeft size={18} />
          </button>
        </div>
        <nav className="sidebar-nav">
          {visibleItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink key={item.to} to={item.to} onClick={() => setSidebarOpen(false)}>
                <Icon size={18} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </aside>

      <div className="workspace">
        <header className="topbar">
          <button className="icon-button menu-button" type="button" aria-label="Open menu" onClick={() => setSidebarOpen(true)}>
            <Menu size={20} />
          </button>
          <div className="topbar-title">
            <span>{user?.department || 'Enterprise'}</span>
            <strong>{user?.role}</strong>
          </div>
          <div className="topbar-actions">
            <button className="icon-button" type="button" aria-label="Toggle theme" onClick={toggleTheme}>
              {theme === 'dark' ? <Sun size={19} /> : <Moon size={19} />}
            </button>
            <div className="user-chip">
              <span>{initials(user?.name)}</span>
              <div>
                <strong>{user?.name}</strong>
                <small>{user?.email}</small>
              </div>
            </div>
            <button className="icon-button" type="button" aria-label="Log out" onClick={handleLogout}>
              <LogOut size={19} />
            </button>
          </div>
        </header>
        <main className="content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
