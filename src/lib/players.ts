import { supabase } from './supabase';
import type { Player } from '../types';

export type { Player };

export async function getPlayers(): Promise<Player[]> {
  const { data, error } = await supabase
    .from('players')
    .select('*')
    .eq('is_active', true)
    .order('jersey_number', { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export async function getAllPlayers() {
  const { data, error } = await supabase
    .from('players')
    .select('*')
    .order('jersey_number', { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export async function getPlayerById(id: string): Promise<Player | null> {
  const { data, error } = await supabase
    .from('players')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}

export async function createPlayer(data: Partial<Omit<Player, 'id'>>) {
  const { data: inserted, error } = await supabase
    .from('players')
    .insert(data)
    .select()
    .single();

  if (error) throw error;
  return inserted;
}

export async function updatePlayer(id: string, data: Partial<Omit<Player, 'id'>>) {
  const { data: updated, error } = await supabase
    .from('players')
    .update(data)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return updated;
}

export async function deletePlayer(id: string) {
  const { error } = await supabase
    .from('players')
    .delete()
    .eq('id', id);

  if (error) throw error;
}