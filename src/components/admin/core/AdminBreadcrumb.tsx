import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const labelMap: Record<string, string> = {
  admin: 'Admin',
  players: 'Joueurs',
  matches: 'Matchs',
  news: 'Actualités',
  staff: 'Staff',
  gallery: 'Galerie',
  standings: 'Classement',
  'send-push': 'Push',
  activity: 'Activité',
  'top-scorers': 'Meilleurs buteurs',
  'players-of-month': 'Joueurs du mois',
};

export function AdminBreadcrumb() {
  const location = useLocation();
  const parts = location.pathname.split('/').filter(Boolean);

  const crumbs = parts.map((part, i) => {
    const path = '/' + parts.slice(0, i + 1).join('/');
    const label = labelMap[part] || part.charAt(0).toUpperCase() + part.slice(1);
    const isLast = i === parts.length - 1;
    return { path, label, isLast };
  });

  if (crumbs.length <= 1) return null;

  return (
    <nav className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 mb-4">
      {crumbs.map((crumb, i) => (
        <React.Fragment key={crumb.path}>
          {i > 0 && (
            <svg className="w-3.5 h-3.5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          )}
          {crumb.isLast ? (
            <span className="text-gray-900 dark:text-white font-medium">{crumb.label}</span>
          ) : (
            <Link to={crumb.path} className="hover:text-primary transition-colors">{crumb.label}</Link>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
}
