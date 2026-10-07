// Agenda o puzzle do dia para os próximos dias (padrão: 365), sem repetir puzzles.
// Preenche só os dias vazios, e troca o puzzle de teste "teste-mate-pastor".
//
// Uso:   npm run schedule:daily            (365 dias a partir de hoje, em São Paulo)
//        npm run schedule:daily -- 30
//
// Precisa de NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no .env.local.
import { createClient } from "@supabase/supabase-js";
import { todayInSaoPaulo } from "../src/lib/format.ts";

const DAYS = Number(process.argv[2] ?? 365);
const TEST_PUZZLE = "teste-mate-pastor";
// Puzzle do dia: acessível (o público vem das redes sociais) e bem avaliado.
const RATING_RANGE = [1000, 1700];
const MIN_POPULARITY = 95;

function env(name: string): string {
  const value = process.env[name];
  if (!value) {
    console.error(`Falta ${name} no .env.local.`);
    process.exit(1);
  }
  return value;
}

function addDays(day: string, amount: number): string {
  const date = new Date(`${day}T12:00:00Z`);
  date.setUTCDate(date.getUTCDate() + amount);
  return date.toISOString().slice(0, 10);
}

async function main() {
  const supabase = createClient(
    env("NEXT_PUBLIC_SUPABASE_URL"),
    env("SUPABASE_SERVICE_ROLE_KEY"),
    {
      auth: { persistSession: false },
    },
  );
  const today = todayInSaoPaulo();
  const days = Array.from({ length: DAYS }, (_, i) => addDays(today, i));

  const { data: scheduled, error: scheduledError } = await supabase
    .from("daily_puzzles")
    .select("day, puzzle_id");
  if (scheduledError) throw scheduledError;
  const used = new Set((scheduled ?? []).map((row) => row.puzzle_id));
  const taken = new Set(
    (scheduled ?? [])
      .filter((row) => row.puzzle_id !== TEST_PUZZLE)
      .map((row) => row.day),
  );
  const empty = days.filter((day) => !taken.has(day));

  const { data: candidates, error } = await supabase
    .from("puzzles")
    .select("id")
    .eq("source", "lichess")
    .gte("rating", RATING_RANGE[0])
    .lte("rating", RATING_RANGE[1])
    .gte("popularity", MIN_POPULARITY)
    .limit(5000);
  if (error) throw error;

  const pool = (candidates ?? [])
    .map((row) => row.id)
    .filter((id) => !used.has(id));
  // Embaralha (Fisher–Yates) para variar temas e dificuldade ao longo dos dias.
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  if (pool.length < empty.length) {
    throw new Error(
      `Só há ${pool.length} puzzles disponíveis para ${empty.length} dias. Importe mais puzzles.`,
    );
  }

  const rows = empty.map((day, i) => ({ day, puzzle_id: pool[i] }));
  const { error: upsertError } = await supabase
    .from("daily_puzzles")
    .upsert(rows, { onConflict: "day" });
  if (upsertError) throw upsertError;

  // O puzzle de teste da Fase 1 sai do banco (e do calendário, em cascata).
  await supabase.from("puzzles").delete().eq("id", TEST_PUZZLE);
  console.log(
    `Pronto: ${rows.length} dias agendados, de ${empty[0] ?? "-"} a ${empty.at(-1) ?? "-"}.`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
