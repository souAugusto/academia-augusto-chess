"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { Chess } from "chess.js";
import { decodeAnalysis, encodeAnalysis } from "@/lib/analysis/compact";
import {
  ANALYSIS_MIN_PLAN_RANK,
  MAX_SAVED_ANALYSES,
} from "@/lib/analysis/config";
import { gameFromUcis, parsePgn, sansToUcis } from "@/lib/analysis/pgn";
import {
  ANALYSIS_PROFILE,
  currentEngineProfile,
  sameEngineProfile,
  type EngineProfile,
} from "@/lib/analysis/profile";
import {
  buildReport,
  loadOpeningBook,
  pgnGameKey,
  reportSummary,
} from "@/lib/analysis/report";
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
};

const UCI = /^[a-h][1-8][a-h][1-8][qrbn]?$/;
const GAME_KEY = /^(chesscom|lichess|pgn):[A-Za-z0-9_-]{1,80}$/;
const MY_MISTAKES_SET = "Meus erros";

const FETCH_ERRORS: Record<string, string> = {
  not_found: "Não encontrei essa partida no site de origem.",
  no_games: "A partida não tem lances.",
  unavailable: "O site de origem não respondeu. Tente de novo em instantes.",
  rate_limited: "O site de origem pediu uma pausa. Tente de novo em um minuto.",
};

// Busca os lances de uma partida importada no site de origem.
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
    if (row.platform === "lichess") {
      const game = await fetchLichessGameForAnalysis(row.external_id);
      ucis = game.sans ? sansToUcis(game.sans) : null;
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
      game: { ucis, headers, title: title.slice(0, 120) },
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

// Guarda (ou substitui) a análise de uma partida, sozinha, quando ela termina.
// Classes, precisão e resumo são recalculados aqui a partir dos dados do motor;
// o navegador não manda números finais. Passou do limite: a mais antiga sai.
export async function saveAnalysis(
  input: z.input<typeof saveSchema>,
): Promise<{ ok: true; id: string } | { ok: false; message: string }> {
  const parsed = saveSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: "Dados inválidos." };
  const access = await checkPlan(ANALYSIS_MIN_PLAN_RANK);
  if (!access.ok)
    return { ok: false, message: "A análise faz parte da assinatura." };

  const analysis = decodeAnalysis(parsed.data.data);
  const game = analysis ? gameFromUcis(analysis.moves) : null;
  if (
    !analysis ||
    !game ||
    analysis.version !== 2 ||
    analysis.depth !== ANALYSIS_PROFILE.depth ||
    analysis.moves.length === 0 ||
    analysis.evals.length !== analysis.moves.length + 1 ||
    analysis.best.length !== analysis.evals.length ||
    analysis.pv.length !== analysis.evals.length ||
    Object.keys(analysis.deep).some(
      (ply) => Number(ply) >= analysis.moves.length,
    )
  )
    return { ok: false, message: "Análise incompleta ou inválida." };

  const supabase = await createClient();
  // A chave da partida é decidida aqui: importada (pela tabela) ou colada (hash).
  let gameKey = pgnGameKey(analysis.moves);
  if (parsed.data.importedGameId !== null) {
    const { data: imported } = await supabase
      .from("imported_games")
      .select("platform, external_id")
      .eq("id", parsed.data.importedGameId)
      .eq("user_id", access.userId)
      .maybeSingle();
    if (!imported) return { ok: false, message: "Partida não encontrada." };
    gameKey = `${imported.platform}:${imported.external_id}`;
  }
  if (!GAME_KEY.test(gameKey))
    return { ok: false, message: "Partida inválida." };

  const report = buildReport(analysis, game.fens, await loadOpeningBook());
  const headers = Object.fromEntries(
    Object.entries(parsed.data.headers).slice(0, 12),
  );
  const row = {
    user_id: access.userId,
    imported_game_id: parsed.data.importedGameId,
    game_key: gameKey,
    title: parsed.data.title,
    headers,
    data: encodeAnalysis(analysis),
    depth: analysis.depth,
    engine_profile: currentEngineProfile(),
    algo_version: ANALYSIS_PROFILE.algoVersion,
    summary: reportSummary(report),
    accuracy_white: report.accuracy.w,
    accuracy_black: report.accuracy.b,
    updated_at: new Date().toISOString(),
  };

  // Mesma partida: substitui. (O índice único é parcial, então o upsert do
  // PostgREST não serve aqui.)
  const { data: existing } = await supabase
    .from("game_analyses")
    .select("id")
    .eq("user_id", access.userId)
    .or(
      parsed.data.importedGameId !== null
        ? `game_key.eq.${gameKey},imported_game_id.eq.${parsed.data.importedGameId}`
        : `game_key.eq.${gameKey}`,
    )
    .limit(1)
    .maybeSingle();
  if (!existing) {
    const { data: all } = await supabase
      .from("game_analyses")
      .select("id")
      .eq("user_id", access.userId)
      .order("updated_at", { ascending: true });
    const excess = (all?.length ?? 0) - (MAX_SAVED_ANALYSES - 1);
    if (excess > 0)
      await supabase
        .from("game_analyses")
        .delete()
        .eq("user_id", access.userId)
        .in(
          "id",
          (all ?? []).slice(0, excess).map((item) => item.id),
        );
  }
  const { data, error } = existing
    ? await supabase
        .from("game_analyses")
        .update(row)
        .eq("id", existing.id)
        .eq("user_id", access.userId)
        .select("id")
        .single()
    : await supabase.from("game_analyses").insert(row).select("id").single();
  if (error || !data)
    return { ok: false, message: "Não consegui guardar a análise." };
  revalidatePath("/analise");
  revalidatePath("/partidas");
  return { ok: true, id: data.id };
}

// Análise já guardada desta partida (para reabrir sem recalcular).
export async function findSavedAnalysis(input: {
  importedGameId: number | null;
  moves: string[];
}): Promise<{ id: string; fresh: boolean } | null> {
  const access = await checkPlan(ANALYSIS_MIN_PLAN_RANK);
  if (!access.ok) return null;
  const supabase = await createClient();
  let query = supabase
    .from("game_analyses")
    .select("id, engine_profile, algo_version")
    .eq("user_id", access.userId);
  if (
    input.importedGameId !== null &&
    Number.isSafeInteger(input.importedGameId)
  )
    query = query.eq("imported_game_id", input.importedGameId);
  else {
    const moves = z
      .array(z.string().regex(UCI))
      .max(600)
      .safeParse(input.moves);
    if (!moves.success) return null;
    query = query.eq("game_key", pgnGameKey(moves.data));
  }
  const { data } = await query.limit(1).maybeSingle();
  if (!data) return null;
  return {
    id: data.id,
    fresh: sameEngineProfile(data.engine_profile as EngineProfile),
  };
}

const tacticSchema = z.object({
  fen: z.string().min(10).max(100),
  line: z.array(z.string().regex(UCI)).min(1).max(7),
});

// "Salvar como tática": cria uma tática do próprio aluno (posição antes do erro
// + linha do motor) e a coloca no conjunto "Meus erros". Táticas próprias não
// contam para o rating tático. Segue a regra que já existe: táticas e conjuntos
// próprios são do plano Intensivo.
export async function saveAsTactic(
  input: z.input<typeof tacticSchema>,
): Promise<{ ok: true } | { ok: false; message: string }> {
  const parsed = tacticSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: "Dados inválidos." };
  const access = await checkPlan(2);
  if (!access.ok)
    return {
      ok: false,
      message: "Salvar táticas próprias faz parte do plano Intensivo.",
    };
  // Confere a posição e a linha (lances legais, termina num lance do aluno).
  let fen: string;
  try {
    const chess = new Chess(parsed.data.fen);
    fen = chess.fen();
    for (const uci of parsed.data.line)
      chess.move({
        from: uci.slice(0, 2),
        to: uci.slice(2, 4),
        promotion: uci[4],
      });
  } catch {
    return { ok: false, message: "Posição ou linha inválida." };
  }
  const line =
    parsed.data.line.length % 2 === 0
      ? parsed.data.line.slice(0, -1)
      : parsed.data.line;

  const supabase = await createClient();
  const { data: duplicate } = await supabase
    .from("puzzles")
    .select("id")
    .eq("source", "custom")
    .eq("created_by", access.userId)
    .eq("fen", fen)
    .limit(1)
    .maybeSingle();
  let puzzleId = duplicate?.id as string | undefined;
  if (!puzzleId) {
    puzzleId = crypto.randomUUID();
    const { error } = await supabase.from("puzzles").insert({
      id: puzzleId,
      fen,
      moves: line.join(" "),
      first_move_is_setup: false,
      source: "custom",
      created_by: access.userId,
      themes: [],
    });
    if (error) return { ok: false, message: "Não consegui salvar a tática." };
  }

  const { data: set } = await supabase
    .from("puzzle_sets")
    .select("id")
    .eq("owner_id", access.userId)
    .eq("name", MY_MISTAKES_SET)
    .limit(1)
    .maybeSingle();
  let setId = set?.id as string | undefined;
  if (!setId) {
    const { data: created, error } = await supabase
      .from("puzzle_sets")
      .insert({
        owner_id: access.userId,
        name: MY_MISTAKES_SET,
        description: "Posições dos seus erros nas partidas analisadas.",
        is_official: false,
      })
      .select("id")
      .single();
    if (error || !created)
      return { ok: false, message: "Não consegui criar o conjunto Meus erros." };
    setId = created.id as string;
  }
  const { count } = await supabase
    .from("puzzle_set_items")
    .select("puzzle_id", { count: "exact", head: true })
    .eq("set_id", setId);
  const { error: itemError } = await supabase
    .from("puzzle_set_items")
    .upsert(
      { set_id: setId, puzzle_id: puzzleId, position: count ?? 0 },
      { onConflict: "set_id,puzzle_id", ignoreDuplicates: true },
    );
  if (itemError) return { ok: false, message: "Não consegui salvar a tática." };
  revalidatePath("/treino");
  return { ok: true };
}

export async function deleteAnalysis(id: string): Promise<{ ok: boolean }> {
  if (!z.string().uuid().safeParse(id).success) return { ok: false };
  const access = await checkPlan(ANALYSIS_MIN_PLAN_RANK);
  if (!access.ok) return { ok: false };
  const supabase = await createClient();
  const { error } = await supabase
    .from("game_analyses")
    .delete()
    .eq("id", id)
    .eq("user_id", access.userId);
  revalidatePath("/analise");
  return { ok: !error };
}
