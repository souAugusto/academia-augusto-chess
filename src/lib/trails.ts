// Trilhas: sequência de etapas montada pelo Augusto no admin.

export type StepKind = "lesson" | "repertoire" | "endgame" | "set";

export type TrailStep = {
  id: string;
  kind: StepKind;
  refId: string;
  title: string;
  position: number;
};

export type TrailProgress = {
  completed: number;
  total: number;
  percent: number;
  next: TrailStep | null; // primeira etapa não concluída, na ordem da trilha
};

export const stepKey = (kind: StepKind, refId: string) => `${kind}:${refId}`;

// done: chaves "tipo:id" do que o aluno já concluiu.
export function trailProgress(
  steps: TrailStep[],
  done: Set<string>,
): TrailProgress {
  const ordered = [...steps].sort((a, b) => a.position - b.position);
  const completed = ordered.filter((step) =>
    done.has(stepKey(step.kind, step.refId)),
  ).length;
  return {
    completed,
    total: ordered.length,
    percent: ordered.length
      ? Math.round((completed / ordered.length) * 100)
      : 0,
    next:
      ordered.find((step) => !done.has(stepKey(step.kind, step.refId))) ?? null,
  };
}

export const STEP_LABELS: Record<StepKind, string> = {
  lesson: "Aula",
  repertoire: "Abertura",
  endgame: "Final",
  set: "Conjunto de táticas",
};

// Endereço da etapa no app.
export function stepHref(
  step: Pick<TrailStep, "kind" | "refId">,
  extra: { courseId?: string; slug?: string },
): string {
  switch (step.kind) {
    case "lesson":
      return `/aulas/${extra.courseId}/${step.refId}`;
    case "repertoire":
      return `/aberturas/${extra.slug}`;
    case "endgame":
      return `/finais/${extra.slug}`;
    case "set":
      return `/treino/${step.refId}`;
  }
}
