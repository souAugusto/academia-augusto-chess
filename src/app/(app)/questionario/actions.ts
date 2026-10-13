"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import {
  isComplete,
  scoreAnswers,
  type StyleOutcome,
} from "@/lib/style/scoring";
import { createClient } from "@/lib/supabase/server";

const answersSchema = z.record(z.string().max(40), z.string().max(5));

// Salva o questionário. A pontuação é refeita aqui, a partir das respostas:
// o navegador não decide o estilo.
export async function saveStyleResult(
  answers: Record<string, string>,
): Promise<{ ok: true; outcome: StyleOutcome } | { ok: false; error: string }> {
  const parsed = answersSchema.safeParse(answers);
  if (!parsed.success || !isComplete(parsed.data))
    return { ok: false, error: "Responda todas as perguntas." };

  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getClaims();
  const userId = auth?.claims.sub;
  if (!userId)
    return { ok: false, error: "Sua sessão expirou. Entre de novo." };

  const outcome = scoreAnswers(parsed.data);
  const { error } = await supabase.from("style_results").insert({
    user_id: userId,
    answers: parsed.data,
    scores: outcome.scores,
    style: outcome.style,
  });
  if (error) return { ok: false, error: "Não foi possível salvar agora." };
  await supabase.from("player_styles").upsert({
    user_id: userId,
    style: outcome.style,
    updated_at: new Date().toISOString(),
  });
  revalidatePath("/conta");
  revalidatePath("/painel");
  return { ok: true, outcome };
}
