import "server-only";
import { ALL_LESSONS } from "@/content/licoes";
import { sansToUcis } from "@/lib/analysis/pgn";
import type { LessonIndexEntry } from "@/lib/analysis/suggest";

const MAX_PLIES = 20; // basta o começo das linhas para reconhecer a abertura

let cache: LessonIndexEntry[] | null = null;

// Índice leve das lições para as sugestões da análise (vai para o navegador).
export function lessonIndex(): LessonIndexEntry[] {
  if (cache) return cache;
  cache = ALL_LESSONS.map((lesson) => {
    if (lesson.kind === "final")
      return {
        slug: lesson.slug,
        title: lesson.title,
        kind: "final",
        group: lesson.group,
      } satisfies LessonIndexEntry;
    const lines = [lesson.mainLine, ...lesson.variations.map((v) => v.moves)]
      .map((moves) => sansToUcis(moves.slice(0, MAX_PLIES).map((m) => m.san)))
      .filter((line): line is string[] => line !== null);
    return {
      slug: lesson.slug,
      title: lesson.title,
      kind: "abertura",
      lines,
    } satisfies LessonIndexEntry;
  });
  return cache;
}
