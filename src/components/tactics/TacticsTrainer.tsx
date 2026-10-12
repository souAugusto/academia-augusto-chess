"use client";

import {
  useCallback,
  useEffect,
  useId,
  useState,
  useTransition,
  type ReactNode,
} from "react";
import {
  getNextPuzzle,
  getNextReviewPuzzle,
  submitPuzzleAttempt,
  type AttemptResult,
} from "@/app/(app)/taticas/actions";
import { BoardStage } from "@/components/chess/BoardStage";
import {
  PuzzleBoard,
  type PuzzleOutcome,
} from "@/components/chess/PuzzleBoard";
import { buttonClasses } from "@/components/ui/button";
import { Card } from "@/components/ui/Card";
import { THEME_FILTERS, themeLabel } from "@/lib/chess/themes";
import type { TacticPuzzle } from "@/lib/data/tactics";
import { DIFFICULTIES, type Difficulty } from "@/lib/rating";

type Mode = "livre" | "revisao";

type TacticsTrainerProps = {
  initialRating: number;
  initialSolved: number;
  initialMode: Mode;
  initialReviewDue: number;
  title: ReactNode;
};

export function TacticsTrainer({
  initialRating,
  initialSolved,
  initialMode,
  initialReviewDue,
  title,
}: TacticsTrainerProps) {
  const [mode, setMode] = useState<Mode>(
    initialMode === "revisao" && initialReviewDue > 0 ? "revisao" : "livre",
  );
  const [reviewLeft, setReviewLeft] = useState(initialReviewDue);
  const [rating, setRating] = useState(initialRating);
  const [solvedCount, setSolvedCount] = useState(initialSolved);
  const [theme, setTheme] = useState<string | null>(null);
  const [difficulty, setDifficulty] = useState<Difficulty>("medio");
  const [puzzle, setPuzzle] = useState<TacticPuzzle | null>(null);
  const [result, setResult] = useState<AttemptResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, startLoading] = useTransition();
  const themeId = useId();

  const load = useCallback(
    (nextTheme: string | null, nextDifficulty: Difficulty) => {
      startLoading(async () => {
        setResult(null);
        setError(null);
        const response = await getNextPuzzle({
          theme: nextTheme,
          difficulty: nextDifficulty,
        });
        if (response.ok) setPuzzle(response.puzzle);
        else {
          setPuzzle(null);
          setError(response.error);
        }
      });
    },
    [],
  );

  // Revisão de hoje: só os erros que já venceram, um de cada vez.
  const loadReview = useCallback((skip: string | null) => {
    startLoading(async () => {
      setResult(null);
      setError(null);
      const response = await getNextReviewPuzzle({ skip });
      if (!response.ok) {
        setPuzzle(null);
        setError(response.error);
        return;
      }
      setReviewLeft(response.remaining);
      setPuzzle(response.puzzle);
      if (!response.puzzle)
        setError(
          "Revisão de hoje concluída. Volte amanhã ou siga no treino livre.",
        );
    });
  }, []);

  function next() {
    if (mode === "revisao") loadReview(puzzle?.id ?? null);
    else load(theme, difficulty);
  }

  function switchMode(value: Mode) {
    setMode(value);
    if (value === "revisao") loadReview(null);
    else load(theme, difficulty);
  }

  useEffect(() => {
    if (mode === "revisao") loadReview(null);
    else load(theme, difficulty);
    // Só no primeiro carregamento; depois, os filtros chamam `load` direto.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleOutcome(outcome: PuzzleOutcome) {
    if (!puzzle) return;
    const response = await submitPuzzleAttempt({
      puzzleId: puzzle.id,
      moves: outcome.moves,
      seconds: outcome.seconds,
    });
    if (!response.ok) {
      setError(response.error);
      return;
    }
    setResult(response);
    setRating(response.ratingAfter);
    if (response.rated && response.solved) setSolvedCount((count) => count + 1);
  }

  const delta = result ? result.ratingAfter - result.ratingBefore : 0;

  // Rating do puzzle e do aluno na mesma linha, no topo do painel.
  const stats = (
    <div className="flex items-end justify-between gap-4 rounded-control bg-surface-2 px-3 py-2">
      <div className="flex flex-col">
        <span className="text-xs text-muted">Rating do puzzle</span>
        <span className="font-display text-2xl font-semibold tabular-nums">
          {puzzle ? puzzle.rating : "—"}
        </span>
      </div>
      <div className="flex flex-col items-end">
        <span className="text-xs text-muted">Seu rating de táticas</span>
        <span className="font-display text-2xl font-semibold tabular-nums">
          {rating}
          {result?.rated && (
            <span
              className={`ml-2 text-sm ${delta >= 0 ? "text-success" : "text-danger"}`}
            >
              {delta >= 0 ? `+${delta}` : delta}
            </span>
          )}
        </span>
      </div>
    </div>
  );

  const resultBox = result && (
    <div
      className={`flex flex-col gap-1 rounded-control border px-3 py-2 ${result.solved ? "border-success" : "border-danger"}`}
    >
      <p aria-live="polite" className="font-semibold">
        {result.solved ? "Puzzle resolvido" : "Puzzle não resolvido"}
      </p>
      {!result.rated && (
        <p className="text-sm text-muted">
          Você já tinha tentado este puzzle: o rating não mudou.
        </p>
      )}
    </div>
  );

  const nextAction = result ? (
    <button type="button" onClick={next} className={buttonClasses("primary")}>
      Próximo puzzle
    </button>
  ) : (
    puzzle && (
      <button
        type="button"
        onClick={next}
        disabled={loading}
        className={buttonClasses("ghost")}
      >
        Pular este puzzle
      </button>
    )
  );

  const modeSwitch = (
    <div
      role="tablist"
      aria-label="Tipo de treino"
      className="grid grid-cols-2 gap-1 rounded-control bg-surface-2 p-1"
    >
      {(
        [
          ["livre", "Treino livre"],
          ["revisao", `Revisão de hoje (${reviewLeft})`],
        ] as const
      ).map(([value, label]) => (
        <button
          key={value}
          type="button"
          role="tab"
          aria-selected={mode === value}
          onClick={() => switchMode(value)}
          className={`min-h-touch rounded-[0.6rem] text-sm font-semibold transition ${
            mode === value
              ? "bg-accent text-on-accent"
              : "text-muted hover:text-text"
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );

  const filters =
    mode === "revisao" ? (
      <Card className="flex flex-col gap-3">
        {modeSwitch}
        <p className="text-sm text-muted">
          Puzzles que você errou voltam em intervalos cada vez maiores conforme
          você acerta.
        </p>
      </Card>
    ) : (
      <Card className="flex flex-col gap-4">
        {modeSwitch}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
          <fieldset className="flex flex-1 flex-col gap-2">
            <legend className="mb-2 text-sm font-semibold">Dificuldade</legend>
            <div className="grid grid-cols-3 gap-1 rounded-control bg-surface-2 p-1">
              {DIFFICULTIES.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  aria-pressed={difficulty === option.id}
                  onClick={() => {
                    setDifficulty(option.id);
                    load(theme, option.id);
                  }}
                  className={`min-h-touch rounded-[0.6rem] text-sm font-semibold transition ${
                    difficulty === option.id
                      ? "bg-accent text-on-accent"
                      : "text-muted hover:text-text"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </fieldset>

          <div className="flex flex-1 flex-col gap-2">
            <label htmlFor={themeId} className="text-sm font-semibold">
              Tema
            </label>
            <select
              id={themeId}
              value={theme ?? ""}
              onChange={(event) => {
                const value = event.target.value || null;
                setTheme(value);
                load(value, difficulty);
              }}
              className="min-h-touch rounded-control border border-border-strong bg-surface px-3 text-base text-text"
            >
              <option value="">Todos os temas</option>
              {THEME_FILTERS.map((id) => (
                <option key={id} value={id}>
                  {themeLabel(id)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>
    );

  const below = (
    <div className="flex flex-col gap-3">
      {error && puzzle && (
        <p role="alert" className="text-sm text-danger">
          {error}
        </p>
      )}
      {filters}
      <p className="text-sm text-muted">{solvedCount} resolvidos</p>
    </div>
  );

  if (!puzzle)
    return (
      <BoardStage
        board={
          <div className="board-frame flex items-center justify-center bg-surface text-muted">
            {loading
              ? "Carregando puzzle..."
              : (error ?? "Escolha um filtro para começar.")}
          </div>
        }
        info={
          <>
            <div className="flex flex-col gap-1">{title}</div>
            {stats}
          </>
        }
        below={below}
      />
    );

  return (
    <PuzzleBoard
      key={puzzle.id}
      puzzle={puzzle}
      onOutcome={handleOutcome}
      title={title}
      stats={stats}
      result={resultBox}
      extraActions={nextAction}
      below={below}
    />
  );
}
