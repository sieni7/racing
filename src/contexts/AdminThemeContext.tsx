import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

interface AdminThemeContextValue {
  adminDark: boolean;
  toggleAdminDark: () => void;
}

const AdminThemeContext = createContext<AdminThemeContextValue>({ adminDark: false, toggleAdminDark: () => {} });

export function AdminThemeProvider({ children }: { children: ReactNode }) {
  const [adminDark, setAdminDark] = useState(() => {
    try { return localStorage.getItem('rcb_admin_theme') === 'dark'; } catch { return false; }
  });

  useEffect(() => {
    localStorage.setItem('rcb_admin_theme', adminDark ? 'dark' : 'light');
    document.documentElement.classList.toggle('admin-dark', adminDark);
  }, [adminDark]);

  return (
    <AdminThemeContext.Provider value={{ adminDark, toggleAdminDark: () => setAdminDark(prev => !prev) }}>
      {children}
    </AdminThemeContext.Provider>
  );
}

export function useAdminTheme() {
  return useContext(AdminThemeContext);
}
