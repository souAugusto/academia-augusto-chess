// Fontes de avaliação além do motor local, todas gratuitas:
// - nuvem do Lichess (posições muito jogadas, normalmente as primeiras);
// - análise que o Lichess já fez de uma partida importada de lá.
// As duas APIs devolvem avaliações do ponto de vista das BRANCAS.
import type { EngineScore } from "./winprob";

export const CLOUD_EVAL_URL = "https://lichess.org/api/cloud-eval";
// A nuvem cobre bem as primeiras jogadas; depois quase nunca tem a posição.
export const CLOUD_MAX_PLIES = 24;

export type CloudEval = {
  score: EngineScore;
  best: string | null;
  depth: number;
};

type CloudPv = { moves?: string; cp?: number; mate?: number };

export function parseCloudEval(json: unknown): CloudEval | null {
  if (!json || typeof json !== "object") return null;
  const data = json as { depth?: number; pvs?: CloudPv[] };
  const pv = data.pvs?.[0];
  if (!pv || typeof data.depth !== "number") return null;
  const score: EngineScore | null =
    typeof pv.mate === "number"
      ? { kind: "mate", value: pv.mate }
      : typeof pv.cp === "number"
        ? { kind: "cp", value: pv.cp }
        : null;
  if (!score) return null;
  const best = pv.moves?.split(" ")[0] ?? null;
  return { score, best: best || null, depth: data.depth };
}

export function cloudEvalUrl(fen: string): string {
  return `${CLOUD_EVAL_URL}?fen=${encodeURIComponent(fen)}&multiPv=1`;
}

// Análise do Lichess no export de partida (JSON com evals=true):
// analysis[i] é a avaliação da posição DEPOIS do lance i (0 = depois do 1º lance).
type LichessAnalysisEntry = { eval?: number; mate?: number; best?: string };

export function parseLichessAnalysis(
  analysis: unknown,
  plies: number,
): (EngineScore | null)[] | null {
  if (!Array.isArray(analysis) || analysis.length === 0) return null;
  const evals: (EngineScore | null)[] = [];
  for (let i = 0; i < plies; i++) {
    const entry = analysis[i] as LichessAnalysisEntry | undefined;
    if (!entry) {
      evals.push(null);
      continue;
    }
    if (typeof entry.mate === "number")
      evals.push({ kind: "mate", value: entry.mate });
    else if (typeof entry.eval === "number")
      evals.push({ kind: "cp", value: entry.eval });
    else evals.push(null);
  }
  return evals;
}
