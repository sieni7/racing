import React from 'react';

interface BadgeProps {
  status: 'scheduled' | 'live' | 'finished' | 'postponed' | 'cancelled' | 'win' | 'loss' | 'draw';
}

const Badge: React.FC<BadgeProps> = ({ status }) => {
  const config: Record<string, { label: string; className: string }> = {
    scheduled: { label: '📅 À venir', className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' },
    live: { label: '🔴 En cours', className: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 animate-pulse' },
    finished: { label: '✅ Terminé', className: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200' },
    win: { label: '🏆 Victoire', className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' },
    loss: { label: '❌ Défaite', className: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' },
    draw: { label: '🤝 Nul', className: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' },
    postponed: { label: '⏳ Reporté', className: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' },
    cancelled: { label: '🚫 Annulé', className: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200' },
  };
  const { label, className } = config[status] || config.scheduled;
  return <span className={`px-3 py-1 rounded-full text-sm font-semibold ${className}`}>{label}</span>;
};

export default Badge;
