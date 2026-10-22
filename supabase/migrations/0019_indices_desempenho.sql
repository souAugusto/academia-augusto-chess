-- Índices nas chaves estrangeiras apontadas pelo verificador de desempenho do
-- Supabase (consultas e exclusões em cascata ficam mais rápidas). Só cria
-- índices; nenhum dado muda.
create index if not exists game_analyses_imported_game_idx
  on public.game_analyses (imported_game_id);
create index if not exists user_titles_title_idx
  on public.user_titles (title_id);
