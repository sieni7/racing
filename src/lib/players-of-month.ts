import { supabase } from './supabase';

export type PlayerOfMonth = {
  id: string;
  player_name: string;
  goals: number;
  assists: number;
  position: string | null;
  image_url: string | null;
  month: string;
  season: string;
  description: string | null;
  is_active: boolean;
};

export async function getAllPlayersOfMonth(): Promise<PlayerOfMonth[]> {
  const { data, error } = await supabase.from('players_of_month').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function getActivePlayerOfMonth(): Promise<PlayerOfMonth | null> {
  const { data, error } = await supabase.from('players_of_month').select('*').eq('is_active', true).order('created_at', { ascending: false }).limit(1).single();
  if (error) return null;
  return data;
}

export async function createPlayerOfMonth(data: Partial<PlayerOfMonth>): Promise<PlayerOfMonth> {
  const { data: inserted, error } = await supabase.from('players_of_month').insert(data).select().single();
  if (error) throw error;
  return inserted;
}

export async function updatePlayerOfMonth(id: string, data: Partial<PlayerOfMonth>): Promise<PlayerOfMonth> {
  const { data: updated, error } = await supabase.from('players_of_month').update(data).eq('id', id).select().single();
  if (error) throw error;
  return updated;
}

export async function deletePlayerOfMonth(id: string): Promise<void> {
  const { error } = await supabase.from('players_of_month').delete().eq('id', id);
  if (error) throw error;
}
