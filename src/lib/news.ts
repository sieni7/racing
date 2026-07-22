import { supabase } from './supabase';
import type { NewsItem } from '../types';

export type { NewsItem as News };

export async function getNews(page = 1, perPage = 5): Promise<{ news: NewsItem[]; count: number }> {
  const from = (page - 1) * perPage;
  const to = from + perPage - 1;

  const { data, error, count } = await supabase
    .from('news')
    .select('*', { count: 'exact' })
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .range(from, to);

  if (error) throw error;
  return { news: data ?? [], count: count ?? 0 };
}

export async function getAllNews() {
  const { data, error } = await supabase
    .from('news')
    .select('*')
    .order('published_at', { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function getPublishedNews() {
  const { data, error } = await supabase
    .from('news')
    .select('*')
    .eq('status', 'published')
    .order('published_at', { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function getRecentNews(limit = 3): Promise<NewsItem[]> {
  const { data, error } = await supabase
    .from('news')
    .select('*')
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data ?? [];
}

export async function getNewsBySlug(slug: string): Promise<NewsItem | null> {
  const { data, error } = await supabase
    .from('news')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error) throw error;
  return data;
}

export async function getNewsById(id: string): Promise<NewsItem | null> {
  const { data, error } = await supabase
    .from('news')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}

export async function createNews(data: Partial<Omit<NewsItem, 'id'>>) {
  const { data: inserted, error } = await supabase
    .from('news')
    .insert(data)
    .select()
    .single();

  if (error) throw error;
  return inserted;
}

export async function updateNews(id: string, data: Partial<Omit<NewsItem, 'id'>>) {
  const { data: updated, error } = await supabase
    .from('news')
    .update(data)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return updated;
}

export async function deleteNews(id: string) {
  const { error } = await supabase
    .from('news')
    .delete()
    .eq('id', id);

  if (error) throw error;
}