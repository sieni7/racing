import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdmin } from '../../../contexts/AdminContext';
import { getStandings } from '../../../lib/standings';
import { getAuditLog } from '../../../lib/audit';

const LINKS = [
  { label: 'Joueurs', path: '/admin/players', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197', color: 'from-secondary to-navy-700' },
  { label: 'Matchs', path: '/admin/matches', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z', color: 'from-primary to-sky-600' },
  { label: 'Actualités', path: '/admin/news', icon: 'M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1', color: 'from-cta to-red-600' },
  { label: 'Staff', path: '/admin/staff', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857', color: 'from-green-600 to-green-700' },
  { label: 'Galerie', path: '/admin/gallery', icon: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14', color: 'from-purple-600 to-purple-800' },
  { label: 'Classement', path: '/admin/standings', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2', color: 'from-amber-600 to-amber-800' },
];

function StatCard({ label, value, color, icon }: { label: string; value: number | string; color: string; icon: string }) {
  return (
    <div className={`rounded-xl bg-gradient-to-br ${color} p-5 text-white shadow-sm`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-3xl font-black">{value}</p>
          <p className="text-white/70 text-sm mt-0.5">{label}</p>
        </div>
        <svg className="w-8 h-8 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={icon} />
        </svg>
      </div>
    </div>
  );
}

function MiniStat({ label, value, color }: { label: string; value: number | string; color: string }) {
  return (
    <div className="text-center p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50">
      <p className={`text-xl font-black ${color}`}>{value}</p>
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{label}</p>
    </div>
  );
}

function Widget({ title, children, className = '' }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-5 flex flex-col ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display font-bold text-sm text-gray-900 dark:text-white flex items-center gap-2">
          <span className="w-1 h-4 bg-primary rounded-full" />
          {title}
        </h3>
      </div>
      <div className="flex-1 min-h-0">{children}</div>
    </div>
  );
}

const activityLabels: Record<string, string> = { players: 'Joueurs', matches: 'Matchs', news: 'Actualités', staff: 'Staff', gallery: 'Galerie', standings: 'Classement', top_scorers: 'Meilleurs buteurs', players_of_month: 'Joueurs du mois' };
const activityColors: Record<string, string> = { CREATE: 'bg-green-500', UPDATE: 'bg-blue-500', DELETE: 'bg-red-500' };
const activityText: Record<string, string> = { CREATE: 'Création', UPDATE: 'Modification', DELETE: 'Suppression' };

export default function Dashboard() {
  const navigate = useNavigate();
  const { players, matches, news, staff, fetchPlayers, fetchMatches, fetchNews, fetchStaff } = useAdmin();
  const [ready, setReady] = useState(false);
  const [topTeam, setTopTeam] = useState<{ team_name: string; points: number } | null>(null);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    Promise.all([fetchPlayers(), fetchMatches(), fetchNews(), fetchStaff()]).then(() => {
      if (!mounted.current) return;
      Promise.all([getStandings(), getAuditLog({ limit: 5 })]).then(([standings, audit]) => {
        if (!mounted.current) return;
        if (standings.length > 0) setTopTeam(standings[0]);
        setRecentActivity(audit);
        setReady(true);
      }).catch(() => setReady(true));
    }).catch(() => setReady(true));
    return () => { mounted.current = false; };
  }, []);

  const finished = matches.filter(m => m.status === 'finished');
  const won = finished.filter(m => (m.racing_score ?? 0) > (m.opponent_score ?? 0)).length;
  const drawn = finished.filter(m => (m.racing_score ?? 0) === (m.opponent_score ?? 0)).length;
  const lost = finished.length - won - drawn;
  const winRate = finished.length ? Math.round((won / finished.length) * 100) : 0;
  const upcoming = matches.filter(m => m.status === 'upcoming').sort((a, b) => new Date(a.match_date).getTime() - new Date(b.match_date).getTime());
  const recentNews = [...news].sort((a, b) => new Date(b.published_at || '').getTime() - new Date(a.published_at || '').getTime()).slice(0, 4);
  const last5 = finished.sort((a, b) => new Date(b.match_date).getTime() - new Date(a.match_date).getTime()).slice(0, 5);

  const positionCounts: Record<string, number> = {};
  players.forEach(p => { const pos = p.position.toLowerCase(); positionCounts[pos] = (positionCounts[pos] || 0) + 1; });
  const positionColors: Record<string, string> = { gardien: 'bg-yellow-500', defenseur: 'bg-blue-500', milieu: 'bg-green-500', attaquant: 'bg-red-500' };
  const positionLabels: Record<string, string> = { gardien: 'Gardiens', defenseur: 'Défenseurs', milieu: 'Milieux', attaquant: 'Attaquants' };

  const stats = [
    { label: 'Joueurs', value: players.length, color: 'from-secondary to-navy-700', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197' },
    { label: 'Matchs', value: matches.length, color: 'from-primary to-sky-600', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
    { label: 'Actualités', value: news.length, color: 'from-cta to-red-600', icon: 'M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1' },
    { label: 'Staff', value: staff.length, color: 'from-green-600 to-green-700', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857' },
  ];

  if (!ready) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-display font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <div key={i} className="h-24 rounded-xl bg-gray-100 dark:bg-gray-800 animate-pulse" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {[1,2,3].map(i => <div key={i} className="h-48 rounded-2xl bg-gray-100 dark:bg-gray-800 animate-pulse" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Vue d'ensemble du Racing Club de Bingerville</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {LINKS.map(l => (
            <button key={l.path} onClick={() => navigate(l.path)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-primary hover:text-white transition-all">
              + {l.label}
            </button>
          ))}
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(s => <StatCard key={s.label} {...s} />)}
      </div>

      {/* Row 1: Win rate, Leader, Next match */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Widget title="Taux de victoire">
          <div className="flex flex-col items-center justify-center py-4">
            <div className="relative w-28 h-28">
              <svg className="w-28 h-28 -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="15.5" fill="none" stroke="currentColor" strokeWidth="3" className="text-gray-200 dark:text-gray-700" />
                <circle cx="18" cy="18" r="15.5" fill="none" stroke="#59C7F7" strokeWidth="3" strokeDasharray={`${winRate},100`} strokeLinecap="round" />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-3xl font-black text-gray-900 dark:text-white">{winRate}%</span>
            </div>
            <p className="text-xs text-gray-400 mt-3">{finished.length} matchs</p>
            {finished.length > 0 && (
              <div className="flex gap-3 mt-2">
                <MiniStat label="V" value={won} color="text-green-600" />
                <MiniStat label="N" value={drawn} color="text-yellow-500" />
                <MiniStat label="D" value={lost} color="text-red-600" />
              </div>
            )}
          </div>
        </Widget>

        <Widget title="Leader classement">
          <div className="flex flex-col items-center justify-center py-4 text-center">
            {topTeam ? (
              <>
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-100 to-amber-200 dark:from-amber-900/30 dark:to-amber-800/30 flex items-center justify-center mb-3">
                  <svg className="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3h14M9 3v2a4 4 0 01-4 4H3m12-6v2a4 4 0 004 4h2M5 21h14M9 21v-4a4 4 0 01-4-4H3m12 4v4m0-4a4 4 0 004-4h2" />
                  </svg>
                </div>
                <p className="font-bold text-gray-900 dark:text-white text-lg">{topTeam.team_name}</p>
                <p className="text-primary font-black text-2xl">{topTeam.points} pts</p>
              </>
            ) : (
              <div className="flex flex-col items-center py-4">
                <svg className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10" />
                </svg>
                <p className="text-gray-400 text-sm">Aucune donnée</p>
              </div>
            )}
          </div>
        </Widget>

        <Widget title="Prochain match">
          <div className="flex flex-col justify-center py-4">
            {upcoming[0] ? (
              <>
                <div className="flex items-center gap-3 mb-3">
                  <span className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-xs font-medium text-green-600">À venir</span>
                </div>
                <p className="font-semibold text-gray-900 dark:text-white text-lg">
                  {upcoming[0].is_home ? 'RCB' : upcoming[0].opponent_name}
                  <span className="text-gray-400 mx-2">vs</span>
                  {upcoming[0].is_home ? upcoming[0].opponent_name : 'RCB'}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {new Date(upcoming[0].match_date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">{upcoming[0].competition} · {upcoming[0].venue}</p>
              </>
            ) : <p className="text-gray-400 text-sm text-center py-4">Aucun match à venir</p>}
          </div>
        </Widget>
      </div>

      {/* Row 2: Player positions + Last 5 results */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Widget title="Répartition joueurs">
          {players.length === 0 ? <p className="text-gray-400 text-sm py-4 text-center">Aucun joueur</p>
          : <div className="space-y-3 py-2">
            {Object.entries(positionCounts).map(([pos, count]) => {
              const pct = Math.round((count / players.length) * 100);
              return (
                <div key={pos}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-700 dark:text-gray-300">{positionLabels[pos] || pos}</span>
                    <span className="text-gray-500 dark:text-gray-400">{count} ({pct}%)</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-gray-100 dark:bg-gray-700 overflow-hidden">
                    <div className={`h-full rounded-full ${positionColors[pos] || 'bg-gray-400'} transition-all duration-500`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>}
        </Widget>

        <Widget title="Derniers résultats">
          {last5.length === 0 ? <p className="text-gray-400 text-sm py-4 text-center">Aucun match terminé</p>
          : <div className="space-y-2 py-2">
            {last5.map(m => {
              const isWon = (m.racing_score ?? 0) > (m.opponent_score ?? 0);
              const isLost = (m.racing_score ?? 0) < (m.opponent_score ?? 0);
              const bg = isWon ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' : isLost ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800' : 'bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700';
              const badge = isWon ? 'bg-green-500' : isLost ? 'bg-red-500' : 'bg-gray-400';
              return (
                <div key={m.id} className={`flex items-center gap-3 p-3 rounded-xl border ${bg}`}>
                  <span className={`w-2 h-2 rounded-full ${badge} flex-shrink-0`} />
                  <div className="flex-1 min-w-0 flex items-center gap-3">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{m.is_home ? 'RCB' : m.opponent_name}</span>
                    <span className="text-xs text-gray-400">vs</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{m.is_home ? m.opponent_name : 'RCB'}</span>
                    <span className="ml-auto text-sm font-black text-gray-900 dark:text-white">{m.racing_score}–{m.opponent_score}</span>
                  </div>
                </div>
              );
            })}
          </div>}
        </Widget>
      </div>

      {/* Row 3: News + Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Widget title="Dernières actualités">
          {recentNews.length === 0 ? <p className="text-gray-400 text-sm py-4 text-center">Aucune actualité</p>
          : <div className="space-y-2">{recentNews.map(n => (
            <div key={n.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-700 flex-shrink-0 overflow-hidden">
                {n.cover_image_url && <img src={n.cover_image_url} alt="" className="w-full h-full object-cover" />}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{n.title}</p>
                <p className="text-xs text-gray-400">{new Date(n.published_at || '').toLocaleDateString('fr-FR')}</p>
              </div>
            </div>
          ))}</div>}
        </Widget>

        <Widget title="Activité récente">
          {recentActivity.length === 0 ? <p className="text-gray-400 text-sm py-4 text-center">Aucune activité</p>
          : <div className="space-y-2">{recentActivity.map(a => (
            <div key={a.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
              <span className={`w-2 h-2 rounded-full flex-shrink-0 ${activityColors[a.action] || 'bg-gray-400'}`} />
              <div className="min-w-0 flex-1">
                <p className="text-sm text-gray-900 dark:text-white truncate">
                  {activityText[a.action] || a.action} dans {activityLabels[a.table_name] || a.table_name}
                </p>
                <p className="text-xs text-gray-400">{new Date(a.created_at).toLocaleString('fr-FR')}</p>
              </div>
            </div>
          ))}</div>}
        </Widget>
      </div>
    </div>
  );
}
