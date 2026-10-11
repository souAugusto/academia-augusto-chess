import { Chess } from "chess.js";
import { toEpd } from "./tree.ts";

// Leitura dos arquivos a.tsv ... e.tsv do repositório lichess-org/chess-openings (CC0).
// Colunas: eco, name, pgn (ex.: "C00	French Defense	1. e4 e6").

export const OPENINGS_BASE_URL =
  "https://raw.githubusercontent.com/lichess-org/chess-openings/master";
export const OPENINGS_FILES = ["a", "b", "c", "d", "e"].map(
  (letter) => `${letter}.tsv`,
);

export type OpeningRow = {
  eco: string;
  name: string;
  pgn: string;
  uci: string;
  epd: string;
};

export function parseOpeningLine(line: string): OpeningRow | null {
  const [eco, name, pgn] = line.split("\t");
  if (!eco || !name || !pgn || !/^[A-E]\d\d$/.test(eco)) return null;
  const chess = new Chess();
  try {
    chess.loadPgn(pgn);
  } catch {
    return null;
  }
  const uci = chess
    .history({ verbose: true })
    .map((move) => `${move.from}${move.to}${move.promotion ?? ""}`)
    .join(" ");
  return { eco, name, pgn, uci, epd: toEpd(chess.fen()) };
}

// Entre vários nomes para a mesma posição, prefere o mais específico (mais lances).
export function bestOpeningName(
  rows: Pick<OpeningRow, "eco" | "name" | "uci">[],
): string | null {
  if (rows.length === 0) return null;
  const best = [...rows].sort(
    (a, b) => b.uci.split(" ").length - a.uci.split(" ").length,
  )[0];
  return `${best.eco} · ${best.name}`;
}
