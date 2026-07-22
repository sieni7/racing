create table if not exists public.players (
  id uuid primary key default gen_random_uuid(),
  first_name text not null,
  last_name text not null,
  slug text not null unique,
  jersey_number integer not null,
  position text not null,
  date_of_birth date,
  nationality text,
  height_cm numeric(4,1),
  weight_kg numeric(4,1),
  preferred_foot text,
  photo_url text,
  bio text,
  is_active boolean default true,
  joined_at timestamptz default now(),
  left_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.players enable row level security;

create policy "Lecture publique joueurs actifs"
  on public.players for select
  using (is_active = true);

create policy "Lecture admin tous joueurs"
  on public.players for select
  using (auth.role() = 'authenticated');

create index if not exists idx_players_active on public.players(is_active);
create index if not exists idx_players_slug on public.players(slug);
