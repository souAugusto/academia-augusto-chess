"use server";

import type { FormState } from "@/app/(auth)/actions";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { fieldErrors } from "@/lib/validation/auth";
import { waitlistSchema } from "@/lib/validation/checkout";

// Lista de espera do Intensivo. Tabela sem policy de aluno: grava pela service role.
export async function joinWaitlist(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const values = { email: String(formData.get("email") ?? "") };
  const parsed = waitlistSchema.safeParse(values);
  if (!parsed.success) return { errors: fieldErrors(parsed.error), values };

  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  const { error } = await createAdminClient()
    .from("waitlist")
    .upsert(
      {
        email: parsed.data.email,
        plan_id: "intensivo",
        user_id: auth.user?.id ?? null,
      },
      { onConflict: "email,plan_id", ignoreDuplicates: true },
    );
  if (error) {
    console.error("Lista de espera:", error.message);
    return {
      message: "Não foi possível entrar na lista agora. Tente de novo.",
      values,
    };
  }
  return {
    success: "Pronto! Avisamos por e-mail quando abrir uma vaga na turma.",
  };
}
