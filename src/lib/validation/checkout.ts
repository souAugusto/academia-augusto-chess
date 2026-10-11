import { z } from "zod";
import { isValidCpf, normalizeCpf } from "@/lib/payments/cpf";

export const checkoutSchema = z.object({
  plan: z.enum(["membro", "intensivo"], "Escolha um plano."),
  method: z.enum(["PIX", "CREDIT_CARD"], "Escolha Pix ou cartão."),
  cpf: z
    .string()
    .refine(isValidCpf, "Digite um CPF válido.")
    .transform(normalizeCpf),
});

export const waitlistSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .pipe(z.email("Digite um e-mail válido.")),
});
