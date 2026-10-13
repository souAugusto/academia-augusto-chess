-- Análises de partidas feitas no navegador (o motor roda no aparelho do aluno;
-- aqui só o resultado em formato compacto, ver src/lib/analysis/compact.ts).
-- Migração aditiva: só cria tabela, índices e políticas novas.
create table public.game_analyses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  imported_game_id bigint references public.imported_games(id) on delete set null,
  title text not null check (char_length(title) between 1 and 120),
  headers jsonb not null default '{}'::jsonb,
  data jsonb not null,
  depth smallint not null check (depth between 6 and 30),
  accuracy_white numeric(4, 1) check (accuracy_white between 0 and 100),
  accuracy_black numeric(4, 1) check (accuracy_black between 0 and 100),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- Guarda contra abuso: uma partida longa ocupa poucos kilobytes.
  check (pg_column_size(data) < 65536),
  check (pg_column_size(headers) < 4096)
);
create index game_analyses_user_idx on public.game_analyses (user_id, created_at desc);
-- Uma análise por partida importada (reanalisar substitui a anterior).
create unique index game_analyses_imported_idx
  on public.game_analyses (user_id, imported_game_id)
  where imported_game_id is not null;
alter table public.game_analyses enable row level security;

-- Cada aluno vê e mexe só nas próprias análises; gravar exige assinatura.
-- O limite por plano (ANALYSIS_MIN_PLAN_RANK) também é conferido no servidor.
create policy game_analyses_select on public.game_analyses for select
  using (user_id = (select auth.uid()) or (select public.is_admin()));
create policy game_analyses_insert on public.game_analyses for insert
  with check (user_id = (select auth.uid()) and (select public.my_plan_rank()) >= 1);
create policy game_analyses_update on public.game_analyses for update
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()) and (select public.my_plan_rank()) >= 1);
create policy game_analyses_delete on public.game_analyses for delete
  using (user_id = (select auth.uid()));
