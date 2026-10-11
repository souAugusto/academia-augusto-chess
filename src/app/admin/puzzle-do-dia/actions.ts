"use server";

import { revalidatePath } from "next/cache";
import {
  formObject,
  requireAdmin,
  zodMessage,
  type AdminState,
} from "@/lib/data/admin";
import { createClient } from "@/lib/supabase/server";
import { dailySchema } from "@/lib/validation/admin";

// Troca o puzzle de um dia por outro da base importada do Lichess.
export async function setDailyPuzzle(
  _prev: AdminState,
  formData: FormData,
): Promise<AdminState> {
  await requireAdmin();
  const parsed = dailySchema.safeParse(
    formObject(formData, ["day", "puzzleId"]),
  );
  if (!parsed.success) return { message: zodMessage(parsed.error) };
  const supabase = await createClient();
  const { data: puzzle } = await supabase
    .from("puzzles")
    .select("id")
    .eq("id", parsed.data.puzzleId)
    .maybeSingle();
  if (!puzzle) return { message: "Esse puzzle não está na base importada." };
  const { error } = await supabase
    .from("daily_puzzles")
    .upsert({ day: parsed.data.day, puzzle_id: parsed.data.puzzleId });
  if (error) return { message: error.message };
  revalidatePath("/puzzle-do-dia");
  revalidatePath("/");
  revalidatePath("/admin/puzzle-do-dia");
  return { success: "Puzzle trocado." };
}
