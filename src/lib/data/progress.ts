import "server-only";
import { addDays } from "@/lib/dates";
import { todayInSaoPaulo } from "@/lib/format";
import { recentDays, streakStats, type StreakStats } from "@/lib/streak";
import {
  stepHref,
  stepKey,
  trailProgress,
  type StepKind,
  type TrailProgress,
  type TrailStep,
} from "@/lib/trails";
import { createClient } from "@/lib/supabase/server";
import { listCourses } from "./courses";

// Dados do painel do aluno. Tudo passa pelo RLS (cada um lê só o que é seu).

export type Streak = StreakStats & {
  week: { day: string; trained: boolean }[];
};

export async function getStreak(): Promise<Streak> {
  const supabase = await createClient();
  const today = todayInSaoPaulo();
  const { data } = await supabase
    .from("user_activity")
    .select("day")
    .gte("day", addDays(today, -400));
  const days = (data ?? []).map((row) => row.day as string);
  return { ...streakStats(days, today), week: recentDays(days, today, 7) };
}

// Erros da revisão espaçada que já venceram.
export async function getReviewDueCount(): Promise<number> {
  const supabase = await createClient();
  const { count } = await supabase
    .from("review_state")
    .select("puzzle_id", { count: "exact", head: true })
    .lte("due_at", new Date().toISOString());
  return count ?? 0;
}

export type NextLesson = {
  courseId: string;
  courseTitle: string;
  lessonId: string;
  lessonTitle: string;
  done: number;
  total: number;
};

// Próxima aula: a primeira não concluída do primeiro curso já começado
// (ou do primeiro curso, se nenhum foi começado).
export async function getNextLesson(): Promise<NextLesson | null> {
  const courses = await listCourses();
  const withLessons = courses
    .map((course) => {
      const lessons = course.modules.flatMap((module) => module.lessons);
      return {
        course,
        lessons,
        done: lessons.filter((l) => l.completed).length,
      };
    })
    .filter((item) => item.lessons.some((lesson) => !lesson.completed));
  const pick =
    withLessons.find((item) => item.done > 0) ?? withLessons[0] ?? null;
  if (!pick) return null;
  const lesson = pick.lessons.find((item) => !item.completed)!;
  return {
    courseId: pick.course.id,
    courseTitle: pick.course.title,
    lessonId: lesson.id,
    lessonTitle: lesson.title,
    done: pick.done,
    total: pick.lessons.length,
  };
}

export type TrailView = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  steps: (TrailStep & { href: string; done: boolean })[];
  progress: TrailProgress;
  nextHref: string | null;
};

type TrailRow = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  trail_steps: {
    id: string;
    kind: StepKind;
    ref_id: string;
    title: string;
    position: number;
  }[];
};

export async function listTrails(): Promise<TrailView[]> {
  const supabase = await createClient();
  const { data: rows } = await supabase
    .from("trails")
    .select(
      "id, slug, title, description, trail_steps (id, kind, ref_id, title, position)",
    )
    .order("position");
  const trails = (rows ?? []) as TrailRow[];
  if (trails.length === 0) return [];

  const steps = trails.flatMap((trail) => trail.trail_steps);
  const ids = (kind: StepKind) =>
    steps.filter((step) => step.kind === kind).map((step) => step.ref_id);

  // O que o aluno já concluiu e os endereços de cada etapa.
  const [
    lessons,
    repertoires,
    endgames,
    lessonDone,
    repDone,
    endDone,
    setDone,
  ] = await Promise.all([
    supabase
      .from("lessons")
      .select("id, modules (course_id)")
      .in("id", ids("lesson")),
    supabase.from("repertoires").select("id, slug").in("id", ids("repertoire")),
    supabase.from("endgames").select("id, slug").in("id", ids("endgame")),
    supabase
      .from("lesson_progress")
      .select("lesson_id")
      .in("lesson_id", ids("lesson")),
    supabase
      .from("repertoire_progress")
      .select("repertoire_id")
      .in("repertoire_id", ids("repertoire")),
    supabase
      .from("endgame_attempts")
      .select("endgame_id")
      .eq("success", true)
      .in("endgame_id", ids("endgame")),
    supabase
      .from("cycles")
      .select("set_id")
      .not("finished_at", "is", null)
      .in("set_id", ids("set")),
  ]);

  const done = new Set<string>([
    ...(lessonDone.data ?? []).map((row) => stepKey("lesson", row.lesson_id)),
    ...(repDone.data ?? []).map((row) =>
      stepKey("repertoire", row.repertoire_id),
    ),
    ...(endDone.data ?? []).map((row) => stepKey("endgame", row.endgame_id)),
    ...(setDone.data ?? []).map((row) => stepKey("set", row.set_id)),
  ]);
  const courseOf = new Map(
    (lessons.data ?? []).map((row) => [
      row.id,
      (row.modules as unknown as { course_id: string } | null)?.course_id,
    ]),
  );
  const slugOf = new Map(
    [...(repertoires.data ?? []), ...(endgames.data ?? [])].map((row) => [
      row.id,
      row.slug,
    ]),
  );

  return trails.map((trail) => {
    const trailSteps = trail.trail_steps
      .map((row) => ({
        id: row.id,
        kind: row.kind,
        refId: row.ref_id,
        title: row.title,
        position: row.position,
      }))
      .sort((a, b) => a.position - b.position);
    const progress = trailProgress(trailSteps, done);
    const hrefOf = (step: TrailStep) =>
      stepHref(step, {
        courseId: courseOf.get(step.refId),
        slug: slugOf.get(step.refId),
      });
    return {
      id: trail.id,
      slug: trail.slug,
      title: trail.title,
      description: trail.description,
      steps: trailSteps.map((step) => ({
        ...step,
        href: hrefOf(step),
        done: done.has(stepKey(step.kind, step.refId)),
      })),
      progress,
      nextHref: progress.next ? hrefOf(progress.next) : null,
    };
  });
}
