import { useState, useEffect } from 'react';

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<Event | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setVisible(true);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const install = async () => {
    if (!deferredPrompt) return;
    (deferredPrompt as any).prompt();
    const result = await (deferredPrompt as any).userChoice;
    if (result.outcome === 'accepted') setVisible(false);
    setDeferredPrompt(null);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-6 left-4 right-4 z-50 sm:left-auto sm:right-6 sm:w-80">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-5 border border-gray-200 dark:border-gray-700">
        <h3 className="font-display font-semibold text-gray-900 dark:text-white mb-1">
          Installez l'application
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Ajoutez RC Bingerville à votre écran d'accueil pour un accès rapide.
        </p>
        <div className="flex gap-2">
          <button onClick={install}
            className="flex-1 px-4 py-2 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors">
            Installer
          </button>
          <button onClick={() => setVisible(false)}
            className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
            Plus tard
          </button>
        </div>
      </div>
    </div>
  );
}
