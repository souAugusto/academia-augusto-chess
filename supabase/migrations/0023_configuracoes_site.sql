-- Interruptores do site (liga/desliga áreas sem deploy).
-- Diferente de app_settings (links privados, só admin), estes valores são
-- públicos: qualquer visitante lê, para montar o menu. Só admin altera.
-- Primeiro interruptor: video_lessons_enabled (aba "Aulas em vídeo").
-- Desligar não apaga nada: cursos, aulas, materiais e progresso continuam no
-- banco; só param de aparecer para quem não é admin.

create table public.site_settings (
  key text primary key check (key ~ '^[a-z0-9_]{1,60}$'),
  enabled boolean not null default true,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id) on delete set null
);
create index site_settings_updated_by_idx on public.site_settings (updated_by);
alter table public.site_settings enable row level security;

create policy site_settings_select on public.site_settings for select using (true);
create policy site_settings_admin_insert on public.site_settings for insert
  with check ((select public.is_admin()));
create policy site_settings_admin_update on public.site_settings for update
  using ((select public.is_admin())) with check ((select public.is_admin()));
create policy site_settings_admin_delete on public.site_settings for delete
  using ((select public.is_admin()));

-- Quando e quem alterou: preenchido pelo banco (o navegador não escolhe).
create or replace function public.site_settings_stamp()
returns trigger
language plpgsql security invoker set search_path = public as $$
begin
  new.updated_at := now();
  new.updated_by := (select auth.uid());
  return new;
end;
$$;
create trigger site_settings_stamp
  before insert or update on public.site_settings
  for each row execute function public.site_settings_stamp();

-- Interruptor ligado? Sem linha, vale o padrão (ligado), para não mudar nada.
create or replace function public.site_setting_enabled(p_key text)
returns boolean
language sql stable security invoker set search_path = public as $$
  select coalesce((select s.enabled from public.site_settings s where s.key = p_key), true);
$$;

insert into public.site_settings (key, enabled)
values ('video_lessons_enabled', true)
on conflict (key) do nothing;

-- Aulas em vídeo: com a aba desligada, só o admin enxerga os cursos. Módulos,
-- aulas e materiais dependem do curso visível, então somem junto (inclusive
-- os links temporários de PDF/PGN, que passam por este RLS).
alter policy courses_select on public.courses
  using (
    (select public.is_admin())
    or (
      is_published
      and (select public.my_plan_rank()) >= plan_required
      and (select public.site_setting_enabled('video_lessons_enabled'))
    )
  );
