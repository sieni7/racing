-- Add fonction column to staff (club position), migrate data from role
alter table public.staff add column if not exists fonction text not null default '';
update public.staff set fonction = role where fonction = '';

-- Update site_config policy for new roles
drop policy if exists "Modification admin site_config" on public.site_config;

create policy "Modification admin site_config"
  on public.site_config for update
  using (auth.role() = 'authenticated' and auth.jwt() ->> 'role' in ('super-admin', 'admin', 'redacteur'))
  with check (auth.role() = 'authenticated' and auth.jwt() ->> 'role' in ('super-admin', 'admin', 'redacteur'));
