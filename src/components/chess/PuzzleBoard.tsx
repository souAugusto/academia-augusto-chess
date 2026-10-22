"use client";

import { playSound } from "@/lib/sound";
import { Chess, type Square } from "chess.js";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import type { Arrow } from "react-chessboard";
import { buttonClasses } from "@/components/ui/button";
import type { PuzzleRecord } from "@/lib/chess/puzzle";
import { judgeMove, solutionLine, uciToMove } from "@/lib/chess/solver";
import { BoardStage } from "./BoardStage";
import { MoveInput } from "./MoveInput";
import { BOARD_COLORS, ChessBoard } from "./ChessBoard";
import { useReducedMotion } from "./useReducedMotion";

export type PuzzlePhase =
  "intro" | "playing" | "failed" | "solved" | "revealed";

export type PuzzleOutcome = {
  solved: boolean;
  moves: string[];
  seconds: number;
  assisted: boolean; // usou a dica (o servidor conta como erro)
};

type PuzzleBoardProps = {
  puzzle: Pick<PuzzleRecord, "fen" | "moves" | "first_move_is_setup">;
  // Chamado uma vez, no primeiro momento decisivo (primeiro erro ou solução).
  onOutcome?: (outcome: PuzzleOutcome) => void;
  onPhaseChange?: (phase: PuzzlePhase) => void;
  // Partes do painel que cada tela completa (título e rating, resultado, filtros).
  title?: ReactNode;
  stats?: ReactNode;
  result?: ReactNode;
  extraActions?: ReactNode;
  below?: ReactNode;
  // Método do Intensivo: lance errado já mostra a solução (sem nova tentativa).
  revealOnMistake?: boolean;
  hideHelp?: boolean; // sem "Dica" e "Ver solução"
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

export function PuzzleBoard({
  puzzle,
  onOutcome,
  onPhaseChange,
  title,
  stats,
  result,
  extraActions,
  below,
  revealOnMistake = false,
  hideHelp = false,
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
  const [hint, setHint] = useState<string | null>(null);
  const [arrows, setArrows] = useState<Arrow[]>([]);
  const [message, setMessage] = useState("");
  const startedAt = useRef(0);
  const reported = useRef(false);
  const assisted = useRef(false);
  const timers = useRef<number[]>([]);
  const reducedMotion = useReducedMotion();

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
      assisted: assisted.current,
    });
  }

  const active = game.phase === "playing" || game.phase === "failed";

  function tryMove(from: Square, to: Square, promo?: string): boolean {
    if (!active) return false;
    const uci = `${from}${to}${promo ?? ""}`;
    const verdict = judgeMove(game.fen, line, game.index, uci);
    setHint(null);

    if (verdict.kind === "illegal") return false;

    if (verdict.kind === "wrong") {
      playSound("wrong");
      if (game.phase === "playing") report(false, [...game.userMoves, uci]);
      if (revealOnMistake) {
        revealSolution();
        setMessage("Não era esse lance. Veja a solução.");
        return false;
      }
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

    if (finished && game.phase === "playing") report(true, userMoves);
    // O som do lance toca no tabuleiro; aqui só o do resultado.
    if (finished) setTimeout(() => playSound("solved"), 150);
    setMessage(finished ? "Resolvido." : "Boa. Continue.");
    setGame({
      fen: chess.fen(),
      index: game.index,
      userMoves,
      lastMove: { from, to },
      phase: finished ? "solved" : game.phase,
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

  function showHint() {
    playSound("hint");
    const expected = line[game.index];
    if (!active || !expected) return;
    assisted.current = true;
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
            {
              startSquare: move.from,
              endSquare: move.to,
              color: BOARD_COLORS.arrow,
            },
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

  const highlights: Record<string, CSSProperties> = {};
  if (hint) highlights[hint] = { background: BOARD_COLORS.hint };
  if (game.flash) {
    highlights[game.flash.square] = {
      background: game.flash.tone === "ok" ? BOARD_COLORS.ok : BOARD_COLORS.bad,
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
    <BoardStage
      board={
        <ChessBoard
          id="finale-puzzle"
          fen={game.fen}
          orientation={playerColor}
          movableColor={active ? playerColor : null}
          lastMove={game.lastMove}
          highlights={highlights}
          arrows={arrows}
          onMove={tryMove}
        />
      }
      info={
        <>
          <div className="flex flex-col gap-1">{title}</div>
          <span className="text-sm font-semibold text-muted">{turnLabel}</span>
          {stats}
        </>
      }
      actions={
        <>
          {!hideHelp && (
            <>
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
            </>
          )}
          {extraActions}
        </>
      }
      below={below}
    >
      {/* Altura mínima fixa: o painel não pula quando a mensagem muda. */}
      <p
        key={statusText}
        aria-live="polite"
        className={`reveal-in min-h-12 text-[0.9375rem] font-medium ${
          game.phase === "solved"
            ? "text-success"
            : game.phase === "failed"
              ? "text-danger"
              : "text-muted"
        }`}
      >
        {statusText}
      </p>
      {result}
      <MoveInput
        fen={game.fen}
        disabled={!active}
        onMove={tryMove}
        onInvalid={setMessage}
      />
    </BoardStage>
  );
}
