import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getAuditLog, type AuditEntry } from '../../lib/audit';

interface AuditHistoryProps {
  tableName?: string;
  recordId?: string;
  open: boolean;
  onClose: () => void;
}

function ChangedFields({ fields }: { fields: Record<string, { old: unknown; new: unknown }> | null }) {
  if (!fields || Object.keys(fields).length === 0) return <span className="text-gray-400 text-xs">Aucun champ modifié</span>;
  return (
    <div className="space-y-2 mt-2">
      {Object.entries(fields).map(([key, val]) => (
        <div key={key} className="grid grid-cols-3 gap-2 text-xs">
          <span className="font-medium text-gray-500 dark:text-gray-400 truncate">{key}</span>
          <span className="text-red-500 line-through bg-red-50 dark:bg-red-900/20 rounded px-1.5 py-0.5 truncate">{String(val.old ?? '—')}</span>
          <span className="text-green-600 bg-green-50 dark:bg-green-900/20 rounded px-1.5 py-0.5 truncate">{String(val.new ?? '—')}</span>
        </div>
      ))}
    </div>
  );
}

const actionColors: Record<string, string> = {
  CREATE: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  UPDATE: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  DELETE: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  RESTORE: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
};

const actionLabels: Record<string, string> = {
  CREATE: 'Création', UPDATE: 'Modification', DELETE: 'Suppression', RESTORE: 'Restauration',
};

export const AuditHistory: React.FC<AuditHistoryProps> = ({ tableName, recordId, open, onClose }) => {
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    getAuditLog({ tableName, recordId, limit: 100 })
      .then(setEntries).catch(console.error).finally(() => setLoading(false));
  }, [open, tableName, recordId]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', handler); document.body.style.overflow = ''; };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backdropFilter: 'blur(6px)' }}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={onClose} role="dialog" aria-modal="true">
          <motion.div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h2 className="text-xl font-display font-bold text-gray-900 dark:text-white">Historique des modifications</h2>
              <button onClick={onClose} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              {loading ? (
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => <div key={i} className="h-16 bg-gray-100 dark:bg-gray-700 rounded-xl animate-pulse" />)}
                </div>
              ) : entries.length === 0 ? (
                <p className="text-center text-gray-400 py-8">Aucun historique disponible.</p>
              ) : (
                <div className="space-y-3">
                  {entries.map((entry) => (
                    <div key={entry.id} className="p-4 rounded-xl border border-gray-100 dark:border-gray-700">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${actionColors[entry.action] || 'bg-gray-100 text-gray-600'}`}>
                            {actionLabels[entry.action] || entry.action}
                          </span>
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{entry.table_name}</span>
                        </div>
                        <span className="text-xs text-gray-400">
                          {new Date(entry.created_at).toLocaleString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      {entry.changed_fields && <ChangedFields fields={entry.changed_fields} />}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
