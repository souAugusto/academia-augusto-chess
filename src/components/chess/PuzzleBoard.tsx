"use client";

import { Chess, type Square } from "chess.js";
import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { Chessboard, type Arrow } from "react-chessboard";
import type { PuzzleRecord } from "@/lib/chess/puzzle";
import { parseTypedMove } from "@/lib/chess/notation";
import { judgeMove, solutionLine, uciToMove } from "@/lib/chess/solver";
import { buttonClasses } from "@/components/ui/button";
import { CBURNETT_PIECES } from "./pieces";

export type PuzzlePhase =
  "intro" | "playing" | "failed" | "solved" | "revealed";

export type PuzzleOutcome = {
  solved: boolean;
  moves: string[];
  seconds: number;
};

type PuzzleBoardProps = {
  puzzle: Pick<PuzzleRecord, "fen" | "moves" | "first_move_is_setup">;
  // Chamado uma vez, no primeiro momento decisivo (primeiro erro ou solução).
  onOutcome?: (outcome: PuzzleOutcome) => void;
  onPhaseChange?: (phase: PuzzlePhase) => void;
};

type Game = {
  fen: string;
  index: number; // posição na linha da solução (lances do aluno nos pares)
  userMoves: string[];
  lastMove: { from: string; to: string } | null;
  phase: PuzzlePhase;
  flash: { square: string; tone: "ok" | "bad" } | null;
};

// Relógio fora do componente: só é chamado em eventos e timers, nunca na renderização.
const now = () => Date.now();

const SETUP_DELAY = 600;
const REPLY_DELAY = 450;

const COLORS = {
  last: "rgb(232 184 74 / 0.45)",
  selected: "rgb(108 122 224 / 0.55)",
  hint: "rgb(61 220 151 / 0.55)",
  ok: "rgb(61 220 151 / 0.6)",
  bad: "rgb(255 92 108 / 0.65)",
  dot: "radial-gradient(circle, rgb(11 13 18 / 0.35) 22%, transparent 24%)",
  // Captura: anel na borda da casa, para não ficar escondido atrás da peça.
  ring: "radial-gradient(circle, transparent 62%, rgb(11 13 18 / 0.35) 64%)",
  arrow: "rgb(232 184 74 / 0.85)",
};

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);
  return reduced;
}

export function PuzzleBoard({
  puzzle,
  onOutcome,
  onPhaseChange,
}: PuzzleBoardProps) {
  const { startFen, line } = useMemo(() => solutionLine(puzzle), [puzzle]);
  const playerColor = new Chess(startFen).turn();
  const setupMove = puzzle.first_move_is_setup
    ? puzzle.moves.trim().split(/\s+/)[0]
    : null;

  const [game, setGame] = useState<Game>(() => ({
    fen: setupMove ? new Chess(puzzle.fen).fen() : startFen,
    index: 0,
    userMoves: [],
    lastMove: null,
    phase: setupMove ? "intro" : "playing",
    flash: null,
  }));
  const [selected, setSelected] = useState<Square | null>(null);
  const [hint, setHint] = useState<string | null>(null);
  const [arrows, setArrows] = useState<Arrow[]>([]);
  const [promotion, setPromotion] = useState<{
    from: Square;
    to: Square;
  } | null>(null);
  const [typed, setTyped] = useState("");
  const [message, setMessage] = useState("");
  const startedAt = useRef(0);
  const reported = useRef(false);
  const timers = useRef<number[]>([]);
  const reducedMotion = usePrefersReducedMotion();
  const inputId = useId();

  const later = (fn: () => void, ms: number) => {
    timers.current.push(window.setTimeout(fn, reducedMotion ? 0 : ms));
  };

  useEffect(
    () => () => timers.current.forEach((id) => window.clearTimeout(id)),
    [],
  );

  // Lance do adversário que abre o puzzle (Lichess). Sem setup, o cronômetro começa já.
  useEffect(() => {
    if (!setupMove) {
      startedAt.current = now();
      return;
    }
    const id = window.setTimeout(() => {
      setGame((current) => ({
        ...current,
        fen: startFen,
        lastMove: uciToMove(setupMove),
        phase: "playing",
      }));
      startedAt.current = now();
    }, SETUP_DELAY);
    return () => window.clearTimeout(id);
  }, [setupMove, startFen]);

  useEffect(() => {
    onPhaseChange?.(game.phase);
  }, [game.phase, onPhaseChange]);

  function report(solved: boolean, moves: string[]) {
    if (reported.current) return;
    reported.current = true;
    onOutcome?.({
      solved,
      moves,
      seconds: (now() - startedAt.current) / 1000,
    });
  }

  const active = game.phase === "playing" || game.phase === "failed";

  function needsPromotion(from: Square, to: Square) {
    const piece = new Chess(game.fen).get(from);
    return piece?.type === "p" && (to[1] === "8" || to[1] === "1");
  }

  function tryMove(from: Square, to: Square, promo?: string): boolean {
    if (!active) return false;
    if (!promo && needsPromotion(from, to)) {
      const legal = new Chess(game.fen)
        .moves({ square: from, verbose: true })
        .some((m) => m.to === to);
      if (legal) setPromotion({ from, to });
      return false;
    }
    const uci = `${from}${to}${promo ?? ""}`;
    const verdict = judgeMove(game.fen, line, game.index, uci);
    setSelected(null);
    setHint(null);

    if (verdict.kind === "illegal") return false;

    if (verdict.kind === "wrong") {
      if (game.phase === "playing") report(false, [...game.userMoves, uci]);
      setGame((current) => ({
        ...current,
        phase: "failed",
        flash: { square: to, tone: "bad" },
      }));
      setMessage("Não é esse lance. Tente de novo ou veja a solução.");
      return false;
    }

    const chess = new Chess(game.fen);
    chess.move({ from, to, promotion: promo });
    const userMoves = [...game.userMoves, uci];
    const finished = verdict.kind === "mate" || verdict.done;
    const nextPhase: PuzzlePhase = finished ? "solved" : game.phase;

    if (finished && game.phase === "playing") report(true, userMoves);
    setMessage(finished ? "Resolvido." : "Boa. Continue.");
    setGame({
      fen: chess.fen(),
      index: game.index,
      userMoves,
      lastMove: { from, to },
      phase: nextPhase,
      flash: { square: to, tone: "ok" },
    });

    if (!finished && verdict.kind === "correct" && verdict.reply) {
      const reply = verdict.reply;
      later(() => {
        setGame((current) => {
          const next = new Chess(current.fen);
          next.move(uciToMove(reply));
          return {
            ...current,
            fen: next.fen(),
            index: current.index + 2,
            lastMove: uciToMove(reply),
            flash: null,
          };
        });
      }, REPLY_DELAY);
    }
    return true;
  }

  function onSquareClick(square: Square) {
    if (!active) return;
    const chess = new Chess(game.fen);
    const piece = chess.get(square);
    if (selected && selected !== square) {
      const moved = tryMove(selected, square);
      if (moved || promotion) return;
    }
    if (piece && piece.color === playerColor) setSelected(square);
    else setSelected(null);
  }

  function showHint() {
    const expected = line[game.index];
    if (!active || !expected) return;
    setHint(expected.slice(0, 2));
    setMessage("A peça destacada é a que você deve mover.");
  }

  function revealSolution() {
    if (!active) return;
    if (game.phase === "playing") report(false, game.userMoves);
    const remaining = line.slice(game.index);
    setGame((current) => ({ ...current, phase: "revealed", flash: null }));
    setMessage("Esta é a solução.");
    remaining.forEach((uci, step) => {
      later(
        () => {
          const move = uciToMove(uci);
          setArrows([
            { startSquare: move.from, endSquare: move.to, color: COLORS.arrow },
          ]);
          setGame((current) => {
            const next = new Chess(current.fen);
            next.move(move);
            return { ...current, fen: next.fen(), lastMove: move };
          });
        },
        (step + 1) * 700,
      );
    });
  }

  function submitTyped(event: React.FormEvent) {
    event.preventDefault();
    const value = typed.trim();
    if (!value) return;
    const move = parseTypedMove(game.fen, value);
    if (!move) {
      setMessage(`"${value}" não é um lance válido nesta posição.`);
      return;
    }
    setTyped("");
    tryMove(move.from as Square, move.to as Square, move.promotion);
  }

  const squareStyles: Record<string, CSSProperties> = {};
  if (game.lastMove) {
    squareStyles[game.lastMove.from] = { background: COLORS.last };
    squareStyles[game.lastMove.to] = { background: COLORS.last };
  }
  if (selected) {
    squareStyles[selected] = { background: COLORS.selected };
    for (const move of new Chess(game.fen).moves({
      square: selected,
      verbose: true,
    })) {
      squareStyles[move.to] = {
        ...squareStyles[move.to],
        backgroundImage: move.captured ? COLORS.ring : COLORS.dot,
      };
    }
  }
  if (hint) squareStyles[hint] = { background: COLORS.hint };
  if (game.flash) {
    squareStyles[game.flash.square] = {
      background: game.flash.tone === "ok" ? COLORS.ok : COLORS.bad,
    };
  }

  const turnLabel = playerColor === "w" ? "Brancas jogam" : "Pretas jogam";
  const statusText =
    game.phase === "intro"
      ? "Observe o lance do adversário."
      : game.phase === "solved"
        ? "Resolvido."
        : game.phase === "revealed"
          ? "Esta é a solução."
          : message || `${turnLabel}. Encontre o melhor lance.`;

  return (
    <div className="flex flex-col gap-4">
      <div className="relative">
        <div className="overflow-hidden rounded-control shadow-board ring-1 ring-border">
          <Chessboard
            options={{
              id: "finale-puzzle",
              position: game.fen,
              boardOrientation: playerColor === "w" ? "white" : "black",
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
                active && piece.pieceType[0] === playerColor,
              onPieceDrop: ({ sourceSquare, targetSquare }) =>
                targetSquare
                  ? tryMove(sourceSquare as Square, targetSquare as Square)
                  : false,
              onSquareClick: ({ square }) => onSquareClick(square as Square),
            }}
          />
        </div>

        {promotion && (
          <div
            role="dialog"
            aria-label="Escolha a peça da promoção"
            className="absolute inset-0 flex items-center justify-center rounded-control bg-bg/70 backdrop-blur-sm"
          >
            <div className="flex gap-2 rounded-card border border-border bg-surface p-3 shadow-card">
              {(["q", "r", "b", "n"] as const).map((piece) => (
                <button
                  key={piece}
                  type="button"
                  onClick={() => {
                    const { from, to } = promotion;
                    setPromotion(null);
                    tryMove(from, to, piece);
                  }}
                  className="size-16 rounded-control bg-surface-2 p-1 hover:ring-2 hover:ring-accent"
                >
                  <span className="sr-only">
                    {{ q: "Dama", r: "Torre", b: "Bispo", n: "Cavalo" }[piece]}
                  </span>
                  {/* eslint-disable-next-line @next/next/no-img-element -- SVG pequeno e estático */}
                  <img
                    src={`/pieces/cburnett/${playerColor}${piece.toUpperCase()}.svg`}
                    alt=""
                  />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <p
        aria-live="polite"
        className={`min-h-6 text-[0.9375rem] font-medium ${
          game.phase === "solved"
            ? "text-success"
            : game.phase === "failed"
              ? "text-danger"
              : "text-muted"
        }`}
      >
        {statusText}
      </p>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={showHint}
          disabled={!active}
          className={buttonClasses("secondary")}
        >
          Dica
        </button>
        <button
          type="button"
          onClick={revealSolution}
          disabled={!active}
          className={buttonClasses("secondary")}
        >
          Ver solução
        </button>
      </div>

      <form onSubmit={submitTyped} className="flex gap-2">
        <label htmlFor={inputId} className="sr-only">
          Digite o lance (ex.: Dxf7 ou h5f7)
        </label>
        <input
          id={inputId}
          value={typed}
          onChange={(event) => setTyped(event.target.value)}
          disabled={!active}
          placeholder="Ou digite o lance (ex.: Dxf7)"
          autoComplete="off"
          className="min-h-touch flex-1 rounded-control border border-border-strong bg-surface px-3 text-base text-text placeholder:text-muted disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={!active}
          className={buttonClasses("secondary")}
        >
          Jogar
        </button>
      </form>
    </div>
  );
}
