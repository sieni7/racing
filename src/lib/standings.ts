import { supabase } from './supabase';
import type { Standing } from '../types';

export async function getStandings(season?: string): Promise<Standing[]> {
  let query = supabase
    .from('standings')
    .select('*')
    .order('points', { ascending: false });

  if (season) {
    query = query.eq('season', season);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data ?? [];
}

export async function getSeasons(): Promise<string[]> {
  const { data, error } = await supabase
    .from('standings')
    .select('season')
    .order('season', { ascending: false });

  if (error) throw error;
  return [...new Set(data?.map(s => s.season) ?? [])];
}

export async function createStanding(data: Partial<Standing>): Promise<Standing> {
  const { data: inserted, error } = await supabase
    .from('standings')
    .insert(data)
    .select()
    .single();

  if (error) throw error;
  return inserted;
}

export async function updateStanding(id: string, data: Partial<Standing>): Promise<Standing> {
  const { data: updated, error } = await supabase
    .from('standings')
    .update(data)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return updated;
}

export async function deleteStanding(id: string): Promise<void> {
  const { error } = await supabase
    .from('standings')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

export async function upsertStanding(data: Partial<Standing>): Promise<Standing> {
  const { data: upserted, error } = await supabase
    .from('standings')
    .upsert(data, { onConflict: 'team_name,season' })
    .select()
    .single();

  if (error) throw error;
  return upserted;
}