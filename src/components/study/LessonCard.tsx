import Link from "next/link";
import { StyleBadge } from "@/components/style/StyleBadge";
import { DIFFICULTY_LABELS, type Lesson } from "@/content/licoes/types";
import type { StudyProgress } from "@/lib/data/lessons";

// Cartão de uma lição na lista, com o progresso do aluno.
export function LessonCard({
  lesson,
  progress,
}: {
  lesson: Lesson;
  progress?: StudyProgress;
}) {
  const total = lesson.practice.length;
  const solved = progress?.practiceSolved ?? 0;
  return (
    <Link
      href={`/licoes/${lesson.slug}`}
      className="flex h-full flex-col gap-3 rounded-card border border-border bg-surface p-5 shadow-card transition hover:border-accent"
    >
      <div className="flex items-start justify-between gap-3">
        <span className="font-semibold">{lesson.title}</span>
        {progress?.completed && (
          <span className="shrink-0 rounded-full border border-success px-2 py-0.5 text-xs font-semibold text-success">
            Concluída
          </span>
        )}
      </div>
      <p className="text-sm leading-relaxed text-muted">{lesson.summary}</p>
      <div className="mt-auto flex flex-wrap items-center gap-2 text-xs text-muted">
        <span>{DIFFICULTY_LABELS[lesson.difficulty]}</span>
        <span aria-hidden>·</span>
        <span>
          {lesson.kind === "abertura"
            ? `${total} exercícios`
            : `${total} posições`}
        </span>
        {lesson.kind === "abertura" &&
          lesson.styles
            .slice(0, 2)
            .map((style) => <StyleBadge key={style} style={style} size="sm" />)}
      </div>
      {solved > 0 && (
        <div
          role="progressbar"
          aria-label={`Prática: ${solved} de ${total}`}
          aria-valuemin={0}
          aria-valuemax={total}
          aria-valuenow={solved}
          className="h-1.5 overflow-hidden rounded-full bg-surface-2"
        >
          <div
            className="h-full rounded-full bg-accent"
            style={{ width: `${Math.round((solved / total) * 100)}%` }}
          />
        </div>
      )}
    </Link>
  );
}
