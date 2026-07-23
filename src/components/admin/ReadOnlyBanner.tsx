import React from 'react';
import { useReadOnly } from '../../hooks/useReadOnly';

export const ReadOnlyBanner: React.FC = () => {
  const readOnly = useReadOnly();
  if (!readOnly) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[70] bg-yellow-500/90 backdrop-blur-sm text-yellow-900 text-center text-[11px] font-medium py-1 px-4">
      🔒 Mode lecture seule — vous ne pouvez pas modifier les données
    </div>
  );
};
