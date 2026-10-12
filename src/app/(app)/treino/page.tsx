import type { Metadata } from "next";
import Link from "next/link";
import { PlanRequired } from "@/components/app/PlanRequired";
import { CreateSetForm } from "@/components/training/CreateSetForm";
import { Card } from "@/components/ui/Card";
import { SectionLabel } from "@/components/ui/Label";
import { formatDuration } from "@/lib/cycles";
import { requireUser } from "@/lib/data/account";
import { listSets } from "@/lib/data/training";

export const metadata: Metadata = { title: "Treino" };

export default async function TreinoPage() {
  const user = await requireUser("/treino");
  if (user.planRank < 2) {
    return (
      <PlanRequired
        title="[NOME DO MÉTODO DO INTENSIVO]"
        text="O treino por ciclos de repetição faz parte do plano Intensivo."
      />
    );
  }
  const sets = await listSets(user.id);
  const official = sets.filter((set) => set.official);
  const mine = sets.filter((set) => !set.official);

  return (
    <>
      <div className="flex flex-col gap-2">
        <SectionLabel>Intensivo</SectionLabel>
        <h1 className="font-display text-page font-semibold tracking-tight">
          [NOME DO MÉTODO DO INTENSIVO]
        </h1>
        <p className="max-w-2xl leading-relaxed text-muted">
          Escolha um conjunto e resolva todos os puzzles, na mesma ordem, ciclo
          após ciclo. O cronômetro mostra o tempo do puzzle, do ciclo atual e do
          ciclo anterior. Errou? A solução aparece e você segue.
        </p>
      </div>

      <SetList
        title="Conjuntos oficiais"
        sets={official}
        empty="Os conjuntos oficiais aparecem aqui."
      />
      <SetList
        title="Meus conjuntos"
        sets={mine}
        empty="Você ainda não montou um conjunto."
      />

      <Card className="flex max-w-2xl flex-col gap-4">
        <h2 className="text-lg font-semibold">Montar um conjunto</h2>
        <CreateSetForm />
      </Card>
    </>
  );
}

function SetList({
  title,
  sets,
  empty,
}: {
  title: string;
  sets: Awaited<ReturnType<typeof listSets>>;
  empty: string;
}) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-lg font-semibold">{title}</h2>
      {sets.length === 0 ? (
        <p className="text-muted">{empty}</p>
      ) : (
        <ul className="grid gap-3 md:grid-cols-2">
          {sets.map((set) => (
            <li key={set.id}>
              <Link
                href={`/treino/${set.id}`}
                className="flex h-full flex-col gap-1 rounded-card border border-border bg-surface p-5 shadow-card transition hover:border-accent"
              >
                <span className="font-semibold">{set.name}</span>
                {set.description && (
                  <span className="text-sm text-muted">{set.description}</span>
                )}
                <span className="text-sm text-muted">
                  {set.size} puzzles · ciclo {set.currentCycle}
                  {set.lastCycleSeconds !== null &&
                    ` · último ciclo em ${formatDuration(set.lastCycleSeconds)}`}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
