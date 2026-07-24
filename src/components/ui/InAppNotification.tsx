import { useState, useEffect } from 'react';
import { getUpcomingMatches } from '../../lib/matches';

const MS_2H = 2 * 60 * 60 * 1000;

export default function InAppNotification() {
  const [text, setText] = useState<string | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    getUpcomingMatches().then((matches) => {
      const next = matches[0];
      if (!next) return;
      const diff = new Date(next.match_date).getTime() - Date.now();
      if (diff > 0 && diff < MS_2H) {
        const mins = Math.round(diff / 60000);
        const opponent = next.opponent_name;
        const location = next.is_home ? 'à domicile' : 'à l\'extérieur';
        setText(`⚽ Prochain match dans ${mins} min : ${opponent} ${location}`);
      }
    }).catch(() => {});
  }, []);

  if (!text || dismissed) return null;

  return (
    <div className="fixed top-20 left-4 right-4 z-50 sm:left-auto sm:right-6 sm:max-w-sm" role="alert">
      <div className="bg-primary/10 dark:bg-primary/20 backdrop-blur-md border border-primary/30 rounded-xl p-4 flex items-start gap-3 shadow-lg">
        <span className="text-sm text-gray-800 dark:text-white flex-1">{text}</span>
        <button onClick={() => setDismissed(true)} className="text-gray-500 hover:text-gray-700 dark:hover:text-white transition-colors" aria-label="Fermer">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}
