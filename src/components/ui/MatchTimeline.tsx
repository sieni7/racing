import React from 'react';
import type { Match } from '../../types';
import MatchCard from './MatchCard';

const MatchTimeline: React.FC<{ matches: Match[] }> = ({ matches }) => {
  return (
    <div className="relative pl-8 border-l-2 border-primary/30 space-y-8">
      {matches.map((match) => (
        <div key={match.id} className="relative">
          <div className="absolute -left-10 top-1 w-5 h-5 bg-primary rounded-full border-4 border-white dark:border-gray-900" />
          <MatchCard match={match} />
        </div>
      ))}
    </div>
  );
};

export default MatchTimeline;
