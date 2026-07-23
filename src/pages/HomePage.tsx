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
      <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 font-medium">{label}</p>
    </div>
  );
}

const scorers = [
  { player: 'Karamoko Touré', goals: 12, position: 'Attaquant' },
  { player: 'Mamadou Diallo', goals: 8, position: 'Milieu offensif' },
  { player: 'Ibrahim Koné', goals: 6, position: 'Attaquant' },
  { player: 'Jean-Claude Akpa', goals: 5, position: 'Ailier' },
  { player: 'Souleymane Traoré', goals: 4, position: 'Milieu' },
];

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
        <section className="relative min-h-[80vh] -mt-16 flex items-center justify-center gradient-hero text-white overflow-hidden">
          <div className="relative z-10 text-center px-4 max-w-3xl">
            <h1 className="font-display text-5xl md:text-7xl font-black mb-4">Racing Club de Bingerville</h1>
            <p className="text-xl text-white/90 mb-8">Le ciel et le marine, une histoire de passion</p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/matchs" className="px-8 py-3 bg-white text-primary font-bold rounded-full hover:shadow-lg hover:bg-gray-100 transition-all">
                Calendrier
              </Link>
              <Link to="/effectif" className="px-8 py-3 bg-white/10 backdrop-blur-sm text-white font-semibold rounded-full border-2 border-white/30 hover:bg-white/20 transition-all">
                Effectif
              </Link>
            </div>
          </div>
        </section>
      )}

      <AnimatedSection className="bg-gradient-to-r from-sky-50 to-navy-50 dark:from-gray-800 dark:to-gray-800 py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <StatCard label="Années d'histoire" target={75} suffix="+" />
            <StatCard label="Joueurs" target={28} />
            <StatCard label="Championnats" target={4} />
            <StatCard label="Staff" target={12} />
          </div>
        </div>
      </AnimatedSection>

      <AnimatedSection className="max-w-7xl mx-auto px-4 py-20">
        <div className="grid md:grid-cols-2 gap-12">
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-2xl font-bold text-gray-900 dark:text-white">Prochain match</h2>
              <Link to="/matchs" className="text-sm font-medium text-primary hover:text-cta transition-colors">Voir tout →</Link>
            </div>
            {loading ? (
              <CardSkeleton />
            ) : upcomingMatch ? (
              <MatchCard match={upcomingMatch} />
            ) : (
              <p className="text-gray-600 dark:text-gray-300">Aucun match à venir.</p>
            )}
          </div>
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-2xl font-bold text-gray-900 dark:text-white">Dernières actualités</h2>
              <Link to="/news" className="text-sm font-medium text-primary hover:text-cta transition-colors">Voir tout →</Link>
            </div>
            {loading ? (
              <div className="space-y-4">
                <CardSkeleton />
                <CardSkeleton />
              </div>
            ) : recentNews.length > 0 ? (
              <div className="space-y-6">
                {recentNews.map((item) => (
                  <NewsCard key={item.id} news={item} />
                ))}
              </div>
            ) : (
              <p className="text-gray-600 dark:text-gray-300">Aucune actualité pour le moment.</p>
            )}
          </div>
        </div>
      </AnimatedSection>

      <AnimatedSection className="bg-gray-50 dark:bg-gray-800/50 py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <h2 className="font-display text-2xl font-bold text-gray-900 dark:text-white mb-8 flex items-center gap-3">
                <span className="text-3xl">🌟</span> Joueur du mois
              </h2>
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 text-center shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="w-28 h-28 rounded-full bg-gradient-to-br from-sky-100 to-navy-100 dark:from-sky-900/30 dark:to-navy-900/30 mx-auto flex items-center justify-center text-6xl shadow-inner">🏆</div>
                <h3 className="text-xl font-display font-bold text-gray-900 dark:text-white mt-5">Karamoko Touré</h3>
                <p className="text-primary font-semibold">Attaquant · 12 buts</p>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-3 max-w-sm mx-auto">Un mois exceptionnel, avec 5 buts et 2 passes décisives en 4 matches.</p>
              </div>
            </div>
            <div>
              <h2 className="font-display text-2xl font-bold text-gray-900 dark:text-white mb-8 flex items-center gap-3">
                <span className="text-3xl">⚽</span> Meilleurs buteurs
              </h2>
              <div className="space-y-3">
                {scorers.map((scorer, i) => (
                  <div key={i} className="flex items-center gap-4 p-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 card-hover">
                    <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      i === 0 ? 'bg-yellow-100 text-yellow-700' :
                      i === 1 ? 'bg-gray-100 text-gray-500' :
                      i === 2 ? 'bg-sky-100 text-sky-600' :
                      'bg-gray-50 text-gray-400'
                    }`}>{i + 1}</span>
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sky-100 to-navy-100 dark:from-sky-900/20 dark:to-navy-900/20 flex items-center justify-center text-sm font-bold text-gray-500 dark:text-gray-400">
                      {scorer.player.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 dark:text-white truncate">{scorer.player}</p>
                      <p className="text-xs text-gray-600 dark:text-gray-300">{scorer.position}</p>
                    </div>
                    <span className="text-2xl font-black text-primary">{scorer.goals}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </AnimatedSection>
    </>
  );
}
