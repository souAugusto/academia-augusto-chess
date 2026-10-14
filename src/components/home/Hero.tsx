import Link from "next/link";
import { StaticBoard } from "@/components/chess/StaticBoard";
import { buttonClasses } from "@/components/ui/button";
import { SectionLabel } from "@/components/ui/Label";
import { HERO } from "@/content/home";
import { TRIAL_CTA, TRIAL_HREF, TRIAL_NOTE } from "@/content/trial";
import { HeroVideo } from "./HeroVideo";
import type { DailyPuzzle } from "@/lib/data/public";

export function Hero({ puzzle }: { puzzle: DailyPuzzle | null }) {
  const side = puzzle?.sideToMove === "b" ? "Pretas jogam" : "Brancas jogam";
  return (
    <section id="topo" className="relative isolate overflow-hidden">
      <HeroVideo />
      {/* Escurece o vídeo para o texto ler bem e funde a base com o fundo da página. */}
      <div aria-hidden="true" className="hero-overlay absolute inset-0 -z-10" />
      {/* Sobre o vídeo o hero é sempre escuro, nos dois temas do site. */}
      <div
        data-theme="dark"
        className="mx-auto grid max-w-6xl items-center gap-12 px-4 pt-14 pb-24 text-text sm:px-6 lg:grid-cols-[1.05fr_1fr] lg:pt-20 lg:pb-28"
      >
        <div className="flex flex-col gap-6">
          <SectionLabel>{HERO.label}</SectionLabel>
          <h1 className="font-display text-hero font-semibold tracking-tight">
            {HERO.title}
          </h1>
          <p className="max-w-xl text-lg leading-relaxed text-muted sm:text-xl">
            {HERO.text}
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href={TRIAL_HREF} className={buttonClasses("primary", "lg")}>
              {TRIAL_CTA}
            </Link>
            <Link href="#planos" className={buttonClasses("secondary", "lg")}>
              {HERO.primaryCta}
            </Link>
          </div>
          <p className="text-sm text-muted">
            {TRIAL_NOTE} {HERO.note}
          </p>
        </div>

        <div
          id="puzzle"
          className="mx-auto w-full max-w-[520px] scroll-mt-20 rounded-panel border border-border bg-glass p-3 shadow-board backdrop-blur-xl sm:p-4"
        >
          {puzzle ? (
            <div className="flex flex-col gap-3">
              <StaticBoard
                decorative
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
                <Link
                  href="/puzzle-do-dia"
                  className="flex min-h-touch w-full items-center justify-center rounded-control border border-border-strong font-semibold hover:bg-surface-2"
                >
                  {HERO.secondaryCta}
                </Link>
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
