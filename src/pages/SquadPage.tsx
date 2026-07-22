import { useEffect, useState } from 'react';
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

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <h1 className="font-display text-3xl font-bold text-gray-900 dark:text-white mb-8">Effectif</h1>
        <ListSkeleton />
      </div>
    );
  }

  const groups = groupByPosition(players);

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <h1 className="font-display text-3xl font-bold text-gray-900 dark:text-white mb-2">Effectif</h1>
      <p className="text-gray-500 dark:text-gray-400 mb-8">{players.length} joueurs</p>

      {groups.map(([position, positionPlayers]) => (
        <section key={position} className="mb-12">
          <h2 className="font-display text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <span className="w-1 h-6 bg-primary rounded-full inline-block" />
            {positionLabel(position)}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {positionPlayers.map((player) => (
              <PlayerCard key={player.id} player={player} />
            ))}
          </div>
        </section>
      ))}

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
