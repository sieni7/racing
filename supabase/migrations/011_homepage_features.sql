-- Top scorers
create table if not exists public.top_scorers (
  id uuid primary key default gen_random_uuid(),
  player_name text not null,
  goals integer not null default 0,
  position text,
  image_url text,
  season text not null default '',
  sort_order integer not null default 0,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.top_scorers enable row level security;

create policy "Lecture publique top_scorers"
  on public.top_scorers for select
  using (true);

create policy "Insert admin top_scorers"
  on public.top_scorers for insert
  with check (auth.role() = 'authenticated');

create policy "Update admin top_scorers"
  on public.top_scorers for update
  using (auth.role() = 'authenticated');

create policy "Delete admin top_scorers"
  on public.top_scorers for delete
  using (auth.role() = 'authenticated');

-- Player of the month
create table if not exists public.players_of_month (
  id uuid primary key default gen_random_uuid(),
  player_name text not null,
  goals integer not null default 0,
  assists integer not null default 0,
  position text,
  image_url text,
  month text not null,
  season text not null default '',
  description text,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.players_of_month enable row level security;

create policy "Lecture publique players_of_month"
  on public.players_of_month for select
  using (true);

create policy "Insert admin players_of_month"
  on public.players_of_month for insert
  with check (auth.role() = 'authenticated');

create policy "Update admin players_of_month"
  on public.players_of_month for update
  using (auth.role() = 'authenticated');

create policy "Delete admin players_of_month"
  on public.players_of_month for delete
  using (auth.role() = 'authenticated');

-- Newsletter subscriptions
create table if not exists public.newsletter_subscriptions (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  is_active boolean default true,
  created_at timestamptz default now()
);

alter table public.newsletter_subscriptions enable row level security;

create policy "Insert public newsletter"
  on public.newsletter_subscriptions for insert
  with check (true);

create policy "Lecture admin newsletter"
  on public.newsletter_subscriptions for select
  using (auth.role() = 'authenticated');

create policy "Update admin newsletter"
  on public.newsletter_subscriptions for update
  using (auth.role() = 'authenticated');

create policy "Delete admin newsletter"
  on public.newsletter_subscriptions for delete
  using (auth.role() = 'authenticated');

-- Add sponsors to site_config
alter table public.site_config add column if not exists sponsors jsonb not null default '[]'::jsonb;
