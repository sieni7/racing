import { supabase } from './supabase';

export interface SiteConfig {
  id: string;
  club_history_years: number;
  players_count: number;
  championships: number;
  staff_count: number;
  address: string;
  email: string;
  phone: string;
  facebook_url: string;
  instagram_url: string;
  twitter_url: string;
  youtube_url: string;
  updated_at: string;
}

const TABLE = 'site_config';

export async function getSiteConfig(): Promise<SiteConfig | null> {
  const { data } = await supabase.from(TABLE).select('*').single();
  return data as SiteConfig | null;
}

export async function updateSiteConfig(values: Partial<Omit<SiteConfig, 'id' | 'updated_at'>>): Promise<SiteConfig> {
  const { data, error } = await supabase.from(TABLE).update(values).eq('id', (await getSiteConfig())?.id || '').select('*').single();
  if (error) throw error;
  return data as SiteConfig;
}

export const DEFAULT_CONFIG: Omit<SiteConfig, 'id' | 'updated_at'> = {
  club_history_years: 75,
  players_count: 28,
  championships: 4,
  staff_count: 12,
  address: 'Stade de Bingerville, Côte d\'Ivoire',
  email: 'contact@racingclub.ci',
  phone: '+225 00 00 00 00',
  facebook_url: 'https://facebook.com/rcbingerville',
  instagram_url: 'https://instagram.com/rcbingerville',
  twitter_url: 'https://twitter.com/rcbingerville',
  youtube_url: '#',
};
