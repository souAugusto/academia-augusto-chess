"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import {
  formObject,
  requireAdmin,
  zodMessage,
  type AdminState,
} from "@/lib/data/admin";
import { createAdminClient } from "@/lib/supabase/admin";
import { planSchema } from "@/lib/validation/admin";

// Preço vale para assinaturas novas. As já criadas no Asaas seguem com o valor antigo.
export async function updatePlan(
  _prev: AdminState,
  formData: FormData,
): Promise<AdminState> {
  await requireAdmin();
  const parsed = planSchema.safeParse(
    formObject(formData, ["id", "priceReais", "seatLimit"]),
  );
  if (!parsed.success) return { message: zodMessage(parsed.error) };
  const { id, priceReais, seatLimit } = parsed.data;
  const { error } = await createAdminClient()
    .from("plans")
    .update({ price_cents: priceReais, seat_limit: seatLimit })
    .eq("id", id);
  if (error) return { message: error.message };
  revalidatePath("/", "layout");
  return { success: "Plano atualizado." };
}

export async function removeFromWaitlist(
  _prev: AdminState,
  formData: FormData,
): Promise<AdminState> {
  await requireAdmin();
  const parsed = z
    .object({ id: z.uuid() })
    .safeParse(formObject(formData, ["id"]));
  if (!parsed.success) return { message: "Item inválido." };
  const { error } = await createAdminClient()
    .from("waitlist")
    .delete()
    .eq("id", parsed.data.id);
  if (error) return { message: error.message };
  revalidatePath("/admin/planos");
  return { success: "Removido." };
}
