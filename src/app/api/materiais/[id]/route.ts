import { NextResponse, type NextRequest } from "next/server";
import { checkPlan } from "@/lib/data/access";
import { isUuid } from "@/lib/data/courses";
import { siteFlagAllowed } from "@/lib/data/site-settings";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

// Bucket privado do Supabase Storage com PDFs e PGNs das aulas (criado na Fase 4).
const BUCKET = "materiais";
const LINK_SECONDS = 60;

// Gera um link temporário para o material, só depois de conferir o plano.
export async function GET(
  _request: NextRequest,
  { params }: RouteContext<"/api/materiais/[id]">,
) {
  const { id } = await params;
  if (!isUuid(id)) return new NextResponse(null, { status: 404 });
  const access = await checkPlan(1);
  if (!access.ok)
    return new NextResponse(null, {
      status: access.reason === "login" ? 401 : 403,
    });
  // Aulas desligadas pelo admin: sem material (o RLS também esconde).
  if (!(await siteFlagAllowed("video_lessons_enabled")))
    return new NextResponse(null, { status: 404 });

  // A leitura passa pelo RLS: o arquivo só aparece se a aula for do plano do aluno.
  const supabase = await createClient();
  const { data: file } = await supabase
    .from("lesson_files")
    .select("storage_path")
    .eq("id", id)
    .maybeSingle();
  if (!file) return new NextResponse(null, { status: 404 });

  try {
    const { data, error } = await createAdminClient()
      .storage.from(BUCKET)
      .createSignedUrl(file.storage_path, LINK_SECONDS, { download: true });
    if (error || !data) throw error;
    return NextResponse.redirect(data.signedUrl);
  } catch {
    return new NextResponse(null, { status: 404 });
  }
}
