import React, { useEffect, useState, useRef } from 'react';
import Papa from 'papaparse';
import { useFocusTrap } from '../../hooks/useFocusTrap';
import { ModalWrapper } from './ModalWrapper';
import { ConfirmModal } from './ConfirmModal';

interface ImportColumn {
  key: string;
  label: string;
}

interface ImportModalProps {
  open: boolean;
  onClose: () => void;
  onImport: (rows: Record<string, unknown>[]) => Promise<void>;
  columns: ImportColumn[];
  title?: string;
}

export const ImportModal: React.FC<ImportModalProps> = ({ open, onClose, onImport, columns, title = 'Import CSV' }) => {
  const trapRef = useFocusTrap(open);
  const [preview, setPreview] = useState<Record<string, unknown>[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [totalRows, setTotalRows] = useState(0);
  const [error, setError] = useState('');
  const [confirmClose, setConfirmClose] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) { setPreview([]); setHeaders([]); setProgress(0); setTotalRows(0); return; }
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') handleClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onClose]);

  if (!open) return null;

  const handleClose = () => {
    if (preview.length > 0) setConfirmClose(true);
    else onClose();
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError('');
    Papa.parse(file, {
      header: true, skipEmptyLines: true, preview: 5,
      complete: (results) => { setHeaders(results.meta.fields || []); setPreview(results.data as Record<string, unknown>[]); },
      error: () => setError('Erreur de lecture du fichier'),
    });
  };

  const handleImport = async () => {
    if (!fileRef.current?.files?.[0]) return;
    setLoading(true); setError(''); setProgress(0);
    Papa.parse(fileRef.current.files[0], {
      header: true, skipEmptyLines: true,
      step: () => { setTotalRows(prev => prev + 1); },
      complete: async (results) => {
        const rows = results.data as Record<string, unknown>[];
        setTotalRows(rows.length);
        try {
          await onImport(rows);
          setProgress(rows.length);
          onClose();
        } catch { setError("Erreur lors de l'import"); }
        setLoading(false);
      },
      error: () => { setError('Erreur de lecture du fichier'); setLoading(false); },
    });
  };

  const columnKeys = columns.map(c => c.key);
  const missingHeaders = columnKeys.filter(k => !headers.includes(k));

  return (
    <>
      <ModalWrapper open={open} onClose={handleClose} size="lg" ref={trapRef}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-display font-bold text-gray-900 dark:text-white">{title}</h2>
            <button onClick={handleClose} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Fichier CSV</label>
            <input ref={fileRef} type="file" accept=".csv" onChange={handleFile}
              className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-medium file:bg-secondary file:text-white hover:file:bg-primary" />
            <p className="text-xs text-gray-400 mt-1">Colonnes attendues : {columns.map(c => c.label).join(', ')}</p>
          </div>
          {error && <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm mb-4">{error}</div>}
          {loading && (
            <div className="mb-4">
              <div className="h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div className="h-full bg-primary animate-pulse rounded-full" style={{ width: totalRows > 0 ? `${Math.min(100, (progress / totalRows) * 100)}%` : '100%' }} />
              </div>
              <p className="text-xs text-gray-400 mt-1">Import en cours{totalRows > 0 ? ` (${progress}/${totalRows} lignes)` : '...'}</p>
            </div>
          )}
          {missingHeaders.length > 0 && (
            <div className="p-3 rounded-xl bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 text-sm mb-4">
              Colonnes manquantes : {missingHeaders.join(', ')}
            </div>
          )}
          {preview.length > 0 && (
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Aperçu ({preview.length} lignes)</p>
              <div className="overflow-x-auto border border-gray-200 dark:border-gray-700 rounded-xl">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-gray-700">
                      {columns.map(c => <th key={c.key} className="px-3 py-2 text-left font-medium text-gray-500 dark:text-gray-400">{c.label}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {preview.map((row, i) => (
                      <tr key={i} className="border-t border-gray-100 dark:border-gray-700">
                        {columns.map(c => (
                          <td key={c.key} className="px-3 py-2 text-gray-700 dark:text-gray-300 truncate max-w-[120px]">{String(row[c.key] ?? '')}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          <div className="flex justify-end gap-3 pt-4 border-t dark:border-gray-700">
            <button onClick={handleClose}
              className="px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
              Annuler
            </button>
            <button onClick={handleImport}
              disabled={!fileRef.current?.files?.[0] || loading || missingHeaders.length > 0}
              className="px-5 py-2.5 rounded-xl bg-secondary text-white text-sm font-medium hover:bg-primary transition-colors disabled:opacity-50 shadow-sm">
              {loading ? `Import...` : 'Importer'}
            </button>
          </div>
        </div>
      </ModalWrapper>

      <ConfirmModal isOpen={confirmClose} title="Annuler l'import ?"
        message="Les données chargées seront perdues." 
        onConfirm={() => { setConfirmClose(false); setPreview([]); setHeaders([]); onClose(); }}
        onCancel={() => setConfirmClose(false)} />
    </>
  );
};
