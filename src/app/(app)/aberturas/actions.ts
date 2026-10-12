"use server";

import { z } from "zod";
import { checkPlan } from "@/lib/data/access";
import { createClient } from "@/lib/supabase/server";

const schema = z.object({
  repertoireId: z.uuid(),
  leafId: z.uuid(),
  mistakes: z.number().int().min(0).max(100),
});

// Registra o resultado de uma linha treinada (RLS: só o próprio aluno).
export async function recordLineResult(input: {
  repertoireId: string;
  leafId: string;
  mistakes: number;
}): Promise<{ ok: boolean }> {
  const parsed = schema.safeParse(input);
  if (!parsed.success) return { ok: false };
  const access = await checkPlan(1);
  if (!access.ok) return { ok: false };

  const supabase = await createClient();
  const { repertoireId, leafId, mistakes } = parsed.data;

  // A folha precisa ser deste repertório (e visível para o aluno, pelo RLS).
  const { data: leaf } = await supabase
    .from("repertoire_nodes")
    .select("id")
    .eq("id", leafId)
    .eq("repertoire_id", repertoireId)
    .maybeSingle();
  if (!leaf) return { ok: false };

  const { data: current } = await supabase
    .from("repertoire_progress")
    .select("correct_count, mistake_count")
    .eq("leaf_id", leafId)
    .maybeSingle();

  const { error } = await supabase.from("repertoire_progress").upsert({
    user_id: access.userId,
    repertoire_id: repertoireId,
    leaf_id: leafId,
    correct_count: (current?.correct_count ?? 0) + (mistakes === 0 ? 1 : 0),
    mistake_count: (current?.mistake_count ?? 0) + (mistakes > 0 ? 1 : 0),
    last_trained_at: new Date().toISOString(),
  });
  if (!error) await supabase.rpc("mark_activity");
  return { ok: !error };
}
