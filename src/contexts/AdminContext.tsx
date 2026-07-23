import { createContext, useContext, useState, type ReactNode } from 'react';
import { getAllPlayers, createPlayer as createPlayerSvc, updatePlayer as updatePlayerSvc, deletePlayer as deletePlayerSvc, type Player } from '../lib/players';
import { getAllMatches, createMatch as createMatchSvc, updateMatch as updateMatchSvc, deleteMatch as deleteMatchSvc, type Match } from '../lib/matches';
import { getAllNews, createNews as createNewsSvc, updateNews as updateNewsSvc, deleteNews as deleteNewsSvc, type News } from '../lib/news';
import { getAllStaff, createStaff as createStaffSvc, updateStaff as updateStaffSvc, deleteStaff as deleteStaffSvc, type Staff } from '../lib/staff';
import { getGalleryItems, createGalleryItem, updateGalleryItem, deleteGalleryItem } from '../lib/gallery';
import { getStandings as getStandingsSvc, upsertStanding, deleteStanding as deleteStandingSvc } from '../lib/standings';
import type { Gallery, Standing } from '../types';
import toast from 'react-hot-toast';

interface AdminState {
  players: Player[];
  matches: Match[];
  news: News[];
  staff: Staff[];
  gallery: Gallery[];
  standings: Standing[];
}

interface AdminActions {
  fetchPlayers: () => Promise<void>;
  fetchMatches: () => Promise<void>;
  fetchNews: () => Promise<void>;
  fetchStaff: () => Promise<void>;
  fetchGallery: () => Promise<void>;
  fetchStandings: () => Promise<void>;
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
  createGallery: (data: Partial<Omit<Gallery, 'id'>>) => Promise<Gallery | null>;
  updateGallery: (id: string, data: Partial<Omit<Gallery, 'id'>>) => Promise<Gallery | null>;
  deleteGallery: (id: string) => Promise<void>;
  createStanding: (data: Partial<Omit<Standing, 'id'>>) => Promise<Standing | null>;
  updateStanding: (id: string, data: Partial<Omit<Standing, 'id'>>) => Promise<Standing | null>;
  deleteStanding: (id: string) => Promise<void>;
}

type AdminContextValue = AdminState & AdminActions;

const AdminContext = createContext<AdminContextValue | null>(null);

export const AdminProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [news, setNews] = useState<News[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [gallery, setGallery] = useState<Gallery[]>([]);
  const [standings, setStandings] = useState<Standing[]>([]);

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

  const fetchGallery = async () => {
    try {
      const data = await getGalleryItems(undefined, true);
      setGallery(data);
    } catch {
      toast.error('Erreur chargement galerie');
    }
  };

  const fetchStandings = async () => {
    try {
      const data = await getStandingsSvc();
      setStandings(data);
    } catch {
      toast.error('Erreur chargement classement');
    }
  };

  const createGallery = async (data: Partial<Omit<Gallery, 'id'>>) => {
    try {
      const result = await createGalleryItem(data);
      toast.success('Média ajouté');
      await fetchGallery();
      return result;
    } catch {
      toast.error('Erreur création média');
      return null;
    }
  };

  const updateGallery = async (id: string, data: Partial<Omit<Gallery, 'id'>>) => {
    try {
      const result = await updateGalleryItem(id, data);
      toast.success('Média modifié');
      await fetchGallery();
      return result;
    } catch {
      toast.error('Erreur modification média');
      return null;
    }
  };

  const deleteGallery = async (id: string) => {
    try {
      await deleteGalleryItem(id);
      toast.success('Média supprimé');
      await fetchGallery();
    } catch {
      toast.error('Erreur suppression média');
    }
  };

  const createStanding = async (data: Partial<Omit<Standing, 'id'>>) => {
    try {
      const result = await upsertStanding(data);
      toast.success('Équipe ajoutée');
      await fetchStandings();
      return result;
    } catch {
      toast.error('Erreur ajout équipe');
      return null;
    }
  };

  const updateStanding = async (id: string, data: Partial<Omit<Standing, 'id'>>) => {
    try {
      const result = await upsertStanding({ ...data, id });
      toast.success('Équipe modifiée');
      await fetchStandings();
      return result;
    } catch {
      toast.error('Erreur modification équipe');
      return null;
    }
  };

  const deleteStanding = async (id: string) => {
    try {
      await deleteStandingSvc(id);
      toast.success('Équipe supprimée');
      await fetchStandings();
    } catch {
      toast.error('Erreur suppression équipe');
    }
  };

  return (
    <AdminContext.Provider value={{
      players, matches, news, staff, gallery, standings,
      fetchPlayers, fetchMatches, fetchNews, fetchStaff, fetchGallery, fetchStandings,
      createPlayer, updatePlayer, deletePlayer,
      createMatch, updateMatch, deleteMatch,
      createNews, updateNews, deleteNews,
      createStaff, updateStaff, deleteStaff,
      createGallery, updateGallery, deleteGallery,
      createStanding, updateStanding, deleteStanding,
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