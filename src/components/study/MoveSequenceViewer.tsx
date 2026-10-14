"use client";

import { Chess } from "chess.js";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { BoardStage } from "@/components/chess/BoardStage";
import {
  BOARD_COLORS,
  ChessBoard,
  type Side,
} from "@/components/chess/ChessBoard";
import { buttonClasses } from "@/components/ui/button";
import { sanToPortuguese } from "@/lib/chess/notation";
import type { ExplainedMove } from "@/content/licoes/types";

type Ply = {
  fen: string;
  san: string;
  from: string;
  to: string;
  note?: string;
};

// Passo a passo de uma sequência de lances, com a explicação de cada um.
// Setas do teclado (← →) navegam; a seta dourada mostra o próximo lance.
export function MoveSequenceViewer({
  id,
  startFen,
  moves,
  orientation,
  info,
  intro,
}: {
  id: string;
  startFen?: string | null;
  moves: ExplainedMove[];
  orientation: Side;
  info: ReactNode;
  intro?: string; // texto mostrado antes do primeiro lance
}) {
  const plies = useMemo(() => {
    const chess = startFen ? new Chess(startFen) : new Chess();
    const list: Ply[] = [];
    for (const move of moves) {
      const played = chess.move(move.san);
      list.push({
        fen: chess.fen(),
        san: played.san,
        from: played.from,
        to: played.to,
        note: move.note,
      });
    }
    return {
      start: startFen ?? new Chess().fen(),
      list,
      startTurn: new Chess(startFen ?? undefined).turn(),
    };
  }, [startFen, moves]);
  const [index, setIndex] = useState(0); // quantos lances já foram jogados

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      if (target && ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName))
        return;
      if (event.key === "ArrowRight")
        setIndex((value) => Math.min(plies.list.length, value + 1));
      if (event.key === "ArrowLeft")
        setIndex((value) => Math.max(0, value - 1));
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [plies.list.length]);

  const fen = index === 0 ? plies.start : plies.list[index - 1].fen;
  const current = index === 0 ? null : plies.list[index - 1];
  const next = plies.list[index];
  // Número do lance no texto: "1.e4", "1...e5"
  const label = (position: number) => {
    const ply = position + (plies.startTurn === "b" ? 1 : 0);
    const number = Math.floor(ply / 2) + 1;
    const san = sanToPortuguese(plies.list[position].san);
    return ply % 2 === 0 ? `${number}.${san}` : `${number}...${san}`;
  };

  return (
    <BoardStage
      board={
        <ChessBoard
          id={id}
          fen={fen}
          orientation={orientation}
          movableColor={null}
          lastMove={current ? { from: current.from, to: current.to } : null}
          arrows={
            next
              ? [
                  {
                    startSquare: next.from,
                    endSquare: next.to,
                    color: BOARD_COLORS.arrow,
                  },
                ]
              : []
          }
          onMove={() => false}
        />
      }
      info={info}
      actions={
        <>
          <button
            type="button"
            onClick={() => setIndex(0)}
            disabled={index === 0}
            className={buttonClasses("secondary")}
            aria-label="Voltar ao início"
          >
            ⏮
          </button>
          <button
            type="button"
            onClick={() => setIndex((value) => Math.max(0, value - 1))}
            disabled={index === 0}
            className={buttonClasses("secondary")}
          >
            Voltar
          </button>
          <button
            type="button"
            onClick={() =>
              setIndex((value) => Math.min(plies.list.length, value + 1))
            }
            disabled={index >= plies.list.length}
            className={buttonClasses("primary")}
          >
            Avançar
          </button>
        </>
      }
    >
      <p aria-live="polite" className="min-h-12 leading-relaxed">
        {current ? (
          <>
            <span className="font-mono font-semibold text-accent-text">
              {label(index - 1)}
            </span>{" "}
            {current.note ?? ""}
          </>
        ) : (
          (intro ?? "Use Avançar ou a seta → do teclado para ver os lances.")
        )}
      </p>
      <ol
        className="flex flex-wrap gap-x-1.5 gap-y-1 font-mono text-sm"
        aria-label="Lances"
      >
        {plies.list.map((ply, position) => (
          <li key={position}>
            <button
              type="button"
              onClick={() => setIndex(position + 1)}
              aria-current={position + 1 === index ? "step" : undefined}
              className={`rounded px-1.5 py-0.5 transition ${
                position + 1 === index
                  ? "bg-accent text-on-accent"
                  : ply.note
                    ? "text-text hover:bg-surface-2"
                    : "text-muted hover:bg-surface-2"
              }`}
            >
              {label(position)}
            </button>
          </li>
        ))}
      </ol>
    </BoardStage>
  );
}
