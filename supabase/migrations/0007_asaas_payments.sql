-- Fase 4: pagamento pelo Asaas (Pix e cartão), no lugar do Stripe previsto em 0001.

-- Assinaturas: colunas neutras de provedor e origem 'asaas'.
alter table public.subscriptions rename column stripe_customer_id to provider_customer_id;
alter table public.subscriptions rename column stripe_subscription_id to provider_subscription_id;
alter table public.subscriptions drop constraint if exists subscriptions_source_check;
alter table public.subscriptions
  add constraint subscriptions_source_check check (source in ('asaas', 'manual'));
alter table public.subscriptions alter column source set default 'asaas';
alter table public.subscriptions
  add column billing_type text check (billing_type in ('PIX', 'CREDIT_CARD'));
alter table public.subscriptions drop column if exists stripe_price_id;
alter table public.plans drop column if exists stripe_price_id;

-- Eventos de webhook já processados (idempotência), para qualquer provedor.
alter table public.stripe_events rename to payment_events;
alter table public.payment_events add column provider text not null default 'asaas';

-- Cliente do aluno no Asaas. O CPF fica só no Asaas.
create table public.payment_customers (
  user_id uuid primary key references auth.users(id) on delete cascade,
  provider text not null default 'asaas',
  provider_customer_id text not null unique,
  created_at timestamptz not null default now()
);
alter table public.payment_customers enable row level security;
-- Sem policy: só a service role lê e escreve.

-- Quem cancelou mantém o acesso até o fim do período pago, sem a tolerância de 3 dias.
create or replace function public.my_plan_rank()
returns int language sql stable security definer set search_path = public as $$
  select coalesce(max(p.rank), 0)
  from public.subscriptions s
  join public.plans p on p.id = s.plan_id
  where s.user_id = (select auth.uid())
    and s.status in ('active', 'trialing', 'past_due')
    and (
      s.current_period_end is null
      or s.current_period_end > now()
        - case when s.cancel_at_period_end then interval '0' else interval '3 days' end
    );
$$;

-- Vagas: assinatura de admin (concessão para a equipe) não ocupa vaga da turma.
create or replace function public.intensivo_seats_left()
returns int language sql stable security definer set search_path = public as $$
  select greatest(
    0,
    coalesce((select seat_limit from public.plans where id = 'intensivo'), 0)
    - (select count(*) from public.subscriptions s
        where s.plan_id = 'intensivo' and s.status in ('active', 'trialing', 'past_due')
          and not exists (select 1 from public.admins a where a.user_id = s.user_id))
    - (select count(*) from public.seat_reservations where expires_at > now())
  )::int;
$$;

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

  select (select count(*) from public.subscriptions s
           where s.plan_id = 'intensivo' and s.status in ('active', 'trialing', 'past_due')
             and not exists (select 1 from public.admins a where a.user_id = s.user_id))
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

-- Lista de espera: guarda também o usuário, quando logado.
alter table public.waitlist add column user_id uuid references auth.users(id) on delete set null;
create index waitlist_user_idx on public.waitlist (user_id);
