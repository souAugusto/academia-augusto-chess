import Link from "next/link";
import { Avatar } from "@/components/account/Avatar";
import { avatarUrl } from "@/lib/data/profile";
import { createClient } from "@/lib/supabase/server";

// Foto (ou iniciais) no cabeçalho do app, com link para Minha conta.
// Atualiza sozinha quando a foto muda (as actions revalidam o layout).
export async function HeaderAvatar() {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  const user = auth.user;
  let url: string | null = null;
  let name = "Conta";
  if (user) {
    const { data } = await supabase
      .from("profiles")
      .select("name, display_name, avatar_path")
      .eq("id", user.id)
      .maybeSingle();
    const meta = user.user_metadata as Record<string, unknown> | undefined;
    const social = meta?.avatar_url ?? meta?.picture;
    url =
      avatarUrl(
        data?.avatar_path ?? null,
        data?.avatar_path?.endsWith("/avatar.webp")
          ? user.updated_at
          : undefined,
      ) ??
      (typeof social === "string" && social.startsWith("https://")
        ? social
        : null);
    name = data?.display_name ?? data?.name ?? user.email ?? "Conta";
  }
  return (
    <Link
      href="/conta"
      className="flex size-touch items-center justify-center rounded-full transition hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      aria-label="Minha conta"
    >
      <Avatar url={url} name={name} size={32} decorative />
    </Link>
  );
}
