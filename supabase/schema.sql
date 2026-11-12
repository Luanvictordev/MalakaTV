-- Schema do site MalakaTV no Supabase.
-- Rode isso no SQL Editor do projeto (Database → SQL Editor → New query).

-- 1) Conteúdo do site (um registro por coleção: games, builds, guias, links, site)
create table if not exists public.content (
  key text primary key,
  data jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.content enable row level security;

-- leitura pública: o site monta as páginas com a chave anon
drop policy if exists "content_read_all" on public.content;
create policy "content_read_all"
  on public.content for select
  using (true);

-- escrita somente para quem está logado (o admin)
drop policy if exists "content_write_authenticated" on public.content;
create policy "content_write_authenticated"
  on public.content for all
  to authenticated
  using (true)
  with check (true);

-- 2) Bucket de imagens enviadas pelo editor
insert into storage.buckets (id, name, public)
values ('malaka', 'malaka', true)
on conflict (id) do nothing;

drop policy if exists "malaka_images_read" on storage.objects;
create policy "malaka_images_read"
  on storage.objects for select
  using (bucket_id = 'malaka');

drop policy if exists "malaka_images_write" on storage.objects;
create policy "malaka_images_write"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'malaka');

drop policy if exists "malaka_images_update" on storage.objects;
create policy "malaka_images_update"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'malaka');
