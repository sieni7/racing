import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { NewsItem } from '../types';
import { getNews } from '../lib/news';
import NewsCard from '../components/ui/NewsCard';
import { ListSkeleton } from '../components/ui/Skeleton';
import SEOHead from '../components/SEOHead';

const PER_PAGE = 9;

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

  const featured = !loading && page === 1 && news[0];
  const remaining = featured ? news.slice(1) : news;

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <SEOHead title="Actualités" description="Toute l'actualité du Racing Club de Bingerville." />
      <div className="mb-8">
        <h1 className="font-display text-4xl font-black text-gray-900 dark:text-white">Actualités</h1>
        <p className="text-gray-600 dark:text-gray-300 mt-1">{total} articles</p>
      </div>

      {loading ? (
        <ListSkeleton count={6} />
      ) : news.length > 0 ? (
        <>
          {featured && (
            <div className="mb-12">
              <Link
                to={`/news/${featured.slug}`}
                className="group block relative h-72 md:h-96 rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-800"
              >
                {featured.cover_image_url ? (
                  <img
                    src={featured.cover_image_url}
                    alt={featured.title}
                    loading="eager"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400 text-4xl">RCB</div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-8">
                  <p className="text-sm text-white/60 mb-2">
                    {new Date(featured.published_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                  <h2 className="font-display text-2xl md:text-3xl font-bold text-white mb-2">{featured.title}</h2>
                  {featured.excerpt && <p className="text-white/70 line-clamp-2 max-w-2xl">{featured.excerpt}</p>}
                </div>
              </Link>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {remaining.map((item) => (
              <NewsCard key={item.id} news={item} />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 mt-12">
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
          <p className="text-5xl mb-4">📰</p>
          <p className="text-gray-600 dark:text-gray-300">Aucune actualité publiée.</p>
        </div>
      )}
    </div>
  );
}
