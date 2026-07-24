import { useEffect, useState, useMemo, useRef } from 'react';
import type { Player, Staff } from '../types';
import { getPlayers } from '../lib/players';
import { getStaff } from '../lib/staff';
import PlayerCard from '../components/ui/PlayerCard';
import { ViewModal } from '../components/admin/ViewModal';
import fallbackImg from '../assets/img/man.jpg';
import { ListSkeleton } from '../components/ui/Skeleton';
import { useScrollAnimation } from '../hooks/useScrollAnimation';
import SEOHead from '../components/SEOHead';

const positionOrder: Record<string, number> = {
  gardien: 0, defenseur: 1, milieu: 2, attaquant: 3,
};

const allPositions = ['gardien', 'defenseur', 'milieu', 'attaquant'] as const;

function positionLabel(position: string): string {
  const labels: Record<string, string> = {
    gardien: 'Gardiens', defenseur: 'Défenseurs', milieu: 'Milieux', attaquant: 'Attaquants',
  };
  return labels[position.toLowerCase()] ?? position;
}

function AnimatedSection({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const { ref, isVisible } = useScrollAnimation<HTMLDivElement>();
  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      } ${className}`}
    >
      {children}
    </div>
  );
}

const roleLabels: Record<string, string> = {
  gardien: 'Gardien',
  defenseur: 'Défenseur',
  milieu: 'Milieu',
  attaquant: 'Attaquant',
  entraineur_principal: 'Entraîneur principal',
  entraineur_adjoint: 'Entraîneur adjoint',
  preparateur_physique: 'Préparateur physique',
  entraineur_gardiens: 'Entraîneur gardiens',
  directeur_sportif: 'Directeur sportif',
  manager: 'Manager général',
  medecin: 'Médecin',
  president: 'Président',
  autre: 'Autre',
};

export default function SquadPage() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [positionFilter, setPositionFilter] = useState('all');
  const [viewItem, setViewItem] = useState<Player | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function load() {
      try {
        const [playersData, staffData] = await Promise.all([getPlayers(), getStaff()]);
        setPlayers(playersData);
        setStaff(staffData);
      } catch (err) {
        console.error('Erreur chargement SquadPage:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filtered = useMemo(() => {
    return players.filter((p) => {
      const matchSearch = !search ||
        `${p.first_name} ${p.last_name}`.toLowerCase().includes(search.toLowerCase()) ||
        p.nationality?.toLowerCase().includes(search.toLowerCase());
      const matchPosition = positionFilter === 'all' || p.position.toLowerCase() === positionFilter;
      return matchSearch && matchPosition;
    });
  }, [players, search, positionFilter]);

  const groups = Object.entries(
    filtered.reduce((acc, p) => {
      const key = p.position.toLowerCase();
      if (!acc[key]) acc[key] = [];
      acc[key].push(p);
      return acc;
    }, {} as Record<string, Player[]>)
  ).sort(([a], [b]) => (positionOrder[a] ?? 99) - (positionOrder[b] ?? 99));

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="mb-8 animate-pulse">
          <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-2" />
          <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-32" />
        </div>
        <ListSkeleton />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <SEOHead title="Effectif" description="Découvrez l'effectif complet du Racing Club de Bingerville : joueurs, staff technique et statistiques." />
      <div className="mb-8">
        <h1 className="font-display text-4xl font-black text-gray-900 dark:text-white">Effectif</h1>
        <p className="text-gray-600 dark:text-gray-300 mt-1">{players.length} joueurs · {staff.length} staff</p>
      </div>

      <div className="flex flex-wrap gap-4 mb-10">
        <div className="relative flex-1 min-w-[200px]">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher un joueur…"
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 transition-shadow"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setPositionFilter('all')}
            className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
              positionFilter === 'all'
                ? 'bg-primary text-white shadow-md'
                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-primary hover:text-primary'
            }`}
          >
            Tous
          </button>
          {allPositions.map((pos) => (
            <button
              key={pos}
              onClick={() => setPositionFilter(pos)}
              className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                positionFilter === pos
                  ? 'bg-primary text-white shadow-md'
                  : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-primary hover:text-primary'
              }`}
            >
              {positionLabel(pos)}
            </button>
          ))}
        </div>
      </div>

      {groups.length === 0 ? (
        <div className="text-center py-20">
          <svg className="w-12 h-12 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <p className="text-gray-600 dark:text-gray-300">Aucun joueur ne correspond aux critères.</p>
        </div>
      ) : (
        groups.map(([position, positionPlayers]) => (
          <AnimatedSection key={position} className="mb-16">
            <div className="inline-flex items-center gap-3 bg-gray-100/80 dark:bg-gray-800/80 rounded-xl px-4 py-2 mb-6">
              <span className="w-1 h-7 bg-primary rounded-full" />
              <h2 className="font-display text-xl font-bold text-gray-900 dark:text-white">
                {positionLabel(position)}
              </h2>
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">({positionPlayers.length})</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {positionPlayers.map((player) => (
                <button key={player.id} onClick={() => setViewItem(player)} className="text-left w-full">
                  <PlayerCard player={player} />
                </button>
              ))}
            </div>
          </AnimatedSection>
        ))
      )}

      {staff.length > 0 && (
        <AnimatedSection className="mt-8">
          <div className="inline-flex items-center gap-3 bg-blue-100/80 dark:bg-blue-900/30 rounded-xl px-4 py-2 mb-6">
            <span className="w-1 h-7 bg-blue-600 rounded-full" />
            <h2 className="font-display text-xl font-bold text-gray-900 dark:text-white">
              Staff technique
            </h2>
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">({staff.length})</span>
          </div>

          <style>{`.no-scrollbar::-webkit-scrollbar { display: none; }`}</style>
          <div className="relative">
            <div ref={scrollRef} className="no-scrollbar flex gap-4 overflow-x-auto snap-x snap-mandatory"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              {staff.map((member) => (
                <div key={member.id} className="flex-shrink-0 w-48 snap-start">
                  <div className="bg-white dark:bg-gray-800 rounded-[18px] shadow-card overflow-hidden card-hover">
                    <div className="aspect-square bg-gradient-to-br from-primary/20 to-secondary/10 dark:from-sky-900/20 dark:to-navy-900/20 relative overflow-hidden">
                      <img src={member.photo_url || fallbackImg} alt={`${member.first_name} ${member.last_name}`}
                        loading="lazy" decoding="async"
                        onError={(e) => { if (e.currentTarget.src !== fallbackImg) e.currentTarget.src = fallbackImg; }}
                        className="w-full h-full object-cover" />
                    </div>
                    <div className="p-3 text-center">
                      <h3 className="font-display font-semibold text-sm text-gray-900 dark:text-white truncate">
                        {member.first_name} {member.last_name}
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{roleLabels[member.fonction || member.role] || member.fonction || member.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button onClick={() => { scrollRef.current?.scrollBy({ left: -200, behavior: 'smooth' }); }}
              className="absolute left-0 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white dark:bg-gray-700 shadow-lg flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors -ml-5">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button onClick={() => { scrollRef.current?.scrollBy({ left: 200, behavior: 'smooth' }); }}
              className="absolute right-0 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white dark:bg-gray-700 shadow-lg flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors -mr-5">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </AnimatedSection>
      )}

      <ViewModal open={!!viewItem} onClose={() => setViewItem(null)} item={viewItem}
        title={`${viewItem?.first_name} ${viewItem?.last_name}`}
        imageUrl={viewItem?.photo_url} imageBadge={viewItem?.jersey_number}
        fields={viewItem ? [
          { label: 'Position', value: roleLabels[viewItem.position] || viewItem.position },
          { label: 'Date de naissance', value: viewItem.date_of_birth ? new Date(viewItem.date_of_birth).toLocaleDateString('fr-FR') : '—' },
          { label: 'Nationalité', value: viewItem.nationality || '—' },
          { label: 'Taille', value: viewItem.height_cm ? `${viewItem.height_cm} cm` : '—' },
          { label: 'Poids', value: viewItem.weight_kg ? `${viewItem.weight_kg} kg` : '—' },
          { label: 'Pied fort', value: viewItem.preferred_foot || '—' },
          ...(viewItem.bio ? [{ label: 'Bio', value: viewItem.bio }] : []),
        ] : []} />
    </div>
  );
}
