import { describe, expect, it, vi } from "vitest";
import { parsePgn } from "./pgn";
import { runAnalysis, type EngineLike } from "./pipeline";

const game = (() => {
  const result = parsePgn("1. e4 e5 2. Bc4 Nc6 3. Qh5 Nf6 4. Qxf7#");
  if (!result.ok) throw new Error("pgn de teste inválido");
  return result.game;
})();

// Motor falso: avalia sempre +50 para quem joga e sugere "a2a3".
function fakeEngine(): EngineLike & { calls: number } {
  const engine = {
    calls: 0,
    analyseDepth: vi.fn(async () => {
      engine.calls++;
      return {
        lines: [{ move: "a2a3", score: { kind: "cp" as const, value: 50 } }],
        cancelled: false,
      };
    }),
  };
  return engine;
}

describe("runAnalysis", () => {
  it("usa a nuvem nas primeiras jogadas e o motor depois", async () => {
    const engine = fakeEngine();
    let cloudCalls = 0;
    const fetchJson = async () => {
      cloudCalls++;
      // A nuvem só conhece as duas primeiras posições.
      return cloudCalls <= 2
        ? { depth: 30, pvs: [{ moves: "e2e4", cp: 20 }] }
        : { error: "Not found" };
    };
    const progress: number[] = [];
    const result = await runAnalysis({
      fens: game.fens,
      moves: game.ucis,
      ending: game.ending,
      depth: 10,
      engine,
      fetchJson,
      onProgress: (done) => progress.push(done),
    });
    expect(result.complete).toBe(true);
    expect(result.sources.join("")).toBe("nnmmmmmm");
    // Depois de falhar uma vez, a nuvem não é mais consultada.
    expect(cloudCalls).toBe(3);
    // Avaliação do motor é de quem joga: com as pretas na vez, vira negativa.
    expect(result.evals[3]).toEqual({ kind: "cp", value: -50 });
    // Última posição é mate: as brancas venceram.
    expect(result.evals.at(-1)).toEqual({ kind: "mate", value: 1 });
    expect(progress.at(-1)).toBe(game.fens.length);
  });

  it("reaproveita a análise do Lichess quando existe", async () => {
    const engine = fakeEngine();
    const lichessEvals = game.ucis.map(() => ({
      kind: "cp" as const,
      value: 10,
    }));
    const result = await runAnalysis({
      fens: game.fens,
      moves: game.ucis,
      ending: null,
      depth: 10,
      engine,
      lichessEvals,
      useCloud: false,
    });
    expect(result.sources.join("")).toBe("mlllllll");
    expect(engine.calls).toBe(1);
  });

  it("para quando é cancelado", async () => {
    const engine = fakeEngine();
    const controller = new AbortController();
    controller.abort();
    const result = await runAnalysis({
      fens: game.fens,
      moves: game.ucis,
      ending: null,
      depth: 10,
      engine,
      useCloud: false,
      signal: controller.signal,
    });
    expect(result.complete).toBe(false);
    expect(result.evals).toHaveLength(0);
  });
});
