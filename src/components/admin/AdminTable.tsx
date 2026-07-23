import React, { useState, useMemo, useEffect, useCallback } from 'react';

interface Column<T> {
  key: string;
  label: string;
  render?: (item: T) => React.ReactNode;
  sortable?: boolean;
}

interface AdminTableProps<T extends { id: string }> {
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
}

export function AdminTable<T extends { id: string }>({
  data,
  columns,
  onEdit,
  onDelete,
  onAdd,
  onBulkDelete,
  onDuplicate,
  searchPlaceholder = 'Rechercher...',
  searchFields = [],
  itemsPerPage = 10,
  addLabel = 'Ajouter',
  storageKey,
  readOnly = false,
}: AdminTableProps<T>) {
  const savedFilters = useMemo(() => {
    if (!storageKey) return { search: '', sortKey: null, sortDirection: 'asc' as const };
    try {
      const raw = localStorage.getItem(storageKey);
      return raw ? JSON.parse(raw) : { search: '', sortKey: null, sortDirection: 'asc' };
    } catch {
      return { search: '', sortKey: null, sortDirection: 'asc' };
    }
  }, [storageKey]);

  const [search, setSearch] = useState(savedFilters.search);
  const [sortKey, setSortKey] = useState<string | null>(savedFilters.sortKey);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>(savedFilters.sortDirection);
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!storageKey) return;
    localStorage.setItem(storageKey, JSON.stringify({ search, sortKey, sortDirection }));
  }, [search, sortKey, sortDirection, storageKey]);

  const filtered = useMemo(() => {
    if (!search || searchFields.length === 0) return data;
    const term = search.toLowerCase();
    return data.filter((item) =>
      searchFields.some((field) => {
        const value = item[field as keyof T];
        return value && String(value).toLowerCase().includes(term);
      })
    );
  }, [data, search, searchFields]);

  const sorted = useMemo(() => {
    if (!sortKey) return filtered;
    return [...filtered].sort((a, b) => {
      const aVal = a[sortKey as keyof T];
      const bVal = b[sortKey as keyof T];
      if (aVal === bVal) return 0;
      const comparison = String(aVal).localeCompare(String(bVal), 'fr', { numeric: true });
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [filtered, sortKey, sortDirection]);

  const totalPages = Math.ceil(sorted.length / itemsPerPage);
  const paginated = sorted.slice((page - 1) * itemsPerPage, page * itemsPerPage);
  const showBulk = onBulkDelete || onDelete;

  const handleSort = useCallback((key: string) => {
    setSortDirection((prev) => (sortKey === key && prev === 'asc' ? 'desc' : 'asc'));
    setSortKey(key);
    setPage(1);
  }, [sortKey]);

  const toggleAll = useCallback(() => {
    if (selected.size === paginated.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(paginated.map(i => i.id)));
    }
  }, [paginated, selected]);

  const toggleOne = useCallback((id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }, []);

  const handleBulkDelete = useCallback(() => {
    if (selected.size === 0) return;
    onBulkDelete?.(Array.from(selected));
    setSelected(new Set());
  }, [selected, onBulkDelete]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <div className="relative flex-1 min-w-[200px]">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={search}
            placeholder={searchPlaceholder}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 transition-shadow"
          />
        </div>
        <div className="flex gap-2">
          {onAdd && !readOnly && (
            <button onClick={onAdd} className="px-5 py-2.5 rounded-xl bg-secondary text-white text-sm font-medium hover:bg-primary transition-all shadow-sm">
              + {addLabel}
            </button>
          )}
        </div>
      </div>

      {selected.size > 0 && (
        <div className="flex items-center gap-3 px-4 py-3 bg-primary/5 dark:bg-primary/10 border border-primary/20 rounded-xl">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{selected.size} sélectionné{selected.size > 1 ? 's' : ''}</span>
          {onBulkDelete && (
            <button onClick={handleBulkDelete} className="px-3 py-1.5 rounded-lg text-xs font-medium text-red-600 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors">
              Supprimer
            </button>
          )}
          <button onClick={() => setSelected(new Set())} className="px-3 py-1.5 rounded-lg text-xs font-medium text-gray-500 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors ml-auto">
            Annuler
          </button>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-100 dark:border-gray-700">
                {showBulk && (
                  <th className="px-4 py-3.5 w-10">
                    <input
                      type="checkbox"
                      checked={paginated.length > 0 && selected.size === paginated.length}
                      onChange={toggleAll}
                      className="rounded border-gray-300 dark:border-gray-600 accent-primary"
                    />
                  </th>
                )}
                {columns.map((col) => (
                  <th
                    key={col.key}
                    onClick={() => col.sortable !== false && handleSort(col.key)}
                    className={`px-4 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider ${
                      col.sortable !== false ? 'cursor-pointer hover:text-gray-700 dark:hover:text-gray-200' : ''
                    }`}
                  >
                    <span className="flex items-center gap-1">
                      {col.label}
                      {sortKey === col.key && (
                        <span className="text-primary">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </span>
                  </th>
                ))}
                {(onEdit || onDelete || onDuplicate) && !readOnly && (
                  <th className="px-4 py-3.5 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {paginated.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length + (showBulk ? 1 : 0) + (onEdit || onDelete || onDuplicate ? 1 : 0)}
                    className="px-4 py-12 text-center text-gray-500 dark:text-gray-400"
                  >
                    Aucune donnée trouvée.
                  </td>
                </tr>
              ) : (
                paginated.map((item) => (
                  <tr
                    key={item.id}
                    className={`hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors ${
                      selected.has(item.id) ? 'bg-primary/5 dark:bg-primary/10' : ''
                    }`}
                  >
                    {showBulk && (
                      <td className="px-4 py-3.5">
                        <input
                          type="checkbox"
                          checked={selected.has(item.id)}
                          onChange={() => toggleOne(item.id)}
                          className="rounded border-gray-300 dark:border-gray-600 accent-primary"
                        />
                      </td>
                    )}
                    {columns.map((col) => (
                      <td key={col.key} className="px-4 py-3.5 text-sm text-gray-700 dark:text-gray-300">
                        {col.render ? col.render(item) : String(item[col.key as keyof T] ?? '')}
                      </td>
                    ))}
                    {(onEdit || onDelete || onDuplicate) && !readOnly && (
                      <td className="px-4 py-3.5 text-right space-x-2">
                        {onDuplicate && (
                          <button
                            onClick={() => onDuplicate(item)}
                            className="px-3 py-1.5 rounded-lg text-xs font-medium text-gray-600 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                            title="Dupliquer"
                          >
                            ⎘
                          </button>
                        )}
                        {onEdit && (
                          <button
                            onClick={() => onEdit(item)}
                            className="px-3 py-1.5 rounded-lg text-xs font-medium text-blue-600 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                          >
                            Modifier
                          </button>
                        )}
                        {onDelete && (
                          <button
                            onClick={() => onDelete(item)}
                            className="px-3 py-1.5 rounded-lg text-xs font-medium text-red-600 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                          >
                            Supprimer
                          </button>
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
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Page {page} / {totalPages} ({sorted.length} éléments)
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 rounded-xl text-sm font-medium border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-primary disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              ← Précédent
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 rounded-xl text-sm font-medium border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-primary disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              Suivant →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
