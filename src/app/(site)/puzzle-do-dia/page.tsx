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

  return (
    <div className="bg-aurora">
      <div className="mx-auto flex max-w-xl flex-col gap-6 px-4 py-10 sm:px-6 sm:py-14">
        <div className="flex flex-col gap-2">
          <SectionLabel>
            {day ? `Puzzle do dia · ${day}` : "Puzzle do dia"}
          </SectionLabel>
          <h1 className="font-display text-page font-semibold tracking-tight">
            {record?.themeLabel ?? "Encontre o melhor lance"}
          </h1>
        </div>
        {record ? (
          <DailyPuzzlePlayer puzzle={record.puzzle} />
        ) : (
          <p className="text-muted">O puzzle do dia volta em breve.</p>
        )}
      </div>
    </div>
  );
}
