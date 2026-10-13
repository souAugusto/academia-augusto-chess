import "server-only";
import type { ResultStyle } from "@/lib/style/styles";
import { createClient } from "@/lib/supabase/server";

// Progresso do aluno logado nas lições de aberturas e de finais (RLS: só o seu).

export type StudyProgress = {
  practiceSolved: number;
  practiceTotal: number;
  quizScore: number | null;
  quizTotal: number | null;
  completed: boolean;
};

export async function getStudyProgress(): Promise<Map<string, StudyProgress>> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("lesson_study")
    .select(
      "lesson_slug, practice_solved, practice_total, quiz_score, quiz_total, completed_at",
    );
  return new Map(
    (data ?? []).map((row) => [
      row.lesson_slug,
      {
        practiceSolved: row.practice_solved,
        practiceTotal: row.practice_total,
        quizScore: row.quiz_score,
        quizTotal: row.quiz_total,
        completed: Boolean(row.completed_at),
      },
    ]),
  );
}

// Estilo atual do aluno (para ligar a lição ao teste de estilo).
export async function getMyStyle(userId: string): Promise<ResultStyle | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("player_styles")
    .select("style")
    .eq("user_id", userId)
    .maybeSingle();
  return (data?.style as ResultStyle | undefined) ?? null;
}
