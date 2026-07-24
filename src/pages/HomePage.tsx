import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { Match, NewsItem } from '../types';
import { getUpcomingMatches } from '../lib/matches';
import { getRecentNews } from '../lib/news';
import { getSiteConfig } from '../lib/site-config';
import type { HeroSlide, HeroSettings } from '../lib/site-config';
import MatchCard from '../components/ui/MatchCard';
import NewsCard from '../components/ui/NewsCard';
import HeroCarousel from '../components/ui/HeroCarousel';
import fallbackImg from '../assets/man.jpg';
import { CardSkeleton } from '../components/ui/Skeleton';
import { useScrollAnimation } from '../hooks/useScrollAnimation';
import { useCounter } from '../hooks/useCounter';
import SEOHead, { organizationJsonLd } from '../components/SEOHead';

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
  { player: 'Karamoko Touré', goals: 12, position: 'Attaquant', image: '' },
  { player: 'Mamadou Diallo', goals: 8, position: 'Milieu offensif', image: '' },
  { player: 'Ibrahim Koné', goals: 6, position: 'Attaquant', image: '' },
  { player: 'Jean-Claude Akpa', goals: 5, position: 'Ailier', image: '' },
  { player: 'Souleymane Traoré', goals: 4, position: 'Milieu', image: '' },
];

export default function HomePage() {
  const [upcomingMatch, setUpcomingMatch] = useState<Match | null>(null);
  const [recentNews, setRecentNews] = useState<NewsItem[]>([]);
  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>([]);
  const [heroSettings, setHeroSettings] = useState<HeroSettings>({ transition: 'fade', autoplay: true, interval: 5000, show_arrows: true, show_dots: true });
  const [metricsConfig, setMetricsConfig] = useState<{ key: string; label: string; visible: boolean }[]>([]);
  const [configValues, setConfigValues] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [matches, news, config] = await Promise.all([
          getUpcomingMatches(),
          getRecentNews(3),
          getSiteConfig(),
        ]);
        setUpcomingMatch(matches[0] ?? null);
        setRecentNews(news);
        if (config?.hero_slides?.length) setHeroSlides(config.hero_slides);
        if (config?.hero_settings) setHeroSettings(config.hero_settings);
        if (config?.metrics_config) setMetricsConfig(config.metrics_config);
        if (config) setConfigValues({
          club_history_years: config.club_history_years,
          players_count: config.players_count,
          championships: config.championships,
          staff_count: config.staff_count,
        });
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
      <SEOHead title="Accueil" description="Site officiel du Racing Club de Bingerville — actualités, matchs, effectif, galerie et classement." jsonLd={organizationJsonLd()} />
      {loading ? (
        <div className="min-h-[80vh] -mt-16 bg-gray-200 dark:bg-gray-800 animate-pulse" />
      ) : (
        <HeroCarousel slides={heroSlides} settings={heroSettings} />
      )}

      <AnimatedSection className="bg-gradient-to-r from-sky-50 to-navy-50 dark:from-gray-800 dark:to-gray-800 py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {metricsConfig.filter(m => m.visible).map(mc => (
              <StatCard key={mc.key} label={mc.label} target={configValues[mc.key] || 0}
                suffix={mc.key === 'club_history_years' ? '+' : ''} />
            ))}
            {metricsConfig.filter(m => m.visible).length === 0 && (
              <>
                <StatCard label="Années d'histoire" target={75} suffix="+" />
                <StatCard label="Joueurs" target={28} />
                <StatCard label="Championnats" target={4} />
                <StatCard label="Staff" target={12} />
              </>
            )}
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
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg> Joueur du mois
              </h2>
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 text-center shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="w-28 h-28 rounded-full mx-auto shadow-inner overflow-hidden border-4 border-primary/20">
                  <img src={fallbackImg} alt="Karamoko Touré"
                    className="w-full h-full object-cover" />
                </div>
                <h3 className="text-xl font-display font-bold text-gray-900 dark:text-white mt-5">Karamoko Touré</h3>
                <p className="text-primary font-semibold">Attaquant · 12 buts</p>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-3 max-w-sm mx-auto">Un mois exceptionnel, avec 5 buts et 2 passes décisives en 4 matches.</p>
              </div>
            </div>
            <div>
              <h2 className="font-display text-2xl font-bold text-gray-900 dark:text-white mb-8 flex items-center gap-3">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm0 2a8.003 8.003 0 017.938 7H4.062A8.003 8.003 0 0112 4zm-7.938 9h15.876A8.003 8.003 0 0112 20a8.003 8.003 0 01-7.938-7z" />
                </svg> Meilleurs buteurs
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
                    <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 border border-gray-200 dark:border-gray-600">
                      <img src={scorer.image || fallbackImg} alt={scorer.player}
                        className="w-full h-full object-cover"
                        onError={(e) => { if (e.currentTarget.src !== fallbackImg) e.currentTarget.src = fallbackImg; }} />
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
