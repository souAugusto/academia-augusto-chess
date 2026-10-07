import { describe, expect, it } from "vitest";
import { median, nextReview } from "./srs";

const now = new Date("2026-10-07T12:00:00Z");
const HOUR = 60 * 60 * 1000;

describe("nextReview", () => {
  it("erro: zera repetições, reduz ease e volta em 10 minutos", () => {
    const result = nextReview({
      previous: { ease: 2.5, intervalDays: 3, repetitions: 2, lapses: 0 },
      solved: false,
      seconds: 30,
      medianSeconds: null,
      now,
    });
    expect(result).toEqual({
      ease: 2.3,
      intervalDays: 0,
      repetitions: 0,
      lapses: 1,
      dueAt: new Date(now.getTime() + 10 * 60 * 1000),
    });
  });

  it("ease nunca fica abaixo de 1.3", () => {
    const result = nextReview({
      previous: { ease: 1.4, intervalDays: 0, repetitions: 0, lapses: 5 },
      solved: false,
      seconds: 10,
      medianSeconds: null,
      now,
    });
    expect(result.ease).toBe(1.3);
  });

  it("acertos: 1 dia, depois 3, depois intervalo × ease", () => {
    const first = nextReview({
      previous: null,
      solved: true,
      seconds: 20,
      medianSeconds: null,
      now,
    });
    expect(first.intervalDays).toBe(1);
    expect(first.dueAt).toEqual(new Date(now.getTime() + 24 * HOUR));

    const second = nextReview({
      previous: first,
      solved: true,
      seconds: 20,
      medianSeconds: null,
      now,
    });
    expect(second.intervalDays).toBe(3);

    const third = nextReview({
      previous: second,
      solved: true,
      seconds: 20,
      medianSeconds: null,
      now,
    });
    expect(third.intervalDays).toBe(8); // round(3 × 2.5)
  });

  it("acerto bem mais rápido que a mediana aumenta o ease", () => {
    const result = nextReview({
      previous: null,
      solved: true,
      seconds: 10,
      medianSeconds: 40,
      now,
    });
    expect(result.ease).toBe(2.55);
  });

  it("acerto em tempo normal mantém o ease", () => {
    const result = nextReview({
      previous: null,
      solved: true,
      seconds: 35,
      medianSeconds: 40,
      now,
    });
    expect(result.ease).toBe(2.5);
  });
});

describe("median", () => {
  it("calcula a mediana", () => {
    expect(median([30, 10, 20])).toBe(20);
    expect(median([10, 20, 30, 40])).toBe(25);
    expect(median([])).toBeNull();
  });
});
