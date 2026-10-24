"use server";

import { z } from "zod";
import { BOTS } from "@/content/personagens";
import { MAX_GAMES } from "@/lib/bot/progress";
import { createClient } from "@/lib/supabase/server";

const BOT_IDS = BOTS.map((bot) => bot.id) as [string, ...string[]];

const gameSchema = z.object({
  botId: z.enum(BOT_IDS),
  result: z.enum(["vitoria", "derrota", "empate"]),
  stars: z.number().int().min(0).max(3),
});

const count = z.number().int().min(0).max(MAX_GAMES);
const mergeSchema = z
  .record(
    z.enum(BOT_IDS),
    z.object({ vitorias: count, derrotas: count, empates: count, estrelas: z.number().int().min(0).max(3) }),
  )
  .refine((value) => Object.keys(value).length <= BOT_IDS.length);

async function currentUserId() {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getClaims();
  return { supabase, userId: auth?.claims.sub ?? null };
}

// Registra uma partida terminada. É só progresso pessoal (sem ranking), por
// isso aceita o resultado informado pelo navegador.
export async function recordBotGame(input: {
  botId: string;
  result: string;
  stars: number;
}): Promise<{ ok: boolean }> {
  const parsed = gameSchema.safeParse(input);
  if (!parsed.success) return { ok: false };
  const { supabase, userId } = await currentUserId();
  if (!userId) return { ok: false };
  const { error } = await supabase.rpc("record_bot_game", {
    p_bot: parsed.data.botId,
    p_result: parsed.data.result,
    p_stars: parsed.data.stars,
  });
  if (!error) await supabase.rpc("mark_activity");
  return { ok: !error };
}

// Junta o progresso de quem jogou sem conta com o da conta, depois do login.
export async function mergeBotProgress(input: unknown): Promise<{ ok: boolean }> {
  const parsed = mergeSchema.safeParse(input);
  if (!parsed.success) return { ok: false };
  const { supabase, userId } = await currentUserId();
  if (!userId) return { ok: false };
  const results = await Promise.all(
    Object.entries(parsed.data).map(([botId, r]) =>
      supabase.rpc("merge_bot_progress", {
        p_bot: botId,
        p_vitorias: r.vitorias,
        p_derrotas: r.derrotas,
        p_empates: r.empates,
        p_estrelas: r.estrelas,
      }),
    ),
  );
  return { ok: results.every((r) => !r.error) };
}
