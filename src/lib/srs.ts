// Revisão espaçada dos erros (variação simples do SM-2, PROMPT_MESTRE.md, seção 6).

export type ReviewState = {
  ease: number;
  intervalDays: number;
  repetitions: number;
  lapses: number;
  dueAt: Date;
};

export const INITIAL_REVIEW: Omit<ReviewState, "dueAt"> = {
  ease: 2.5,
  intervalDays: 0,
  repetitions: 0,
  lapses: 0,
};

const MIN_EASE = 1.3;
const DAY_MS = 24 * 60 * 60 * 1000;
const RETRY_MS = 10 * 60 * 1000;
// "Muito mais rápido que a mediana": abaixo de metade do tempo mediano.
const FAST_FACTOR = 0.5;

type ReviewInput = {
  previous: Omit<ReviewState, "dueAt"> | null;
  solved: boolean;
  seconds: number;
  medianSeconds: number | null; // mediana do próprio aluno naquele puzzle
  now: Date;
};

export function nextReview({
  previous,
  solved,
  seconds,
  medianSeconds,
  now,
}: ReviewInput): ReviewState {
  const state = previous ?? INITIAL_REVIEW;

  if (!solved) {
    return {
      ease: Math.max(MIN_EASE, round2(state.ease - 0.2)),
      intervalDays: 0,
      repetitions: 0,
      lapses: state.lapses + 1,
      dueAt: new Date(now.getTime() + RETRY_MS),
    };
  }

  const repetitions = state.repetitions + 1;
  const intervalDays =
    repetitions === 1
      ? 1
      : repetitions === 2
        ? 3
        : Math.round(state.intervalDays * state.ease);
  const fast = medianSeconds !== null && seconds < medianSeconds * FAST_FACTOR;
  return {
    ease: fast ? round2(state.ease + 0.05) : state.ease,
    intervalDays,
    repetitions,
    lapses: state.lapses,
    dueAt: new Date(now.getTime() + intervalDays * DAY_MS),
  };
}

export function median(values: number[]): number | null {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2
    ? sorted[middle]
    : (sorted[middle - 1] + sorted[middle]) / 2;
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}
