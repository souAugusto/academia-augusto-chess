import { describe, expect, it } from "vitest";
import { parseTypedMove, sanToPortuguese } from "./notation";

// Depois de 1.e4 e5 2.Bc4 Nc6 3.Qh5 Nf6: brancas jogam Dxf7#.
const fen =
  "r1bqkb1r/pppp1ppp/2n2n2/4p2Q/2B1P3/8/PPPP1PPP/RNB1K1NR w KQkq - 4 4";

describe("parseTypedMove", () => {
  it("entende português", () => {
    expect(parseTypedMove(fen, "Dxf7")).toEqual({
      from: "h5",
      to: "f7",
      promotion: undefined,
    });
    expect(parseTypedMove(fen, "Dxf7#")).toMatchObject({
      from: "h5",
      to: "f7",
    });
    expect(parseTypedMove(fen, "Cf3")).toMatchObject({ from: "g1", to: "f3" });
  });

  it("entende inglês", () => {
    expect(parseTypedMove(fen, "Qxf7")).toMatchObject({ from: "h5", to: "f7" });
    expect(parseTypedMove(fen, "Nf3")).toMatchObject({ from: "g1", to: "f3" });
  });

  it("R é rei em português", () => {
    expect(parseTypedMove(fen, "Re2")).toMatchObject({ from: "e1", to: "e2" });
  });

  it("entende coordenadas", () => {
    expect(parseTypedMove(fen, "h5f7")).toMatchObject({ from: "h5", to: "f7" });
    expect(parseTypedMove(fen, "h5-f7")).toMatchObject({
      from: "h5",
      to: "f7",
    });
  });

  it("entende promoção em português e em coordenadas", () => {
    const promo = "8/P6k/8/8/8/8/8/K7 w - - 0 1";
    expect(parseTypedMove(promo, "a8=D")).toEqual({
      from: "a7",
      to: "a8",
      promotion: "q",
    });
    expect(parseTypedMove(promo, "a7a8n")).toEqual({
      from: "a7",
      to: "a8",
      promotion: "n",
    });
  });

  it("entende roque com zero", () => {
    const castle = "r3k2r/8/8/8/8/8/8/R3K2R w KQkq - 0 1";
    expect(parseTypedMove(castle, "0-0")).toMatchObject({
      from: "e1",
      to: "g1",
    });
  });

  it("recusa lance ilegal ou texto inválido", () => {
    expect(parseTypedMove(fen, "Dxa8")).toBeNull();
    expect(parseTypedMove(fen, "banana")).toBeNull();
    expect(parseTypedMove(fen, "")).toBeNull();
  });
});

describe("sanToPortuguese", () => {
  it("troca as letras das peças para o português", () => {
    expect(sanToPortuguese("Nf3")).toBe("Cf3");
    expect(sanToPortuguese("Qxf7#")).toBe("Dxf7#");
    expect(sanToPortuguese("Kg1")).toBe("Rg1");
    expect(sanToPortuguese("Rxe8+")).toBe("Txe8+");
    expect(sanToPortuguese("e8=Q+")).toBe("e8=D+");
    expect(sanToPortuguese("O-O")).toBe("O-O");
    expect(sanToPortuguese("Bb5")).toBe("Bb5");
  });
});
