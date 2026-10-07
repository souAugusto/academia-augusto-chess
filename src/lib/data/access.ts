import "server-only";
import { createClient } from "@/lib/supabase/server";

// Checagens para Server Actions (que não redirecionam: devolvem o motivo).
// O RLS do banco reforça as mesmas regras.

export type AccessResult =
  | { ok: true; userId: string; planRank: number }
  | { ok: false; reason: "login" | "plano" };

export async function checkPlan(minRank: number): Promise<AccessResult> {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getClaims();
  const userId = auth?.claims.sub;
  if (!userId) return { ok: false, reason: "login" };
  const { data: rank } = await supabase.rpc("my_plan_rank");
  const planRank = Number(rank ?? 0);
  if (planRank < minRank) return { ok: false, reason: "plano" };
  return { ok: true, userId, planRank };
}
