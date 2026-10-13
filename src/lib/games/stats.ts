import type {
  EndReason,
  GameResult,
  NormalizedGame,
  TimeClass,
} from "./normalize";

// Estatísticas diretas das partidas salvas (sem motor de análise).

export type GameRow = Pick<
  NormalizedGame,
  | "platform"
  | "playedAt"
  | "color"
  | "result"
  | "endReason"
  | "timeClass"
  | "userRating"
  | "openingName"
  | "eco"
  | "moves"
>;

export type Record3 = {
  games: number;
  win: number;
  draw: number;
  loss: number;
  winRate: number; // % de vitórias (0 a 100)
  drawRate: number;
  lossRate: number;
};

const pct = (part: number, total: number) =>
  total ? Math.round((part / total) * 100) : 0;

export function record(games: Pick<GameRow, "result">[]): Record3 {
  const count = (result: GameResult) =>
    games.filter((game) => game.result === result).length;
  const win = count("win");
  const draw = count("draw");
  const loss = count("loss");
  return {
    games: games.length,
    win,
    draw,
    loss,
    winRate: pct(win, games.length),
    drawRate: pct(draw, games.length),
    lossRate: pct(loss, games.length),
  };
}

export type OpeningStat = { name: string; eco: string | null } & Record3;

// Aberturas mais jogadas com uma cor, com a taxa de vitória de cada uma.
export function topOpenings(
  games: GameRow[],
  color: "white" | "black",
  limit = 5,
): OpeningStat[] {
  const groups = new Map<string, GameRow[]>();
  for (const game of games) {
    if (game.color !== color) continue;
    const name = game.openingName ?? (game.eco ? `ECO ${game.eco}` : null);
    if (!name) continue;
    groups.set(name, [...(groups.get(name) ?? []), game]);
  }
  return [...groups.entries()]
    .map(([name, list]) => ({
      name,
      eco: list.find((game) => game.eco)?.eco ?? null,
      ...record(list),
    }))
    .sort((a, b) => b.games - a.games || b.winRate - a.winRate)
    .slice(0, limit);
}

export function endReasons(
  games: GameRow[],
): { reason: EndReason; count: number; percent: number }[] {
  const counts = new Map<EndReason, number>();
  for (const game of games)
    counts.set(game.endReason, (counts.get(game.endReason) ?? 0) + 1);
  return [...counts.entries()]
    .map(([reason, count]) => ({
      reason,
      count,
      percent: pct(count, games.length),
    }))
    .sort((a, b) => b.count - a.count);
}

export function averageMoves(games: GameRow[]): number | null {
  const withMoves = games.filter((game) => game.moves);
  if (withMoves.length === 0) return null;
  return Math.round(
    withMoves.reduce((sum, game) => sum + (game.moves ?? 0), 0) /
      withMoves.length,
  );
}

export type RatingPoint = { date: string; rating: number };

// Evolução do rating por categoria de tempo: um ponto por dia (o último rating do dia).
export function ratingSeries(
  games: GameRow[],
): Partial<Record<TimeClass, RatingPoint[]>> {
  const byClass: Partial<Record<TimeClass, Map<string, RatingPoint>>> = {};
  const sorted = [...games].sort((a, b) =>
    a.playedAt.localeCompare(b.playedAt),
  );
  for (const game of sorted) {
    if (game.userRating === null) continue;
    const date = game.playedAt.slice(0, 10);
    const map = (byClass[game.timeClass] ??= new Map());
    map.set(date, { date, rating: game.userRating });
  }
  return Object.fromEntries(
    Object.entries(byClass).map(([key, map]) => [key, [...map!.values()]]),
  );
}

export type GameStats = {
  overall: Record3;
  byColor: { white: Record3; black: Record3 };
  byTimeClass: { timeClass: TimeClass; record: Record3 }[];
  openings: { white: OpeningStat[]; black: OpeningStat[] };
  endings: ReturnType<typeof endReasons>;
  averageMoves: number | null;
  ratings: ReturnType<typeof ratingSeries>;
};

const CLASS_ORDER: TimeClass[] = [
  "bullet",
  "blitz",
  "rapid",
  "classical",
  "correspondence",
];

export function computeStats(games: GameRow[]): GameStats {
  return {
    overall: record(games),
    byColor: {
      white: record(games.filter((game) => game.color === "white")),
      black: record(games.filter((game) => game.color === "black")),
    },
    byTimeClass: CLASS_ORDER.map((timeClass) => ({
      timeClass,
      record: record(games.filter((game) => game.timeClass === timeClass)),
    })).filter((item) => item.record.games > 0),
    openings: {
      white: topOpenings(games, "white"),
      black: topOpenings(games, "black"),
    },
    endings: endReasons(games),
    averageMoves: averageMoves(games),
    ratings: ratingSeries(games),
  };
}
