"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireUser } from "@/lib/data/account";
import { getPaymentProvider } from "@/lib/payments";
import {
  applySubscriptionEvent,
  reactivationDueDate,
  type SubscriptionStatus,
} from "@/lib/payments/rules";
import type { BillingMethod } from "@/lib/payments/types";
import { getPlans } from "@/lib/data/public";
import { formatLongDate } from "@/lib/format";
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
  const user = await requireUser("/conta");

  // Lido com o cliente do aluno: o RLS garante que a assinatura é dele.
  const supabase = await createClient();
  const { data: row } = await supabase
    .from("subscriptions")
    .select(
      "id, status, source, current_period_end, cancel_at_period_end, provider_subscription_id",
    )
    .eq("id", parsed.data.subscriptionId)
    .eq("user_id", user.id)
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
  const user = await requireUser("/conta");
  const supabase = await createClient();
  const { data: row } = await supabase
    .from("subscriptions")
    .select("provider_subscription_id")
    .eq("id", parsed.data.subscriptionId)
    .eq("user_id", user.id)
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

export type BillingState = { ok?: boolean; message?: string };

// Lê a assinatura do próprio aluno (RLS + filtro pelo dono).
async function ownSubscription(subscriptionId: string, userId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("subscriptions")
    .select(
      "id, plan_id, status, source, billing_type, current_period_end, cancel_at_period_end, provider_subscription_id, provider_customer_id",
    )
    .eq("id", subscriptionId)
    .eq("user_id", userId)
    .maybeSingle();
  return data;
}

const methodSchema = z.object({
  subscriptionId: z.uuid(),
  method: z.enum(["PIX", "CREDIT_CARD"]),
});

// Troca a forma de pagamento das próximas cobranças (Pix ou cartão). No cartão,
// os dados são pedidos na página segura do Asaas, na próxima cobrança.
export async function changePaymentMethod(
  _prev: BillingState,
  formData: FormData,
): Promise<BillingState> {
  const parsed = methodSchema.safeParse({
    subscriptionId: formData.get("subscriptionId"),
    method: formData.get("method"),
  });
  if (!parsed.success) return { message: "Escolha Pix ou cartão." };
  const user = await requireUser("/conta");
  const row = await ownSubscription(parsed.data.subscriptionId, user.id);
  if (
    !row ||
    row.source !== "asaas" ||
    !row.provider_subscription_id ||
    row.cancel_at_period_end ||
    !["active", "past_due", "incomplete"].includes(row.status)
  )
    return {
      message: "Esta assinatura não aceita troca da forma de pagamento.",
    };
  if (row.billing_type === parsed.data.method)
    return { message: "Esta já é a forma de pagamento da assinatura." };
  try {
    await getPaymentProvider().updateBillingType(
      row.provider_subscription_id,
      parsed.data.method,
    );
  } catch (error) {
    console.error("Trocar forma de pagamento:", error);
    return {
      message: "Não consegui trocar agora. Tente de novo em instantes.",
    };
  }
  await createAdminClient()
    .from("subscriptions")
    .update({
      billing_type: parsed.data.method,
      updated_at: new Date().toISOString(),
    })
    .eq("id", row.id);
  revalidatePath("/conta");
  return {
    ok: true,
    message:
      parsed.data.method === "PIX"
        ? "Pronto: as próximas cobranças serão por Pix."
        : "Pronto: as próximas cobranças serão no cartão. Os dados do cartão são pedidos na página segura do Asaas.",
  };
}

// Desfaz o cancelamento antes do fim do período pago. Como o Asaas não
// "reabre" uma recorrência apagada, cria uma nova com o MESMO valor e com a
// primeira cobrança no dia em que o período pago acaba: sem cobrança dupla.
export async function reactivateSubscription(
  _prev: BillingState,
  formData: FormData,
): Promise<BillingState> {
  const parsed = schema.safeParse({
    subscriptionId: formData.get("subscriptionId"),
  });
  if (!parsed.success) return { message: "Assinatura não encontrada." };
  const user = await requireUser("/conta");
  const row = await ownSubscription(parsed.data.subscriptionId, user.id);
  if (!row || row.source !== "asaas" || !row.provider_customer_id)
    return { message: "Esta assinatura não pode ser reativada por aqui." };
  const dueDate = reactivationDueDate({
    status: row.status as SubscriptionStatus,
    currentPeriodEnd: row.current_period_end,
    cancelAtPeriodEnd: row.cancel_at_period_end,
  });
  if (!dueDate)
    return {
      message:
        "O período pago já acabou. Para voltar, assine de novo na página de planos.",
    };

  const provider = getPaymentProvider();
  try {
    const plan = (await getPlans()).find((item) => item.id === row.plan_id);
    // Mesmo valor que o aluno pagava (preço novo só vale para quem assina depois).
    const valueCents =
      (row.provider_subscription_id
        ? await provider
            .subscriptionValueCents(row.provider_subscription_id)
            .catch(() => null)
        : null) ?? plan?.priceCents;
    if (!valueCents || !plan) throw new Error("valor da assinatura");
    const created = await provider.createSubscription({
      customerId: row.provider_customer_id,
      method: (row.billing_type as BillingMethod | null) ?? "PIX",
      valueCents,
      description: `Academia Finale de Xadrez · plano ${plan.name}`,
      externalReference: row.id,
      firstDueDate: dueDate,
      // Sem página de pagamento agora: a cobrança só sai no fim do período.
    });
    await createAdminClient()
      .from("subscriptions")
      .update({
        provider_subscription_id: created.id,
        cancel_at_period_end: false,
        updated_at: new Date().toISOString(),
      })
      .eq("id", row.id);
  } catch (error) {
    console.error("Reativar assinatura:", error);
    return {
      message: "Não consegui reativar agora. Tente de novo em instantes.",
    };
  }
  revalidatePath("/conta");
  return {
    ok: true,
    message: `Assinatura reativada. A próxima cobrança será em ${formatDay(dueDate)}, quando o período atual termina.`,
  };
}

function formatDay(day: string): string {
  return formatLongDate(new Date(`${day}T12:00:00-03:00`));
}
