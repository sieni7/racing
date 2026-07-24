import React from 'react';
import type { Staff } from '../../types';
import fallbackImg from '../../assets/img/man.jpg';

function fonctionLabel(fonction: string): string {
  const labels: Record<string, string> = {
    entraineur_principal: 'Entraîneur principal',
    entraineur_adjoint: 'Entraîneur adjoint',
    preparateur_physique: 'Préparateur physique',
    entraineur_gardiens: 'Entraîneur des gardiens',
    directeur_sportif: 'Directeur sportif',
    manager: 'Manager général',
    medecin: 'Médecin',
    president: 'Président',
    joueur: 'Joueur',
    parent: 'Parent',
    autre: 'Autre',
  };
  return labels[fonction] ?? fonction;
}

function StaffCard({ member }: { member: Staff }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-[18px] shadow-card p-5 card-hover flex items-start gap-4">
      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-secondary/10 flex-shrink-0 overflow-hidden">
        <img
          src={member.photo_url || fallbackImg}
          alt={`${member.first_name} ${member.last_name}`}
          loading="lazy"
          decoding="async"
          onError={(e) => { if (e.currentTarget.src !== fallbackImg) e.currentTarget.src = fallbackImg; }}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="min-w-0">
        <h3 className="font-display font-semibold text-gray-900 dark:text-white">
          {member.first_name} {member.last_name}
        </h3>
        <p className="text-sm text-secondary dark:text-primary font-medium">{fonctionLabel(member.fonction || member.role)}</p>
        {member.bio && (
          <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 line-clamp-2">{member.bio}</p>
        )}
      </div>
    </div>
  );
}

export default React.memo(StaffCard);
