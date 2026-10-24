import type { BotStyle, EngineParams } from "./types";

// Escolha do lance do personagem (lógica pura, testável).

export type Rng = () => number; // 0 <= x < 1

// Um lance candidato, com a avaliação do motor do ponto de vista do personagem
// (centipeões; mate já convertido) e o que o lance faz, para o estilo.
export type Candidate = {
  move: string; // UCI
  cp: number;
  capture?: boolean;
  check?: boolean;
  castle?: boolean;
  pawn?: boolean; // lance de peão
  quiet?: boolean; // sem captura e sem xeque
  trade?: boolean; // captura de peça de mesmo valor (troca)
};

// Bônus (em centipeões) que cada estilo dá a um lance, só para desempatar
// entre lances parecidos (dentro de styleWindowCp do melhor).
export function styleBonus(style: BotStyle, c: Candidate): number {
  switch (style) {
    case "agressivo":
      return (c.capture ? 25 : 0) + (c.check ? 30 : 0);
    case "tatico":
      return (c.check ? 25 : 0) + (c.capture ? 15 : 0);
    case "defensivo":
      return (c.castle ? 40 : 0) + (c.quiet ? 15 : 0) - (c.check ? 10 : 0);
    case "posicional":
      return (c.castle ? 30 : 0) + (c.quiet && c.pawn ? 15 : 0) + (c.trade ? 10 : 0);
  }
}

// Sorteio com pesos. Devolve o índice escolhido.
export function weightedIndex(weights: number[], rng: Rng): number {
  const total = weights.reduce((sum, w) => sum + Math.max(0, w), 0);
  if (total <= 0) return 0;
  let roll = rng() * total;
  for (let i = 0; i < weights.length; i += 1) {
    roll -= Math.max(0, weights[i]);
    if (roll < 0) return i;
  }
  return weights.length - 1;
}

export type Choice = { move: string; reason: "melhor" | "estilo" | "erro" | "aleatorio" };

// Escolhe o lance no modo "multipv".
// 1. Às vezes (randomChance) joga um lance legal qualquer: os tropeços dos
//    níveis iniciais.
// 2. Entre os candidatos parecidos com o melhor, o estilo decide.
// 3. Às vezes (mistakeChance) joga o 2º, 3º... candidato, com chance menor
//    para os piores, sem passar de maxLossCp de prejuízo.
export function chooseMove(
  candidates: Candidate[],
  params: Extract<EngineParams, { mode: "multipv" }>,
  style: BotStyle,
  rng: Rng,
  legalMoves: string[] = [],
): Choice | null {
  if (candidates.length === 0)
    return legalMoves.length > 0
      ? { move: legalMoves[Math.floor(rng() * legalMoves.length)], reason: "aleatorio" }
      : null;

  if (legalMoves.length > 1 && rng() < params.randomChance) {
    return {
      move: legalMoves[Math.floor(rng() * legalMoves.length)],
      reason: "aleatorio",
    };
  }

  const sorted = [...candidates].sort((a, b) => b.cp - a.cp);
  const best = sorted[0].cp;
  const ranked = sorted
    .map((c) => ({
      c,
      score:
        best - c.cp <= params.styleWindowCp ? c.cp + styleBonus(style, c) : c.cp,
    }))
    .sort((a, b) => b.score - a.score)
    .map(({ c }) => c);

  const others = ranked.slice(1).filter((c) => best - c.cp <= params.maxLossCp);
  if (others.length > 0 && rng() < params.mistakeChance) {
    const weights = others.map((_, i) => params.mistakeWeights[i] ?? 0);
    if (weights.some((w) => w > 0))
      return { move: others[weightedIndex(weights, rng)].move, reason: "erro" };
  }

  const top = ranked[0];
  return { move: top.move, reason: top === sorted[0] ? "melhor" : "estilo" };
}

// Próximo lance de uma abertura preferida, se a partida segue o começo dela.
// `history` são os lances já jogados (SAN). Sorteia entre as linhas que servem.
export function bookMove(
  lines: string[][] | undefined,
  history: string[],
  rng: Rng,
): string | null {
  if (!lines) return null;
  const options = lines
    .filter(
      (line) =>
        line.length > history.length &&
        history.every((san, i) => line[i] === san),
    )
    .map((line) => line[history.length]);
  const unique = [...new Set(options)];
  if (unique.length === 0) return null;
  return unique[Math.floor(rng() * unique.length)];
}

// Gerador previsível (para testes e para repetir partidas).
export function seededRng(seed: number): Rng {
  let state = seed >>> 0 || 1;
  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return (state >>> 0) / 4294967296;
  };
}
