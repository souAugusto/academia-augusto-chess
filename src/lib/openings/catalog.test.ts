import { describe, expect, it } from "vitest";
import { bestOpeningName, parseOpeningLine } from "./catalog";

describe("parseOpeningLine", () => {
  it("lê o TSV e calcula lances UCI e posição final", () => {
    expect(parseOpeningLine("C00\tFrench Defense\t1. e4 e6 2. d4 d5")).toEqual({
      eco: "C00",
      name: "French Defense",
      pgn: "1. e4 e6 2. d4 d5",
      uci: "e2e4 e7e6 d2d4 d7d5",
      epd: "rnbqkbnr/ppp2ppp/4p3/3p4/3PP3/8/PPP2PPP/RNBQKBNR w KQkq -",
    });
  });

  it("ignora cabeçalho e linha inválida", () => {
    expect(parseOpeningLine("eco\tname\tpgn")).toBeNull();
    expect(parseOpeningLine("C00\tBroken\t1. e5")).toBeNull();
  });
});

describe("bestOpeningName", () => {
  it("prefere o nome mais específico", () => {
    expect(
      bestOpeningName([
        { eco: "C50", name: "Italian Game", uci: "e2e4 e7e5 g1f3 b8c6 f1c4" },
        {
          eco: "C50",
          name: "Italian Game: Giuoco Piano",
          uci: "e2e4 e7e5 g1f3 b8c6 f1c4 f8c5",
        },
      ]),
    ).toBe("C50 · Italian Game: Giuoco Piano");
    expect(bestOpeningName([])).toBeNull();
  });
});
