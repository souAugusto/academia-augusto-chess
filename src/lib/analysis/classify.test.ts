import { Chess } from "chess.js";
import { describe, expect, it } from "vitest";
import {
  capBrilliants,
  classByLoss,
  classifyGame,
  deepCandidates,
  gameAccuracy,
  keyMoments,
  moveAccuracy,
  type DeepLine,
  type GameInput,
  type ReviewedMove,
} from "./classify";
import { sacrificeInLine } from "./material";
import type { EngineScore } from "./winprob";

const cp = (value: number): EngineScore => ({ kind: "cp", value });
const mate = (value: number): EngineScore => ({ kind: "mate", value });

// Monta a entrada a partir de uma posição e dos lances jogados.
function game(
  start: string,
  moves: string[],
  rest: Partial<Omit<GameInput, "fens" | "moves">> & { evals: EngineScore[] },
): GameInput {
  const chess = new Chess(start);
  const fens = [chess.fen()];
  for (const uci of moves) {
    chess.move({ from: uci.slice(0, 2), to: uci.slice(2, 4), promotion: uci[4] });
    fens.push(chess.fen());
  }
  return {
    fens,
    moves,
    best: rest.best ?? moves.map(() => null),
    pv: rest.pv ?? fens.map(() => []),
    deep: rest.deep ?? {},
    bookPlies: rest.bookPlies ?? 0,
    evals: rest.evals,
  };
}

// Sacrifício grego clássico: Bxh7+ Kxh7 Cg5+ Kg8 Dh5.
const GREEK = "r1bq1rk1/pppn1ppp/4p3/3pP3/1b1P4/2NB1N2/PPP2PPP/R1BQK2R w KQ - 0 1";
const GREEK_REPLY = ["g8h7", "f3g5", "h7g8", "d1h5", "f8e8", "h5h7"];
const greekDeep = (altScore = cp(20)): Record<number, DeepLine[]> => ({
  0: [
    { move: "d3h7", score: cp(150), pv: ["d3h7", ...GREEK_REPLY] },
    { move: "e1g1", score: altScore, pv: ["e1g1"] },
  ],
});

describe("precisão por lance (valores de conferência)", () => {
  it.each([
    [0, 100],
    [2, 91.4],
    [5, 79.8],
    [10, 63.6],
    [20, 40.0],
    [30, 24.8],
  ])("perda %d -> %d", (loss, expected) => {
    expect(moveAccuracy(loss)).toBeCloseTo(expected, 1);
  });
});

describe("classes pela perda (limites exatos)", () => {
  it.each([
    [0, "excelente"],
    [2, "excelente"],
    [2.01, "bom"],
    [5, "bom"],
    [5.01, "imprecisao"],
    [10, "imprecisao"],
    [10.01, "erro"],
    [20, "erro"],
    [20.01, "erro_grave"],
  ])("Δ = %d -> %s", (loss, cls) => {
    expect(classByLoss(loss, false)).toBe(cls);
  });

  it("o 1º lance do motor é Melhor; acima de 20 é sempre Erro grave", () => {
    expect(classByLoss(0, true)).toBe("melhor");
    expect(classByLoss(25, true)).toBe("erro_grave");
  });
});

describe("pontos de vista", () => {
  it("lance das pretas usa a chance das pretas", () => {
    // Brancas jogam e4 (melhor); pretas jogam a6 e a avaliação vai de +0,3 a +3.
    const input = game("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1", ["e2e4", "a7a6"], {
      evals: [cp(30), cp(30), cp(300)],
      best: ["e2e4", "c7c5", null],
    });
    const [white, black] = classifyGame(input);
    expect(white.cls).toBe("melhor");
    expect(black.color).toBe("b");
    expect(black.before).toBeCloseTo(100 - 52.8, 0);
    expect(black.after).toBeCloseTo(24.9, 1);
    expect(black.cls).toBe("erro_grave");
  });
});

describe("mate", () => {
  const start = "6k1/5ppp/8/8/8/8/5PPP/3R2K1 w - - 0 1";
  it("permitir mate é no mínimo Erro grave", () => {
    const input = game(start, ["g1f1"], { evals: [cp(0), mate(-2)] });
    const [move] = classifyGame(input);
    expect(move.cls).toBe("erro_grave");
    expect(move.allowedMate).toBe(2);
  });

  it("deixar escapar um mate forçado é no mínimo Chance perdida", () => {
    // Tinha mate (Td8#) e jogou outro lance que ainda ganha muito.
    const input = game(start, ["h2h3"], {
      evals: [mate(1), cp(900)],
      best: ["d1d8", null],
    });
    const [move] = classifyGame(input);
    expect(move.missedMate).toBe(1);
    expect(move.cls).toBe("chance_perdida");
  });
});

describe("sacrifício", () => {
  it("reconhece o sacrifício do bispo em h7", () => {
    const sac = sacrificeInLine(GREEK, ["d3h7", ...GREEK_REPLY], {
      minPiece: 3,
      minNet: 2,
      allowExchange: false,
    });
    expect(sac).toEqual({ amount: 2, piece: "b", square: "h7", line: GREEK_REPLY });
  });

  it("peça perdida mais tarde (não capturada logo em seguida) não é sacrifício", () => {
    expect(
      sacrificeInLine(GREEK, ["d3e2", "a7a6", "e2a6", "a8a6"], {
        minPiece: 3,
        minNet: 2,
        allowExchange: false,
      }),
    ).toBeNull();
  });

  it("troca com recaptura não é sacrifício", () => {
    const fen = "rnbqkbnr/ppp2ppp/8/3pp3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 0 1";
    // Cxe5 (ganha peão) e depois trocas que voltam ao saldo.
    expect(
      sacrificeInLine(fen, ["e4d5", "d8d5", "b1c3", "d5d8"], {
        minPiece: 3,
        minNet: 2,
        allowExchange: false,
      }),
    ).toBeNull();
  });
});

describe("Brilhante", () => {
  it("sacrifício real, melhor lance, posição boa depois", () => {
    const input = game(GREEK, ["d3h7"], {
      evals: [cp(150), cp(150)],
      best: ["d3h7", null],
      pv: [[], GREEK_REPLY],
      deep: greekDeep(),
    });
    const [move] = classifyGame(input);
    expect(move.cls).toBe("brilhante");
    expect(move.sacrifice?.piece).toBe("b");
  });

  it("não é brilhante se a posição já estava ganha", () => {
    const input = game(GREEK, ["d3h7"], {
      evals: [cp(900), cp(900)],
      best: ["d3h7", null],
      pv: [[], GREEK_REPLY],
      deep: greekDeep(cp(850)),
    });
    expect(classifyGame(input)[0].cls).toBe("melhor");
  });

  it("não é brilhante se a posição fica ruim depois", () => {
    const input = game(GREEK, ["d3h7"], {
      evals: [cp(-200), cp(-200)],
      best: ["d3h7", null],
      pv: [[], GREEK_REPLY],
      deep: greekDeep(cp(-250)),
    });
    expect(classifyGame(input)[0].cls).not.toBe("brilhante");
  });

  it("não é brilhante sem a segunda análise (não dá para comparar)", () => {
    const input = game(GREEK, ["d3h7"], {
      evals: [cp(150), cp(150)],
      best: ["d3h7", null],
      pv: [[], GREEK_REPLY],
    });
    expect(classifyGame(input)[0].cls).toBe("melhor");
  });

  it("no máximo 2 por jogador, ficando os de maior impacto", () => {
    const fake = (ply: number, impact: number): ReviewedMove => ({
      ply,
      color: "w",
      played: "a2a3",
      best: "a2a3",
      before: 60,
      after: 60,
      loss: 0,
      accuracy: 100,
      cls: "brilhante",
      sacrifice: { amount: 3, piece: "n", square: "f7", line: [] },
      onlyMoveGap: null,
      allowedMate: null,
      missedMate: null,
      impact,
    });
    const moves = [fake(0, 300), fake(2, 500), fake(4, 400)];
    capBrilliants(moves, 2);
    expect(moves.map((m) => m.cls)).toEqual(["melhor", "brilhante", "brilhante"]);
  });
});

describe("Ótimo", () => {
  const start = "6k1/5ppp/8/8/8/8/5PPP/3R2K1 w - - 0 1";
  it("lance único: a 2ª linha perde 15 pontos ou mais", () => {
    const input = game(start, ["d1d7"], {
      evals: [cp(50), cp(50)],
      best: ["d1d7", null],
      deep: {
        0: [
          { move: "d1d7", score: cp(50), pv: ["d1d7"] },
          { move: "h2h3", score: cp(-200), pv: ["h2h3"] },
        ],
      },
    });
    const [move] = classifyGame(input);
    expect(move.cls).toBe("otimo");
    expect(move.onlyMoveGap).toBeGreaterThanOrEqual(15);
  });

  it("virada: de equilibrada para vencedora, e só este lance consegue", () => {
    const fen = "6k1/5ppp/8/8/8/8/5PPP/3R2K1 w - - 0 1";
    const input = game(fen, ["h2h3", "g8f8"], {
      evals: [cp(0), cp(0), cp(-400)],
      best: ["d1d7", "g8f8", null],
      deep: {
        1: [
          { move: "g8f8", score: cp(-400), pv: ["g8f8"] },
          { move: "h7h6", score: cp(-205), pv: ["h7h6"] },
        ],
      },
    });
    const move = classifyGame(input)[1];
    expect(move.cls).toBe("otimo");
    expect(move.onlyMoveGap).toBeNull();
  });
});

describe("Ótimo não vale para", () => {
  const start = "6k1/5ppp/8/8/8/8/5PPP/3R2K1 w - - 0 1";
  it("mate em 1 (é Melhor)", () => {
    const input = game(start, ["d1d8"], {
      evals: [mate(1), mate(1)], // depois do mate: +1 para as brancas (terminalScore)
      best: ["d1d8", null],
      deep: {
        0: [
          { move: "d1d8", score: mate(1), pv: ["d1d8"] },
          { move: "h2h3", score: cp(300), pv: ["h2h3"] },
        ],
      },
    });
    expect(classifyGame(input)[0].cls).toBe("melhor");
  });

  it("posição que continua ganha com a 2ª opção", () => {
    const input = game(start, ["d1d7"], {
      evals: [cp(900), cp(900)],
      best: ["d1d7", null],
      deep: {
        0: [
          { move: "d1d7", score: cp(900), pv: ["d1d7"] },
          { move: "h2h3", score: cp(400), pv: ["h2h3"] },
        ],
      },
    });
    expect(classifyGame(input)[0].cls).toBe("melhor");
  });
});

describe("Chance perdida", () => {
  it("o adversário errou, havia vitória e o lance deixou escapar", () => {
    const fen = "6k1/5ppp/8/8/8/8/5PPP/3R2K1 w - - 0 1";
    const input = game(fen, ["h2h3", "h7h6"], {
      evals: [cp(0), cp(-300), cp(-100)],
      best: ["d1d7", "g7g5", null],
    });
    const move = classifyGame(input)[1];
    expect(move.loss).toBeLessThanOrEqual(20);
    expect(move.cls).toBe("chance_perdida");
  });
});

describe("Teoria e momentos-chave", () => {
  it("lances do livro viram Teoria e a saída da teoria é momento-chave", () => {
    const input = game("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1", ["e2e4", "e7e5", "d1h5", "b8c6"], {
      evals: [cp(30), cp(30), cp(30), cp(-50), cp(-60)],
      best: ["e2e4", "e7e5", "g1f3", "b8c6", null],
      bookPlies: 2,
    });
    const reviewed = classifyGame(input);
    expect(reviewed.slice(0, 2).map((m) => m.cls)).toEqual(["teoria", "teoria"]);
    const moments = keyMoments(reviewed, 2);
    expect(moments[0]).toEqual({ kind: "fim-da-teoria", ply: 2 });
    expect(moments.some((m) => m.kind === "virada" && m.ply === 2)).toBe(true);
  });
});

describe("precisão da partida", () => {
  it("só lances perfeitos dá 100; erros puxam para baixo", () => {
    const input = game("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1", ["e2e4", "e7e5", "f1c4", "g8f6"], {
      evals: [cp(30), cp(30), cp(30), cp(30), cp(400)],
      best: ["e2e4", "e7e5", "f1c4", "b8c6", null],
    });
    const reviewed = classifyGame(input);
    expect(gameAccuracy(reviewed, input.evals, "w")).toBe(100);
    expect(gameAccuracy(reviewed, input.evals, "b")!).toBeLessThan(80);
  });
});

describe("passagem 2", () => {
  it("escolhe o sacrifício como candidato", () => {
    const input = game(GREEK, ["d3h7"], {
      evals: [cp(150), cp(150)],
      best: ["d3h7", null],
      pv: [[], GREEK_REPLY],
    });
    expect(deepCandidates(input, 12)).toEqual([0]);
  });
});
