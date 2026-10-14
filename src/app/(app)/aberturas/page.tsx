import type { Metadata } from "next";
import Link from "next/link";
import { PlanRequired } from "@/components/app/PlanRequired";
import { SectionIcon } from "@/components/app/SectionIcon";
import { OpeningLessonList } from "@/components/study/LessonLists";
import { Card } from "@/components/ui/Card";
import { SectionLabel } from "@/components/ui/Label";
import { requireUser } from "@/lib/data/account";
import { getStudyProgress } from "@/lib/data/lessons";
import { listRepertoires } from "@/lib/data/repertoires";

export const metadata: Metadata = { title: "Aberturas" };

export default async function AberturasPage() {
  const user = await requireUser("/aberturas");
  if (user.planRank < 1) {
    return (
      <PlanRequired
        title="Aberturas"
        text="Os repertórios de aberturas, com comentário em cada lance e modo treino, fazem parte da assinatura."
      />
    );
  }

  const [repertoires, progress] = await Promise.all([
    listRepertoires(),
    getStudyProgress(),
  ]);
  return (
    <>
      <div className="flex flex-col gap-2">
        <SectionLabel>Treino</SectionLabel>
        <h1 className="font-display text-page font-semibold tracking-tight">
          Aberturas
        </h1>
        <p className="max-w-2xl leading-relaxed text-muted">
          Comece pelas lições: as ideias de cada abertura, a linha principal
          explicada, armadilhas, exercícios e quiz. Depois treine os
          repertórios: o app joga o adversário e você precisa acertar a sua
          linha.
        </p>
      </div>

      <section aria-labelledby="licoes" className="flex flex-col gap-6">
        <h2 id="licoes" className="font-display text-2xl font-semibold">
          Lições
        </h2>
        <OpeningLessonList progress={progress} heading="h3" />
      </section>

      <h2 id="repertorios" className="font-display text-2xl font-semibold">
        Repertórios para treinar
      </h2>
      {repertoires.length === 0 ? (
        <Card className="flex flex-col items-start gap-4 p-8">
          <span className="flex size-12 items-center justify-center rounded-control bg-surface-2 text-accent-text">
            <SectionIcon id="aberturas" className="size-6" />
          </span>
          <p className="leading-relaxed text-muted">
            Nenhum repertório publicado ainda.
          </p>
        </Card>
      ) : (
        <ul className="grid gap-5 md:grid-cols-2">
          {repertoires.map((repertoire) => {
            const percent = repertoire.lines
              ? Math.round((repertoire.trained / repertoire.lines) * 100)
              : 0;
            return (
              <li key={repertoire.id}>
                <Link
                  href={`/aberturas/${repertoire.slug}`}
                  className="flex h-full flex-col gap-3 rounded-card border border-border bg-surface p-6 shadow-card transition hover:border-border-strong"
                >
                  <span className="text-xs font-semibold tracking-label text-accent-text uppercase">
                    {repertoire.color === "white"
                      ? "Com as brancas"
                      : "Com as pretas"}
                  </span>
                  <h3 className="text-xl font-semibold">{repertoire.title}</h3>
                  {repertoire.description && (
                    <p className="leading-relaxed text-muted">
                      {repertoire.description}
                    </p>
                  )}
                  <div className="mt-auto flex flex-col gap-2 pt-2">
                    <div
                      className="h-2 overflow-hidden rounded-full bg-surface-2"
                      role="progressbar"
                      aria-valuenow={percent}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-label={`Linhas treinadas em ${repertoire.title}`}
                    >
                      <div
                        className="h-full rounded-full bg-accent"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                    <span className="text-sm text-muted">
                      {repertoire.trained} de {repertoire.lines} linhas
                      treinadas
                    </span>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
