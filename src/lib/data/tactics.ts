import "server-only";
import type { PuzzleRecord } from "@/lib/chess/puzzle";
import { INITIAL_RATING } from "@/lib/rating";
import { createClient } from "@/lib/supabase/server";

// Puzzle enviado ao navegador. A solução vai junto (como no Lichess); o servidor
// confere os lances de novo antes de mexer no rating.
export type TacticPuzzle = PuzzleRecord & { id: string; rating: number };

export type TacticStats = { rating: number; games: number; solved: number };

export async function getMyTacticStats(userId: string): Promise<TacticStats> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("user_stats")
    .select("puzzle_rating, puzzle_games, puzzles_solved")
    .eq("user_id", userId)
    .maybeSingle();
  return {
    rating: data?.puzzle_rating ?? INITIAL_RATING,
    games: data?.puzzle_games ?? 0,
    solved: data?.puzzles_solved ?? 0,
  };
}

export function toTacticPuzzle(row: {
  id: string;
  fen: string;
  moves: string;
  first_move_is_setup: boolean;
  rating: number | null;
  themes: string[];
}): TacticPuzzle {
  return {
    id: row.id,
    fen: row.fen,
    moves: row.moves,
    first_move_is_setup: row.first_move_is_setup,
    rating: row.rating ?? INITIAL_RATING,
    themes: row.themes,
  };
}
