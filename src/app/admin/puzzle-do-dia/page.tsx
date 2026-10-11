import type { Metadata } from "next";
import { AdminForm, AdminInput } from "@/components/admin/AdminForm";
import { SectionLabel } from "@/components/ui/Label";
import { requireAdmin } from "@/lib/data/admin";
import { todayInSaoPaulo } from "@/lib/format";
import { addMonths } from "@/lib/payments/rules";
import { createClient } from "@/lib/supabase/server";
import { setDailyPuzzle } from "./actions";

export const metadata: Metadata = { title: "Puzzle do dia" };

const DAYS = 14;

function addDays(date: string, days: number): string {
  const value = new Date(`${date}T12:00:00Z`);
  value.setUTCDate(value.getUTCDate() + days);
  return value.toISOString().slice(0, 10);
}

function formatDay(day: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: "UTC",
    weekday: "short",
    day: "numeric",
    month: "short",
  }).format(new Date(`${day}T12:00:00Z`));
}

export default async function PuzzleDoDiaAdminPage() {
  await requireAdmin("/admin/puzzle-do-dia");
  const today = todayInSaoPaulo();
  const last = addDays(today, DAYS - 1);
  const supabase = await createClient();
  const [{ data: days }, { count: scheduled }] = await Promise.all([
    supabase
      .from("daily_puzzles")
      .select("day, puzzle_id, puzzles (rating, themes)")
      .gte("day", today)
      .lte("day", last)
      .order("day"),
    supabase
      .from("daily_puzzles")
      .select("day", { count: "exact", head: true })
      .gte("day", today)
      .lte("day", addMonths(today, 12)),
  ]);
  const byDay = new Map((days ?? []).map((row) => [row.day, row]));

  return (
    <>
      <div className="flex flex-col gap-2">
        <SectionLabel>Painel</SectionLabel>
        <h1 className="font-display text-page font-semibold tracking-tight">
          Puzzle do dia
        </h1>
        <p className="max-w-2xl text-muted">
          O puzzle do dia é a única parte jogável sem assinatura. Há{" "}
          {scheduled ?? 0} dias agendados a partir de hoje. Para trocar um dia,
          use o código do puzzle no Lichess (lichess.org/training/código).
        </p>
      </div>
      <ul className="flex flex-col gap-2">
        {Array.from({ length: DAYS }, (_, index) => addDays(today, index)).map(
          (day) => {
            const row = byDay.get(day);
            const puzzle = row?.puzzles as unknown as {
              rating: number;
            } | null;
            return (
              <li
                key={day}
                className="flex flex-wrap items-end justify-between gap-3 rounded-card border border-border bg-surface px-4 py-3"
              >
                <div className="flex flex-col">
                  <span className="font-semibold capitalize">
                    {day === today ? "Hoje" : formatDay(day)}
                  </span>
                  <span className="text-sm text-muted">
                    {row
                      ? `${row.puzzle_id} · rating ${puzzle?.rating ?? "?"}`
                      : "Sem puzzle agendado"}
                  </span>
                </div>
                <AdminForm
                  action={setDailyPuzzle}
                  submitLabel="Trocar"
                  variant="secondary"
                  className="flex flex-wrap items-end gap-2"
                >
                  <input type="hidden" name="day" value={day} />
                  <AdminInput
                    id={`puzzle-${day}`}
                    name="puzzleId"
                    label="Código"
                    placeholder="ex.: 00sHx"
                    maxLength={5}
                    required
                  />
                </AdminForm>
              </li>
            );
          },
        )}
      </ul>
    </>
  );
}
