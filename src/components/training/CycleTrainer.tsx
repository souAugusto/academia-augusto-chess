"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition, type ReactNode } from "react";
import {
  recordCycleAttempt,
  type CycleAttemptResult,
} from "@/app/(app)/treino/actions";
import { BoardStage } from "@/components/chess/BoardStage";
import {
  PuzzleBoard,
  type PuzzleOutcome,
} from "@/components/chess/PuzzleBoard";
import { buttonClasses } from "@/components/ui/button";
import { cycleDelta, formatDuration, type CycleProgress } from "@/lib/cycles";
import type { CycleHistory } from "@/lib/data/training";
import type { TacticPuzzle } from "@/lib/data/tactics";

type CycleTrainerProps = {
  setId: string;
  title: ReactNode;
  cycleNumber: number;
  progress: CycleProgress;
  puzzle: TacticPuzzle | null;
  history: CycleHistory[];
  below?: ReactNode;
};

// Relógio fora da renderização: só chamado em timers e eventos.
const clock = () => Date.now();

export function CycleTrainer({
  setId,
  title,
  cycleNumber,
  progress: initialProgress,
  puzzle,
  history,
  below,
}: CycleTrainerProps) {
  const router = useRouter();
  const [progress, setProgress] = useState(initialProgress);
  const [answer, setAnswer] = useState<Extract<
    CycleAttemptResult,
    { ok: true }
  > | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [startedAt, setStartedAt] = useState(0);
  const [now, setNow] = useState(0);
  const [loading, startLoading] = useTransition();

  // Cronômetro do puzzle: começa quando a tela abre e para quando ele é respondido.
  useEffect(() => {
    const start = window.setTimeout(() => {
      const t = clock();
      setStartedAt(t);
      setNow(t);
    }, 0);
    const tick = window.setInterval(() => setNow(clock()), 1000);
    return () => {
      window.clearTimeout(start);
      window.clearInterval(tick);
    };
  }, []);

  const elapsed =
    answer || !startedAt ? 0 : Math.max(0, (now - startedAt) / 1000);
  const previous = history[0]?.seconds ?? null;
  const justFinished =
    progress.done === 0 && history.length > 0 ? history[0] : null;

  async function handleOutcome(outcome: PuzzleOutcome) {
    if (!puzzle) return;
    const response = await recordCycleAttempt({
      setId,
      puzzleId: puzzle.id,
      moves: outcome.moves,
      seconds: outcome.seconds,
    });
    if (!response.ok) {
      setError(response.error);
      return;
    }
    setAnswer(response);
    setProgress(response.progress);
  }

  // Próximo puzzle (ou próximo ciclo): o servidor devolve a página atualizada.
  function next() {
    startLoading(() => router.refresh());
  }

  const timers = (
    <div className="grid grid-cols-3 gap-2 rounded-control bg-surface-2 px-3 py-2 text-center">
      <Timer label="Puzzle" seconds={elapsed} />
      <Timer
        label={`Ciclo ${cycleNumber}`}
        seconds={progress.seconds + elapsed}
      />
      <Timer label="Ciclo anterior" seconds={previous} />
    </div>
  );

  const stats = (
    <>
      <div className="flex items-center justify-between gap-3 text-sm">
        <span className="font-semibold text-accent-text">
          Ciclo {cycleNumber}
        </span>
        <span className="text-muted tabular-nums">
          Puzzle {Math.min(progress.done + (answer ? 0 : 1), progress.total)} de{" "}
          {progress.total} · {progress.correct} acertos
        </span>
      </div>
      {timers}
    </>
  );

  const cycleSummary = (
    cycle: CycleHistory,
    delta: ReturnType<typeof cycleDelta>,
  ) => (
    <div className="flex flex-col gap-1 rounded-control border border-accent px-3 py-2">
      <p className="font-semibold">
        Ciclo {cycle.number} concluído em {formatDuration(cycle.seconds)}
      </p>
      <p className="text-sm text-muted">
        {cycle.correct} de {cycle.total} acertos
        {delta &&
          ` · ${delta.faster ? "mais rápido" : "mais lento"} que o anterior (${formatDuration(Math.abs(delta.seconds))})`}
      </p>
    </div>
  );

  const resultBox = (
    <>
      {justFinished &&
        !answer &&
        cycleSummary(
          justFinished,
          cycleDelta(justFinished.seconds, history[1]?.seconds ?? null),
        )}
      {answer && (
        <p
          aria-live="polite"
          className={`font-semibold ${answer.solved ? "text-success" : "text-danger"}`}
        >
          {answer.solved
            ? "Resolvido."
            : "Não resolvido: veja a solução no tabuleiro."}
        </p>
      )}
      {answer?.cycleFinished &&
        cycleSummary(
          {
            number: answer.cycleNumber,
            seconds: answer.progress.seconds,
            correct: answer.progress.correct,
            total: answer.progress.total,
            finishedAt: "",
          },
          cycleDelta(answer.progress.seconds, previous),
        )}
      {error && (
        <p role="alert" className="text-sm text-danger">
          {error}
        </p>
      )}
    </>
  );

  const nextAction = answer && (
    <button
      type="button"
      onClick={next}
      disabled={loading}
      className={buttonClasses("primary")}
    >
      {answer.cycleFinished
        ? `Começar ciclo ${cycleNumber + 1}`
        : "Próximo puzzle"}
    </button>
  );

  if (!puzzle)
    return (
      <BoardStage
        board={
          <div className="board-frame flex items-center justify-center bg-surface p-6 text-center text-muted">
            Este conjunto não tem puzzles disponíveis.
          </div>
        }
        info={<div className="flex flex-col gap-1">{title}</div>}
        below={below}
      />
    );

  return (
    <PuzzleBoard
      puzzle={puzzle}
      onOutcome={handleOutcome}
      title={title}
      stats={stats}
      result={resultBox}
      extraActions={nextAction}
      below={below}
      revealOnMistake
      hideHelp
    />
  );
}

function Timer({ label, seconds }: { label: string; seconds: number | null }) {
  return (
    <div className="flex flex-col">
      <span className="text-xs text-muted">{label}</span>
      <span className="font-display text-xl font-semibold tabular-nums">
        {seconds === null ? "—" : formatDuration(seconds)}
      </span>
    </div>
  );
}
