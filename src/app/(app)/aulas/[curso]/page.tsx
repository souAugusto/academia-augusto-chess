import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PlanRequired } from "@/components/app/PlanRequired";
import { IconCheck, IconPlay } from "@/components/ui/icons";
import { SectionLabel } from "@/components/ui/Label";
import { requireUser } from "@/lib/data/account";
import { countLessons, getCourse, isUuid } from "@/lib/data/courses";

export const metadata: Metadata = { title: "Curso" };

export default async function CursoPage({
  params,
}: PageProps<"/aulas/[curso]">) {
  const { curso } = await params;
  const user = await requireUser(`/aulas/${curso}`);
  if (user.planRank < 1) {
    return (
      <PlanRequired
        title="Aulas em vídeo"
        text="Este curso faz parte da assinatura."
      />
    );
  }
  if (!isUuid(curso)) notFound();
  const course = await getCourse(curso);
  // Sem acesso (plano) e inexistente dão o mesmo resultado: não revela o que existe.
  if (!course) notFound();

  const { total, done } = countLessons(course);
  return (
    <>
      <div className="flex flex-col gap-2">
        <Link href="/aulas" className="text-sm text-muted hover:text-text">
          ← Aulas
        </Link>
        <SectionLabel>Curso</SectionLabel>
        <h1 className="font-display text-page font-semibold tracking-tight">
          {course.title}
        </h1>
        {course.description && (
          <p className="max-w-2xl leading-relaxed text-muted">
            {course.description}
          </p>
        )}
        <p className="text-sm text-muted">
          {done} de {total} aulas concluídas
        </p>
      </div>

      <div className="flex flex-col gap-6">
        {course.modules.map((module) => (
          <section
            key={module.id}
            aria-labelledby={`modulo-${module.id}`}
            className="flex flex-col gap-3"
          >
            <h2 id={`modulo-${module.id}`} className="text-lg font-semibold">
              {module.title}
            </h2>
            <ol className="flex flex-col overflow-hidden rounded-card border border-border bg-surface">
              {module.lessons.map((lesson) => (
                <li
                  key={lesson.id}
                  className="border-b border-border last:border-b-0"
                >
                  <Link
                    href={`/aulas/${course.id}/${lesson.id}`}
                    className="flex min-h-touch items-center gap-3 px-5 py-4 transition hover:bg-surface-2"
                  >
                    <span
                      className={`flex size-8 shrink-0 items-center justify-center rounded-full ${
                        lesson.completed
                          ? "bg-success text-bg"
                          : "bg-surface-2 text-muted"
                      }`}
                    >
                      {lesson.completed ? (
                        <IconCheck className="size-4" />
                      ) : (
                        <IconPlay className="size-4" />
                      )}
                    </span>
                    <span className="font-medium">{lesson.title}</span>
                    {lesson.completed && (
                      <span className="sr-only">(concluída)</span>
                    )}
                  </Link>
                </li>
              ))}
            </ol>
          </section>
        ))}
      </div>
    </>
  );
}
