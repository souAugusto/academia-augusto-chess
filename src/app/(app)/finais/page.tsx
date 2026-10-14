import type { Metadata } from "next";
import Link from "next/link";
import { PlanRequired } from "@/components/app/PlanRequired";
import { SectionIcon } from "@/components/app/SectionIcon";
import { StaticBoard } from "@/components/chess/StaticBoard";
import { EndgameLessonList } from "@/components/study/LessonLists";
import { Card } from "@/components/ui/Card";
import { IconCheck } from "@/components/ui/icons";
import { SectionLabel } from "@/components/ui/Label";
import { requireUser } from "@/lib/data/account";
import { LEVEL_LABELS, listEndgames } from "@/lib/data/endgames";
import { getStudyProgress } from "@/lib/data/lessons";
import { GOAL_LABELS } from "@/lib/endgames";

export const metadata: Metadata = { title: "Finais" };

export default async function FinaisPage() {
  const user = await requireUser("/finais");
  if (user.planRank < 1) {
    return (
      <PlanRequired
        title="Finais"
        text="A biblioteca de finais, com treino contra o computador, faz parte da assinatura."
      />
    );
  }

  const [endgames, progress] = await Promise.all([
    listEndgames(),
    getStudyProgress(),
  ]);
  const levels = [...new Set(endgames.map((endgame) => endgame.level))];

  return (
    <>
      <div className="flex flex-col gap-2">
        <SectionLabel>Treino</SectionLabel>
        <h1 className="font-display text-page font-semibold tracking-tight">
          Finais
        </h1>
        <p className="max-w-2xl leading-relaxed text-muted">
          Comece pelas lições: teoria curta, uma posição-modelo explicada e
          posições para praticar. Depois jogue as posições clássicas contra o
          computador: converta as ganhas e segure as empatadas.
        </p>
      </div>

      <section aria-labelledby="licoes" className="flex flex-col gap-6">
        <h2 id="licoes" className="font-display text-2xl font-semibold">
          Lições
        </h2>
        <EndgameLessonList progress={progress} heading="h3" />
      </section>

      <h2 id="treino-motor" className="font-display text-2xl font-semibold">
        Jogue contra o computador
      </h2>
      {endgames.length === 0 ? (
        <Card className="flex flex-col items-start gap-4 p-8">
          <span className="flex size-12 items-center justify-center rounded-control bg-surface-2 text-accent-text">
            <SectionIcon id="finais" className="size-6" />
          </span>
          <p className="leading-relaxed text-muted">
            Nenhum final publicado ainda.
          </p>
        </Card>
      ) : (
        levels.map((level) => (
          <section
            key={level}
            aria-labelledby={`nivel-${level}`}
            className="flex flex-col gap-4"
          >
            <h3 id={`nivel-${level}`} className="text-lg font-semibold">
              {LEVEL_LABELS[level] ?? `Nível ${level}`}
            </h3>
            <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {endgames
                .filter((endgame) => endgame.level === level)
                .map((endgame) => (
                  <li key={endgame.id}>
                    <Link
                      href={`/finais/${endgame.slug}`}
                      className="flex h-full flex-col gap-3 rounded-card border border-border bg-surface p-4 shadow-card transition hover:border-border-strong"
                    >
                      <StaticBoard
                        fen={endgame.fen}
                        orientation={endgame.userColor === "white" ? "w" : "b"}
                        label={`Posição: ${endgame.title}`}
                      />
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex flex-col gap-1">
                          <span className="text-xs text-muted">
                            {endgame.category}
                          </span>
                          <h4 className="font-semibold">{endgame.title}</h4>
                          <span className="text-sm text-accent-text">
                            {GOAL_LABELS[endgame.goal]}
                          </span>
                        </div>
                        {endgame.successes > 0 && (
                          <span className="flex items-center gap-1 text-sm text-success">
                            <IconCheck className="size-4" />
                            Feito
                          </span>
                        )}
                      </div>
                    </Link>
                  </li>
                ))}
            </ul>
          </section>
        ))
      )}
    </>
  );
}
