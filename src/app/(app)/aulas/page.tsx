import type { Metadata } from "next";
import Link from "next/link";
import { PlanRequired } from "@/components/app/PlanRequired";
import { SectionIcon } from "@/components/app/SectionIcon";
import { Card } from "@/components/ui/Card";
import { SectionLabel } from "@/components/ui/Label";
import { requireUser } from "@/lib/data/account";
import { countLessons, listCourses } from "@/lib/data/courses";

export const metadata: Metadata = { title: "Aulas" };

export default async function AulasPage() {
  const user = await requireUser("/aulas");
  if (user.planRank < 1) {
    return (
      <PlanRequired
        title="Aulas em vídeo"
        text="Os cursos em vídeo, com material em PDF e PGN, fazem parte da assinatura."
      />
    );
  }

  const courses = await listCourses();
  return (
    <>
      <div className="flex flex-col gap-2">
        <SectionLabel>Aprender</SectionLabel>
        <h1 className="font-display text-page font-semibold tracking-tight">
          Aulas em vídeo
        </h1>
      </div>

      {courses.length === 0 ? (
        <Card className="flex flex-col items-start gap-4 p-8">
          <span className="flex size-12 items-center justify-center rounded-control bg-surface-2 text-accent-text">
            <SectionIcon id="aulas" className="size-6" />
          </span>
          <p className="leading-relaxed text-muted">
            Nenhum curso publicado ainda. Os primeiros cursos aparecem aqui
            assim que forem lançados.
          </p>
        </Card>
      ) : (
        <ul className="grid gap-5 md:grid-cols-2">
          {courses.map((course) => {
            const { total, done } = countLessons(course);
            const percent = total ? Math.round((done / total) * 100) : 0;
            return (
              <li key={course.id}>
                <Link
                  href={`/aulas/${course.id}`}
                  className="flex h-full flex-col gap-3 rounded-card border border-border bg-surface p-6 shadow-card transition hover:border-border-strong"
                >
                  <h2 className="text-xl font-semibold">{course.title}</h2>
                  {course.description && (
                    <p className="leading-relaxed text-muted">
                      {course.description}
                    </p>
                  )}
                  <div className="mt-auto flex flex-col gap-2 pt-2">
                    <div
                      className="h-2 overflow-hidden rounded-full bg-surface-2"
                      role="progressbar"
                      aria-valuenow={percent}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-label={`Progresso em ${course.title}`}
                    >
                      <div
                        className="h-full rounded-full bg-accent"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                    <span className="text-sm text-muted">
                      {done} de {total} aulas concluídas
                    </span>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
