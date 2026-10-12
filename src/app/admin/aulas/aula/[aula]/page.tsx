import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  AdminCheckbox,
  AdminForm,
  AdminInput,
  AdminSelect,
  AdminTextarea,
} from "@/components/admin/AdminForm";
import { Card } from "@/components/ui/Card";
import { SectionLabel } from "@/components/ui/Label";
import { requireAdmin } from "@/lib/data/admin";
import { isUuid } from "@/lib/data/courses";
import { createClient } from "@/lib/supabase/server";
import {
  deleteLesson,
  deleteLessonFile,
  updateLesson,
  uploadLessonFile,
} from "../../actions";

export const metadata: Metadata = { title: "Aula" };

export default async function AulaAdminPage({
  params,
}: PageProps<"/admin/aulas/aula/[aula]">) {
  const { aula } = await params;
  await requireAdmin(`/admin/aulas/aula/${aula}`);
  if (!isUuid(aula)) notFound();
  const supabase = await createClient();
  const { data: lesson } = await supabase
    .from("lessons")
    .select(
      "id, title, description, video_id, fen, pgn, category, position, is_published, modules (title, course_id), lesson_files (id, name, kind)",
    )
    .eq("id", aula)
    .maybeSingle();
  if (!lesson) notFound();
  const lessonModule = lesson.modules as unknown as {
    title: string;
    course_id: string;
  } | null;
  const courseId = lessonModule?.course_id ?? "";

  return (
    <>
      <div className="flex flex-col gap-2">
        <Link
          href={`/admin/aulas/${courseId}`}
          className="text-sm text-muted hover:text-text"
        >
          ← {lessonModule?.title ?? "Curso"}
        </Link>
        <SectionLabel>Aula</SectionLabel>
        <h1 className="font-display text-page font-semibold tracking-tight">
          {lesson.title}
        </h1>
      </div>

      <Card className="flex max-w-3xl flex-col gap-4">
        <AdminForm action={updateLesson} submitLabel="Salvar aula">
          <input type="hidden" name="id" value={lesson.id} />
          <AdminInput
            name="title"
            label="Título"
            defaultValue={lesson.title}
            required
          />
          <AdminTextarea
            name="description"
            label="Texto da aula"
            defaultValue={lesson.description ?? ""}
          />
          <AdminInput
            name="video"
            label="Vídeo do YouTube"
            defaultValue={lesson.video_id ?? ""}
            placeholder="https://youtu.be/..."
            hint="Use vídeo não listado. Quem tiver o link consegue assistir fora da Finale."
          />
          <AdminInput
            name="fen"
            label="Posição para o tabuleiro (FEN, opcional)"
            defaultValue={lesson.fen ?? ""}
          />
          <AdminTextarea
            name="pgn"
            label="Partida (PGN, opcional)"
            defaultValue={lesson.pgn ?? ""}
            hint="Para o tabuleiro acompanhar o vídeo, ponha o tempo depois do lance: 1. e4 {[%t 0:45] Abre o centro} e5 {[%t 1:02]}"
            rows={6}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <AdminSelect
              name="category"
              label="Tipo"
              defaultValue={lesson.category}
              options={[
                { value: "regular", label: "Aula normal" },
                { value: "mestre", label: "Aula do mestre convidado" },
              ]}
            />
            <AdminInput
              name="position"
              label="Ordem no módulo"
              type="number"
              min="0"
              defaultValue={lesson.position}
            />
          </div>
          <AdminCheckbox
            name="isPublished"
            label="Publicada (aparece para os alunos)"
            defaultChecked={lesson.is_published}
          />
        </AdminForm>
      </Card>

      <Card className="flex max-w-3xl flex-col gap-4">
        <h2 className="text-lg font-semibold">Materiais (PDF e PGN)</h2>
        <ul className="flex flex-col gap-2">
          {(lesson.lesson_files ?? []).map((file) => (
            <li
              key={file.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-control bg-surface-2 px-3 py-2"
            >
              <span>
                {file.name}{" "}
                <span className="text-sm text-muted uppercase">
                  {file.kind}
                </span>
              </span>
              <AdminForm
                action={deleteLessonFile}
                submitLabel="Apagar"
                pendingLabel="Apagando..."
                variant="ghost"
                confirm="Apagar este arquivo?"
              >
                <input type="hidden" name="id" value={file.id} />
              </AdminForm>
            </li>
          ))}
          {(lesson.lesson_files ?? []).length === 0 && (
            <p className="text-sm text-muted">Nenhum arquivo.</p>
          )}
        </ul>
        <AdminForm
          action={uploadLessonFile}
          submitLabel="Enviar arquivo"
          pendingLabel="Enviando..."
          variant="secondary"
        >
          <input type="hidden" name="lessonId" value={lesson.id} />
          <AdminInput
            name="file"
            label="Arquivo (até 4 MB)"
            type="file"
            accept=".pdf,.pgn"
            required
          />
          <AdminInput
            name="name"
            label="Nome que o aluno vê"
            placeholder="Ex.: Exercícios da aula"
          />
        </AdminForm>
      </Card>

      <AdminForm
        action={deleteLesson}
        submitLabel="Apagar aula"
        pendingLabel="Apagando..."
        variant="ghost"
        confirm="Apagar esta aula e os materiais dela?"
      >
        <input type="hidden" name="id" value={lesson.id} />
        <input type="hidden" name="courseId" value={courseId} />
      </AdminForm>
    </>
  );
}
