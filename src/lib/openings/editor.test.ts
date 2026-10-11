import { describe, expect, it } from "vitest";
import { parseRepertoireText, planRepertoireSync, treeToText } from "./editor";
import type { RepertoireNode } from "./tree";

const node = (
  id: string,
  parentId: string | null,
  uci: string,
  san: string,
  position = 0,
  comment: string | null = null,
): RepertoireNode => ({ id, parentId, uci, san, comment, position });

// 1.e4 e5 2.Nf3 (2...Nc6 | 2...d6)
const existing = [
  node("a", null, "e2e4", "e4", 0, "Centro."),
  node("b", "a", "e7e5", "e5"),
  node("c", "b", "g1f3", "Nf3"),
  node("d", "c", "b8c6", "Nc6", 0),
  node("f", "c", "d7d6", "d6", 1),
];

describe("parseRepertoireText", () => {
  it("lê lances em português e inglês, números e comentários", () => {
    const { lines, errors } = parseRepertoireText(
      "1. e4 {Centro.} e5 2. Cf3 Nc6 3.Bc4 *\n\n# rascunho ignorado\n1. d4 d5",
    );
    expect(errors).toEqual([]);
    expect(lines).toHaveLength(2);
    expect(lines[0].map((move) => move.san)).toEqual([
      "e4",
      "e5",
      "Nf3",
      "Nc6",
      "Bc4",
    ]);
    expect(lines[0][0].comment).toBe("Centro.");
    expect(lines[0][2].uci).toBe("g1f3");
  });

  it("aponta a linha com lance impossível", () => {
    const { errors } = parseRepertoireText("1. e4 e5\n1. e4 e5 2. Dxf7");
    expect(errors).toEqual([
      'Linha 2: lance "Dxf7" não é válido nessa posição.',
    ]);
  });

  it("texto vazio é erro", () => {
    expect(parseRepertoireText("  \n").errors).toHaveLength(1);
  });
});

describe("treeToText", () => {
  it("escreve uma linha por variante, em português, comentário uma vez", () => {
    expect(treeToText(existing)).toBe(
      "1. e4 {Centro.} e5 2. Cf3 Cc6\n1. e4 e5 2. Cf3 d6",
    );
  });

  it("ida e volta mantém a árvore", () => {
    const { lines } = parseRepertoireText(treeToText(existing));
    expect(planRepertoireSync(existing, lines)).toEqual({
      inserts: [],
      updates: [],
      deletes: [],
    });
  });
});

describe("planRepertoireSync", () => {
  it("mantém os ids que continuam, cria os novos e apaga os que saíram", () => {
    const { lines } = parseRepertoireText(
      "1. e4 {Centro.} e5 2. Nf3 Nc6 3. Bc4 {Italiana.}\n1. e4 e5 2. Nf3 Nf6",
    );
    const plan = planRepertoireSync(existing, lines);
    expect(plan.inserts).toEqual([
      {
        key: "0",
        parentId: "d",
        parentKey: null,
        uci: "f1c4",
        san: "Bc4",
        comment: "Italiana.",
        position: 0,
      },
      {
        key: "1",
        parentId: "c",
        parentKey: null,
        uci: "g8f6",
        san: "Nf6",
        comment: null,
        position: 1,
      },
    ]);
    expect(plan.deletes).toEqual(["f"]);
    expect(plan.updates).toEqual([]);
  });

  it("filho de nó novo aponta para a chave do pai", () => {
    const { lines } = parseRepertoireText("1. d4 d5 2. c4");
    const plan = planRepertoireSync([], lines);
    expect(
      plan.inserts.map((item) => [item.key, item.parentKey, item.san]),
    ).toEqual([
      ["0", null, "d4"],
      ["1", "0", "d5"],
      ["2", "1", "c4"],
    ]);
  });

  it("atualiza comentário e ordem dos ramos", () => {
    const { lines } = parseRepertoireText(
      "1. e4 {Novo comentário.} e5 2. Nf3 d6\n1. e4 e5 2. Nf3 Nc6",
    );
    const plan = planRepertoireSync(existing, lines);
    expect(plan.updates).toEqual([
      { id: "a", comment: "Novo comentário.", position: 0 },
      { id: "f", comment: null, position: 0 },
      { id: "d", comment: null, position: 1 },
    ]);
    expect(plan.inserts).toEqual([]);
    expect(plan.deletes).toEqual([]);
  });
});
