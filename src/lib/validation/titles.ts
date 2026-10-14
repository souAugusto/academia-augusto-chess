import { z } from "zod";

// Títulos oficiais da FIDE e da federação não podem ser usados na escada:
// confundiriam o aluno (o rating tático não é rating oficial).
const OFFICIAL = [
  /grande\s*mestre/i,
  /mestre\s*(internacional|fide|nacional|candidato)/i,
  /candidat[oa]\s*a\s*mestre/i,
  /\b(w?gm|w?im|w?fm|w?cm)\b/i,
  /[aá]rbitro/i,
];

export const titleSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Nome muito curto.")
    .max(40, "Use no máximo 40 caracteres.")
    .refine(
      (name) => !OFFICIAL.some((re) => re.test(name)),
      "Não use títulos oficiais da FIDE ou da federação.",
    ),
  minRating: z.coerce
    .number()
    .int("Use um número inteiro.")
    .min(0, "Mínimo 0.")
    .max(4000, "Máximo 4000."),
  tagline: z.string().trim().max(120, "Frase com no máximo 120 caracteres."),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Cor no formato #RRGGBB."),
});

export function slugify(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40);
}
