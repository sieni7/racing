import React, { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const navItems = [
  { path: '/admin', label: 'Dashboard', icon: '📊' },
  { path: '/admin/players', label: 'Joueurs', icon: '👤' },
  { path: '/admin/matches', label: 'Matchs', icon: '⚽' },
  { path: '/admin/news', label: 'Actualités', icon: '📰' },
  { path: '/admin/staff', label: 'Staff', icon: '👥' },
];

export const AdminLayout: React.FC = () => {
  const { signOut } = useAuth();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      <aside className={`bg-white dark:bg-gray-800 shadow-lg transition-all duration-300 ${collapsed ? 'w-20' : 'w-64'} flex flex-col`}>
        <div className="p-4 border-b dark:border-gray-700 flex justify-between items-center">
          {!collapsed && <span className="font-display font-bold text-primary">Admin</span>}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
          >
            {collapsed ? '→' : '←'}
          </button>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                location.pathname === item.path
                  ? 'bg-primary text-white'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              {!collapsed && <span>{item.label}</span>}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t dark:border-gray-700">
          <button
            onClick={signOut}
            className="w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
          >
            {collapsed ? '🚪' : 'Déconnexion'}
          </button>
        </div>
      </aside>

      <main className="flex-1 p-6 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
};