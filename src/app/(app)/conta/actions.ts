"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireUser } from "@/lib/data/account";
import { getPaymentProvider } from "@/lib/payments";
import {
  applySubscriptionEvent,
  type SubscriptionStatus,
} from "@/lib/payments/rules";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

const schema = z.object({ subscriptionId: z.uuid() });

export type CancelState = { message?: string; done?: boolean };

// Cancela a renovação. Quem já pagou mantém o acesso até o fim do período.
export async function cancelSubscription(
  _prev: CancelState,
  formData: FormData,
): Promise<CancelState> {
  const parsed = schema.safeParse({
    subscriptionId: formData.get("subscriptionId"),
  });
  if (!parsed.success) return { message: "Assinatura não encontrada." };
  await requireUser("/conta");

  // Lido com o cliente do aluno: o RLS garante que a assinatura é dele.
  const supabase = await createClient();
  const { data: row } = await supabase
    .from("subscriptions")
    .select(
      "id, status, source, current_period_end, cancel_at_period_end, provider_subscription_id",
    )
    .eq("id", parsed.data.subscriptionId)
    .maybeSingle();
  if (!row || row.source !== "asaas" || !row.provider_subscription_id)
    return {
      message:
        "Esta assinatura não pode ser cancelada por aqui. Fale com o suporte.",
    };

  try {
    await getPaymentProvider().cancelSubscription(row.provider_subscription_id);
  } catch (error) {
    console.error("Cancelar assinatura:", error);
    return {
      message: "Não foi possível cancelar agora. Tente de novo em instantes.",
    };
  }

  const patch = applySubscriptionEvent(
    {
      status: row.status as SubscriptionStatus,
      currentPeriodEnd: row.current_period_end,
      cancelAtPeriodEnd: row.cancel_at_period_end,
    },
    "SUBSCRIPTION_DELETED",
  );
  if (patch) {
    await createAdminClient()
      .from("subscriptions")
      .update({
        ...(patch.status && { status: patch.status }),
        ...(patch.cancelAtPeriodEnd !== undefined && {
          cancel_at_period_end: patch.cancelAtPeriodEnd,
        }),
        updated_at: new Date().toISOString(),
      })
      .eq("id", row.id);
  }
  revalidatePath("/conta");
  return { done: true };
}

// Abre a página de pagamento da cobrança em aberto (primeiro mês ou atraso).
export async function payPending(formData: FormData): Promise<void> {
  const parsed = schema.safeParse({
    subscriptionId: formData.get("subscriptionId"),
  });
  if (!parsed.success) redirect("/conta");
  await requireUser("/conta");
  const supabase = await createClient();
  const { data: row } = await supabase
    .from("subscriptions")
    .select("provider_subscription_id")
    .eq("id", parsed.data.subscriptionId)
    .maybeSingle();
  if (!row?.provider_subscription_id) redirect("/conta");
  let url: string | null = null;
  try {
    url = await getPaymentProvider().pendingInvoiceUrl(
      row.provider_subscription_id,
    );
  } catch (error) {
    console.error("Abrir cobrança:", error);
  }
  redirect(url ?? "/conta?pagamento=indisponivel");
}
