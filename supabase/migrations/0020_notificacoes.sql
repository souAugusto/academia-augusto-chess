-- Notificações do admin para os alunos.
-- - notifications: o aviso (título, mensagem, tipo, link, público, validade).
-- - notification_reads: quem já leu o quê.
-- Público: todos, só Membro (plano 1, inclui o teste grátis), só Intensivo
-- (plano 2) ou um aluno específico. Validade opcional (expires_at).
-- RLS: o aluno lê só o que é para ele e marca como lidas só as próprias;
-- só admin cria, edita e exclui. Texto puro (a tela não interpreta HTML).

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 1 and 120),
  body text not null check (char_length(body) between 1 and 1000),
  kind text not null default 'info' check (kind in ('info', 'aviso', 'novidade')),
  link text check (
    link is null
    or (char_length(link) <= 300 and (link ~ '^/[A-Za-z0-9]' or link ~ '^https://'))
  ),
  audience text not null default 'todos'
    check (audience in ('todos', 'membro', 'intensivo', 'usuario')),
  target_user uuid references auth.users(id) on delete cascade,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  expires_at timestamptz,
  check ((audience = 'usuario') = (target_user is not null))
);
create index notifications_created_idx on public.notifications (created_at desc);
create index notifications_target_idx on public.notifications (target_user)
  where target_user is not null;
create index notifications_created_by_idx on public.notifications (created_by);
alter table public.notifications enable row level security;

-- Quem pode ver uma notificação (usado também pela tabela de leituras).
create or replace function public.can_see_notification(n public.notifications)
returns boolean
language sql stable security invoker set search_path = public as $$
  select (n.expires_at is null or n.expires_at > now())
    and (
      n.audience = 'todos'
      or (n.audience = 'usuario' and n.target_user = (select auth.uid()))
      or (n.audience = 'membro' and (select public.my_plan_rank()) = 1)
      or (n.audience = 'intensivo' and (select public.my_plan_rank()) >= 2)
    );
$$;

create policy notifications_select on public.notifications for select
  using ((select public.is_admin()) or public.can_see_notification(notifications));
create policy notifications_admin_insert on public.notifications for insert
  with check ((select public.is_admin()));
create policy notifications_admin_update on public.notifications for update
  using ((select public.is_admin())) with check ((select public.is_admin()));
create policy notifications_admin_delete on public.notifications for delete
  using ((select public.is_admin()));

create table public.notification_reads (
  notification_id uuid not null references public.notifications(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  read_at timestamptz not null default now(),
  primary key (notification_id, user_id)
);
create index notification_reads_user_idx on public.notification_reads (user_id);
alter table public.notification_reads enable row level security;

-- O aluno vê e grava só as próprias leituras, e só de notificações que ele
-- pode ver; o admin lê todas (para contar quantos leram).
create policy notification_reads_select on public.notification_reads for select
  using (user_id = (select auth.uid()) or (select public.is_admin()));
create policy notification_reads_insert on public.notification_reads for insert
  with check (
    user_id = (select auth.uid())
    and exists (select 1 from public.notifications n where n.id = notification_id)
  );
