import React, { useEffect, useState } from 'react';
import fallbackImg from '../../assets/img/man.jpg';
import { useFocusTrap } from '../../hooks/useFocusTrap';
import { ModalWrapper } from './ModalWrapper';

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
  const trapRef = useFocusTrap(open);
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    if (!open) { setImageLoaded(false); return; }
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onClose]);

  return (
    <ModalWrapper open={open && !!item} onClose={onClose} size="lg" ref={trapRef}>
      {imageUrl && (
        <div className="relative h-48 bg-gradient-to-br from-primary/20 to-secondary/10">
          {!imageLoaded && <div className="absolute inset-0 animate-pulse bg-gray-200 dark:bg-gray-700" />}
          <img src={imageUrl} alt={title}
            className={`w-full h-full object-cover transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
            onLoad={() => setImageLoaded(true)}
            onError={(e) => { setImageLoaded(true); if (e.currentTarget.src !== fallbackImg) e.currentTarget.src = fallbackImg; }} />
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
    </ModalWrapper>
  );
}
