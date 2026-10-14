"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import type { FormState } from "@/app/(auth)/actions";
import { evaluateAttempt } from "@/lib/chess/solver";
import { isThemeFilter, themeLabel } from "@/lib/chess/themes";
import { cycleProgress, type CycleProgress } from "@/lib/cycles";
import { checkPlan } from "@/lib/data/access";
import { getMyTacticStats } from "@/lib/data/tactics";
import { createClient } from "@/lib/supabase/server";

// Método do Intensivo (/treino). Plano conferido no servidor e de novo pelo RLS.

const UCI = /^[a-h][1-8][a-h][1-8][qrbn]?$/;
const MAX_SECONDS = 600;
const SIZES = [10, 20, 30, 50] as const;

const createSchema = z.discriminatedUnion("source", [
  z.object({
    source: z.literal("tema"),
    theme: z.string().refine((value) => value === "" || isThemeFilter(value)),
    size: z.coerce.number().refine((value) => SIZES.includes(value as 10)),
  }),
  z.object({
    source: z.literal("erros"),
    size: z.coerce.number().refine((value) => SIZES.includes(value as 10)),
  }),
]);

function text(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

// Cria um conjunto do aluno: por tema (sorteado perto do rating dele) ou com os
// puzzles que ele mais errou.
export async function createSet(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const parsed = createSchema.safeParse({
    source: text(formData, "source"),
    theme: text(formData, "theme"),
    size: text(formData, "size"),
  });
  if (!parsed.success) return { message: "Confira as opções do conjunto." };
  const access = await checkPlan(2);
  if (!access.ok) return { message: "O método faz parte do plano Intensivo." };

  const supabase = await createClient();
  const input = parsed.data;
  let puzzleIds: string[] = [];
  let name: string;

  if (input.source === "tema") {
    const { rating } = await getMyTacticStats(access.userId);
    const theme = input.theme || null;
    const { data, error } = await supabase.rpc("pick_puzzles", {
      p_theme: theme,
      p_count: input.size,
      p_min: rating - 400,
      p_max: rating + 300,
    });
    if (error) return { message: "Não foi possível montar o conjunto agora." };
    puzzleIds = ((data ?? []) as string[]).slice(0, input.size);
    const label = theme ? themeLabel(theme) : "Temas variados";
    name = `${label} · ${puzzleIds.length} puzzles`;
  } else {
    const { data } = await supabase
      .from("review_state")
      .select("puzzle_id, lapses")
      .order("lapses", { ascending: false })
      .order("updated_at", { ascending: false })
      .limit(input.size);
    puzzleIds = (data ?? []).map((row) => row.puzzle_id);
    name = `Meus erros · ${puzzleIds.length} puzzles`;
  }

  if (puzzleIds.length < 3)
    return {
      message:
        input.source === "erros"
          ? "Você ainda tem poucos erros guardados. Treine táticas e volte depois."
          : "Não há puzzles suficientes com esse tema.",
    };

  const { data: set, error: setError } = await supabase
    .from("puzzle_sets")
    .insert({ owner_id: access.userId, name, is_official: false })
    .select("id")
    .single();
  if (setError) return { message: "Não foi possível criar o conjunto." };
  const { error: itemsError } = await supabase.from("puzzle_set_items").insert(
    puzzleIds.map((puzzleId, position) => ({
      set_id: set.id,
      puzzle_id: puzzleId,
      position,
    })),
  );
  if (itemsError) {
    await supabase.from("puzzle_sets").delete().eq("id", set.id);
    return { message: "Não foi possível criar o conjunto." };
  }
  revalidatePath("/treino");
  redirect(`/treino/${set.id}`);
}

export async function deleteSet(formData: FormData): Promise<void> {
  const id = z.uuid().safeParse(formData.get("id"));
  const access = await checkPlan(2);
  if (!id.success || !access.ok) return;
  const supabase = await createClient();
  // O RLS só deixa apagar conjunto próprio (os oficiais são do Augusto).
  await supabase
    .from("puzzle_sets")
    .delete()
    .eq("id", id.data)
    .eq("owner_id", access.userId);
  revalidatePath("/treino");
  redirect("/treino");
}

const attemptSchema = z.object({
  setId: z.uuid(),
  puzzleId: z.string().min(1).max(64),
  moves: z.array(z.string().regex(UCI)).max(30),
  seconds: z.number().min(0).max(86_400),
});

export type CycleAttemptResult =
  | {
      ok: true;
      solved: boolean;
      progress: CycleProgress;
      cycleNumber: number;
      cycleFinished: boolean;
    }
  | { ok: false; error: string };

// Grava a tentativa no ciclo atual. Se foi o último puzzle, fecha o ciclo e o
// próximo começa no próximo lance. O tempo do ciclo é a soma dos puzzles.
export async function recordCycleAttempt(input: {
  setId: string;
  puzzleId: string;
  moves: string[];
  seconds: number;
}): Promise<CycleAttemptResult> {
  const parsed = attemptSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Tentativa inválida." };
  const access = await checkPlan(2);
  if (!access.ok)
    return { ok: false, error: "O método faz parte do plano Intensivo." };
  const { setId, puzzleId, moves } = parsed.data;
  const seconds = Math.min(parsed.data.seconds, MAX_SECONDS);
  const supabase = await createClient();

  const { data: set } = await supabase
    .from("puzzle_sets")
    .select("id, puzzle_set_items (puzzle_id, position)")
    .eq("id", setId)
    .maybeSingle();
  if (!set) return { ok: false, error: "Conjunto não encontrado." };
  const items = [...(set.puzzle_set_items ?? [])]
    .sort((a, b) => a.position - b.position)
    .map((item) => item.puzzle_id);
  if (!items.includes(puzzleId))
    return { ok: false, error: "Este puzzle não é do conjunto." };

  const { data: puzzle } = await supabase
    .from("puzzles")
    .select("id, fen, moves, first_move_is_setup")
    .eq("id", puzzleId)
    .maybeSingle();
  if (!puzzle) return { ok: false, error: "Puzzle não encontrado." };
  const { solved } = evaluateAttempt(puzzle, moves);

  // Matrícula e ciclo atual (criados na primeira tentativa).
  await supabase
    .from("set_enrollments")
    .upsert(
      { user_id: access.userId, set_id: setId },
      { onConflict: "user_id,set_id", ignoreDuplicates: true },
    );
  const { data: enrollment } = await supabase
    .from("set_enrollments")
    .select("current_cycle")
    .eq("set_id", setId)
    .single();
  const cycleNumber = enrollment?.current_cycle ?? 1;
  await supabase.from("cycles").upsert(
    {
      user_id: access.userId,
      set_id: setId,
      cycle_number: cycleNumber,
      total_count: items.length,
    },
    { onConflict: "user_id,set_id,cycle_number", ignoreDuplicates: true },
  );
  const { data: cycle } = await supabase
    .from("cycles")
    .select("id")
    .eq("set_id", setId)
    .eq("cycle_number", cycleNumber)
    .single();
  if (!cycle) return { ok: false, error: "Não foi possível abrir o ciclo." };

  const { error: attemptError } = await supabase.from("attempts").insert({
    user_id: access.userId,
    cycle_id: cycle.id,
    puzzle_id: puzzleId,
    solved,
    seconds,
  });
  if (attemptError)
    return { ok: false, error: "Não foi possível salvar a tentativa." };
  await supabase.rpc("mark_activity");

  const { data: attempts } = await supabase
    .from("attempts")
    .select("puzzle_id, solved, seconds, created_at")
    .eq("cycle_id", cycle.id)
    .order("created_at");
  const progress = cycleProgress(
    items,
    (attempts ?? []).map((row) => ({
      puzzleId: row.puzzle_id,
      solved: row.solved,
      seconds: Number(row.seconds),
    })),
  );

  if (progress.finished) {
    await supabase
      .from("cycles")
      .update({
        finished_at: new Date().toISOString(),
        total_seconds: Math.round(progress.seconds),
        correct_count: progress.correct,
      })
      .eq("id", cycle.id);
    await supabase
      .from("set_enrollments")
      .update({ current_cycle: cycleNumber + 1 })
      .eq("set_id", setId);
  }
  return {
    ok: true,
    solved,
    progress,
    cycleNumber,
    cycleFinished: progress.finished,
  };
}
