"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { checkPlan } from "@/lib/data/access";
import { createClient } from "@/lib/supabase/server";

const schema = z.object({
  lessonId: z.uuid(),
  completed: z.boolean(),
  path: z.string().startsWith("/aulas/"),
});

// Marca ou desmarca a aula como concluída (RLS: só o próprio aluno).
export async function setLessonCompleted(input: {
  lessonId: string;
  completed: boolean;
  path: string;
}): Promise<{ ok: boolean }> {
  const parsed = schema.safeParse(input);
  if (!parsed.success) return { ok: false };
  const access = await checkPlan(1);
  if (!access.ok) return { ok: false };

  const supabase = await createClient();
  const { lessonId, completed, path } = parsed.data;
  const { error } = completed
    ? await supabase
        .from("lesson_progress")
        .upsert({ user_id: access.userId, lesson_id: lessonId })
    : await supabase.from("lesson_progress").delete().eq("lesson_id", lessonId);
  if (error) return { ok: false };
  revalidatePath(path);
  return { ok: true };
}
