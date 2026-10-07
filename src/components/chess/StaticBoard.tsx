import { boardSquares, type Color } from "@/lib/chess/puzzle";

type StaticBoardProps = {
  fen: string;
  orientation: Color;
  highlight?: string[];
  label: string;
};

const PIECE_NAMES: Record<string, string> = {
  K: "rei",
  Q: "dama",
  R: "torre",
  B: "bispo",
  N: "cavalo",
  P: "peão",
};

// Tabuleiro só para exibição. O tabuleiro jogável (react-chessboard) entra na Fase 2.
export function StaticBoard({
  fen,
  orientation,
  highlight = [],
  label,
}: StaticBoardProps) {
  const squares = boardSquares(fen, orientation);
  return (
    <div
      role="img"
      aria-label={label}
      className="grid grid-cols-8 overflow-hidden rounded-control shadow-board ring-1 ring-border"
    >
      {squares.map(({ square, piece, isLight }) => (
        <div
          key={square}
          className={`relative aspect-square ${isLight ? "bg-board-light" : "bg-board-dark"}`}
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
              src={`/pieces/cburnett/${piece}.svg`}
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
