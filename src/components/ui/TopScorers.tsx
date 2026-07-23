import React from 'react';

interface Scorer {
  player: string;
  goals: number;
  position: string;
  image: string;
}

const TopScorers: React.FC<{ scorers: Scorer[] }> = ({ scorers }) => {
  return (
    <div className="space-y-3">
      {scorers.map((scorer, index) => (
        <div key={index} className="flex items-center gap-4 p-3 bg-white dark:bg-gray-800 rounded-xl shadow-sm card-hover">
          <span className="text-2xl font-bold text-primary/50 w-8 text-center">{index + 1}</span>
          <img src={scorer.image} alt={scorer.player} className="w-10 h-10 rounded-full object-cover" />
          <div className="flex-1">
            <p className="font-semibold text-gray-900 dark:text-white">{scorer.player}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{scorer.position}</p>
          </div>
          <span className="text-xl font-bold text-primary">{scorer.goals}</span>
        </div>
      ))}
    </div>
  );
};

export default TopScorers;
