create table if not exists public.site_config (
  id uuid primary key default gen_random_uuid(),
  club_history_years integer not null default 75,
  players_count integer not null default 28,
  championships integer not null default 4,
  staff_count integer not null default 12,
  metrics_config jsonb not null default '[]'::jsonb,
  address text not null default '',
  email text not null default '',
  phone text not null default '',
  facebook_url text not null default '',
  instagram_url text not null default '',
  twitter_url text not null default '',
  youtube_url text not null default '',
  maintenance_mode boolean not null default false,
  hero_slides jsonb not null default '[]'::jsonb,
  hero_settings jsonb not null default '{"transition":"fade","autoplay":true,"interval":5000,"show_arrows":true,"show_dots":true}'::jsonb,
  updated_at timestamptz default now()
);

-- Insert default config
insert into public.site_config (club_history_years, players_count, championships, staff_count,
  metrics_config, address, email, phone,
  facebook_url, instagram_url, twitter_url, youtube_url)
values (
  75, 28, 4, 12,
  '[{"key":"club_history_years","label":"Ann\u00e9es d\u0027histoire","visible":true},{"key":"players_count","label":"Joueurs","visible":true},{"key":"championships","label":"Championnats","visible":true},{"key":"staff_count","label":"Staff","visible":true}]'::jsonb,
  'Stade de Bingerville, C\u00f4te d\u0027Ivoire',
  'contact@racingclub.ci',
  '+225 00 00 00 00',
  'https://facebook.com/rcbingerville',
  'https://instagram.com/rcbingerville',
  'https://twitter.com/rcbingerville',
  '#'
);

alter table public.site_config enable row level security;

create policy "Lecture publique site_config"
  on public.site_config for select
  using (true);

create policy "Modification admin site_config"
  on public.site_config for update
  using (auth.role() = 'authenticated' and auth.jwt() ->> 'role' = 'admin')
  with check (auth.role() = 'authenticated' and auth.jwt() ->> 'role' = 'admin');
