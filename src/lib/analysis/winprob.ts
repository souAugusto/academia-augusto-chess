// Avaliação do motor -> chance de vitória (0 a 100), do ponto de vista de quem
// a avaliação se refere. Curva logística usada pelo Lichess (pública e testada):
//   chance = 50 + 50 * (2 / (1 + e^(-0,00368208 * cp)) - 1)
// Mate conta como 100 (ou 0, se for levar mate).

export type EngineScore =
  { kind: "cp"; value: number } | { kind: "mate"; value: number };

const K = 0.00368208;
const CP_CAP = 1000; // acima disso a curva já está quase em 100

export function winChance(score: EngineScore): number {
  if (score.kind === "mate") {
    if (score.value > 0) return 100;
    if (score.value < 0) return 0;
    return 0; // mate 0: quem joga já levou mate
  }
  const cp = Math.max(-CP_CAP, Math.min(CP_CAP, score.value));
  return 50 + 50 * (2 / (1 + Math.exp(-K * cp)) - 1);
}

// Mesmo placar visto pelo outro lado.
export function flip(score: EngineScore): EngineScore {
  return { kind: score.kind, value: -score.value };
}

// Número único para ordenar avaliações (mate curto > mate longo > qualquer cp).
export function scoreValue(score: EngineScore): number {
  if (score.kind === "cp") return score.value;
  if (score.value === 0) return -100_000;
  return score.value > 0 ? 100_000 - score.value : -100_000 - score.value;
}

// "+1.2", "-0.4", "M3", "-M2"
export function formatEval(score: EngineScore): string {
  if (score.kind === "mate")
    return score.value > 0 ? `M${score.value}` : `-M${Math.abs(score.value)}`;
  const pawns = score.value / 100;
  return `${pawns > 0 ? "+" : ""}${pawns.toFixed(1)}`;
}
