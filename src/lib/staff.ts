import { supabase } from './supabase';
import type { Staff } from '../types';

export type { Staff };

function toResult<T>(data: T | null, error: Error | null) {
  return { data, error };
}

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

  return toResult(data, error);
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

  return toResult(inserted, error);
}

export async function updateStaff(id: string, data: Partial<Omit<Staff, 'id'>>) {
  const { data: updated, error } = await supabase
    .from('staff')
    .update(data)
    .eq('id', id)
    .select()
    .single();

  return toResult(updated, error);
}

export async function deleteStaff(id: string) {
  const { error } = await supabase
    .from('staff')
    .delete()
    .eq('id', id);

  return toResult(null, error);
}