import { createContext, useContext, useState, type ReactNode } from 'react';
import { getAllPlayers, createPlayer as createPlayerSvc, updatePlayer as updatePlayerSvc, deletePlayer as deletePlayerSvc, type Player } from '../lib/players';
import { getAllMatches, createMatch as createMatchSvc, updateMatch as updateMatchSvc, deleteMatch as deleteMatchSvc, type Match } from '../lib/matches';
import { getAllNews, createNews as createNewsSvc, updateNews as updateNewsSvc, deleteNews as deleteNewsSvc, type News } from '../lib/news';
import { getAllStaff, createStaff as createStaffSvc, updateStaff as updateStaffSvc, deleteStaff as deleteStaffSvc, type Staff } from '../lib/staff';
import toast from 'react-hot-toast';

interface AdminState {
  players: Player[];
  matches: Match[];
  news: News[];
  staff: Staff[];
}

interface AdminActions {
  fetchPlayers: () => Promise<void>;
  fetchMatches: () => Promise<void>;
  fetchNews: () => Promise<void>;
  fetchStaff: () => Promise<void>;
  createPlayer: (data: Partial<Omit<Player, 'id'>>) => Promise<Player | null>;
  updatePlayer: (id: string, data: Partial<Omit<Player, 'id'>>) => Promise<Player | null>;
  deletePlayer: (id: string) => Promise<void>;
  createMatch: (data: Partial<Omit<Match, 'id'>>) => Promise<Match | null>;
  updateMatch: (id: string, data: Partial<Omit<Match, 'id'>>) => Promise<Match | null>;
  deleteMatch: (id: string) => Promise<void>;
  createNews: (data: Partial<Omit<News, 'id'>>) => Promise<News | null>;
  updateNews: (id: string, data: Partial<Omit<News, 'id'>>) => Promise<News | null>;
  deleteNews: (id: string) => Promise<void>;
  createStaff: (data: Partial<Omit<Staff, 'id'>>) => Promise<Staff | null>;
  updateStaff: (id: string, data: Partial<Omit<Staff, 'id'>>) => Promise<Staff | null>;
  deleteStaff: (id: string) => Promise<void>;
}

type AdminContextValue = AdminState & AdminActions;

const AdminContext = createContext<AdminContextValue | null>(null);

export const AdminProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [news, setNews] = useState<News[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);

  const fetchPlayers = async () => {
    try {
      const data = await getAllPlayers();
      setPlayers(data);
    } catch {
      toast.error('Erreur chargement joueurs');
    }
  };

  const fetchMatches = async () => {
    try {
      const data = await getAllMatches();
      setMatches(data);
    } catch {
      toast.error('Erreur chargement matchs');
    }
  };

  const fetchNews = async () => {
    try {
      const data = await getAllNews();
      setNews(data);
    } catch {
      toast.error('Erreur chargement actualités');
    }
  };

  const fetchStaff = async () => {
    try {
      const data = await getAllStaff();
      setStaff(data);
    } catch {
      toast.error('Erreur chargement staff');
    }
  };

  const createPlayer = async (data: Partial<Omit<Player, 'id'>>) => {
    try {
      const result = await createPlayerSvc(data);
      toast.success('Joueur ajouté');
      await fetchPlayers();
      return result;
    } catch {
      toast.error('Erreur création joueur');
      return null;
    }
  };

  const updatePlayer = async (id: string, data: Partial<Omit<Player, 'id'>>) => {
    try {
      const result = await updatePlayerSvc(id, data);
      toast.success('Joueur modifié');
      await fetchPlayers();
      return result;
    } catch {
      toast.error('Erreur modification joueur');
      return null;
    }
  };

  const deletePlayer = async (id: string) => {
    try {
      await deletePlayerSvc(id);
      toast.success('Joueur supprimé');
      await fetchPlayers();
    } catch {
      toast.error('Erreur suppression joueur');
    }
  };

  const createMatch = async (data: Partial<Omit<Match, 'id'>>) => {
    try {
      const result = await createMatchSvc(data);
      toast.success('Match ajouté');
      await fetchMatches();
      return result;
    } catch {
      toast.error('Erreur création match');
      return null;
    }
  };

  const updateMatch = async (id: string, data: Partial<Omit<Match, 'id'>>) => {
    try {
      const result = await updateMatchSvc(id, data);
      toast.success('Match modifié');
      await fetchMatches();
      return result;
    } catch {
      toast.error('Erreur modification match');
      return null;
    }
  };

  const deleteMatch = async (id: string) => {
    try {
      await deleteMatchSvc(id);
      toast.success('Match supprimé');
      await fetchMatches();
    } catch {
      toast.error('Erreur suppression match');
    }
  };

  const createNews = async (data: Partial<Omit<News, 'id'>>) => {
    try {
      const result = await createNewsSvc(data);
      toast.success('Actualité ajoutée');
      await fetchNews();
      return result;
    } catch {
      toast.error('Erreur création actualité');
      return null;
    }
  };

  const updateNews = async (id: string, data: Partial<Omit<News, 'id'>>) => {
    try {
      const result = await updateNewsSvc(id, data);
      toast.success('Actualité modifiée');
      await fetchNews();
      return result;
    } catch {
      toast.error('Erreur modification actualité');
      return null;
    }
  };

  const deleteNews = async (id: string) => {
    try {
      await deleteNewsSvc(id);
      toast.success('Actualité supprimée');
      await fetchNews();
    } catch {
      toast.error('Erreur suppression actualité');
    }
  };

  const createStaff = async (data: Partial<Omit<Staff, 'id'>>) => {
    try {
      const result = await createStaffSvc(data);
      toast.success('Membre ajouté');
      await fetchStaff();
      return result;
    } catch {
      toast.error('Erreur création staff');
      return null;
    }
  };

  const updateStaff = async (id: string, data: Partial<Omit<Staff, 'id'>>) => {
    try {
      const result = await updateStaffSvc(id, data);
      toast.success('Membre modifié');
      await fetchStaff();
      return result;
    } catch {
      toast.error('Erreur modification staff');
      return null;
    }
  };

  const deleteStaff = async (id: string) => {
    try {
      await deleteStaffSvc(id);
      toast.success('Membre supprimé');
      await fetchStaff();
    } catch {
      toast.error('Erreur suppression staff');
    }
  };

  return (
    <AdminContext.Provider value={{
      players, matches, news, staff,
      fetchPlayers, fetchMatches, fetchNews, fetchStaff,
      createPlayer, updatePlayer, deletePlayer,
      createMatch, updateMatch, deleteMatch,
      createNews, updateNews, deleteNews,
      createStaff, updateStaff, deleteStaff,
    }}>
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) throw new Error('useAdmin must be used within AdminProvider');
  return context;
};