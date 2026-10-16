// Gera src/content/teoria-aberturas.json a partir do repositório
// lichess-org/chess-openings (CC0): todas as posições das linhas conhecidas e o
// nome de cada posição que encerra uma linha. Rodar de novo só quando quiser
// atualizar a teoria.
// Uso: npm run build:opening-book
import { writeFileSync } from "node:fs";
import { Chess } from "chess.js";
import {
  OPENINGS_BASE_URL,
  OPENINGS_FILES,
} from "../src/lib/openings/catalog.ts";
import { positionKey, type OpeningBook } from "../src/lib/analysis/theory.ts";

const names: string[] = [];
const nameIndex = new Map<string, number>();
// posição -> { nome, quantos lances tem a linha que dá o nome }
const book = new Map<string, { name: number; plies: number }>();

for (const file of OPENINGS_FILES) {
  const response = await fetch(`${OPENINGS_BASE_URL}/${file}`);
  if (!response.ok) throw new Error(`Falha ao baixar ${file}`);
  const lines = (await response.text()).split("\n").slice(1);
  for (const line of lines) {
    const [eco, name, pgn] = line.split("\t");
    if (!eco || !name || !pgn) continue;
    const chess = new Chess();
    try {
      chess.loadPgn(pgn);
    } catch {
      continue;
    }
    const history = chess.history();
    const replay = new Chess();
    for (const san of history) {
      replay.move(san);
      const key = positionKey(replay.fen());
      if (!book.has(key)) book.set(key, { name: -1, plies: 0 });
    }
    // Nome da posição final: fica o da linha mais longa (mais específica).
    const label = `${eco} · ${name}`;
    let index = nameIndex.get(label);
    if (index === undefined) {
      index = names.length;
      names.push(label);
      nameIndex.set(label, index);
    }
    const key = positionKey(replay.fen());
    const current = book.get(key)!;
    if (current.name === -1 || history.length > current.plies)
      book.set(key, { name: index, plies: history.length });
  }
}

const output: OpeningBook = {
  v: 1,
  names,
  book: Object.fromEntries(
    [...book.entries()].map(([key, value]) => [key, value.name]),
  ),
};
writeFileSync("src/content/teoria-aberturas.json", JSON.stringify(output));
console.log(`${book.size} posições, ${names.length} nomes.`);
