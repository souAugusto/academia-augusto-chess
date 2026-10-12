// Método do Intensivo: ciclos de repetição de um conjunto de táticas
// (PROMPT_MESTRE.md, seção 6). Sem número fixo de ciclos nem prazo.

export type CycleAttempt = {
  puzzleId: string;
  solved: boolean;
  seconds: number;
};

export type CycleProgress = {
  done: number; // puzzles já feitos neste ciclo
  total: number;
  correct: number;
  seconds: number; // soma do tempo dos puzzles (pausas fora do puzzle não contam)
  nextPuzzleId: string | null; // null = ciclo terminado
  finished: boolean;
};

// items: puzzles do conjunto na ordem. Cada puzzle conta uma vez por ciclo
// (a primeira tentativa); a ordem é sempre a do conjunto.
export function cycleProgress(
  items: string[],
  attempts: CycleAttempt[],
): CycleProgress {
  const first = new Map<string, CycleAttempt>();
  for (const attempt of attempts)
    if (!first.has(attempt.puzzleId)) first.set(attempt.puzzleId, attempt);
  const counted = items.filter((id) => first.has(id));
  const nextPuzzleId = items.find((id) => !first.has(id)) ?? null;
  return {
    done: counted.length,
    total: items.length,
    correct: counted.filter((id) => first.get(id)!.solved).length,
    seconds: counted.reduce((sum, id) => sum + first.get(id)!.seconds, 0),
    nextPuzzleId,
    finished: items.length > 0 && nextPuzzleId === null,
  };
}

// "45s", "3:05", "1:02:03"
export function formatDuration(totalSeconds: number): string {
  const seconds = Math.max(0, Math.round(totalSeconds));
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0)
    return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  if (m > 0) return `${m}:${String(s).padStart(2, "0")}`;
  return `${s}s`;
}

// Diferença para o ciclo anterior: negativo = mais rápido.
export function cycleDelta(
  current: number,
  previous: number | null,
): { seconds: number; faster: boolean } | null {
  if (previous === null) return null;
  return { seconds: current - previous, faster: current < previous };
}
