-- Academia Augusto Chess: desempenho do RLS e ajustes apontados pelo Supabase Advisor.
-- Não muda nenhuma regra de acesso: as condições de cada policy são as mesmas da 0001.
--
-- 1. auth.uid(), is_admin() e my_plan_rank() passam a ser chamados dentro de (select ...).
--    Assim o Postgres calcula o valor uma vez por consulta, e não uma vez por linha
--    (importante com dezenas de milhares de puzzles). Lint: auth_rls_initplan.
-- 2. handle_new_user() é função de gatilho: não precisa ser chamável pela API.
-- 3. Índices nas chaves estrangeiras (consultas por aula/conjunto/puzzle e exclusões em cascata).

-- ============================================================
-- 1. POLICIES
-- ============================================================

-- planos
alter policy plans_admin on public.plans
  using ((select public.is_admin())) with check ((select public.is_admin()));

-- perfil
alter policy profiles_select on public.profiles
  using (id = (select auth.uid()) or (select public.is_admin()));
alter policy profiles_update on public.profiles
  using (id = (select auth.uid())) with check (id = (select auth.uid()));

-- assinaturas
alter policy subs_select on public.subscriptions
  using (user_id = (select auth.uid()) or (select public.is_admin()));

-- puzzles
alter policy puzzles_select on public.puzzles using (
  (select public.is_admin())
  or (source in ('lichess', 'official') and (select public.my_plan_rank()) >= 1)
  or created_by = (select auth.uid())
  or exists (
    select 1 from public.daily_puzzles d
    where d.puzzle_id = puzzles.id
      and d.day <= (now() at time zone 'America/Sao_Paulo')::date
  )
);
alter policy puzzles_insert_custom on public.puzzles
  with check (source = 'custom' and created_by = (select auth.uid()) and (select public.my_plan_rank()) >= 2);
alter policy puzzles_delete_custom on public.puzzles
  using (source = 'custom' and created_by = (select auth.uid()));
alter policy puzzles_admin on public.puzzles
  using ((select public.is_admin())) with check ((select public.is_admin()));

-- puzzle do dia
alter policy daily_admin on public.daily_puzzles
  using ((select public.is_admin())) with check ((select public.is_admin()));

-- conjuntos de táticas
alter policy sets_select on public.puzzle_sets using (
  (select public.is_admin()) or owner_id = (select auth.uid()) or (is_official and (select public.my_plan_rank()) >= 2)
);
alter policy sets_insert on public.puzzle_sets
  with check (owner_id = (select auth.uid()) and not is_official and (select public.my_plan_rank()) >= 2);
alter policy sets_update on public.puzzle_sets
  using (owner_id = (select auth.uid()) and not is_official)
  with check (owner_id = (select auth.uid()) and not is_official);
alter policy sets_delete on public.puzzle_sets
  using (owner_id = (select auth.uid()) and not is_official);
alter policy sets_admin on public.puzzle_sets
  using ((select public.is_admin())) with check ((select public.is_admin()));

alter policy items_select on public.puzzle_set_items using (
  (select public.is_admin()) or exists (
    select 1 from public.puzzle_sets s
    where s.id = set_id and (s.owner_id = (select auth.uid()) or (s.is_official and (select public.my_plan_rank()) >= 2))
  )
);
alter policy items_write_own on public.puzzle_set_items
  using (exists (select 1 from public.puzzle_sets s where s.id = set_id and s.owner_id = (select auth.uid()) and not s.is_official))
  with check (exists (select 1 from public.puzzle_sets s where s.id = set_id and s.owner_id = (select auth.uid()) and not s.is_official));
alter policy items_admin on public.puzzle_set_items
  using ((select public.is_admin())) with check ((select public.is_admin()));

-- progresso do método (só Intensivo)
alter policy enroll_own on public.set_enrollments
  using (user_id = (select auth.uid()) and (select public.my_plan_rank()) >= 2)
  with check (user_id = (select auth.uid()) and (select public.my_plan_rank()) >= 2);
alter policy enroll_admin_read on public.set_enrollments using ((select public.is_admin()));

alter policy cycles_own on public.cycles
  using (user_id = (select auth.uid()) and (select public.my_plan_rank()) >= 2)
  with check (user_id = (select auth.uid()) and (select public.my_plan_rank()) >= 2);
alter policy cycles_admin_read on public.cycles using ((select public.is_admin()));

-- tentativas e revisão: Membro e Intensivo
alter policy attempts_own on public.attempts
  using (user_id = (select auth.uid()) and (select public.my_plan_rank()) >= 1)
  with check (user_id = (select auth.uid()) and (select public.my_plan_rank()) >= 1);
alter policy attempts_admin_read on public.attempts using ((select public.is_admin()));

alter policy review_own on public.review_state
  using (user_id = (select auth.uid()) and (select public.my_plan_rank()) >= 1)
  with check (user_id = (select auth.uid()) and (select public.my_plan_rank()) >= 1);
alter policy review_admin_read on public.review_state using ((select public.is_admin()));

-- aulas
alter policy courses_select on public.courses
  using ((select public.is_admin()) or (is_published and (select public.my_plan_rank()) >= plan_required));
alter policy courses_admin on public.courses
  using ((select public.is_admin())) with check ((select public.is_admin()));

alter policy modules_select on public.modules
  using ((select public.is_admin()) or exists (select 1 from public.courses c where c.id = course_id));
alter policy modules_admin on public.modules
  using ((select public.is_admin())) with check ((select public.is_admin()));

alter policy lessons_select on public.lessons using (
  (select public.is_admin()) or (is_published and exists (
    select 1 from public.modules m where m.id = module_id
  ))
);
alter policy lessons_admin on public.lessons
  using ((select public.is_admin())) with check ((select public.is_admin()));

alter policy lesson_files_select on public.lesson_files
  using ((select public.is_admin()) or exists (select 1 from public.lessons l where l.id = lesson_id));
alter policy lesson_files_admin on public.lesson_files
  using ((select public.is_admin())) with check ((select public.is_admin()));

alter policy lesson_progress_own on public.lesson_progress
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
alter policy lesson_progress_admin_read on public.lesson_progress using ((select public.is_admin()));

-- agenda de lives
alter policy live_select on public.live_events using (
  (select public.is_admin())
  or audience = 'public'
  or (audience = 'membro'    and (select public.my_plan_rank()) >= 1)
  or (audience = 'intensivo' and (select public.my_plan_rank()) >= 2)
);
alter policy live_admin on public.live_events
  using ((select public.is_admin())) with check ((select public.is_admin()));

-- configurações
alter policy settings_admin on public.app_settings
  using ((select public.is_admin())) with check ((select public.is_admin()));

-- ============================================================
-- 2. FUNÇÃO DE GATILHO FORA DA API
-- ============================================================
revoke execute on function public.handle_new_user() from public, anon, authenticated;

-- ============================================================
-- 3. ÍNDICES NAS CHAVES ESTRANGEIRAS
-- ============================================================
create index if not exists attempts_cycle_idx            on public.attempts (cycle_id);
create index if not exists attempts_puzzle_idx           on public.attempts (puzzle_id);
create index if not exists cycles_set_idx                on public.cycles (set_id);
create index if not exists daily_puzzles_puzzle_idx      on public.daily_puzzles (puzzle_id);
create index if not exists lesson_files_lesson_idx       on public.lesson_files (lesson_id);
create index if not exists lesson_progress_lesson_idx    on public.lesson_progress (lesson_id);
create index if not exists lessons_module_idx            on public.lessons (module_id);
create index if not exists modules_course_idx            on public.modules (course_id);
create index if not exists puzzle_set_items_puzzle_idx   on public.puzzle_set_items (puzzle_id);
create index if not exists puzzle_sets_owner_idx         on public.puzzle_sets (owner_id);
create index if not exists puzzles_created_by_idx        on public.puzzles (created_by);
create index if not exists review_state_puzzle_idx       on public.review_state (puzzle_id);
create index if not exists set_enrollments_set_idx       on public.set_enrollments (set_id);
create index if not exists subscriptions_plan_idx        on public.subscriptions (plan_id);
create index if not exists waitlist_plan_idx             on public.waitlist (plan_id);
