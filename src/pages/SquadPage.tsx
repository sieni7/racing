import { useEffect, useState, useMemo } from 'react';
import type { Player, Staff } from '../types';
import { getPlayers } from '../lib/players';
import { getStaff } from '../lib/staff';
import PlayerCard from '../components/ui/PlayerCard';
import StaffCard from '../components/ui/StaffCard';
import { ListSkeleton } from '../components/ui/Skeleton';
import { useScrollAnimation } from '../hooks/useScrollAnimation';

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

export default function SquadPage() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [positionFilter, setPositionFilter] = useState('all');

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
          <p className="text-5xl mb-4">🔍</p>
          <p className="text-gray-600 dark:text-gray-300">Aucun joueur ne correspond aux critères.</p>
        </div>
      ) : (
        groups.map(([position, positionPlayers]) => (
          <AnimatedSection key={position} className="mb-16">
            <h2 className="font-display text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
              <span className="w-1 h-7 bg-primary rounded-full inline-block" />
              {positionLabel(position)}
              <span className="text-sm font-normal text-gray-400 dark:text-gray-500">({positionPlayers.length})</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {positionPlayers.map((player) => (
                <PlayerCard key={player.id} player={player} />
              ))}
            </div>
          </AnimatedSection>
        ))
      )}

      {staff.length > 0 && (
        <AnimatedSection className="mt-8">
          <h2 className="font-display text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
            <span className="w-1 h-7 bg-blue-600 rounded-full inline-block" />
            Staff technique
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {staff.map((member) => (
              <StaffCard key={member.id} member={member} />
            ))}
          </div>
        </AnimatedSection>
      )}
    </div>
  );
}
