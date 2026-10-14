import { describe, expect, it } from "vitest";
import {
  currentTitle,
  eligibleTitles,
  titleProgress,
  type Title,
} from "./titles";

const t = (id: number, minRating: number): Title => ({
  id,
  slug: `t${id}`,
  name: `Título ${minRating}`,
  minRating,
  tagline: null,
  color: "#D4AF57",
});
const LADDER = [
  t(1, 0),
  t(2, 900),
  t(3, 1100),
  t(4, 1300),
  t(5, 1500),
  t(6, 1600),
];

describe("eligibleTitles", () => {
  it("nada antes de 30 puzzles", () => {
    expect(eligibleTitles(LADDER, 1700, 29)).toEqual([]);
  });
  it("todos até o rating, do menor para o maior", () => {
    expect(eligibleTitles(LADDER, 1550, 30).map((x) => x.minRating)).toEqual([
      0, 900, 1100, 1300, 1500,
    ]);
  });
});

describe("currentTitle", () => {
  it("é o mais alto conquistado, mesmo que o rating tenha caído", () => {
    expect(currentTitle(LADDER, new Set([1, 2, 6]))?.minRating).toBe(1600);
    expect(currentTitle(LADDER, new Set())).toBeNull();
  });
});

describe("titleProgress", () => {
  it("calibrando nos primeiros 30", () => {
    expect(titleProgress(LADDER, 1500, 12, null)).toEqual({
      kind: "calibrando",
      games: 12,
      needed: 30,
    });
  });
  it("quanto falta para o próximo", () => {
    const progress = titleProgress(LADDER, 1540, 40, LADDER[4]);
    expect(progress).toMatchObject({
      kind: "proximo",
      missing: 60,
      percent: 40,
    });
    if (progress.kind === "proximo") expect(progress.next.minRating).toBe(1600);
  });
  it("rating caiu abaixo do título: o próximo é o seguinte ao título mantido", () => {
    const progress = titleProgress(LADDER, 1450, 80, LADDER[5]);
    expect(progress.kind).toBe("topo");
  });
  it("no topo da escada", () => {
    expect(titleProgress(LADDER, 1700, 50, LADDER[5]).kind).toBe("topo");
  });
});
