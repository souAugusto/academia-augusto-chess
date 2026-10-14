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
  showInRanking: z.boolean(),
});

export const AVATAR_MAX_BYTES = 2 * 1024 * 1024;
export const AVATAR_SIZE = 256;
export const AVATAR_FORMATS = ["jpeg", "png", "webp"] as const;
