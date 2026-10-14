import type { PieceRenderObject } from "react-chessboard";
import { pieceUrl } from "@/lib/preferences/options";
import type { PieceSet } from "@/lib/preferences/schema";

// Peças para o react-chessboard, no conjunto escolhido pelo aluno.
// As licenças de cada conjunto estão em public/pieces/<conjunto>/ e em /creditos.
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

const cache = new Map<PieceSet, PieceRenderObject>();

export function pieceRenderer(set: PieceSet): PieceRenderObject {
  const cached = cache.get(set);
  if (cached) return cached;
  const renderer: PieceRenderObject = Object.fromEntries(
    CODES.map((code) => [
      code,
      () => (
        // eslint-disable-next-line @next/next/no-img-element -- SVG pequeno e estático
        <img
          src={pieceUrl(set, code)}
          alt=""
          draggable={false}
          style={{ width: "100%", height: "100%", pointerEvents: "none" }}
        />
      ),
    ]),
  );
  cache.set(set, renderer);
  return renderer;
}
