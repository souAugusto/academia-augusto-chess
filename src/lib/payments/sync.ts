import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { AsaasEvent } from "./asaas-webhook";
import { subscriptionIdOf } from "./asaas-webhook";
import {
  applyPaymentEvent,
  applySubscriptionEvent,
  type SubscriptionPatch,
  type SubscriptionState,
  type SubscriptionStatus,
} from "./rules";
import type { PaymentProvider } from "./types";

// Aplica um evento do provedor na tabela subscriptions (service role).

function toColumns(patch: SubscriptionPatch) {
  return {
    ...(patch.status && { status: patch.status }),
    ...(patch.currentPeriodEnd !== undefined && {
      current_period_end: patch.currentPeriodEnd,
    }),
    ...(patch.cancelAtPeriodEnd !== undefined && {
      cancel_at_period_end: patch.cancelAtPeriodEnd,
    }),
    updated_at: new Date().toISOString(),
  };
}

export async function syncSubscriptionEvent(
  admin: SupabaseClient,
  provider: PaymentProvider,
  event: AsaasEvent,
): Promise<void> {
  const providerId = subscriptionIdOf(event);
  if (!providerId) return; // cobrança avulsa: não é da Finale

  const { data: row, error } = await admin
    .from("subscriptions")
    .select("id, user_id, status, current_period_end, cancel_at_period_end")
    .eq("provider_subscription_id", providerId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!row) {
    console.warn(`Webhook: assinatura ${providerId} não encontrada.`);
    return;
  }

  const state: SubscriptionState = {
    status: row.status as SubscriptionStatus,
    currentPeriodEnd: row.current_period_end,
    cancelAtPeriodEnd: row.cancel_at_period_end,
  };
  const patch = event.payment
    ? applyPaymentEvent(state, event.event, event.payment.dueDate)
    : applySubscriptionEvent(state, event.event);
  if (!patch) return;

  const { error: updateError } = await admin
    .from("subscriptions")
    .update(toColumns(patch))
    .eq("id", row.id);
  if (updateError) throw new Error(updateError.message);

  if (patch.status === "active" && state.status !== "active")
    await onActivated(admin, provider, row.user_id, row.id);
}

// Pagamento confirmado: a vaga reservada vira vaga ocupada e outras assinaturas
// do aluno (troca de plano ou tentativa repetida) deixam de cobrar.
async function onActivated(
  admin: SupabaseClient,
  provider: PaymentProvider,
  userId: string,
  keepId: string,
) {
  await admin.from("seat_reservations").delete().eq("user_id", userId);

  const { data: others } = await admin
    .from("subscriptions")
    .select("id, status, provider_subscription_id")
    .eq("user_id", userId)
    .eq("source", "asaas")
    .neq("id", keepId)
    .in("status", ["incomplete", "active", "past_due"])
    .eq("cancel_at_period_end", false);
  for (const other of others ?? []) {
    if (other.provider_subscription_id)
      await provider
        .cancelSubscription(other.provider_subscription_id)
        .catch((error) => console.error("Webhook: cancelar anterior", error));
    await admin
      .from("subscriptions")
      .update(
        other.status === "incomplete"
          ? { status: "canceled", updated_at: new Date().toISOString() }
          : {
              cancel_at_period_end: true,
              updated_at: new Date().toISOString(),
            },
      )
      .eq("id", other.id);
  }
}
