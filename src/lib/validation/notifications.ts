import { z } from "zod";

// Notificações do admin. Texto puro: a tela mostra como texto (o React escapa
// tudo), sem HTML. Tira caracteres de controle e limita o tamanho.
import {
  NOTIFICATION_AUDIENCES,
  NOTIFICATION_KINDS,
} from "./notifications-labels";

export {
  AUDIENCE_LABELS,
  KIND_LABELS,
  NOTIFICATION_AUDIENCES,
  NOTIFICATION_KINDS,
} from "./notifications-labels";

export const MAX_TITLE = 120;
export const MAX_BODY = 1000;

// Remove caracteres de controle (exceto quebra de linha) e espaços sobrando.
export function cleanText(value: string): string {
  return value
    .replace(/\r\n?/g, "\n")
    .replace(/[\u0000-\u0009\u000B-\u001F\u007F]/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

// Link: caminho do próprio site ("/aulas") ou endereço https completo.
export function isSafeLink(value: string): boolean {
  if (/^\/[A-Za-z0-9]/.test(value)) return !value.startsWith("//");
  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
}

export const notificationSchema = z
  .object({
    title: z
      .string()
      .transform(cleanText)
      .pipe(
        z
          .string()
          .min(1, "Escreva um título.")
          .max(MAX_TITLE, `Título com até ${MAX_TITLE} caracteres.`),
      ),
    body: z
      .string()
      .transform(cleanText)
      .pipe(
        z
          .string()
          .min(1, "Escreva a mensagem.")
          .max(MAX_BODY, `Mensagem com até ${MAX_BODY} caracteres.`),
      ),
    kind: z.enum(NOTIFICATION_KINDS, "Escolha o tipo."),
    link: z
      .string()
      .trim()
      .max(300, "Link muito longo.")
      .refine((v) => v === "" || isSafeLink(v), {
        message: "O link deve começar com / (página do site) ou https://.",
      })
      .transform((v) => (v === "" ? null : v)),
    audience: z.enum(NOTIFICATION_AUDIENCES, "Escolha quem recebe."),
    targetEmail: z.string().trim().toLowerCase(),
    // Data (AAAA-MM-DD): vale até o fim desse dia, no horário de Brasília.
    expiresOn: z
      .string()
      .trim()
      .refine((v) => v === "" || /^\d{4}-\d{2}-\d{2}$/.test(v), {
        message: "Data de expiração inválida.",
      }),
  })
  .superRefine((value, ctx) => {
    if (
      value.audience === "usuario" &&
      !z.email().safeParse(value.targetEmail).success
    )
      ctx.addIssue({
        code: "custom",
        message: "Informe o e-mail do aluno.",
        path: ["targetEmail"],
      });
  });

// Fim do dia em Brasília (UTC-3, sem horário de verão desde 2019).
export function endOfDaySaoPaulo(date: string): string {
  return new Date(`${date}T23:59:59-03:00`).toISOString();
}
