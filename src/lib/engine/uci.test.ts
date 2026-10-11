import { describe, expect, it } from "vitest";
import {
  formatScore,
  parseBestMove,
  parseInfo,
  scoreFor,
  scoreToCp,
} from "./uci";

describe("parseInfo", () => {
  it("lê profundidade, avaliação e linha principal", () => {
    expect(
      parseInfo(
        "info depth 18 seldepth 24 multipv 1 score cp -34 nodes 1000 nps 5 pv e2e4 e7e5 g1f3",
      ),
    ).toEqual({
      depth: 18,
      score: { kind: "cp", value: -34 },
      pv: ["e2e4", "e7e5", "g1f3"],
    });
  });

  it("lê mate", () => {
    expect(parseInfo("info depth 9 score mate 3 pv h5f7")?.score).toEqual({
      kind: "mate",
      value: 3,
    });
  });

  it("ignora linhas sem avaliação ou com limite parcial", () => {
    expect(parseInfo("info string NNUE evaluation")).toBeNull();
    expect(parseInfo("info depth 5 score cp 20 lowerbound pv e2e4")).toBeNull();
    expect(parseInfo("bestmove e2e4")).toBeNull();
  });
});

describe("parseBestMove", () => {
  it("lê o melhor lance", () => {
    expect(parseBestMove("bestmove e2e4 ponder e7e5")).toBe("e2e4");
    expect(parseBestMove("bestmove (none)")).toBeNull();
    expect(parseBestMove("info depth 1")).toBeUndefined();
  });
});

describe("scoreFor e scoreToCp", () => {
  it("troca o sinal quando a perspectiva é do outro lado", () => {
    expect(scoreFor({ kind: "cp", value: 50 }, "b", "w")).toEqual({
      kind: "cp",
      value: -50,
    });
    expect(scoreFor({ kind: "cp", value: 50 }, "w", "w")).toEqual({
      kind: "cp",
      value: 50,
    });
  });

  it("mate curto vale mais que mate longo, e levar mate vale muito pouco", () => {
    expect(scoreToCp({ kind: "mate", value: 2 })).toBeGreaterThan(
      scoreToCp({ kind: "mate", value: 7 }),
    );
    expect(scoreToCp({ kind: "mate", value: -2 })).toBeLessThan(
      scoreToCp({ kind: "cp", value: -900 }),
    );
    expect(scoreToCp({ kind: "mate", value: 0 })).toBe(-10_000);
  });
});

describe("formatScore", () => {
  it("formata para a barra de avaliação", () => {
    expect(formatScore({ kind: "cp", value: 123 })).toBe("+1.2");
    expect(formatScore({ kind: "cp", value: -40 })).toBe("-0.4");
    expect(formatScore({ kind: "mate", value: 3 })).toBe("M3");
    expect(formatScore({ kind: "mate", value: -2 })).toBe("-M2");
  });
});
