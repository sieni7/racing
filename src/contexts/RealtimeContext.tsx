import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

type RealtimeEvent = {
  table: string;
  action: 'INSERT' | 'UPDATE' | 'DELETE';
  timestamp: string;
};

interface RealtimeContextValue {
  connected: boolean;
  events: RealtimeEvent[];
}

const RealtimeContext = createContext<RealtimeContextValue>({ connected: false, events: [] });

export function RealtimeProvider({ children }: { children: ReactNode }) {
  const [connected, setConnected] = useState(false);
  const [events, setEvents] = useState<RealtimeEvent[]>([]);

  useEffect(() => {
    const tables = ['players', 'matches', 'news', 'staff', 'gallery', 'standings', 'top_scorers', 'players_of_month'];
    const channels = tables.map(table => {
      return supabase
        .channel(`${table}-changes`)
        .on('postgres_changes',
          { event: '*', schema: 'public', table },
          (payload) => {
            const action = payload.eventType.toUpperCase() as 'INSERT' | 'UPDATE' | 'DELETE';
            const labels: Record<string, string> = {
              players: 'Joueurs', matches: 'Matchs', news: 'Actualités',
              staff: 'Staff', gallery: 'Galerie', standings: 'Classement',
              top_scorers: 'Meilleurs buteurs', players_of_month: 'Joueurs du mois',
            };
            const label = labels[table] || table;
            const messages: Record<string, string> = {
              INSERT: `Nouvel élément dans ${label}`,
              UPDATE: `Modification dans ${label}`,
              DELETE: `Suppression dans ${label}`,
            };
            toast(messages[action], { icon: '🔄', duration: 3000 });
            setEvents(prev => [{ table, action, timestamp: new Date().toISOString() }, ...prev].slice(0, 50));
          }
        )
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') setConnected(true);
        });
    });

    return () => {
      channels.forEach(ch => supabase.removeChannel(ch));
    };
  }, []);

  return (
    <RealtimeContext.Provider value={{ connected, events }}>
      {children}
    </RealtimeContext.Provider>
  );
}

export function useRealtime() {
  return useContext(RealtimeContext);
}
