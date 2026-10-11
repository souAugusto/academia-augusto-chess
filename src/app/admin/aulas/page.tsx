import type { Metadata } from "next";
import Link from "next/link";
import { CourseFields } from "@/components/admin/ContentFields";
import { AdminForm } from "@/components/admin/AdminForm";
import { Card } from "@/components/ui/Card";
import { SectionLabel } from "@/components/ui/Label";
import { requireAdmin } from "@/lib/data/admin";
import { createClient } from "@/lib/supabase/server";
import { createCourse } from "./actions";

export const metadata: Metadata = { title: "Aulas" };

export default async function AulasAdminPage() {
  await requireAdmin("/admin/aulas");
  const supabase = await createClient();
  const { data: courses } = await supabase
    .from("courses")
    .select("id, title, plan_required, is_published, modules (lessons (id))")
    .order("position");

  return (
    <>
      <div className="flex flex-col gap-2">
        <SectionLabel>Painel</SectionLabel>
        <h1 className="font-display text-page font-semibold tracking-tight">
          Aulas
        </h1>
        <p className="max-w-2xl text-muted">
          Cursos têm módulos, e módulos têm aulas. O aluno só vê o que estiver
          publicado e for do plano dele.
        </p>
      </div>

      <ul className="flex flex-col gap-3">
        {(courses ?? []).map((course) => {
          const lessons = (course.modules ?? []).reduce(
            (sum, module) => sum + (module.lessons?.length ?? 0),
            0,
          );
          return (
            <li key={course.id}>
              <Link
                href={`/admin/aulas/${course.id}`}
                className="flex flex-wrap items-center justify-between gap-2 rounded-card border border-border bg-surface px-5 py-4 hover:border-accent"
              >
                <span className="font-semibold">{course.title}</span>
                <span className="text-sm text-muted">
                  {lessons} aula(s) ·{" "}
                  {course.plan_required === 2 ? "só Intensivo" : "Membro"} ·{" "}
                  {course.is_published ? "publicado" : "rascunho"}
                </span>
              </Link>
            </li>
          );
        })}
        {(courses ?? []).length === 0 && (
          <p className="text-muted">Nenhum curso ainda.</p>
        )}
      </ul>

      <Card className="flex max-w-2xl flex-col gap-4">
        <h2 className="text-lg font-semibold">Novo curso</h2>
        <AdminForm action={createCourse} submitLabel="Criar curso">
          <CourseFields />
        </AdminForm>
      </Card>
    </>
  );
}
