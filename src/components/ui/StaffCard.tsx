import React, { useState } from 'react';
import type { Staff } from '../../types';

function roleLabel(role: string): string {
  const labels: Record<string, string> = {
    entraineur_principal: 'Entraîneur principal',
    entraineur_adjoint: 'Entraîneur adjoint',
    preparateur_physique: 'Préparateur physique',
    entraineur_gardiens: 'Entraîneur des gardiens',
    directeur_sportif: 'Directeur sportif',
    manager: 'Manager général',
    medecin: 'Médecin',
    president: 'Président',
    autre: 'Autre',
  };
  return labels[role] ?? role;
}

function StaffCard({ member }: { member: Staff }) {
  const [imgError, setImgError] = useState(false);
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5 card-hover flex items-start gap-4">
      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-100 to-blue-100 dark:from-orange-900/20 dark:to-blue-900/20 flex-shrink-0 overflow-hidden">
        {member.photo_url && !imgError ? (
          <img
            src={member.photo_url}
            alt={`${member.first_name} ${member.last_name}`}
            loading="lazy"
            decoding="async"
            onError={() => setImgError(true)}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-lg font-bold text-gray-400">
            {member.first_name[0]}{member.last_name[0]}
          </div>
        )}
      </div>
      <div className="min-w-0">
        <h3 className="font-display font-semibold text-gray-900 dark:text-white">
          {member.first_name} {member.last_name}
        </h3>
        <p className="text-sm text-primary font-medium">{roleLabel(member.role)}</p>
        {member.bio && (
          <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 line-clamp-2">{member.bio}</p>
        )}
      </div>
    </div>
  );
}

export default React.memo(StaffCard);
