"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";
import { buttonClasses } from "@/components/ui/button";
import type { PuzzleRecord } from "@/lib/chess/puzzle";
import { PuzzleBoard, type PuzzlePhase } from "./PuzzleBoard";

// Puzzle do dia público: joga no navegador, sem salvar nada.
export function DailyPuzzlePlayer({
  puzzle,
  title,
}: {
  puzzle: PuzzleRecord;
  title: ReactNode;
}) {
  const [phase, setPhase] = useState<PuzzlePhase>("intro");
  const finished = phase === "solved" || phase === "revealed";

  return (
    <PuzzleBoard
      puzzle={puzzle}
      onPhaseChange={setPhase}
      title={title}
      result={
        finished && (
          <div className="flex flex-col gap-2 rounded-control border border-accent bg-surface-2 p-4">
            <h2 className="font-semibold">
              {phase === "solved"
                ? "Muito bem. Amanhã tem outro."
                : "Amanhã tem outro puzzle."}
            </h2>
            <p className="text-sm leading-relaxed text-muted">
              Na Finale você treina táticas por tema e dificuldade, com rating e
              revisão dos erros, além de aberturas, finais e aulas.
            </p>
            <Link
              href="/planos"
              className={buttonClasses("primary", "md", "self-start")}
            >
              Ver planos
            </Link>
          </div>
        )
      }
    />
  );
}
