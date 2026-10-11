"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import {
  formObject,
  requireAdmin,
  zodMessage,
  type AdminState,
} from "@/lib/data/admin";
import { parseRepertoireText, planRepertoireSync } from "@/lib/openings/editor";
import type { RepertoireNode } from "@/lib/openings/tree";
import { createClient } from "@/lib/supabase/server";
import { repertoireSchema } from "@/lib/validation/admin";

const FIELDS = [
  "slug",
  "title",
  "description",
  "color",
  "planRequired",
  "position",
  "isPublished",
];
const MAX_TEXT = 50_000;

function refresh() {
  revalidatePath("/aberturas", "layout");
  revalidatePath("/admin/aberturas", "layout");
}

export async function saveRepertoire(
  _prev: AdminState,
  formData: FormData,
): Promise<AdminState> {
  await requireAdmin();
  const id = formData.get("id");
  const parsed = repertoireSchema.safeParse(formObject(formData, FIELDS));
  if (!parsed.success) return { message: zodMessage(parsed.error) };
  const repertoire = parsed.data;
  const values = {
    slug: repertoire.slug,
    title: repertoire.title,
    description: repertoire.description,
    color: repertoire.color,
    plan_required: repertoire.planRequired,
    position: repertoire.position,
    is_published: repertoire.isPublished,
  };
  const supabase = await createClient();
  const duplicate = "Já existe um repertório com esse endereço (slug).";
  if (id) {
    const { error } = await supabase
      .from("repertoires")
      .update(values)
      .eq("id", z.uuid().parse(id));
    if (error)
      return { message: error.code === "23505" ? duplicate : error.message };
    refresh();
    return { success: "Repertório salvo." };
  }
  const { data, error } = await supabase
    .from("repertoires")
    .insert(values)
    .select("id")
    .single();
  if (error)
    return { message: error.code === "23505" ? duplicate : error.message };
  refresh();
  redirect(`/admin/aberturas/${data.id}`);
}

// Grava as linhas escritas no editor. Lances que já existiam mantêm o id, então o
// progresso dos alunos nas linhas que continuam não se perde.
export async function saveRepertoireLines(
  _prev: AdminState,
  formData: FormData,
): Promise<AdminState> {
  await requireAdmin();
  const id = z.uuid().safeParse(formData.get("id"));
  const text = z.string().max(MAX_TEXT).safeParse(formData.get("lines"));
  if (!id.success) return { message: "Repertório inválido." };
  if (!text.success) return { message: "Texto grande demais." };

  const { lines, errors } = parseRepertoireText(text.data);
  if (errors.length > 0) return { message: errors.slice(0, 3).join(" ") };

  const supabase = await createClient();
  const { data: rows, error: readError } = await supabase
    .from("repertoire_nodes")
    .select("id, parent_id, uci, san, comment, position")
    .eq("repertoire_id", id.data);
  if (readError) return { message: readError.message };
  const existing: RepertoireNode[] = (rows ?? []).map((row) => ({
    id: row.id,
    parentId: row.parent_id,
    uci: row.uci,
    san: row.san,
    comment: row.comment,
    position: row.position,
  }));

  const plan = planRepertoireSync(existing, lines);

  if (plan.deletes.length > 0) {
    const { error } = await supabase
      .from("repertoire_nodes")
      .delete()
      .in("id", plan.deletes);
    if (error) return { message: error.message };
  }

  // Ids gerados aqui: pai e filhos entram no mesmo insert.
  const idByKey = new Map(plan.inserts.map((node) => [node.key, randomUUID()]));
  if (plan.inserts.length > 0) {
    const { error } = await supabase.from("repertoire_nodes").insert(
      plan.inserts.map((node) => ({
        id: idByKey.get(node.key),
        repertoire_id: id.data,
        parent_id:
          node.parentId ??
          (node.parentKey ? idByKey.get(node.parentKey) : null),
        uci: node.uci,
        san: node.san,
        comment: node.comment,
        position: node.position,
      })),
    );
    if (error) return { message: error.message };
  }

  for (const update of plan.updates) {
    const { error } = await supabase
      .from("repertoire_nodes")
      .update({ comment: update.comment, position: update.position })
      .eq("id", update.id);
    if (error) return { message: error.message };
  }

  refresh();
  return {
    success: `Linhas salvas: ${lines.length} variante(s), ${plan.inserts.length} lance(s) novo(s), ${plan.deletes.length} removido(s).`,
  };
}

export async function deleteRepertoire(
  _prev: AdminState,
  formData: FormData,
): Promise<AdminState> {
  await requireAdmin();
  const id = z.uuid().safeParse(formData.get("id"));
  if (!id.success) return { message: "Repertório inválido." };
  const supabase = await createClient();
  const { error } = await supabase
    .from("repertoires")
    .delete()
    .eq("id", id.data);
  if (error) return { message: error.message };
  refresh();
  redirect("/admin/aberturas");
}
