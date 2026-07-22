import { supabase } from './supabase';
import type { Player } from '../types';

export async function getPlayers(): Promise<Player[]> {
  const { data, error } = await supabase
    .from('players')
    .select('*')
    .eq('is_active', true)
    .order('jersey_number', { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export async function getPlayerBySlug(slug: string): Promise<Player | null> {
  const { data, error } = await supabase
    .from('players')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error) throw error;
  return data;
}
