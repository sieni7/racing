create table if not exists public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  endpoint text not null unique,
  keys jsonb not null,
  user_id uuid references auth.users(id) on delete cascade,
  created_at timestamptz default now()
);

alter table public.push_subscriptions enable row level security;

create policy "Insertion publique abonnement"
  on public.push_subscriptions for insert
  with check (true);

create policy "Suppression admin abonnement"
  on public.push_subscriptions for delete
  using (auth.role() = 'authenticated');

create policy "Lecture admin abonnements"
  on public.push_subscriptions for select
  using (auth.role() = 'authenticated');

create index if not exists idx_push_endpoint on public.push_subscriptions(endpoint);