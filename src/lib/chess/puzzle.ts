import { Chess } from "chess.js";

export type Color = "w" | "b";
export type PieceCode = `${Color}${"K" | "Q" | "R" | "B" | "N" | "P"}`;

export type PuzzleRecord = {
  fen: string;
  moves: string; // lances UCI separados por espaço
  first_move_is_setup: boolean;
  themes: string[];
};

export type PuzzleStart = {
  fen: string;
  sideToMove: Color;
  lastMove: { from: string; to: string } | null;
};

// Posição em que o aluno começa a jogar. No Lichess, o 1º lance é do adversário
// e já vem aplicado; em táticas próprias, o FEN já é a posição do aluno.
export function puzzleStartPosition(puzzle: PuzzleRecord): PuzzleStart {
  const chess = new Chess(puzzle.fen);
  if (!puzzle.first_move_is_setup) {
    return { fen: chess.fen(), sideToMove: chess.turn(), lastMove: null };
  }

  const [setup] = puzzle.moves.trim().split(/\s+/);
  if (!setup) throw new Error("Puzzle sem lances");
  const move = chess.move({
    from: setup.slice(0, 2),
    to: setup.slice(2, 4),
    promotion: setup.length > 4 ? setup[4] : undefined,
  });
  return {
    fen: chess.fen(),
    sideToMove: chess.turn(),
    lastMove: { from: move.from, to: move.to },
  };
}

const THEME_LABELS: Record<string, string> = {
  mateIn1: "Mate em 1",
  mateIn2: "Mate em 2",
  mateIn3: "Mate em 3",
  mateIn4: "Mate em 4",
  mateIn5: "Mate em 5",
};

// Rótulo curto exibido ao lado do tabuleiro (ex.: "Mate em 1").
export function puzzleThemeLabel(themes: string[]): string | null {
  const theme = themes.find((t) => t in THEME_LABELS);
  return theme ? THEME_LABELS[theme] : null;
}

export type BoardSquare = {
  square: string;
  piece: PieceCode | null;
  isLight: boolean;
};

// 64 casas na ordem de exibição (de cima para baixo, da esquerda para a direita).
export function boardSquares(fen: string, orientation: Color): BoardSquare[] {
  const rows = new Chess(fen).board();
  const squares: BoardSquare[] = [];
  rows.forEach((row, rankIndex) => {
    row.forEach((cell, fileIndex) => {
      const square = `${"abcdefgh"[fileIndex]}${8 - rankIndex}`;
      squares.push({
        square,
        piece: cell
          ? (`${cell.color}${cell.type.toUpperCase()}` as PieceCode)
          : null,
        isLight: (rankIndex + fileIndex) % 2 === 0,
      });
    });
  });
  return orientation === "w" ? squares : squares.reverse();
}
