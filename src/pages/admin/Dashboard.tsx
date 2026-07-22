import React, { useEffect, useState } from 'react';
import { getAllPlayers } from '../../lib/players';
import { getAllMatches } from '../../lib/matches';
import { getPublishedNews } from '../../lib/news';
import { getAllStaff } from '../../lib/staff';

interface Stat {
  label: string;
  value: number;
  icon: string;
  color: string;
}

export const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<Stat[]>([
    { label: 'Joueurs', value: 0, icon: '👤', color: 'bg-blue-100 dark:bg-blue-900/30' },
    { label: 'Matchs', value: 0, icon: '⚽', color: 'bg-green-100 dark:bg-green-900/30' },
    { label: 'Actualités', value: 0, icon: '📰', color: 'bg-orange-100 dark:bg-orange-900/30' },
    { label: 'Staff', value: 0, icon: '👥', color: 'bg-purple-100 dark:bg-purple-900/30' },
  ]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      const [players, matches, news, staff] = await Promise.all([
        getAllPlayers(),
        getAllMatches(),
        getPublishedNews(),
        getAllStaff(),
      ]);
      setStats([
        { ...stats[0], value: players.data?.length || 0 },
        { ...stats[1], value: matches.data?.length || 0 },
        { ...stats[2], value: news.data?.length || 0 },
        { ...stats[3], value: staff.data?.length || 0 },
      ]);
      setLoading(false);
    };
    fetchStats();
  }, []);

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