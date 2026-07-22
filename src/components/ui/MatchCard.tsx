import type { Match } from '../../types';

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function MatchCard({ match }: { match: Match }) {
  const isFinished = match.status === 'finished';
  const isUpcoming = match.status === 'upcoming';

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5 hover:shadow-md transition-shadow border-l-4 border-primary">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
          {match.competition} · Journée {match.matchday}
        </span>
        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
          isFinished
            ? 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
            : isUpcoming
            ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
            : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
        }`}>
          {isFinished ? 'Terminé' : isUpcoming ? 'À venir' : 'Reporté'}
        </span>
      </div>

      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 text-right">
          <p className="font-semibold text-gray-900 dark:text-white">RC Bingerville</p>
        </div>

        <div className="flex items-center gap-3">
          {isFinished && match.racing_score !== null ? (
            <div className="flex items-center gap-2 text-2xl font-bold">
              <span className={match.racing_score > (match.opponent_score ?? -1) ? 'text-primary' : 'text-gray-500 dark:text-gray-400'}>
                {match.racing_score}
              </span>
              <span className="text-gray-300 dark:text-gray-600">-</span>
              <span className={match.opponent_score !== null && match.opponent_score > match.racing_score ? 'text-primary' : 'text-gray-500 dark:text-gray-400'}>
                {match.opponent_score}
              </span>
            </div>
          ) : (
            <span className="text-sm font-semibold text-primary uppercase">VS</span>
          )}
        </div>

        <div className="flex-1 text-left">
          <p className="font-semibold text-gray-900 dark:text-white">{match.opponent_name}</p>
        </div>
      </div>

      <div className="mt-3 text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 justify-center">
        <span>{formatDate(match.match_date)}</span>
        {match.venue && (
          <>
            <span>·</span>
            <span>{match.is_home ? 'Domicile' : match.venue}</span>
          </>
        )}
      </div>
    </div>
  );
}
