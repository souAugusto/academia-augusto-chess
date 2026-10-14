-- 0016: teste grátis de 30 dias do plano Membro (sem cartão, uma vez por conta).
-- O teste é uma linha em `subscriptions` (source 'trial', status 'trialing',
-- cancel_at_period_end = true, current_period_end = fim do teste). Assim a
-- função my_plan_rank(), que já decide o acesso no RLS e no servidor, vale para
-- o teste sem mudança e o expira sozinha pela data (sem job).
-- Só acrescenta: nada existente é apagado.

alter table public.subscriptions drop constraint if exists subscriptions_source_check;
alter table public.subscriptions
  add constraint subscriptions_source_check check (source in ('asaas', 'manual', 'trial'));

-- No máximo um teste por conta (também protege contra clique duplo).
create unique index subscriptions_one_trial_per_user
  on public.subscriptions (user_id) where source = 'trial';

-- Registro dos testes por e-mail normalizado (minúsculas, sem "+etiqueta" e,
-- no Gmail, sem pontos). Fica guardado mesmo se a conta for excluída, para a
-- mesma pessoa não repetir o teste com uma conta nova. Só o servidor usa.
create table public.trial_claims (
  id bigint generated always as identity primary key,
  user_id uuid not null unique,
  email_normalized text not null unique,
  started_at timestamptz not null default now(),
  ends_at timestamptz not null,
  converted_at timestamptz -- assinou um plano pago durante ou depois do teste
);
alter table public.trial_claims enable row level security;
-- Sem policies: só a service role lê e grava.

-- Nível do plano PAGO (ignora o teste). Usado no checkout: quem está no teste
-- pode assinar o Membro; quem já paga o Membro não.
create or replace function public.my_paid_plan_rank()
returns int language sql stable security definer set search_path = public as $$
  select coalesce(max(p.rank), 0)
  from public.subscriptions s
  join public.plans p on p.id = s.plan_id
  where s.user_id = (select auth.uid())
    and s.source <> 'trial'
    and s.status in ('active', 'trialing', 'past_due')
    and (
      s.current_period_end is null
      or s.current_period_end > now()
        - case when s.cancel_at_period_end then interval '0' else interval '3 days' end
    );
$$;
revoke execute on function public.my_paid_plan_rank() from public, anon;
grant execute on function public.my_paid_plan_rank() to authenticated;
