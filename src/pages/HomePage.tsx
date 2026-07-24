import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { Match, NewsItem, Standing } from '../types';
import { getUpcomingMatches } from '../lib/matches';
import { getRecentNews } from '../lib/news';
import { getSiteConfig, DEFAULT_CONFIG } from '../lib/site-config';
import { getStandings } from '../lib/standings';
import { getTopScorers } from '../lib/top-scorers';
import { getActivePlayerOfMonth } from '../lib/players-of-month';
import { subscribeNewsletter } from '../lib/newsletter';
import type { HeroSlide, HeroSettings, Sponsor } from '../lib/site-config';
import type { TopScorer } from '../lib/top-scorers';
import type { PlayerOfMonth } from '../lib/players-of-month';
import MatchCard from '../components/ui/MatchCard';
import NewsCard from '../components/ui/NewsCard';
import HeroCarousel from '../components/ui/HeroCarousel';
import fallbackImg from '../assets/img/man.jpg';
import { CardSkeleton } from '../components/ui/Skeleton';
import { useScrollAnimation } from '../hooks/useScrollAnimation';
import { useCounter } from '../hooks/useCounter';
import SEOHead, { organizationJsonLd } from '../components/SEOHead';
import toast from 'react-hot-toast';

function AnimatedSection({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const { ref, isVisible } = useScrollAnimation<HTMLElement>();
  return (
    <section ref={ref}
      className={`transition-all duration-700 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'} ${className}`}>
      {children}
    </section>
  );
}

function StaggerItem({ index, children }: { index: number; children: React.ReactNode }) {
  const { ref, isVisible } = useScrollAnimation<HTMLDivElement>();
  return (
    <div ref={ref}
      className={`transition-all duration-500 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
      style={{ transitionDelay: `${index * 100}ms` }}>
      {children}
    </div>
  );
}

function StatCard({ label, target, suffix = '' }: { label: string; target: number; suffix?: string }) {
  const { count, ref } = useCounter(target);
  return (
    <div className="text-center" role="status" aria-label={label}>
      <span ref={ref} className="text-4xl md:text-5xl font-display font-bold text-primary">{count}{suffix}</span>
      <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 font-medium">{label}</p>
    </div>
  );
}

function HeroSkeleton() {
  return <div className="h-[60vh] bg-gray-200 dark:bg-gray-800 animate-pulse rounded-b-2xl" role="status" aria-label="Chargement du carrousel" />;
}

function MetricsSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-8" role="status" aria-label="Chargement des statistiques">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="text-center space-y-3">
          <div className="h-10 w-20 bg-gray-200 dark:bg-gray-700 animate-pulse rounded-lg mx-auto" />
          <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 animate-pulse rounded mx-auto" />
        </div>
      ))}
    </div>
  );
}

interface SectionErrorProps {
  message: string;
  onRetry?: () => void;
}

function SectionError({ message, onRetry }: SectionErrorProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-[18px] shadow-card p-8 text-center" role="alert">
      <svg className="w-10 h-10 mx-auto text-cta mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
      </svg>
      <p className="text-gray-500 dark:text-gray-400 mb-3">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="px-4 py-2 rounded-xl bg-secondary text-white text-sm font-medium hover:bg-primary transition-colors">
          Réessayer
        </button>
      )}
    </div>
  );
}

function StandingsPreview({ standings }: { standings: Standing[] }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
        <h3 className="font-display font-bold text-gray-900 dark:text-white">Classement</h3>
        <Link to="/classement" className="text-xs font-medium text-primary hover:text-cta">Voir tout →</Link>
      </div>
      <div className="divide-y divide-gray-100 dark:divide-gray-700">
        {standings.slice(0, 4).map((team, i) => (
          <div key={team.id} className="flex items-center gap-3 px-5 py-3">
            <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${i === 0 ? 'bg-yellow-100 text-yellow-700' : i === 1 ? 'bg-gray-100 text-gray-500' : i === 2 ? 'bg-sky-100 text-sky-600' : 'bg-gray-50 dark:bg-gray-700 text-gray-400'}`}>{i + 1}</span>
            <span className="flex-1 text-sm font-medium text-gray-900 dark:text-white truncate">{team.team_name}</span>
            <span className="text-sm font-bold text-gray-700 dark:text-gray-300 w-8 text-center">{team.points}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function CTABanner() {
  return (
    <section className="bg-gradient-to-r from-secondary to-primary py-16">
      <div className="max-w-7xl mx-auto px-4 text-center">
        <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-4">Rejoignez le Racing Club</h2>
        <p className="text-white/80 max-w-xl mx-auto mb-8">Vous voulez faire partie de l'aventure ? Contactez-nous pour un essai, un partenariat ou pour supporter le club.</p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link to="/contact" className="px-6 py-3 rounded-xl bg-white text-secondary font-semibold hover:bg-gray-100 transition-colors">Nous contacter</Link>
          <a href="https://instagram.com/rcbingerville" target="_blank" rel="noopener noreferrer" className="px-6 py-3 rounded-xl border-2 border-white text-white font-semibold hover:bg-white/10 transition-colors">Nous suivre</a>
        </div>
      </div>
    </section>
  );
}

function SponsorsSection({ sponsors }: { sponsors: Sponsor[] }) {
  if (!sponsors?.length) return null;
  return (
    <section className="bg-white dark:bg-gray-800/50 py-12">
      <div className="max-w-7xl mx-auto px-4">
        <h3 className="text-center text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-8">Nos partenaires</h3>
        <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12" role="list" aria-label="Partenaires">
          {sponsors.map((s, i) => (
            <a key={i} href={s.website_url} target="_blank" rel="noopener noreferrer" className="grayscale hover:grayscale-0 transition-all opacity-60 hover:opacity-100" role="listitem">
              <div className="w-24 h-16 bg-gray-100 dark:bg-gray-700 rounded-xl flex items-center justify-center text-xs text-gray-400 font-medium px-2 text-center">
                {s.name}
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

function NewsletterForm() {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubmitting(true);
    const ok = await subscribeNewsletter(email.trim());
    if (ok) { toast.success('Inscription réussie !'); setEmail(''); }
    else toast.error('Erreur lors de l\'inscription');
    setSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-3 max-w-md mx-auto" role="form" aria-label="Inscription newsletter">
      <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="Votre email"
        className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40" />
      <button type="submit" disabled={submitting}
        className="px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50">
        {submitting ? '...' : 'S\'inscrire'}
      </button>
    </form>
  );
}

function SocialFeed() {
  return (
    <div className="flex justify-center gap-4">
      <a href="https://instagram.com/rcbingerville" target="_blank" rel="noopener noreferrer"
        className="flex items-center gap-2 px-5 py-3 rounded-xl bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700 hover:border-primary transition-colors">
        <svg className="w-5 h-5 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 4H8a4 4 0 00-4 4v8a4 4 0 004 4h8a4 4 0 004-4V8a4 4 0 00-4-4zm-4 6a2 2 0 100 4 2 2 0 000-4zm4-3h.01" />
        </svg>
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Instagram</span>
      </a>
      <a href="https://facebook.com/rcbingerville" target="_blank" rel="noopener noreferrer"
        className="flex items-center gap-2 px-5 py-3 rounded-xl bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700 hover:border-primary transition-colors">
        <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Facebook</span>
      </a>
    </div>
  );
}

export default function HomePage() {
  const [upcomingMatches, setUpcomingMatches] = useState<Match[]>([]);
  const [recentNews, setRecentNews] = useState<NewsItem[]>([]);
  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>([]);
  const [heroSettings, setHeroSettings] = useState<HeroSettings>({ transition: 'fade', autoplay: true, interval: 5000, show_arrows: true, show_dots: true });
  const [metricsConfig, setMetricsConfig] = useState<{ key: string; label: string; visible: boolean }[]>([]);
  const [configValues, setConfigValues] = useState<Record<string, number>>({});
  const [standings, setStandings] = useState<Standing[]>([]);
  const [topScorers, setTopScorers] = useState<TopScorer[]>([]);
  const [playerOfMonth, setPlayerOfMonth] = useState<PlayerOfMonth | null>(null);
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [loading, setLoading] = useState(true);
  const [offline, setOffline] = useState(!navigator.onLine);
  const [globalError, setGlobalError] = useState(false);
  const [sectionErrors, setSectionErrors] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const handleOnline = () => setOffline(false);
    const handleOffline = () => setOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => { window.removeEventListener('online', handleOnline); window.removeEventListener('offline', handleOffline); };
  }, []);

  const loadData = async () => {
    setLoading(true);
    setGlobalError(false);
    setSectionErrors({});
    try {
      const config = await getSiteConfig();
      if (config?.hero_slides?.length) setHeroSlides(config.hero_slides);
      if (config?.hero_settings) setHeroSettings(config.hero_settings);
      if (config?.metrics_config?.length) setMetricsConfig(config.metrics_config);
      else setMetricsConfig(DEFAULT_CONFIG.metrics_config);
      if (config) {
        setConfigValues({
          club_history_years: config.club_history_years ?? DEFAULT_CONFIG.club_history_years,
          players_count: config.players_count ?? DEFAULT_CONFIG.players_count,
          championships: config.championships ?? DEFAULT_CONFIG.championships,
          staff_count: config.staff_count ?? DEFAULT_CONFIG.staff_count,
        });
      }
      if (config?.sponsors) setSponsors(config.sponsors);
    } catch {
      setSectionErrors(p => ({ ...p, config: true }));
    }

    try {
      const matches = await getUpcomingMatches(3);
      setUpcomingMatches(matches);
    } catch {
      setSectionErrors(p => ({ ...p, matches: true }));
    }

    try {
      const news = await getRecentNews(3);
      setRecentNews(news);
    } catch {
      setSectionErrors(p => ({ ...p, news: true }));
    }

    try {
      const standingsData = await getStandings();
      setStandings(standingsData);
    } catch {
      setSectionErrors(p => ({ ...p, standings: true }));
    }

    try {
      const scorers = await getTopScorers();
      setTopScorers(scorers);
    } catch {
      setSectionErrors(p => ({ ...p, scorers: true }));
    }

    try {
      const pom = await getActivePlayerOfMonth();
      setPlayerOfMonth(pom);
    } catch {
      setSectionErrors(p => ({ ...p, pom: true }));
    }

    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Accueil', item: 'https://racingclub.ci/' },
      { '@type': 'ListItem', position: 2, name: 'Effectif', item: 'https://racingclub.ci/effectif' },
      { '@type': 'ListItem', position: 3, name: 'Matchs', item: 'https://racingclub.ci/matchs' },
      { '@type': 'ListItem', position: 4, name: 'Actualités', item: 'https://racingclub.ci/news' },
      { '@type': 'ListItem', position: 5, name: 'Classement', item: 'https://racingclub.ci/classement' },
      { '@type': 'ListItem', position: 6, name: 'Contact', item: 'https://racingclub.ci/contact' },
    ],
  };

  if (globalError && !loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center space-y-4">
          <svg className="w-16 h-16 mx-auto text-cta" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h2 className="text-xl font-display font-bold text-gray-900 dark:text-white">Impossible de charger la page</h2>
          <p className="text-gray-500 dark:text-gray-400">Vérifiez votre connexion et réessayez.</p>
          <button onClick={loadData} className="px-6 py-2.5 rounded-xl bg-secondary text-white font-medium hover:bg-primary transition-colors">Réessayer</button>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEOHead title="Accueil" description="Site officiel du Racing Club de Bingerville — actualités, matchs, effectif, galerie et classement."
        jsonLd={{ '@graph': [organizationJsonLd(), breadcrumbJsonLd] }} />

      {offline && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-amber-500 text-white text-center py-2 text-sm font-medium" role="alert">
          Mode hors-ligne — les données peuvent ne pas être à jour
        </div>
      )}

      {loading ? <HeroSkeleton /> : <HeroCarousel slides={heroSlides} settings={heroSettings} />}

      <AnimatedSection className="bg-gradient-to-r from-sky-50 to-navy-50 dark:from-gray-800 dark:to-gray-800 py-16">
        <div className="max-w-7xl mx-auto px-4">
          {loading ? <MetricsSkeleton /> : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {metricsConfig.filter(m => m.visible).map(mc => (
                <StatCard key={mc.key} label={mc.label} target={configValues[mc.key] || 0} suffix={mc.key === 'club_history_years' ? '+' : ''} />
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
          )}
        </div>
      </AnimatedSection>

      <AnimatedSection className="max-w-7xl mx-auto px-4 py-20">
        <div className="flex flex-col lg:flex-row gap-12">
          <div className="flex-1" role="region" aria-labelledby="matches-heading">
            <div className="flex items-center justify-between mb-6">
              <h2 id="matches-heading" className="font-display text-2xl font-bold text-gray-900 dark:text-white">Prochains matchs</h2>
              <Link to="/matchs" className="text-sm font-medium text-primary hover:text-cta transition-colors">Voir tout →</Link>
            </div>
            {loading ? (
              <div className="space-y-4"><CardSkeleton /><CardSkeleton /></div>
            ) : sectionErrors.matches ? (
              <SectionError message="Impossible de charger les matchs." onRetry={loadData} />
            ) : upcomingMatches.length > 0 ? (
              <div className="space-y-4">
                {upcomingMatches.map((m, i) => <StaggerItem key={m.id} index={i}><MatchCard match={m} /></StaggerItem>)}
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-[18px] shadow-card p-8 text-center">
                <p className="text-gray-500 dark:text-gray-400">Aucun match à venir.</p>
              </div>
            )}
          </div>
          <div className="flex-[2]" role="region" aria-labelledby="news-heading">
            <div className="flex items-center justify-between mb-6">
              <h2 id="news-heading" className="font-display text-2xl font-bold text-gray-900 dark:text-white">Dernières actualités</h2>
              <Link to="/news" className="text-sm font-medium text-primary hover:text-cta transition-colors">Voir tout →</Link>
            </div>
            {loading ? (
              <div className="space-y-4"><CardSkeleton /><CardSkeleton /></div>
            ) : sectionErrors.news ? (
              <SectionError message="Impossible de charger les actualités." onRetry={loadData} />
            ) : recentNews.length > 0 ? (
              <div className="grid sm:grid-cols-2 gap-6">
                {recentNews.map((item, i) => (
                  <StaggerItem key={item.id} index={i}><NewsCard news={item} /></StaggerItem>
                ))}
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-[18px] shadow-card p-8 text-center">
                <p className="text-gray-500 dark:text-gray-400">Aucune actualité pour le moment.</p>
              </div>
            )}
          </div>
        </div>
      </AnimatedSection>

      <AnimatedSection className="bg-gray-50 dark:bg-gray-800/50 py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
              {loading ? <div className="h-64 bg-gray-200 dark:bg-gray-700 animate-pulse rounded-2xl" /> : (
                <div className="grid md:grid-cols-2 gap-8">
                  <div role="region" aria-labelledby="pom-heading">
                    <h2 id="pom-heading" className="font-display text-2xl font-bold text-gray-900 dark:text-white mb-8 flex items-center gap-3">
                      <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                      </svg> Joueur du mois
                    </h2>
                    {sectionErrors.pom ? (
                      <SectionError message="Impossible de charger." />
                    ) : playerOfMonth ? (
                      <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 text-center shadow-sm border border-gray-100 dark:border-gray-700">
                        <div className="w-28 h-28 rounded-full mx-auto shadow-inner overflow-hidden border-4 border-primary/20">
                          <img src={playerOfMonth.image_url || fallbackImg} alt={playerOfMonth.player_name} className="w-full h-full object-cover" />
                        </div>
                        <h3 className="text-xl font-display font-bold text-gray-900 dark:text-white mt-5">{playerOfMonth.player_name}</h3>
                        <p className="text-primary font-semibold">{playerOfMonth.position} · {playerOfMonth.goals} buts{playerOfMonth.assists > 0 ? ` · ${playerOfMonth.assists} passes` : ''}</p>
                        {playerOfMonth.description && <p className="text-sm text-gray-600 dark:text-gray-300 mt-3 max-w-sm mx-auto">{playerOfMonth.description}</p>}
                      </div>
                    ) : (
                      <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 text-center shadow-sm border border-gray-100 dark:border-gray-700">
                        <p className="text-gray-500 dark:text-gray-400">Aucun joueur du mois sélectionné.</p>
                      </div>
                    )}
                  </div>
                  <div role="region" aria-labelledby="scorers-heading">
                    <h2 id="scorers-heading" className="font-display text-2xl font-bold text-gray-900 dark:text-white mb-8 flex items-center gap-3">
                      <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm0 2a8.003 8.003 0 017.938 7H4.062A8.003 8.003 0 0112 4zm-7.938 9h15.876A8.003 8.003 0 0112 20a8.003 8.003 0 01-7.938-7z" />
                      </svg> Meilleurs buteurs
                    </h2>
                    {sectionErrors.scorers ? (
                      <SectionError message="Impossible de charger." />
                    ) : topScorers.length > 0 ? (
                      <div className="space-y-3" role="list">
                        {topScorers.map((scorer, i) => (
                          <StaggerItem key={scorer.id || i} index={i}>
                            <div className="flex items-center gap-4 p-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 card-hover" role="listitem">
                              <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${i === 0 ? 'bg-yellow-100 text-yellow-700' : i === 1 ? 'bg-gray-100 text-gray-500' : i === 2 ? 'bg-sky-100 text-sky-600' : 'bg-gray-50 dark:bg-gray-700 text-gray-400'}`}>{i + 1}</span>
                              <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 border border-gray-200 dark:border-gray-600">
                                <img src={scorer.image_url || fallbackImg} alt={scorer.player_name} className="w-full h-full object-cover" onError={(e) => { if (e.currentTarget.src !== fallbackImg) e.currentTarget.src = fallbackImg; }} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-gray-900 dark:text-white truncate">{scorer.player_name}</p>
                                {scorer.position && <p className="text-xs text-gray-600 dark:text-gray-300">{scorer.position}</p>}
                              </div>
                              <span className="text-2xl font-black text-primary">{scorer.goals}</span>
                            </div>
                          </StaggerItem>
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {[
                          { player: 'Karamoko Touré', goals: 12, position: 'Attaquant' },
                          { player: 'Mamadou Diallo', goals: 8, position: 'Milieu offensif' },
                          { player: 'Ibrahim Koné', goals: 6, position: 'Attaquant' },
                          { player: 'Jean-Claude Akpa', goals: 5, position: 'Ailier' },
                          { player: 'Souleymane Traoré', goals: 4, position: 'Milieu' },
                        ].map((scorer, i) => (
                          <div key={i} className="flex items-center gap-4 p-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 card-hover">
                            <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${i === 0 ? 'bg-yellow-100 text-yellow-700' : i === 1 ? 'bg-gray-100 text-gray-500' : i === 2 ? 'bg-sky-100 text-sky-600' : 'bg-gray-50 text-gray-400'}`}>{i + 1}</span>
                            <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 border border-gray-200 dark:border-gray-600">
                              <img src={fallbackImg} alt={scorer.player} className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-gray-900 dark:text-white truncate">{scorer.player}</p>
                              <p className="text-xs text-gray-600 dark:text-gray-300">{scorer.position}</p>
                            </div>
                            <span className="text-2xl font-black text-primary">{scorer.goals}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            <div role="region" aria-labelledby="standings-heading">
              {loading ? (
                <div className="h-64 bg-gray-200 dark:bg-gray-700 animate-pulse rounded-2xl" />
              ) : sectionErrors.standings ? (
                <SectionError message="Classement indisponible." />
              ) : standings.length > 0 ? (
                <StandingsPreview standings={standings} />
              ) : null}
            </div>
          </div>
        </div>
      </AnimatedSection>

      <CTABanner />

      <AnimatedSection className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="text-center md:text-left">
            <h3 className="font-display text-xl font-bold text-gray-900 dark:text-white mb-2">Restez informé</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">Recevez les dernières actualités du club par email.</p>
            <NewsletterForm />
          </div>
          <div className="text-center md:text-right">
            <h3 className="font-display text-xl font-bold text-gray-900 dark:text-white mb-2">Suivez-nous</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">Restez connectés sur les réseaux sociaux.</p>
            <SocialFeed />
          </div>
        </div>
      </AnimatedSection>

      <SponsorsSection sponsors={sponsors} />
    </>
  );
}
