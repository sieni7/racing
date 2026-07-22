create table if not exists public.matches (
  id uuid primary key default gen_random_uuid(),
  opponent_name text not null,
  is_home boolean default true,
  match_date timestamptz not null,
  venue text,
  competition text,
  season text,
  matchday integer,
  status text not null default 'upcoming' check (status in ('upcoming', 'finished', 'postponed')),
  racing_score integer,
  opponent_score integer,
  summary text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.matches enable row level security;

create policy "Lecture publique matchs"
  on public.matches for select
  using (true);

create index if not exists idx_matches_date on public.matches(match_date desc);
create index if not exists idx_matches_status on public.matches(status);
