"use server";

import { redirect } from "next/navigation";
import type { FormState } from "@/app/(auth)/actions";
import { requireUser } from "@/lib/data/account";
import { getPlans } from "@/lib/data/public";
import { siteOrigin } from "@/lib/origin";
import { getPaymentProvider, paymentsConfigured } from "@/lib/payments";
import { todayInSaoPaulo } from "@/lib/payments/rules";
import { PaymentError } from "@/lib/payments/types";
import { createAdminClient } from "@/lib/supabase/admin";
import { checkoutSchema } from "@/lib/validation/checkout";
import { fieldErrors } from "@/lib/validation/auth";

const PLAN_RANK = { membro: 1, intensivo: 2 } as const;
const SEAT_HOLD_MINUTES = 60;

function text(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

// Cria a assinatura no Asaas e manda o aluno para a página de pagamento dele.
// Plano, preço e usuário vêm do servidor; do formulário só saem o plano escolhido,
// a forma de pagamento e o CPF (validado).
export async function startCheckout(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const values = {
    plan: text(formData, "plan"),
    method: text(formData, "method"),
    cpf: text(formData, "cpf"),
  };
  const parsed = checkoutSchema.safeParse(values);
  if (!parsed.success) return { errors: fieldErrors(parsed.error), values };
  const { plan: planId, method, cpf } = parsed.data;

  const user = await requireUser(`/checkout?plano=${planId}`);
  if (user.planRank >= PLAN_RANK[planId]) redirect("/conta");
  if (!paymentsConfigured())
    return { message: "O pagamento ainda está sendo configurado.", values };

  const plan = (await getPlans()).find((item) => item.id === planId);
  if (!plan) return { message: "Plano indisponível.", values };

  const admin = createAdminClient();
  const provider = getPaymentProvider();
  let invoiceUrl: string | null = null;

  try {
    if (plan.seatLimit !== null) {
      const { data: reserved, error } = await admin.rpc(
        "reserve_intensivo_seat",
        { p_user: user.id, p_minutes: SEAT_HOLD_MINUTES },
      );
      if (error) throw new Error(error.message);
      if (!reserved)
        return {
          message:
            "A turma está completa no momento. Entre na lista de espera na página de planos.",
          values,
        };
    }

    const { data: saved } = await admin
      .from("payment_customers")
      .select("provider_customer_id")
      .eq("user_id", user.id)
      .maybeSingle();
    const customerId = await provider.saveCustomer(
      saved?.provider_customer_id ?? null,
      {
        userId: user.id,
        name: user.name,
        email: user.email,
        cpf,
        mobilePhone: user.whatsapp ?? undefined,
      },
    );
    if (!saved) {
      const { error } = await admin.from("payment_customers").insert({
        user_id: user.id,
        provider: provider.name,
        provider_customer_id: customerId,
      });
      if (error) throw new Error(error.message);
    }

    // Uma tentativa anterior sem pagamento é descartada para não gerar cobrança dupla.
    const { data: stale } = await admin
      .from("subscriptions")
      .select("id, provider_subscription_id")
      .eq("user_id", user.id)
      .eq("source", "asaas")
      .eq("status", "incomplete");
    for (const row of stale ?? []) {
      if (row.provider_subscription_id)
        await provider
          .cancelSubscription(row.provider_subscription_id)
          .catch(() => undefined);
      await admin
        .from("subscriptions")
        .update({ status: "canceled", updated_at: new Date().toISOString() })
        .eq("id", row.id);
    }

    const { data: created, error: insertError } = await admin
      .from("subscriptions")
      .insert({
        user_id: user.id,
        plan_id: plan.id,
        status: "incomplete",
        source: "asaas",
        billing_type: method,
        provider_customer_id: customerId,
      })
      .select("id")
      .single();
    if (insertError) throw new Error(insertError.message);

    const subscription = await provider.createSubscription({
      customerId,
      method,
      valueCents: plan.priceCents,
      description: `Academia Finale de Xadrez · plano ${plan.name}`,
      externalReference: created.id,
      firstDueDate: todayInSaoPaulo(),
      successUrl: `${await siteOrigin()}/checkout/concluido`,
    });
    await admin
      .from("subscriptions")
      .update({ provider_subscription_id: subscription.id })
      .eq("id", created.id);

    invoiceUrl = await provider.pendingInvoiceUrl(subscription.id);
  } catch (error) {
    console.error("Checkout:", error);
    return {
      message:
        error instanceof PaymentError && error.message.length < 200
          ? `Não foi possível abrir o pagamento: ${error.message}`
          : "Não foi possível abrir o pagamento agora. Tente de novo em instantes.",
      values,
    };
  }

  if (!invoiceUrl)
    return {
      message:
        "A cobrança foi criada, mas o link de pagamento ainda não saiu. Tente de novo em instantes.",
      values,
    };
  redirect(invoiceUrl);
}
