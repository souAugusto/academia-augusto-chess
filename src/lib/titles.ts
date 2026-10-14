// Títulos por nível do rating de táticas (escada na tabela `titles`).
// - Só são concedidos a partir de 30 puzzles contados (evita título por sorte).
// - São permanentes: se o rating cair, o aluno mantém o título.
// - O título exibido é o mais alto já conquistado.

export const TITLE_MIN_GAMES = 30;

export type Title = {
  id: number;
  slug: string;
  name: string;
  minRating: number;
  tagline: string | null;
  color: string;
};

const byRating = (a: Title, b: Title) => a.minRating - b.minRating;

// Títulos que o aluno passa a merecer com este rating (todos até o nível dele).
export function eligibleTitles(
  ladder: Title[],
  rating: number,
  games: number,
): Title[] {
  if (games < TITLE_MIN_GAMES) return [];
  return ladder.filter((title) => title.minRating <= rating).sort(byRating);
}

// O título exibido: o mais alto entre os conquistados.
export function currentTitle(
  ladder: Title[],
  earnedIds: Set<number>,
): Title | null {
  const earned = ladder.filter((title) => earnedIds.has(title.id));
  return earned.sort(byRating).at(-1) ?? null;
}

export type TitleProgress =
  | { kind: "calibrando"; games: number; needed: number }
  | { kind: "proximo"; next: Title; missing: number; percent: number }
  | { kind: "topo" };

// Barra do painel: calibrando, quanto falta para o próximo ou topo da escada.
export function titleProgress(
  ladder: Title[],
  rating: number,
  games: number,
  current: Title | null,
): TitleProgress {
  if (games < TITLE_MIN_GAMES)
    return { kind: "calibrando", games, needed: TITLE_MIN_GAMES };
  const sorted = [...ladder].sort(byRating);
  const floor = current?.minRating ?? 0;
  const next = sorted.find(
    (title) => title.minRating > Math.max(floor, rating),
  );
  if (!next) return { kind: "topo" };
  const previous =
    [...sorted].reverse().find((title) => title.minRating <= rating)
      ?.minRating ?? 0;
  const span = Math.max(1, next.minRating - previous);
  const percent = Math.round(
    Math.min(100, Math.max(0, ((rating - previous) / span) * 100)),
  );
  return { kind: "proximo", next, missing: next.minRating - rating, percent };
}
