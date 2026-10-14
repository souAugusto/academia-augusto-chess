"use client";

import { useBoardPreferences } from "@/components/preferences/PreferencesProvider";
import { boardSquares, type Color } from "@/lib/chess/puzzle";
import { BOARD_THEME_OPTIONS, pieceUrl } from "@/lib/preferences/options";

type StaticBoardProps = {
  fen: string;
  orientation: Color;
  highlight?: string[];
  label: string;
  // Decorativo (Home): sempre no tema e nas peças padrão.
  decorative?: boolean;
};

const PIECE_NAMES: Record<string, string> = {
  K: "rei",
  Q: "dama",
  R: "torre",
  B: "bispo",
  N: "cavalo",
  P: "peão",
};

// Tabuleiro só para exibição, no tema e nas peças escolhidos pelo aluno.
export function StaticBoard({
  fen,
  orientation,
  highlight = [],
  label,
  decorative = false,
}: StaticBoardProps) {
  const prefs = useBoardPreferences();
  const theme =
    BOARD_THEME_OPTIONS[decorative ? "finale" : prefs.board.theme].colors;
  const pieces = decorative ? "cburnett" : prefs.pieces;
  const squares = boardSquares(fen, orientation);
  return (
    <div role="img" aria-label={label} className="board-frame grid grid-cols-8">
      {squares.map(({ square, piece, isLight }) => (
        <div
          key={square}
          className="relative aspect-square"
          style={{ backgroundColor: isLight ? theme.light : theme.dark }}
        >
          {highlight.includes(square) && (
            <span
              className="absolute inset-0 bg-board-highlight"
              aria-hidden="true"
            />
          )}
          {piece && (
            // eslint-disable-next-line @next/next/no-img-element -- SVG pequeno e estático
            <img
              src={pieceUrl(pieces, piece)}
              alt=""
              title={`${piece[0] === "w" ? "Brancas" : "Pretas"}: ${PIECE_NAMES[piece[1]]} em ${square}`}
              className="absolute inset-0 size-full"
              draggable={false}
            />
          )}
        </div>
      ))}
    </div>
  );
}
