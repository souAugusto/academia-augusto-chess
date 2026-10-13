// Sugestões de estudo a partir de uma partida analisada. Lógica pura: recebe um
// índice leve das lições (montado no servidor) e a revisão da partida.
import { Chess } from "chess.js";
import type { ReviewedMove } from "./review";

export type LessonIndexEntry = {
  slug: string;
  title: string;
  kind: "abertura" | "final";
  group?: string; // grupo do final (mates, peoes, torres...)
  lines?: string[][]; // aberturas: linhas em UCI, desde o primeiro lance
};

export type Suggestion = { href: string; title: string; reason: string };

const MIN_OPENING_PLIES = 6; // a partida precisa seguir a lição por 3 lances
const ENDGAME_LOSS = 10; // erro a partir daqui conta para sugerir final

function commonPrefix(a: string[], b: string[]): number {
  let n = 0;
  while (n < a.length && n < b.length && a[n] === b[n]) n++;
  return n;
}

// Grupo de final pelo material que sobrou (sem damas e poucas peças = final).
export function endgameGroupOf(fen: string): string | null {
  const board = new Chess(fen).board().flat();
  const pieces = board.filter((p) => p && p.type !== "k" && p.type !== "p");
  if (pieces.length > 4) return null; // ainda é meio-jogo
  const types = new Set(pieces.map((p) => p!.type));
  if (pieces.length === 0) return "peoes";
  if (types.has("q")) return "damas";
  if (types.has("r")) return types.size === 1 ? "torres" : "combinados";
  if (types.has("b") && types.has("n")) return "combinados";
  if (types.has("b")) return "bispos";
  return "cavalos";
}

export function suggestLessons(input: {
  moves: string[]; // UCI da partida
  fens: string[]; // posição antes de cada lance (fens[i] antes do lance i)
  reviewed: ReviewedMove[];
  lessons: LessonIndexEntry[];
  userColor?: "w" | "b" | null; // se souber, olha só os erros do aluno
  completed?: Set<string>;
  limit?: number;
}): Suggestion[] {
  const { moves, fens, reviewed, lessons } = input;
  const mine = (m: ReviewedMove) =>
    !input.userColor || m.color === input.userColor;
  const suggestions: Suggestion[] = [];
  const used = new Set<string>();

  // 1. A abertura que a partida seguiu por mais tempo.
  let bestOpening: { entry: LessonIndexEntry; plies: number } | null = null;
  for (const entry of lessons) {
    if (entry.kind !== "abertura") continue;
    for (const line of entry.lines ?? []) {
      const plies = commonPrefix(moves, line);
      if (
        plies >= MIN_OPENING_PLIES &&
        (!bestOpening || plies > bestOpening.plies)
      )
        bestOpening = { entry, plies };
    }
  }
  if (bestOpening) {
    const earlyError = reviewed.find(
      (m) => mine(m) && m.ply < 24 && m.loss >= 5,
    );
    suggestions.push({
      href: `/licoes/${bestOpening.entry.slug}`,
      title: bestOpening.entry.title,
      reason: earlyError
        ? `A partida seguiu esta abertura e houve um erro no lance ${Math.floor(earlyError.ply / 2) + 1}.`
        : `A partida seguiu esta abertura por ${Math.ceil(bestOpening.plies / 2)} lances.`,
    });
    used.add(bestOpening.entry.slug);
  }

  // 2. Erros em finais: uma lição do grupo do final em que o erro aconteceu.
  const endgameErrors = reviewed
    .filter((m) => mine(m) && m.loss >= ENDGAME_LOSS && fens[m.ply])
    .map((m) => ({ move: m, group: endgameGroupOf(fens[m.ply]) }))
    .filter(
      (item): item is { move: ReviewedMove; group: string } =>
        item.group !== null,
    );
  for (const { move, group } of endgameErrors) {
    const entry =
      lessons.find(
        (l) =>
          l.kind === "final" &&
          l.group === group &&
          !used.has(l.slug) &&
          !input.completed?.has(l.slug),
      ) ??
      lessons.find(
        (l) => l.kind === "final" && l.group === group && !used.has(l.slug),
      );
    if (!entry) continue;
    suggestions.push({
      href: `/licoes/${entry.slug}`,
      title: entry.title,
      reason: `Houve um erro no final, no lance ${Math.floor(move.ply / 2) + 1}.`,
    });
    used.add(entry.slug);
    break;
  }

  // 3. Muitas gafes: treino de táticas.
  const blunders = reviewed.filter((m) => mine(m) && m.cls === "gafe").length;
  if (blunders >= 2)
    suggestions.push({
      href: "/taticas",
      title: "Treino de táticas",
      reason: `Foram ${blunders} gafes nesta partida. Resolver táticas treina a atenção a peças soltas e golpes.`,
    });

  return suggestions.slice(0, input.limit ?? 3);
}
