import "server-only";
import { decodeAnalysis, type AnalysisData } from "@/lib/analysis/compact";
import { createClient } from "@/lib/supabase/server";

export type AnalysisSummary = {
  id: string;
  title: string;
  importedGameId: number | null;
  accuracyWhite: number | null;
  accuracyBlack: number | null;
  depth: number;
  createdAt: string;
};

export type SavedAnalysis = AnalysisSummary & {
  headers: Record<string, string>;
  data: AnalysisData;
};

type Row = {
  id: string;
  title: string;
  imported_game_id: number | null;
  accuracy_white: number | string | null;
  accuracy_black: number | string | null;
  depth: number;
  created_at: string;
};

const toNumber = (value: number | string | null) =>
  value === null ? null : Number(value);

const toSummary = (row: Row): AnalysisSummary => ({
  id: row.id,
  title: row.title,
  importedGameId: row.imported_game_id,
  accuracyWhite: toNumber(row.accuracy_white),
  accuracyBlack: toNumber(row.accuracy_black),
  depth: row.depth,
  createdAt: row.created_at,
});

// Análises do aluno logado (a RLS garante que só vêm as dele).
export async function listAnalyses(limit = 50): Promise<AnalysisSummary[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("game_analyses")
    .select(
      "id, title, imported_game_id, accuracy_white, accuracy_black, depth, created_at",
    )
    .order("created_at", { ascending: false })
    .limit(limit);
  return ((data ?? []) as Row[]).map(toSummary);
}

export async function getAnalysis(id: string): Promise<SavedAnalysis | null> {
  if (!/^[0-9a-f-]{36}$/.test(id)) return null;
  const supabase = await createClient();
  const { data: row } = await supabase
    .from("game_analyses")
    .select(
      "id, title, imported_game_id, accuracy_white, accuracy_black, depth, created_at, headers, data",
    )
    .eq("id", id)
    .maybeSingle();
  if (!row) return null;
  const data = decodeAnalysis(row.data);
  if (!data) return null;
  return {
    ...toSummary(row as Row),
    headers: (row.headers ?? {}) as Record<string, string>,
    data,
  };
}

// Mapa partida importada -> análise salva (para o botão "Ver análise").
export async function analysedGameIds(): Promise<Map<number, string>> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("game_analyses")
    .select("id, imported_game_id")
    .not("imported_game_id", "is", null);
  return new Map(
    (data ?? []).map((row) => [
      row.imported_game_id as number,
      row.id as string,
    ]),
  );
}
