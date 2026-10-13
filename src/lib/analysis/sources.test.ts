import { describe, expect, it } from "vitest";
import {
  cloudEvalUrl,
  normalizeCastling,
  parseCloudEval,
  parseLichessAnalysis,
} from "./sources";

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

describe("normalizeCastling", () => {
  const castle =
    "r1b1kbnr/pppp1ppp/8/4N1q1/2BnP3/8/PPPP1PPP/RNBQK2R w KQkq - 1 5";
  it("converte o roque do Lichess para o formato padrão", () => {
    expect(normalizeCastling(castle, "e1h1")).toBe("e1g1");
    expect(
      parseCloudEval(
        { depth: 60, pvs: [{ moves: "e1h1 g5e5", cp: -51 }] },
        castle,
      )?.best,
    ).toBe("e1g1");
  });

  it("não mexe em lance de torre nem em outros lances", () => {
    expect(normalizeCastling("4k3/8/8/8/8/8/8/K3R3 w - - 0 1", "e1h1")).toBe(
      "e1h1",
    );
    expect(normalizeCastling(castle, "e5f7")).toBe("e5f7");
  });
});
