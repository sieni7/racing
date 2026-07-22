create table if not exists public.news (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  excerpt text,
  content text not null,
  cover_image_url text,
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  published_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.news enable row level security;

create policy "Lecture publique articles publiés"
  on public.news for select
  using (status = 'published');

create policy "Lecture admin tous articles"
  on public.news for select
  using (auth.role() = 'authenticated');

create index if not exists idx_news_published on public.news(published_at desc);
create index if not exists idx_news_slug on public.news(slug);
