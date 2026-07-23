import React, { useState, useMemo, useEffect } from 'react';

export interface Column<T> {
  key: string;
  label: string;
  render?: (item: T) => React.ReactNode;
  sortable?: boolean;
  width?: string;
  hideable?: boolean;
}

interface DataTableProps<T extends { id: string }> {
  data: T[];
  columns: Column<T>[];
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
  onAdd?: () => void;
  onBulkDelete?: (ids: string[]) => void;
  onDuplicate?: (item: T) => void;
  searchPlaceholder?: string;
  searchFields?: string[];
  itemsPerPage?: number;
  addLabel?: string;
  storageKey?: string;
  readOnly?: boolean;
  loading?: boolean;
  extraActions?: React.ReactNode;
}

export function DataTable<T extends { id: string }>({
  data, columns, onEdit, onDelete, onAdd, onBulkDelete, onDuplicate,
  searchPlaceholder = 'Rechercher...', searchFields = [], itemsPerPage = 10,
  addLabel = 'Ajouter', storageKey, readOnly = false, loading = false, extraActions,
}: DataTableProps<T>) {
  const saved = useMemo(() => {
    if (!storageKey) return { search: '', sortKey: null as string | null, sortDirection: 'asc' as const };
    try { return JSON.parse(localStorage.getItem(storageKey) || '{}'); } catch { return { search: '', sortKey: null, sortDirection: 'asc' }; }
  }, [storageKey]);

  const [search, setSearch] = useState(saved.search);
  const [sortKey, setSortKey] = useState<string | null>(saved.sortKey);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>(saved.sortDirection);
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [visibleCols, setVisibleCols] = useState<Set<string>>(new Set(columns.map(c => c.key)));
  const [colMenu, setColMenu] = useState(false);

  useEffect(() => {
    if (!storageKey) return;
    localStorage.setItem(storageKey, JSON.stringify({ search, sortKey, sortDirection: sortDir }));
  }, [search, sortKey, sortDir, storageKey]);

  const filtered = useMemo(() => {
    if (!search || searchFields.length === 0) return data;
    const t = search.toLowerCase();
    return data.filter(item => searchFields.some(f => String(item[f as keyof T] ?? '').toLowerCase().includes(t)));
  }, [data, search, searchFields]);

  const sorted = useMemo(() => {
    if (!sortKey) return filtered;
    return [...filtered].sort((a, b) => {
      const av = a[sortKey as keyof T], bv = b[sortKey as keyof T];
      if (av === bv) return 0;
      const c = String(av).localeCompare(String(bv), 'fr', { numeric: true });
      return sortDir === 'asc' ? c : -c;
    });
  }, [filtered, sortKey, sortDir]);

  const totalPages = Math.ceil(sorted.length / itemsPerPage);
  const paginated = sorted.slice((page - 1) * itemsPerPage, page * itemsPerPage);
  const showActions = (onEdit || onDelete || onDuplicate) && !readOnly;
  const hideableCols = columns.filter(c => c.hideable !== false);

  const handleSort = (key: string) => {
    setSortDir(prev => sortKey === key && prev === 'asc' ? 'desc' : 'asc');
    setSortKey(key);
    setPage(1);
  };

  const toggleAll = () => {
    if (selected.size === paginated.length) setSelected(new Set());
    else setSelected(new Set(paginated.map(i => i.id)));
  };

  const handleBulkDelete = () => {
    if (selected.size === 0) return;
    onBulkDelete?.(Array.from(selected));
    setSelected(new Set());
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-xl w-full" />
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => <div key={i} className="h-12 bg-gray-100 dark:bg-gray-700 rounded-xl" />)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <div className="relative flex-1 min-w-[200px]">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input type="text" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder={searchPlaceholder}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40" />
        </div>
        <div className="flex gap-2 items-center">
          {hideableCols.length > 0 && (
            <div className="relative">
              <button onClick={() => setColMenu(!colMenu)}
                className="px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-primary text-sm">
                Colonnes
              </button>
              {colMenu && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setColMenu(false)} />
                  <div className="absolute right-0 mt-1 w-44 bg-white dark:bg-gray-800 rounded-xl shadow-lg border z-20 py-1">
                    {hideableCols.map(c => (
                      <label key={c.key} className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer text-sm">
                        <input type="checkbox" checked={visibleCols.has(c.key)}
                          onChange={() => setVisibleCols(prev => { const n = new Set(prev); n.has(c.key) ? n.delete(c.key) : n.add(c.key); return n; })}
                          className="accent-primary" />
                        {c.label}
                      </label>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
          {extraActions}
          {onAdd && !readOnly && (
            <button onClick={onAdd} className="px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-medium hover:bg-cta shadow-sm">
              + {addLabel}
            </button>
          )}
        </div>
      </div>

      {selected.size > 0 && (
        <div className="flex items-center gap-3 px-4 py-3 bg-primary/5 border border-primary/20 rounded-xl">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{selected.size} sélectionné{selected.size > 1 ? 's' : ''}</span>
          {onBulkDelete && (
            <button onClick={handleBulkDelete} className="px-3 py-1.5 rounded-lg text-xs font-medium text-red-600 bg-red-50 dark:bg-red-900/20 hover:bg-red-100">Supprimer</button>
          )}
          <button onClick={() => setSelected(new Set())} className="px-3 py-1.5 rounded-lg text-xs font-medium text-gray-500 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 ml-auto">Annuler</button>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
                {showActions && (
                  <th className="px-4 py-3.5 w-10">
                    <input type="checkbox" checked={paginated.length > 0 && selected.size === paginated.length}
                      onChange={toggleAll} className="accent-primary" />
                  </th>
                )}
                {columns.filter(c => visibleCols.has(c.key)).map(col => (
                  <th key={col.key}
                    onClick={() => col.sortable !== false && handleSort(col.key)}
                    className={`px-4 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider ${col.sortable !== false ? 'cursor-pointer hover:text-gray-700' : ''}`}
                    style={col.width ? { width: col.width } : undefined}>
                    <span className="flex items-center gap-1">
                      {col.label}
                      {sortKey === col.key && <span className="text-primary">{sortDir === 'asc' ? '↑' : '↓'}</span>}
                    </span>
                  </th>
                ))}
                {showActions && <th className="px-4 py-3.5 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={columns.length + (showActions ? 2 : 0)} className="px-4 py-12 text-center text-gray-400">
                    Aucune donnée trouvée.
                  </td>
                </tr>
              ) : (
                paginated.map(item => (
                  <tr key={item.id}
                    className={`hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors ${selected.has(item.id) ? 'bg-primary/5' : ''}`}>
                    {showActions && (
                      <td className="px-4 py-3.5">
                        <input type="checkbox" checked={selected.has(item.id)}
                          onChange={() => setSelected(prev => { const n = new Set(prev); n.has(item.id) ? n.delete(item.id) : n.add(item.id); return n; })}
                          className="accent-primary" />
                      </td>
                    )}
                    {columns.filter(c => visibleCols.has(c.key)).map(col => (
                      <td key={col.key} className="px-4 py-3.5 text-sm text-gray-700 dark:text-gray-300">
                        {col.render ? col.render(item) : String(item[col.key as keyof T] ?? '')}
                      </td>
                    ))}
                    {showActions && (
                      <td className="px-4 py-3.5 text-right space-x-2">
                        {onDuplicate && (
                          <button onClick={() => onDuplicate(item)}
                            className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-gray-500 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100" title="Dupliquer">⎘</button>
                        )}
                        {onEdit && (
                          <button onClick={() => onEdit(item)}
                            className="px-3 py-1.5 rounded-lg text-xs font-medium text-blue-600 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100">Modifier</button>
                        )}
                        {onDelete && (
                          <button onClick={() => onDelete(item)}
                            className="px-3 py-1.5 rounded-lg text-xs font-medium text-red-600 bg-red-50 dark:bg-red-900/20 hover:bg-red-100">Supprimer</button>
                        )}
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">{page} / {totalPages} ({sorted.length} éléments)</span>
          <div className="flex gap-2">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              className="px-4 py-2 rounded-xl text-sm font-medium border border-gray-200 dark:border-gray-700 text-gray-600 hover:border-primary disabled:opacity-40 disabled:cursor-not-allowed">← Précédent</button>
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              className="px-4 py-2 rounded-xl text-sm font-medium border border-gray-200 dark:border-gray-700 text-gray-600 hover:border-primary disabled:opacity-40 disabled:cursor-not-allowed">Suivant →</button>
          </div>
        </div>
      )}
    </div>
  );
}
