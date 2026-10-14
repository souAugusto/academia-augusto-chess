import "server-only";
import { cycleProgress, type CycleProgress } from "@/lib/cycles";
import { createClient } from "@/lib/supabase/server";
import { toTacticPuzzle, type TacticPuzzle } from "./tactics";

// Método do Intensivo. O RLS libera conjuntos, matrículas e ciclos só para o
// plano Intensivo (e cada aluno vê só os seus).

export type SetSummary = {
  id: string;
  name: string;
  description: string | null;
  official: boolean;
  size: number;
  currentCycle: number;
  lastCycleSeconds: number | null;
};

export async function listSets(userId: string): Promise<SetSummary[]> {
  const supabase = await createClient();
  const [{ data: sets }, { data: enrollments }, { data: cycles }] =
    await Promise.all([
      supabase
        .from("puzzle_sets")
        .select(
          "id, name, description, is_official, owner_id, position, created_at, puzzle_set_items (puzzle_id)",
        )
        .order("is_official", { ascending: false })
        .order("position")
        .order("created_at", { ascending: false }),
      supabase.from("set_enrollments").select("set_id, current_cycle"),
      supabase
        .from("cycles")
        .select("set_id, cycle_number, total_seconds")
        .not("finished_at", "is", null)
        .order("cycle_number", { ascending: false }),
    ]);
  return (sets ?? [])
    .filter((set) => set.is_official || set.owner_id === userId)
    .map((set) => ({
      id: set.id,
      name: set.name,
      description: set.description,
      official: set.is_official,
      size: set.puzzle_set_items?.length ?? 0,
      currentCycle:
        enrollments?.find((row) => row.set_id === set.id)?.current_cycle ?? 1,
      lastCycleSeconds:
        cycles?.find((row) => row.set_id === set.id)?.total_seconds ?? null,
    }));
}

export type CycleHistory = {
  number: number;
  seconds: number;
  correct: number;
  total: number;
  finishedAt: string;
};

export type SetRun = {
  id: string;
  name: string;
  official: boolean;
  items: string[];
  cycleNumber: number;
  progress: CycleProgress;
  puzzle: TacticPuzzle | null; // próximo puzzle do ciclo atual
  history: CycleHistory[]; // ciclos terminados, do mais recente ao mais antigo
};

// Só abre conjuntos oficiais ou do próprio aluno.
export async function getSetRun(
  setId: string,
  userId: string,
): Promise<SetRun | null> {
  const supabase = await createClient();
  const { data: set } = await supabase
    .from("puzzle_sets")
    .select(
      "id, name, is_official, owner_id, puzzle_set_items (puzzle_id, position)",
    )
    .eq("id", setId)
    .maybeSingle();
  if (!set || (!set.is_official && set.owner_id !== userId)) return null;
  const items = [...(set.puzzle_set_items ?? [])]
    .sort((a, b) => a.position - b.position)
    .map((item) => item.puzzle_id);

  const [{ data: enrollment }, { data: cycles }] = await Promise.all([
    supabase
      .from("set_enrollments")
      .select("current_cycle")
      .eq("set_id", setId)
      .maybeSingle(),
    supabase
      .from("cycles")
      .select(
        "id, cycle_number, finished_at, total_seconds, correct_count, total_count",
      )
      .eq("set_id", setId)
      .order("cycle_number", { ascending: false }),
  ]);
  const cycleNumber = enrollment?.current_cycle ?? 1;
  const current = cycles?.find((row) => row.cycle_number === cycleNumber);

  const { data: attempts } = current
    ? await supabase
        .from("attempts")
        .select("puzzle_id, solved, seconds, created_at")
        .eq("cycle_id", current.id)
        .order("created_at")
    : { data: [] };
  const progress = cycleProgress(
    items,
    (attempts ?? []).map((row) => ({
      puzzleId: row.puzzle_id,
      solved: row.solved,
      seconds: Number(row.seconds),
    })),
  );

  let puzzle: TacticPuzzle | null = null;
  if (progress.nextPuzzleId) {
    const { data } = await supabase
      .from("puzzles")
      .select("id, fen, moves, first_move_is_setup, rating, themes")
      .eq("id", progress.nextPuzzleId)
      .maybeSingle();
    if (data) puzzle = toTacticPuzzle(data);
  }

  return {
    id: set.id,
    name: set.name,
    official: set.is_official,
    items,
    cycleNumber,
    progress,
    puzzle,
    history: (cycles ?? [])
      .filter((row) => row.finished_at)
      .map((row) => ({
        number: row.cycle_number,
        seconds: row.total_seconds ?? 0,
        correct: row.correct_count,
        total: row.total_count,
        finishedAt: row.finished_at!,
      })),
  };
}
