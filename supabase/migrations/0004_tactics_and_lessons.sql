-- Academia Finale: Fase 2 (táticas com rating e aulas com YouTube).

-- ============================================================
-- RATING E ESTATÍSTICAS DO ALUNO
-- ============================================================
-- O aluno só lê. Quem escreve é o servidor (service role), depois de conferir
-- a solução do puzzle. Assim ninguém altera o próprio rating pela API.
create table public.user_stats (
  user_id uuid primary key references auth.users(id) on delete cascade,
  puzzle_rating int not null default 1500,
  puzzle_games int not null default 0,      -- tentativas que contaram para o rating
  puzzles_solved int not null default 0,
  last_puzzle_at timestamptz,
  updated_at timestamptz not null default now()
);
alter table public.user_stats enable row level security;
create policy user_stats_select on public.user_stats for select
  using (user_id = (select auth.uid()) or (select public.is_admin()));

-- Histórico: se a tentativa contou para o rating e o rating depois dela.
alter table public.attempts
  add column if not exists rated boolean not null default false,
  add column if not exists rating_after int;
create index if not exists attempts_user_puzzle_idx on public.attempts (user_id, puzzle_id);

-- ============================================================
-- PRÓXIMO PUZZLE
-- ============================================================
-- Sorteia um puzzle na faixa de rating (e tema, se houver), sem repetir os
-- que o aluno tentou nos últimos 30 dias. Roda com as permissões do aluno:
-- o RLS de puzzles já exige plano ativo.
create or replace function public.next_puzzle(p_min int, p_max int, p_theme text default null)
returns setof public.puzzles
language sql stable security invoker set search_path = public as $$
  select p.*
  from public.puzzles p
  where p.source in ('lichess', 'official')
    and p.rating between p_min and p_max
    and (p_theme is null or p.themes @> array[p_theme])
    and not exists (
      select 1 from public.attempts a
      where a.user_id = (select auth.uid())
        and a.puzzle_id = p.id
        and a.created_at > now() - interval '30 days'
    )
  order by random()
  limit 1;
$$;
revoke execute on function public.next_puzzle(int, int, text) from public, anon;
grant execute on function public.next_puzzle(int, int, text) to authenticated;

-- ============================================================
-- AULAS: YOUTUBE COMO PROVEDOR INICIAL
-- ============================================================
alter table public.lessons alter column video_provider set default 'youtube';
alter table public.lessons
  add constraint lessons_video_provider_check check (video_provider in ('youtube', 'bunny', 'mux'));
