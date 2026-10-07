import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PlanRequired } from "@/components/app/PlanRequired";
import { StaticBoard } from "@/components/chess/StaticBoard";
import { CompleteButton } from "@/components/lessons/CompleteButton";
import { buttonClasses } from "@/components/ui/button";
import { Card } from "@/components/ui/Card";
import { SectionLabel } from "@/components/ui/Label";
import { requireUser } from "@/lib/data/account";
import { getCourse, getLesson, isUuid } from "@/lib/data/courses";
import { videoEmbed } from "@/lib/video";

export const metadata: Metadata = { title: "Aula" };

export default async function AulaPage({
  params,
}: PageProps<"/aulas/[curso]/[aula]">) {
  const { curso, aula } = await params;
  const path = `/aulas/${curso}/${aula}`;
  const user = await requireUser(path);
  if (user.planRank < 1) {
    return (
      <PlanRequired
        title="Aulas em vídeo"
        text="Esta aula faz parte da assinatura."
      />
    );
  }
  if (!isUuid(curso) || !isUuid(aula)) notFound();

  const [course, lesson] = await Promise.all([
    getCourse(curso),
    getLesson(aula),
  ]);
  const ordered = course?.modules.flatMap((module) => module.lessons) ?? [];
  const index = ordered.findIndex((item) => item.id === aula);
  // A aula precisa pertencer a este curso (e o RLS precisa liberar os dois).
  if (!course || !lesson || index === -1) notFound();

  const embed = videoEmbed(lesson.videoProvider, lesson.videoId);
  const previous = ordered[index - 1];
  const next = ordered[index + 1];

  return (
    <>
      <div className="flex flex-col gap-2">
        <Link
          href={`/aulas/${course.id}`}
          className="text-sm text-muted hover:text-text"
        >
          ← {course.title}
        </Link>
        <SectionLabel>
          Aula {index + 1} de {ordered.length}
        </SectionLabel>
        <h1 className="font-display text-page font-semibold tracking-tight">
          {lesson.title}
        </h1>
      </div>

      <div
        className={`grid gap-6 ${lesson.fen ? "lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]" : ""}`}
      >
        <div className="aspect-video overflow-hidden rounded-card border border-border bg-surface shadow-card">
          {embed ? (
            <iframe
              src={embed.src}
              title={`Vídeo: ${lesson.title}`}
              allow={embed.allow}
              allowFullScreen
              loading="lazy"
              referrerPolicy="strict-origin-when-cross-origin"
              className="size-full"
            />
          ) : (
            <div className="flex size-full items-center justify-center p-6 text-center text-muted">
              O vídeo desta aula ainda não foi publicado.
            </div>
          )}
        </div>
        {lesson.fen && (
          <StaticBoard
            fen={lesson.fen}
            orientation="w"
            label={`Posição da aula ${lesson.title}`}
          />
        )}
      </div>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <CompleteButton
          lessonId={lesson.id}
          completed={ordered[index].completed}
          path={path}
        />
        <div className="flex gap-2">
          {previous && (
            <Link
              href={`/aulas/${course.id}/${previous.id}`}
              className={buttonClasses("secondary")}
            >
              Anterior
            </Link>
          )}
          {next && (
            <Link
              href={`/aulas/${course.id}/${next.id}`}
              className={buttonClasses("secondary")}
            >
              Próxima aula
            </Link>
          )}
        </div>
      </div>

      {lesson.description && (
        <Card>
          <h2 className="mb-2 font-semibold">Sobre a aula</h2>
          <p className="leading-relaxed whitespace-pre-line text-muted">
            {lesson.description}
          </p>
        </Card>
      )}

      {lesson.files.length > 0 && (
        <Card>
          <h2 className="mb-3 font-semibold">Material para baixar</h2>
          <ul className="flex flex-col gap-2">
            {lesson.files.map((file) => (
              <li key={file.id}>
                <a
                  href={`/api/materiais/${file.id}`}
                  className="flex min-h-touch items-center gap-2 text-accent-text underline-offset-4 hover:underline"
                >
                  {file.name} ({file.kind.toUpperCase()})
                </a>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </>
  );
}
