import { useEffect, useState, useMemo } from 'react';
import type { Player, Staff } from '../types';
import { getPlayers } from '../lib/players';
import { getStaff } from '../lib/staff';
import PlayerCard from '../components/ui/PlayerCard';
import StaffCard from '../components/ui/StaffCard';
import { ListSkeleton } from '../components/ui/Skeleton';

const positionOrder: Record<string, number> = {
  gardien: 0,
  defenseur: 1,
  milieu: 2,
  attaquant: 3,
};

const allPositions = ['gardien', 'defenseur', 'milieu', 'attaquant'] as const;

function groupByPosition(players: Player[]): [string, Player[]][] {
  const groups: Record<string, Player[]> = {};
  players.forEach((p) => {
    const key = p.position.toLowerCase();
    if (!groups[key]) groups[key] = [];
    groups[key].push(p);
  });
  return Object.entries(groups).sort(
    ([a], [b]) => (positionOrder[a] ?? 99) - (positionOrder[b] ?? 99)
  );
}

function positionLabel(position: string): string {
  const labels: Record<string, string> = {
    gardien: 'Gardiens',
    defenseur: 'Défenseurs',
    milieu: 'Milieux',
    attaquant: 'Attaquants',
  };
  return labels[position.toLowerCase()] ?? position;
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

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <h1 className="font-display text-3xl font-bold text-gray-900 dark:text-white mb-8">Effectif</h1>
        <ListSkeleton />
      </div>
    );
  }

  const groups = groupByPosition(filtered);

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <h1 className="font-display text-3xl font-bold text-gray-900 dark:text-white mb-2">Effectif</h1>
      <p className="text-gray-500 dark:text-gray-400 mb-6">{players.length} joueurs</p>

      <div className="flex flex-wrap gap-4 mb-8">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher un joueur…"
          className="flex-1 min-w-[200px] px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
        />
        <select
          value={positionFilter}
          onChange={(e) => setPositionFilter(e.target.value)}
          className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
        >
          <option value="all">Tous les postes</option>
          {allPositions.map((pos) => (
            <option key={pos} value={pos}>{positionLabel(pos)}</option>
          ))}
        </select>
      </div>

      {groups.length === 0 ? (
        <p className="text-center py-12 text-gray-500 dark:text-gray-400">
          Aucun joueur ne correspond aux critères.
        </p>
      ) : (
        groups.map(([position, positionPlayers]) => (
          <section key={position} className="mb-12">
            <h2 className="font-display text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <span className="w-1 h-6 bg-primary rounded-full inline-block" />
              {positionLabel(position)}
              <span className="text-sm font-normal text-gray-400">({positionPlayers.length})</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {positionPlayers.map((player) => (
                <PlayerCard key={player.id} player={player} />
              ))}
            </div>
          </section>
        ))
      )}

      {staff.length > 0 && (
        <section className="mt-16">
          <h2 className="font-display text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <span className="w-1 h-6 bg-blue-600 rounded-full inline-block" />
            Staff technique
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {staff.map((member) => (
              <StaffCard key={member.id} member={member} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
