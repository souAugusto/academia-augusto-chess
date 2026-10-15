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
  location: string;
  declaredRating: number | null;
  showInRanking: boolean;
  avatarUrl: string | null; // foto enviada ou, sem ela, a do Google
  hasUploadedAvatar: boolean;
};

// Endereço público da foto. Fotos novas têm nome único por envio
// (avatar-<hora>.webp), então o cache do navegador nunca mostra a antiga.
// A foto antiga de nome fixo (avatar.webp) recebe "?v=" com a data do arquivo.
export function avatarUrl(
  path: string | null,
  version?: string,
): string | null {
  if (!path) return null;
  const base = `${publicEnv().NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/avatars/${path}`;
  return version ? `${base}?v=${encodeURIComponent(version)}` : base;
}

// Perfil do aluno logado (só o dele).
export async function getMyProfile(
  userId: string,
  socialAvatarUrl: string | null = null,
): Promise<MyProfile> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select(
      "display_name, display_name_changed_at, name, bio, whatsapp, location, declared_rating, show_in_ranking, avatar_path",
    )
    .eq("id", userId)
    .single();
  let version: string | undefined;
  if (data?.avatar_path?.endsWith("/avatar.webp")) {
    // Listar arquivos exige a service role; só a pasta do próprio aluno.
    const { data: files } = await createAdminClient()
      .storage.from("avatars")
      .list(userId, { search: "avatar.webp" });
    version = files?.[0]?.updated_at ?? undefined;
  }
  const uploaded = avatarUrl(data?.avatar_path ?? null, version);
  return {
    nickname: data?.display_name ?? null,
    nicknameChangedAt: data?.display_name_changed_at
      ? new Date(data.display_name_changed_at)
      : null,
    name: data?.name ?? "",
    bio: data?.bio ?? "",
    whatsapp: data?.whatsapp ?? "",
    location: data?.location ?? "",
    declaredRating: data?.declared_rating ?? null,
    showInRanking: data?.show_in_ranking ?? true,
    avatarUrl: uploaded ?? socialAvatarUrl,
    hasUploadedAvatar: Boolean(uploaded),
  };
}
