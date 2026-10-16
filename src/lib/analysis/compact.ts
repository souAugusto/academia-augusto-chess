// Formato compacto para guardar uma análise no banco (coluna jsonb) e no
// IndexedDB. Uma partida de 80 lances fica com poucos kilobytes.
//
// Versão 2 (perfil fixo, src/lib/analysis/profile.ts):
//   { v: 2, d: 16, m: "e2e4 e7e5 ...", e: [20, 31, ...], b: "e2e4 ...",
//     p: "e2e4 e7e5 g1f3|e7e5 ...", x: { "23": [["f3h7", 120, "f3h7 g8h7 ..."], ...] } }
// e: avaliação de cada posição (ponto de vista das brancas) em centipeões;
//    mate vira ±(100000 - n) para caber num número só.
// b: melhor lance em cada posição ("-" quando não há).
// p: linha principal da passagem 1 em cada posição (separadas por "|").
// x: passagem 2 (várias linhas) nas posições candidatas.
//
// A versão 1 (análises antigas, com seletor de profundidade) continua sendo
// lida, sem linhas: a tela mostra e oferece reanalisar.
import type { DeepLine } from "./classify";
import type { EngineScore } from "./winprob";

export const MAX_PV = 8;

export type AnalysisData = {
  version: 1 | 2;
  depth: number;
  moves: string[];
  evals: EngineScore[];
  best: (string | null)[];
  pv: string[][];
  deep: Record<number, DeepLine[]>;
};

export type StoredAnalysis = {
  v: 2;
  d: number;
  m: string;
  e: number[];
  b: string;
  p: string;
  x: Record<string, [string, number, string][]>;
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

const UCI = /^[a-h][1-8][a-h][1-8][qrbn]?$/;
const splitMoves = (text: string) =>
  text ? text.split(" ").filter((m) => UCI.test(m)) : [];

export function encodeAnalysis(data: AnalysisData): StoredAnalysis {
  return {
    v: 2,
    d: data.depth,
    m: data.moves.join(" "),
    e: data.evals.map(encodeScore),
    b: data.best.map((move) => move ?? "-").join(" "),
    p: data.pv.map((line) => line.slice(0, MAX_PV).join(" ")).join("|"),
    x: Object.fromEntries(
      Object.entries(data.deep).map(([ply, lines]) => [
        ply,
        lines.map((line): [string, number, string] => [
          line.move,
          encodeScore(line.score),
          line.pv.slice(0, MAX_PV).join(" "),
        ]),
      ]),
    ),
  };
}

export function decodeAnalysis(stored: unknown): AnalysisData | null {
  if (!stored || typeof stored !== "object") return null;
  const s = stored as Record<string, unknown>;
  if (
    (s.v !== 1 && s.v !== 2) ||
    typeof s.d !== "number" ||
    typeof s.m !== "string" ||
    !Array.isArray(s.e) ||
    typeof s.b !== "string" ||
    s.e.some((value) => typeof value !== "number")
  )
    return null;
  const moves = splitMoves(s.m);
  const best = s.b
    ? s.b.split(" ").map((m) => (m === "-" ? null : m))
    : [];
  const evals = (s.e as number[]).map(decodeScore);
  if (s.v === 1)
    return { version: 1, depth: s.d, moves, evals, best, pv: [], deep: {} };

  if (typeof s.p !== "string" || !s.x || typeof s.x !== "object") return null;
  const pv = s.p.split("|").map(splitMoves);
  const deep: Record<number, DeepLine[]> = {};
  for (const [ply, lines] of Object.entries(s.x as Record<string, unknown>)) {
    const index = Number(ply);
    if (!Number.isInteger(index) || index < 0 || !Array.isArray(lines)) return null;
    const parsed: DeepLine[] = [];
    for (const line of lines.slice(0, 5)) {
      if (
        !Array.isArray(line) ||
        typeof line[0] !== "string" ||
        !UCI.test(line[0]) ||
        typeof line[1] !== "number" ||
        typeof line[2] !== "string"
      )
        return null;
      parsed.push({ move: line[0], score: decodeScore(line[1]), pv: splitMoves(line[2]) });
    }
    deep[index] = parsed;
  }
  return { version: 2, depth: s.d, moves, evals, best, pv, deep };
}
