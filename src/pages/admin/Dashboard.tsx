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
    { label: 'Joueurs', value: players.length, icon: '👤', bg: 'from-blue-500 to-blue-600' },
    { label: 'Matchs', value: matches.length, icon: '⚽', bg: 'from-green-500 to-green-600' },
    { label: 'Actualités', value: news.length, icon: '📰', bg: 'from-orange-500 to-orange-600' },
    { label: 'Staff', value: staff.length, icon: '👥', bg: 'from-purple-500 to-purple-600' },
  ];

  const finished = matches.filter(m => m.status === 'finished');
  const winRate = finished.length
    ? Math.round((finished.filter(m => (m.racing_score ?? 0) > (m.opponent_score ?? 0)).length / finished.length) * 100)
    : 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-display font-black">Tableau de bord</h1>
        <p className="text-gray-600 dark:text-gray-300 mt-1">Vue d'ensemble du Racing Club de Bingerville</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${stat.bg} p-6 text-white shadow-lg`}
          >
            <div className="absolute top-0 right-0 text-6xl opacity-10">{stat.icon}</div>
            <p className="text-4xl font-black">{loading ? '...' : stat.value}</p>
            <p className="text-white/80 mt-1 font-medium">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
          <h2 className="text-lg font-display font-bold mb-4 flex items-center gap-2">
            <span className="w-1 h-5 bg-primary rounded-full inline-block" />
            Résumé de la saison
          </h2>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-black text-gray-900 dark:text-white">{matches.length}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Matchs</p>
            </div>
            <div>
              <p className="text-2xl font-black text-green-600">{winRate}%</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Victoires</p>
            </div>
            <div>
              <p className="text-2xl font-black text-primary">{finished.length}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Terminés</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
          <h2 className="text-lg font-display font-bold mb-4 flex items-center gap-2">
            <span className="w-1 h-5 bg-primary rounded-full inline-block" />
            Actions rapides
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <a href="/admin/players" className="px-4 py-3 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-xl text-sm font-medium hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors text-center">
              + Joueur
            </a>
            <a href="/admin/matches" className="px-4 py-3 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-xl text-sm font-medium hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors text-center">
              + Match
            </a>
            <a href="/admin/news" className="px-4 py-3 bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 rounded-xl text-sm font-medium hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-colors text-center">
              + Article
            </a>
            <a href="/admin/staff" className="px-4 py-3 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 rounded-xl text-sm font-medium hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors text-center">
              + Staff
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
