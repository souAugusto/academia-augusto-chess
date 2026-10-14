"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { findLesson } from "@/content/licoes";
import { checkPlan } from "@/lib/data/access";
import { isLessonComplete } from "@/lib/lessons/practice";
import { createClient } from "@/lib/supabase/server";

const schema = z.object({
  slug: z.string().regex(/^[a-z0-9-]{2,60}$/),
  practiceSolved: z.number().int().min(0).max(200).optional(),
  quizScore: z.number().int().min(0).max(20).optional(),
});

// Guarda o progresso da lição. Os totais vêm do conteúdo (não do navegador) e
// o melhor resultado nunca diminui.
export async function saveLessonProgress(input: {
  slug: string;
  practiceSolved?: number;
  quizScore?: number;
}): Promise<{ ok: boolean; completed: boolean }> {
  const parsed = schema.safeParse(input);
  if (!parsed.success) return { ok: false, completed: false };
  const lesson = findLesson(parsed.data.slug);
  if (!lesson) return { ok: false, completed: false };
  const access = await checkPlan(1);
  if (!access.ok) return { ok: false, completed: false };

  const practiceTotal = lesson.practice.length;
  const quizTotal = lesson.quiz.length;
  const supabase = await createClient();
  const { data: current } = await supabase
    .from("lesson_study")
    .select("practice_solved, quiz_score, completed_at")
    .eq("lesson_slug", lesson.slug)
    .maybeSingle();

  const practiceSolved = Math.min(
    practiceTotal,
    Math.max(current?.practice_solved ?? 0, parsed.data.practiceSolved ?? 0),
  );
  const quizScore =
    parsed.data.quizScore === undefined
      ? (current?.quiz_score ?? null)
      : Math.min(
          quizTotal,
          Math.max(current?.quiz_score ?? 0, parsed.data.quizScore),
        );
  const completed = isLessonComplete({
    practiceSolved,
    practiceTotal,
    quizScore,
    quizTotal,
  });

  const { error } = await supabase.from("lesson_study").upsert({
    user_id: access.userId,
    lesson_slug: lesson.slug,
    practice_solved: practiceSolved,
    practice_total: practiceTotal,
    quiz_score: quizScore,
    quiz_total: quizScore === null ? null : quizTotal,
    completed_at:
      current?.completed_at ?? (completed ? new Date().toISOString() : null),
    updated_at: new Date().toISOString(),
  });
  if (error) return { ok: false, completed: false };
  await supabase.rpc("mark_activity");
  revalidatePath("/licoes", "layout");
  return { ok: true, completed: Boolean(current?.completed_at) || completed };
}
