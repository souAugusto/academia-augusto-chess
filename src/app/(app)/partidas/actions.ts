"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import type { FormState } from "@/app/(auth)/actions";
import { checkPlan } from "@/lib/data/access";
import {
  checkChessCom,
  checkLichess,
  fetchChessComMonth,
  fetchLichessGames,
  GamesFetchError,
  isChessComArchiveUrl,
  MAX_GAMES_PER_IMPORT,
  type FetchErrorKind,
} from "@/lib/games/fetch";
import type { NormalizedGame, Platform } from "@/lib/games/normalize";
import { createClient } from "@/lib/supabase/server";

// Contas do Chess.com e do Lichess e importação das partidas (assinantes).
// O navegador conduz a importação em passos curtos; cada passo faz uma ou duas
// requisições e grava o que recebeu.

const REFRESH_MINUTES = 60;
const platformSchema = z.enum(["chesscom", "lichess"]);

const FETCH_MESSAGES: Record<FetchErrorKind, string> = {
  not_found: "Não encontramos esse usuário. Confira o nome e tente de novo.",
  no_games: "Esse perfil não tem partidas públicas para importar.",
  unavailable:
    "A plataforma não respondeu agora. Tente de novo em alguns minutos.",
  rate_limited: "A plataforma pediu para esperar um pouco.",
};

function fetchMessage(error: unknown): string {
  return error instanceof GamesFetchError
    ? FETCH_MESSAGES[error.kind]
    : "Algo deu errado. Tente de novo.";
}

async function access() {
  const result = await checkPlan(1);
  return result.ok ? result.userId : null;
}

export async function linkAccount(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const values = {
    platform: String(formData.get("platform") ?? ""),
    username: String(formData.get("username") ?? "").trim(),
  };
  const platform = platformSchema.safeParse(values.platform);
  if (!platform.success) return { message: "Plataforma inválida.", values };
  if (!values.username)
    return { errors: { username: "Digite o nome de usuário." }, values };
  const userId = await access();
  if (!userId)
    return { message: "As partidas fazem parte da assinatura.", values };

  let username: string;
  try {
    username =
      platform.data === "chesscom"
        ? (await checkChessCom(values.username)).username
        : (await checkLichess(values.username)).username;
  } catch (error) {
    return { message: fetchMessage(error), values };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("linked_accounts").upsert({
    user_id: userId,
    platform: platform.data,
    username,
    last_import_at: null,
    last_game_at: null,
  });
  if (error) return { message: "Não foi possível salvar agora.", values };
  revalidatePath("/partidas");
  return { success: `Conta ${username} vinculada. Agora é só importar.` };
}

// Desvincula e apaga as partidas daquela plataforma (dá para vincular e importar de novo).
export async function unlinkAccount(formData: FormData): Promise<void> {
  const platform = platformSchema.safeParse(formData.get("platform"));
  const userId = await access();
  if (!platform.success || !userId) return;
  const supabase = await createClient();
  await supabase.from("imported_games").delete().eq("platform", platform.data);
  await supabase.from("linked_accounts").delete().eq("platform", platform.data);
  revalidatePath("/partidas");
}

export type ImportPlan =
  | {
      ok: true;
      platform: Platform;
      archives: string[]; // Chess.com: meses a buscar, do mais recente ao mais antigo
      sinceMs: number | null; // só partidas depois disso (importações seguintes)
      budget: number;
    }
  | { ok: false; error: string };

// Começa uma importação: confere o limite de frequência e devolve o plano.
export async function startImport(platformInput: string): Promise<ImportPlan> {
  const platform = platformSchema.safeParse(platformInput);
  if (!platform.success) return { ok: false, error: "Plataforma inválida." };
  const userId = await access();
  if (!userId)
    return { ok: false, error: "As partidas fazem parte da assinatura." };

  const supabase = await createClient();
  const { data: account } = await supabase
    .from("linked_accounts")
    .select("username, last_import_at, last_game_at")
    .eq("platform", platform.data)
    .maybeSingle();
  if (!account) return { ok: false, error: "Vincule a conta primeiro." };

  if (account.last_import_at) {
    const nextAt =
      new Date(account.last_import_at).getTime() + REFRESH_MINUTES * 60_000;
    if (nextAt > Date.now()) {
      const time = new Intl.DateTimeFormat("pt-BR", {
        timeZone: "America/Sao_Paulo",
        hour: "2-digit",
        minute: "2-digit",
      }).format(nextAt);
      return {
        ok: false,
        error: `Você pode atualizar de novo às ${time}.`,
      };
    }
  }

  const sinceMs = account.last_game_at
    ? new Date(account.last_game_at).getTime()
    : null;
  if (platform.data === "lichess")
    return {
      ok: true,
      platform: "lichess",
      archives: [],
      sinceMs,
      budget: MAX_GAMES_PER_IMPORT,
    };

  try {
    const { archives } = await checkChessCom(account.username);
    // Importações seguintes: só os meses a partir da última partida salva.
    const sinceMonth = sinceMs
      ? new Date(sinceMs).toISOString().slice(0, 7).replace("-", "/")
      : null;
    return {
      ok: true,
      platform: "chesscom",
      archives: sinceMonth
        ? archives.filter((url) => url.slice(-7) >= sinceMonth)
        : archives,
      sinceMs,
      budget: MAX_GAMES_PER_IMPORT,
    };
  } catch (error) {
    return { ok: false, error: fetchMessage(error) };
  }
}

export type StepResult =
  | { ok: true; saved: number; fetched: number }
  | { ok: false; error: string; retry: boolean };

async function save(userId: string, games: NormalizedGame[]): Promise<number> {
  if (games.length === 0) return 0;
  const supabase = await createClient();
  let saved = 0;
  for (let i = 0; i < games.length; i += 200) {
    const { data, error } = await supabase
      .from("imported_games")
      .upsert(
        games.slice(i, i + 200).map((game) => ({
          user_id: userId,
          platform: game.platform,
          external_id: game.externalId,
          played_at: game.playedAt,
          color: game.color,
          result: game.result,
          end_reason: game.endReason,
          time_control: game.timeControl,
          time_class: game.timeClass,
          user_rating: game.userRating,
          opponent_rating: game.opponentRating,
          opening_name: game.openingName,
          eco: game.eco,
          moves: game.moves,
        })),
        { onConflict: "user_id,platform,external_id", ignoreDuplicates: true },
      )
      .select("id");
    if (error) throw error;
    saved += data?.length ?? 0;
  }
  return saved;
}

function stepError(error: unknown): StepResult {
  const retry =
    error instanceof GamesFetchError && error.kind === "rate_limited";
  return { ok: false, error: fetchMessage(error), retry };
}

const monthSchema = z.object({
  url: z.string().url().max(200),
  budget: z.number().int().min(1).max(MAX_GAMES_PER_IMPORT),
  sinceMs: z.number().int().nullable(),
});

// Um mês do Chess.com (do mais recente para o mais antigo).
export async function importChessComMonth(input: {
  url: string;
  budget: number;
  sinceMs: number | null;
}): Promise<StepResult> {
  const parsed = monthSchema.safeParse(input);
  if (!parsed.success)
    return { ok: false, error: "Pedido inválido.", retry: false };
  const userId = await access();
  if (!userId) return { ok: false, error: "Sessão expirada.", retry: false };
  const supabase = await createClient();
  const { data: account } = await supabase
    .from("linked_accounts")
    .select("username")
    .eq("platform", "chesscom")
    .maybeSingle();
  if (!account || !isChessComArchiveUrl(parsed.data.url, account.username))
    return { ok: false, error: "Mês inválido.", retry: false };

  try {
    const { sinceMs, budget } = parsed.data;
    const games = (await fetchChessComMonth(parsed.data.url, account.username))
      .filter((game) => !sinceMs || new Date(game.playedAt).getTime() > sinceMs)
      .sort((a, b) => b.playedAt.localeCompare(a.playedAt))
      .slice(0, budget);
    return {
      ok: true,
      saved: await save(userId, games),
      fetched: games.length,
    };
  } catch (error) {
    return stepError(error);
  }
}

// Lichess: um passo só (o stream já traz até o limite).
export async function importLichess(input: {
  sinceMs: number | null;
}): Promise<StepResult> {
  const sinceMs = z.number().int().nullable().safeParse(input.sinceMs);
  if (!sinceMs.success)
    return { ok: false, error: "Pedido inválido.", retry: false };
  const userId = await access();
  if (!userId) return { ok: false, error: "Sessão expirada.", retry: false };
  const supabase = await createClient();
  const { data: account } = await supabase
    .from("linked_accounts")
    .select("username")
    .eq("platform", "lichess")
    .maybeSingle();
  if (!account)
    return { ok: false, error: "Vincule a conta primeiro.", retry: false };
  try {
    const games = await fetchLichessGames(account.username, {
      sinceMs: sinceMs.data,
      max: MAX_GAMES_PER_IMPORT,
    });
    return {
      ok: true,
      saved: await save(userId, games),
      fetched: games.length,
    };
  } catch (error) {
    return stepError(error);
  }
}

// Fim da importação: guarda a data da última partida (as próximas buscam só
// o que vier depois) e liga o limite de uma atualização por hora.
export async function finishImport(platformInput: string): Promise<void> {
  const platform = platformSchema.safeParse(platformInput);
  const userId = await access();
  if (!platform.success || !userId) return;
  const supabase = await createClient();
  const { data: latest } = await supabase
    .from("imported_games")
    .select("played_at")
    .eq("platform", platform.data)
    .order("played_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  await supabase
    .from("linked_accounts")
    .update({
      last_import_at: new Date().toISOString(),
      last_game_at: latest?.played_at ?? null,
    })
    .eq("platform", platform.data);
  revalidatePath("/partidas");
}
