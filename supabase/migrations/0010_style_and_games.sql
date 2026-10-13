-- Questionário de estilo de jogo e importação de partidas (Chess.com e Lichess).

-- ============================================================
-- ESTILO DE JOGO (definido só pelo questionário)
-- ============================================================
-- Histórico: cada vez que o aluno responde, um registro novo.
create table public.style_results (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  answers jsonb not null,   -- { "id_da_pergunta": "id_da_opção" }
  scores jsonb not null,    -- { "atacante": 7, "posicional": 4, ... }
  style text not null check (style in ('atacante', 'posicional', 'tatico', 'defensor', 'universal')),
  created_at timestamptz not null default now()
);
create index style_results_user_idx on public.style_results (user_id, created_at desc);
alter table public.style_results enable row level security;
create policy style_results_own_select on public.style_results for select
  using (user_id = (select auth.uid()) or (select public.is_admin()));
create policy style_results_own_insert on public.style_results for insert
  with check (user_id = (select auth.uid()));

-- Selo atual: público (pode aparecer em perfil, turma ou ranking).
create table public.player_styles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  style text not null check (style in ('atacante', 'posicional', 'tatico', 'defensor', 'universal')),
  updated_at timestamptz not null default now()
);
alter table public.player_styles enable row level security;
create policy player_styles_public_select on public.player_styles for select using (true);
create policy player_styles_own_insert on public.player_styles for insert
  with check (user_id = (select auth.uid()));
create policy player_styles_own_update on public.player_styles for update
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

-- ============================================================
-- CONTAS VINCULADAS E PARTIDAS IMPORTADAS
-- ============================================================
create table public.linked_accounts (
  user_id uuid not null references auth.users(id) on delete cascade,
  platform text not null check (platform in ('chesscom', 'lichess')),
  username text not null check (char_length(username) between 2 and 50),
  last_import_at timestamptz,          -- limite de frequência do "Atualizar"
  last_game_at timestamptz,            -- importações seguintes só buscam depois disso
  created_at timestamptz not null default now(),
  primary key (user_id, platform)
);
alter table public.linked_accounts enable row level security;
create policy linked_accounts_own on public.linked_accounts for all
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

create table public.imported_games (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  platform text not null check (platform in ('chesscom', 'lichess')),
  external_id text not null,
  played_at timestamptz not null,
  color text not null check (color in ('white', 'black')),
  result text not null check (result in ('win', 'draw', 'loss')),
  end_reason text not null,            -- mate, tempo, abandono, afogamento, ...
  time_control text,                   -- ex.: "180+2"
  time_class text not null check (time_class in ('bullet', 'blitz', 'rapid', 'classical', 'correspondence')),
  user_rating int,
  opponent_rating int,
  opening_name text,
  eco text,
  moves int,
  unique (user_id, platform, external_id)
);
create index imported_games_user_idx on public.imported_games (user_id, played_at desc);
alter table public.imported_games enable row level security;
create policy imported_games_own on public.imported_games for all
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
