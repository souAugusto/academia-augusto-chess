import Link from "next/link";
import { StaticBoard } from "@/components/chess/StaticBoard";
import { buttonClasses } from "@/components/ui/button";
import { SectionLabel } from "@/components/ui/Label";
import { HERO } from "@/content/home";
import type { DailyPuzzle } from "@/lib/data/public";

export function Hero({ puzzle }: { puzzle: DailyPuzzle | null }) {
  const side = puzzle?.sideToMove === "b" ? "Pretas jogam" : "Brancas jogam";
  return (
    <section id="topo" className="bg-aurora">
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 pt-14 pb-20 sm:px-6 lg:grid-cols-[1.05fr_1fr] lg:pt-20">
        <div className="flex flex-col gap-6">
          <SectionLabel>{HERO.label}</SectionLabel>
          <h1 className="font-display text-hero font-semibold tracking-tight">
            {HERO.title}
          </h1>
          <p className="max-w-xl text-lg leading-relaxed text-muted sm:text-xl">
            {HERO.text}
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="#planos" className={buttonClasses("primary", "lg")}>
              {HERO.primaryCta}
            </Link>
            <Link
              href="/puzzle-do-dia"
              className={buttonClasses("secondary", "lg")}
            >
              {HERO.secondaryCta}
            </Link>
          </div>
          <p className="text-sm text-muted">{HERO.note}</p>
        </div>

        <div
          id="puzzle"
          className="mx-auto w-full max-w-[520px] scroll-mt-20 rounded-panel border border-border bg-glass p-3 shadow-board backdrop-blur-xl sm:p-4"
        >
          {puzzle ? (
            <div className="flex flex-col gap-3">
              <StaticBoard
                fen={puzzle.fen}
                orientation={puzzle.sideToMove}
                highlight={
                  puzzle.lastMove
                    ? [puzzle.lastMove.from, puzzle.lastMove.to]
                    : []
                }
                label={`Puzzle do dia. ${side}.`}
              />
              <div className="flex flex-wrap items-center justify-between gap-2 px-1 text-sm">
                <span className="font-semibold text-accent-text">
                  Puzzle do dia
                  {puzzle.themeLabel ? ` · ${puzzle.themeLabel}` : ""}
                </span>
                <span className="text-muted">{side}</span>
              </div>
            </div>
          ) : (
            <p className="p-6 text-muted">O puzzle do dia volta em breve.</p>
          )}
        </div>
      </div>
    </section>
  );
}
