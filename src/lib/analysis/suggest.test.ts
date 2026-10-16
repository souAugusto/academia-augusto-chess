import { describe, expect, it } from "vitest";
import { parsePgn } from "./pgn";
import type { ReviewedMove } from "./classify";
import {
  endgameGroupOf,
  suggestLessons,
  type LessonIndexEntry,
} from "./suggest";

const italian = ["e2e4", "e7e5", "g1f3", "b8c6", "f1c4", "f8c5", "c2c3"];
const lessons: LessonIndexEntry[] = [
  {
    slug: "italiana-giuoco-piano",
    title: "Italiana",
    kind: "abertura",
    lines: [italian],
  },
  {
    slug: "oposicao-direta",
    title: "Oposição direta",
    kind: "final",
    group: "peoes",
  },
  {
    slug: "posicao-de-lucena",
    title: "Lucena",
    kind: "final",
    group: "torres",
  },
];

const move = (
  ply: number,
  loss: number,
  cls: ReviewedMove["cls"],
): ReviewedMove => ({
  ply,
  color: ply % 2 === 0 ? "w" : "b",
  played: "a2a3",
  best: null,
  before: 50,
  after: 50 - loss,
  loss,
  accuracy: 50,
  cls,
  sacrifice: null,
  onlyMoveGap: null,
  allowedMate: null,
  missedMate: null,
  impact: 0,
});

describe("endgameGroupOf", () => {
  it("reconhece finais pelo material", () => {
    expect(endgameGroupOf("8/5k2/8/8/4KP2/8/8/8 w - - 0 1")).toBe("peoes");
    expect(endgameGroupOf("8/5k2/8/8/4KP2/8/8/r6R w - - 0 1")).toBe("torres");
    expect(
      endgameGroupOf(
        "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
      ),
    ).toBeNull();
  });
});

describe("suggestLessons", () => {
  it("sugere a abertura seguida e a lição do final com erro", () => {
    const game = parsePgn("1. e4 e5 2. Nf3 Nc6 3. Bc4 Bc5 4. c3 Nf6");
    if (!game.ok) throw new Error();
    const fens = [...game.game.fens];
    // Simula um erro das brancas num final de peões no lance 4.
    fens[6] = "8/5k2/8/8/4KP2/8/8/8 w - - 0 1";
    const result = suggestLessons({
      moves: game.game.ucis,
      fens,
      reviewed: [
        move(2, 6, "imprecisao"),
        move(6, 20, "erro_grave"),
        move(4, 30, "erro_grave"),
      ],
      lessons,
      userColor: "w",
    });
    expect(result.map((s) => s.href)).toEqual([
      "/licoes/italiana-giuoco-piano",
      "/licoes/oposicao-direta",
      "/taticas",
    ]);
    expect(result[0].reason).toContain("lance 2");
  });

  it("não sugere abertura quando a partida sai cedo da lição", () => {
    const result = suggestLessons({
      moves: ["e2e4", "c7c5"],
      fens: [],
      reviewed: [],
      lessons,
    });
    expect(result).toEqual([]);
  });
});
