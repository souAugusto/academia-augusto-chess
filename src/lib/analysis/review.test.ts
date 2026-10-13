import { describe, expect, it } from "vitest";
import {
  classify,
  countByClass,
  criticalMoments,
  gameAccuracy,
  moveAccuracy,
  reviewMoves,
  terminalScore,
} from "./review";
import type { EngineScore } from "./winprob";

const cp = (value: number): EngineScore => ({ kind: "cp", value });

describe("classify", () => {
  it("usa os limites de perda", () => {
    expect(classify(0, true)).toBe("melhor");
    expect(classify(1, false)).toBe("excelente");
    expect(classify(3, false)).toBe("bom");
    expect(classify(7, false)).toBe("imprecisao");
    expect(classify(12, false)).toBe("erro");
    expect(classify(40, false)).toBe("gafe");
  });
});

describe("moveAccuracy", () => {
  it("é 100 sem perda e cai com a perda", () => {
    expect(moveAccuracy(0)).toBeCloseTo(100, 0);
    expect(moveAccuracy(10)).toBeLessThan(70);
    expect(moveAccuracy(100)).toBe(0);
  });
});

describe("reviewMoves", () => {
  // Avaliações fictícias: o segundo lance (das pretas) joga fora a partida.
  const evals = [cp(20), cp(30), cp(250), cp(240), cp(-400)];
  const best = ["e2e4", "e7e5", "d2d4", "a7a6"];
  const played = ["e2e4", "f7f6", "d2d4", "h7h6"];
  const moves = reviewMoves(evals, best, played);

  it("vê cada lance do ponto de vista de quem jogou", () => {
    expect(moves).toHaveLength(4);
    expect(moves[0].cls).toBe("melhor");
    expect(moves[1].color).toBe("b");
    expect(moves[1].loss).toBeGreaterThan(15); // +0.3 -> +2.5 para as brancas
    expect(moves[1].cls).toBe("gafe");
    expect(moves[3].after).toBeGreaterThan(moves[3].before); // pretas melhoraram
    expect(moves[3].loss).toBe(0);
  });

  it("conta classes e acha momentos críticos", () => {
    expect(countByClass(moves, "b").gafe).toBe(1);
    const critical = criticalMoments(moves);
    expect(critical.map((m) => m.ply)).toEqual([1]);
  });

  it("calcula a precisão de cada lado", () => {
    const white = gameAccuracy(moves, "w");
    const black = gameAccuracy(moves, "b");
    expect(white).not.toBeNull();
    expect(black).not.toBeNull();
    expect(white!).toBeGreaterThan(black!);
    expect(gameAccuracy([], "w")).toBeNull();
  });

  it("para quando falta avaliação", () => {
    expect(reviewMoves([cp(0)], ["e2e4"], ["e2e4"])).toHaveLength(0);
  });
});

describe("terminalScore", () => {
  it("dá mate para quem não está na vez e zero no afogamento", () => {
    expect(terminalScore("mate", "b")).toEqual({ kind: "mate", value: 1 });
    expect(terminalScore("mate", "w")).toEqual({ kind: "mate", value: -1 });
    expect(terminalScore("empate", "w")).toEqual({ kind: "cp", value: 0 });
  });
});
