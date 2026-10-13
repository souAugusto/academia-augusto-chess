import { describe, expect, it } from "vitest";
import { flip, formatEval, scoreValue, winChance } from "./winprob";

describe("winChance", () => {
  it("posição igual vale 50%", () => {
    expect(winChance({ kind: "cp", value: 0 })).toBe(50);
  });

  it("segue a curva do Lichess em valores conhecidos", () => {
    // +1 peão ~ 59%, +3 peões ~ 75%, -3 peões ~ 25%
    expect(winChance({ kind: "cp", value: 100 })).toBeCloseTo(59.1, 1);
    expect(winChance({ kind: "cp", value: 300 })).toBeCloseTo(75.1, 1);
    expect(winChance({ kind: "cp", value: -300 })).toBeCloseTo(24.9, 1);
  });

  it("é simétrica e limitada", () => {
    const a = winChance({ kind: "cp", value: 237 });
    const b = winChance({ kind: "cp", value: -237 });
    expect(a + b).toBeCloseTo(100, 6);
    expect(winChance({ kind: "cp", value: 50_000 })).toBeLessThan(100);
  });

  it("mate a favor é 100, mate contra é 0", () => {
    expect(winChance({ kind: "mate", value: 3 })).toBe(100);
    expect(winChance({ kind: "mate", value: -2 })).toBe(0);
  });
});

describe("flip, scoreValue e formatEval", () => {
  it("troca o lado", () => {
    expect(flip({ kind: "mate", value: 2 })).toEqual({
      kind: "mate",
      value: -2,
    });
  });

  it("ordena mate curto acima de mate longo e de qualquer cp", () => {
    expect(scoreValue({ kind: "mate", value: 1 })).toBeGreaterThan(
      scoreValue({ kind: "mate", value: 5 }),
    );
    expect(scoreValue({ kind: "mate", value: 9 })).toBeGreaterThan(
      scoreValue({ kind: "cp", value: 2000 }),
    );
    expect(scoreValue({ kind: "mate", value: -1 })).toBeLessThan(
      scoreValue({ kind: "mate", value: -6 }),
    );
  });

  it("formata para exibir", () => {
    expect(formatEval({ kind: "cp", value: 123 })).toBe("+1.2");
    expect(formatEval({ kind: "cp", value: 0 })).toBe("0.0");
    expect(formatEval({ kind: "mate", value: -2 })).toBe("-M2");
  });
});
