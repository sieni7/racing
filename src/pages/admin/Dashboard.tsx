import React, { useEffect, useState } from 'react';
import { useAdmin } from '../../contexts/AdminContext';

export const Dashboard: React.FC = () => {
  const { players, matches, news, staff, fetchPlayers, fetchMatches, fetchNews, fetchStaff } = useAdmin();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      await Promise.all([
        fetchPlayers(),
        fetchMatches(),
        fetchNews(),
        fetchStaff(),
      ]);
      setLoading(false);
    };
    fetchStats();
  }, [fetchPlayers, fetchMatches, fetchNews, fetchStaff]);

  const stats = [
    { label: 'Joueurs', value: players.length, icon: '👤', color: 'bg-blue-100 dark:bg-blue-900/30' },
    { label: 'Matchs', value: matches.length, icon: '⚽', color: 'bg-green-100 dark:bg-green-900/30' },
    { label: 'Actualités', value: news.length, icon: '📰', color: 'bg-orange-100 dark:bg-orange-900/30' },
    { label: 'Staff', value: staff.length, icon: '👥', color: 'bg-purple-100 dark:bg-purple-900/30' },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-display font-bold">Tableau de bord</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.label} className={`${stat.color} p-6 rounded-2xl`}>
            <div className="flex items-center gap-4">
              <span className="text-3xl">{stat.icon}</span>
              <div>
                <p className="text-2xl font-bold">{loading ? '...' : stat.value}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
        <h2 className="text-xl font-display font-bold mb-4">Bienvenue dans l'administration</h2>
        <p className="text-gray-700 dark:text-gray-300">
          Gérez les joueurs, matchs, actualités et staff du Racing Club de Bingerville.
        </p>
      </div>
    </div>
  );
};

export default Dashboard;