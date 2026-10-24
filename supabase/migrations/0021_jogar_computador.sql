-- Progresso na trilha "Jogar contra o computador" (10 personagens).
-- Uma linha por aluno e personagem: vitórias, derrotas, empates e a melhor
-- nota (0 a 3 estrelas). Quem joga sem conta guarda o progresso só no
-- aparelho; ao entrar, ele é juntado com o da conta (fica o maior de cada
-- número, então juntar duas vezes não duplica).
-- RLS: cada aluno lê e grava só as próprias linhas; o admin lê todas.
-- As gravações passam pelas funções abaixo (security invoker: a RLS vale).

create table public.bot_progress (
  user_id uuid not null references auth.users(id) on delete cascade,
  bot_id text not null check (bot_id ~ '^[a-z0-9-]{1,60}$'),
  vitorias integer not null default 0 check (vitorias between 0 and 100000),
  derrotas integer not null default 0 check (derrotas between 0 and 100000),
  empates integer not null default 0 check (empates between 0 and 100000),
  estrelas smallint not null default 0 check (estrelas between 0 and 3),
  updated_at timestamptz not null default now(),
  primary key (user_id, bot_id)
);
alter table public.bot_progress enable row level security;

create policy bot_progress_select on public.bot_progress for select
  using (user_id = (select auth.uid()) or (select public.is_admin()));
create policy bot_progress_insert on public.bot_progress for insert
  with check (user_id = (select auth.uid()));
create policy bot_progress_update on public.bot_progress for update
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

-- Registra uma partida terminada (soma 1 no resultado, guarda a melhor nota).
create or replace function public.record_bot_game(
  p_bot text,
  p_result text,
  p_stars integer
) returns void
language plpgsql security invoker set search_path = public as $$
begin
  if (select auth.uid()) is null then
    raise exception 'login necessário';
  end if;
  if p_result not in ('vitoria', 'derrota', 'empate') then
    raise exception 'resultado inválido';
  end if;
  insert into public.bot_progress as bp (user_id, bot_id, vitorias, derrotas, empates, estrelas)
  values (
    (select auth.uid()),
    p_bot,
    (p_result = 'vitoria')::int,
    (p_result = 'derrota')::int,
    (p_result = 'empate')::int,
    least(3, greatest(0, coalesce(p_stars, 0)))
  )
  on conflict (user_id, bot_id) do update set
    vitorias = least(100000, bp.vitorias + excluded.vitorias),
    derrotas = least(100000, bp.derrotas + excluded.derrotas),
    empates = least(100000, bp.empates + excluded.empates),
    estrelas = greatest(bp.estrelas, excluded.estrelas),
    updated_at = now();
end;
$$;

-- Junta o progresso do aparelho com o da conta (o maior de cada número).
create or replace function public.merge_bot_progress(
  p_bot text,
  p_vitorias integer,
  p_derrotas integer,
  p_empates integer,
  p_estrelas integer
) returns void
language plpgsql security invoker set search_path = public as $$
begin
  if (select auth.uid()) is null then
    raise exception 'login necessário';
  end if;
  insert into public.bot_progress as bp (user_id, bot_id, vitorias, derrotas, empates, estrelas)
  values (
    (select auth.uid()),
    p_bot,
    least(100000, greatest(0, p_vitorias)),
    least(100000, greatest(0, p_derrotas)),
    least(100000, greatest(0, p_empates)),
    least(3, greatest(0, p_estrelas))
  )
  on conflict (user_id, bot_id) do update set
    vitorias = greatest(bp.vitorias, excluded.vitorias),
    derrotas = greatest(bp.derrotas, excluded.derrotas),
    empates = greatest(bp.empates, excluded.empates),
    estrelas = greatest(bp.estrelas, excluded.estrelas),
    updated_at = now();
end;
$$;

revoke all on function public.record_bot_game(text, text, integer) from public, anon;
revoke all on function public.merge_bot_progress(text, integer, integer, integer, integer) from public, anon;
grant execute on function public.record_bot_game(text, text, integer) to authenticated;
grant execute on function public.merge_bot_progress(text, integer, integer, integer, integer) to authenticated;
