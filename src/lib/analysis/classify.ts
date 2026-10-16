// Revisão de uma partida analisada: classe de cada lance, precisão e momentos
// importantes. Lógica pura: recebe as avaliações já calculadas pelo motor e não
// depende de navegador nem de banco.
//
// Convenções:
// - Avaliações (evals, linhas) são do ponto de vista das BRANCAS.
// - evals[i] é a avaliação da posição depois de i meias-jogadas (0 = início),
//   já pela melhor linha do motor. O lance moves[i] é jogado na posição i.
// - Chance de vitória (win%) vai de 0 a 100 e, aqui, é sempre convertida para o
//   ponto de vista de quem jogou o lance.
import { Chess } from "chess.js";
import {
  isRecapture,
  materialOf,
  playUci,
  sacrificeInLine,
  type Color,
  type Sacrifice,
} from "./material";
import { flip, winChance, type EngineScore } from "./winprob";

export type { Color } from "./material";

export type MoveClass =
  | "brilhante"
  | "otimo"
  | "melhor"
  | "excelente"
  | "bom"
  | "teoria"
  | "imprecisao"
  | "erro"
  | "chance_perdida"
  | "erro_grave";

// Ordem da tabela de contagem.
export const CLASS_ORDER: MoveClass[] = [
  "brilhante",
  "otimo",
  "melhor",
  "excelente",
  "bom",
  "teoria",
  "imprecisao",
  "erro",
  "chance_perdida",
  "erro_grave",
];

export const CLASS_LABELS: Record<MoveClass, string> = {
  brilhante: "Brilhante",
  otimo: "Ótimo",
  melhor: "Melhor",
  excelente: "Excelente",
  bom: "Bom",
  teoria: "Teoria",
  imprecisao: "Imprecisão",
  erro: "Erro",
  chance_perdida: "Chance perdida",
  erro_grave: "Erro grave",
};

// Gravidade, para "a classe que for pior" (maior = pior).
const SEVERITY: Record<MoveClass, number> = {
  brilhante: 0,
  otimo: 0,
  melhor: 1,
  teoria: 1,
  excelente: 2,
  bom: 3,
  imprecisao: 4,
  erro: 5,
  chance_perdida: 6,
  erro_grave: 7,
};

const worse = (a: MoveClass, b: MoveClass) =>
  SEVERITY[a] >= SEVERITY[b] ? a : b;

// Limiares versionados (perda Δ em pontos de win%, de 0 a 100). Mudou algum
// valor: suba ANALYSIS_PROFILE.algoVersion.
export const CLASSIFY_CONFIG = {
  excellent: 2,
  good: 5,
  inaccuracy: 10,
  mistake: 20,
  brilliant: {
    maxLoss: 2,
    // Sacrifício de peça menor ou mais: a peça entregue vale 3 ou mais e, no
    // fim da linha, quem jogou está pelo menos 2 pontos abaixo (bispo por peão
    // já conta). Qualidade (torre por peça menor) não conta.
    sacrifice: { minPiece: 3, minNet: 2, allowExchange: false },
    plies: 6,
    minAfter: 50,
    maxBefore: 90,
    alternativeMargin: 5, // 2ª linha com sacrifício e win% parecida: não é brilhante
    maxPerPlayer: 2,
    minMaterialWithoutQueens: 8,
  },
  great: {
    onlyMoveGap: 15,
    lostMax: 35,
    equalMin: 45,
    equalMax: 55,
    winningMin: 70,
  },
  missed: { opponentMinLoss: 10, winningMin: 70, afterMax: 60 },
  critical: { minLoss: 5, count: 3 },
} as const;

export type DeepLine = { move: string; score: EngineScore; pv: string[] };

export type GameInput = {
  fens: string[];
  moves: string[];
  evals: EngineScore[];
  best: (string | null)[];
  pv: string[][]; // linha principal da passagem 1 em cada posição
  deep: Record<number, DeepLine[]>; // passagem 2 (só algumas posições)
  bookPlies: number; // quantos lances do começo estão na teoria
};

export type ReviewedMove = {
  ply: number;
  color: Color;
  played: string;
  best: string | null;
  before: number; // win% de quem jogou pela melhor linha, antes do lance
  after: number; // win% de quem jogou, depois do lance
  loss: number; // Δ (0 se jogou o melhor lance)
  accuracy: number;
  cls: MoveClass;
  sacrifice: Sacrifice | null; // só quando é brilhante
  onlyMoveGap: number | null; // ótimo por lance único
  allowedMate: number | null; // permitiu mate em N
  missedMate: number | null; // tinha mate em N e deixou escapar
  impact: number; // para escolher os brilhantes mais fortes
};

export const winFor = (score: EngineScore, color: Color) =>
  color === "w" ? winChance(score) : 100 - winChance(score);

const moverScore = (score: EngineScore, color: Color) =>
  color === "w" ? score : flip(score);

// Precisão de um lance (fórmula aberta do Lichess, perda em pontos de 0 a 100).
export function moveAccuracy(loss: number): number {
  const raw = 103.1668 * Math.exp(-0.04354 * loss) - 3.1669;
  return Math.max(0, Math.min(100, raw));
}

export function classByLoss(loss: number, isBest: boolean): MoveClass {
  const c = CLASSIFY_CONFIG;
  if (loss > c.mistake) return "erro_grave";
  if (isBest) return "melhor";
  if (loss <= c.excellent) return "excelente";
  if (loss <= c.good) return "bom";
  if (loss <= c.inaccuracy) return "imprecisao";
  return "erro";
}

function legalCount(fen: string): number {
  try {
    return new Chess(fen).moves().length;
  } catch {
    return 0;
  }
}

function givesMate(fen: string, uci: string): boolean {
  const chess = new Chess(fen);
  return !!playUci(chess, uci) && chess.isCheckmate();
}

function wasCapture(fen: string, uci: string): boolean {
  const chess = new Chess(fen);
  return !!playUci(chess, uci)?.captured;
}

// Perda Δ de cada lance já avaliado (antes e depois conhecidos).
function lossAt(input: GameInput, ply: number): number | null {
  const before = input.evals[ply];
  const after = input.evals[ply + 1];
  if (!before || !after) return null;
  const color: Color = ply % 2 === 0 ? "w" : "b";
  if (
    (input.best[ply] && input.best[ply] === input.moves[ply]) ||
    givesMate(input.fens[ply], input.moves[ply])
  )
    return 0;
  return Math.max(0, winFor(before, color) - winFor(after, color));
}

const sacrificeRules = () => CLASSIFY_CONFIG.brilliant.sacrifice;

// Sacrifício pela linha do motor depois do lance ou, se o motor recusa a
// oferta, pelo que aconteceu na partida (o adversário aceitou).
function sacrificeOf(input: GameInput, ply: number): Sacrifice | null {
  const fen = input.fens[ply];
  const played = input.moves[ply];
  const plies = CLASSIFY_CONFIG.brilliant.plies;
  return (
    sacrificeInLine(
      fen,
      [played, ...(input.pv[ply + 1] ?? [])],
      sacrificeRules(),
      plies,
    ) ??
    sacrificeInLine(
      fen,
      input.moves.slice(ply, ply + 1 + plies),
      sacrificeRules(),
      plies,
    )
  );
}

// ---------------------------------------------------------------- passagem 2
// Posições que valem uma segunda análise com várias linhas: o lance jogado foi
// o melhor ou quase (Δ ≤ 2) e há sinal de sacrifício, de virada depois de um
// erro do adversário ou de posição forçada (xeque ou captura logo antes).
// Ordem: sacrifício > virada > posição forçada; empate pelo lance mais cedo.
export function deepCandidates(input: GameInput, limit: number): number[] {
  const scored: { ply: number; priority: number }[] = [];
  for (let ply = input.bookPlies; ply < input.moves.length; ply++) {
    const loss = lossAt(input, ply);
    if (loss === null || loss > CLASSIFY_CONFIG.brilliant.maxLoss) continue;
    const fen = input.fens[ply];
    if (legalCount(fen) <= 1) continue;
    const played = input.moves[ply];
    const isBest = input.best[ply] === played;
    let priority = 0;
    if (sacrificeOf(input, ply)) priority = 3;
    else if (isBest && ply > 0) {
      const opponentLoss = lossAt(input, ply - 1);
      if (opponentLoss !== null && opponentLoss >= CLASSIFY_CONFIG.missed.opponentMinLoss)
        priority = 2;
      else {
        const chess = new Chess(fen);
        if (chess.inCheck() || wasCapture(input.fens[ply - 1], input.moves[ply - 1]))
          priority = 1;
      }
    }
    if (priority > 0) scored.push({ ply, priority });
  }
  return scored
    .sort((a, b) => b.priority - a.priority || a.ply - b.ply)
    .slice(0, limit)
    .map((item) => item.ply)
    .sort((a, b) => a - b);
}

// ------------------------------------------------------------------ revisão
export function classifyGame(input: GameInput): ReviewedMove[] {
  const c = CLASSIFY_CONFIG;
  const moves: ReviewedMove[] = [];
  for (let ply = 0; ply < input.moves.length; ply++) {
    const scoreBefore = input.evals[ply];
    const scoreAfter = input.evals[ply + 1];
    if (!scoreBefore || !scoreAfter) break;
    const color: Color = ply % 2 === 0 ? "w" : "b";
    const played = input.moves[ply];
    const best = input.best[ply] ?? null;
    const fen = input.fens[ply];
    // Xeque-mate conta como melhor lance, mesmo que o motor tenha escolhido
    // outro mate.
    const isBest = (best !== null && best === played) || givesMate(fen, played);
    const before = winFor(scoreBefore, color);
    const after = winFor(scoreAfter, color);
    const loss = isBest ? 0 : Math.max(0, before - after);
    const accuracy = isBest ? 100 : moveAccuracy(loss);
    const deep = input.deep[ply] ?? null;
    const alternative = deep?.find((line) => line.move !== played) ?? null;

    let cls: MoveClass = classByLoss(loss, isBest);
    let sacrifice: Sacrifice | null = null;
    let onlyMoveGap: number | null = null;
    let impact = 0;

    // Mate permitido / mate perdido.
    const mb = moverScore(scoreBefore, color);
    const ma = moverScore(scoreAfter, color);
    const allowedMate =
      ma.kind === "mate" && ma.value < 0 && !(mb.kind === "mate" && mb.value < 0)
        ? Math.abs(ma.value)
        : null;
    const missedMate =
      mb.kind === "mate" && mb.value > 0 && !(ma.kind === "mate" && ma.value > 0)
        ? mb.value
        : null;

    if (ply < input.bookPlies) {
      cls = "teoria";
    } else {
      // Brilhante.
      const b = c.brilliant;
      const material = materialOf(fen);
      const enoughMaterial =
        material.queens ||
        Math.min(material.w, material.b) >= b.minMaterialWithoutQueens;
      if (
        deep &&
        loss <= b.maxLoss &&
        after >= b.minAfter &&
        before <= b.maxBefore &&
        enoughMaterial &&
        legalCount(fen) > 1 &&
        !givesMate(fen, played) &&
        !isRecapture(
          fen,
          played,
          ply > 0
            ? {
                uci: input.moves[ply - 1],
                captured: wasCapture(input.fens[ply - 1], input.moves[ply - 1]),
              }
            : null,
        )
      ) {
        const sac = sacrificeOf(input, ply);
        const altSac =
          alternative &&
          sacrificeInLine(fen, alternative.pv, sacrificeRules(), b.plies);
        const altWin = alternative ? winFor(alternative.score, color) : null;
        const altSimilar =
          altSac &&
          altSac.amount >= (sac?.amount ?? Infinity) &&
          altWin !== null &&
          Math.abs(altWin - after) <= b.alternativeMargin;
        if (sac && !altSimilar) {
          cls = "brilhante";
          sacrifice = sac;
          impact = sac.amount * 100 + (altWin === null ? 0 : after - altWin);
        }
      }

      // Ótimo: melhor lance e (lance único ou virada de resultado). Lance
      // único: a 2ª opção perde 15 pontos ou mais E muda a categoria da
      // posição (de vencedora para não vencedora, ou de equilibrada para
      // pior). Mate em 1 fica como "Melhor".
      if (
        cls !== "brilhante" &&
        isBest &&
        deep &&
        alternative &&
        !givesMate(fen, played)
      ) {
        const g = c.great;
        const bestWin = winFor(deep[0].score, color);
        const altWin = winFor(alternative.score, color);
        const changesCategory =
          bestWin >= g.equalMin &&
          altWin < (bestWin >= g.winningMin ? g.winningMin : g.equalMin);
        const gap = changesCategory ? bestWin - altWin : 0;
        const previous = ply > 0 ? input.evals[ply - 1] : null;
        const prevWin = previous ? winFor(previous, color) : null;
        const turned =
          prevWin !== null &&
          ((prevWin <= g.lostMax && after >= g.equalMin && altWin < g.equalMin) ||
            (prevWin <= g.equalMax &&
              after >= g.winningMin &&
              altWin < g.winningMin));
        if (gap >= g.onlyMoveGap || turned) {
          cls = "otimo";
          onlyMoveGap = gap >= g.onlyMoveGap ? gap : null;
        }
      }

      if (cls !== "brilhante" && cls !== "otimo") {
        // Chance perdida (só abaixo do erro grave).
        const opponentLoss = ply > 0 ? lossAt(input, ply - 1) : null;
        if (
          loss <= c.mistake &&
          opponentLoss !== null &&
          opponentLoss >= c.missed.opponentMinLoss &&
          before >= c.missed.winningMin &&
          after <= c.missed.afterMax
        )
          cls = "chance_perdida";
        if (missedMate !== null) cls = worse(cls, "chance_perdida");
        if (allowedMate !== null) cls = worse(cls, "erro_grave");
      }
    }

    moves.push({
      ply,
      color,
      played,
      best,
      before,
      after,
      loss,
      accuracy,
      cls,
      sacrifice,
      onlyMoveGap,
      allowedMate,
      missedMate,
      impact,
    });
  }

  capBrilliants(moves, c.brilliant.maxPerPlayer);
  return moves;
}

// Raridade: no máximo `max` brilhantes por jogador (os de maior impacto); os
// outros voltam à classe pela perda.
export function capBrilliants(moves: ReviewedMove[], max: number) {
  for (const color of ["w", "b"] as const) {
    const brilliant = moves
      .filter((m) => m.color === color && m.cls === "brilhante")
      .sort((a, b) => b.impact - a.impact || a.ply - b.ply);
    for (const move of brilliant.slice(max)) {
      move.cls = classByLoss(move.loss, move.best === move.played);
      move.sacrifice = null;
    }
  }
}

// ---------------------------------------------------------------- precisão
const clamp = (v: number, lo: number, hi: number) =>
  Math.max(lo, Math.min(hi, v));

function stdev(values: number[]): number {
  if (values.length === 0) return 0;
  const mean = values.reduce((s, v) => s + v, 0) / values.length;
  return Math.sqrt(
    values.reduce((s, v) => s + (v - mean) ** 2, 0) / values.length,
  );
}

// Precisão da partida de um lado (escolhas nossas, documentadas em
// docs/DECISOES.md): média entre
// (a) a média das precisões dos lances ponderada pela volatilidade (desvio
//     padrão do win% das brancas numa janela deslizante que termina na posição
//     depois do lance; janela = clamp(lances / 10, 2, 8); peso = clamp(desvio,
//     0,5, 12)) e
// (b) a média harmônica das precisões dos lances.
export function gameAccuracy(
  moves: ReviewedMove[],
  evals: EngineScore[],
  color: Color,
): number | null {
  const mine = moves.filter((m) => m.color === color);
  if (mine.length === 0) return null;
  const wins = evals.map((score) => winChance(score));
  const windowSize = clamp(Math.floor(moves.length / 10), 2, 8);
  let weighted = 0;
  let weights = 0;
  for (const move of mine) {
    const end = move.ply + 2; // inclui a posição depois do lance
    const start = Math.max(0, end - windowSize);
    const weight = clamp(stdev(wins.slice(start, end)), 0.5, 12);
    weighted += move.accuracy * weight;
    weights += weight;
  }
  const volatilityMean = weighted / weights;
  const harmonic =
    mine.length / mine.reduce((s, m) => s + 1 / Math.max(m.accuracy, 1), 0);
  return Math.round(((volatilityMean + harmonic) / 2) * 10) / 10;
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

export type KeyMoment =
  | { kind: "virada"; ply: number }
  | { kind: "fim-da-teoria"; ply: number };

// Momentos-chave: o lance em que a partida saiu da teoria e os 3 maiores
// balanços de avaliação (lances com maior perda, a partir de uma imprecisão).
export function keyMoments(moves: ReviewedMove[], bookPlies: number): KeyMoment[] {
  const c = CLASSIFY_CONFIG.critical;
  const swings = moves
    .filter((m) => m.cls !== "teoria" && m.loss > c.minLoss)
    .sort((a, b) => b.loss - a.loss || a.ply - b.ply)
    .slice(0, c.count)
    .map((m): KeyMoment => ({ kind: "virada", ply: m.ply }));
  const out: KeyMoment[] =
    bookPlies > 0 && bookPlies < moves.length
      ? [{ kind: "fim-da-teoria", ply: bookPlies }]
      : [];
  return [...out, ...swings].sort((a, b) => a.ply - b.ply);
}

// Avaliação final de uma posição sem lances (mate ou afogamento), do ponto de
// vista das brancas. sideToMove é quem estaria na vez.
export function terminalScore(
  kind: "mate" | "empate",
  sideToMove: Color,
): EngineScore {
  if (kind === "empate") return { kind: "cp", value: 0 };
  return { kind: "mate", value: sideToMove === "w" ? -1 : 1 };
}
