import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const navItems = [
  { to: '/dashboard',  label: 'Dashboard',           icon: '◈' },
  { to: '/clients',    label: 'Clients',              icon: '◉' },
  { to: '/employees',  label: 'Employees',            icon: '◎' },
  { to: '/payments',   label: 'Payments & Expenses',  icon: '◆' },
  { to: '/reports',    label: 'Reports',              icon: '◇' },
  { to: '/settings',   label: 'Settings',             icon: '◐' },
];

export default function Sidebar({ collapsed, setCollapsed }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <>
      {!collapsed && (
        <div className="fixed inset-0 bg-black/70 z-20 lg:hidden" onClick={() => setCollapsed(true)} />
      )}

      <aside className={`
        fixed left-0 top-0 h-full z-30 transition-all duration-300 flex flex-col
        bg-[#0c0c0c] border-r border-[#1e1e1e]
        ${collapsed ? '-translate-x-full lg:translate-x-0 lg:w-16' : 'translate-x-0 w-64'}
      `}>
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 border-b border-[#1e1e1e] min-h-[64px]">
          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center flex-shrink-0">
            <span className="text-black font-bold text-sm">V</span>
          </div>
          {!collapsed && (
            <div>
              <div className="font-bold text-white text-sm tracking-tight">Vybrex CRM</div>
              <div className="text-xs text-zinc-600">Business Manager</div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `sidebar-link ${isActive ? 'active' : ''} ${collapsed ? 'justify-center px-2' : ''}`
              }
              title={collapsed ? item.label : undefined}
            >
              <span className="text-base flex-shrink-0 font-mono">{item.icon}</span>
              {!collapsed && <span>{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* User + Logout */}
        <div className="p-3 border-t border-[#1e1e1e]">
          {!collapsed && (
            <div className="flex items-center gap-3 px-3 py-2 mb-1">
              <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center flex-shrink-0">
                <span className="text-black text-xs font-bold">{user?.name?.[0]?.toUpperCase()}</span>
              </div>
              <div className="min-w-0">
                <div className="text-sm font-semibold text-white truncate">{user?.name}</div>
                <div className="text-xs text-zinc-600 uppercase tracking-wider">{user?.role}</div>
              </div>
            </div>
          )}
          <button
            onClick={handleLogout}
            className={`sidebar-link w-full text-red-500 hover:text-red-400 hover:bg-red-500/10 ${collapsed ? 'justify-center px-2' : ''}`}
            title={collapsed ? 'Logout' : undefined}
          >
            <span className="flex-shrink-0 text-base">↪</span>
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
