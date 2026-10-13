// Formato compacto para guardar uma análise no banco (coluna jsonb).
// Uma partida de 80 lances fica com poucos kilobytes:
//   { v: 1, d: profundidade, m: "e2e4 e7e5 ...", e: [20, 31, ...], b: "e2e4 ...", s: "nnfb..." }
// e: avaliações (ponto de vista das brancas) em centipeões; mate vira
//    ±(100000 - n) para caber num número só.
// b: melhor lance em cada posição ("-" quando não há).
// s: origem de cada avaliação: "n" nuvem do Lichess, "m" motor local, "l" análise do Lichess.
import type { EngineScore } from "./winprob";

export type EvalSource = "n" | "m" | "l";

export type StoredAnalysis = {
  v: 1;
  d: number;
  m: string;
  e: number[];
  b: string;
  s: string;
};

export type AnalysisData = {
  depth: number;
  moves: string[];
  evals: EngineScore[];
  best: (string | null)[];
  sources: EvalSource[];
};

const MATE_BASE = 100_000;

export function encodeScore(score: EngineScore): number {
  // Centipeões ficam bem abaixo da faixa reservada aos mates.
  if (score.kind === "cp")
    return Math.max(-90_000, Math.min(90_000, score.value));
  // Mate 0 (quem joga já levou mate) vira o pior valor possível.
  const sign = score.value > 0 ? 1 : -1;
  return sign * (MATE_BASE - Math.abs(score.value));
}

export function decodeScore(value: number): EngineScore {
  if (Math.abs(value) < MATE_BASE - 1000) return { kind: "cp", value };
  const sign = value > 0 ? 1 : -1;
  return { kind: "mate", value: sign * (MATE_BASE - Math.abs(value)) };
}

export function encodeAnalysis(data: AnalysisData): StoredAnalysis {
  return {
    v: 1,
    d: data.depth,
    m: data.moves.join(" "),
    e: data.evals.map(encodeScore),
    b: data.best.map((move) => move ?? "-").join(" "),
    s: data.sources.join(""),
  };
}

export function decodeAnalysis(stored: unknown): AnalysisData | null {
  if (!stored || typeof stored !== "object") return null;
  const s = stored as Partial<StoredAnalysis>;
  if (
    s.v !== 1 ||
    typeof s.d !== "number" ||
    typeof s.m !== "string" ||
    !Array.isArray(s.e) ||
    typeof s.b !== "string" ||
    typeof s.s !== "string"
  )
    return null;
  const moves = s.m ? s.m.split(" ") : [];
  const best = s.b ? s.b.split(" ").map((m) => (m === "-" ? null : m)) : [];
  if (s.e.some((value) => typeof value !== "number")) return null;
  return {
    depth: s.d,
    moves,
    evals: s.e.map(decodeScore),
    best,
    sources: s.s.split("") as EvalSource[],
  };
}
