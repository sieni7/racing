import { supabase } from './supabase';
import type { Match } from '../types';

export async function getUpcomingMatches(limit = 5): Promise<Match[]> {
  const { data, error } = await supabase
    .from('matches')
    .select('*')
    .eq('status', 'upcoming')
    .order('match_date', { ascending: true })
    .limit(limit);

  if (error) throw error;
  return data ?? [];
}

export async function getPastMatches(page = 1, perPage = 12): Promise<{ matches: Match[]; count: number }> {
  const from = (page - 1) * perPage;
  const to = from + perPage - 1;

  const { data, error, count } = await supabase
    .from('matches')
    .select('*', { count: 'exact' })
    .eq('status', 'finished')
    .order('match_date', { ascending: false })
    .range(from, to);

  if (error) throw error;
  return { matches: data ?? [], count: count ?? 0 };
}

export async function getAllMatches(page = 1, perPage = 12): Promise<{ matches: Match[]; count: number }> {
  const from = (page - 1) * perPage;
  const to = from + perPage - 1;

  const { data, error, count } = await supabase
    .from('matches')
    .select('*', { count: 'exact' })
    .order('match_date', { ascending: false })
    .range(from, to);

  if (error) throw error;
  return { matches: data ?? [], count: count ?? 0 };
}

export async function getMatchById(id: string): Promise<Match | null> {
  const { data, error } = await supabase
    .from('matches')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}

export async function createMatch(data: Partial<Omit<Match, 'id'>>): Promise<Match> {
  const { data: inserted, error } = await supabase
    .from('matches')
    .insert(data)
    .select()
    .single();

  if (error) throw error;
  return inserted;
}

export async function updateMatch(id: string, data: Partial<Omit<Match, 'id'>>): Promise<Match> {
  const { data: updated, error } = await supabase
    .from('matches')
    .update(data)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return updated;
}

export async function deleteMatch(id: string): Promise<void> {
  const { error } = await supabase
    .from('matches')
    .delete()
    .eq('id', id);

  if (error) throw error;
}
