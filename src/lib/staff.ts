import { supabase } from './supabase';
import type { Staff } from '../types';

export type { Staff };

export async function getStaff(): Promise<Staff[]> {
  const { data, error } = await supabase
    .from('staff')
    .select('*')
    .eq('is_active', true)
    .order('hired_at', { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export async function getAllStaff() {
  const { data, error } = await supabase
    .from('staff')
    .select('*')
    .order('hired_at', { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export async function getStaffById(id: string): Promise<Staff | null> {
  const { data, error } = await supabase
    .from('staff')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}

export async function createStaff(data: Partial<Omit<Staff, 'id'>>) {
  const { data: inserted, error } = await supabase
    .from('staff')
    .insert(data)
    .select()
    .single();

  if (error) throw error;
  return inserted;
}

export async function updateStaff(id: string, data: Partial<Omit<Staff, 'id'>>) {
  const { data: updated, error } = await supabase
    .from('staff')
    .update(data)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return updated;
}

export async function deleteStaff(id: string) {
  const { error } = await supabase
    .from('staff')
    .delete()
    .eq('id', id);

  if (error) throw error;
}