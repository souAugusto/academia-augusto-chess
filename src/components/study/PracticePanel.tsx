"use client";

import { playSound } from "@/lib/sound";
import { Chess, type Square } from "chess.js";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { BoardStage } from "@/components/chess/BoardStage";
import { MoveInput } from "@/components/chess/MoveInput";
import {
  BOARD_COLORS,
  ChessBoard,
  type Side,
} from "@/components/chess/ChessBoard";
import { useReducedMotion } from "@/components/chess/useReducedMotion";
import { buttonClasses } from "@/components/ui/button";
import { sanToPortuguese } from "@/lib/chess/notation";
import {
  judgeEndgameMove,
  judgeOpeningMove,
  openingDrillFen,
} from "@/lib/lessons/practice";
import {
  LEVEL_LABELS,
  type EndgameDrill,
  type Level,
  type OpeningDrill,
} from "@/content/licoes/types";

const LEVELS: Level[] = ["facil", "medio", "dificil"];
const REPLY_DELAY = 500;
const MAX_TRIES = 2; // depois de 2 erros a resposta aparece

// Uma prática unificada: abertura (um lance) ou final (sequência com respostas).
type Drill = {
  level: Level;
  fen: string;
  hint: string;
  why: string;
  goal?: "vencer" | "empatar";
  answer: string; // primeiro lance esperado (para mostrar quando o aluno desiste)
  judge: (step: number, san: string) => ReturnType<typeof judgeEndgameMove>;
};

export function fromOpeningDrills(drills: OpeningDrill[]): Drill[] {
  return drills.map((drill) => ({
    level: drill.level,
    fen: openingDrillFen(drill),
    hint: drill.hint,
    why: drill.why,
    answer: drill.answer,
    judge: (_step, san) => judgeOpeningMove(drill, san),
  }));
}

export function fromEndgameDrills(drills: EndgameDrill[]): Drill[] {
  return drills.map((drill) => ({
    level: drill.level,
    fen: drill.fen,
    hint: drill.hint,
    why: drill.why,
    goal: drill.goal,
    answer: drill.solution[0],
    judge: (step, san) => judgeEndgameMove(drill, step, san),
  }));
}

type Feedback = { tone: "ok" | "bad" | "info"; text: string } | null;

export function PracticePanel({
  drills,
  orientation,
  info,
  solved,
  onSolved,
}: {
  drills: Drill[];
  orientation?: Side;
  info: ReactNode;
  solved: Set<number>;
  onSolved: (index: number) => void;
}) {
  const levels = LEVELS.filter((level) =>
    drills.some((drill) => drill.level === level),
  );
  const [level, setLevel] = useState<Level>(levels[0] ?? "facil");
  const indices = useMemo(
    () =>
      drills
        .map((drill, index) => ({ drill, index }))
        .filter((item) => item.drill.level === level),
    [drills, level],
  );
  const [position, setPosition] = useState(0);
  const current = indices[Math.min(position, indices.length - 1)];

  return (
    <div className="flex flex-col gap-4">
      <div
        role="tablist"
        aria-label="Nível"
        className="grid grid-cols-3 gap-1 rounded-control bg-surface-2 p-1"
      >
        {levels.map((item) => {
          const total = drills.filter((drill) => drill.level === item).length;
          const done = drills.filter(
            (drill, index) => drill.level === item && solved.has(index),
          ).length;
          return (
            <button
              key={item}
              type="button"
              role="tab"
              aria-selected={level === item}
              onClick={() => {
                setLevel(item);
                setPosition(0);
              }}
              className={`min-h-touch rounded-[0.6rem] text-sm font-semibold transition ${
                level === item
                  ? "bg-accent text-on-accent"
                  : "text-muted hover:text-text"
              }`}
            >
              {LEVEL_LABELS[item]} {done}/{total}
            </button>
          );
        })}
      </div>
      {current && (
        <DrillBoard
          key={`${level}-${current.index}`}
          drill={current.drill}
          number={position + 1}
          total={indices.length}
          orientation={orientation}
          info={info}
          alreadySolved={solved.has(current.index)}
          onSolved={() => onSolved(current.index)}
          onNext={
            position + 1 < indices.length
              ? () => setPosition((value) => value + 1)
              : null
          }
          onPrevious={
            position > 0 ? () => setPosition((value) => value - 1) : null
          }
        />
      )}
    </div>
  );
}

function DrillBoard({
  drill,
  number,
  total,
  orientation,
  info,
  alreadySolved,
  onSolved,
  onNext,
  onPrevious,
}: {
  drill: Drill;
  number: number;
  total: number;
  orientation?: Side;
  info: ReactNode;
  alreadySolved: boolean;
  onSolved: () => void;
  onNext: (() => void) | null;
  onPrevious: (() => void) | null;
}) {
  const userSide = new Chess(drill.fen).turn();
  const chess = useRef(new Chess(drill.fen));
  const [fen, setFen] = useState(drill.fen);
  const [step, setStep] = useState(0);
  const [lastMove, setLastMove] = useState<{ from: string; to: string } | null>(
    null,
  );
  const [status, setStatus] = useState<
    "playing" | "waiting" | "solved" | "revealed"
  >("playing");
  const [tries, setTries] = useState(0);
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [showHint, setShowHint] = useState(false);
  const [arrow, setArrow] = useState<{ from: string; to: string } | null>(null);
  const timer = useRef<number | null>(null);
  const reducedMotion = useReducedMotion();

  useEffect(
    () => () => {
      if (timer.current) window.clearTimeout(timer.current);
    },
    [],
  );

  function reveal() {
    const move = new Chess(chess.current.fen()).move(drill.answer);
    setArrow({ from: move.from, to: move.to });
    setStatus("revealed");
    setFeedback({
      tone: "info",
      text: `A resposta era ${sanToPortuguese(move.san)}. ${drill.why}`,
    });
  }

  function onMove(from: Square, to: Square, promotion?: string) {
    if (status !== "playing") return false;
    let san: string;
    try {
      san = new Chess(chess.current.fen()).move({ from, to, promotion }).san;
    } catch {
      return false;
    }
    const verdict = drill.judge(step, san);
    if (verdict.kind === "wrong") {
      playSound("wrong");
      const count = tries + 1;
      setTries(count);
      if (count >= MAX_TRIES) reveal();
      else
        setFeedback({
          tone: "bad",
          text: `${sanToPortuguese(san)} não é o lance que a posição pede. Tente de novo${showHint ? "." : " ou peça uma dica."}`,
        });
      return false;
    }
    chess.current.move(san);
    setFen(chess.current.fen());
    setLastMove({ from, to });
    setArrow(null);
    if (verdict.done) {
      setStatus("solved");
      setTimeout(() => playSound("correct"), 150);
      setFeedback({ tone: "ok", text: `Correto! ${drill.why}` });
      onSolved();
      return true;
    }
    setStatus("waiting");
    setFeedback({ tone: "ok", text: "Isso. Agora veja a resposta..." });
    timer.current = window.setTimeout(
      () => {
        const reply = chess.current.move(verdict.reply);
        setFen(chess.current.fen());
        setLastMove({ from: reply.from, to: reply.to });
        setStep(verdict.next);
        setStatus("playing");
        setFeedback({
          tone: "info",
          text: `${sanToPortuguese(reply.san)}. Sua vez de novo.`,
        });
      },
      reducedMotion ? 0 : REPLY_DELAY,
    );
    return true;
  }

  const goalText =
    drill.goal === "empatar"
      ? "Objetivo: empatar"
      : drill.goal === "vencer"
        ? "Objetivo: vencer"
        : "Encontre o lance da linha";

  return (
    <BoardStage
      board={
        <ChessBoard
          id="pratica"
          fen={fen}
          orientation={orientation ?? userSide}
          movableColor={status === "playing" ? userSide : null}
          lastMove={lastMove}
          arrows={
            arrow
              ? [
                  {
                    startSquare: arrow.from,
                    endSquare: arrow.to,
                    color: BOARD_COLORS.arrow,
                  },
                ]
              : []
          }
          onMove={onMove}
        />
      }
      info={
        <>
          {info}
          <div className="flex items-center justify-between gap-3 rounded-control bg-surface-2 px-3 py-2 text-sm">
            <span className="font-semibold text-accent-text">{goalText}</span>
            <span className="text-muted tabular-nums">
              Posição {number} de {total}
              {alreadySolved && " · já resolvida"}
            </span>
          </div>
        </>
      }
      actions={
        <>
          {status === "playing" && !showHint && (
            <button
              type="button"
              onClick={() => setShowHint(true)}
              className={buttonClasses("secondary")}
            >
              Dica
            </button>
          )}
          {status === "playing" && (
            <button
              type="button"
              onClick={reveal}
              className={buttonClasses("ghost")}
            >
              Ver resposta
            </button>
          )}
          {onPrevious && (
            <button
              type="button"
              onClick={onPrevious}
              className={buttonClasses("secondary")}
            >
              Anterior
            </button>
          )}
          {onNext && (
            <button
              type="button"
              onClick={onNext}
              className={buttonClasses(
                status === "solved" || status === "revealed"
                  ? "primary"
                  : "secondary",
              )}
            >
              Próxima posição
            </button>
          )}
        </>
      }
    >
      <p className="text-sm text-muted">
        Jogam as {userSide === "w" ? "brancas" : "pretas"}.
      </p>
      {showHint && status === "playing" && (
        <p className="rounded-control border border-border px-3 py-2 text-sm">
          <span className="font-semibold text-accent-text">Dica:</span>{" "}
          {drill.hint}
        </p>
      )}
      <p
        aria-live="polite"
        className={`min-h-12 leading-relaxed ${
          feedback?.tone === "ok"
            ? "text-success"
            : feedback?.tone === "bad"
              ? "text-danger"
              : "text-text"
        }`}
      >
        {feedback?.text ?? ""}
      </p>
      <MoveInput
        fen={fen}
        disabled={status !== "playing"}
        onMove={(from, to, promotion) => {
          onMove(from as Square, to as Square, promotion);
        }}
        onInvalid={(text) => setFeedback({ tone: "bad", text })}
      />
    </BoardStage>
  );
}
