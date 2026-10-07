import { Chess, type Move } from "chess.js";
import type { PuzzleRecord } from "./puzzle";

// Regras de resolução de puzzle (PROMPT_MESTRE.md, seção 6):
// - Lichess: moves[0] é o lance do adversário (setup); o aluno joga a partir de moves[1].
// - Custom: o FEN já é a posição do aluno; moves = solução inteira.
// - Lances do aluno nas posições pares da linha; respostas do adversário nas ímpares.
// - Qualquer lance que dê mate também vale (e encerra o puzzle).

export type SolutionLine = {
  startFen: string; // posição em que o aluno joga o primeiro lance
  line: string[]; // lances UCI a partir de startFen (aluno, adversário, aluno, ...)
};

export function uciToMove(uci: string) {
  return {
    from: uci.slice(0, 2),
    to: uci.slice(2, 4),
    promotion: uci.length > 4 ? uci[4] : undefined,
  };
}

export function moveToUci(
  move: Pick<Move, "from" | "to" | "promotion">,
): string {
  return `${move.from}${move.to}${move.promotion ?? ""}`;
}

export function solutionLine(
  puzzle: Pick<PuzzleRecord, "fen" | "moves" | "first_move_is_setup">,
): SolutionLine {
  const moves = puzzle.moves.trim().split(/\s+/).filter(Boolean);
  if (!puzzle.first_move_is_setup)
    return { startFen: new Chess(puzzle.fen).fen(), line: moves };
  const chess = new Chess(puzzle.fen);
  const [setup, ...rest] = moves;
  if (!setup) throw new Error("Puzzle sem lances");
  chess.move(uciToMove(setup));
  return { startFen: chess.fen(), line: rest };
}

export type MoveVerdict =
  | { kind: "correct"; reply: string | null; done: boolean } // reply = lance do adversário a seguir
  | { kind: "mate" } // lance diferente da solução, mas dá mate: vale e encerra
  | { kind: "wrong" }
  | { kind: "illegal" };

// Avalia o lance do aluno na posição `fen`, sabendo o índice atual na linha.
export function judgeMove(
  fen: string,
  line: string[],
  index: number,
  played: string,
): MoveVerdict {
  const chess = new Chess(fen);
  let move: Move;
  try {
    move = chess.move(uciToMove(played));
  } catch {
    return { kind: "illegal" };
  }
  const expected = line[index];
  if (expected && sameMove(moveToUci(move), expected)) {
    const reply = line[index + 1] ?? null;
    return {
      kind: "correct",
      reply,
      done: index + 1 >= line.length || reply === null,
    };
  }
  if (chess.isCheckmate()) return { kind: "mate" };
  return { kind: "wrong" };
}

// "e7e8" e "e7e8q" só são iguais quando a solução não especifica a promoção.
function sameMove(played: string, expected: string): boolean {
  return (
    played === expected ||
    (expected.length === 4 &&
      played.slice(0, 4) === expected &&
      played.length === 4)
  );
}

export type AttemptEvaluation = { solved: boolean; userMoves: number };

// Repete no servidor os lances enviados pelo aluno e decide se o puzzle foi resolvido.
// `played` contém só os lances do aluno, em ordem.
export function evaluateAttempt(
  puzzle: Pick<PuzzleRecord, "fen" | "moves" | "first_move_is_setup">,
  played: string[],
): AttemptEvaluation {
  const { startFen, line } = solutionLine(puzzle);
  const chess = new Chess(startFen);
  let index = 0;
  for (const uci of played) {
    const verdict = judgeMove(chess.fen(), line, index, uci);
    if (verdict.kind === "mate")
      return { solved: true, userMoves: index / 2 + 1 };
    if (verdict.kind !== "correct")
      return { solved: false, userMoves: index / 2 + 1 };
    chess.move(uciToMove(uci));
    if (verdict.done) return { solved: true, userMoves: index / 2 + 1 };
    if (verdict.reply) chess.move(uciToMove(verdict.reply));
    index += 2;
  }
  return { solved: false, userMoves: index / 2 };
}
