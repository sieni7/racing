create table if not exists public.staff (
  id uuid primary key default gen_random_uuid(),
  first_name text not null,
  last_name text not null,
  slug text not null unique,
  role text not null,
  photo_url text,
  bio text,
  email text,
  phone text,
  is_active boolean default true,
  hired_at timestamptz default now(),
  left_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.staff enable row level security;

create policy "Lecture publique staff actif"
  on public.staff for select
  using (is_active = true);

create policy "Lecture admin tout staff"
  on public.staff for select
  using (auth.role() = 'authenticated');

create index if not exists idx_staff_active on public.staff(is_active);
create index if not exists idx_staff_slug on public.staff(slug);
