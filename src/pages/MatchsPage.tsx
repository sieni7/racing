import { useEffect, useState } from 'react';
import type { Match } from '../types';
import { getUpcomingMatches, getPastMatches, getAllMatches } from '../lib/matches';
import MatchCard from '../components/ui/MatchCard';
import { ListSkeleton } from '../components/ui/Skeleton';

type Tab = 'all' | 'upcoming' | 'finished';

export default function MatchsPage() {
  const [tab, setTab] = useState<Tab>('all');
  const [matches, setMatches] = useState<Match[]>([]);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const perPage = 12;

  useEffect(() => {
    setPage(1);
  }, [tab]);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        if (tab === 'upcoming') {
          const data = await getUpcomingMatches(50);
          setMatches(data);
          setCount(data.length);
        } else {
          const fn = tab === 'finished' ? getPastMatches : getAllMatches;
          const { matches: data, count: total } = await fn(page, perPage);
          setMatches(data);
          setCount(total);
        }
      } catch (err) {
        console.error('Erreur chargement matchs:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [tab, page]);

  const totalPages = Math.ceil(count / perPage);

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold text-gray-900 dark:text-white">Matchs</h1>
          <p className="text-gray-500 dark:text-gray-400">{count} matchs</p>
        </div>

        <div className="flex gap-2">
          {(['all', 'upcoming', 'finished'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setTab(f)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                tab === f
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
      ) : matches.length > 0 ? (
        <>
          <div className="space-y-4">
            {matches.map((match) => (
              <MatchCard key={match.id} match={match} />
            ))}
          </div>
          {tab !== 'upcoming' && totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 mt-8">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                ← Précédent
              </button>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Page {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Suivant →
              </button>
            </div>
          )}
        </>
      ) : (
        <p className="text-center py-12 text-gray-500 dark:text-gray-400">Aucun match trouvé.</p>
      )}
    </div>
  );
}
