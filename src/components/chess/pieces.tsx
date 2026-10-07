import type { PieceRenderObject } from "react-chessboard";

// Peças Cburnett (licença BSD) para o react-chessboard.
const CODES = [
  "wK",
  "wQ",
  "wR",
  "wB",
  "wN",
  "wP",
  "bK",
  "bQ",
  "bR",
  "bB",
  "bN",
  "bP",
];

export const CBURNETT_PIECES: PieceRenderObject = Object.fromEntries(
  CODES.map((code) => [
    code,
    () => (
      // eslint-disable-next-line @next/next/no-img-element -- SVG pequeno e estático
      <img
        src={`/pieces/cburnett/${code}.svg`}
        alt=""
        draggable={false}
        style={{ width: "100%", height: "100%", pointerEvents: "none" }}
      />
    ),
  ]),
);
