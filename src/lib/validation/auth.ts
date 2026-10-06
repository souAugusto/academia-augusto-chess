import { z } from "zod";

// Senha: o Supabase aceita até 72 bytes (bcrypt).
const password = z
  .string()
  .min(8, "A senha precisa ter pelo menos 8 caracteres.")
  .max(72, "A senha pode ter no máximo 72 caracteres.");

const email = z
  .string()
  .trim()
  .toLowerCase()
  .pipe(z.email("Digite um e-mail válido."));

// Aceita "(51) 99999-9999", "51999999999" ou "+55 51 99999-9999".
// Guarda só os dígitos; vazio vira undefined (campo opcional).
export function normalizeWhatsapp(value: string): string | undefined {
  const digits = value.replace(/\D/g, "");
  return digits === "" ? undefined : digits;
}

const whatsapp = z
  .string()
  .transform(normalizeWhatsapp)
  .refine(
    (digits) => digits === undefined || /^(55)?\d{10,11}$/.test(digits),
    "Digite o WhatsApp com DDD, ex.: (51) 99999-9999.",
  );

export const loginSchema = z.object({
  email,
  password: z.string().min(1, "Digite sua senha."),
});

export const signupSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Digite seu nome.")
    .max(80, "Use no máximo 80 caracteres."),
  email,
  whatsapp,
  password,
  terms: z.literal(
    "on",
    "Para criar a conta, aceite os Termos e a Política de privacidade.",
  ),
});

export const emailOnlySchema = z.object({ email });

export const newPasswordSchema = z
  .object({ password, confirm: z.string() })
  .refine((data) => data.password === data.confirm, {
    message: "As senhas não são iguais.",
    path: ["confirm"],
  });

export type FieldErrors = Partial<Record<string, string>>;

// Primeiro erro de cada campo, no formato que os formulários exibem.
export function fieldErrors(error: z.ZodError): FieldErrors {
  const errors: FieldErrors = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    errors[key] ??= issue.message;
  }
  return errors;
}
