// Importa nomes e códigos ECO de aberturas do repositório lichess-org/chess-openings (CC0).
// Uso: npm run import:openings
// Precisa de NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no .env.local.
import { createClient } from "@supabase/supabase-js";
import {
  OPENINGS_BASE_URL,
  OPENINGS_FILES,
  parseOpeningLine,
  type OpeningRow,
} from "../src/lib/openings/catalog.ts";

function env(name: string): string {
  const value = process.env[name];
  if (!value) {
    console.error(`Falta ${name} no .env.local.`);
    process.exit(1);
  }
  return value;
}

async function main() {
  const supabase = createClient(
    env("NEXT_PUBLIC_SUPABASE_URL"),
    env("SUPABASE_SERVICE_ROLE_KEY"),
    {
      auth: { persistSession: false },
    },
  );
  const rows: OpeningRow[] = [];
  for (const file of OPENINGS_FILES) {
    const response = await fetch(`${OPENINGS_BASE_URL}/${file}`);
    if (!response.ok)
      throw new Error(`Falha ao baixar ${file}: HTTP ${response.status}`);
    const lines = (await response.text()).split("\n").slice(1);
    const parsed = lines
      .map(parseOpeningLine)
      .filter((row): row is OpeningRow => row !== null);
    console.log(`  ${file}: ${parsed.length} aberturas`);
    rows.push(...parsed);
  }
  for (let i = 0; i < rows.length; i += 1000) {
    const { error } = await supabase
      .from("openings")
      .upsert(rows.slice(i, i + 1000), { onConflict: "eco,name,pgn" });
    if (error) throw new Error(`Falha ao gravar: ${error.message}`);
  }
  console.log(`Pronto: ${rows.length} aberturas importadas.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
