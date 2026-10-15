import { z } from "zod";
import { normalizeWhatsapp } from "./auth";

// Texto simples: sem tags HTML e sem caracteres de controle.
export function plainText(value: string): string {
  return value
    .replace(/<[^>]*>/g, "")
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .trim();
}

export const profileSchema = z.object({
  name: z
    .string()
    .transform(plainText)
    .pipe(
      z
        .string()
        .min(2, "Digite seu nome.")
        .max(80, "Use no máximo 80 caracteres."),
    ),
  bio: z
    .string()
    .transform(plainText)
    .pipe(z.string().max(160, "A bio pode ter no máximo 160 caracteres.")),
  whatsapp: z
    .string()
    .transform(normalizeWhatsapp)
    .refine(
      (digits) => digits === undefined || /^(55)?\d{10,11}$/.test(digits),
      "Digite o WhatsApp com DDD, ex.: (51) 99999-9999.",
    ),
  location: z
    .string()
    .transform(plainText)
    .pipe(
      z.union([
        z.literal(""),
        z
          .string()
          .min(2, "Digite pelo menos 2 letras, ex.: Porto Alegre, RS.")
          .max(80, "Use no máximo 80 caracteres."),
      ]),
    ),
  declaredRating: z
    .string()
    .trim()
    .transform((value) => (value === "" ? null : Number(value)))
    .pipe(
      z
        .number({ message: "Use só números, ex.: 1500." })
        .int("Use um número inteiro, ex.: 1500.")
        .min(100, "O rating vai de 100 a 3500.")
        .max(3500, "O rating vai de 100 a 3500.")
        .nullable(),
    ),
  showInRanking: z.boolean(),
});

// Senha: o Supabase aceita até 72 bytes (bcrypt).
export const passwordChangeSchema = z
  .object({
    current: z.string().min(1, "Digite sua senha atual."),
    password: z
      .string()
      .min(8, "A nova senha precisa ter pelo menos 8 caracteres.")
      .max(72, "A nova senha pode ter no máximo 72 caracteres."),
    confirm: z.string(),
  })
  .refine((data) => data.password === data.confirm, {
    message: "As senhas não são iguais.",
    path: ["confirm"],
  })
  .refine((data) => data.password !== data.current, {
    message: "A nova senha precisa ser diferente da atual.",
    path: ["password"],
  });

// Força da senha de 0 a 4 (para o indicador; não bloqueia o envio).
export function passwordStrength(password: string): 0 | 1 | 2 | 3 | 4 {
  if (password.length < 8) return 0;
  let score = 1;
  if (password.length >= 12) score++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/\d/.test(password) && /[^A-Za-z0-9]/.test(password)) score++;
  return Math.min(4, score) as 0 | 1 | 2 | 3 | 4;
}

export const DELETE_CONFIRM_WORD = "EXCLUIR";

export const AVATAR_MAX_BYTES = 2 * 1024 * 1024;
export const AVATAR_SIZE = 512;
export const AVATAR_FORMATS = ["jpeg", "png", "webp"] as const;
