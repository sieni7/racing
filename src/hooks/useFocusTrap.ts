import { useEffect, useRef } from 'react';

const FOCUSABLE = 'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function useFocusTrap(open: boolean) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const el = ref.current;
    if (!el) return;

    const focusables = () => el.querySelectorAll<HTMLElement>(FOCUSABLE);
    const first = () => focusables()[0];

    first()?.focus();

    const handler = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      const f = focusables();
      if (f.length === 0) { e.preventDefault(); return; }
      if (e.shiftKey) {
        if (document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
      } else {
        if (document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
      }
    };

    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open]);

  return ref;
}
