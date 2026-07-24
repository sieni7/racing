import React from 'react';
import type { Player } from '../../types';
import fallbackImg from '../../assets/man.jpg';

function PlayerCard({ player }: { player: Player }) {

  return (
    <div className="bg-white dark:bg-gray-800 rounded-[18px] shadow-card overflow-hidden card-hover group">
      <div className="relative h-56 bg-gradient-to-br from-primary/20 to-secondary/10">
        <img
          src={player.photo_url || fallbackImg}
          alt={`${player.first_name} ${player.last_name}`}
          loading="lazy"
          decoding="async"
          onError={(e) => { if (e.currentTarget.src !== fallbackImg) e.currentTarget.src = fallbackImg; }}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-3 right-3 bg-secondary text-white text-xs font-bold rounded-full w-8 h-8 flex items-center justify-center shadow">
          {player.jersey_number}
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-display font-semibold text-gray-900 dark:text-white">
          {player.first_name} {player.last_name}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-300 capitalize">{player.position}</p>
        <div className="flex items-center gap-2 mt-2 text-xs text-gray-400 dark:text-gray-500">
          <span>{player.nationality}</span>
          <span>·</span>
          <span>{player.height_cm} cm</span>
        </div>
      </div>
    </div>
  );
}

export default React.memo(PlayerCard);
