"use server";

import { z } from "zod";
import { BOTS } from "@/content/personagens";
import { MAX_LOCAL_GAMES, validateGame } from "@/lib/bot/history";
import { MAX_GAMES } from "@/lib/bot/progress";
import { createClient } from "@/lib/supabase/server";

const BOT_IDS = BOTS.map((bot) => bot.id) as [string, ...string[]];

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

// Registra uma partida terminada: soma no progresso e guarda no histórico.
// É progresso pessoal (sem ranking), por isso aceita o resultado informado
// pelo navegador, depois de conferir os lances e a coerência do resultado.
export async function saveBotGame(input: unknown): Promise<{ ok: boolean }> {
  const game = validateGame(input, BOT_IDS);
  if (!game) return { ok: false };
  const { supabase, userId } = await currentUserId();
  if (!userId) return { ok: false };
  const { error } = await supabase.rpc("save_bot_game", {
    p_id: game.id,
    p_bot: game.botId,
    p_color: game.color,
    p_result: game.result,
    p_reason: game.reason,
    p_stars: game.stars,
    p_accuracy: game.accuracy,
    p_moves: game.moves.join(" "),
    p_marks: game.marks,
    p_clock: game.clock,
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

// Partidas jogadas antes do login vão para o histórico da conta (o progresso
// delas já entra por mergeBotProgress). Repetir não duplica (mesmo id).
export async function mergeBotGames(input: unknown): Promise<{ ok: boolean }> {
  if (!Array.isArray(input) || input.length > MAX_LOCAL_GAMES) return { ok: false };
  const games = input.map((item) => validateGame(item, BOT_IDS));
  if (games.some((game) => game === null)) return { ok: false };
  const { supabase, userId } = await currentUserId();
  if (!userId) return { ok: false };
  if (games.length === 0) return { ok: true };
  const now = Date.now();
  const { error } = await supabase.from("bot_games").upsert(
    games.map((game) => ({
      id: game!.id,
      user_id: userId,
      bot_id: game!.botId,
      player_color: game!.color,
      result: game!.result,
      reason: game!.reason,
      stars: game!.stars,
      accuracy: game!.accuracy,
      moves: game!.moves.join(" "),
      marks: game!.marks,
      clock: game!.clock,
      // Data do aparelho, sem passar de agora.
      played_at: new Date(Math.min(Date.parse(game!.playedAt), now)).toISOString(),
    })),
    { onConflict: "id", ignoreDuplicates: true },
  );
  return { ok: !error };
}
