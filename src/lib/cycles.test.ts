import { describe, expect, it } from "vitest";
import { cycleDelta, cycleProgress, formatDuration } from "./cycles";

describe("cycleProgress", () => {
  const items = ["a", "b", "c"];

  it("segue a ordem do conjunto e soma tempo e acertos", () => {
    expect(
      cycleProgress(items, [
        { puzzleId: "a", solved: true, seconds: 10 },
        { puzzleId: "b", solved: false, seconds: 25.5 },
      ]),
    ).toEqual({
      done: 2,
      total: 3,
      correct: 1,
      seconds: 35.5,
      nextPuzzleId: "c",
      finished: false,
    });
  });

  it("vale só a primeira tentativa de cada puzzle", () => {
    const progress = cycleProgress(items, [
      { puzzleId: "a", solved: false, seconds: 5 },
      { puzzleId: "a", solved: true, seconds: 3 },
    ]);
    expect(progress.correct).toBe(0);
    expect(progress.seconds).toBe(5);
  });

  it("termina quando todos foram feitos", () => {
    const progress = cycleProgress(
      items,
      items.map((puzzleId) => ({ puzzleId, solved: true, seconds: 1 })),
    );
    expect(progress.finished).toBe(true);
    expect(progress.nextPuzzleId).toBe(null);
  });

  it("conjunto vazio nunca termina", () => {
    expect(cycleProgress([], []).finished).toBe(false);
  });
});

describe("formatDuration", () => {
  it("formata segundos, minutos e horas", () => {
    expect(formatDuration(45)).toBe("45s");
    expect(formatDuration(185)).toBe("3:05");
    expect(formatDuration(3723)).toBe("1:02:03");
    expect(formatDuration(-3)).toBe("0s");
  });
});

describe("cycleDelta", () => {
  it("compara com o ciclo anterior", () => {
    expect(cycleDelta(300, 360)).toEqual({ seconds: -60, faster: true });
    expect(cycleDelta(400, 360)).toEqual({ seconds: 40, faster: false });
    expect(cycleDelta(400, null)).toBe(null);
  });
});
