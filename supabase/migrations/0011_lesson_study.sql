-- Progresso nas lições de aberturas e de finais (o conteúdo fica em arquivos do
-- site; aqui só números compactos por aluno e lição). Migração aditiva.
create table public.lesson_study (
  user_id uuid not null references auth.users(id) on delete cascade,
  lesson_slug text not null check (lesson_slug ~ '^[a-z0-9-]{2,60}$'),
  practice_solved smallint not null default 0 check (practice_solved >= 0),
  practice_total smallint not null default 0 check (practice_total >= 0),
  quiz_score smallint check (quiz_score >= 0),
  quiz_total smallint check (quiz_total >= 0),
  completed_at timestamptz,
  updated_at timestamptz not null default now(),
  primary key (user_id, lesson_slug)
);
alter table public.lesson_study enable row level security;

-- Cada aluno lê e grava só o próprio progresso (gravar exige assinatura ativa).
create policy lesson_study_select on public.lesson_study for select
  using (user_id = (select auth.uid()) or (select public.is_admin()));
create policy lesson_study_insert on public.lesson_study for insert
  with check (user_id = (select auth.uid()) and (select public.my_plan_rank()) >= 1);
create policy lesson_study_update on public.lesson_study for update
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()) and (select public.my_plan_rank()) >= 1);
