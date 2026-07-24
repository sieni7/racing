import { useState, useEffect } from 'react';
import { isPushSupported, subscribeToPush } from '../../lib/notifications';

export default function NotificationPrompt() {
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!('Notification' in window)) return;
    if (Notification.permission === 'granted') return;
    if (Notification.permission === 'denied') return;
    if (localStorage.getItem('notification_dismissed')) return;
    if (!localStorage.getItem('cookies_accepted')) return;
    const timer = setTimeout(() => setVisible(true), 5000);
    return () => clearTimeout(timer);
  }, []);

  const subscribe = async () => {
    setLoading(true);
    try {
      const supported = await isPushSupported();
      if (!supported) {
        setVisible(false);
        return;
      }
      await subscribeToPush();
      setVisible(false);
    } catch {
      setVisible(false);
    } finally {
      setLoading(false);
    }
  };

  const dismiss = () => {
    localStorage.setItem('notification_dismissed', 'true');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 sm:left-auto sm:right-6 sm:bottom-24 sm:w-80">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-5 border border-gray-200 dark:border-gray-700">
        <h3 className="font-display font-semibold text-gray-900 dark:text-white mb-1">
          Ne rien manquer
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Activez les notifications pour suivre l'actualité du club en temps réel.
        </p>
        <div className="flex gap-2">
          <button onClick={subscribe} disabled={loading}
            className="flex-1 px-4 py-2 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50">
            {loading ? '…' : 'Activer'}
          </button>
          <button onClick={dismiss}
            className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
            Plus tard
          </button>
        </div>
      </div>
    </div>
  );
}
