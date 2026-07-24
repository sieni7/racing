-- Migration: Ajout colonnes manquantes + policies CRUD + bucket storage

-- 1. Ajouter les colonnes manquantes
alter table public.gallery add column if not exists thumbnail_url text;
alter table public.gallery add column if not exists match_id uuid;
alter table public.gallery add column if not exists is_video boolean default false;
alter table public.gallery add column if not exists video_url text;
alter table public.gallery add column if not exists published_at timestamptz default now();

-- 2. Policies CRUD pour admin
drop policy if exists "Insert admin galerie" on public.gallery;
create policy "Insert admin galerie"
  on public.gallery for insert
  with check (auth.role() = 'authenticated');

drop policy if exists "Update admin galerie" on public.gallery;
create policy "Update admin galerie"
  on public.gallery for update
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

drop policy if exists "Delete admin galerie" on public.gallery;
create policy "Delete admin galerie"
  on public.gallery for delete
  using (auth.role() = 'authenticated');

-- 3. Bucket storage 'gallery'
insert into storage.buckets (id, name, public)
values ('gallery', 'gallery', true)
on conflict (id) do nothing;

-- RLS pour le bucket
drop policy if exists "Lecture publique images" on storage.objects;
create policy "Lecture publique images"
  on storage.objects for select
  using (bucket_id = 'gallery');

drop policy if exists "Upload admin images" on storage.objects;
create policy "Upload admin images"
  on storage.objects for insert
  with check (bucket_id = 'gallery' and auth.role() = 'authenticated');

drop policy if exists "Suppression admin images" on storage.objects;
create policy "Suppression admin images"
  on storage.objects for delete
  using (bucket_id = 'gallery' and auth.role() = 'authenticated');
