"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { decodeAnalysis } from "@/lib/analysis/compact";
import {
  ANALYSIS_DEPTHS,
  ANALYSIS_MIN_PLAN_RANK,
  MAX_SAVED_ANALYSES,
} from "@/lib/analysis/config";
import { gameFromUcis, parsePgn, sansToUcis } from "@/lib/analysis/pgn";
import { gameAccuracy, reviewMoves } from "@/lib/analysis/review";
import { parseLichessAnalysis } from "@/lib/analysis/sources";
import type { EngineScore } from "@/lib/analysis/winprob";
import { checkPlan } from "@/lib/data/access";
import {
  fetchChessComGameForAnalysis,
  fetchLichessGameForAnalysis,
  GamesFetchError,
} from "@/lib/games/fetch";
import { createClient } from "@/lib/supabase/server";

export type LoadedGame = {
  ucis: string[];
  headers: Record<string, string>;
  title: string;
  lichessEvals: (EngineScore | null)[] | null;
};

const FETCH_ERRORS: Record<string, string> = {
  not_found: "Não encontrei essa partida no site de origem.",
  no_games: "A partida não tem lances.",
  unavailable: "O site de origem não respondeu. Tente de novo em instantes.",
  rate_limited: "O site de origem pediu uma pausa. Tente de novo em um minuto.",
};

// Busca os lances de uma partida importada (e a análise do Lichess, se houver).
export async function loadImportedGame(
  gameId: number,
): Promise<{ ok: true; game: LoadedGame } | { ok: false; message: string }> {
  if (!Number.isSafeInteger(gameId) || gameId <= 0)
    return { ok: false, message: "Partida inválida." };
  const access = await checkPlan(ANALYSIS_MIN_PLAN_RANK);
  if (!access.ok)
    return { ok: false, message: "A análise faz parte da assinatura." };

  const supabase = await createClient();
  const { data: row } = await supabase
    .from("imported_games")
    .select("platform, external_id, played_at, color, opening_name")
    .eq("id", gameId)
    .maybeSingle();
  if (!row) return { ok: false, message: "Partida não encontrada." };

  try {
    let ucis: string[] | null = null;
    let headers: Record<string, string> = {};
    let lichessEvals: (EngineScore | null)[] | null = null;
    if (row.platform === "lichess") {
      const game = await fetchLichessGameForAnalysis(row.external_id);
      ucis = game.sans ? sansToUcis(game.sans) : null;
      if (ucis)
        lichessEvals = parseLichessAnalysis(game.lichessAnalysis, ucis.length);
    } else {
      const { data: account } = await supabase
        .from("linked_accounts")
        .select("username")
        .eq("platform", "chesscom")
        .maybeSingle();
      if (!account)
        return { ok: false, message: "Conta do Chess.com não encontrada." };
      const game = await fetchChessComGameForAnalysis(
        account.username,
        new Date(row.played_at),
        row.external_id,
      );
      const parsed = game.pgn ? parsePgn(game.pgn) : null;
      if (parsed?.ok) {
        ucis = parsed.game.ucis;
        headers = parsed.game.headers;
      }
    }
    if (!ucis || !gameFromUcis(ucis))
      return {
        ok: false,
        message: "Não consegui ler os lances dessa partida.",
      };
    const title =
      headers.White && headers.Black
        ? `${headers.White} x ${headers.Black}`
        : (row.opening_name ?? "Partida importada");
    return {
      ok: true,
      game: { ucis, headers, title: title.slice(0, 120), lichessEvals },
    };
  } catch (error) {
    const kind = error instanceof GamesFetchError ? error.kind : "unavailable";
    return {
      ok: false,
      message: FETCH_ERRORS[kind] ?? FETCH_ERRORS.unavailable,
    };
  }
}

const saveSchema = z.object({
  importedGameId: z.number().int().positive().nullable(),
  title: z.string().trim().min(1).max(120),
  headers: z.record(z.string().max(40), z.string().max(200)).default({}),
  data: z.unknown(),
});

// Salva (ou substitui, se for de partida importada) uma análise. A precisão é
// recalculada aqui a partir das avaliações; o navegador não manda números finais.
export async function saveAnalysis(
  input: z.input<typeof saveSchema>,
): Promise<{ ok: true; id: string } | { ok: false; message: string }> {
  const parsed = saveSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: "Dados inválidos." };
  const access = await checkPlan(ANALYSIS_MIN_PLAN_RANK);
  if (!access.ok)
    return { ok: false, message: "A análise faz parte da assinatura." };

  const analysis = decodeAnalysis(parsed.data.data);
  if (
    !analysis ||
    !(ANALYSIS_DEPTHS as readonly number[]).includes(analysis.depth) ||
    analysis.moves.length === 0 ||
    analysis.evals.length !== analysis.moves.length + 1 ||
    analysis.best.length !== analysis.evals.length ||
    !gameFromUcis(analysis.moves)
  )
    return { ok: false, message: "Análise incompleta ou inválida." };

  const reviewed = reviewMoves(analysis.evals, analysis.best, analysis.moves);
  const headers = Object.fromEntries(
    Object.entries(parsed.data.headers).slice(0, 12),
  );
  const supabase = await createClient();

  if (parsed.data.importedGameId === null) {
    const { count } = await supabase
      .from("game_analyses")
      .select("id", { count: "exact", head: true });
    if ((count ?? 0) >= MAX_SAVED_ANALYSES)
      return {
        ok: false,
        message: `Você já tem ${MAX_SAVED_ANALYSES} análises salvas. Apague alguma para salvar outra.`,
      };
  }

  const row = {
    user_id: access.userId,
    imported_game_id: parsed.data.importedGameId,
    title: parsed.data.title,
    headers,
    data: parsed.data.data as object,
    depth: analysis.depth,
    accuracy_white: gameAccuracy(reviewed, "w"),
    accuracy_black: gameAccuracy(reviewed, "b"),
    updated_at: new Date().toISOString(),
  };
  const query =
    parsed.data.importedGameId === null
      ? supabase.from("game_analyses").insert(row)
      : supabase
          .from("game_analyses")
          .upsert(row, { onConflict: "user_id,imported_game_id" });
  const { data, error } = await query.select("id").single();
  if (error || !data)
    return { ok: false, message: "Não consegui salvar a análise." };
  revalidatePath("/analise");
  return { ok: true, id: data.id };
}

export async function deleteAnalysis(id: string): Promise<{ ok: boolean }> {
  if (!z.string().uuid().safeParse(id).success) return { ok: false };
  const access = await checkPlan(ANALYSIS_MIN_PLAN_RANK);
  if (!access.ok) return { ok: false };
  const supabase = await createClient();
  const { error } = await supabase.from("game_analyses").delete().eq("id", id);
  revalidatePath("/analise");
  return { ok: !error };
}
