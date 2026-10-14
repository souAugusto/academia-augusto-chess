"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import {
  formObject,
  requireAdmin,
  zodMessage,
  type AdminState,
} from "@/lib/data/admin";
import { createAdminClient } from "@/lib/supabase/admin";
import { slugify, titleSchema } from "@/lib/validation/titles";

// A escada é editada pela service role, depois de conferir que é admin.
// Mudar o rating mínimo não tira títulos já conquistados (são permanentes).

const FIELDS = ["name", "minRating", "tagline", "color"] as const;

function revalidate() {
  revalidatePath("/admin/titulos");
  revalidatePath("/titulos");
  revalidatePath("/painel");
}

export async function updateTitle(
  _prev: AdminState,
  formData: FormData,
): Promise<AdminState> {
  await requireAdmin();
  const id = z.coerce.number().int().positive().safeParse(formData.get("id"));
  const parsed = titleSchema.safeParse(formObject(formData, FIELDS));
  if (!id.success) return { message: "Título não encontrado." };
  if (!parsed.success) return { message: zodMessage(parsed.error) };
  const { error } = await createAdminClient()
    .from("titles")
    .update({
      name: parsed.data.name,
      min_rating: parsed.data.minRating,
      tagline: parsed.data.tagline || null,
      color: parsed.data.color,
    })
    .eq("id", id.data);
  if (error?.code === "23505")
    return { message: "Já existe um título com esse rating mínimo." };
  if (error) return { message: `Não foi possível salvar: ${error.message}` };
  revalidate();
  return { success: "Título salvo." };
}

export async function createTitle(
  _prev: AdminState,
  formData: FormData,
): Promise<AdminState> {
  await requireAdmin();
  const parsed = titleSchema.safeParse(formObject(formData, FIELDS));
  if (!parsed.success) return { message: zodMessage(parsed.error) };
  const slug = slugify(parsed.data.name);
  if (slug.length < 2) return { message: "Nome inválido." };
  const { error } = await createAdminClient()
    .from("titles")
    .insert({
      slug,
      name: parsed.data.name,
      min_rating: parsed.data.minRating,
      tagline: parsed.data.tagline || null,
      color: parsed.data.color,
    });
  if (error?.code === "23505")
    return { message: "Já existe um título com esse nome ou rating mínimo." };
  if (error) return { message: `Não foi possível criar: ${error.message}` };
  revalidate();
  return { success: "Título criado." };
}
