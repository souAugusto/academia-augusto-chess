import { describe, expect, it } from "vitest";
import {
  difficultyRange,
  expectedScore,
  INITIAL_RATING,
  nextRating,
} from "./rating";

describe("expectedScore", () => {
  it("é 50% entre ratings iguais", () => {
    expect(expectedScore(1500, 1500)).toBeCloseTo(0.5);
  });

  it("cai contra puzzle mais forte", () => {
    expect(expectedScore(1500, 1900)).toBeCloseTo(0.0909, 3);
  });
});

describe("nextRating", () => {
  const novato = { rating: INITIAL_RATING, games: 0 };

  it("sobe ao resolver e conta a partida", () => {
    expect(nextRating(novato, 1500, true)).toEqual({ rating: 1520, games: 1 });
  });

  it("desce ao errar", () => {
    expect(nextRating(novato, 1500, false)).toEqual({ rating: 1480, games: 1 });
  });

  it("muda menos depois do período provisório", () => {
    expect(nextRating({ rating: 1500, games: 50 }, 1500, true).rating).toBe(
      1510,
    );
  });

  it("ganha pouco ao resolver puzzle muito fácil", () => {
    expect(nextRating({ rating: 1800, games: 50 }, 1000, true).rating).toBe(
      1800,
    );
  });

  it("respeita os limites", () => {
    expect(nextRating({ rating: 405, games: 50 }, 405, false).rating).toBe(400);
    expect(nextRating({ rating: 3195, games: 50 }, 3195, true).rating).toBe(
      3200,
    );
  });
});

describe("difficultyRange", () => {
  it("monta faixas em volta do rating do aluno", () => {
    expect(difficultyRange(1500, "medio")).toEqual({ min: 1400, max: 1600 });
    expect(difficultyRange(1500, "facil")).toEqual({ min: 1150, max: 1400 });
  });
});

describe("nextRating: valores esperados", () => {
  // K = 40 nos 30 primeiros puzzles; K = 20 depois.
  it("puzzle mais difícil (+400): acerto vale muito, erro custa pouco", () => {
    expect(nextRating({ rating: 1500, games: 0 }, 1900, true).rating).toBe(
      1536,
    );
    expect(nextRating({ rating: 1500, games: 0 }, 1900, false).rating).toBe(
      1496,
    );
  });
  it("puzzle mais fácil (-400): acerto vale pouco, erro custa muito", () => {
    expect(nextRating({ rating: 1500, games: 0 }, 1100, true).rating).toBe(
      1504,
    );
    expect(nextRating({ rating: 1500, games: 0 }, 1100, false).rating).toBe(
      1464,
    );
  });
  it("mesmo nível, depois do período provisório: ±10", () => {
    expect(nextRating({ rating: 1600, games: 50 }, 1600, true).rating).toBe(
      1610,
    );
    expect(nextRating({ rating: 1600, games: 50 }, 1600, false).rating).toBe(
      1590,
    );
  });
});
