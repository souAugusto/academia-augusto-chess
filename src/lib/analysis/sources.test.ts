import { describe, expect, it } from "vitest";
import { cloudEvalUrl, parseCloudEval, parseLichessAnalysis } from "./sources";

describe("parseCloudEval", () => {
  it("lê avaliação, melhor lance e profundidade", () => {
    expect(
      parseCloudEval({
        fen: "x",
        depth: 40,
        pvs: [{ moves: "e2e4 e7e5", cp: 18 }],
      }),
    ).toEqual({ score: { kind: "cp", value: 18 }, best: "e2e4", depth: 40 });
    expect(
      parseCloudEval({ depth: 30, pvs: [{ moves: "h5f7", mate: 1 }] })?.score,
    ).toEqual({ kind: "mate", value: 1 });
  });

  it("devolve nulo quando a resposta não serve", () => {
    expect(parseCloudEval(null)).toBeNull();
    expect(parseCloudEval({ error: "Not found" })).toBeNull();
    expect(parseCloudEval({ depth: 20, pvs: [{ moves: "e2e4" }] })).toBeNull();
  });

  it("monta a URL com o FEN codificado", () => {
    expect(cloudEvalUrl("8/8/8/8/8/8/8/K6k w - - 0 1")).toContain(
      "fen=8%2F8%2F8%2F8%2F8%2F8%2F8%2FK6k%20w",
    );
  });
});

describe("parseLichessAnalysis", () => {
  it("lê avaliações e mates e completa o que faltar com nulo", () => {
    expect(parseLichessAnalysis([{ eval: 20 }, { mate: -3 }, {}], 4)).toEqual([
      { kind: "cp", value: 20 },
      { kind: "mate", value: -3 },
      null,
      null,
    ]);
    expect(parseLichessAnalysis(undefined, 3)).toBeNull();
  });
});
