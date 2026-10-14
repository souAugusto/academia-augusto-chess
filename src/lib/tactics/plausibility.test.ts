import { describe, expect, it } from "vitest";
import { DAILY_RATED_LIMIT, implausibleReason } from "./plausibility";

const base = {
  userMoves: 2,
  seconds: 12,
  secondsSinceLastAttempt: 30,
  ratedToday: 10,
};

describe("implausibleReason", () => {
  it("tentativa normal passa", () => {
    expect(implausibleReason(base)).toBeNull();
    expect(
      implausibleReason({ ...base, secondsSinceLastAttempt: null }),
    ).toBeNull();
  });
  it("rápida demais para o número de lances", () => {
    expect(implausibleReason({ ...base, seconds: 0.5 })).toBe("rapido-demais");
    expect(implausibleReason({ ...base, userMoves: 4, seconds: 3 })).toBe(
      "rapido-demais",
    );
  });
  it("menos de 2 segundos depois da anterior", () => {
    expect(implausibleReason({ ...base, secondsSinceLastAttempt: 1 })).toBe(
      "seguidas-demais",
    );
  });
  it("limite diário", () => {
    expect(implausibleReason({ ...base, ratedToday: DAILY_RATED_LIMIT })).toBe(
      "limite-diario",
    );
  });
});
