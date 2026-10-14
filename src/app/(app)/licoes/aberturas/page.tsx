import type { Metadata } from "next";
import Link from "next/link";
import { LessonCard } from "@/components/study/LessonCard";
import { SectionLabel } from "@/components/ui/Label";
import { OPENING_LESSONS } from "@/content/licoes";
import { requireUser } from "@/lib/data/account";
import { getStudyProgress } from "@/lib/data/lessons";

export const metadata: Metadata = { title: "Lições de aberturas" };

const SIDES = [
  { side: "brancas", title: "Com as brancas" },
  { side: "pretas", title: "Com as pretas" },
] as const;

export default async function LicoesAberturasPage() {
  await requireUser("/licoes/aberturas");
  const progress = await getStudyProgress();

  return (
    <>
      <div className="flex flex-col gap-2">
        <Link href="/licoes" className="text-sm text-muted hover:text-text">
          ← Lições
        </Link>
        <SectionLabel>Estudo</SectionLabel>
        <h1 className="font-display text-page font-semibold tracking-tight">
          Lições de aberturas
        </h1>
        <p className="max-w-2xl leading-relaxed text-muted">
          Cada lição mostra as ideias da abertura, a linha principal explicada
          lance a lance, as armadilhas mais comuns, exercícios em três níveis e
          um quiz. Para treinar um repertório completo, use também{" "}
          <Link
            href="/aberturas"
            className="text-accent-text underline-offset-4 hover:underline"
          >
            os repertórios
          </Link>
          .
        </p>
      </div>
      {SIDES.map(({ side, title }) => {
        const lessons = OPENING_LESSONS.filter(
          (lesson) => lesson.side === side,
        );
        if (lessons.length === 0) return null;
        return (
          <section
            key={side}
            className="flex flex-col gap-3"
            aria-labelledby={`lado-${side}`}
          >
            <h2 id={`lado-${side}`} className="text-lg font-semibold">
              {title}
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
