import { useEffect, useState } from 'react';
import type { Standing } from '../types';
import { getStandings, getSeasons } from '../lib/standings';

const formColors: Record<string, string> = {
  V: 'bg-green-500',
  N: 'bg-yellow-400',
  D: 'bg-red-500',
};

export default function StandingsPage() {
  const [standings, setStandings] = useState<Standing[]>([]);
  const [seasons, setSeasons] = useState<string[]>([]);
  const [season, setSeason] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      try {
        const allSeasons = await getSeasons();
        setSeasons(allSeasons);
        const latest = allSeasons[0] || '';
        setSeason(latest);
        const data = await getStandings(latest);
        setStandings(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  useEffect(() => {
    if (!season) return;
    setLoading(true);
    getStandings(season)
      .then(setStandings)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [season]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="animate-pulse space-y-6">
          <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-48" />
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-32" />
          <div className="space-y-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-4xl font-black text-gray-900 dark:text-white">Classement</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">{standings.length} équipes</p>
        </div>
        {seasons.length > 1 && (
          <div className="flex gap-2">
            {seasons.map(s => (
              <button
                key={s}
                onClick={() => setSeason(s)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  season === s
                    ? 'bg-primary text-white shadow-md'
                    : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-primary'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        )}
      </div>

      {standings.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-5xl mb-4">🏆</p>
          <p className="text-gray-600 dark:text-gray-300">Aucune donnée pour cette saison.</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-100 dark:border-gray-700">
                  {['Pos', 'Équipe', 'J', 'V', 'N', 'D', 'BP', 'BC', 'Diff', 'Pts', 'Forme'].map(h => (
                    <th key={h} className="px-4 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {standings.map((team, idx) => (
                  <tr
                    key={team.id}
                    className={`hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors ${
                      idx < 3 ? 'bg-green-50/50 dark:bg-green-900/10' : ''
                    } ${idx === standings.length - 1 ? 'bg-red-50/50 dark:bg-red-900/10' : ''}`}
                  >
                    <td className="px-4 py-4">
                      <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${
                        idx === 0 ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                        idx === 1 ? 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-300' :
                        idx === 2 ? 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400' :
                        'text-gray-600 dark:text-gray-400'
                      }`}>{idx + 1}</span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="font-semibold text-gray-900 dark:text-white">{team.team_name}</span>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-600 dark:text-gray-400">{team.played}</td>
                    <td className="px-4 py-4 text-sm text-green-600 dark:text-green-400 font-medium">{team.won}</td>
                    <td className="px-4 py-4 text-sm text-yellow-600 dark:text-yellow-400 font-medium">{team.drawn}</td>
                    <td className="px-4 py-4 text-sm text-red-600 dark:text-red-400 font-medium">{team.lost}</td>
                    <td className="px-4 py-4 text-sm text-gray-600 dark:text-gray-400">{team.goals_for}</td>
                    <td className="px-4 py-4 text-sm text-gray-600 dark:text-gray-400">{team.goals_against}</td>
                    <td className={`px-4 py-4 text-sm font-bold ${
                      team.goal_diff > 0 ? 'text-green-600 dark:text-green-400' :
                      team.goal_diff < 0 ? 'text-red-600 dark:text-red-400' :
                      'text-gray-600 dark:text-gray-400'
                    }`}>
                      {team.goal_diff > 0 ? '+' : ''}{team.goal_diff}
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-xl font-black text-primary">{team.points}</span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex gap-1">
                        {(team.form || '').split('').map((letter, i) => (
                          <span
                            key={i}
                            className={`w-5 h-5 rounded-sm flex items-center justify-center text-[10px] font-bold text-white ${
                              formColors[letter] || 'bg-gray-400'
                            }`}
                          >
                            {letter}
                          </span>
                        ))}
                        {!team.form && <span className="text-xs text-gray-400">-</span>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
