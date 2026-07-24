import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';

type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';
type ModalType = 'info' | 'danger' | 'success';

interface ModalWrapperProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  size?: ModalSize;
  type?: ModalType;
  ref?: React.Ref<HTMLDivElement>;
}

const sizeMap: Record<ModalSize, string> = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-3xl',
  full: 'max-w-5xl',
};

const typeStyles: Record<ModalType, { border: string; scale: number }> = {
  info: { border: '', scale: 0.95 },
  danger: { border: 'border-t-2 border-red-500', scale: 0.9 },
  success: { border: 'border-t-2 border-green-500', scale: 0.95 },
};

export const ModalWrapper = React.forwardRef<HTMLDivElement, ModalWrapperProps>(
  ({ open, onClose, children, size = 'lg', type = 'info' }, ref) => {
    const style = typeStyles[type];

    useEffect(() => {
      if (!open) return;
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = ''; };
    }, [open]);

    return createPortal(
      <AnimatePresence>
        {open && (
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4 max-sm:p-0"
            style={{ backdropFilter: 'blur(6px)' }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose} role="dialog" aria-modal="true">
            <motion.div ref={ref}
              className={`bg-white dark:bg-gray-800 shadow-2xl overflow-hidden ${style.border} ${sizeMap[size]} max-sm:max-h-full max-sm:w-full max-sm:rounded-none max-sm:inset-0 max-sm:fixed ${size !== 'full' && size !== 'xl' ? 'rounded-2xl' : 'rounded-2xl'}`}
              initial={{ opacity: 0, scale: style.scale, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: style.scale, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={e => e.stopPropagation()}>
              {children}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>,
      document.body
    );
  }
);

ModalWrapper.displayName = 'ModalWrapper';
