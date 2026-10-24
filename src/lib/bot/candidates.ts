import { Chess } from "chess.js";
import { scoreToCp, type Score } from "@/lib/engine/uci";
import type { Candidate } from "./choose";

const VALUE: Record<string, number> = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 0 };

export function uciToMove(uci: string) {
  return { from: uci.slice(0, 2), to: uci.slice(2, 4), promotion: uci[4] };
}

// Linhas do motor (ponto de vista de quem joga) -> candidatos com o que cada
// lance faz (captura, xeque, roque...). Ignora lances ilegais.
export function candidatesFromLines(
  fen: string,
  lines: { move: string; score: Score }[],
): Candidate[] {
  const chess = new Chess(fen);
  const result: Candidate[] = [];
  for (const line of lines) {
    try {
      const move = chess.move(uciToMove(line.move));
      chess.undo();
      const capture = Boolean(move.captured);
      const check = move.san.includes("+") || move.san.includes("#");
      result.push({
        move: line.move,
        cp: scoreToCp(line.score),
        capture,
        check,
        castle: move.isKingsideCastle() || move.isQueensideCastle(),
        pawn: move.piece === "p",
        quiet: !capture && !check,
        trade: capture && VALUE[move.captured!] === VALUE[move.piece],
      });
    } catch {
      // Lance que não vale nesta posição: descarta.
    }
  }
  return result;
}

export function legalUcis(fen: string): string[] {
  return new Chess(fen)
    .moves({ verbose: true })
    .map((m) => `${m.from}${m.to}${m.promotion ?? ""}`);
}
