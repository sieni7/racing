import { useEffect, useState, useRef } from 'react';
import { useAdmin } from '../../../contexts/AdminContext';
import { getStandings } from '../../../lib/standings';
import { getAuditLog } from '../../../lib/audit';

function StatCard({ label, value, color, icon }: { label: string; value: number | string; color: string; icon: string }) {
  return (
    <div className={`rounded-xl bg-gradient-to-br ${color} p-5 text-white`}>
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

function Widget({ title, children, className = '' }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-5 flex flex-col ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display font-bold text-sm text-gray-900 dark:text-white flex items-center gap-2">
          <span className="w-1 h-4 bg-primary rounded-full inline-block" />
          {title}
        </h3>
      </div>
      <div className="flex-1 min-h-0">{children}</div>
    </div>
  );
}

export default function Dashboard() {
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
  const winRate = finished.length ? Math.round((won / finished.length) * 100) : 0;
  const upcoming = matches.filter(m => m.status === 'upcoming').sort((a, b) => new Date(a.match_date).getTime() - new Date(b.match_date).getTime());
  const recentNews = [...news].sort((a, b) => new Date(b.published_at || '').getTime() - new Date(a.published_at || '').getTime()).slice(0, 4);

  const stats = [
    { label: 'Joueurs', value: players.length, color: 'from-secondary to-navy-700', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197' },
    { label: 'Matchs', value: matches.length, color: 'from-primary to-sky-600', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
    { label: 'Actualités', value: news.length, color: 'from-cta to-red-600', icon: 'M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1' },
    { label: 'Staff', value: staff.length, color: 'from-green-600 to-green-700', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857' },
  ];

  const tableLabels: Record<string, string> = { players: 'Joueurs', matches: 'Matchs', news: 'Actualités', staff: 'Staff' };

  if (!ready) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-display font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <div key={i} className="h-24 rounded-xl bg-gray-100 dark:bg-gray-800 animate-pulse" />)}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1,2,3].map(i => <div key={i} className="h-40 rounded-2xl bg-gray-100 dark:bg-gray-800 animate-pulse" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-display font-bold text-gray-900 dark:text-white">Dashboard</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(s => <StatCard key={s.label} {...s} />)}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Widget title="Taux de victoire">
          <div className="flex flex-col items-center justify-center py-4">
            <div className="relative w-24 h-24">
              <svg className="w-24 h-24 -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="15.5" fill="none" stroke="currentColor" strokeWidth="3" className="text-gray-200 dark:text-gray-700" />
                <circle cx="18" cy="18" r="15.5" fill="none" stroke="#59C7F7" strokeWidth="3" strokeDasharray={`${winRate},100`} strokeLinecap="round" />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-2xl font-black text-gray-900 dark:text-white">{winRate}%</span>
            </div>
            <p className="text-xs text-gray-400 mt-3">{finished.length} matchs · {won} victoires</p>
          </div>
        </Widget>

        <Widget title="Leader classement">
          <div className="flex flex-col items-center justify-center py-4 text-center">
            {topTeam ? (
              <><span className="text-4xl mb-2">🏆</span><p className="font-bold text-gray-900 dark:text-white text-lg">{topTeam.team_name}</p><p className="text-primary font-black text-2xl">{topTeam.points} pts</p></>
            ) : <p className="text-gray-400 text-sm">Aucune donnée</p>}
          </div>
        </Widget>

        <Widget title="Prochain match">
          <div className="flex flex-col justify-center py-4">
            {upcoming[0] ? (
              <>
                <p className="font-semibold text-gray-900 dark:text-white text-lg">
                  {upcoming[0].is_home ? 'RCB' : upcoming[0].opponent_name} vs {upcoming[0].is_home ? upcoming[0].opponent_name : 'RCB'}
                </p>
                <p className="text-sm text-gray-500">{new Date(upcoming[0].match_date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })} · {upcoming[0].competition}</p>
              </>
            ) : <p className="text-gray-400 text-sm">Aucun match à venir</p>}
          </div>
        </Widget>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Widget title="Dernières actualités">
          {recentNews.length === 0 ? <p className="text-gray-400 text-sm py-4 text-center">Aucune actualité</p>
          : <div className="space-y-2">{recentNews.map(n => (
            <div key={n.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/30">
              <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-700 flex-shrink-0 overflow-hidden">
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
            <div key={a.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/30">
              <span className={`w-2 h-2 rounded-full flex-shrink-0 ${a.action === 'CREATE' ? 'bg-green-500' : a.action === 'UPDATE' ? 'bg-blue-500' : 'bg-red-500'}`} />
              <div className="min-w-0 flex-1">
                <p className="text-sm text-gray-900 dark:text-white truncate">
                  {a.action === 'CREATE' ? 'Création' : a.action === 'UPDATE' ? 'Modification' : 'Suppression'} dans {tableLabels[a.table_name] || a.table_name}
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
