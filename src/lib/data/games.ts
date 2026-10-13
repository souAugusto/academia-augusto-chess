import "server-only";
import type { Platform } from "@/lib/games/normalize";
import type { GameRow } from "@/lib/games/stats";
import { createClient } from "@/lib/supabase/server";

// Contas vinculadas e partidas importadas do aluno logado (RLS: só as suas).

export type LinkedAccount = {
  platform: Platform;
  username: string;
  lastImportAt: Date | null;
  games: number;
};

export async function getLinkedAccounts(): Promise<LinkedAccount[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("linked_accounts")
    .select("platform, username, last_import_at");
  const accounts = data ?? [];
  const counts = await Promise.all(
    accounts.map((account) =>
      supabase
        .from("imported_games")
        .select("id", { count: "exact", head: true })
        .eq("platform", account.platform),
    ),
  );
  return accounts.map((account, index) => ({
    platform: account.platform as Platform,
    username: account.username,
    lastImportAt: account.last_import_at
      ? new Date(account.last_import_at)
      : null,
    games: counts[index].count ?? 0,
  }));
}

const PAGE = 1000; // limite de linhas por consulta do Supabase

export async function getGamesForStats(
  platform: Platform | null,
): Promise<GameRow[]> {
  const supabase = await createClient();
  const rows: GameRow[] = [];
  for (let from = 0; ; from += PAGE) {
    let query = supabase
      .from("imported_games")
      .select(
        "platform, played_at, color, result, end_reason, time_class, user_rating, opening_name, eco, moves",
      )
      .order("played_at", { ascending: false })
      .range(from, from + PAGE - 1);
    if (platform) query = query.eq("platform", platform);
    const { data } = await query;
    for (const row of data ?? [])
      rows.push({
        platform: row.platform,
        playedAt: row.played_at,
        color: row.color,
        result: row.result,
        endReason: row.end_reason,
        timeClass: row.time_class,
        userRating: row.user_rating,
        openingName: row.opening_name,
        eco: row.eco,
        moves: row.moves,
      });
    if (!data || data.length < PAGE) break;
  }
  return rows;
}

export type RecentGame = {
  id: number;
  platform: Platform;
  playedAt: string;
  color: "white" | "black";
  result: "win" | "draw" | "loss";
  openingName: string | null;
  opponentRating: number | null;
  timeClass: string;
};

// Últimas partidas importadas, para a lista com o botão de análise.
export async function getRecentGames(
  platform: Platform | null,
  limit = 20,
): Promise<RecentGame[]> {
  const supabase = await createClient();
  let query = supabase
    .from("imported_games")
    .select(
      "id, platform, played_at, color, result, opening_name, opponent_rating, time_class",
    )
    .order("played_at", { ascending: false })
    .limit(limit);
  if (platform) query = query.eq("platform", platform);
  const { data } = await query;
  return (data ?? []).map((row) => ({
    id: row.id,
    platform: row.platform,
    playedAt: row.played_at,
    color: row.color,
    result: row.result,
    openingName: row.opening_name,
    opponentRating: row.opponent_rating,
    timeClass: row.time_class,
  }));
}
