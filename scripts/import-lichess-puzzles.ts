// Importa puzzles do banco aberto do Lichess (CC0) para a tabela public.puzzles.
//
// Uso:   npm run import:puzzles            (30 mil puzzles)
//        npm run import:puzzles -- 40000   (outra quantidade)
//
// Precisa de NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no .env.local.
// O arquivo (~300 MB) fica em cache na pasta temporária do sistema.
import {
  createReadStream,
  createWriteStream,
  existsSync,
  renameSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createInterface } from "node:readline";
import { pipeline as pipe, Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import type { ReadableStream as WebReadableStream } from "node:stream/web";
import { createZstdDecompress } from "node:zlib";
import { createClient } from "@supabase/supabase-js";
import { SkippableFrameStripper } from "../src/lib/zstd-frames.ts";
import {
  BucketSampler,
  EXPECTED_HEADER,
  LICHESS_PUZZLES_URL,
  parseLichessLine,
  toPuzzleRow,
} from "../src/lib/lichess.ts";

const LIMIT = Number(process.argv[2] ?? 30_000);
const BATCH = 1000;
const CACHE = join(tmpdir(), "lichess_db_puzzle.csv.zst");

function env(name: string): string {
  const value = process.env[name];
  if (!value) {
    console.error(`Falta ${name} no .env.local.`);
    process.exit(1);
  }
  return value;
}

async function download() {
  if (existsSync(CACHE)) return;
  console.log(`Baixando ${LICHESS_PUZZLES_URL} ...`);
  const response = await fetch(LICHESS_PUZZLES_URL);
  if (!response.ok || !response.body)
    throw new Error(`Download falhou: HTTP ${response.status}`);
  const partial = `${CACHE}.parcial`;
  await pipeline(
    Readable.fromWeb(response.body as WebReadableStream),
    createWriteStream(partial),
  );
  renameSync(partial, CACHE);
}

async function main() {
  const supabase = createClient(
    env("NEXT_PUBLIC_SUPABASE_URL"),
    env("SUPABASE_SERVICE_ROLE_KEY"),
    {
      auth: { persistSession: false },
    },
  );
  await download();

  // O arquivo vem do pzstd: tira os quadros de controle antes de descomprimir.
  // Qualquer erro em qualquer etapa fica guardado e interrompe a importação.
  let streamError: Error | null = null;
  const decompressed = pipe(
    createReadStream(CACHE),
    new SkippableFrameStripper(),
    createZstdDecompress(),
    (error) => {
      if (error && error.code !== "ERR_STREAM_PREMATURE_CLOSE")
        streamError = error;
    },
  );
  const lines = createInterface({ input: decompressed });
  const sampler = new BucketSampler(LIMIT);
  let batch: ReturnType<typeof toPuzzleRow>[] = [];
  let read = 0;
  let header = true;

  async function flush() {
    if (batch.length === 0) return;
    const { error } = await supabase
      .from("puzzles")
      .upsert(batch, { onConflict: "id" });
    if (error) throw new Error(`Falha ao gravar: ${error.message}`);
    batch = [];
    console.log(
      `  ${sampler.total} puzzles gravados (${read.toLocaleString("pt-BR")} lidos)`,
    );
  }

  for await (const line of lines) {
    if (header) {
      if (!line.trim().startsWith(EXPECTED_HEADER))
        throw new Error(`Cabeçalho inesperado: ${line}`);
      header = false;
      continue;
    }
    read += 1;
    const puzzle = parseLichessLine(line);
    if (puzzle && sampler.offer(puzzle)) {
      batch.push(toPuzzleRow(puzzle));
      if (batch.length >= BATCH) await flush();
    }
    if (sampler.full) break;
  }
  lines.close();
  decompressed.destroy();
  if (streamError) throw streamError;
  await flush();
  console.log(`Pronto: ${sampler.total} puzzles importados.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
