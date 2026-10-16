import "server-only";
import { decodeAnalysis, type AnalysisData } from "@/lib/analysis/compact";
import {
  ANALYSIS_PROFILE,
  sameEngineProfile,
  type EngineProfile,
} from "@/lib/analysis/profile";
import { createClient } from "@/lib/supabase/server";

export type AnalysisSummary = {
  id: string;
  title: string;
  importedGameId: number | null;
  accuracyWhite: number | null;
  accuracyBlack: number | null;
  depth: number;
  createdAt: string;
  // Feita com outro perfil do motor: reanalisar para ver as classes novas.
  outdated: boolean;
  // Mesmo motor, regras de classificação antigas (o resumo é refeito sozinho).
  algoOutdated: boolean;
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
  engine_profile: unknown;
  algo_version: number;
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
  outdated: !sameEngineProfile(row.engine_profile as EngineProfile),
  algoOutdated: row.algo_version !== ANALYSIS_PROFILE.algoVersion,
});

// Todas as consultas filtram pelo dono: cada aluno vê só as próprias análises
// (a RLS também garante isso; o filtro aqui é uma segunda proteção).

// Análises do aluno logado.
export async function listAnalyses(
  userId: string,
  limit = 50,
): Promise<AnalysisSummary[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("game_analyses")
    .select(
      "id, title, imported_game_id, accuracy_white, accuracy_black, depth, created_at, engine_profile, algo_version",
    )
    .eq("user_id", userId)
    .order("updated_at", { ascending: false })
    .limit(limit);
  return ((data ?? []) as Row[]).map(toSummary);
}

export async function getAnalysis(
  userId: string,
  id: string,
): Promise<SavedAnalysis | null> {
  if (!/^[0-9a-f-]{36}$/.test(id)) return null;
  const supabase = await createClient();
  const { data: row } = await supabase
    .from("game_analyses")
    .select(
      "id, title, imported_game_id, accuracy_white, accuracy_black, depth, created_at, engine_profile, algo_version, headers, data",
    )
    .eq("id", id)
    .eq("user_id", userId)
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
export async function analysedGameIds(
  userId: string,
): Promise<Map<number, string>> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("game_analyses")
    .select("id, imported_game_id")
    .eq("user_id", userId)
    .not("imported_game_id", "is", null);
  return new Map(
    (data ?? []).map((row) => [
      row.imported_game_id as number,
      row.id as string,
    ]),
  );
}
