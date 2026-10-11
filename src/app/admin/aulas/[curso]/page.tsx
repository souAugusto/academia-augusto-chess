import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminForm, AdminInput } from "@/components/admin/AdminForm";
import { CourseFields } from "@/components/admin/ContentFields";
import { Card } from "@/components/ui/Card";
import { SectionLabel } from "@/components/ui/Label";
import { requireAdmin } from "@/lib/data/admin";
import { isUuid } from "@/lib/data/courses";
import { createClient } from "@/lib/supabase/server";
import {
  createLesson,
  deleteCourse,
  deleteModule,
  saveModule,
  updateCourse,
} from "../actions";

export const metadata: Metadata = { title: "Curso" };

type Module = {
  id: string;
  title: string;
  position: number;
  lessons: {
    id: string;
    title: string;
    position: number;
    is_published: boolean;
  }[];
};

export default async function CursoAdminPage({
  params,
}: PageProps<"/admin/aulas/[curso]">) {
  const { curso } = await params;
  await requireAdmin(`/admin/aulas/${curso}`);
  if (!isUuid(curso)) notFound();
  const supabase = await createClient();
  const { data: course } = await supabase
    .from("courses")
    .select(
      "id, title, description, plan_required, position, is_published, modules (id, title, position, lessons (id, title, position, is_published))",
    )
    .eq("id", curso)
    .maybeSingle();
  if (!course) notFound();
  const modules = ((course.modules ?? []) as Module[]).sort(
    (a, b) => a.position - b.position,
  );

  return (
    <>
      <div className="flex flex-col gap-2">
        <Link
          href="/admin/aulas"
          className="text-sm text-muted hover:text-text"
        >
          ← Cursos
        </Link>
        <SectionLabel>Curso</SectionLabel>
        <h1 className="font-display text-page font-semibold tracking-tight">
          {course.title}
        </h1>
      </div>

      <section className="flex flex-col gap-4" aria-labelledby="modulos">
        <h2 id="modulos" className="text-lg font-semibold">
          Módulos e aulas
        </h2>
        {modules.map((module) => (
          <Card key={module.id} className="flex flex-col gap-4">
            <AdminForm
              action={saveModule}
              submitLabel="Salvar módulo"
              variant="secondary"
              className="grid gap-3 sm:grid-cols-[1fr_7rem_auto] sm:items-end"
            >
              <input type="hidden" name="id" value={module.id} />
              <input type="hidden" name="courseId" value={course.id} />
              <AdminInput
                id={`modulo-${module.id}`}
                name="title"
                label="Módulo"
                defaultValue={module.title}
                required
              />
              <AdminInput
                id={`ordem-${module.id}`}
                name="position"
                label="Ordem"
                type="number"
                min="0"
                defaultValue={module.position}
              />
            </AdminForm>

            <ol className="flex flex-col gap-1.5">
              {module.lessons
                .sort((a, b) => a.position - b.position)
                .map((lesson) => (
                  <li key={lesson.id}>
                    <Link
                      href={`/admin/aulas/aula/${lesson.id}`}
                      className="flex justify-between gap-3 rounded-control bg-surface-2 px-3 py-2 hover:text-accent-text"
                    >
                      <span>{lesson.title}</span>
                      <span className="text-sm text-muted">
                        {lesson.is_published ? "publicada" : "rascunho"}
                      </span>
                    </Link>
                  </li>
                ))}
            </ol>

            <div className="flex flex-wrap items-end justify-between gap-4">
              <AdminForm
                action={createLesson}
                submitLabel="Criar aula"
                pendingLabel="Criando..."
                className="flex flex-wrap items-end gap-3"
              >
                <input type="hidden" name="moduleId" value={module.id} />
                <AdminInput
                  id={`nova-aula-${module.id}`}
                  name="title"
                  label="Nova aula"
                  placeholder="Título da aula"
                  required
                />
              </AdminForm>
              <AdminForm
                action={deleteModule}
                submitLabel="Apagar módulo"
                pendingLabel="Apagando..."
                variant="ghost"
                confirm="Apagar o módulo e todas as aulas dele?"
              >
                <input type="hidden" name="id" value={module.id} />
              </AdminForm>
            </div>
          </Card>
        ))}

        <Card className="flex flex-col gap-3">
          <AdminForm
            action={saveModule}
            submitLabel="Criar módulo"
            className="grid gap-3 sm:grid-cols-[1fr_7rem_auto] sm:items-end"
          >
            <input type="hidden" name="courseId" value={course.id} />
            <AdminInput
              id="novo-modulo"
              name="title"
              label="Novo módulo"
              required
            />
            <AdminInput
              id="novo-modulo-ordem"
              name="position"
              label="Ordem"
              type="number"
              min="0"
              defaultValue={modules.length}
            />
          </AdminForm>
        </Card>
      </section>

      <Card className="flex max-w-2xl flex-col gap-4">
        <h2 className="text-lg font-semibold">Dados do curso</h2>
        <AdminForm action={updateCourse} submitLabel="Salvar curso">
          <input type="hidden" name="id" value={course.id} />
          <CourseFields course={course} />
        </AdminForm>
        <AdminForm
          action={deleteCourse}
          submitLabel="Apagar curso"
          pendingLabel="Apagando..."
          variant="ghost"
          confirm="Apagar o curso inteiro, com módulos e aulas?"
        >
          <input type="hidden" name="id" value={course.id} />
        </AdminForm>
      </Card>
    </>
  );
}
