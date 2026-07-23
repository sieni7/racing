import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { AdminSidebar } from './AdminSidebar';
import { AdminHeader } from './AdminHeader';
import { AdminBreadcrumb } from './AdminBreadcrumb';
import { ReadOnlyBanner } from '../ReadOnlyBanner';
import { useKeyboardShortcuts } from '../../../hooks/useKeyboardShortcuts';

export const AdminLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(() => {
    try { return localStorage.getItem('rcb_sidebar_collapsed') === 'true'; } catch { return false; }
  });
  const [mobileOpen, setMobileOpen] = useState(false);

  const toggleCollapsed = () => {
    setCollapsed(prev => {
      const next = !prev;
      localStorage.setItem('rcb_sidebar_collapsed', String(next));
      return next;
    });
  };

  useKeyboardShortcuts([
    { key: 'b', ctrl: true, handler: () => toggleCollapsed() },
  ]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      <AdminSidebar
        collapsed={collapsed}
        onToggle={toggleCollapsed}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader onMenuToggle={() => setMobileOpen(true)} />
        <ReadOnlyBanner />
        <main className="flex-1 p-4 md:p-6 overflow-auto">
          <AdminBreadcrumb />
          <Outlet />
        </main>
      </div>
    </div>
  );
};
