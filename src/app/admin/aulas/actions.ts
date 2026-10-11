"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import {
  formObject,
  requireAdmin,
  zodMessage,
  type AdminState,
} from "@/lib/data/admin";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import {
  courseSchema,
  lessonSchema,
  moduleSchema,
} from "@/lib/validation/admin";

// Conteúdo das aulas. As escritas usam a sessão do admin: o RLS (policies *_admin)
// confere de novo que é admin.

const COURSE_FIELDS = [
  "title",
  "description",
  "planRequired",
  "position",
  "isPublished",
];
const LESSON_FIELDS = [
  "title",
  "description",
  "video",
  "fen",
  "pgn",
  "category",
  "position",
  "isPublished",
];
const BUCKET = "materiais";
const MAX_FILE_BYTES = 4 * 1024 * 1024;

const uuid = z.uuid();

function refresh() {
  revalidatePath("/aulas", "layout");
  revalidatePath("/admin/aulas", "layout");
}

export async function createCourse(
  _prev: AdminState,
  formData: FormData,
): Promise<AdminState> {
  await requireAdmin();
  const parsed = courseSchema.safeParse(formObject(formData, COURSE_FIELDS));
  if (!parsed.success) return { message: zodMessage(parsed.error) };
  const { title, description, planRequired, position, isPublished } =
    parsed.data;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("courses")
    .insert({
      title,
      description,
      plan_required: planRequired,
      position,
      is_published: isPublished,
    })
    .select("id")
    .single();
  if (error) return { message: error.message };
  refresh();
  redirect(`/admin/aulas/${data.id}`);
}

export async function updateCourse(
  _prev: AdminState,
  formData: FormData,
): Promise<AdminState> {
  await requireAdmin();
  const id = uuid.safeParse(formData.get("id"));
  const parsed = courseSchema.safeParse(formObject(formData, COURSE_FIELDS));
  if (!id.success) return { message: "Curso inválido." };
  if (!parsed.success) return { message: zodMessage(parsed.error) };
  const { title, description, planRequired, position, isPublished } =
    parsed.data;
  const supabase = await createClient();
  const { error } = await supabase
    .from("courses")
    .update({
      title,
      description,
      plan_required: planRequired,
      position,
      is_published: isPublished,
    })
    .eq("id", id.data);
  if (error) return { message: error.message };
  refresh();
  return { success: "Curso salvo." };
}

export async function deleteCourse(
  _prev: AdminState,
  formData: FormData,
): Promise<AdminState> {
  await requireAdmin();
  const id = uuid.safeParse(formData.get("id"));
  if (!id.success) return { message: "Curso inválido." };
  const supabase = await createClient();
  const { error } = await supabase.from("courses").delete().eq("id", id.data);
  if (error) return { message: error.message };
  refresh();
  redirect("/admin/aulas");
}

export async function saveModule(
  _prev: AdminState,
  formData: FormData,
): Promise<AdminState> {
  await requireAdmin();
  const parsed = moduleSchema.safeParse(
    formObject(formData, ["courseId", "title", "position"]),
  );
  if (!parsed.success) return { message: zodMessage(parsed.error) };
  const id = formData.get("id");
  const supabase = await createClient();
  const values = {
    course_id: parsed.data.courseId,
    title: parsed.data.title,
    position: parsed.data.position,
  };
  const { error } = id
    ? await supabase.from("modules").update(values).eq("id", uuid.parse(id))
    : await supabase.from("modules").insert(values);
  if (error) return { message: error.message };
  refresh();
  return { success: id ? "Módulo salvo." : "Módulo criado." };
}

export async function deleteModule(
  _prev: AdminState,
  formData: FormData,
): Promise<AdminState> {
  await requireAdmin();
  const id = uuid.safeParse(formData.get("id"));
  if (!id.success) return { message: "Módulo inválido." };
  const supabase = await createClient();
  const { error } = await supabase.from("modules").delete().eq("id", id.data);
  if (error) return { message: error.message };
  refresh();
  return { success: "Módulo apagado." };
}

export async function createLesson(
  _prev: AdminState,
  formData: FormData,
): Promise<AdminState> {
  await requireAdmin();
  const moduleId = uuid.safeParse(formData.get("moduleId"));
  const title = z
    .string()
    .trim()
    .min(2)
    .max(120)
    .safeParse(formData.get("title"));
  if (!moduleId.success) return { message: "Módulo inválido." };
  if (!title.success) return { message: "Escreva o título da aula." };
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("lessons")
    .insert({ module_id: moduleId.data, title: title.data, position: 99 })
    .select("id")
    .single();
  if (error) return { message: error.message };
  refresh();
  redirect(`/admin/aulas/aula/${data.id}`);
}

export async function updateLesson(
  _prev: AdminState,
  formData: FormData,
): Promise<AdminState> {
  await requireAdmin();
  const id = uuid.safeParse(formData.get("id"));
  const parsed = lessonSchema.safeParse(formObject(formData, LESSON_FIELDS));
  if (!id.success) return { message: "Aula inválida." };
  if (!parsed.success) return { message: zodMessage(parsed.error) };
  const lesson = parsed.data;
  const supabase = await createClient();
  const { error } = await supabase
    .from("lessons")
    .update({
      title: lesson.title,
      description: lesson.description,
      video_provider: "youtube",
      video_id: lesson.video,
      fen: lesson.fen,
      pgn: lesson.pgn,
      category: lesson.category,
      position: lesson.position,
      is_published: lesson.isPublished,
    })
    .eq("id", id.data);
  if (error) return { message: error.message };
  refresh();
  return { success: "Aula salva." };
}

export async function deleteLesson(
  _prev: AdminState,
  formData: FormData,
): Promise<AdminState> {
  await requireAdmin();
  const id = uuid.safeParse(formData.get("id"));
  const courseId = uuid.safeParse(formData.get("courseId"));
  if (!id.success || !courseId.success) return { message: "Aula inválida." };
  const supabase = await createClient();
  const { data: files } = await supabase
    .from("lesson_files")
    .select("storage_path")
    .eq("lesson_id", id.data);
  const { error } = await supabase.from("lessons").delete().eq("id", id.data);
  if (error) return { message: error.message };
  if (files?.length)
    await createAdminClient()
      .storage.from(BUCKET)
      .remove(files.map((file) => file.storage_path));
  refresh();
  redirect(`/admin/aulas/${courseId.data}`);
}

// PDF ou PGN da aula, num bucket privado. O aluno baixa por link temporário
// (/api/materiais/[id]) depois de conferido o plano.
export async function uploadLessonFile(
  _prev: AdminState,
  formData: FormData,
): Promise<AdminState> {
  await requireAdmin();
  const lessonId = uuid.safeParse(formData.get("lessonId"));
  const file = formData.get("file");
  if (!lessonId.success) return { message: "Aula inválida." };
  if (!(file instanceof File) || file.size === 0)
    return { message: "Escolha um arquivo." };
  if (file.size > MAX_FILE_BYTES)
    return { message: "O arquivo pode ter no máximo 4 MB." };
  const extension = file.name.toLowerCase().split(".").pop();
  if (extension !== "pdf" && extension !== "pgn")
    return { message: "Envie um PDF ou um PGN." };
  const name =
    z.string().trim().min(1).max(120).safeParse(formData.get("name")).data ??
    file.name.slice(0, 120);

  const path = `${lessonId.data}/${randomUUID()}.${extension}`;
  const admin = createAdminClient();
  const { error: uploadError } = await admin.storage
    .from(BUCKET)
    .upload(path, file, {
      contentType:
        extension === "pdf" ? "application/pdf" : "application/x-chess-pgn",
    });
  if (uploadError) return { message: `Falha no envio: ${uploadError.message}` };

  const supabase = await createClient();
  const { error } = await supabase.from("lesson_files").insert({
    lesson_id: lessonId.data,
    name,
    kind: extension,
    storage_path: path,
  });
  if (error) {
    await admin.storage.from(BUCKET).remove([path]);
    return { message: error.message };
  }
  refresh();
  return { success: "Arquivo enviado." };
}

export async function deleteLessonFile(
  _prev: AdminState,
  formData: FormData,
): Promise<AdminState> {
  await requireAdmin();
  const id = uuid.safeParse(formData.get("id"));
  if (!id.success) return { message: "Arquivo inválido." };
  const supabase = await createClient();
  const { data: file } = await supabase
    .from("lesson_files")
    .delete()
    .eq("id", id.data)
    .select("storage_path")
    .maybeSingle();
  if (file)
    await createAdminClient().storage.from(BUCKET).remove([file.storage_path]);
  refresh();
  return { success: "Arquivo apagado." };
}
