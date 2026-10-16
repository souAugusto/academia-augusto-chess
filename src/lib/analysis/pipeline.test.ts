import { describe, expect, it } from "vitest";
import { commentFor } from "./comments";
import { buildReport } from "./report";
import { gameFromUcis } from "./pgn";
import { runAnalysis, type EngineLike } from "./pipeline";
import { ANALYSIS_PROFILE, deepAnalysisText } from "./profile";
import { positionKey, theoryOf, type OpeningBook } from "./theory";

// Motor falso e determinístico: a avaliação depende só da posição.
function fakeEngine() {
  const calls: { fen: string; depth: number; multipv: number }[] = [];
  let newGames = 0;
  const engine: EngineLike = {
    newGame: () => {
      newGames++;
    },
    analyseDepth: async (fen, options) => {
      calls.push({ fen, depth: options.depth, multipv: options.multipv ?? 1 });
      const seed = [...fen].reduce((s, c) => (s * 31 + c.charCodeAt(0)) % 997, 7);
      const lines = Array.from({ length: options.multipv ?? 1 }, (_, k) => ({
        move: ["e2e4", "d2d4", "c2c4"][k] ?? "e2e4",
        score: { kind: "cp" as const, value: (seed % 60) - 30 - k * 40 },
        pv: [["e2e4", "d2d4", "c2c4"][k] ?? "e2e4"],
      }));
      return { lines, cancelled: false };
    },
  };
  return { engine, calls, newGames: () => newGames };
}

const MOVES = ["e2e4", "e7e5", "g1f3", "b8c6", "f1c4", "g8f6"];

describe("runAnalysis", () => {
  it("mesma partida, mesma análise (determinismo)", async () => {
    const game = gameFromUcis(MOVES)!;
    const run = async () => {
      const fake = fakeEngine();
      const result = await runAnalysis({
        fens: game.fens,
        moves: game.ucis,
        ending: null,
        bookPlies: 0,
        engine: fake.engine,
      });
      return { result, fake };
    };
    const a = await run();
    const b = await run();
    expect(a.result).toEqual(b.result);
    expect(a.result.complete).toBe(true);
    expect(a.fake.newGames()).toBe(1);
    // Passagem 1 com a profundidade do perfil e 1 linha em todas as posições.
    const pass1 = a.fake.calls.filter((c) => c.multipv === 1);
    expect(pass1).toHaveLength(game.fens.length);
    expect(pass1.every((c) => c.depth === ANALYSIS_PROFILE.depth)).toBe(true);
    // Passagem 2 (se houver) só com várias linhas e no limite do perfil.
    const pass2 = a.fake.calls.filter((c) => c.multipv > 1);
    expect(pass2.length).toBeLessThanOrEqual(ANALYSIS_PROFILE.maxDeepPositions);
    expect(pass2.every((c) => c.multipv === ANALYSIS_PROFILE.deepLines)).toBe(true);
  });

  it("avisa o progresso e para quando cancelado", async () => {
    const game = gameFromUcis(MOVES)!;
    const controller = new AbortController();
    const fake = fakeEngine();
    const seen: number[] = [];
    const result = await runAnalysis({
      fens: game.fens,
      moves: game.ucis,
      ending: null,
      bookPlies: 0,
      engine: fake.engine,
      signal: controller.signal,
      onUpdate: (data, progress) => {
        seen.push(progress.done);
        if (progress.done === 3) controller.abort();
      },
    });
    expect(seen).toEqual([1, 2, 3]);
    expect(result.complete).toBe(false);
    expect(result.evals).toHaveLength(3);
  });
});

describe("perfil", () => {
  it("o texto do selo sai da constante", () => {
    const text = deepAnalysisText();
    expect(text).toContain(`profundidade ${ANALYSIS_PROFILE.depth}`);
    expect(text).toContain(`${ANALYSIS_PROFILE.deepLines} linhas candidatas`);
    expect(text).toContain(ANALYSIS_PROFILE.engineName);
  });
});

describe("teoria", () => {
  it("conta os lances seguidos que estão no livro e acha o nome", () => {
    const game = gameFromUcis(["e2e4", "e7e6", "d2d4", "a7a6"])!;
    const book: OpeningBook = {
      v: 1,
      names: ["C00 · French Defense"],
      book: {
        [positionKey(game.fens[1])]: -1,
        [positionKey(game.fens[2])]: 0,
        [positionKey(game.fens[3])]: -1,
      },
    };
    expect(theoryOf(game.fens, book)).toEqual({
      bookPlies: 3,
      opening: "C00 · French Defense",
    });
    expect(theoryOf(game.fens, null)).toEqual({ bookPlies: 0, opening: null });
  });
});

describe("comentários", () => {
  it("explica o erro com o melhor lance e a mudança da avaliação", () => {
    const game = gameFromUcis(["e2e4", "e7e5", "d1h5", "g7g6"])!;
    const data = {
      version: 2 as const,
      depth: 16,
      moves: game.ucis,
      evals: [
        { kind: "cp" as const, value: 30 },
        { kind: "cp" as const, value: 30 },
        { kind: "cp" as const, value: 20 },
        { kind: "cp" as const, value: 20 },
        { kind: "cp" as const, value: 600 },
      ],
      best: ["e2e4", "e7e5", "g1f3", "b8c6", null],
      pv: [[], [], [], [], ["h5e5"]],
      deep: {},
    };
    const report = buildReport(data, game.fens, null);
    const move = report.reviewed[3];
    expect(move.cls).toBe("erro_grave");
    const text = commentFor(move, {
      fens: game.fens,
      pv: data.pv,
      deep: {},
      evals: data.evals,
      opening: null,
    });
    expect(text).toContain("Erro grave: g6.");
    expect(text).toContain("O melhor era Cc6.");
    expect(text).toContain("Deixou o peão em e5 sem defesa.");
    expect(text).toContain("de +0,2 para +6,0");
  });
});
