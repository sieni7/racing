import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import fallbackImg from '../../assets/man.jpg';

interface ViewField {
  label: string;
  value: React.ReactNode;
  color?: 'primary' | 'cta' | 'success' | 'warning';
}

interface ViewModalProps<T> {
  open: boolean;
  onClose: () => void;
  item: T | null;
  title: string;
  fields: ViewField[];
  imageUrl?: string | null;
  imageBadge?: string | number | null;
}

const fieldColors: Record<string, string> = {
  primary: 'bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-300',
  cta: 'bg-cta/10 text-cta dark:bg-cta/20 dark:text-red-300',
  success: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  warning: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
};

export function ViewModal<T>({ open, onClose, item, title, fields, imageUrl, imageBadge }: ViewModalProps<T>) {
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', handler); document.body.style.overflow = ''; };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && item && (
        <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backdropFilter: 'blur(6px)' }}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={onClose} role="dialog" aria-modal="true">
          <motion.div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            onClick={e => e.stopPropagation()}>
            {imageUrl && (
              <div className="relative h-48 bg-gradient-to-br from-primary/20 to-secondary/10">
                <img src={imageUrl} alt={title}
                  className="w-full h-full object-cover"
                  onError={(e) => { if (e.currentTarget.src !== fallbackImg) e.currentTarget.src = fallbackImg; }} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                {imageBadge != null && (
                  <div className="absolute top-3 right-3 bg-secondary text-white text-xs font-bold rounded-full w-9 h-9 flex items-center justify-center shadow-lg border-2 border-white/20">
                    {imageBadge}
                  </div>
                )}
                <div className="absolute bottom-3 left-3 right-3">
                  <h2 className="text-xl font-display font-bold text-white drop-shadow-lg">{title}</h2>
                </div>
                <button onClick={onClose}
                  className="absolute top-3 left-3 p-1.5 rounded-lg bg-black/30 text-white hover:bg-black/50 transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}
            <div className={imageUrl ? 'p-6' : 'p-6 pt-6'}>
              {!imageUrl && (
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-display font-bold text-gray-900 dark:text-white">{title}</h2>
                  <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              )}
              <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                {fields.map((f, i) => (
                  <div key={i} className={f.label.length > 12 ? 'col-span-2' : ''}>
                    <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">{f.label}</span>
                    <div className={`mt-0.5 text-sm font-medium ${f.color ? fieldColors[f.color] : 'text-gray-900 dark:text-white'}`}>
                      {f.value}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-700 flex justify-end">
                <button onClick={onClose}
                  className="px-5 py-2 rounded-xl bg-gray-100 dark:bg-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                  Fermer
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
