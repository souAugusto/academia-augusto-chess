import { AccountMenu } from "@/components/app/AccountMenu";
import { avatarUrl } from "@/lib/data/profile";
import { createClient } from "@/lib/supabase/server";

// Foto (ou iniciais) no cabeçalho do app, que abre o menu da conta (com Sair).
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
  return <AccountMenu url={url} name={name} email={user?.email ?? null} />;
}
