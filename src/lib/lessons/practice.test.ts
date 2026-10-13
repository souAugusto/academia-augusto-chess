import { describe, expect, it } from "vitest";
import type { EndgameDrill, OpeningDrill } from "@/content/licoes/types";
import {
  isLessonComplete,
  judgeEndgameMove,
  judgeOpeningMove,
  openingDrillFen,
  sameMove,
} from "./practice";

const opening: OpeningDrill = {
  level: "facil",
  before: ["e4", "e5", "Nf3", "Nc6"],
  answer: "Bc4",
  alternatives: ["Bb5"],
  hint: "Bispo.",
  why: "Mira f7.",
};

const endgame: EndgameDrill = {
  level: "medio",
  fen: "8/8/8/8/k7/8/2K5/1Q6 w - - 0 1",
  goal: "vencer",
  solution: ["Qb6", "Ka3", "Qb3#"],
  accept: ["Qb2"],
  hint: "Lance tranquilo.",
  why: "Mate em 2.",
};

describe("prática de abertura", () => {
  it("monta a posição e aceita a resposta ou a alternativa", () => {
    expect(openingDrillFen(opening)).toBe(
      "r1bqkbnr/pppp1ppp/2n5/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3",
    );
    expect(judgeOpeningMove(opening, "Bc4")).toEqual({
      kind: "correct",
      done: true,
    });
    expect(judgeOpeningMove(opening, "Bb5")).toEqual({
      kind: "correct",
      done: true,
    });
    expect(judgeOpeningMove(opening, "d4")).toEqual({ kind: "wrong" });
  });
});

describe("prática de final", () => {
  it("segue a solução com a resposta do site", () => {
    expect(judgeEndgameMove(endgame, 0, "Qb6")).toEqual({
      kind: "correct",
      done: false,
      reply: "Ka3",
      next: 2,
    });
    expect(judgeEndgameMove(endgame, 2, "Qb3")).toEqual({
      kind: "correct",
      done: true,
    });
  });

  it("alternativa aceita só no primeiro lance; lance errado não passa", () => {
    expect(judgeEndgameMove(endgame, 0, "Qb2")).toEqual({
      kind: "correct",
      done: true,
    });
    expect(judgeEndgameMove(endgame, 2, "Qb2")).toEqual({ kind: "wrong" });
    expect(judgeEndgameMove(endgame, 0, "Kd3")).toEqual({ kind: "wrong" });
  });

  it("compara lances ignorando + e #", () => {
    expect(sameMove("Qb3#", "Qb3")).toBe(true);
    expect(sameMove("Qb3", "Qb4")).toBe(false);
  });
});

describe("lição concluída", () => {
  it("exige 70% da prática e 60% do quiz", () => {
    expect(
      isLessonComplete({
        practiceSolved: 6,
        practiceTotal: 8,
        quizScore: 2,
        quizTotal: 3,
      }),
    ).toBe(true);
    expect(
      isLessonComplete({
        practiceSolved: 5,
        practiceTotal: 8,
        quizScore: 3,
        quizTotal: 3,
      }),
    ).toBe(false);
    expect(
      isLessonComplete({
        practiceSolved: 8,
        practiceTotal: 8,
        quizScore: 1,
        quizTotal: 3,
      }),
    ).toBe(false);
    expect(
      isLessonComplete({
        practiceSolved: 8,
        practiceTotal: 8,
        quizScore: null,
        quizTotal: null,
      }),
    ).toBe(false);
  });
});
