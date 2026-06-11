import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Zap, LayoutDashboard, ListTodo, CheckCircle2, Settings, Lightbulb } from 'lucide-react';
import { useAuth } from '../AuthContext';

export default function Layout({ children, tasks = [] }) {
  const { user } = useAuth();
  const navigate = useNavigate();

  const total = tasks.length;
  const completed = tasks.filter((t) => t.completed).length;
  const pending = total - completed;
  const pct = total === 0 ? 0 : Math.round((completed / total) * 100);

  const initials = user?.name
    ? user.name
        .split(' ')
        .map((p) => p[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'U';

  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, badge: null },
    { to: '/pending', label: 'Pending Tasks', icon: ListTodo, badge: pending || null },
    { to: '/completed', label: 'Completed Tasks', icon: CheckCircle2, badge: completed || null },
  ];

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">
            <Zap size={18} fill="currentColor" />
          </div>
          <span className="brand-name">Task Manager</span>
        </div>

        <div className="user-greeting">
          <div className="user-avatar">{initials}</div>
          <div className="user-greeting-text">
            <div className="greet-name">Hey, {user?.name?.split(' ')[0] || 'there'}</div>
            <div className="greet-sub">Let's crush some tasks!</div>
          </div>
        </div>

        <div className="productivity-block">
          <div className="productivity-label">
            <span>Productivity</span>
            <span className="pct">{pct}%</span>
          </div>
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${pct}%` }} />
          </div>
        </div>

        <nav className="nav">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
            >
              <item.icon size={18} />
              {item.label}
              {item.badge ? <span className="nav-badge">{item.badge}</span> : null}
            </NavLink>
          ))}
          <NavLink to="/settings" className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
            <Settings size={18} />
            Account Settings
          </NavLink>
        </nav>

        <div className="sidebar-footer">
          <div className="tip-card">
            <div className="tip-card-icon">
              <Lightbulb size={16} />
            </div>
            <h4>Pro tip</h4>
            <p>Use keyboard shortcuts to add tasks faster and boost your productivity.</p>
          </div>
        </div>
      </aside>

      <main className="main-content">{children}</main>

      <nav className="mobile-nav">
        {navItems.map((item) => (
          <NavLink key={item.to} to={item.to} className={({ isActive }) => `mobile-nav-item${isActive ? ' active' : ''}`}>
            <item.icon size={20} />
            {item.label.split(' ')[0]}
          </NavLink>
        ))}
        <NavLink to="/settings" className={({ isActive }) => `mobile-nav-item${isActive ? ' active' : ''}`}>
          <Settings size={20} />
          Settings
        </NavLink>
      </nav>
    </div>
  );
}
