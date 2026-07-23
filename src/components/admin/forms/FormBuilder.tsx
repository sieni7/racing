import React, { useState, useEffect, useRef } from 'react';

export interface Field {
  name: string;
  label: string;
  type?: 'text' | 'email' | 'password' | 'number' | 'date' | 'datetime-local' | 'select' | 'textarea' | 'file' | 'checkbox';
  options?: { value: string; label: string }[];
  suggestions?: string[];
  placeholder?: string;
  required?: boolean;
  dependsOn?: { field: string; value: string };
}

interface FormBuilderProps {
  fields: Field[];
  values: Record<string, any>;
  onChange: (name: string, value: any) => void;
  onSubmit: () => void;
  onCancel: () => void;
  title: string;
  loading?: boolean;
  errors?: Record<string, string>;
}

export function FormBuilder({ fields, values, onChange, onSubmit, onCancel, title, loading, errors = {} }: FormBuilderProps) {
  const [touched, setTouched] = useState<Set<string>>(new Set());
  const [localErrors, setLocalErrors] = useState<Record<string, string>>({});
  const [focusMode, setFocusMode] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);

  const debouncedValues = useDebounce(values, 300);

  useEffect(() => {
    const e: Record<string, string> = {};
    for (const f of fields) {
      if (!touched.has(f.name)) continue;
      const v = debouncedValues[f.name];
      if (f.required && (!v || (typeof v === 'string' && !v.trim()))) e[f.name] = `${f.label} est requis`;
      if (f.type === 'email' && v && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v))) e[f.name] = 'Email invalide';
      if (f.type === 'number' && v && isNaN(Number(v))) e[f.name] = 'Valeur numérique invalide';
    }
    setLocalErrors(e);
  }, [debouncedValues, fields, touched]);

  const visibleFields = fields.filter(f => {
    if (!f.dependsOn) return true;
    return values[f.dependsOn.field] === f.dependsOn.value;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const all = new Set(fields.map(f => f.name));
    setTouched(all);
    const hasErr = visibleFields.some(f => f.required && (!values[f.name] || (typeof values[f.name] === 'string' && !values[f.name].trim())));
    if (!hasErr) onSubmit();
  };

  const allErrors = { ...localErrors, ...errors };

  return (
    <div className={`fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 transition-all ${focusMode ? 'bg-black/80' : ''}`} onClick={onCancel}>
      <div ref={dialogRef}
        className={`bg-white dark:bg-gray-800 rounded-2xl shadow-2xl flex flex-col transition-all ${focusMode ? 'w-full max-w-4xl max-h-[95vh]' : 'w-full max-w-2xl max-h-[90vh]'}`}
        onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h2 className="text-xl font-display font-bold text-gray-900 dark:text-white">{title}</h2>
          <div className="flex items-center gap-2">
            <button onClick={() => setFocusMode(!focusMode)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 text-xs" title="Mode Focus">
              {focusMode ? '⊞' : '⊟'}
            </button>
            <button onClick={onCancel} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {visibleFields.map(field => (
              <FormField key={field.name} field={field} value={values[field.name]} onChange={(v) => { onChange(field.name, v); setTouched(prev => new Set(prev).add(field.name)); }}
                error={allErrors[field.name]} />
            ))}
          </form>
        </div>
        <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <span className="text-[10px] text-gray-400">Ctrl+Enter soumettre · Escape annuler · ⊟ Mode focus</span>
          <div className="flex gap-3">
            <button type="button" onClick={onCancel}
              className="px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
              Annuler
            </button>
            <button type="submit" disabled={loading} onClick={handleSubmit}
              className="px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-medium hover:bg-cta disabled:opacity-50 shadow-sm">
              {loading ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function FormField({ field, value, onChange, error }: { field: Field; value: any; onChange: (v: any) => void; error?: string }) {
  const id = `field-${field.name}`;
  const base = 'w-full px-4 py-2.5 border rounded-xl text-sm bg-white dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all';
  const errBorder = error ? 'border-red-400' : '';

  if (field.type === 'select') {
    return (
      <div>
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{field.label}{field.required && <span className="text-red-500 ml-1">*</span>}</label>
        <select id={id} value={value || ''} onChange={e => onChange(e.target.value)} className={`${base} ${errBorder}`}>
          <option value="">Sélectionner...</option>
          {field.options?.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
      </div>
    );
  }

  if (field.type === 'textarea') {
    return (
      <div>
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{field.label}{field.required && <span className="text-red-500 ml-1">*</span>}</label>
        <textarea id={id} value={value || ''} onChange={e => onChange(e.target.value)} placeholder={field.placeholder}
          className={`${base} ${errBorder} min-h-[100px]`} />
        {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
      </div>
    );
  }

  if (field.type === 'file') {
    return (
      <div>
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{field.label}</label>
        <input id={id} type="file" onChange={e => onChange(e.target.files?.[0] || null)} className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-medium file:bg-primary file:text-white hover:file:bg-cta" accept="image/*" />
      </div>
    );
  }

  if (field.type === 'checkbox') {
    return (
      <label className="flex items-center gap-2 cursor-pointer">
        <input type="checkbox" checked={!!value} onChange={e => onChange(e.target.checked)} className="accent-primary w-4 h-4" />
        <span className="text-sm text-gray-700 dark:text-gray-300">{field.label}</span>
      </label>
    );
  }

  const listId = field.suggestions ? `${id}-list` : undefined;
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{field.label}{field.required && <span className="text-red-500 ml-1">*</span>}</label>
      <input id={id} type={field.type || 'text'} value={value || ''} onChange={e => onChange(e.target.value)}
        placeholder={field.placeholder} list={listId}
        className={`${base} ${errBorder}`} autoComplete={field.suggestions ? 'off' : undefined} />
      {field.suggestions && <datalist id={listId}>{field.suggestions.map(s => <option key={s} value={s} />)}</datalist>}
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => { const t = setTimeout(() => setDebounced(value), delay); return () => clearTimeout(t); }, [value, delay]);
  return debounced;
}
