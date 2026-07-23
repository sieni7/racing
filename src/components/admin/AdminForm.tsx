import React, { useState, useCallback, useEffect, useRef } from 'react';

interface Field {
  name: string;
  label: string;
  type?: 'text' | 'email' | 'password' | 'number' | 'date' | 'datetime-local' | 'select' | 'textarea' | 'file';
  options?: { value: string; label: string }[];
  suggestions?: string[];
  placeholder?: string;
  required?: boolean;
}

interface AdminFormProps {
  fields: Field[];
  values: Record<string, any>;
  onChange: (name: string, value: any) => void;
  onSubmit: () => void;
  onCancel: () => void;
  title: string;
  loading?: boolean;
  errors?: Record<string, string>;
}

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

export const AdminForm: React.FC<AdminFormProps> = ({
  fields,
  values,
  onChange,
  onSubmit,
  onCancel,
  title,
  loading = false,
  errors = {},
}) => {
  const [localErrors, setLocalErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Set<string>>(new Set());
  const dialogRef = useRef<HTMLDivElement>(null);

  const debouncedValues = useDebounce(values, 300);

  useEffect(() => {
    const newErrors: Record<string, string> = {};
    for (const field of fields) {
      if (!touched.has(field.name)) continue;
      const val = debouncedValues[field.name];
      if (field.required && (!val || (typeof val === 'string' && !val.trim()))) {
        newErrors[field.name] = `${field.label} est requis`;
      }
      if (field.type === 'email' && val && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(val))) {
        newErrors[field.name] = 'Email invalide';
      }
      if (field.type === 'number' && val && isNaN(Number(val))) {
        newErrors[field.name] = 'Valeur numérique invalide';
      }
    }
    setLocalErrors(newErrors);
  }, [debouncedValues, fields, touched]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const allTouched = new Set(fields.map(f => f.name));
    setTouched(allTouched);
    const hasErrors = fields.some(f => {
      const val = values[f.name];
      return f.required && (!val || (typeof val === 'string' && !val.trim()));
    });
    if (!hasErrors) onSubmit();
  };

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSubmit(e);
    }
    if (e.key === 'Escape') {
      onCancel();
    }
  }, [values, fields]);

  const allErrors = { ...localErrors, ...errors };

  const renderField = (field: Field) => {
    const err = allErrors[field.name];
    const id = `field-${field.name}`;

    const baseInput = 'w-full px-4 py-2.5 border rounded-xl text-sm bg-white dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-racing-sky/40 transition-all';
    const errorBorder = err ? 'border-red-400 dark:border-red-500' : '';

    if (field.type === 'select') {
      return (
        <select
          id={id}
          value={values[field.name] || ''}
          onChange={(e) => { onChange(field.name, e.target.value); setTouched(prev => new Set(prev).add(field.name)); }}
          className={`${baseInput} ${errorBorder}`}
          required={field.required}
        >
          <option value="">Sélectionner...</option>
          {field.options?.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      );
    }

    if (field.type === 'textarea') {
      return (
        <textarea
          id={id}
          value={values[field.name] || ''}
          onChange={(e) => { onChange(field.name, e.target.value); setTouched(prev => new Set(prev).add(field.name)); }}
          placeholder={field.placeholder}
          className={`${baseInput} ${errorBorder} min-h-[100px]`}
          required={field.required}
        />
      );
    }

    if (field.type === 'file') {
      return (
        <input
          id={id}
          type="file"
          onChange={(e) => { onChange(field.name, e.target.files?.[0] || null); setTouched(prev => new Set(prev).add(field.name)); }}
          className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-medium file:bg-secondary file:text-white hover:file:bg-primary"
          accept="image/*"
        />
      );
    }

    const inputType = field.type || 'text';
    const listId = field.suggestions ? `${id}-list` : undefined;

    return (
      <>
        <input
          id={id}
          type={inputType}
          value={values[field.name] || ''}
          onChange={(e) => { onChange(field.name, e.target.value); setTouched(prev => new Set(prev).add(field.name)); }}
          placeholder={field.placeholder}
          className={`${baseInput} ${errorBorder}`}
          required={field.required}
          list={listId}
          autoComplete={field.suggestions ? 'off' : undefined}
        />
        {field.suggestions && (
          <datalist id={listId}>
            {field.suggestions.map(s => <option key={s} value={s} />)}
          </datalist>
        )}
      </>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onCancel}>
      <div
        ref={dialogRef}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-display font-bold text-gray-900 dark:text-white">{title}</h2>
            <button onClick={onCancel} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-gray-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            {fields.map((field) => (
              <div key={field.name}>
                <label htmlFor={`field-${field.name}`} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  {field.label}
                  {field.required && <span className="text-red-500 ml-1">*</span>}
                </label>
                {renderField(field)}
                {allErrors[field.name] && (
                  <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {allErrors[field.name]}
                  </p>
                )}
              </div>
            ))}
            <div className="flex justify-end gap-3 pt-4 border-t dark:border-gray-700">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2.5 rounded-xl bg-secondary text-white text-sm font-medium hover:bg-primary transition-colors disabled:opacity-50 shadow-sm"
              >
                {loading ? 'Enregistrement...' : 'Enregistrer'}
              </button>
            </div>
            <p className="text-center text-[10px] text-gray-400">Ctrl+Enter pour soumettre · Escape pour annuler</p>
          </form>
        </div>
      </div>
    </div>
  );
};
