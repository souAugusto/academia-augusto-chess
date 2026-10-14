import { LessonCard } from "@/components/study/LessonCard";
import { ENDGAME_LESSONS, OPENING_LESSONS } from "@/content/licoes";
import {
  GROUP_LABELS,
  type EndgameGroup,
  type Lesson,
} from "@/content/licoes/types";
import type { StudyProgress } from "@/lib/data/lessons";

type Progress = Map<string, StudyProgress>;
type HeadingTag = "h2" | "h3";

const SIDES = [
  { side: "brancas", title: "Com as brancas" },
  { side: "pretas", title: "Com as pretas" },
] as const;

const GROUP_ORDER: EndgameGroup[] = [
  "mates",
  "peoes",
  "torres",
  "bispos",
  "cavalos",
  "damas",
  "combinados",
];

// Um bloco de lições com título (lado ou grupo) e a grade de cartões.
function LessonGroup({
  id,
  title,
  lessons,
  progress,
  Heading,
}: {
  id: string;
  title: string;
  lessons: Lesson[];
  progress: Progress;
  Heading: HeadingTag;
}) {
  if (lessons.length === 0) return null;
  return (
    <section className="flex flex-col gap-3" aria-labelledby={id}>
      <Heading id={id} className="text-lg font-semibold">
        {title}
      </Heading>
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {lessons.map((lesson) => (
          <li key={lesson.slug}>
            <LessonCard lesson={lesson} progress={progress.get(lesson.slug)} />
          </li>
        ))}
      </ul>
    </section>
  );
}

// Todas as lições de aberturas, separadas por cor.
export function OpeningLessonList({
  progress,
  heading = "h2",
}: {
  progress: Progress;
  heading?: HeadingTag;
}) {
  return SIDES.map(({ side, title }) => (
    <LessonGroup
      key={side}
      id={`lado-${side}`}
      title={title}
      lessons={OPENING_LESSONS.filter((lesson) => lesson.side === side)}
      progress={progress}
      Heading={heading}
    />
  ));
}

// Todas as lições de finais, separadas por grupo.
export function EndgameLessonList({
  progress,
  heading = "h2",
}: {
  progress: Progress;
  heading?: HeadingTag;
}) {
  return GROUP_ORDER.map((group) => (
    <LessonGroup
      key={group}
      id={`grupo-${group}`}
      title={GROUP_LABELS[group]}
      lessons={ENDGAME_LESSONS.filter((lesson) => lesson.group === group)}
      progress={progress}
      Heading={heading}
    />
  ));
}
