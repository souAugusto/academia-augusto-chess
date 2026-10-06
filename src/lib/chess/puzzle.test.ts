import { describe, expect, it } from "vitest";
import { boardSquares, puzzleStartPosition, puzzleThemeLabel } from "./puzzle";

const mateDoPastor = {
  fen: "r1bqkbnr/pppp1ppp/2n5/4p2Q/2B1P3/8/PPPP1PPP/RNB1K1NR b KQkq - 3 3",
  moves: "g8f6 h5f7",
  first_move_is_setup: true,
  themes: ["mateIn1", "opening"],
};

describe("puzzleStartPosition", () => {
  it("aplica o lance do adversário em puzzles do Lichess", () => {
    const start = puzzleStartPosition(mateDoPastor);
    expect(start.fen).toBe(
      "r1bqkb1r/pppp1ppp/2n2n2/4p2Q/2B1P3/8/PPPP1PPP/RNB1K1NR w KQkq - 4 4",
    );
    expect(start.sideToMove).toBe("w");
    expect(start.lastMove).toEqual({ from: "g8", to: "f6" });
  });

  it("usa o FEN como está em táticas próprias", () => {
    const start = puzzleStartPosition({
      ...mateDoPastor,
      fen: "r1bqkb1r/pppp1ppp/2n2n2/4p2Q/2B1P3/8/PPPP1PPP/RNB1K1NR w KQkq - 4 4",
      moves: "h5f7",
      first_move_is_setup: false,
    });
    expect(start.sideToMove).toBe("w");
    expect(start.lastMove).toBeNull();
  });

  it("aceita lance de promoção no setup", () => {
    const start = puzzleStartPosition({
      fen: "8/P6k/8/8/8/8/8/K7 w - - 0 1",
      moves: "a7a8q h7g6",
      first_move_is_setup: true,
      themes: [],
    });
    expect(start.fen.startsWith("Q7/7k")).toBe(true);
  });
});

describe("puzzleThemeLabel", () => {
  it("traduz temas de mate", () => {
    expect(puzzleThemeLabel(["opening", "mateIn1"])).toBe("Mate em 1");
  });

  it("retorna null sem tema conhecido", () => {
    expect(puzzleThemeLabel(["fork"])).toBeNull();
  });
});

describe("boardSquares", () => {
  const fen =
    "r1bqkb1r/pppp1ppp/2n2n2/4p2Q/2B1P3/8/PPPP1PPP/RNB1K1NR w KQkq - 4 4";

  it("começa em a8 com as brancas embaixo", () => {
    const squares = boardSquares(fen, "w");
    expect(squares).toHaveLength(64);
    expect(squares[0]).toEqual({ square: "a8", piece: "bR", isLight: true });
    expect(squares[63]).toEqual({ square: "h1", piece: "wR", isLight: true });
  });

  it("inverte o tabuleiro quando as pretas jogam", () => {
    const squares = boardSquares(fen, "b");
    expect(squares[0].square).toBe("h1");
    expect(squares[63].square).toBe("a8");
  });
});
