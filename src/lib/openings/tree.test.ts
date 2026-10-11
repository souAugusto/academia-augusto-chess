import { describe, expect, it } from "vitest";
import {
  buildTree,
  fenAfter,
  judgeTrainingMove,
  listLines,
  pathTo,
  pickLine,
  toEpd,
  type RepertoireNode,
} from "./tree";

const node = (
  id: string,
  parentId: string | null,
  uci: string,
  san: string,
  position = 0,
): RepertoireNode => ({
  id,
  parentId,
  uci,
  san,
  comment: null,
  position,
});

// 1.e4 e5 2.Nf3 (2...Nc6 3.Bc4 | 2...d6 3.d4)
const nodes = [
  node("a", null, "e2e4", "e4"),
  node("b", "a", "e7e5", "e5"),
  node("c", "b", "g1f3", "Nf3"),
  node("d", "c", "b8c6", "Nc6", 0),
  node("e", "d", "f1c4", "Bc4"),
  node("f", "c", "d7d6", "d6", 1),
  node("g", "f", "d2d4", "d4"),
];
const tree = buildTree(nodes);

describe("listLines", () => {
  it("lista cada caminho até uma folha", () => {
    expect(
      listLines(tree).map((line) => line.map((n) => n.san).join(" ")),
    ).toEqual(["e4 e5 Nf3 Nc6 Bc4", "e4 e5 Nf3 d6 d4"]);
  });
});

describe("pathTo e fenAfter", () => {
  it("monta o caminho e a posição", () => {
    expect(pathTo(tree, "f").map((n) => n.id)).toEqual(["a", "b", "c", "f"]);
    expect(toEpd(fenAfter(pathTo(tree, "b")))).toBe(
      "rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq -",
    );
  });
});

describe("pickLine", () => {
  const lines = listLines(tree);

  it("prefere linha nunca treinada", () => {
    const progress = new Map([
      ["e", { correct: 3, mistakes: 0, lastTrainedAt: 1 }],
    ]);
    expect(pickLine(lines, progress)?.at(-1)?.id).toBe("g");
  });

  it("depois, a com mais erros", () => {
    const progress = new Map([
      ["e", { correct: 1, mistakes: 3, lastTrainedAt: 5 }],
      ["g", { correct: 4, mistakes: 0, lastTrainedAt: 1 }],
    ]);
    expect(pickLine(lines, progress)?.at(-1)?.id).toBe("e");
  });

  it("evita repetir a linha que acabou de treinar", () => {
    expect(pickLine(lines, new Map(), "e")?.at(-1)?.id).toBe("g");
  });
});

describe("judgeTrainingMove", () => {
  const [lineBc4] = listLines(tree);

  it("aceita o lance da linha", () => {
    expect(judgeTrainingMove(tree, lineBc4, 4, "f1c4")).toEqual({
      kind: "correct",
    });
  });

  it("reconhece lance de outra linha do repertório", () => {
    // Posição após 2.Nf3: o adversário pode jogar Nc6 ou d6 (ambos no repertório).
    expect(judgeTrainingMove(tree, lineBc4, 3, "d7d6").kind).toBe(
      "alternative",
    );
  });

  it("marca lance fora do repertório", () => {
    const verdict = judgeTrainingMove(tree, lineBc4, 4, "f1b5");
    expect(verdict.kind).toBe("wrong");
    if (verdict.kind === "wrong") expect(verdict.expected.san).toBe("Bc4");
  });
});
