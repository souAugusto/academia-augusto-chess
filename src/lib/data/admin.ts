import "server-only";
import { notFound } from "next/navigation";
import { requireUser, type CurrentUser } from "@/lib/data/account";
import { createClient } from "@/lib/supabase/server";

// Só quem está na tabela admins. Para os outros, o painel nem existe (404).
// Toda action do admin chama isto de novo: o layout sozinho não protege actions.
export async function requireAdmin(path = "/admin"): Promise<CurrentUser> {
  const user = await requireUser(path);
  const supabase = await createClient();
  const { data: isAdmin } = await supabase.rpc("is_admin");
  if (!isAdmin) notFound();
  return user;
}

export type AdminState = { message?: string; success?: string };

export function zodMessage(error: { issues: { message: string }[] }): string {
  return error.issues[0]?.message ?? "Confira os campos.";
}

export function formText(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

export function formObject(
  formData: FormData,
  keys: readonly string[],
): Record<string, string | undefined> {
  return Object.fromEntries(
    keys.map((key) => {
      const value = formData.get(key);
      return [key, typeof value === "string" ? value : undefined];
    }),
  );
}
