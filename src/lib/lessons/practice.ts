import { Chess } from "chess.js";
import type { EndgameDrill, OpeningDrill } from "../../content/licoes/types.ts";

// Regras da prática das lições (puras, testadas).

// SAN sem os sinais de xeque/mate, para comparar lances escritos de jeitos diferentes.
const bare = (san: string) => san.replace(/[+#]$/, "");

export function sameMove(a: string, b: string): boolean {
  return bare(a) === bare(b);
}

// Posição de uma prática de abertura (depois dos lances `before`).
export function openingDrillFen(drill: OpeningDrill): string {
  const chess = new Chess();
  for (const san of drill.before) chess.move(san);
  return chess.fen();
}

export type DrillVerdict =
  | { kind: "correct"; done: true }
  // Lance certo e a posição continua: o site responde com `reply` e o aluno
  // joga o lance `next` da solução (se `next` passar do fim, acabou).
  | { kind: "correct"; done: false; reply: string; next: number }
  | { kind: "wrong" };

export function judgeOpeningMove(
  drill: OpeningDrill,
  played: string,
): DrillVerdict {
  const ok = [drill.answer, ...(drill.alternatives ?? [])].some((san) =>
    sameMove(san, played),
  );
  return ok ? { kind: "correct", done: true } : { kind: "wrong" };
}

// Final: `step` é o índice do lance do aluno na solução (0, 2, 4...).
// Uma alternativa aceita no primeiro lance já resolve a posição.
export function judgeEndgameMove(
  drill: EndgameDrill,
  step: number,
  played: string,
): DrillVerdict {
  if (step === 0 && (drill.accept ?? []).some((san) => sameMove(san, played)))
    return { kind: "correct", done: true };
  const expected = drill.solution[step];
  if (!expected || !sameMove(expected, played)) return { kind: "wrong" };
  const reply = drill.solution[step + 1];
  if (!reply) return { kind: "correct", done: true };
  return { kind: "correct", done: false, reply, next: step + 2 };
}

// Lição concluída: 70% das práticas resolvidas e o quiz feito com 60% de acertos.
export const PRACTICE_TO_COMPLETE = 0.7;
export const QUIZ_TO_COMPLETE = 0.6;

export function isLessonComplete(input: {
  practiceSolved: number;
  practiceTotal: number;
  quizScore: number | null;
  quizTotal: number | null;
}): boolean {
  if (!input.practiceTotal || input.quizScore === null || !input.quizTotal)
    return false;
  return (
    input.practiceSolved >=
      Math.ceil(input.practiceTotal * PRACTICE_TO_COMPLETE) &&
    input.quizScore >= Math.ceil(input.quizTotal * QUIZ_TO_COMPLETE)
  );
}
