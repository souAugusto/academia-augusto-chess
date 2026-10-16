import { describe, expect, it } from "vitest";
import {
  decodeAnalysis,
  decodeScore,
  encodeAnalysis,
  encodeScore,
} from "./compact";
import { gameFromUcis, parsePgn, sansToUcis } from "./pgn";

const PGN = `[Event "Teste"]
[White "Ana"]
[Black "Bruno"]
[Result "1-0"]

1. e4 e5 2. Bc4 Nc6 3. Qh5 Nf6 4. Qxf7# 1-0`;

describe("parsePgn", () => {
  it("lê cabeçalhos, lances e o fim por mate", () => {
    const result = parsePgn(PGN);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.game.headers.White).toBe("Ana");
    expect(result.game.sans).toEqual([
      "e4",
      "e5",
      "Bc4",
      "Nc6",
      "Qh5",
      "Nf6",
      "Qxf7#",
    ]);
    expect(result.game.ucis[0]).toBe("e2e4");
    expect(result.game.fens).toHaveLength(8);
    expect(result.game.ending).toBe("mate");
  });

  it("recusa texto vazio, inválido ou grande demais", () => {
    expect(parsePgn("   ")).toEqual({ ok: false, error: "vazio" });
    expect(parsePgn("1. e4 e5 2. Kxe8")).toEqual({
      ok: false,
      error: "invalido",
    });
    expect(parsePgn("x".repeat(30_000))).toEqual({
      ok: false,
      error: "grande",
    });
  });
});

describe("conversões de lances", () => {
  it("vai de SAN para UCI e de volta", () => {
    const ucis = sansToUcis(["e4", "e5", "Nf3"]);
    expect(ucis).toEqual(["e2e4", "e7e5", "g1f3"]);
    const game = gameFromUcis(ucis!);
    expect(game?.sans).toEqual(["e4", "e5", "Nf3"]);
    expect(sansToUcis(["e4", "e4"])).toBeNull();
    expect(gameFromUcis(["e2e5"])).toBeNull();
  });
});

describe("formato compacto", () => {
  it("guarda e recupera avaliações, inclusive mates", () => {
    for (const score of [
      { kind: "cp", value: 35 },
      { kind: "cp", value: -1200 },
      { kind: "mate", value: 3 },
      { kind: "mate", value: -2 },
    ] as const)
      expect(decodeScore(encodeScore(score))).toEqual(score);
  });

  it("ida e volta de uma análise inteira (versão 2)", () => {
    const data = {
      version: 2 as const,
      depth: 16,
      moves: ["e2e4", "e7e5"],
      evals: [
        { kind: "cp" as const, value: 20 },
        { kind: "cp" as const, value: 30 },
        { kind: "mate" as const, value: 5 },
      ],
      best: ["e2e4", null, "g1f3"],
      pv: [["e2e4", "e7e5"], [], ["g1f3"]],
      deep: {
        0: [
          { move: "e2e4", score: { kind: "cp" as const, value: 20 }, pv: ["e2e4"] },
          { move: "d2d4", score: { kind: "cp" as const, value: 15 }, pv: ["d2d4", "d7d5"] },
        ],
      },
    };
    expect(decodeAnalysis(encodeAnalysis(data))).toEqual(data);
    expect(decodeAnalysis({ v: 3 })).toBeNull();
    expect(decodeAnalysis(null)).toBeNull();
  });

  it("lê análises antigas (versão 1) sem linhas", () => {
    const old = { v: 1, d: 14, m: "e2e4 e7e5", e: [20, 30, 25], b: "e2e4 - g1f3", s: "nmm" };
    const data = decodeAnalysis(old);
    expect(data?.version).toBe(1);
    expect(data?.pv).toEqual([]);
    expect(data?.best).toEqual(["e2e4", null, "g1f3"]);
  });
});
