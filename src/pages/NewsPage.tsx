import { useEffect, useState } from 'react';
import type { NewsItem } from '../types';
import { getNews } from '../lib/news';
import NewsCard from '../components/ui/NewsCard';
import { ListSkeleton } from '../components/ui/Skeleton';

const PER_PAGE = 5;

export default function NewsPage() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const totalPages = Math.ceil(total / PER_PAGE);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const result = await getNews(page, PER_PAGE);
        setNews(result.news);
        setTotal(result.count);
      } catch (err) {
        console.error('Erreur chargement NewsPage:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [page]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <h1 className="font-display text-3xl font-bold text-gray-900 dark:text-white mb-2">Actualités</h1>
      <p className="text-gray-500 dark:text-gray-400 mb-8">{total} articles</p>

      {loading ? (
        <ListSkeleton count={PER_PAGE} />
      ) : news.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {news.map((item) => (
              <NewsCard key={item.id} news={item} />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-12">
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
        <p className="text-center py-12 text-gray-500 dark:text-gray-400">Aucune actualité publiée.</p>
      )}
    </div>
  );
}
