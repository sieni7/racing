create table if not exists public.gallery (
  id uuid primary key default gen_random_uuid(),
  title text,
  description text,
  image_url text not null,
  category text,
  sort_order integer default 0,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.gallery enable row level security;

create policy "Lecture publique galerie active"
  on public.gallery for select
  using (is_active = true);

create policy "Lecture admin toute galerie"
  on public.gallery for select
  using (auth.role() = 'authenticated');

create index if not exists idx_gallery_active on public.gallery(is_active);
create index if not exists idx_gallery_sort on public.gallery(sort_order);