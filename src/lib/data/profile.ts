import "server-only";
import { publicEnv } from "@/lib/env";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export type MyProfile = {
  nickname: string | null;
  nicknameChangedAt: Date | null;
  name: string;
  bio: string;
  whatsapp: string;
  showInRanking: boolean;
  avatarUrl: string | null;
};

// Endereço público da foto. O "v" muda a cada envio, para o navegador não
// mostrar a foto antiga do cache.
export function avatarUrl(
  path: string | null,
  version?: string,
): string | null {
  if (!path) return null;
  const base = `${publicEnv().NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/avatars/${path}`;
  return version ? `${base}?v=${encodeURIComponent(version)}` : base;
}

// Perfil do aluno logado (só o dele).
export async function getMyProfile(userId: string): Promise<MyProfile> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select(
      "display_name, display_name_changed_at, name, bio, whatsapp, show_in_ranking, avatar_path",
    )
    .eq("id", userId)
    .single();
  let version: string | undefined;
  if (data?.avatar_path) {
    // Listar arquivos exige a service role (o bucket não tem policy de leitura
    // da listagem para alunos); só a pasta do próprio aluno é consultada.
    const { data: files } = await createAdminClient()
      .storage.from("avatars")
      .list(userId, { search: "avatar.webp" });
    version = files?.[0]?.updated_at ?? undefined;
  }
  return {
    nickname: data?.display_name ?? null,
    nicknameChangedAt: data?.display_name_changed_at
      ? new Date(data.display_name_changed_at)
      : null,
    name: data?.name ?? "",
    bio: data?.bio ?? "",
    whatsapp: data?.whatsapp ?? "",
    showInRanking: data?.show_in_ranking ?? true,
    avatarUrl: avatarUrl(data?.avatar_path ?? null, version),
  };
}
