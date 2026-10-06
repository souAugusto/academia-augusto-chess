import Link from "next/link";
import { StaticBoard } from "@/components/chess/StaticBoard";
import { buttonClasses } from "@/components/ui/button";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { HERO } from "@/content/home";
import type { DailyPuzzle } from "@/lib/data/public";

export function Hero({ puzzle }: { puzzle: DailyPuzzle | null }) {
  const side = puzzle?.sideToMove === "b" ? "Pretas jogam" : "Brancas jogam";
  return (
    <section
      id="topo"
      className="mx-auto flex max-w-[1200px] flex-wrap items-center gap-14 px-4 pt-12 pb-14 sm:px-6 sm:pt-[4.5rem]"
    >
      <div className="flex min-w-0 flex-[1_1_460px] flex-col gap-6">
        <Eyebrow>{HERO.eyebrow}</Eyebrow>
        <h1 className="font-titulo text-hero font-bold tracking-[-0.01em]">
          {HERO.title}
        </h1>
        <p className="max-w-[520px] text-lg leading-relaxed text-texto-secundario">
          {HERO.text}
        </p>
        <div className="flex flex-wrap gap-3.5">
          <Link href="#planos" className={buttonClasses("primario", "lg")}>
            {HERO.primaryCta}
          </Link>
          <Link href="#puzzle" className={buttonClasses("contorno", "lg")}>
            {HERO.secondaryCta}
          </Link>
        </div>
        <span className="text-sm text-texto-discreto">{HERO.liveLine}</span>
      </div>

      <div
        id="puzzle"
        className="flex w-full max-w-[500px] min-w-0 flex-[1_1_380px] scroll-mt-4 flex-col gap-3.5"
      >
        {puzzle ? (
          <>
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
            <div className="flex flex-wrap justify-between gap-2 text-sm">
              <span className="font-bold text-dourado">
                Puzzle do dia
                {puzzle.themeLabel ? ` · ${puzzle.themeLabel}` : ""}
              </span>
              <span className="text-texto-discreto">{side}</span>
            </div>
          </>
        ) : (
          <p className="rounded-card border border-borda bg-superficie p-7 text-texto-secundario">
            O puzzle do dia volta em breve.
          </p>
        )}
      </div>
    </section>
  );
}
