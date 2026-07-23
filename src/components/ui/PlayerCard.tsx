import React, { useState } from 'react';
import type { Player } from '../../types';

function PlayerCard({ player }: { player: Player }) {
  const [imgError, setImgError] = useState(false);
  const initials = `${player.first_name[0]}${player.last_name[0]}`;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow group">
      <div className="relative h-56 bg-gradient-to-br from-orange-100 to-blue-100 dark:from-orange-900/20 dark:to-blue-900/20">
        {player.photo_url && !imgError ? (
          <img
            src={player.photo_url}
            alt={`${player.first_name} ${player.last_name}`}
            loading="lazy"
            decoding="async"
            onError={() => setImgError(true)}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <span className="text-4xl font-bold text-gray-400 dark:text-gray-600">{initials}</span>
          </div>
        )}
        <div className="absolute top-3 right-3 bg-primary text-white text-xs font-bold rounded-full w-8 h-8 flex items-center justify-center shadow">
          {player.jersey_number}
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-display font-semibold text-gray-900 dark:text-white">
          {player.first_name} {player.last_name}
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">{player.position}</p>
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
