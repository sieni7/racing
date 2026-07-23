import React from 'react';
import { exportCSV, exportPDF } from '../../utils/export';

interface ExportButtonProps<T extends Record<string, unknown>> {
  data: T[];
  columns: { key: string; label: string }[];
  filename: string;
  title?: string;
}

export function ExportButton<T extends Record<string, unknown>>({ data, columns, filename, title }: ExportButtonProps<T>) {
  const [open, setOpen] = React.useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="px-4 py-2.5 rounded-xl text-sm font-medium border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-primary transition-all flex items-center gap-2"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        Exporter
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 z-20 py-1">
            <button
              onClick={() => { exportCSV(data, columns, filename); setOpen(false); }}
              className="w-full px-4 py-2.5 text-sm text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              📄 CSV
            </button>
            <button
              onClick={() => { exportPDF(data, columns, title || filename, filename); setOpen(false); }}
              className="w-full px-4 py-2.5 text-sm text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              📕 PDF
            </button>
          </div>
        </>
      )}
    </div>
  );
}
