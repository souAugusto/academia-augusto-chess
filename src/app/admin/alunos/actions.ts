"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import {
  formObject,
  requireAdmin,
  zodMessage,
  type AdminState,
} from "@/lib/data/admin";
import { getPaymentProvider } from "@/lib/payments";
import { createAdminClient } from "@/lib/supabase/admin";
import { grantSchema } from "@/lib/validation/admin";

// Escritas em subscriptions só pela service role (CLAUDE.md, regra 4).

export async function grantPlan(
  _prev: AdminState,
  formData: FormData,
): Promise<AdminState> {
  await requireAdmin();
  const parsed = grantSchema.safeParse(
    formObject(formData, ["userId", "planId", "until"]),
  );
  if (!parsed.success) return { message: zodMessage(parsed.error) };
  const { userId, planId, until } = parsed.data;

  const admin = createAdminClient();
  const { data: current } = await admin
    .from("subscriptions")
    .select("id")
    .eq("user_id", userId)
    .eq("source", "manual")
    .in("status", ["active", "trialing", "past_due"])
    .maybeSingle();
  const values = {
    plan_id: planId,
    status: "active",
    current_period_end: until,
    cancel_at_period_end: false,
    updated_at: new Date().toISOString(),
  };
  const { error } = current
    ? await admin.from("subscriptions").update(values).eq("id", current.id)
    : await admin
        .from("subscriptions")
        .insert({ ...values, user_id: userId, source: "manual" });
  if (error) return { message: `Não foi possível salvar: ${error.message}` };
  revalidatePath("/admin/alunos");
  return { success: "Acesso concedido." };
}

const idSchema = z.object({ subscriptionId: z.uuid() });

export async function revokeGrant(
  _prev: AdminState,
  formData: FormData,
): Promise<AdminState> {
  await requireAdmin();
  const parsed = idSchema.safeParse(formObject(formData, ["subscriptionId"]));
  if (!parsed.success) return { message: "Assinatura inválida." };
  const { error } = await createAdminClient()
    .from("subscriptions")
    .update({
      status: "canceled",
      current_period_end: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", parsed.data.subscriptionId)
    .eq("source", "manual");
  if (error) return { message: error.message };
  revalidatePath("/admin/alunos");
  return { success: "Concessão encerrada." };
}

// Para a renovação de uma assinatura paga. O aluno mantém o acesso até o fim do período.
export async function stopRenewal(
  _prev: AdminState,
  formData: FormData,
): Promise<AdminState> {
  await requireAdmin();
  const parsed = idSchema.safeParse(formObject(formData, ["subscriptionId"]));
  if (!parsed.success) return { message: "Assinatura inválida." };
  const admin = createAdminClient();
  const { data: row } = await admin
    .from("subscriptions")
    .select("id, status, provider_subscription_id")
    .eq("id", parsed.data.subscriptionId)
    .eq("source", "asaas")
    .maybeSingle();
  if (!row?.provider_subscription_id)
    return { message: "Assinatura não encontrada." };
  try {
    await getPaymentProvider().cancelSubscription(row.provider_subscription_id);
  } catch (error) {
    return {
      message: error instanceof Error ? error.message : "Falha no Asaas.",
    };
  }
  await admin
    .from("subscriptions")
    .update(
      row.status === "incomplete"
        ? { status: "canceled", updated_at: new Date().toISOString() }
        : { cancel_at_period_end: true, updated_at: new Date().toISOString() },
    )
    .eq("id", row.id);
  revalidatePath("/admin/alunos");
  return { success: "Renovação cancelada." };
}
