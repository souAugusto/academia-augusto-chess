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
import { endgameSchema } from "@/lib/validation/admin";

const FIELDS = [
  "slug",
  "title",
  "description",
  "category",
  "level",
  "fen",
  "userColor",
  "goal",
  "maxMoves",
  "planRequired",
  "position",
  "isPublished",
];

function refresh() {
  revalidatePath("/finais", "layout");
  revalidatePath("/admin/finais", "layout");
}

function duplicateSlug(code: string | undefined) {
  return code === "23505"
    ? "Já existe um final com esse endereço (slug)."
    : undefined;
}

export async function saveEndgame(
  _prev: AdminState,
  formData: FormData,
): Promise<AdminState> {
  await requireAdmin();
  const id = formData.get("id");
  const parsed = endgameSchema.safeParse(formObject(formData, FIELDS));
  if (!parsed.success) return { message: zodMessage(parsed.error) };
  const endgame = parsed.data;
  const values = {
    slug: endgame.slug,
    title: endgame.title,
    description: endgame.description,
    category: endgame.category,
    level: endgame.level,
    fen: endgame.fen,
    user_color: endgame.userColor,
    goal: endgame.goal,
    max_moves: endgame.maxMoves,
    plan_required: endgame.planRequired,
    position: endgame.position,
    is_published: endgame.isPublished,
  };
  const supabase = await createClient();
  if (id) {
    const { error } = await supabase
      .from("endgames")
      .update(values)
      .eq("id", z.uuid().parse(id));
    if (error) return { message: duplicateSlug(error.code) ?? error.message };
    refresh();
    return { success: "Final salvo." };
  }
  const { data, error } = await supabase
    .from("endgames")
    .insert(values)
    .select("id")
    .single();
  if (error) return { message: duplicateSlug(error.code) ?? error.message };
  refresh();
  redirect(`/admin/finais/${data.id}`);
}

export async function deleteEndgame(
  _prev: AdminState,
  formData: FormData,
): Promise<AdminState> {
  await requireAdmin();
  const id = z.uuid().safeParse(formData.get("id"));
  if (!id.success) return { message: "Final inválido." };
  const supabase = await createClient();
  const { error } = await supabase.from("endgames").delete().eq("id", id.data);
  if (error) return { message: error.message };
  refresh();
  redirect("/admin/finais");
}
