-- Análise profunda (perfil fixo do motor). Migração aditiva na tabela que já
-- existe (game_analyses, 0012): nenhum dado é apagado.
-- - engine_profile e algo_version: com que motor/profundidade/linhas e com que
--   versão das regras a análise foi feita (para marcar as antigas como
--   desatualizadas e reanalisar sob demanda);
-- - game_key: identifica a partida ("chesscom:<id>", "lichess:<id>" ou
--   "pgn:<hash dos lances>"), para reabrir sem recalcular;
-- - summary: precisão, contagem por classe, momentos-chave e abertura.
-- A análise é privada do aluno e não alimenta rating tático, títulos nem ranking.
-- O RLS continua o da 0012/0013: cada aluno lê e grava só as próprias.

alter table public.game_analyses
  add column engine_profile jsonb not null default '{}'::jsonb,
  add column algo_version smallint not null default 0,
  add column game_key text,
  add column summary jsonb not null default '{}'::jsonb;

alter table public.game_analyses
  add constraint game_analyses_engine_profile_size check (pg_column_size(engine_profile) < 512),
  add constraint game_analyses_summary_size check (pg_column_size(summary) < 8192),
  add constraint game_analyses_game_key_format
    check (game_key is null or game_key ~ '^(chesscom|lichess|pgn):[A-Za-z0-9_-]{1,80}$');

-- Uma análise por partida e por aluno.
create unique index game_analyses_game_key_idx
  on public.game_analyses (user_id, game_key)
  where game_key is not null;

-- Análises antigas de partidas importadas ganham a chave da partida.
update public.game_analyses a
set game_key = g.platform || ':' || g.external_id
from public.imported_games g
where a.imported_game_id = g.id
  and a.game_key is null
  and (g.platform || ':' || g.external_id) ~ '^(chesscom|lichess):[A-Za-z0-9_-]{1,80}$';
