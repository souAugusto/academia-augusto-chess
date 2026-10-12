import { addDays } from "./dates.ts";

// Sequência diária: dias seguidos com algum treino (horário de Brasília).

export type StreakStats = {
  current: number; // dias seguidos até hoje (ou até ontem, se ainda não treinou hoje)
  best: number;
  trainedToday: boolean;
};

// days: datas "AAAA-MM-DD" (podem vir repetidas e fora de ordem).
export function streakStats(days: string[], today: string): StreakStats {
  const set = new Set(days);
  const sorted = [...set].sort();

  let best = 0;
  let run = 0;
  let previous: string | null = null;
  for (const day of sorted) {
    run = previous !== null && addDays(previous, 1) === day ? run + 1 : 1;
    best = Math.max(best, run);
    previous = day;
  }

  const trainedToday = set.has(today);
  // A sequência continua viva durante o dia de hoje, mesmo antes do primeiro treino.
  let cursor = trainedToday ? today : addDays(today, -1);
  let current = 0;
  while (set.has(cursor)) {
    current += 1;
    cursor = addDays(cursor, -1);
  }
  return { current, best, trainedToday };
}

// Últimos `count` dias, do mais antigo para hoje, com a marcação de treino.
export function recentDays(
  days: string[],
  today: string,
  count: number,
): { day: string; trained: boolean }[] {
  const set = new Set(days);
  return Array.from({ length: count }, (_, index) => {
    const day = addDays(today, index - count + 1);
    return { day, trained: set.has(day) };
  });
}
