import { describe, expect, it } from "vitest";
import { gameAccuracy, markFor, moveLoss } from "./review";

const cp = (value: number) => ({ kind: "cp" as const, value });

describe("precisão aproximada", () => {
  it("perda e marcação", () => {
    expect(moveLoss({ before: cp(0), after: cp(0) })).toBe(0);
    expect(moveLoss({ before: cp(0), after: cp(50) })).toBe(0);
    expect(moveLoss({ before: null, after: cp(0) })).toBeNull();
    expect(markFor(moveLoss({ before: cp(0), after: cp(-900) }))).toBe("erro-grave");
    expect(markFor(25)).toBe("erro-grave");
    expect(markFor(15)).toBe("erro");
    expect(markFor(7)).toBe("imprecisao");
    expect(markFor(1)).toBeNull();
    expect(markFor(null)).toBeNull();
  });

  it("média dos lances avaliados", () => {
    expect(gameAccuracy([])).toBeNull();
    expect(gameAccuracy([{ before: cp(0), after: cp(0) }])).toBe(100);
    const mixed = gameAccuracy([
      { before: cp(0), after: cp(0) },
      { before: cp(0), after: { kind: "mate", value: -1 } },
      { before: null, after: null },
    ]);
    expect(mixed).toBeGreaterThan(40);
    expect(mixed).toBeLessThan(60);
  });
});
