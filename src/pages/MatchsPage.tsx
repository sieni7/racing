import { useEffect, useState } from 'react';
import type { Match } from '../types';
import { getUpcomingMatches, getPastMatches, getAllMatchesPaginated } from '../lib/matches';
import MatchCard from '../components/ui/MatchCard';
import { ListSkeleton } from '../components/ui/Skeleton';
import SEOHead from '../components/SEOHead';

type Tab = 'all' | 'upcoming' | 'finished';

export default function MatchsPage() {
  const [tab, setTab] = useState<Tab>('all');
  const [matches, setMatches] = useState<Match[]>([]);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const perPage = 12;

  useEffect(() => { setPage(1); }, [tab]);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        if (tab === 'upcoming') {
          const data = await getUpcomingMatches(50);
          setMatches(data);
          setCount(data.length);
        } else {
          const fn = tab === 'finished' ? getPastMatches : getAllMatchesPaginated;
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

  const tabs = [
    { key: 'all' as Tab, label: 'Tous', icon: '📋' },
    { key: 'upcoming' as Tab, label: 'À venir', icon: '📅' },
    { key: 'finished' as Tab, label: 'Terminés', icon: '✅' },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <SEOHead title="Matchs" description="Calendrier et résultats des matchs du Racing Club de Bingerville." />
      <div className="mb-8">
        <h1 className="font-display text-4xl font-black text-gray-900 dark:text-white">Matchs</h1>
        <p className="text-gray-600 dark:text-gray-300 mt-1">{count} matchs</p>
      </div>

      <div className="flex gap-2 mb-8 bg-gray-100 dark:bg-gray-800 p-1.5 rounded-xl w-fit">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
              tab === t.key
                ? 'bg-white dark:bg-gray-700 text-primary shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            {t.icon} {t.label}
          </button>
        ))}
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
            <div className="flex items-center justify-center gap-4 mt-10">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="px-5 py-2.5 rounded-xl text-sm font-medium bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-primary hover:text-primary transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                ← Précédent
              </button>
              <span className="text-sm text-gray-500 dark:text-gray-400 px-4">
                Page <strong>{page}</strong> / {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="px-5 py-2.5 rounded-xl text-sm font-medium bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-primary hover:text-primary transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Suivant →
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-20">
          <p className="text-5xl mb-4">⚽</p>
          <p className="text-gray-600 dark:text-gray-300">Aucun match trouvé.</p>
        </div>
      )}
    </div>
  );
}
