import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PlanRequired } from "@/components/app/PlanRequired";
import { CycleTrainer } from "@/components/training/CycleTrainer";
import { buttonClasses } from "@/components/ui/button";
import { Card } from "@/components/ui/Card";
import { SectionLabel } from "@/components/ui/Label";
import { cycleDelta, formatDuration } from "@/lib/cycles";
import { requireUser } from "@/lib/data/account";
import { isUuid } from "@/lib/data/courses";
import { getSetRun } from "@/lib/data/training";
import { formatLongDate } from "@/lib/format";
import { deleteSet } from "../actions";

export const metadata: Metadata = { title: "Conjunto" };

export default async function ConjuntoPage({
  params,
}: PageProps<"/treino/[conjunto]">) {
  const { conjunto } = await params;
  const user = await requireUser(`/treino/${conjunto}`);
  if (user.planRank < 2) {
    return (
      <PlanRequired
        title="Método Padrão Finale"
        text="O treino por ciclos de repetição faz parte do plano Intensivo."
      />
    );
  }
  if (!isUuid(conjunto)) notFound();
  const run = await getSetRun(conjunto, user.id);
  if (!run) notFound();

  const history = (
    <div className="flex flex-col gap-4">
      <Card className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">Histórico de ciclos</h2>
        {run.history.length === 0 ? (
          <p className="text-sm text-muted">
            Termine o primeiro ciclo para ver o histórico aqui.
          </p>
        ) : (
          <ol className="flex flex-col gap-2">
            {run.history.map((cycle, index) => {
              const delta = cycleDelta(
                cycle.seconds,
                run.history[index + 1]?.seconds ?? null,
              );
              return (
                <li
                  key={cycle.number}
                  className="flex flex-wrap items-baseline justify-between gap-2 rounded-control bg-surface-2 px-3 py-2 text-sm"
                >
                  <span className="font-semibold">Ciclo {cycle.number}</span>
                  <span className="tabular-nums">
                    {formatDuration(cycle.seconds)} · {cycle.correct}/
                    {cycle.total} acertos
                    {delta && (
                      <span
                        className={
                          delta.faster ? "text-success" : "text-danger"
                        }
                      >
                        {" "}
                        ({delta.faster ? "−" : "+"}
                        {formatDuration(Math.abs(delta.seconds))})
                      </span>
                    )}
                  </span>
                  <span className="text-muted">
                    {formatLongDate(new Date(cycle.finishedAt))}
                  </span>
                </li>
              );
            })}
          </ol>
        )}
      </Card>
      {!run.official && (
        <form action={deleteSet}>
          <input type="hidden" name="id" value={run.id} />
          <button type="submit" className={buttonClasses("ghost")}>
            Apagar este conjunto
          </button>
        </form>
      )}
    </div>
  );

  return (
    <CycleTrainer
      key={`${run.cycleNumber}-${run.progress.done}`}
      setId={run.id}
      cycleNumber={run.cycleNumber}
      progress={run.progress}
      puzzle={run.puzzle}
      history={run.history}
      below={history}
      title={
        <div className="flex flex-col gap-1">
          <Link href="/treino" className="text-sm text-muted hover:text-text">
            ← Conjuntos
          </Link>
          <SectionLabel>
            {run.official ? "Conjunto oficial" : "Meu conjunto"}
          </SectionLabel>
          <h1 className="font-display text-page font-semibold tracking-tight">
            {run.name}
          </h1>
        </div>
      }
    />
  );
}
