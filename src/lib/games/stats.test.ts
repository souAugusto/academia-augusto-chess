import { describe, expect, it } from "vitest";
import {
  computeStats,
  ratingSeries,
  record,
  topOpenings,
  type GameRow,
} from "./stats";

const game = (over: Partial<GameRow>): GameRow => ({
  platform: "lichess",
  playedAt: "2026-10-01T12:00:00.000Z",
  color: "white",
  result: "win",
  endReason: "resign",
  timeClass: "blitz",
  userRating: 1500,
  openingName: "Italian Game",
  eco: "C50",
  moves: 30,
  ...over,
});

const games: GameRow[] = [
  game({}),
  game({ result: "loss", endReason: "mate", moves: 20 }),
  game({ result: "draw", endReason: "repetition", moves: 40 }),
  game({
    color: "black",
    openingName: "Sicilian Defense",
    eco: "B20",
    timeClass: "rapid",
    userRating: 1600,
    playedAt: "2026-10-02T10:00:00.000Z",
  }),
  game({
    color: "black",
    openingName: null,
    eco: "B20",
    result: "loss",
    endReason: "timeout",
    moves: null,
    timeClass: "rapid",
    userRating: 1580,
    playedAt: "2026-10-03T10:00:00.000Z",
  }),
];

describe("record", () => {
  it("conta vitórias, empates e derrotas em porcentagem", () => {
    expect(record(games)).toEqual({
      games: 5,
      win: 2,
      draw: 1,
      loss: 2,
      winRate: 40,
      drawRate: 20,
      lossRate: 40,
    });
    expect(record([]).winRate).toBe(0);
  });
});

describe("topOpenings", () => {
  it("agrupa por abertura e cor, com taxa de vitória", () => {
    expect(topOpenings(games, "white")).toEqual([
      expect.objectContaining({
        name: "Italian Game",
        eco: "C50",
        games: 3,
        winRate: 33,
      }),
    ]);
    // Sem nome, usa o código ECO.
    expect(topOpenings(games, "black").map((item) => item.name)).toEqual([
      "Sicilian Defense",
      "ECO B20",
    ]);
  });
});

describe("computeStats", () => {
  const stats = computeStats(games);

  it("separa por cor e por categoria de tempo", () => {
    expect(stats.byColor.white.games).toBe(3);
    expect(stats.byColor.black).toMatchObject({ games: 2, win: 1, loss: 1 });
    expect(
      stats.byTimeClass.map((item) => [item.timeClass, item.record.games]),
    ).toEqual([
      ["blitz", 3],
      ["rapid", 2],
    ]);
  });

  it("como as partidas terminam e duração média", () => {
    expect(stats.endings[0]).toEqual({
      reason: "resign",
      count: 2,
      percent: 40,
    });
    expect(stats.averageMoves).toBe(30); // (30 + 20 + 40 + 30) / 4
  });

  it("rating por categoria, em ordem de data", () => {
    expect(ratingSeries(games).rapid).toEqual([
      { date: "2026-10-02", rating: 1600 },
      { date: "2026-10-03", rating: 1580 },
    ]);
  });
});
