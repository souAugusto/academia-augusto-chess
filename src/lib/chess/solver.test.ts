import { describe, expect, it } from "vitest";
import { evaluateAttempt, judgeMove, solutionLine } from "./solver";

const mateDoPastor = {
  fen: "r1bqkbnr/pppp1ppp/2n5/4p2Q/2B1P3/8/PPPP1PPP/RNB1K1NR b KQkq - 3 3",
  moves: "g8f6 h5f7",
  first_move_is_setup: true,
};

// Linha com 2 lances do aluno (e4, resposta e5, Cf3) a partir da posição inicial.
const linhaSimples = {
  fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
  moves: "e2e4 e7e5 g1f3",
  first_move_is_setup: false,
};

describe("solutionLine", () => {
  it("aplica o setup do Lichess e devolve só a linha do aluno", () => {
    const { startFen, line } = solutionLine(mateDoPastor);
    expect(startFen.startsWith("r1bqkb1r/pppp1ppp/2n2n2")).toBe(true);
    expect(line).toEqual(["h5f7"]);
  });
});

describe("judgeMove", () => {
  const { startFen, line } = solutionLine(mateDoPastor);

  it("aceita o lance da solução", () => {
    expect(judgeMove(startFen, line, 0, "h5f7")).toEqual({
      kind: "correct",
      reply: null,
      done: true,
    });
  });

  it("recusa lance legal errado", () => {
    expect(judgeMove(startFen, line, 0, "h5h7")).toEqual({ kind: "wrong" });
  });

  it("marca lance ilegal", () => {
    expect(judgeMove(startFen, line, 0, "h5a1")).toEqual({ kind: "illegal" });
  });

  it("aceita outro lance que também dá mate", () => {
    // Posição com dois mates em 1: Dg7# e Dh8#... (rei preto em g8 sem casas)
    const fen = "6k1/5p1p/5QpB/8/8/8/5PPP/6K1 w - - 0 1";
    expect(judgeMove(fen, ["f6g7"], 0, "f6g7")).toMatchObject({
      kind: "correct",
    });
    expect(judgeMove(fen, ["f6g7"], 0, "f6d8")).toEqual({ kind: "mate" });
  });
});

describe("evaluateAttempt", () => {
  it("resolve o puzzle de um lance", () => {
    expect(evaluateAttempt(mateDoPastor, ["h5f7"])).toEqual({
      solved: true,
      userMoves: 1,
    });
  });

  it("falha no primeiro lance errado", () => {
    expect(evaluateAttempt(mateDoPastor, ["c4b5"]).solved).toBe(false);
  });

  it("exige todos os lances do aluno em puzzles longos", () => {
    expect(evaluateAttempt(linhaSimples, ["e2e4"]).solved).toBe(false);
    expect(evaluateAttempt(linhaSimples, ["e2e4", "g1f3"]).solved).toBe(true);
  });

  it("não aceita lances inventados depois de errar", () => {
    expect(evaluateAttempt(linhaSimples, ["g1f3", "e2e4"]).solved).toBe(false);
  });

  it("lista vazia não resolve", () => {
    expect(evaluateAttempt(linhaSimples, []).solved).toBe(false);
  });
});
