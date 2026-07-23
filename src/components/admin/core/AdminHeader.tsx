import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

interface SearchResult {
  label: string;
  path: string;
  type: string;
  subtitle?: string;
}

export function AdminHeader({ onMenuToggle }: { onMenuToggle: () => void }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    if (!query.trim()) { setResults([]); setOpen(false); return; }
    const term = query.toLowerCase();
    const types = [
      { label: 'Dashboard', path: '/admin', type: 'Page', keywords: ['dashboard', 'tableau', 'board'] },
      { label: 'Joueurs', path: '/admin/players', type: 'Page', keywords: ['joueur', 'player', 'effectif'] },
      { label: 'Matchs', path: '/admin/matches', type: 'Page', keywords: ['match', 'rencontre'] },
      { label: 'Actualités', path: '/admin/news', type: 'Page', keywords: ['actualité', 'news', 'article'] },
      { label: 'Staff', path: '/admin/staff', type: 'Page', keywords: ['staff', 'personnel'] },
      { label: 'Galerie', path: '/admin/gallery', type: 'Page', keywords: ['galerie', 'photo', 'image'] },
      { label: 'Classement', path: '/admin/standings', type: 'Page', keywords: ['classement', 'standing'] },
      { label: 'Push', path: '/admin/send-push', type: 'Page', keywords: ['push', 'notification'] },
      { label: 'Activité', path: '/admin/activity', type: 'Page', keywords: ['activité', 'activity', 'log', 'audit'] },
    ];
    const match = types.filter(t =>
      t.label.toLowerCase().includes(term) || t.keywords.some(k => k.includes(term))
    );
    setResults(match);
    setOpen(match.length > 0);
  }, [query]);

  const select = useCallback((r: SearchResult) => {
    setOpen(false);
    setQuery('');
    navigate(r.path);
  }, [navigate]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const typeColors: Record<string, string> = {
    Page: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    Joueur: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    Match: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  };

  return (
    <header className="h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-4 md:px-6 gap-4">
      <div className="flex items-center gap-3">
        <button onClick={onMenuToggle} className="md:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-500">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      <div ref={wrapperRef} className="relative flex-1 max-w-md">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Rechercher (Ctrl+K)..."
          className="w-full pl-9 pr-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/40 transition-shadow"
        />
        {open && results.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50">
            {results.map((r) => (
              <button
                key={r.path}
                onClick={() => select(r)}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors text-left"
              >
                <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${typeColors[r.type] || 'bg-gray-100 text-gray-600'}`}>{r.type}</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">{r.label}</span>
                {r.subtitle && <span className="text-xs text-gray-400 ml-auto">{r.subtitle}</span>}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-green-400" title="Connecté" />
      </div>
    </header>
  );
}
