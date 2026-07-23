import React from 'react';
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

function getMatchResult(match: Match) {
  if (match.status !== 'finished' || match.racing_score === null || match.opponent_score === null) {
    return null;
  }
  if (match.racing_score > match.opponent_score) return 'victory';
  if (match.racing_score < match.opponent_score) return 'defeat';
  return 'draw';
}

function MatchCard({ match }: { match: Match }) {
  const isFinished = match.status === 'finished';
  const isUpcoming = match.status === 'upcoming';
  const result = getMatchResult(match);

  const borderColor = result === 'victory' 
    ? 'border-success' 
    : result === 'defeat' 
    ? 'border-cta' 
    : result === 'draw'
    ? 'border-primary'
    : 'border-secondary';

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-[18px] shadow-card p-5 card-hover border-l-4 ${borderColor}`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">
          {match.competition} · Journée {match.matchday}
        </span>
        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
          isFinished
            ? 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
            : isUpcoming
            ? 'bg-success/10 dark:bg-success/20 text-success'
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
              <span className={match.racing_score > (match.opponent_score ?? -1) ? 'text-success' : match.racing_score < (match.opponent_score ?? Infinity) ? 'text-cta' : 'text-primary'}>
                {match.racing_score}
              </span>
              <span className="text-gray-400 dark:text-gray-500">-</span>
              <span className={match.opponent_score !== null && match.opponent_score > match.racing_score ? 'text-success' : match.opponent_score !== null && match.opponent_score < match.racing_score ? 'text-cta' : 'text-primary'}>
                {match.opponent_score}
              </span>
            </div>
          ) : (
            <span className="text-sm font-semibold text-secondary uppercase">VS</span>
          )}
        </div>

        <div className="flex-1 text-left">
          <p className="font-semibold text-gray-900 dark:text-white">{match.opponent_name}</p>
        </div>
      </div>

      <div className="mt-3 text-xs text-gray-600 dark:text-gray-300 flex items-center gap-1 justify-center">
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

export default React.memo(MatchCard);
