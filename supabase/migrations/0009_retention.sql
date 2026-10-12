-- Fase 5: sequência diária, trilhas e conjuntos do método do Intensivo.

-- ============================================================
-- SEQUÊNCIA DIÁRIA: um registro por dia com treino (horário de Brasília)
-- ============================================================
create table public.user_activity (
  user_id uuid not null references auth.users(id) on delete cascade,
  day date not null,
  primary key (user_id, day)
);
alter table public.user_activity enable row level security;
create policy user_activity_select on public.user_activity for select
  using (user_id = (select auth.uid()) or (select public.is_admin()));

-- Marca o dia de hoje para o aluno logado. O dia é calculado no banco.
create or replace function public.mark_activity()
returns void language sql security definer set search_path = public as $$
  insert into public.user_activity (user_id, day)
  select auth.uid(), (now() at time zone 'America/Sao_Paulo')::date
  where auth.uid() is not null
  on conflict do nothing;
$$;
revoke execute on function public.mark_activity() from public, anon;
grant execute on function public.mark_activity() to authenticated;

-- Histórico que já existe vira sequência.
insert into public.user_activity (user_id, day)
select user_id, (created_at at time zone 'America/Sao_Paulo')::date from public.attempts
union
select user_id, (created_at at time zone 'America/Sao_Paulo')::date from public.endgame_attempts
union
select user_id, (completed_at at time zone 'America/Sao_Paulo')::date from public.lesson_progress
union
select user_id, (last_trained_at at time zone 'America/Sao_Paulo')::date from public.repertoire_progress
on conflict do nothing;

-- ============================================================
-- TRILHAS: sequência de etapas montada pelo Augusto
-- ============================================================
create table public.trails (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9-]{2,60}$'),
  title text not null,
  description text,
  plan_required int not null default 1 check (plan_required in (1, 2)),
  position int not null default 0,
  is_published boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.trail_steps (
  id uuid primary key default gen_random_uuid(),
  trail_id uuid not null references public.trails(id) on delete cascade,
  kind text not null check (kind in ('lesson', 'repertoire', 'endgame', 'set')),
  ref_id uuid not null,
  title text not null,
  position int not null default 0
);
create index trail_steps_trail_idx on public.trail_steps (trail_id);

alter table public.trails enable row level security;
alter table public.trail_steps enable row level security;

create policy trails_select on public.trails for select
  using ((select public.is_admin()) or (is_published and (select public.my_plan_rank()) >= plan_required));
create policy trails_admin on public.trails for all
  using ((select public.is_admin())) with check ((select public.is_admin()));

create policy trail_steps_select on public.trail_steps for select
  using (exists (select 1 from public.trails t where t.id = trail_id));
create policy trail_steps_admin on public.trail_steps for all
  using ((select public.is_admin())) with check ((select public.is_admin()));

-- ============================================================
-- MÉTODO DO INTENSIVO
-- ============================================================
alter table public.puzzle_sets add column if not exists position int not null default 0;
create index if not exists puzzle_set_items_puzzle_idx on public.puzzle_set_items (puzzle_id);
create index if not exists cycles_user_set_idx on public.cycles (user_id, set_id);

-- Sorteia puzzles de um tema para o aluno montar um conjunto (passa pelo RLS de puzzles).
create or replace function public.pick_puzzles(p_theme text, p_count int, p_min int, p_max int)
returns setof text
language sql stable security invoker set search_path = public as $$
  select p.id
  from public.puzzles p
  where p.source in ('lichess', 'official')
    and p.rating between p_min and p_max
    and (p_theme is null or p.themes @> array[p_theme])
  order by random()
  limit least(greatest(p_count, 1), 100);
$$;
revoke execute on function public.pick_puzzles(text, int, int, int) from public, anon;
grant execute on function public.pick_puzzles(text, int, int, int) to authenticated;
