import { describe, expect, it } from "vitest";
import { candidatesFromLines, legalUcis } from "./candidates";

describe("candidatos do motor", () => {
  it("marca captura, xeque, roque e troca", () => {
    // Brancas podem rocar, tomar o cavalo em e5 com o cavalo (troca) e dar xeque.
    const fen = "r1bqk2r/pppp1ppp/8/4n3/2B5/5N2/PPPP1PPP/RNBQK2R w KQkq - 0 1";
    const list = candidatesFromLines(fen, [
      { move: "e1g1", score: { kind: "cp", value: 30 } },
      { move: "f3e5", score: { kind: "cp", value: 300 } },
      { move: "c4f7", score: { kind: "mate", value: 5 } },
      { move: "a1a8", score: { kind: "cp", value: 0 } }, // ilegal
    ]);
    expect(list).toHaveLength(3);
    expect(list[0]).toMatchObject({ move: "e1g1", castle: true, quiet: true, capture: false });
    expect(list[1]).toMatchObject({ move: "f3e5", capture: true, trade: true });
    expect(list[2]).toMatchObject({ move: "c4f7", capture: true, check: true, trade: false });
    expect(list[2].cp).toBeGreaterThan(9000);
  });

  it("lista os lances legais em UCI, com promoção", () => {
    const moves = legalUcis("8/P6k/8/8/8/8/8/K7 w - - 0 1");
    expect(moves).toContain("a7a8q");
    expect(moves).toContain("a7a8n");
    expect(moves).toContain("a1b1");
  });
});
