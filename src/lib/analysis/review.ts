// Revisão de uma partida analisada: classificação de cada lance, precisão e
// momentos críticos. Lógica pura: recebe as avaliações já calculadas pelo motor
// (ou pela nuvem do Lichess) e não depende de navegador nem de banco.
//
// Convenção: todas as avaliações são do ponto de vista das BRANCAS.
// evals[i] é a avaliação da posição depois de i meias-jogadas (evals[0] = início).
// best[i] é o melhor lance (UCI) na posição i; played[i] é o lance jogado nela.
import { winChance, type EngineScore } from "./winprob";

export type MoveClass =
  "melhor" | "excelente" | "bom" | "imprecisao" | "erro" | "gafe";

export const CLASS_ORDER: MoveClass[] = [
  "melhor",
  "excelente",
  "bom",
  "imprecisao",
  "erro",
  "gafe",
];

export const CLASS_LABELS: Record<MoveClass, string> = {
  melhor: "Melhor lance",
  excelente: "Excelente",
  bom: "Bom",
  imprecisao: "Imprecisão",
  erro: "Erro",
  gafe: "Gafe",
};

// Perda de chance de vitória (0 a 100) a partir da qual cada classe começa.
// Imprecisão, erro e gafe seguem os limites públicos do Lichess (5, 10 e 15).
export const CLASS_THRESHOLDS = {
  excelente: 0,
  bom: 2,
  imprecisao: 5,
  erro: 10,
  gafe: 15,
} as const;

export type Color = "w" | "b";

export type ReviewedMove = {
  ply: number; // 0 = primeiro lance das brancas
  color: Color;
  played: string; // UCI
  best: string | null; // UCI do melhor lance do motor, se houver
  before: number; // chance de vitória de quem jogou, antes do lance
  after: number; // chance de vitória de quem jogou, depois do lance
  loss: number; // pontos de chance perdidos (>= 0)
  accuracy: number; // 0 a 100
  cls: MoveClass;
};

const forColor = (score: EngineScore, color: Color) =>
  color === "w" ? winChance(score) : 100 - winChance(score);

export function classify(loss: number, isBest: boolean): MoveClass {
  if (isBest) return "melhor";
  if (loss >= CLASS_THRESHOLDS.gafe) return "gafe";
  if (loss >= CLASS_THRESHOLDS.erro) return "erro";
  if (loss >= CLASS_THRESHOLDS.imprecisao) return "imprecisao";
  if (loss >= CLASS_THRESHOLDS.bom) return "bom";
  return "excelente";
}

// Precisão de um lance pela fórmula pública do Lichess (perda em 0 a 100).
export function moveAccuracy(loss: number): number {
  const raw = 103.1668 * Math.exp(-0.04354 * loss) - 3.1669;
  return Math.max(0, Math.min(100, raw));
}

export function reviewMoves(
  evals: EngineScore[],
  best: (string | null)[],
  played: string[],
): ReviewedMove[] {
  const moves: ReviewedMove[] = [];
  for (let ply = 0; ply < played.length; ply++) {
    const scoreBefore = evals[ply];
    const scoreAfter = evals[ply + 1];
    if (!scoreBefore || !scoreAfter) break;
    const color: Color = ply % 2 === 0 ? "w" : "b";
    const before = forColor(scoreBefore, color);
    const after = forColor(scoreAfter, color);
    const loss = Math.max(0, before - after);
    const isBest = best[ply] != null && best[ply] === played[ply];
    moves.push({
      ply,
      color,
      played: played[ply],
      best: best[ply] ?? null,
      before,
      after,
      loss,
      accuracy: isBest ? 100 : moveAccuracy(loss),
      cls: classify(loss, isBest),
    });
  }
  return moves;
}

// Precisão da partida de um lado: média entre a média simples e a média
// harmônica das precisões dos lances (a harmônica pesa mais os erros graves).
export function gameAccuracy(
  moves: ReviewedMove[],
  color: Color,
): number | null {
  const values = moves.filter((m) => m.color === color).map((m) => m.accuracy);
  if (values.length === 0) return null;
  const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
  const harmonic =
    values.length / values.reduce((sum, v) => sum + 1 / Math.max(v, 1), 0);
  return Math.round(((mean + harmonic) / 2) * 10) / 10;
}

export function countByClass(
  moves: ReviewedMove[],
  color: Color,
): Record<MoveClass, number> {
  const counts = Object.fromEntries(CLASS_ORDER.map((c) => [c, 0])) as Record<
    MoveClass,
    number
  >;
  for (const move of moves) if (move.color === color) counts[move.cls]++;
  return counts;
}

// Os momentos em que a partida virou: os lances com maior perda (a partir de
// uma imprecisão), em ordem de importância.
export function criticalMoments(
  moves: ReviewedMove[],
  limit = 3,
): ReviewedMove[] {
  return moves
    .filter((m) => m.loss >= CLASS_THRESHOLDS.imprecisao)
    .sort((a, b) => b.loss - a.loss)
    .slice(0, limit)
    .sort((a, b) => a.ply - b.ply);
}

// Avaliação final de uma posição sem lances (mate ou afogamento), do ponto de
// vista das brancas. sideToMove é quem estaria na vez.
export function terminalScore(
  kind: "mate" | "empate",
  sideToMove: Color,
): EngineScore {
  if (kind === "empate") return { kind: "cp", value: 0 };
  // Quem está na vez levou mate.
  return { kind: "mate", value: sideToMove === "w" ? -1 : 1 };
}
