import "server-only";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type CurrentUser = {
  id: string;
  email: string;
  name: string;
  whatsapp: string | null;
  planRank: number; // 0 = sem plano, 1 = Membro, 2 = Intensivo
};

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
  };
}

export const PLAN_NAMES: Record<number, string> = {
  1: "Membro",
  2: "Intensivo",
};
