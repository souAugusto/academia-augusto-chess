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
import { createClient } from "@/lib/supabase/server";
import {
  endOfDaySaoPaulo,
  notificationSchema,
} from "@/lib/validation/notifications";

const FIELDS = [
  "title",
  "body",
  "kind",
  "link",
  "audience",
  "targetEmail",
  "expiresOn",
] as const;

// Acha o aluno pelo e-mail (mesma busca da página de alunos).
async function userIdByEmail(email: string): Promise<string | null> {
  const admin = createAdminClient();
  const { data } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
  return data?.users.find((u) => u.email?.toLowerCase() === email)?.id ?? null;
}

async function rowFrom(formData: FormData) {
  const parsed = notificationSchema.safeParse(
    formObject(formData, FIELDS as unknown as string[]),
  );
  if (!parsed.success) return { error: zodMessage(parsed.error) } as const;
  const value = parsed.data;
  let target: string | null = null;
  if (value.audience === "usuario") {
    target = await userIdByEmail(value.targetEmail);
    if (!target) return { error: "Nenhum aluno com esse e-mail." } as const;
  }
  return {
    row: {
      title: value.title,
      body: value.body,
      kind: value.kind,
      link: value.link,
      audience: value.audience,
      target_user: target,
      expires_at: value.expiresOn ? endOfDaySaoPaulo(value.expiresOn) : null,
    },
  } as const;
}

// Escritas pela sessão do admin: o RLS também exige is_admin().
export async function createNotification(
  _prev: AdminState,
  formData: FormData,
): Promise<AdminState> {
  const admin = await requireAdmin();
  const result = await rowFrom(formData);
  if ("error" in result) return { message: result.error };
  const supabase = await createClient();
  const { error } = await supabase
    .from("notifications")
    .insert({ ...result.row, created_by: admin.id });
  if (error) return { message: "Não foi possível enviar a notificação." };
  revalidatePath("/admin/notificacoes");
  return { success: "Notificação enviada." };
}

export async function updateNotification(
  _prev: AdminState,
  formData: FormData,
): Promise<AdminState> {
  await requireAdmin();
  const id = z.uuid().safeParse(formData.get("id"));
  if (!id.success) return { message: "Notificação inválida." };
  const result = await rowFrom(formData);
  if ("error" in result) return { message: result.error };
  const supabase = await createClient();
  const { error } = await supabase
    .from("notifications")
    .update({ ...result.row, updated_at: new Date().toISOString() })
    .eq("id", id.data);
  if (error) return { message: "Não foi possível salvar." };
  revalidatePath("/admin/notificacoes");
  return { success: "Notificação atualizada." };
}

export async function deleteNotification(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = z.uuid().safeParse(formData.get("id"));
  if (!id.success) return;
  const supabase = await createClient();
  await supabase.from("notifications").delete().eq("id", id.data);
  revalidatePath("/admin/notificacoes");
}
