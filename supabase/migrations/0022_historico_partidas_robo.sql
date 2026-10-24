-- Histórico das partidas contra o computador (até 200 por aluno; passou
-- disso, a mais antiga sai). Guarda os lances em UCI, cor, resultado, motivo,
-- estrelas, precisão aproximada e as marcas de erro dos lances do aluno.
-- O id vem do aparelho (uuid): ao juntar as partidas de antes do login com a
-- conta, a mesma partida não entra duas vezes.
-- RLS: cada aluno lê, grava e apaga só as próprias; o admin lê todas.

create table public.bot_games (
  id uuid primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  bot_id text not null check (bot_id ~ '^[a-z0-9-]{1,60}$'),
  player_color text not null check (player_color in ('w', 'b')),
  result text not null check (result in ('vitoria', 'derrota', 'empate')),
  reason text not null check (
    reason in ('mate', 'afogamento', 'repeticao', '50-lances', 'material', 'abandono', 'acordo', 'tempo')
  ),
  stars smallint not null default 0 check (stars between 0 and 3),
  accuracy smallint check (accuracy between 0 and 100),
  moves text not null check (char_length(moves) <= 2400 and moves ~ '^([a-h][1-8][a-h][1-8][qrbn]?( |$))*$'),
  marks jsonb not null default '[]'::jsonb
    check (jsonb_typeof(marks) = 'array' and jsonb_array_length(marks) <= 400),
  clock text not null default 'sem' check (clock ~ '^[a-z0-9+]{1,10}$'),
  played_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);
create index bot_games_user_played_idx on public.bot_games (user_id, played_at desc);
alter table public.bot_games enable row level security;

create policy bot_games_select on public.bot_games for select
  using (user_id = (select auth.uid()) or (select public.is_admin()));
create policy bot_games_insert on public.bot_games for insert
  with check (user_id = (select auth.uid()));
create policy bot_games_delete on public.bot_games for delete
  using (user_id = (select auth.uid()));

-- Partida terminada: soma no progresso (0021), guarda no histórico e apaga
-- as mais antigas além de 200. Tudo de uma vez.
create or replace function public.save_bot_game(
  p_id uuid,
  p_bot text,
  p_color text,
  p_result text,
  p_reason text,
  p_stars integer,
  p_accuracy integer,
  p_moves text,
  p_marks jsonb,
  p_clock text
) returns void
language plpgsql security invoker set search_path = public as $$
declare
  uid uuid := (select auth.uid());
begin
  if uid is null then
    raise exception 'login necessário';
  end if;
  insert into public.bot_games
    (id, user_id, bot_id, player_color, result, reason, stars, accuracy, moves, marks, clock)
  values
    (p_id, uid, p_bot, p_color, p_result, p_reason, p_stars, p_accuracy, p_moves, p_marks, p_clock)
  on conflict (id) do nothing;
  if not found then
    return; -- a mesma partida já foi registrada
  end if;
  perform public.record_bot_game(p_bot, p_result, p_stars);
  delete from public.bot_games
  where user_id = uid
    and id in (
      select id from public.bot_games
      where user_id = uid
      order by played_at desc
      offset 200
    );
end;
$$;

revoke all on function public.save_bot_game(uuid, text, text, text, text, integer, integer, text, jsonb, text) from public, anon;
grant execute on function public.save_bot_game(uuid, text, text, text, text, integer, integer, text, jsonb, text) to authenticated;
