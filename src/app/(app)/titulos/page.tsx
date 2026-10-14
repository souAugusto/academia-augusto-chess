import type { Metadata } from "next";
import { PlanRequired } from "@/components/app/PlanRequired";
import { TitleBadge } from "@/components/titles/TitleBadge";
import { TitleProgressCard } from "@/components/titles/TitleProgressCard";
import { SectionLabel } from "@/components/ui/Label";
import { requireUser } from "@/lib/data/account";
import { getMyTitleSummary } from "@/lib/data/titles";
import { formatLongDate } from "@/lib/format";
import { TITLE_MIN_GAMES } from "@/lib/titles";

export const metadata: Metadata = { title: "Títulos" };

export default async function TitulosPage() {
  const user = await requireUser("/titulos");
  if (user.planRank < 1)
    return (
      <PlanRequired
        title="Títulos"
        text="Os títulos acompanham o seu rating de táticas, que faz parte da assinatura."
      />
    );
  const summary = await getMyTitleSummary(user.id);

  return (
    <>
      <div className="flex flex-col gap-2">
        <SectionLabel>Táticas</SectionLabel>
        <h1 className="font-display text-page font-semibold tracking-tight">
          Títulos
        </h1>
        <p className="max-w-2xl leading-relaxed text-muted">
          Cada título acompanha o seu rating de táticas. O primeiro sai depois
          de {TITLE_MIN_GAMES} puzzles valendo rating, e título conquistado é
          seu para sempre: se o rating cair, ele continua.
        </p>
      </div>

      <section className="max-w-[640px] rounded-card border border-border bg-surface p-6 shadow-card">
        <TitleProgressCard summary={summary} links={false} />
      </section>

      <ol className="flex max-w-[640px] flex-col gap-3">
        {[...summary.ladder].reverse().map((title) => {
          const earnedAt = summary.earned.get(title.id);
          const isCurrent = summary.current?.id === title.id;
          return (
            <li
              key={title.id}
              aria-current={isCurrent ? "true" : undefined}
              className={`flex flex-wrap items-center justify-between gap-3 rounded-card border p-4 ${
                isCurrent
                  ? "border-accent bg-surface-2"
                  : earnedAt
                    ? "border-border bg-surface"
                    : "border-border bg-surface opacity-60"
              }`}
            >
              <div className="flex min-w-0 flex-col gap-1.5">
                {earnedAt ? (
                  <TitleBadge name={title.name} color={title.color} />
                ) : (
                  <span className="flex items-center gap-2 text-sm font-semibold text-muted">
                    <svg
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                      className="size-4"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <rect x="5" y="11" width="14" height="10" rx="2" />
                      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
                    </svg>
                    {title.name}
                    <span className="sr-only">(bloqueado)</span>
                  </span>
                )}
                {title.tagline && (
                  <span className="text-sm text-muted">{title.tagline}</span>
                )}
              </div>
              <div className="flex w-full items-baseline justify-between gap-2 text-sm sm:w-auto sm:flex-col sm:items-end">
                <span className="font-semibold tabular-nums">
                  {title.minRating === 0
                    ? "Primeiro título"
                    : `${title.minRating.toLocaleString("pt-BR")}+`}
                </span>
                {earnedAt && (
                  <span className="text-muted">
                    {isCurrent ? "Atual · " : ""}desde{" "}
                    {formatLongDate(earnedAt)}
                  </span>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </>
  );
}
