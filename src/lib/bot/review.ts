import { moveAccuracy } from "@/lib/analysis/classify";
import { winChance, type EngineScore } from "@/lib/analysis/winprob";

// Precisão aproximada do aluno na partida contra o computador, com as
// avaliações que o motor já calcula durante o jogo (sem análise extra).

export type MoveEval = {
  before: EngineScore | null; // antes do lance, do ponto de vista do aluno
  after: EngineScore | null; // depois do lance, do ponto de vista do aluno
};

export type MoveMark = "erro-grave" | "erro" | "imprecisao" | null;

export const MARK_LABELS: Record<Exclude<MoveMark, null>, string> = {
  "erro-grave": "Erro grave",
  erro: "Erro",
  imprecisao: "Imprecisão",
};

// Perda em pontos de chance de vitória (0 a 100). null se faltou avaliação.
export function moveLoss(e: MoveEval): number | null {
  if (!e.before || !e.after) return null;
  return Math.max(0, winChance(e.before) - winChance(e.after));
}

export function markFor(loss: number | null): MoveMark {
  if (loss === null) return null;
  if (loss > 20) return "erro-grave";
  if (loss > 10) return "erro";
  if (loss > 5) return "imprecisao";
  return null;
}

// Média da precisão de cada lance avaliado (0 a 100), ou null sem dados.
export function gameAccuracy(evals: MoveEval[]): number | null {
  const values = evals
    .map(moveLoss)
    .filter((loss): loss is number => loss !== null)
    .map(moveAccuracy);
  if (values.length === 0) return null;
  return Math.round(values.reduce((sum, v) => sum + v, 0) / values.length);
}
