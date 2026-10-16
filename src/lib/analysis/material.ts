// Material e sacrifícios, a partir das posições (chess.js). Lógica pura.
import { Chess, type Square } from "chess.js";

export type Color = "w" | "b";
export type PieceType = "p" | "n" | "b" | "r" | "q" | "k";

export const PIECE_VALUES: Record<PieceType, number> = {
  p: 1,
  n: 3,
  b: 3,
  r: 5,
  q: 9,
  k: 0,
};

export const PIECE_NAMES_PT: Record<PieceType, string> = {
  p: "peão",
  n: "cavalo",
  b: "bispo",
  r: "torre",
  q: "dama",
  k: "rei",
};

// Material de cada lado (sem o rei) e se ainda há damas.
export function materialOf(fen: string): { w: number; b: number; queens: boolean } {
  const board = fen.split(" ")[0];
  let w = 0;
  let b = 0;
  let queens = false;
  for (const char of board) {
    const lower = char.toLowerCase() as PieceType;
    if (!(lower in PIECE_VALUES)) continue;
    if (lower === "q") queens = true;
    if (char === lower) b += PIECE_VALUES[lower];
    else w += PIECE_VALUES[lower];
  }
  return { w, b, queens };
}

// Saldo de material do ponto de vista de um lado (positivo = está à frente).
export function balance(fen: string, color: Color): number {
  const m = materialOf(fen);
  return color === "w" ? m.w - m.b : m.b - m.w;
}

export function playUci(chess: Chess, uci: string) {
  try {
    return chess.move({
      from: uci.slice(0, 2),
      to: uci.slice(2, 4),
      promotion: uci[4],
    });
  } catch {
    return null;
  }
}

export type Sacrifice = {
  amount: number; // pontos de material a menos ao fim da linha
  piece: PieceType; // peça entregue (capturada logo em seguida)
  square: Square; // casa onde ela foi capturada
  line: string[]; // lances depois do sacrifício (a oferta aceita)
};

export type SacrificeRules = {
  minPiece: number; // a peça entregue vale pelo menos isto (3 = peça menor)
  minNet: number; // e quem jogou fica pelo menos isto abaixo no fim da linha
  allowExchange: boolean; // torre por peça menor (qualidade) conta?
};

// Quem joga em `fen` faz line[0]; a linha continua até `maxPlies`
// meias-jogadas. É sacrifício quando o adversário captura, logo no lance
// seguinte, uma peça de quem jogou (peça menor ou mais) e, nas duas últimas
// posições da linha, quem jogou segue com pelo menos `minNet` pontos a menos
// do que tinha antes do lance. Troca e recaptura não contam, porque o saldo
// volta ao normal; peça perdida mais tarde também não (não foi oferecida).
export function sacrificeInLine(
  fen: string,
  line: string[],
  rules: SacrificeRules,
  maxPlies = 6,
): Sacrifice | null {
  if (line.length < 2) return null;
  const chess = new Chess(fen);
  const mover = chess.turn() as Color;
  const start = balance(fen, mover);
  const balances: number[] = [];
  let offered: { piece: PieceType; square: Square } | null = null;
  let gainedMinor = false;
  for (const [index, uci] of line.slice(0, 1 + maxPlies).entries()) {
    const move = playUci(chess, uci);
    if (!move) break;
    if (move.captured) {
      const piece = move.captured as PieceType;
      if (index === 1) offered = { piece, square: move.to };
      if (move.color === mover && (piece === "n" || piece === "b"))
        gainedMinor = true;
    }
    balances.push(balance(chess.fen(), mover));
  }
  if (balances.length < 2 || !offered) return null;
  if (PIECE_VALUES[offered.piece] < rules.minPiece) return null;
  const amount = start - Math.max(...balances.slice(-2));
  if (amount < rules.minNet) return null;
  const exchange = offered.piece === "r" && gainedMinor && amount <= 2;
  if (exchange && !rules.allowExchange) return null;
  return {
    amount,
    piece: offered.piece,
    square: offered.square,
    line: line.slice(1, 1 + maxPlies),
  };
}

// Recaptura: o lance captura na casa em que o adversário acabou de capturar.
export function isRecapture(
  fenBefore: string,
  played: string,
  previous: { uci: string; captured: boolean } | null,
): boolean {
  if (!previous?.captured) return false;
  const chess = new Chess(fenBefore);
  const move = playUci(chess, played);
  return !!move?.captured && move.to === previous.uci.slice(2, 4);
}
