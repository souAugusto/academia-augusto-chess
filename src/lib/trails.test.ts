import { describe, expect, it } from "vitest";
import { stepHref, stepKey, trailProgress, type TrailStep } from "./trails";

const steps: TrailStep[] = [
  { id: "2", kind: "endgame", refId: "e1", title: "Lucena", position: 2 },
  { id: "1", kind: "lesson", refId: "l1", title: "Mate básico", position: 1 },
  { id: "3", kind: "set", refId: "s1", title: "Garfos", position: 3 },
];

describe("trailProgress", () => {
  it("conta o concluído e aponta a próxima etapa na ordem", () => {
    expect(trailProgress(steps, new Set([stepKey("lesson", "l1")]))).toEqual({
      completed: 1,
      total: 3,
      percent: 33,
      next: steps[0],
    });
  });

  it("pula etapas feitas fora de ordem", () => {
    const progress = trailProgress(steps, new Set([stepKey("endgame", "e1")]));
    expect(progress.next?.id).toBe("1");
  });

  it("trilha concluída não tem próxima etapa", () => {
    const done = new Set(steps.map((step) => stepKey(step.kind, step.refId)));
    expect(trailProgress(steps, done)).toMatchObject({
      percent: 100,
      next: null,
    });
    expect(trailProgress([], new Set()).percent).toBe(0);
  });
});

describe("stepHref", () => {
  it("monta o link de cada tipo de etapa", () => {
    expect(stepHref({ kind: "lesson", refId: "l1" }, { courseId: "c1" })).toBe(
      "/aulas/c1/l1",
    );
    expect(stepHref({ kind: "endgame", refId: "e1" }, { slug: "lucena" })).toBe(
      "/finais/lucena",
    );
    expect(stepHref({ kind: "set", refId: "s1" }, {})).toBe("/treino/s1");
  });
});
