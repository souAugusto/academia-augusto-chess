"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import {
  getMyNotifications,
  type NotificationFeed,
} from "@/lib/data/notifications";
import { createClient } from "@/lib/supabase/server";

async function currentUserId(): Promise<string | null> {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  return (data?.claims.sub as string | undefined) ?? null;
}

// Usado pelo sino a cada minuto (só com a aba visível): contador e últimas 10.
export async function getNotificationFeed(): Promise<NotificationFeed | null> {
  const userId = await currentUserId();
  if (!userId) return null;
  return getMyNotifications(userId, 10);
}

// Marca como lida. O RLS só aceita a leitura do próprio aluno e de uma
// notificação que ele pode ver; repetir não dá erro.
export async function markNotificationRead(id: string): Promise<{ ok: boolean }> {
  if (!z.uuid().safeParse(id).success) return { ok: false };
  const userId = await currentUserId();
  if (!userId) return { ok: false };
  const supabase = await createClient();
  const { error } = await supabase
    .from("notification_reads")
    .upsert(
      { notification_id: id, user_id: userId },
      { onConflict: "notification_id,user_id", ignoreDuplicates: true },
    );
  revalidatePath("/notificacoes");
  return { ok: !error };
}

export async function markAllNotificationsRead(): Promise<{ ok: boolean }> {
  const userId = await currentUserId();
  if (!userId) return { ok: false };
  const feed = await getMyNotifications(userId, 100);
  const unread = feed.items.filter((item) => !item.read);
  if (unread.length === 0) return { ok: true };
  const supabase = await createClient();
  const { error } = await supabase.from("notification_reads").upsert(
    unread.map((item) => ({ notification_id: item.id, user_id: userId })),
    { onConflict: "notification_id,user_id", ignoreDuplicates: true },
  );
  revalidatePath("/notificacoes");
  return { ok: !error };
}

// Versões para <form action> (página de histórico, funciona sem JavaScript).
export async function markReadForm(formData: FormData): Promise<void> {
  const id = formData.get("id");
  if (typeof id === "string") await markNotificationRead(id);
}

export async function markAllReadForm(): Promise<void> {
  await markAllNotificationsRead();
}
