import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { Match, NewsItem } from '../types';
import { getUpcomingMatches } from '../lib/matches';
import { getRecentNews } from '../lib/news';
import MatchCard from '../components/ui/MatchCard';
import NewsCard from '../components/ui/NewsCard';
import HeroCarousel from '../components/ui/HeroCarousel';
import { CardSkeleton } from '../components/ui/Skeleton';
import { useScrollAnimation } from '../hooks/useScrollAnimation';
import { useCounter } from '../hooks/useCounter';

function AnimatedSection({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const { ref, isVisible } = useScrollAnimation();
  return (
    <section
      ref={ref}
      className={`transition-all duration-700 ease-out ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      } ${className}`}
    >
      {children}
    </section>
  );
}

function StatCard({ label, target, suffix = '' }: { label: string; target: number; suffix?: string }) {
  const { count, ref } = useCounter(target);
  return (
    <div className="text-center">
      <span ref={ref} className="text-4xl md:text-5xl font-display font-bold text-primary">{count}{suffix}</span>
      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{label}</p>
    </div>
  );
}

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
        <HeroCarousel news={recentNews} />
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

      <AnimatedSection className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
          <StatCard label="Années d'histoire" target={75} suffix="+" />
          <StatCard label="Joueurs" target={28} />
          <StatCard label="Championnats" target={4} />
          <StatCard label="Staff" target={12} />
        </div>
      </AnimatedSection>

      <AnimatedSection className="max-w-7xl mx-auto px-4 py-16">
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
      </AnimatedSection>

      <AnimatedSection className="max-w-7xl mx-auto px-4 py-16">
        <h2 className="font-display text-2xl font-bold text-gray-900 dark:text-white mb-8 text-center">🌟 Joueur du mois</h2>
        <div className="bg-gradient-to-br from-primary/5 to-blue-800/5 dark:from-primary/10 dark:to-blue-800/10 rounded-2xl p-8 text-center max-w-lg mx-auto">
          <div className="w-32 h-32 rounded-full bg-gradient-to-br from-orange-100 to-blue-100 dark:from-orange-900/20 dark:to-blue-900/20 mx-auto flex items-center justify-center text-5xl">🏆</div>
          <h3 className="text-xl font-display font-bold text-gray-900 dark:text-white mt-4">Karamoko Touré</h3>
          <p className="text-primary font-semibold">Attaquant · 12 buts cette saison</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 max-w-md">Un mois exceptionnel, avec 5 buts et 2 passes décisives.</p>
        </div>
      </AnimatedSection>

      <AnimatedSection className="max-w-7xl mx-auto px-4 py-16">
        <h2 className="font-display text-2xl font-bold text-gray-900 dark:text-white mb-8">⚽ Meilleurs buteurs</h2>
        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-3">
            {[
              { player: 'Karamoko Touré', goals: 12, position: 'Attaquant', image: '' },
              { player: 'Mamadou Diallo', goals: 8, position: 'Milieu offensif', image: '' },
              { player: 'Ibrahim Koné', goals: 6, position: 'Attaquant', image: '' },
              { player: 'Jean-Claude Akpa', goals: 5, position: 'Ailier', image: '' },
              { player: 'Souleymane Traoré', goals: 4, position: 'Milieu', image: '' },
            ].map((scorer, i) => (
              <div key={i} className="flex items-center gap-4 p-3 bg-white dark:bg-gray-800 rounded-xl shadow-sm card-hover">
                <span className="text-2xl font-bold text-primary/50 w-8 text-center">{i + 1}</span>
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-100 to-blue-100 dark:from-orange-900/20 dark:to-blue-900/20 flex items-center justify-center text-lg font-bold text-gray-400">
                  {scorer.player.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900 dark:text-white">{scorer.player}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{scorer.position}</p>
                </div>
                <span className="text-xl font-bold text-primary">{scorer.goals}</span>
              </div>
            ))}
          </div>
        </div>
      </AnimatedSection>
    </>
  );
}
