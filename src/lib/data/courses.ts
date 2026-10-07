import "server-only";
import { createClient } from "@/lib/supabase/server";

// Cursos, módulos e aulas. O RLS já filtra pelo plano do aluno e por publicação.

export type LessonSummary = {
  id: string;
  title: string;
  position: number;
  completed: boolean;
};
export type ModuleWithLessons = {
  id: string;
  title: string;
  position: number;
  lessons: LessonSummary[];
};
export type Course = {
  id: string;
  title: string;
  description: string | null;
  planRequired: number;
  modules: ModuleWithLessons[];
};

type CourseRow = {
  id: string;
  title: string;
  description: string | null;
  plan_required: number;
  modules: {
    id: string;
    title: string;
    position: number;
    lessons: { id: string; title: string; position: number }[];
  }[];
};

const COURSE_SELECT =
  "id, title, description, plan_required, modules (id, title, position, lessons (id, title, position))";

async function completedLessonIds(): Promise<Set<string>> {
  const supabase = await createClient();
  const { data } = await supabase.from("lesson_progress").select("lesson_id");
  return new Set((data ?? []).map((row) => row.lesson_id));
}

function toCourse(row: CourseRow, done: Set<string>): Course {
  const byPosition = <T extends { position: number }>(a: T, b: T) =>
    a.position - b.position;
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    planRequired: row.plan_required,
    modules: [...row.modules].sort(byPosition).map((module) => ({
      id: module.id,
      title: module.title,
      position: module.position,
      lessons: [...module.lessons]
        .sort(byPosition)
        .map((lesson) => ({ ...lesson, completed: done.has(lesson.id) })),
    })),
  };
}

export async function listCourses(): Promise<Course[]> {
  const supabase = await createClient();
  const [{ data }, done] = await Promise.all([
    supabase.from("courses").select(COURSE_SELECT).order("position"),
    completedLessonIds(),
  ]);
  return ((data ?? []) as CourseRow[]).map((row) => toCourse(row, done));
}

export async function getCourse(courseId: string): Promise<Course | null> {
  const supabase = await createClient();
  const [{ data }, done] = await Promise.all([
    supabase
      .from("courses")
      .select(COURSE_SELECT)
      .eq("id", courseId)
      .maybeSingle(),
    completedLessonIds(),
  ]);
  return data ? toCourse(data as CourseRow, done) : null;
}

export type LessonDetail = {
  id: string;
  title: string;
  description: string | null;
  videoProvider: string;
  videoId: string | null;
  fen: string | null;
  files: { id: string; name: string; kind: "pdf" | "pgn" }[];
};

export async function getLesson(
  lessonId: string,
): Promise<LessonDetail | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("lessons")
    .select(
      "id, title, description, video_provider, video_id, fen, lesson_files (id, name, kind)",
    )
    .eq("id", lessonId)
    .maybeSingle();
  if (!data) return null;
  return {
    id: data.id,
    title: data.title,
    description: data.description,
    videoProvider: data.video_provider,
    videoId: data.video_id,
    fen: data.fen,
    files: (data.lesson_files ?? []) as LessonDetail["files"],
  };
}

export function countLessons(course: Course) {
  const lessons = course.modules.flatMap((module) => module.lessons);
  return {
    total: lessons.length,
    done: lessons.filter((lesson) => lesson.completed).length,
  };
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export function isUuid(value: string): boolean {
  return UUID.test(value);
}
