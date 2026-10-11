-- Academia Finale: Fase 3 (aberturas e finais).

-- ============================================================
-- NOMES DE ABERTURAS (lichess-org/chess-openings, CC0)
-- ============================================================
-- Fatos públicos (código ECO, nome e lances). Leitura liberada; escrita só admin.
create table public.openings (
  id bigint generated always as identity primary key,
  eco text not null,
  name text not null,
  pgn text not null,
  uci text not null,
  epd text not null,            -- posição final (FEN sem os contadores), para achar o nome
  unique (eco, name, pgn)
);
create index openings_epd_idx on public.openings (epd);
alter table public.openings enable row level security;
create policy openings_read on public.openings for select using (true);
create policy openings_admin on public.openings for all
  using ((select public.is_admin())) with check ((select public.is_admin()));

-- ============================================================
-- REPERTÓRIOS (árvore de variantes com comentário em cada lance)
-- ============================================================
create table public.repertoires (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9-]{2,60}$'),
  title text not null,
  description text,
  color text not null check (color in ('white', 'black')),  -- lado do aluno
  plan_required int not null default 1 check (plan_required in (1, 2)),
  position int not null default 0,
  is_published boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.repertoire_nodes (
  id uuid primary key default gen_random_uuid(),
  repertoire_id uuid not null references public.repertoires(id) on delete cascade,
  parent_id uuid references public.repertoire_nodes(id) on delete cascade,  -- null = primeiro lance
  uci text not null check (uci ~ '^[a-h][1-8][a-h][1-8][qrbn]?$'),
  san text not null,
  comment text,
  position int not null default 0,  -- ordem entre lances alternativos
  created_at timestamptz not null default now()
);
create index repertoire_nodes_repertoire_idx on public.repertoire_nodes (repertoire_id);
create index repertoire_nodes_parent_idx on public.repertoire_nodes (parent_id);

alter table public.repertoires enable row level security;
alter table public.repertoire_nodes enable row level security;

create policy repertoires_select on public.repertoires for select using (
  (select public.is_admin()) or (is_published and (select public.my_plan_rank()) >= plan_required)
);
create policy repertoires_admin on public.repertoires for all
  using ((select public.is_admin())) with check ((select public.is_admin()));

-- A subconsulta passa pelo RLS de repertoires: só aparece o que o aluno pode ver.
create policy repertoire_nodes_select on public.repertoire_nodes for select using (
  (select public.is_admin())
  or exists (select 1 from public.repertoires r where r.id = repertoire_id)
);
create policy repertoire_nodes_admin on public.repertoire_nodes for all
  using ((select public.is_admin())) with check ((select public.is_admin()));

-- Progresso do treino: uma linha por linha do repertório (folha da árvore).
create table public.repertoire_progress (
  user_id uuid not null references auth.users(id) on delete cascade,
  repertoire_id uuid not null references public.repertoires(id) on delete cascade,
  leaf_id uuid not null references public.repertoire_nodes(id) on delete cascade,
  correct_count int not null default 0,
  mistake_count int not null default 0,
  last_trained_at timestamptz not null default now(),
  primary key (user_id, leaf_id)
);
create index repertoire_progress_repertoire_idx on public.repertoire_progress (repertoire_id);
alter table public.repertoire_progress enable row level security;
create policy repertoire_progress_own on public.repertoire_progress for all
  using (user_id = (select auth.uid()) and (select public.my_plan_rank()) >= 1)
  with check (user_id = (select auth.uid()) and (select public.my_plan_rank()) >= 1);
create policy repertoire_progress_admin_read on public.repertoire_progress for select
  using ((select public.is_admin()));

-- ============================================================
-- FINAIS (posições clássicas, treino contra o Stockfish)
-- ============================================================
create table public.endgames (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9-]{2,60}$'),
  title text not null,
  description text,
  category text not null,
  level int not null default 1 check (level between 1 and 3),
  fen text not null,
  user_color text not null check (user_color in ('white', 'black')),
  goal text not null check (goal in ('win', 'draw')),
  max_moves int not null default 50 check (max_moves between 5 and 150),  -- lances do aluno
  plan_required int not null default 1 check (plan_required in (1, 2)),
  position int not null default 0,
  is_published boolean not null default false,
  created_at timestamptz not null default now()
);
alter table public.endgames enable row level security;
create policy endgames_select on public.endgames for select using (
  (select public.is_admin()) or (is_published and (select public.my_plan_rank()) >= plan_required)
);
create policy endgames_admin on public.endgames for all
  using ((select public.is_admin())) with check ((select public.is_admin()));

create table public.endgame_attempts (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  endgame_id uuid not null references public.endgames(id) on delete cascade,
  success boolean not null,
  moves int not null check (moves >= 0),
  created_at timestamptz not null default now()
);
create index endgame_attempts_user_idx on public.endgame_attempts (user_id, endgame_id);
create index endgame_attempts_endgame_idx on public.endgame_attempts (endgame_id);
alter table public.endgame_attempts enable row level security;
create policy endgame_attempts_own on public.endgame_attempts for all
  using (user_id = (select auth.uid()) and (select public.my_plan_rank()) >= 1)
  with check (user_id = (select auth.uid()) and (select public.my_plan_rank()) >= 1);
create policy endgame_attempts_admin_read on public.endgame_attempts for select
  using ((select public.is_admin()));
