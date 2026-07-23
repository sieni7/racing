create table if not exists public.standings (
  id uuid primary key default gen_random_uuid(),
  team_name text not null,
  season text not null,
  played integer default 0,
  won integer default 0,
  drawn integer default 0,
  lost integer default 0,
  goals_for integer default 0,
  goals_against integer default 0,
  goal_diff integer default 0,
  points integer default 0,
  position integer default 0,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (team_name, season)
);

alter table public.standings enable row level security;

create policy "Lecture publique classement actif"
  on public.standings for select
  using (is_active = true);

create policy "Lecture admin tout classement"
  on public.standings for select
  using (auth.role() = 'authenticated');

create index if not exists idx_standings_season on public.standings(season);
create index if not exists idx_standings_active on public.standings(is_active);