"use client";

import { useCallback, useEffect, useId, useState, useTransition } from "react";
import {
  getNextPuzzle,
  submitPuzzleAttempt,
  type AttemptResult,
} from "@/app/(app)/taticas/actions";
import {
  PuzzleBoard,
  type PuzzleOutcome,
} from "@/components/chess/PuzzleBoard";
import { buttonClasses } from "@/components/ui/button";
import { Card } from "@/components/ui/Card";
import { THEME_FILTERS, themeLabel } from "@/lib/chess/themes";
import type { TacticPuzzle } from "@/lib/data/tactics";
import { DIFFICULTIES, type Difficulty } from "@/lib/rating";

type TacticsTrainerProps = { initialRating: number; initialSolved: number };

export function TacticsTrainer({
  initialRating,
  initialSolved,
}: TacticsTrainerProps) {
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

  useEffect(() => {
    load(theme, difficulty);
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

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
      <div className="mx-auto flex w-full max-w-[600px] flex-col gap-4">
        {puzzle ? (
          <PuzzleBoard
            key={puzzle.id}
            puzzle={puzzle}
            onOutcome={handleOutcome}
          />
        ) : (
          <div className="flex aspect-square items-center justify-center rounded-control border border-border bg-surface text-muted">
            {loading
              ? "Carregando puzzle..."
              : (error ?? "Escolha um filtro para começar.")}
          </div>
        )}
      </div>

      <aside className="flex flex-col gap-5">
        <Card className="flex items-end justify-between gap-4">
          <div className="flex flex-col gap-1">
            <span className="text-sm text-muted">Seu rating de táticas</span>
            <span className="font-display text-4xl font-semibold tabular-nums">
              {rating}
            </span>
          </div>
          <span className="text-sm text-muted">{solvedCount} resolvidos</span>
        </Card>

        {result && (
          <Card
            className={`flex flex-col gap-3 ${result.solved ? "border-success" : "border-danger"}`}
          >
            <p aria-live="polite" className="font-semibold">
              {result.solved ? "Puzzle resolvido" : "Puzzle não resolvido"}
              {result.rated && (
                <span
                  className={`ml-2 tabular-nums ${delta >= 0 ? "text-success" : "text-danger"}`}
                >
                  {delta >= 0 ? `+${delta}` : delta}
                </span>
              )}
            </p>
            {!result.rated && (
              <p className="text-sm text-muted">
                Você já tinha tentado este puzzle: o rating não mudou.
              </p>
            )}
            {puzzle && (
              <p className="text-sm text-muted">
                Rating do puzzle: {puzzle.rating}
              </p>
            )}
            <button
              type="button"
              onClick={() => load(theme, difficulty)}
              className={buttonClasses("primary")}
            >
              Próximo puzzle
            </button>
          </Card>
        )}

        {error && puzzle && (
          <p role="alert" className="text-sm text-danger">
            {error}
          </p>
        )}

        <Card className="flex flex-col gap-4">
          <fieldset className="flex flex-col gap-2">
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

          <div className="flex flex-col gap-2">
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

          {!result && puzzle && (
            <button
              type="button"
              onClick={() => load(theme, difficulty)}
              disabled={loading}
              className={buttonClasses("ghost", "md", "self-start")}
            >
              Pular este puzzle
            </button>
          )}
        </Card>
      </aside>
    </div>
  );
}
