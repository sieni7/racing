import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFocusTrap } from '../../hooks/useFocusTrap';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  loading = false,
}) => {
  const trapRef = useFocusTrap(isOpen);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
      if (e.key === 'Enter' && !loading) onConfirm();
    };
    document.addEventListener('keydown', handler);
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', handler); document.body.style.overflow = ''; };
  }, [isOpen, onCancel, onConfirm, loading]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backdropFilter: 'blur(6px)' }}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={onCancel} role="dialog" aria-modal="true">
          <motion.div ref={trapRef} className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md p-6"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            onClick={e => e.stopPropagation()}>
            <h3 className="text-xl font-display font-bold mb-2">{title}</h3>
            <p className="text-gray-700 dark:text-gray-300 mb-6">{message}</p>
            <div className="flex justify-end gap-3">
              <button onClick={onCancel}
                className="px-4 py-2 border rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                Annuler
              </button>
              <button onClick={onConfirm} disabled={loading}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50">
                {loading ? 'Suppression...' : 'Confirmer'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
