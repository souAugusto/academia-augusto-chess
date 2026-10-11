"use client";

import { Chess, type Square } from "chess.js";
import { useState, type CSSProperties } from "react";
import { Chessboard, type Arrow } from "react-chessboard";
import { CBURNETT_PIECES } from "./pieces";
import { useReducedMotion } from "./useReducedMotion";

// Cores de destaque do tabuleiro (sobre as casas do tema).
export const BOARD_COLORS = {
  last: "rgb(232 184 74 / 0.45)",
  selected: "rgb(108 122 224 / 0.55)",
  hint: "rgb(61 220 151 / 0.55)",
  ok: "rgb(61 220 151 / 0.6)",
  bad: "rgb(255 92 108 / 0.65)",
  dot: "radial-gradient(circle, rgb(11 13 18 / 0.35) 22%, transparent 24%)",
  // Captura: anel na borda da casa, para não ficar escondido atrás da peça.
  ring: "radial-gradient(circle, transparent 62%, rgb(11 13 18 / 0.35) 64%)",
  arrow: "rgb(232 184 74 / 0.85)",
  arrowAlt: "rgb(108 122 224 / 0.8)",
};

export type Side = "w" | "b";

type PlayBoardProps = {
  id: string;
  fen: string;
  orientation: Side;
  movableColor: Side | null; // quem pode mover agora (null = ninguém)
  lastMove?: { from: string; to: string } | null;
  highlights?: Record<string, CSSProperties>; // destaques extras (dica, acerto, erro)
  arrows?: Arrow[];
  // Retorna true se o lance foi aceito (a peça fica na casa nova).
  onMove: (from: Square, to: Square, promotion?: string) => boolean;
};

const PIECE_NAMES = { q: "Dama", r: "Torre", b: "Bispo", n: "Cavalo" } as const;

// Tabuleiro jogável: arrastar ou tocar-e-tocar, promoção com escolha e destaques.
export function PlayBoard({
  id,
  fen,
  orientation,
  movableColor,
  lastMove,
  highlights = {},
  arrows = [],
  onMove,
}: PlayBoardProps) {
  const [selected, setSelected] = useState<Square | null>(null);
  const [promotion, setPromotion] = useState<{
    from: Square;
    to: Square;
  } | null>(null);
  const reducedMotion = useReducedMotion();
  const canMove = movableColor !== null;

  function attempt(from: Square, to: Square, promo?: string): boolean {
    if (!canMove) return false;
    const chess = new Chess(fen);
    const legal = chess
      .moves({ square: from, verbose: true })
      .filter((move) => move.to === to);
    if (legal.length === 0) return false;
    if (!promo && legal.some((move) => move.promotion)) {
      setPromotion({ from, to });
      return false;
    }
    setSelected(null);
    return onMove(from, to, promo);
  }

  function onSquareClick(square: Square) {
    if (!canMove) return;
    const piece = new Chess(fen).get(square);
    if (selected && selected !== square) {
      const moved = attempt(selected, square);
      if (moved) return;
      if (!(piece && piece.color === movableColor)) {
        setSelected(null);
        return;
      }
    }
    setSelected(piece && piece.color === movableColor ? square : null);
  }

  const squareStyles: Record<string, CSSProperties> = {};
  if (lastMove) {
    squareStyles[lastMove.from] = { background: BOARD_COLORS.last };
    squareStyles[lastMove.to] = { background: BOARD_COLORS.last };
  }
  if (selected) {
    squareStyles[selected] = { background: BOARD_COLORS.selected };
    for (const move of new Chess(fen).moves({
      square: selected,
      verbose: true,
    })) {
      squareStyles[move.to] = {
        ...squareStyles[move.to],
        backgroundImage: move.captured ? BOARD_COLORS.ring : BOARD_COLORS.dot,
      };
    }
  }
  for (const [square, style] of Object.entries(highlights)) {
    squareStyles[square] = { ...squareStyles[square], ...style };
  }

  return (
    <div className="board-frame">
      <Chessboard
        options={{
          id,
          position: fen,
          boardOrientation: orientation === "w" ? "white" : "black",
          pieces: CBURNETT_PIECES,
          darkSquareStyle: { backgroundColor: "var(--color-board-dark)" },
          lightSquareStyle: { backgroundColor: "var(--color-board-light)" },
          // Coordenadas na cor da casa oposta (em vez do laranja padrão da biblioteca).
          darkSquareNotationStyle: {
            color: "var(--color-board-light)",
            fontWeight: 600,
          },
          lightSquareNotationStyle: {
            color: "var(--color-board-dark)",
            fontWeight: 600,
          },
          squareStyles,
          arrows,
          allowDrawingArrows: true,
          showAnimations: !reducedMotion,
          animationDurationInMs: 220,
          canDragPiece: ({ piece }) =>
            canMove && piece.pieceType[0] === movableColor,
          onPieceDrop: ({ sourceSquare, targetSquare }) =>
            targetSquare
              ? attempt(sourceSquare as Square, targetSquare as Square)
              : false,
          onSquareClick: ({ square }) => onSquareClick(square as Square),
        }}
      />

      {promotion && movableColor && (
        <div
          role="dialog"
          aria-label="Escolha a peça da promoção"
          className="absolute inset-0 flex items-center justify-center bg-bg/70 backdrop-blur-sm"
        >
          <div className="flex gap-2 rounded-card border border-border bg-surface p-3 shadow-card">
            {(["q", "r", "b", "n"] as const).map((piece) => (
              <button
                key={piece}
                type="button"
                onClick={() => {
                  const { from, to } = promotion;
                  setPromotion(null);
                  attempt(from, to, piece);
                }}
                className="size-16 rounded-control bg-surface-2 p-1 hover:ring-2 hover:ring-accent"
              >
                <span className="sr-only">{PIECE_NAMES[piece]}</span>
                {/* eslint-disable-next-line @next/next/no-img-element -- SVG pequeno e estático */}
                <img
                  src={`/pieces/cburnett/${movableColor}${piece.toUpperCase()}.svg`}
                  alt=""
                />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
