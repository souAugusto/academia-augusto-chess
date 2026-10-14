-- Análises de partidas são privadas: cada aluno lê só as próprias, inclusive
-- quem é admin (antes o admin lia as de todos, e elas apareciam na lista dele).
-- Nenhum dado é apagado; só a regra de leitura muda.
drop policy if exists game_analyses_select on public.game_analyses;
create policy game_analyses_select on public.game_analyses for select
  using (user_id = (select auth.uid()));
