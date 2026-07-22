import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { Match, NewsItem } from '../types';
import { getUpcomingMatches } from '../lib/matches';
import { getRecentNews } from '../lib/news';
import MatchCard from '../components/ui/MatchCard';
import NewsCard from '../components/ui/NewsCard';
import HeroCarousel from '../components/ui/HeroCarousel';
import { CardSkeleton } from '../components/ui/Skeleton';

export default function HomePage() {
  const [upcomingMatch, setUpcomingMatch] = useState<Match | null>(null);
  const [recentNews, setRecentNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [matches, news] = await Promise.all([
          getUpcomingMatches(),
          getRecentNews(3),
        ]);
        setUpcomingMatch(matches[0] ?? null);
        setRecentNews(news);
      } catch (err) {
        console.error('Erreur chargement HomePage:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <>
      {loading ? (
        <div className="min-h-[80vh] -mt-16 bg-gray-200 dark:bg-gray-800 animate-pulse" />
      ) : recentNews.length > 0 ? (
        <HeroCarousel
          slides={recentNews.map((n) => ({
            slug: n.slug,
            title: n.title,
            excerpt: n.excerpt,
            cover_image_url: n.cover_image_url,
          }))}
        />
      ) : (
        <section className="min-h-[80vh] flex items-center justify-center bg-gradient-to-br from-orange-500 to-blue-800 text-white -mt-16">
          <div className="text-center px-4 max-w-3xl">
            <h1 className="font-display text-5xl md:text-6xl font-bold mb-4">Racing Club de Bingerville</h1>
            <p className="text-xl text-white/80 mb-8">L'orange et bleu, une histoire de passion</p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/matchs" className="px-6 py-3 bg-white text-primary font-semibold rounded-lg hover:bg-gray-100 transition-colors">
                Voir le calendrier
              </Link>
              <Link to="/news" className="px-6 py-3 border-2 border-white text-white font-semibold rounded-lg hover:bg-white/10 transition-colors">
                Dernières actualités
              </Link>
            </div>
          </div>
        </section>
      )}

      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h2 className="font-display text-2xl font-bold text-gray-900 dark:text-white mb-6">Prochain match</h2>
            {loading ? (
              <CardSkeleton />
            ) : upcomingMatch ? (
              <MatchCard match={upcomingMatch} />
            ) : (
              <p className="text-gray-500 dark:text-gray-400">Aucun match à venir.</p>
            )}
          </div>
          <div>
            <h2 className="font-display text-2xl font-bold text-gray-900 dark:text-white mb-6">Dernières actualités</h2>
            {loading ? (
              <div className="space-y-4">
                <CardSkeleton />
                <CardSkeleton />
              </div>
            ) : recentNews.length > 0 ? (
              <div className="space-y-4">
                {recentNews.map((item) => (
                  <NewsCard key={item.id} news={item} />
                ))}
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400">Aucune actualité pour le moment.</p>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
