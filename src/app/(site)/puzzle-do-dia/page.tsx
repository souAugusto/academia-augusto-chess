import type { Metadata } from "next";
import { DailyPuzzlePlayer } from "@/components/chess/DailyPuzzlePlayer";
import { SectionLabel } from "@/components/ui/Label";
import { getDailyPuzzleRecord } from "@/lib/data/public";

export const metadata: Metadata = {
  title: "Puzzle do dia",
  description:
    "Um puzzle de xadrez novo por dia, grátis, para resolver no celular ou no computador.",
};

// Troca à meia-noite de São Paulo; recalcula a cada minuto.
export const revalidate = 60;

export default async function PuzzleDoDiaPage() {
  const record = await getDailyPuzzleRecord();
  const day = record
    ? new Intl.DateTimeFormat("pt-BR", {
        day: "numeric",
        month: "long",
        timeZone: "UTC",
      }).format(new Date(`${record.day}T00:00:00Z`))
    : null;

  const title = (
    <>
      <SectionLabel>
        {day ? `Puzzle do dia · ${day}` : "Puzzle do dia"}
      </SectionLabel>
      <h1 className="font-display text-page font-semibold tracking-tight">
        {record?.themeLabel ?? "Encontre o melhor lance"}
      </h1>
    </>
  );

  return (
    <div className="bg-aurora">
      <div className="board-page mx-auto max-w-6xl">
        {record ? (
          <DailyPuzzlePlayer puzzle={record.puzzle} title={title} />
        ) : (
          <div className="flex flex-col gap-2">
            {title}
            <p className="text-muted">O puzzle do dia volta em breve.</p>
          </div>
        )}
      </div>
    </div>
  );
}
