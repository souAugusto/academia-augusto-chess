import { OPENING_LESSONS } from "./aberturas/index.ts";
import { ENDGAME_LESSONS } from "./finais/index.ts";
import type { Lesson } from "./types.ts";

export { OPENING_LESSONS, ENDGAME_LESSONS };

export const ALL_LESSONS: Lesson[] = [...OPENING_LESSONS, ...ENDGAME_LESSONS];

export function findLesson(slug: string): Lesson | undefined {
  return ALL_LESSONS.find((lesson) => lesson.slug === slug);
}

// Números reais do conteúdo (a landing lê daqui; nada de número fixo).
export function contentCounts() {
  return {
    openingLessons: OPENING_LESSONS.length,
    openingDrills: OPENING_LESSONS.reduce(
      (sum, l) => sum + l.practice.length,
      0,
    ),
    endgameLessons: ENDGAME_LESSONS.length,
    endgamePositions: ENDGAME_LESSONS.reduce(
      (sum, l) => sum + l.practice.length,
      0,
    ),
  };
}
