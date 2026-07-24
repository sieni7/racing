create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  subject text not null default '',
  message text not null,
  read boolean not null default false,
  replied boolean not null default false,
  reply_body text,
  created_at timestamptz default now()
);

alter table public.contact_messages enable row level security;

create policy "Insert public contact_messages"
  on public.contact_messages for insert
  with check (true);

create policy "Lecture admin contact_messages"
  on public.contact_messages for select
  using (auth.role() = 'authenticated');

create policy "Modification admin contact_messages"
  on public.contact_messages for update
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

create policy "Suppression admin contact_messages"
  on public.contact_messages for delete
  using (auth.role() = 'authenticated');
