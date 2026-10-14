import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import {
  accessStatus,
  normalizeEmail,
  TRIAL_PLAN,
  trialBlocker,
  trialEndsAt,
  type AccessStatus,
  type SubscriptionRow,
  type TrialAvoid,
} from "@/lib/trial";

type Row = SubscriptionRow & { id: string; plan_id: string };

async function loadRows(userId: string) {
  const supabase = await createClient();
  const [{ data: rows }, { data: paid }] = await Promise.all([
    supabase
      .from("subscriptions")
      .select("id, plan_id, source, status, current_period_end")
      .eq("user_id", userId),
    supabase.rpc("my_paid_plan_rank"),
  ]);
  return { rows: (rows ?? []) as Row[], paidRank: Number(paid ?? 0) };
}

async function emailClaimed(email: string): Promise<boolean> {
  const { data } = await createAdminClient()
    .from("trial_claims")
    .select("id")
    .eq("email_normalized", normalizeEmail(email))
    .maybeSingle();
  return Boolean(data);
}

// Status de acesso do aluno logado: pago, em teste (dias restantes), teste
// expirado ou gratuito (e se pode testar). Usado por todas as telas que falam
// do teste. A permissão de verdade é do banco (my_plan_rank, que já inclui o
// teste e o expira pela data) e das checagens no servidor que usam ela.
export async function getAccessStatus(user: {
  id: string;
  email: string;
}): Promise<AccessStatus> {
  const { rows, paidRank } = await loadRows(user.id);
  const trialRow = rows.find((row) => row.source === "trial");
  const blocker =
    paidRank > 0 || trialRow
      ? null
      : trialBlocker({ rows, emailClaimed: await emailClaimed(user.email) });
  return accessStatus({
    paidRank,
    trial: trialRow?.current_period_end
      ? {
          endsAt: new Date(trialRow.current_period_end),
          ended: trialRow.status !== "trialing",
        }
      : null,
    blocker,
  });
}

export type StartTrialResult =
  | { ok: true; already: boolean }
  | { ok: false; reason: TrialAvoid | "pago" | "erro" };

// Começa o teste. Idempotente: se já está em teste, não reinicia nem estende.
export async function startTrialFor(user: {
  id: string;
  email: string;
}): Promise<StartTrialResult> {
  const { rows, paidRank } = await loadRows(user.id);
  const trialRow = rows.find((row) => row.source === "trial");
  if (trialRow) {
    const running =
      trialRow.status === "trialing" &&
      trialRow.current_period_end !== null &&
      new Date(trialRow.current_period_end) > new Date();
    return running
      ? { ok: true, already: true }
      : { ok: false, reason: "ja-testou" };
  }
  if (paidRank > 0) return { ok: false, reason: "pago" };
  const blocker = trialBlocker({
    rows,
    emailClaimed: await emailClaimed(user.email),
  });
  if (blocker) return { ok: false, reason: blocker };

  const admin = createAdminClient();
  const startedAt = new Date();
  const endsAt = trialEndsAt(startedAt);
  // O registro por e-mail vem primeiro: os índices únicos barram dois testes
  // ao mesmo tempo (clique duplo, duas abas ou duas contas do mesmo e-mail).
  const { error: claimError } = await admin.from("trial_claims").insert({
    user_id: user.id,
    email_normalized: normalizeEmail(user.email),
    started_at: startedAt.toISOString(),
    ends_at: endsAt.toISOString(),
  });
  if (claimError?.code === "23505") {
    const again = await loadRows(user.id);
    return again.rows.some((row) => row.source === "trial")
      ? { ok: true, already: true }
      : { ok: false, reason: "ja-testou" };
  }
  if (claimError) {
    console.error("Teste grátis: registro", claimError);
    return { ok: false, reason: "erro" };
  }
  const { error } = await admin.from("subscriptions").insert({
    user_id: user.id,
    plan_id: TRIAL_PLAN,
    status: "trialing",
    source: "trial",
    current_period_end: endsAt.toISOString(),
    cancel_at_period_end: true, // sem os 3 dias de tolerância do pago
  });
  if (error?.code === "23505") return { ok: true, already: true };
  if (error) {
    console.error("Teste grátis: assinatura", error);
    await admin.from("trial_claims").delete().eq("user_id", user.id);
    return { ok: false, reason: "erro" };
  }
  console.info("Teste grátis ativado", { userId: user.id });
  return { ok: true, already: false };
}
