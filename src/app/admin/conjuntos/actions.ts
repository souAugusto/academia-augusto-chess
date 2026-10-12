"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import {
  formObject,
  requireAdmin,
  zodMessage,
  type AdminState,
} from "@/lib/data/admin";
import { createClient } from "@/lib/supabase/server";
import { officialSetSchema } from "@/lib/validation/admin";

// Conjuntos oficiais do método do Intensivo (sets_admin libera o admin no RLS).

function refresh() {
  revalidatePath("/treino", "layout");
  revalidatePath("/admin/conjuntos", "layout");
}

export async function saveOfficialSet(
  _prev: AdminState,
  formData: FormData,
): Promise<AdminState> {
  await requireAdmin();
  const id = formData.get("id");
  const parsed = officialSetSchema.safeParse(
    formObject(formData, ["name", "description", "position", "puzzleIds"]),
  );
  if (!parsed.success) return { message: zodMessage(parsed.error) };
  const { name, description, position, puzzleIds } = parsed.data;
  const supabase = await createClient();

  const { data: found } = await supabase
    .from("puzzles")
    .select("id")
    .in("id", puzzleIds);
  const known = new Set((found ?? []).map((row) => row.id));
  const missing = puzzleIds.filter((puzzleId) => !known.has(puzzleId));
  if (missing.length > 0)
    return {
      message: `Estes códigos não estão na base importada: ${missing.slice(0, 10).join(", ")}${missing.length > 10 ? "…" : ""}.`,
    };

  let setId: string;
  if (id) {
    setId = z.uuid().parse(id);
    const { error } = await supabase
      .from("puzzle_sets")
      .update({ name, description, position })
      .eq("id", setId)
      .eq("is_official", true);
    if (error) return { message: error.message };
    const { error: clearError } = await supabase
      .from("puzzle_set_items")
      .delete()
      .eq("set_id", setId);
    if (clearError) return { message: clearError.message };
  } else {
    const { data, error } = await supabase
      .from("puzzle_sets")
      .insert({ name, description, position, is_official: true })
      .select("id")
      .single();
    if (error) return { message: error.message };
    setId = data.id;
  }

  const { error: itemsError } = await supabase.from("puzzle_set_items").insert(
    puzzleIds.map((puzzleId, index) => ({
      set_id: setId,
      puzzle_id: puzzleId,
      position: index,
    })),
  );
  if (itemsError) return { message: itemsError.message };
  refresh();
  if (!id) redirect(`/admin/conjuntos/${setId}`);
  return { success: `Conjunto salvo com ${puzzleIds.length} puzzles.` };
}

export async function deleteOfficialSet(
  _prev: AdminState,
  formData: FormData,
): Promise<AdminState> {
  await requireAdmin();
  const id = z.uuid().safeParse(formData.get("id"));
  if (!id.success) return { message: "Conjunto inválido." };
  const supabase = await createClient();
  const { error } = await supabase
    .from("puzzle_sets")
    .delete()
    .eq("id", id.data)
    .eq("is_official", true);
  if (error) return { message: error.message };
  refresh();
  redirect("/admin/conjuntos");
}
