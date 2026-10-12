import { describe, expect, it } from "vitest";
import { addDays } from "./dates";
import { recentDays, streakStats } from "./streak";

describe("addDays", () => {
  it("atravessa mês e ano", () => {
    expect(addDays("2026-12-31", 1)).toBe("2027-01-01");
    expect(addDays("2026-03-01", -1)).toBe("2026-02-28");
  });
});

describe("streakStats", () => {
  const today = "2026-10-11";

  it("conta dias seguidos até hoje", () => {
    expect(
      streakStats(["2026-10-09", "2026-10-10", "2026-10-11"], today),
    ).toEqual({ current: 3, best: 3, trainedToday: true });
  });

  it("antes de treinar hoje, a sequência de ontem continua valendo", () => {
    expect(streakStats(["2026-10-09", "2026-10-10"], today)).toEqual({
      current: 2,
      best: 2,
      trainedToday: false,
    });
  });

  it("um dia sem treino zera a sequência atual, mas guarda o recorde", () => {
    expect(
      streakStats(
        ["2026-10-01", "2026-10-02", "2026-10-03", "2026-10-04", "2026-10-09"],
        today,
      ),
    ).toEqual({ current: 0, best: 4, trainedToday: false });
  });

  it("ignora datas repetidas e fora de ordem", () => {
    expect(
      streakStats(["2026-10-11", "2026-10-10", "2026-10-11"], today).current,
    ).toBe(2);
    expect(streakStats([], today)).toEqual({
      current: 0,
      best: 0,
      trainedToday: false,
    });
  });
});

describe("recentDays", () => {
  it("lista os últimos dias, terminando hoje", () => {
    expect(recentDays(["2026-10-10"], "2026-10-11", 3)).toEqual([
      { day: "2026-10-09", trained: false },
      { day: "2026-10-10", trained: true },
      { day: "2026-10-11", trained: false },
    ]);
  });
});
