import { describe, expect, it } from "vitest";
import {
  bookMove,
  chooseMove,
  seededRng,
  styleBonus,
  weightedIndex,
  type Candidate,
} from "./choose";

const PARAMS = {
  mode: "multipv" as const,
  depth: 6,
  multipv: 4,
  randomChance: 0,
  mistakeChance: 0,
  mistakeWeights: [3, 2, 1],
  maxLossCp: 200,
  styleWindowCp: 40,
};

const CANDS: Candidate[] = [
  { move: "e2e4", cp: 50, quiet: true, pawn: true },
  { move: "d1h5", cp: 30, check: true },
  { move: "b1c3", cp: 20, quiet: true },
  { move: "g1h3", cp: -400, quiet: true },
];

const always = (value: number) => () => value;

describe("weightedIndex", () => {
  it("respeita os pesos", () => {
    expect(weightedIndex([1, 1], always(0))).toBe(0);
    expect(weightedIndex([1, 1], always(0.99))).toBe(1);
    expect(weightedIndex([0, 5], always(0))).toBe(1);
    expect(weightedIndex([0, 0], always(0.5))).toBe(0);
  });
});

describe("chooseMove", () => {
  it("sem erro, joga o melhor (ou o do estilo, se parecido)", () => {
    expect(chooseMove(CANDS, PARAMS, "posicional", always(0.5))?.move).toBe("e2e4");
    // Agressivo: o xeque está a 20 cp do melhor, dentro da janela de 40.
    expect(chooseMove(CANDS, PARAMS, "agressivo", always(0.5))).toEqual({
      move: "d1h5",
      reason: "estilo",
    });
  });

  it("o estilo não escolhe lance fora da janela", () => {
    const narrow = { ...PARAMS, styleWindowCp: 10 };
    expect(chooseMove(CANDS, narrow, "agressivo", always(0.5))?.move).toBe("e2e4");
  });

  it("erro humano nunca passa do prejuízo máximo", () => {
    const rng = seededRng(7);
    const params = { ...PARAMS, mistakeChance: 1 };
    for (let i = 0; i < 200; i += 1) {
      const choice = chooseMove(CANDS, params, "posicional", rng);
      expect(choice?.reason).toBe("erro");
      expect(choice?.move).not.toBe("g1h3"); // 450 cp pior que o melhor
    }
  });

  it("o 2º candidato sai mais que o 3º, e o 3º mais que o 4º", () => {
    const rng = seededRng(42);
    const params = { ...PARAMS, mistakeChance: 1, maxLossCp: 1000 };
    const count: Record<string, number> = {};
    for (let i = 0; i < 3000; i += 1) {
      const move = chooseMove(CANDS, params, "posicional", rng)!.move;
      count[move] = (count[move] ?? 0) + 1;
    }
    expect(count.e2e4).toBeUndefined();
    expect(count.d1h5).toBeGreaterThan(count.b1c3);
    expect(count.b1c3).toBeGreaterThan(count.g1h3);
  });

  it("a taxa de erro fica perto da configurada", () => {
    const rng = seededRng(3);
    const params = { ...PARAMS, mistakeChance: 0.3 };
    let errors = 0;
    for (let i = 0; i < 5000; i += 1)
      if (chooseMove(CANDS, params, "posicional", rng)?.reason === "erro") errors += 1;
    expect(errors / 5000).toBeGreaterThan(0.26);
    expect(errors / 5000).toBeLessThan(0.34);
  });

  it("lance aleatório só entre os legais", () => {
    const params = { ...PARAMS, randomChance: 1 };
    const legal = ["a2a3", "h2h3"];
    const choice = chooseMove(CANDS, params, "posicional", seededRng(1), legal);
    expect(choice?.reason).toBe("aleatorio");
    expect(legal).toContain(choice?.move);
  });

  it("sem candidatos: um lance legal, ou nada", () => {
    expect(chooseMove([], PARAMS, "tatico", always(0), ["e2e4"])?.move).toBe("e2e4");
    expect(chooseMove([], PARAMS, "tatico", always(0))).toBeNull();
  });
});

describe("styleBonus", () => {
  it("cada estilo prefere um tipo de lance", () => {
    expect(styleBonus("agressivo", { move: "x", cp: 0, check: true })).toBeGreaterThan(0);
    expect(styleBonus("defensivo", { move: "x", cp: 0, castle: true })).toBeGreaterThan(
      styleBonus("defensivo", { move: "x", cp: 0, check: true }),
    );
    expect(
      styleBonus("posicional", { move: "x", cp: 0, quiet: true, pawn: true }),
    ).toBeGreaterThan(0);
    expect(styleBonus("tatico", { move: "x", cp: 0, capture: true })).toBeGreaterThan(0);
  });
});

describe("bookMove", () => {
  const lines = [["e4", "e5", "f4"], ["e4", "c5"], ["d4"]];
  it("segue a linha enquanto a partida bate", () => {
    expect(bookMove(lines, ["e4", "e5"], always(0))).toBe("f4");
    expect(["e4", "d4"]).toContain(bookMove(lines, [], always(0.9)));
    expect(bookMove(lines, ["e4", "d5"], always(0))).toBeNull();
    expect(bookMove(lines, ["e4", "e5", "f4"], always(0))).toBeNull();
    expect(bookMove(undefined, [], always(0))).toBeNull();
  });
});
