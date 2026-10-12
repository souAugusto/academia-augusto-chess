"use server";

import { z } from "zod";
import { checkPlan } from "@/lib/data/access";
import { createClient } from "@/lib/supabase/server";

const schema = z.object({
  endgameId: z.uuid(),
  success: z.boolean(),
  moves: z.number().int().min(0).max(300),
});

// Registra uma tentativa de final. É só progresso pessoal (não entra em ranking),
// por isso aceita o resultado informado pelo navegador.
export async function recordEndgameAttempt(input: {
  endgameId: string;
  success: boolean;
  moves: number;
}): Promise<{ ok: boolean }> {
  const parsed = schema.safeParse(input);
  if (!parsed.success) return { ok: false };
  const access = await checkPlan(1);
  if (!access.ok) return { ok: false };

  const supabase = await createClient();
  const { error } = await supabase.from("endgame_attempts").insert({
    user_id: access.userId,
    endgame_id: parsed.data.endgameId,
    success: parsed.data.success,
    moves: parsed.data.moves,
  });
  if (!error) await supabase.rpc("mark_activity");
  return { ok: !error };
}
