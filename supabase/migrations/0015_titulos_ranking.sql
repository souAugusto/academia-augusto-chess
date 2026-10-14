-- 0015: títulos por nível e ranking (Bloco B do PROMPT_PERSONALIZACAO_TITULOS.md).
-- Usa o rating de táticas que já existe (user_stats.puzzle_rating, começa em 1500),
-- por decisão do Augusto. Só acrescenta: nada existente é apagado.

-- ============================================================
-- ESCADA DE TÍTULOS (editável no painel /admin/titulos, sem mexer em código)
-- Sem títulos oficiais da FIDE ou da federação.
-- ============================================================
create table public.titles (
  id smallint generated always as identity primary key,
  slug text not null unique check (slug ~ '^[a-z0-9-]{2,40}$'),
  name text not null check (char_length(name) between 2 and 40),
  min_rating int not null unique check (min_rating between 0 and 4000),
  tagline text check (char_length(tagline) <= 120),
  color text not null default '#D4AF57' check (color ~ '^#[0-9A-Fa-f]{6}$')
);

insert into public.titles (slug, name, min_rating, tagline, color) values
  ('aprendiz',         'Aprendiz do Tabuleiro', 0,    'Toda lenda começou movendo um peão.',        '#A9B9B0'),
  ('peao-valente',     'Peão Valente',          900,  'Já enxerga as primeiras armadilhas.',        '#C9D6CE'),
  ('cavaleiro-tatico', 'Cavaleiro Tático',      1100, 'Os garfos agora são a sua marca.',           '#8FB8A0'),
  ('cacador',          'Caçador de Táticas',    1300, 'Nenhuma peça solta escapa do seu olhar.',    '#6FBF9A'),
  ('promessa',         'Promessa da Academia',  1500, 'A academia já fala o seu nome.',             '#E8C872'),
  ('experiente',       'Jogador Experiente',    1600, 'Poucos chegam aqui. Você chegou.',           '#D4AF57'),
  ('forte',            'Jogador Forte',         1800, 'Os adversários já pensam duas vezes.',       '#E0A63A'),
  ('mestre-tatico',    'Mestre das Táticas',    2000, 'Você calcula onde os outros apenas torcem.', '#F0883E'),
  ('algoz',            'Algoz do Tabuleiro',    2200, 'Cada posição é uma sentença.',               '#E5603C'),
  ('lenda',            'Lenda da Academia',     2400, 'O topo da escada. Poucos o verão de perto.', '#F2D27A');

alter table public.titles enable row level security;
create policy titles_read on public.titles for select to authenticated using (true);
-- Escrita só pelo servidor (service role), depois de conferir que é admin.

-- ============================================================
-- TÍTULOS CONQUISTADOS (permanentes: nunca são retirados)
-- ============================================================
create table public.user_titles (
  user_id uuid not null references auth.users(id) on delete cascade,
  title_id smallint not null references public.titles(id) on delete cascade,
  earned_at timestamptz not null default now(),
  primary key (user_id, title_id)
);
alter table public.user_titles enable row level security;
-- Cada aluno lê só os próprios (sem exceção para admin: o admin usa a service role).
create policy user_titles_select on public.user_titles for select
  using (user_id = (select auth.uid()));
-- Sem policy de escrita: só o servidor concede títulos.

-- ============================================================
-- RANKING
-- Só campos públicos (apelido, foto, rating, título). Entra quem tem apelido,
-- deixou "aparecer no ranking" ligado e tem 30+ puzzles contados.
-- Só quem tem plano ativo consegue ver. Sempre devolve a linha do próprio aluno.
-- ============================================================
create or replace function public.get_ranking(p_limit int default 50)
returns table (
  pos bigint,
  display_name text,
  avatar_path text,
  rating int,
  games int,
  title_name text,
  title_color text,
  is_me boolean
)
language sql stable security definer set search_path = public as $$
  with ranked as (
    select row_number() over (order by s.puzzle_rating desc, s.puzzle_games desc, p.display_name) as pos,
           p.id,
           p.display_name::text as display_name,
           p.avatar_path,
           s.puzzle_rating as rating,
           s.puzzle_games as games
      from public.user_stats s
      join public.profiles p on p.id = s.user_id
     where p.show_in_ranking
       and p.display_name is not null
       and s.puzzle_games >= 30
  )
  select r.pos, r.display_name, r.avatar_path, r.rating, r.games,
         t.name, t.color, r.id = auth.uid()
    from ranked r
    left join lateral (
      select tt.name, tt.color
        from public.user_titles ut
        join public.titles tt on tt.id = ut.title_id
       where ut.user_id = r.id
       order by tt.min_rating desc
       limit 1
    ) t on true
   where public.my_plan_rank() >= 1
     and (r.pos <= least(greatest(p_limit, 1), 100) or r.id = auth.uid())
   order by r.pos;
$$;
revoke execute on function public.get_ranking(int) from public, anon;
grant execute on function public.get_ranking(int) to authenticated;
