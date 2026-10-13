import "server-only";
import type { ResultStyle } from "@/lib/style/styles";
import { createClient } from "@/lib/supabase/server";

// Estilo de jogo do aluno logado: o atual e o histórico de questionários.
export type StyleHistoryItem = {
  id: string;
  style: ResultStyle;
  createdAt: Date;
};

export async function getMyStyleHistory(
  limit = 6,
): Promise<StyleHistoryItem[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("style_results")
    .select("id, style, created_at")
    .order("created_at", { ascending: false })
    .limit(limit);
  return (data ?? []).map((row) => ({
    id: row.id,
    style: row.style as ResultStyle,
    createdAt: new Date(row.created_at),
  }));
}
