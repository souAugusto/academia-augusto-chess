import "server-only";
import { BOTS } from "@/content/personagens";
import { validateGame, type BotGameRecord } from "@/lib/bot/history";
import { parseProgress, type Progress } from "@/lib/bot/progress";
import { createClient } from "@/lib/supabase/server";

const BOT_IDS = BOTS.map((bot) => bot.id);
const GAME_COLUMNS =
  "id, bot_id, player_color, result, reason, stars, accuracy, moves, marks, clock, played_at";

type GameRow = {
  id: string;
  bot_id: string;
  player_color: string;
  result: string;
  reason: string;
  stars: number;
  accuracy: number | null;
  moves: string;
  marks: unknown;
  clock: string;
  played_at: string;
};

function toRecord(row: GameRow): BotGameRecord | null {
  return validateGame(
    {
      id: row.id,
      botId: row.bot_id,
      color: row.player_color,
      result: row.result,
      reason: row.reason,
      stars: row.stars,
      accuracy: row.accuracy,
      moves: row.moves ? row.moves.split(" ").filter(Boolean) : [],
      marks: row.marks,
      clock: row.clock,
      playedAt: row.played_at,
    },
    BOT_IDS,
  );
}

async function currentUser() {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getClaims();
  return { supabase, userId: auth?.claims.sub ?? null };
}

// Quem está jogando (se tiver conta) e o progresso salvo na conta.
export async function getBotPlayer(): Promise<{
  loggedIn: boolean;
  progress: Progress;
}> {
  const { supabase, userId } = await currentUser();
  if (!userId) return { loggedIn: false, progress: {} };
  const { data } = await supabase
    .from("bot_progress")
    .select("bot_id, vitorias, derrotas, empates, estrelas")
    .eq("user_id", userId);
  const raw = Object.fromEntries((data ?? []).map((row) => [row.bot_id, row]));
  return { loggedIn: true, progress: parseProgress(raw, BOT_IDS) };
}

// Últimas partidas da conta (null = sem login).
export async function getBotGames(limit: number): Promise<BotGameRecord[] | null> {
  const { supabase, userId } = await currentUser();
  if (!userId) return null;
  const { data } = await supabase
    .from("bot_games")
    .select(GAME_COLUMNS)
    .eq("user_id", userId)
    .order("played_at", { ascending: false })
    .limit(limit);
  return ((data ?? []) as GameRow[])
    .map(toRecord)
    .filter((game): game is BotGameRecord => game !== null);
}

// Uma partida da conta. "login" = visitante (a partida pode estar no aparelho).
export async function getBotGame(id: string): Promise<BotGameRecord | "login" | null> {
  const { supabase, userId } = await currentUser();
  if (!userId) return "login";
  if (!/^[0-9a-f-]{36}$/.test(id)) return null;
  const { data } = await supabase
    .from("bot_games")
    .select(GAME_COLUMNS)
    .eq("id", id)
    .eq("user_id", userId)
    .maybeSingle();
  return data ? toRecord(data as GameRow) : null;
}
