import { useEffect, useState } from 'react';
import type { Match } from '../types';
import { getMatches } from '../lib/matches';
import MatchCard from '../components/ui/MatchCard';
import { ListSkeleton } from '../components/ui/Skeleton';

export default function MatchsPage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'finished'>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await getMatches();
        setMatches(data);
      } catch (err) {
        console.error('Erreur chargement MatchsPage:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filtered = filter === 'all' ? matches : matches.filter((m) => m.status === filter);

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold text-gray-900 dark:text-white">Matchs</h1>
          <p className="text-gray-500 dark:text-gray-400">{matches.length} matchs</p>
        </div>

        <div className="flex gap-2">
          {(['all', 'upcoming', 'finished'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === f
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {f === 'all' ? 'Tous' : f === 'upcoming' ? 'À venir' : 'Terminés'}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="space-y-4"><ListSkeleton count={4} /></div>
      ) : filtered.length > 0 ? (
        <div className="space-y-4">
          {filtered.map((match) => (
            <MatchCard key={match.id} match={match} />
          ))}
        </div>
      ) : (
        <p className="text-center py-12 text-gray-500 dark:text-gray-400">Aucun match trouvé.</p>
      )}
    </div>
  );
}
