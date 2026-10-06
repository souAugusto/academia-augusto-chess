-- Academia Augusto Chess: schema inicial (Supabase / Postgres)
-- Aplicar com: supabase db push  (ou colar no SQL Editor do Supabase)
-- Regra de ouro: toda tabela tem RLS ligado. Escritas sensíveis (assinaturas, vagas)
-- são feitas só pelo servidor com a service role key, nunca pelo navegador.

create extension if not exists pgcrypto;

-- ============================================================
-- PLANOS E ASSINATURAS
-- ============================================================
create table public.plans (
  id text primary key,                 -- 'membro' | 'intensivo'
  name text not null,
  rank int not null,                   -- 1 = membro, 2 = intensivo (intensivo inclui tudo do membro)
  price_cents int not null,
  seat_limit int,                      -- null = sem limite
  stripe_price_id text,
  active boolean not null default true
);

insert into public.plans (id, name, rank, price_cents, seat_limit) values
  ('membro',    'Membro',    1,  1900, null),
  ('intensivo', 'Intensivo', 2, 11900, 10);

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text,
  whatsapp text,
  created_at timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, name)
  values (new.id, coalesce(new.raw_user_meta_data->>'name', ''));
  return new;
end $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Administradores: sem nenhuma policy, ninguém lê/escreve pela API. Só service role / SQL Editor.
create table public.admins (
  user_id uuid primary key references auth.users(id) on delete cascade
);

create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  plan_id text not null references public.plans(id),
  status text not null,                -- active, trialing, past_due, canceled, incomplete, unpaid
  source text not null default 'stripe' check (source in ('stripe', 'manual')),
  stripe_customer_id text,
  stripe_subscription_id text unique,
  current_period_end timestamptz,      -- null permitido para concessão manual sem prazo
  cancel_at_period_end boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index subscriptions_user_idx on public.subscriptions (user_id);

-- Idempotência dos webhooks do Stripe
create table public.stripe_events (
  id text primary key,
  type text not null,
  received_at timestamptz not null default now()
);

-- Reserva temporária de vaga do Intensivo (evita vender a 11ª vaga em compras simultâneas)
create table public.seat_reservations (
  user_id uuid primary key references auth.users(id) on delete cascade,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

-- Lista de espera quando a turma está cheia
create table public.waitlist (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  plan_id text not null default 'intensivo' references public.plans(id),
  created_at timestamptz not null default now(),
  unique (email, plan_id)
);

-- ============================================================
-- FUNÇÕES AUXILIARES (usadas pelas policies de RLS)
-- ============================================================
create or replace function public.my_plan_rank()
returns int language sql stable security definer set search_path = public as $$
  select coalesce(max(p.rank), 0)
  from public.subscriptions s
  join public.plans p on p.id = s.plan_id
  where s.user_id = auth.uid()
    and s.status in ('active', 'trialing', 'past_due')
    and (s.current_period_end is null or s.current_period_end > now() - interval '3 days');
$$;

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.admins a where a.user_id = auth.uid());
$$;

create or replace function public.intensivo_seats_left()
returns int language sql stable security definer set search_path = public as $$
  select greatest(
    0,
    coalesce((select seat_limit from public.plans where id = 'intensivo'), 0)
    - (select count(*) from public.subscriptions
        where plan_id = 'intensivo' and status in ('active', 'trialing', 'past_due'))
    - (select count(*) from public.seat_reservations where expires_at > now())
  )::int;
$$;
grant execute on function public.intensivo_seats_left() to anon, authenticated;

-- Reserva de vaga: chamada SÓ pelo servidor (service role) antes de abrir o checkout.
create or replace function public.reserve_intensivo_seat(p_user uuid, p_minutes int default 30)
returns boolean language plpgsql security definer set search_path = public as $$
declare
  v_limit int;
  v_taken int;
begin
  perform pg_advisory_xact_lock(hashtext('intensivo_seats'));
  select seat_limit into v_limit from public.plans where id = 'intensivo';
  delete from public.seat_reservations where expires_at < now();

  if exists (select 1 from public.subscriptions
              where user_id = p_user and plan_id = 'intensivo'
                and status in ('active', 'trialing', 'past_due')) then
    return true;
  end if;

  if exists (select 1 from public.seat_reservations where user_id = p_user) then
    update public.seat_reservations
       set expires_at = now() + make_interval(mins => p_minutes)
     where user_id = p_user;
    return true;
  end if;

  select (select count(*) from public.subscriptions
           where plan_id = 'intensivo' and status in ('active', 'trialing', 'past_due'))
       + (select count(*) from public.seat_reservations)
    into v_taken;

  if v_limit is not null and v_taken >= v_limit then
    return false;
  end if;

  insert into public.seat_reservations (user_id, expires_at)
  values (p_user, now() + make_interval(mins => p_minutes));
  return true;
end $$;
revoke execute on function public.reserve_intensivo_seat(uuid, int) from public, anon, authenticated;

-- ============================================================
-- PUZZLES, CONJUNTOS E MÉTODO AUGUSTO CHESS
-- ============================================================
create table public.puzzles (
  id text primary key,                          -- id do Lichess, ou uuid em texto para custom/official
  fen text not null,
  moves text not null,                          -- lances em UCI separados por espaço
  first_move_is_setup boolean not null default true,
    -- true  (Lichess): o 1º lance é do adversário; o aluno joga a partir do 2º
    -- false (custom):  o FEN já é a posição em que o aluno joga; moves = solução
  rating int,
  popularity int,
  themes text[] not null default '{}',
  opening_tags text[] not null default '{}',
  source text not null default 'lichess' check (source in ('lichess', 'official', 'custom')),
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);
create index puzzles_rating_idx on public.puzzles (rating);
create index puzzles_themes_idx on public.puzzles using gin (themes);

create table public.daily_puzzles (
  day date primary key,
  puzzle_id text not null references public.puzzles(id) on delete cascade
);

create table public.puzzle_sets (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references auth.users(id) on delete cascade,   -- null = conjunto oficial do Augusto
  name text not null,
  description text,
  is_official boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.puzzle_set_items (
  set_id uuid not null references public.puzzle_sets(id) on delete cascade,
  puzzle_id text not null references public.puzzles(id) on delete cascade,
  position int not null,
  primary key (set_id, puzzle_id)
);

create table public.set_enrollments (
  user_id uuid not null references auth.users(id) on delete cascade,
  set_id uuid not null references public.puzzle_sets(id) on delete cascade,
  current_cycle int not null default 1,
  started_at timestamptz not null default now(),
  primary key (user_id, set_id)
);

create table public.cycles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  set_id uuid not null references public.puzzle_sets(id) on delete cascade,
  cycle_number int not null,
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  total_seconds int,
  correct_count int not null default 0,
  total_count int not null,
  unique (user_id, set_id, cycle_number)
);

create table public.attempts (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  cycle_id uuid references public.cycles(id) on delete cascade,   -- null = treino avulso de puzzles
  puzzle_id text not null references public.puzzles(id) on delete cascade,
  solved boolean not null,
  seconds numeric(8, 2) not null,
  created_at timestamptz not null default now()
);
create index attempts_user_idx on public.attempts (user_id, created_at desc);

-- Repetição espaçada dos erros (variação simples do SM-2; regras no PROMPT_MESTRE.md)
create table public.review_state (
  user_id uuid not null references auth.users(id) on delete cascade,
  puzzle_id text not null references public.puzzles(id) on delete cascade,
  ease numeric(4, 2) not null default 2.5,
  interval_days int not null default 0,
  repetitions int not null default 0,
  lapses int not null default 0,
  due_at timestamptz not null default now(),
  last_result boolean,
  updated_at timestamptz not null default now(),
  primary key (user_id, puzzle_id)
);
create index review_due_idx on public.review_state (user_id, due_at);

-- ============================================================
-- AULAS, LIVES E CONFIGURAÇÕES
-- ============================================================
create table public.courses (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  plan_required int not null default 1 check (plan_required in (1, 2)),
  position int not null default 0,
  is_published boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.modules (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  title text not null,
  position int not null default 0
);

create table public.lessons (
  id uuid primary key default gen_random_uuid(),
  module_id uuid not null references public.modules(id) on delete cascade,
  title text not null,
  description text,
  video_provider text not null default 'bunny',
  video_id text,
  fen text,
  pgn text,
  category text not null default 'regular' check (category in ('regular', 'mestre')),
  position int not null default 0,
  is_published boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.lesson_files (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  name text not null,
  kind text not null check (kind in ('pdf', 'pgn')),
  storage_path text not null
);

create table public.lesson_progress (
  user_id uuid not null references auth.users(id) on delete cascade,
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  completed_at timestamptz not null default now(),
  primary key (user_id, lesson_id)
);

create table public.live_events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  starts_at timestamptz not null,
  url text,
  audience text not null default 'public' check (audience in ('public', 'membro', 'intensivo')),
  created_at timestamptz not null default now()
);

-- Links dos grupos de WhatsApp etc. Só admin lê/escreve; o servidor entrega ao aluno com plano ativo.
create table public.app_settings (
  key text primary key,          -- ex.: whatsapp_membros_url, whatsapp_intensivo_url
  value text not null
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
alter table public.plans              enable row level security;
alter table public.profiles           enable row level security;
alter table public.admins             enable row level security;
alter table public.subscriptions      enable row level security;
alter table public.stripe_events      enable row level security;
alter table public.seat_reservations  enable row level security;
alter table public.waitlist           enable row level security;
alter table public.puzzles            enable row level security;
alter table public.daily_puzzles      enable row level security;
alter table public.puzzle_sets        enable row level security;
alter table public.puzzle_set_items   enable row level security;
alter table public.set_enrollments    enable row level security;
alter table public.cycles             enable row level security;
alter table public.attempts           enable row level security;
alter table public.review_state       enable row level security;
alter table public.courses            enable row level security;
alter table public.modules            enable row level security;
alter table public.lessons            enable row level security;
alter table public.lesson_files       enable row level security;
alter table public.lesson_progress    enable row level security;
alter table public.live_events        enable row level security;
alter table public.app_settings       enable row level security;
-- admins, stripe_events, seat_reservations, waitlist, app_settings: sem policy de aluno.
-- (app_settings tem policy só de admin, abaixo.) Só a service role acessa o resto.

-- planos: públicos para leitura
create policy plans_read  on public.plans for select using (true);
create policy plans_admin on public.plans for all using (public.is_admin()) with check (public.is_admin());

-- perfil: cada um lê e edita o seu
create policy profiles_select on public.profiles for select using (id = auth.uid() or public.is_admin());
create policy profiles_update on public.profiles for update using (id = auth.uid()) with check (id = auth.uid());

-- assinaturas: leitura do próprio; nenhuma escrita pelo cliente
create policy subs_select on public.subscriptions for select using (user_id = auth.uid() or public.is_admin());

-- puzzles
create policy puzzles_select on public.puzzles for select using (
  public.is_admin()
  or (source in ('lichess', 'official') and public.my_plan_rank() >= 1)
  or created_by = auth.uid()
  or exists (
    select 1 from public.daily_puzzles d
    where d.puzzle_id = puzzles.id
      and d.day <= (now() at time zone 'America/Sao_Paulo')::date
  )
);
create policy puzzles_insert_custom on public.puzzles for insert
  with check (source = 'custom' and created_by = auth.uid() and public.my_plan_rank() >= 2);
create policy puzzles_delete_custom on public.puzzles for delete
  using (source = 'custom' and created_by = auth.uid());
create policy puzzles_admin on public.puzzles for all using (public.is_admin()) with check (public.is_admin());

-- puzzle do dia: público (isca da Home)
create policy daily_select on public.daily_puzzles for select
  using (day <= (now() at time zone 'America/Sao_Paulo')::date);
create policy daily_admin on public.daily_puzzles for all using (public.is_admin()) with check (public.is_admin());

-- conjuntos de táticas
create policy sets_select on public.puzzle_sets for select using (
  public.is_admin() or owner_id = auth.uid() or (is_official and public.my_plan_rank() >= 2)
);
create policy sets_insert on public.puzzle_sets for insert
  with check (owner_id = auth.uid() and not is_official and public.my_plan_rank() >= 2);
create policy sets_update on public.puzzle_sets for update
  using (owner_id = auth.uid() and not is_official)
  with check (owner_id = auth.uid() and not is_official);
create policy sets_delete on public.puzzle_sets for delete
  using (owner_id = auth.uid() and not is_official);
create policy sets_admin on public.puzzle_sets for all using (public.is_admin()) with check (public.is_admin());

create policy items_select on public.puzzle_set_items for select using (
  public.is_admin() or exists (
    select 1 from public.puzzle_sets s
    where s.id = set_id and (s.owner_id = auth.uid() or (s.is_official and public.my_plan_rank() >= 2))
  )
);
create policy items_write_own on public.puzzle_set_items for all
  using (exists (select 1 from public.puzzle_sets s where s.id = set_id and s.owner_id = auth.uid() and not s.is_official))
  with check (exists (select 1 from public.puzzle_sets s where s.id = set_id and s.owner_id = auth.uid() and not s.is_official));
create policy items_admin on public.puzzle_set_items for all using (public.is_admin()) with check (public.is_admin());

-- progresso do método (só Intensivo)
create policy enroll_own on public.set_enrollments for all
  using (user_id = auth.uid() and public.my_plan_rank() >= 2)
  with check (user_id = auth.uid() and public.my_plan_rank() >= 2);
create policy enroll_admin_read on public.set_enrollments for select using (public.is_admin());

create policy cycles_own on public.cycles for all
  using (user_id = auth.uid() and public.my_plan_rank() >= 2)
  with check (user_id = auth.uid() and public.my_plan_rank() >= 2);
create policy cycles_admin_read on public.cycles for select using (public.is_admin());

-- tentativas e revisão: Membro e Intensivo
create policy attempts_own on public.attempts for all
  using (user_id = auth.uid() and public.my_plan_rank() >= 1)
  with check (user_id = auth.uid() and public.my_plan_rank() >= 1);
create policy attempts_admin_read on public.attempts for select using (public.is_admin());

create policy review_own on public.review_state for all
  using (user_id = auth.uid() and public.my_plan_rank() >= 1)
  with check (user_id = auth.uid() and public.my_plan_rank() >= 1);
create policy review_admin_read on public.review_state for select using (public.is_admin());

-- aulas: respeitam o plano exigido pelo curso. As subconsultas passam pela RLS do próprio aluno.
create policy courses_select on public.courses for select
  using (public.is_admin() or (is_published and public.my_plan_rank() >= plan_required));
create policy courses_admin on public.courses for all using (public.is_admin()) with check (public.is_admin());

create policy modules_select on public.modules for select
  using (public.is_admin() or exists (select 1 from public.courses c where c.id = course_id));
create policy modules_admin on public.modules for all using (public.is_admin()) with check (public.is_admin());

create policy lessons_select on public.lessons for select using (
  public.is_admin() or (is_published and exists (
    select 1 from public.modules m where m.id = module_id
  ))
);
create policy lessons_admin on public.lessons for all using (public.is_admin()) with check (public.is_admin());

create policy lesson_files_select on public.lesson_files for select
  using (public.is_admin() or exists (select 1 from public.lessons l where l.id = lesson_id));
create policy lesson_files_admin on public.lesson_files for all using (public.is_admin()) with check (public.is_admin());

create policy lesson_progress_own on public.lesson_progress for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy lesson_progress_admin_read on public.lesson_progress for select using (public.is_admin());

-- agenda de lives
create policy live_select on public.live_events for select using (
  public.is_admin()
  or audience = 'public'
  or (audience = 'membro'    and public.my_plan_rank() >= 1)
  or (audience = 'intensivo' and public.my_plan_rank() >= 2)
);
create policy live_admin on public.live_events for all using (public.is_admin()) with check (public.is_admin());

-- configurações (links de WhatsApp): só admin pela API
create policy settings_admin on public.app_settings for all using (public.is_admin()) with check (public.is_admin());

-- ============================================================
-- DADOS INICIAIS
-- ============================================================
-- Depois de criar sua conta pelo site, torne-se admin rodando (troque o e-mail):
--   insert into public.admins (user_id)
--   select id from auth.users where email = 'SEU_EMAIL_AQUI';
