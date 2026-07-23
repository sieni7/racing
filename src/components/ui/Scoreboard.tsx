import React from 'react';

interface ScoreboardProps {
  homeScore: number;
  awayScore: number;
  homeTeam: string;
  awayTeam: string;
  status: 'finished' | 'live' | 'scheduled';
}

const Scoreboard: React.FC<ScoreboardProps> = ({ homeScore, awayScore, homeTeam, awayTeam, status }) => {
  return (
    <div className="bg-secondary rounded-2xl p-6 text-white shadow-xl">
      <div className="flex justify-between items-center">
        <span className="text-xl font-bold">{homeTeam}</span>
        <div className="flex items-center gap-4">
          <span className="text-5xl font-bold">{homeScore}</span>
          <span className="text-2xl font-bold text-white/50">-</span>
          <span className="text-5xl font-bold">{awayScore}</span>
        </div>
        <span className="text-xl font-bold">{awayTeam}</span>
      </div>
      {status === 'live' && <div className="text-center mt-2 text-sm font-semibold text-green-400 animate-pulse">🔴 En cours</div>}
    </div>
  );
};

export default Scoreboard;
