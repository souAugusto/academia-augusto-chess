import type { Metadata } from "next";
import Link from "next/link";
import { LessonCard } from "@/components/study/LessonCard";
import { SectionLabel } from "@/components/ui/Label";
import { ENDGAME_LESSONS } from "@/content/licoes";
import { GROUP_LABELS, type EndgameGroup } from "@/content/licoes/types";
import { requireUser } from "@/lib/data/account";
import { getStudyProgress } from "@/lib/data/lessons";

export const metadata: Metadata = { title: "Lições de finais" };

const GROUP_ORDER: EndgameGroup[] = [
  "mates",
  "peoes",
  "torres",
  "bispos",
  "cavalos",
  "damas",
  "combinados",
];

export default async function LicoesFinaisPage() {
  await requireUser("/licoes/finais");
  const progress = await getStudyProgress();

  return (
    <>
      <div className="flex flex-col gap-2">
        <Link href="/licoes" className="text-sm text-muted hover:text-text">
          ← Lições
        </Link>
        <SectionLabel>Estudo</SectionLabel>
        <h1 className="font-display text-page font-semibold tracking-tight">
          Lições de finais
        </h1>
        <p className="max-w-2xl leading-relaxed text-muted">
          Do básico ao avançado: teoria curta, uma posição-modelo explicada e
          posições para praticar em níveis crescentes. Para jogar finais contra
          o motor, use também{" "}
          <Link
            href="/finais"
            className="text-accent-text underline-offset-4 hover:underline"
          >
            o treino de finais
          </Link>
          .
        </p>
      </div>
      {GROUP_ORDER.map((group) => {
        const lessons = ENDGAME_LESSONS.filter(
          (lesson) => lesson.group === group,
        );
        if (lessons.length === 0) return null;
        return (
          <section
            key={group}
            className="flex flex-col gap-3"
            aria-labelledby={`grupo-${group}`}
          >
            <h2 id={`grupo-${group}`} className="text-lg font-semibold">
              {GROUP_LABELS[group]}
            </h2>
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {lessons.map((lesson) => (
                <li key={lesson.slug}>
                  <LessonCard
                    lesson={lesson}
                    progress={progress.get(lesson.slug)}
                  />
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </>
  );
}
