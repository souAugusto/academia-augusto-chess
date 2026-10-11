import "server-only";
import type { SubscriptionStatus } from "@/lib/payments/rules";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

// Assinatura do aluno logado (RLS: cada um lê só as suas).

export type MySubscription = {
  id: string;
  planId: "membro" | "intensivo";
  planName: string;
  status: SubscriptionStatus;
  source: "asaas" | "manual";
  billingType: "PIX" | "CREDIT_CARD" | null;
  currentPeriodEnd: Date | null;
  cancelAtPeriodEnd: boolean;
  providerSubscriptionId: string | null;
};

type Row = {
  id: string;
  plan_id: string;
  status: string;
  source: string;
  billing_type: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  provider_subscription_id: string | null;
  plans: { name: string; rank: number } | null;
};

function toSubscription(row: Row): MySubscription {
  return {
    id: row.id,
    planId: row.plan_id as MySubscription["planId"],
    planName: row.plans?.name ?? row.plan_id,
    status: row.status as SubscriptionStatus,
    source: row.source as MySubscription["source"],
    billingType: row.billing_type as MySubscription["billingType"],
    currentPeriodEnd: row.current_period_end
      ? new Date(row.current_period_end)
      : null,
    cancelAtPeriodEnd: row.cancel_at_period_end,
    providerSubscriptionId: row.provider_subscription_id,
  };
}

// Todas as assinaturas que ainda importam: ativas, em atraso ou esperando pagamento.
export async function getMySubscriptions(): Promise<MySubscription[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("subscriptions")
    .select(
      "id, plan_id, status, source, billing_type, current_period_end, cancel_at_period_end, provider_subscription_id, plans (name, rank)",
    )
    .in("status", ["active", "trialing", "past_due", "incomplete"])
    .order("created_at", { ascending: false });
  return ((data ?? []) as unknown as Row[]).map(toSubscription);
}

export const STATUS_LABELS: Record<SubscriptionStatus, string> = {
  incomplete: "Aguardando pagamento",
  active: "Ativa",
  past_due: "Pagamento em atraso",
  canceled: "Cancelada",
};

export const METHOD_LABELS = { PIX: "Pix", CREDIT_CARD: "Cartão de crédito" };

export type GroupLink = { label: string; url: string };

// Links dos grupos do WhatsApp. app_settings não tem policy de aluno: lê pela
// service role, só depois de conferir o plano no servidor.
export async function getGroupLinks(planRank: number): Promise<GroupLink[]> {
  if (planRank < 1) return [];
  const { data } = await createAdminClient()
    .from("app_settings")
    .select("key, value")
    .in("key", ["whatsapp_membros_url", "whatsapp_intensivo_url"]);
  const url = (key: string) => data?.find((row) => row.key === key)?.value;
  const links: GroupLink[] = [];
  const members = url("whatsapp_membros_url");
  const intensive = url("whatsapp_intensivo_url");
  if (members) links.push({ label: "Grupo dos membros", url: members });
  if (intensive && planRank >= 2)
    links.push({ label: "Grupo da turma do Intensivo", url: intensive });
  return links;
}
