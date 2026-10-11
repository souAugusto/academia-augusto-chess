import type { Metadata } from "next";
import Link from "next/link";
import { PlanRequired } from "@/components/app/PlanRequired";
import { SectionIcon } from "@/components/app/SectionIcon";
import { StaticBoard } from "@/components/chess/StaticBoard";
import { Card } from "@/components/ui/Card";
import { IconCheck } from "@/components/ui/icons";
import { SectionLabel } from "@/components/ui/Label";
import { requireUser } from "@/lib/data/account";
import { LEVEL_LABELS, listEndgames } from "@/lib/data/endgames";
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

  const endgames = await listEndgames();
  const levels = [...new Set(endgames.map((endgame) => endgame.level))];

  return (
    <>
      <div className="flex flex-col gap-2">
        <SectionLabel>Treino</SectionLabel>
        <h1 className="font-display text-page font-semibold tracking-tight">
          Finais
        </h1>
        <p className="max-w-2xl leading-relaxed text-muted">
          Posições clássicas para jogar contra o computador. Converta as
          posições ganhas e segure as empatadas.
        </p>
      </div>

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
            <h2 id={`nivel-${level}`} className="text-lg font-semibold">
              {LEVEL_LABELS[level] ?? `Nível ${level}`}
            </h2>
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
                          <h3 className="font-semibold">{endgame.title}</h3>
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
