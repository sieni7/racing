import { supabase } from './supabase';
import type { Staff } from '../types';

export async function getStaff(): Promise<Staff[]> {
  const { data, error } = await supabase
    .from('staff')
    .select('*')
    .eq('is_active', true)
    .order('hired_at', { ascending: true });

  if (error) throw error;
  return data ?? [];
}
