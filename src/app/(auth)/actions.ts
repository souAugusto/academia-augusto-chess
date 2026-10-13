"use server";

import { redirect } from "next/navigation";
import { siteOrigin } from "@/lib/origin";
import { HOME_LOGGED_IN, safeNextPath } from "@/lib/routes";
import { createClient } from "@/lib/supabase/server";
import {
  emailOnlySchema,
  fieldErrors,
  loginSchema,
  newPasswordSchema,
  signupSchema,
  type FieldErrors,
} from "@/lib/validation/auth";

export type FormState = {
  errors?: FieldErrors;
  message?: string; // erro geral
  success?: string; // confirmação (ex.: e-mail enviado)
  values?: Record<string, string>; // devolve o que foi digitado (nunca a senha)
};

const PLANOS = "/planos";
// Conta nova: questionário de estilo (pode pular) e depois os planos.
const ONBOARDING = `/questionario?next=${encodeURIComponent(PLANOS)}`;

function text(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

function confirmUrl(origin: string, next: string): string {
  return `${origin}/auth/confirm?next=${encodeURIComponent(next)}`;
}

export async function login(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const values = { email: text(formData, "email") };
  const parsed = loginSchema.safeParse({
    ...values,
    password: text(formData, "password"),
  });
  if (!parsed.success) return { errors: fieldErrors(parsed.error), values };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) {
    if (error.code === "email_not_confirmed") {
      return {
        message:
          "Confirme seu e-mail antes de entrar. Procure o link que enviamos (veja também o spam).",
        values,
      };
    }
    return { message: "E-mail ou senha incorretos.", values };
  }
  redirect(safeNextPath(text(formData, "next"), HOME_LOGGED_IN));
}

export async function signup(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const values = {
    name: text(formData, "name"),
    email: text(formData, "email"),
    whatsapp: text(formData, "whatsapp"),
  };
  const parsed = signupSchema.safeParse({
    ...values,
    password: text(formData, "password"),
    terms: formData.get("terms") ?? undefined,
  });
  if (!parsed.success) return { errors: fieldErrors(parsed.error), values };

  const { name, email, whatsapp, password } = parsed.data;
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name, whatsapp: whatsapp ?? "", terms_accepted: true },
      emailRedirectTo: confirmUrl(await siteOrigin(), ONBOARDING),
    },
  });
  if (error) {
    if (error.code === "weak_password") {
      return { errors: { password: "Escolha uma senha mais forte." }, values };
    }
    if (error.code === "over_email_send_rate_limit") {
      return {
        message:
          "Muitos cadastros em pouco tempo. Tente de novo em alguns minutos.",
        values,
      };
    }
    return {
      message: "Não foi possível criar a conta agora. Tente de novo.",
      values,
    };
  }

  // Confirmação de e-mail desligada no Supabase: já entra e segue para o questionário.
  if (data.session) redirect(ONBOARDING);

  // Mesma resposta para e-mail novo ou já cadastrado (não revela quem tem conta).
  return {
    success: `Enviamos um link de confirmação para ${email}. Abra o e-mail para ativar a conta e escolher seu plano.`,
  };
}

export async function signInWithGoogle(formData: FormData): Promise<void> {
  const next = safeNextPath(text(formData, "next"), PLANOS);
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: confirmUrl(await siteOrigin(), next) },
  });
  if (error || !data.url) redirect("/entrar?erro=google");
  redirect(data.url);
}

export async function requestPasswordReset(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const values = { email: text(formData, "email") };
  const parsed = emailOnlySchema.safeParse(values);
  if (!parsed.success) return { errors: fieldErrors(parsed.error), values };

  const supabase = await createClient();
  await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: confirmUrl(await siteOrigin(), "/redefinir-senha"),
  });
  // Mesma resposta exista ou não a conta.
  return {
    success: `Se houver uma conta com ${parsed.data.email}, você vai receber um link para criar uma nova senha.`,
  };
}

export async function updatePassword(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const parsed = newPasswordSchema.safeParse({
    password: text(formData, "password"),
    confirm: text(formData, "confirm"),
  });
  if (!parsed.success) return { errors: fieldErrors(parsed.error) };

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({
    password: parsed.data.password,
  });
  if (error) {
    if (error.code === "same_password") {
      return { errors: { password: "Use uma senha diferente da atual." } };
    }
    return {
      message:
        "Não foi possível trocar a senha. Peça um novo link e tente de novo.",
    };
  }
  redirect(`${HOME_LOGGED_IN}?senha=alterada`);
}

export async function signOut(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
