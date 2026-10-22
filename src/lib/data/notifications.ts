import "server-only";
import { createClient } from "@/lib/supabase/server";

export type NotificationItem = {
  id: string;
  title: string;
  body: string;
  kind: "info" | "aviso" | "novidade";
  link: string | null;
  createdAt: string;
  read: boolean;
};

export type NotificationFeed = { unread: number; items: NotificationItem[] };

type Row = {
  id: string;
  title: string;
  body: string;
  kind: NotificationItem["kind"];
  link: string | null;
  created_at: string;
};

// Notificações do aluno logado, mais recentes primeiro. O RLS só devolve as
// que são para ele (público, plano, validade); aqui só se marca o que já leu.
export async function getMyNotifications(
  userId: string,
  limit = 20,
): Promise<NotificationFeed> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("notifications")
    .select("id, title, body, kind, link, created_at")
    .order("created_at", { ascending: false })
    .limit(Math.max(limit, 100));
  const rows = (data ?? []) as Row[];
  if (rows.length === 0) return { unread: 0, items: [] };
  const { data: reads } = await supabase
    .from("notification_reads")
    .select("notification_id")
    .eq("user_id", userId)
    .in(
      "notification_id",
      rows.map((row) => row.id),
    );
  const read = new Set((reads ?? []).map((r) => r.notification_id as string));
  const items = rows.map((row) => ({
    id: row.id,
    title: row.title,
    body: row.body,
    kind: row.kind,
    link: row.link,
    createdAt: row.created_at,
    read: read.has(row.id),
  }));
  return {
    unread: items.filter((item) => !item.read).length,
    items: items.slice(0, limit),
  };
}
