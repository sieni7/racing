import { supabase } from './supabase';

export type TopScorer = {
  id: string;
  player_name: string;
  goals: number;
  position: string | null;
  image_url: string | null;
  season: string;
  sort_order: number;
  is_active: boolean;
};

export async function getTopScorers(season?: string): Promise<TopScorer[]> {
  let query = supabase.from('top_scorers').select('*').eq('is_active', true).order('sort_order', { ascending: true }).order('goals', { ascending: false });
  if (season) query = query.eq('season', season);
  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

export async function createTopScorer(data: Partial<TopScorer>): Promise<TopScorer> {
  const { data: inserted, error } = await supabase.from('top_scorers').insert(data).select().single();
  if (error) throw error;
  return inserted;
}

export async function updateTopScorer(id: string, data: Partial<TopScorer>): Promise<TopScorer> {
  const { data: updated, error } = await supabase.from('top_scorers').update(data).eq('id', id).select().single();
  if (error) throw error;
  return updated;
}

export async function deleteTopScorer(id: string): Promise<void> {
  const { error } = await supabase.from('top_scorers').delete().eq('id', id);
  if (error) throw error;
}
