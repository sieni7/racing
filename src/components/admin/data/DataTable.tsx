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
  onView?: (item: T) => void;
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

function IconEdit() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>
  );
}

function IconTrash() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  );
}

function IconEye() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  );
}

function IconCopy() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
  );
}

function IconGrid({ active }: { active?: boolean }) {
  return (
    <svg className={`w-4 h-4 ${active ? 'text-primary' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
    </svg>
  );
}

function IconList({ active }: { active?: boolean }) {
  return (
    <svg className={`w-4 h-4 ${active ? 'text-primary' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
    </svg>
  );
}

export function DataTable<T extends { id: string }>({
  data, columns, onEdit, onDelete, onAdd, onView, onBulkDelete, onDuplicate,
  searchPlaceholder = 'Rechercher...', searchFields = [], itemsPerPage = 10,
  addLabel = 'Ajouter', storageKey, readOnly = false, loading = false, extraActions,
}: DataTableProps<T>) {
  const saved = useMemo(() => {
    if (!storageKey) return { search: '', sortKey: null as string | null, sortDirection: 'asc' as const, viewMode: 'list' as 'list' | 'grid' };
    try { return JSON.parse(localStorage.getItem(storageKey) || '{}'); } catch { return { search: '', sortKey: null, sortDirection: 'asc', viewMode: 'list' }; }
  }, [storageKey]);

  const [search, setSearch] = useState(saved.search);
  const [sortKey, setSortKey] = useState<string | null>(saved.sortKey);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>(saved.sortDirection);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>(saved.viewMode || 'list');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [visibleCols, setVisibleCols] = useState<Set<string>>(new Set(columns.map(c => c.key)));
  const [colMenu, setColMenu] = useState(false);

  useEffect(() => {
    if (!storageKey) return;
    localStorage.setItem(storageKey, JSON.stringify({ search, sortKey, sortDirection: sortDir, viewMode }));
  }, [search, sortKey, sortDir, viewMode, storageKey]);

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
  const showActions = (onEdit || onDelete || onDuplicate || onView) && !readOnly;
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

  const renderActions = (item: T) => (
    <div className="flex items-center gap-1.5">
      {onView && (
        <button onClick={() => onView(item)}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 bg-gray-50 dark:bg-gray-700 hover:text-primary hover:bg-primary/10 transition-all" title="Voir">
          <IconEye />
        </button>
      )}
      {onDuplicate && (
        <button onClick={() => onDuplicate(item)}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 bg-gray-50 dark:bg-gray-700 hover:text-primary hover:bg-primary/10 transition-all" title="Dupliquer">
          <IconCopy />
        </button>
      )}
      {onEdit && (
        <button onClick={() => onEdit(item)}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 bg-gray-50 dark:bg-gray-700 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all" title="Modifier">
          <IconEdit />
        </button>
      )}
      {onDelete && (
        <button onClick={() => onDelete(item)}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 bg-gray-50 dark:bg-gray-700 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all" title="Supprimer">
          <IconTrash />
        </button>
      )}
    </div>
  );

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
          <div className="flex bg-gray-100 dark:bg-gray-700 rounded-xl p-0.5">
            <button onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white dark:bg-gray-600 shadow-sm' : ''}`} title="Liste">
              <IconList active={viewMode === 'list'} />
            </button>
            <button onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white dark:bg-gray-600 shadow-sm' : ''}`} title="Grille">
              <IconGrid active={viewMode === 'grid'} />
            </button>
          </div>
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
            <button onClick={onAdd} className="px-5 py-2.5 rounded-xl bg-secondary text-white text-sm font-medium hover:bg-primary shadow-sm">
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

      {viewMode === 'list' ? (
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
                        <td className="px-4 py-3.5 text-right">{renderActions(item)}</td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {paginated.length === 0 ? (
            <div className="col-span-full py-12 text-center text-gray-400">Aucune donnée trouvée.</div>
          ) : (
            paginated.map(item => (
              <div key={item.id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-5 space-y-3 hover:shadow-md transition-shadow">
                {columns.filter(c => visibleCols.has(c.key)).map(col => (
                  <div key={col.key} className="flex items-start gap-2">
                    <span className="text-xs font-semibold text-gray-500 uppercase min-w-[80px] pt-0.5">{col.label}</span>
                    <span className="text-sm text-gray-700 dark:text-gray-300 break-words">
                      {col.render ? col.render(item) : String(item[col.key as keyof T] ?? '')}
                    </span>
                  </div>
                ))}
                {showActions && (
                  <div className="flex justify-end pt-2 border-t border-gray-100 dark:border-gray-700">
                    {renderActions(item)}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

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
