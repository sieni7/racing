import { supabase } from './supabase';

export interface HeroSlide {
  id: string;
  title: string;
  subtitle: string;
  cta_label: string;
  cta_link: string;
  image_url?: string;
  order: number;
}

export interface HeroSettings {
  transition: 'fade' | 'slide';
  autoplay: boolean;
  interval: number;
  show_arrows: boolean;
  show_dots: boolean;
}

export interface MetricConfig {
  key: string;
  label: string;
  visible: boolean;
}

export interface Sponsor {
  name: string;
  logo_url: string;
  website_url: string;
}

export interface SiteConfig {
  id: string;
  club_history_years: number;
  players_count: number;
  championships: number;
  staff_count: number;
  metrics_config: MetricConfig[];
  address: string;
  email: string;
  phone: string;
  facebook_url: string;
  instagram_url: string;
  twitter_url: string;
  youtube_url: string;
  maintenance_mode: boolean;
  hero_slides: HeroSlide[];
  hero_settings: HeroSettings;
  sponsors: Sponsor[];
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

export async function upsertSiteConfig(values: Partial<SiteConfig>): Promise<SiteConfig> {
  const existing = await getSiteConfig();
  if (existing) {
    const { data, error } = await supabase.from(TABLE).update(values).eq('id', existing.id).select('*').single();
    if (error) throw error;
    return data as SiteConfig;
  }
  const { data, error } = await supabase.from(TABLE).insert(values).select('*').single();
  if (error) throw error;
  return data as SiteConfig;
}

export const DEFAULT_CONFIG: Omit<SiteConfig, 'id' | 'updated_at'> & { sponsors: Sponsor[] } = {
  club_history_years: 75,
  players_count: 28,
  championships: 4,
  staff_count: 12,
  metrics_config: [
    { key: 'club_history_years', label: "Années d'histoire", visible: true },
    { key: 'players_count', label: 'Joueurs', visible: true },
    { key: 'championships', label: 'Championnats', visible: true },
    { key: 'staff_count', label: 'Staff', visible: true },
  ],
  address: 'Stade de Bingerville, Côte d\'Ivoire',
  email: 'contact@racingclub.ci',
  phone: '+225 00 00 00 00',
  facebook_url: 'https://facebook.com/rcbingerville',
  instagram_url: 'https://instagram.com/rcbingerville',
  twitter_url: 'https://twitter.com/rcbingerville',
  youtube_url: '#',
  maintenance_mode: false,
  hero_slides: [
    { id: '1', title: 'Bienvenue au Racing Club', subtitle: 'Le ciel et le marine, une histoire de passion', cta_label: 'Découvrir', cta_link: '/effectif', image_url: '', order: 0 },
    { id: '2', title: 'Nos matchs à venir', subtitle: 'Soutenez les ciel et marine', cta_label: 'Voir le calendrier', cta_link: '/matchs', image_url: '', order: 1 },
    { id: '3', title: 'Actualités du club', subtitle: 'Toute l\'actualité du Racing Club', cta_label: 'Lire les actus', cta_link: '/news', image_url: '', order: 2 },
  ],
  hero_settings: { transition: 'fade', autoplay: true, interval: 5000, show_arrows: true, show_dots: true },
  sponsors: [],
};
