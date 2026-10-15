import "server-only";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type CurrentUser = {
  id: string;
  email: string;
  name: string;
  whatsapp: string | null;
  planRank: number; // 0 = sem plano, 1 = Membro, 2 = Intensivo
  createdAt: Date; // "Membro desde"
  providers: string[]; // "email", "google"...
  socialAvatarUrl: string | null; // foto do Google, se entrou por ele
};

// Foto do provedor social (Google manda "avatar_url" ou "picture"). Só https.
function socialAvatar(meta: Record<string, unknown> | undefined): string | null {
  const url = meta?.avatar_url ?? meta?.picture;
  return typeof url === "string" && url.startsWith("https://") ? url : null;
}

// Usuário logado, conferido no servidor. Sem sessão, manda para /entrar.
export async function requireUser(nextPath: string): Promise<CurrentUser> {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  const user = auth.user;
  if (!user) redirect(`/entrar?next=${encodeURIComponent(nextPath)}`);

  const [{ data: profile }, { data: rank }] = await Promise.all([
    supabase
      .from("profiles")
      .select("name, whatsapp")
      .eq("id", user.id)
      .maybeSingle(),
    supabase.rpc("my_plan_rank"),
  ]);

  return {
    id: user.id,
    email: user.email ?? "",
    name: profile?.name || user.email?.split("@")[0] || "aluno",
    whatsapp: profile?.whatsapp ?? null,
    planRank: Number(rank ?? 0),
    createdAt: new Date(user.created_at),
    providers: (user.app_metadata?.providers as string[] | undefined) ?? [
      (user.app_metadata?.provider as string | undefined) ?? "email",
    ],
    socialAvatarUrl: socialAvatar(user.user_metadata),
  };
}

export const PLAN_NAMES: Record<number, string> = {
  1: "Membro",
  2: "Intensivo",
};

// Nível do plano PAGO (ignora o teste grátis). No checkout: quem está no
// teste do Membro pode assinar o Membro; quem já paga, não.
export async function getPaidPlanRank(): Promise<number> {
  const supabase = await createClient();
  const { data } = await supabase.rpc("my_paid_plan_rank");
  return Number(data ?? 0);
}
