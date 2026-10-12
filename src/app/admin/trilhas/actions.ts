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
import { stepSchema, trailSchema } from "@/lib/validation/admin";

const FIELDS = [
  "slug",
  "title",
  "description",
  "planRequired",
  "position",
  "isPublished",
];

function refresh() {
  revalidatePath("/painel");
  revalidatePath("/admin/trilhas", "layout");
}

export async function saveTrail(
  _prev: AdminState,
  formData: FormData,
): Promise<AdminState> {
  await requireAdmin();
  const id = formData.get("id");
  const parsed = trailSchema.safeParse(formObject(formData, FIELDS));
  if (!parsed.success) return { message: zodMessage(parsed.error) };
  const trail = parsed.data;
  const values = {
    slug: trail.slug,
    title: trail.title,
    description: trail.description,
    plan_required: trail.planRequired,
    position: trail.position,
    is_published: trail.isPublished,
  };
  const supabase = await createClient();
  const duplicate = "Já existe uma trilha com esse endereço (slug).";
  if (id) {
    const { error } = await supabase
      .from("trails")
      .update(values)
      .eq("id", z.uuid().parse(id));
    if (error)
      return { message: error.code === "23505" ? duplicate : error.message };
    refresh();
    return { success: "Trilha salva." };
  }
  const { data, error } = await supabase
    .from("trails")
    .insert(values)
    .select("id")
    .single();
  if (error)
    return { message: error.code === "23505" ? duplicate : error.message };
  refresh();
  redirect(`/admin/trilhas/${data.id}`);
}

export async function deleteTrail(
  _prev: AdminState,
  formData: FormData,
): Promise<AdminState> {
  await requireAdmin();
  const id = z.uuid().safeParse(formData.get("id"));
  if (!id.success) return { message: "Trilha inválida." };
  const supabase = await createClient();
  const { error } = await supabase.from("trails").delete().eq("id", id.data);
  if (error) return { message: error.message };
  refresh();
  redirect("/admin/trilhas");
}

// Título da etapa: o que o admin escreveu ou o nome do conteúdo escolhido.
async function contentTitle(kind: string, id: string): Promise<string | null> {
  const supabase = await createClient();
  const table = {
    lesson: "lessons",
    repertoire: "repertoires",
    endgame: "endgames",
    set: "puzzle_sets",
  }[kind];
  if (!table) return null;
  const column = kind === "set" ? "name" : "title";
  const { data } = await supabase
    .from(table)
    .select(column)
    .eq("id", id)
    .maybeSingle();
  return data ? String((data as Record<string, unknown>)[column]) : null;
}

export async function addStep(
  _prev: AdminState,
  formData: FormData,
): Promise<AdminState> {
  await requireAdmin();
  const parsed = stepSchema.safeParse(
    formObject(formData, ["trailId", "ref", "title", "position"]),
  );
  if (!parsed.success) return { message: zodMessage(parsed.error) };
  const { trailId, ref, title, position } = parsed.data;
  const name = title || (await contentTitle(ref.kind, ref.id));
  if (!name) return { message: "Conteúdo não encontrado." };
  const supabase = await createClient();
  const { error } = await supabase.from("trail_steps").insert({
    trail_id: trailId,
    kind: ref.kind,
    ref_id: ref.id,
    title: name,
    position,
  });
  if (error) return { message: error.message };
  refresh();
  return { success: "Etapa adicionada." };
}

export async function updateStep(
  _prev: AdminState,
  formData: FormData,
): Promise<AdminState> {
  await requireAdmin();
  const parsed = z
    .object({
      id: z.uuid(),
      title: z.string().trim().min(2, "Escreva o título.").max(120),
      position: z.coerce.number().int().min(0).max(999),
    })
    .safeParse(formObject(formData, ["id", "title", "position"]));
  if (!parsed.success) return { message: zodMessage(parsed.error) };
  const supabase = await createClient();
  const { error } = await supabase
    .from("trail_steps")
    .update({ title: parsed.data.title, position: parsed.data.position })
    .eq("id", parsed.data.id);
  if (error) return { message: error.message };
  refresh();
  return { success: "Etapa salva." };
}

export async function deleteStep(
  _prev: AdminState,
  formData: FormData,
): Promise<AdminState> {
  await requireAdmin();
  const id = z.uuid().safeParse(formData.get("id"));
  if (!id.success) return { message: "Etapa inválida." };
  const supabase = await createClient();
  const { error } = await supabase
    .from("trail_steps")
    .delete()
    .eq("id", id.data);
  if (error) return { message: error.message };
  refresh();
  return { success: "Etapa removida." };
}
