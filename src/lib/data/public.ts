import "server-only";
import {
  puzzleStartPosition,
  puzzleThemeLabel,
  type PuzzleRecord,
  type PuzzleStart,
} from "@/lib/chess/puzzle";
import { todayInSaoPaulo } from "@/lib/format";
import { createPublicClient } from "@/lib/supabase/public";

export type PlanId = "membro" | "intensivo";

export type Plan = {
  id: PlanId;
  name: string;
  priceCents: number;
  seatLimit: number | null;
};

export type NextLive = { title: string; startsAt: Date; url: string | null };

export type DailyPuzzle = PuzzleStart & { themeLabel: string | null };

function fail(what: string, message: string): never {
  throw new Error(`Falha ao carregar ${what}: ${message}`);
}

export async function getPlans(): Promise<Plan[]> {
  const { data, error } = await createPublicClient()
    .from("plans")
    .select("id, name, price_cents, seat_limit")
    .eq("active", true)
    .order("rank");
  if (error) fail("planos", error.message);
  return data.map((row) => ({
    id: row.id as PlanId,
    name: row.name,
    priceCents: row.price_cents,
    seatLimit: row.seat_limit,
  }));
}

export async function getIntensivoSeatsLeft(): Promise<number> {
  const { data, error } = await createPublicClient().rpc(
    "intensivo_seats_left",
  );
  if (error) fail("vagas do Intensivo", error.message);
  return Number(data);
}

// Próxima live pública que ainda não começou.
export async function getNextPublicLive(
  now: Date = new Date(),
): Promise<NextLive | null> {
  const { data, error } = await createPublicClient()
    .from("live_events")
    .select("title, starts_at, url")
    .eq("audience", "public")
    .gte("starts_at", now.toISOString())
    .order("starts_at")
    .limit(1)
    .maybeSingle();
  if (error) fail("próxima live", error.message);
  return (
    data && {
      title: data.title,
      startsAt: new Date(data.starts_at),
      url: data.url,
    }
  );
}

export type DailyPuzzleRecord = {
  day: string;
  puzzle: PuzzleRecord;
  themeLabel: string | null;
};

// Puzzle do dia completo (com a solução), para a página jogável.
// O de hoje (São Paulo) ou, se não houver, o mais recente.
export async function getDailyPuzzleRecord(
  now: Date = new Date(),
): Promise<DailyPuzzleRecord | null> {
  const { data, error } = await createPublicClient()
    .from("daily_puzzles")
    .select("day, puzzles (fen, moves, first_move_is_setup, themes)")
    .lte("day", todayInSaoPaulo(now))
    .order("day", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) fail("puzzle do dia", error.message);
  // Sem tipos gerados do banco, o supabase-js não sabe que a relação é 1:1.
  const related = data?.puzzles as
    PuzzleRecord | PuzzleRecord[] | null | undefined;
  const puzzle = Array.isArray(related) ? related[0] : related;
  if (!data || !puzzle) return null;
  return { day: data.day, puzzle, themeLabel: puzzleThemeLabel(puzzle.themes) };
}

// Posição inicial do puzzle do dia, para o tabuleiro estático da Home.
export async function getDailyPuzzle(
  now: Date = new Date(),
): Promise<DailyPuzzle | null> {
  const record = await getDailyPuzzleRecord(now);
  if (!record) return null;
  return {
    ...puzzleStartPosition(record.puzzle),
    themeLabel: record.themeLabel,
  };
}
