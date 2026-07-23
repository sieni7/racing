import { supabase } from './supabase';
import type { Gallery } from '../types';

export async function getGalleryItems(category?: string, admin = false): Promise<Gallery[]> {
  let query = supabase.from('gallery').select('*');

  if (!admin) {
    query = query.eq('is_active', true).order('sort_order', { ascending: true });
  } else {
    query = query.order('published_at', { ascending: false });
  }

  if (category) {
    query = query.eq('category', category);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data ?? [];
}

export async function getGalleryCategories(): Promise<string[]> {
  const { data, error } = await supabase
    .from('gallery')
    .select('category')
    .eq('is_active', true);

  if (error) throw error;
  const categories = data?.map(item => item.category).filter(Boolean) ?? [];
  return [...new Set(categories)] as string[];
}

export async function createGalleryItem(data: Partial<Gallery>): Promise<Gallery> {
  const { data: inserted, error } = await supabase
    .from('gallery')
    .insert(data)
    .select()
    .single();

  if (error) throw error;
  return inserted;
}

export async function updateGalleryItem(id: string, data: Partial<Gallery>): Promise<Gallery> {
  const { data: updated, error } = await supabase
    .from('gallery')
    .update(data)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return updated;
}

export async function deleteGalleryItem(id: string): Promise<void> {
  const { error } = await supabase
    .from('gallery')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

export async function uploadGalleryImage(file: File, path: string): Promise<string> {
  const { data, error } = await supabase.storage
    .from('gallery')
    .upload(path, file, { cacheControl: '3600', upsert: false });

  if (error) throw error;

  const { data: { publicUrl } } = supabase.storage
    .from('gallery')
    .getPublicUrl(data.path);

  return publicUrl;
}