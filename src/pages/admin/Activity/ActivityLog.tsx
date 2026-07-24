import { useEffect, useState } from 'react';
import { getAuditLog, type AuditEntry } from '../../../lib/audit';

const actionColors: Record<string, string> = {
  CREATE: 'text-green-600 bg-green-50 dark:bg-green-900/20',
  UPDATE: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20',
  DELETE: 'text-red-600 bg-red-50 dark:bg-red-900/20',
  RESTORE: 'text-purple-600 bg-purple-50 dark:bg-purple-900/20',
};
const actionLabels: Record<string, string> = { CREATE: 'Création', UPDATE: 'Modification', DELETE: 'Suppression', RESTORE: 'Restauration' };
const tableLabels: Record<string, string> = { players: 'Joueurs', matches: 'Matchs', news: 'Actualités', staff: 'Staff', gallery: 'Galerie', standings: 'Classement', top_scorers: 'Meilleurs buteurs', players_of_month: 'Joueurs du mois', newsletter_subscriptions: 'Newsletter' };

export default function ActivityLog() {
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('');

  useEffect(() => {
    getAuditLog({ limit: 200 }).then(setEntries).catch(console.error).finally(() => setLoading(false));
  }, []);

  const filtered = filter ? entries.filter(e => e.table_name === filter) : entries;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-gray-900 dark:text-white">Activité</h1>
          <p className="text-sm text-gray-500">{entries.length} événements</p>
        </div>
        <select value={filter} onChange={e => setFilter(e.target.value)}
          className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm">
          <option value="">Toutes les entités</option>
          {Object.entries(tableLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="space-y-3">{[...Array(8)].map((_, i) => <div key={i} className="h-16 bg-gray-100 dark:bg-gray-700 rounded-xl animate-pulse" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-gray-400">Aucune activité enregistrée.</div>
      ) : (
        <div className="space-y-2">
          {filtered.map(entry => (
            <div key={entry.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4 flex items-start gap-4">
              <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${entry.action === 'CREATE' ? 'bg-green-500' : entry.action === 'UPDATE' ? 'bg-blue-500' : entry.action === 'DELETE' ? 'bg-red-500' : 'bg-purple-500'}`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${actionColors[entry.action] || ''}`}>{actionLabels[entry.action] || entry.action}</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">{tableLabels[entry.table_name] || entry.table_name}</span>
                  {entry.changed_fields && Object.keys(entry.changed_fields).length > 0 && (
                    <span className="text-xs text-gray-400">{Object.keys(entry.changed_fields).length} champ(s) modifié(s)</span>
                  )}
                </div>
                <p className="text-xs text-gray-400 mt-1">{new Date(entry.created_at).toLocaleString('fr-FR')}</p>
                {entry.changed_fields && Object.keys(entry.changed_fields).length > 0 && (
                  <div className="mt-2 space-y-1">
                    {Object.entries(entry.changed_fields).slice(0, 3).map(([key, val]) => (
                      <div key={key} className="flex items-center gap-2 text-xs">
                        <span className="font-medium text-gray-500 w-20 truncate">{key}</span>
                        <span className="text-red-500 line-through bg-red-50 dark:bg-red-900/20 rounded px-1.5">{String(val.old ?? '—')}</span>
                        <svg className="w-3 h-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                        <span className="text-green-600 bg-green-50 dark:bg-green-900/20 rounded px-1.5">{String(val.new ?? '—')}</span>
                      </div>
                    ))}
                    {Object.keys(entry.changed_fields).length > 3 && (
                      <p className="text-xs text-gray-400">...et {Object.keys(entry.changed_fields).length - 3} autre(s)</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
