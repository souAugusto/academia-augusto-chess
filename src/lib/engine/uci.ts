// Leitura das mensagens do Stockfish (protocolo UCI) e conversão de avaliações.

export type Score =
  { kind: "cp"; value: number } | { kind: "mate"; value: number };

export type InfoLine = { depth: number; score: Score; pv: string[] };

// "info depth 18 ... score cp -34 ... pv e2e4 e7e5" -> { depth, score, pv }
export function parseInfo(line: string): InfoLine | null {
  if (!line.startsWith("info ")) return null;
  const score = /\bscore (cp|mate) (-?\d+)/.exec(line);
  const depth = /\bdepth (\d+)/.exec(line);
  if (!score || !depth || /\b(lowerbound|upperbound)\b/.test(line)) return null;
  const pv = /\bpv (.+)$/.exec(line);
  return {
    depth: Number(depth[1]),
    score: { kind: score[1] as Score["kind"], value: Number(score[2]) },
    pv: pv ? pv[1].trim().split(/\s+/) : [],
  };
}

// "bestmove e2e4 ponder e7e5" -> "e2e4"; "bestmove (none)" -> null
export function parseBestMove(line: string): string | null | undefined {
  const match = /^bestmove (\S+)/.exec(line);
  if (!match) return undefined;
  return match[1] === "(none)" ? null : match[1];
}

// O Stockfish avalia do ponto de vista de quem joga. Converte para outro lado.
export function scoreFor(
  score: Score,
  sideToMove: "w" | "b",
  perspective: "w" | "b",
): Score {
  return sideToMove === perspective
    ? score
    : { kind: score.kind, value: -score.value };
}

const MATE_CP = 10_000;

// Número único para comparar: mate vira um valor enorme (mate mais curto = maior).
export function scoreToCp(score: Score): number {
  if (score.kind === "cp") return score.value;
  if (score.value === 0) return -MATE_CP; // quem joga está levando mate
  return score.value > 0 ? MATE_CP - score.value : -MATE_CP - score.value;
}

// Texto curto para a barra de avaliação: "+1.2", "-0.4", "M3", "-M2".
export function formatScore(score: Score): string {
  if (score.kind === "mate")
    return score.value >= 0 ? `M${score.value}` : `-M${-score.value}`;
  const pawns = score.value / 100;
  return `${pawns > 0 ? "+" : ""}${pawns.toFixed(1)}`;
}
