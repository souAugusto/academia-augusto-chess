// Relatório completo de uma partida analisada, a partir dos dados do motor:
// classes, precisão, contagens, momentos-chave e abertura. O mesmo código roda
// no navegador (tela) e no servidor (o que é guardado), então os números não
// dependem do que o navegador manda.
import {
  classifyGame,
  countByClass,
  gameAccuracy,
  keyMoments,
  type KeyMoment,
  type MoveClass,
  type ReviewedMove,
} from "./classify";
import type { AnalysisData } from "./compact";
import { theoryOf, type OpeningBook } from "./theory";

export type GameReport = {
  reviewed: ReviewedMove[];
  accuracy: { w: number | null; b: number | null };
  counts: { w: Record<MoveClass, number>; b: Record<MoveClass, number> };
  moments: KeyMoment[];
  bookPlies: number;
  opening: string | null;
};

export function buildReport(
  data: AnalysisData,
  fens: string[],
  book: OpeningBook | null,
): GameReport {
  const { bookPlies, opening } = theoryOf(fens, book);
  const reviewed = classifyGame({
    fens,
    moves: data.moves,
    evals: data.evals,
    best: data.best,
    pv: data.pv,
    deep: data.deep,
    bookPlies,
  });
  return {
    reviewed,
    accuracy: {
      w: gameAccuracy(reviewed, data.evals, "w"),
      b: gameAccuracy(reviewed, data.evals, "b"),
    },
    counts: { w: countByClass(reviewed, "w"), b: countByClass(reviewed, "b") },
    moments: keyMoments(reviewed, bookPlies),
    bookPlies,
    opening,
  };
}

// Resumo guardado na coluna summary (tamanho pequeno e previsível).
export function reportSummary(report: GameReport) {
  return {
    accuracy: report.accuracy,
    counts: report.counts,
    moments: report.moments,
    opening: report.opening,
    bookPlies: report.bookPlies,
  };
}

// Chave da partida colada em PGN: hash dos lances (FNV-1a, base 36).
export function pgnGameKey(moves: string[]): string {
  const text = moves.join(" ");
  let hash = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return `pgn:${moves.length}-${hash.toString(36)}`;
}

export async function loadOpeningBook(): Promise<OpeningBook | null> {
  const { parseBook } = await import("./theory");
  const mod = await import("@/content/teoria-aberturas.json");
  return parseBook(mod.default ?? mod);
}
