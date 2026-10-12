import { validateFen } from "chess.js";
import { z } from "zod";
import { youtubeId } from "@/lib/video";

// Formulários do painel admin. Tudo validado no servidor antes de gravar.

const title = z
  .string()
  .trim()
  .min(2, "Escreva um título.")
  .max(120, "Use no máximo 120 caracteres.");

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max, `Use no máximo ${max} caracteres.`)
    .transform((value) => value || null);

const slug = z
  .string()
  .trim()
  .toLowerCase()
  .regex(/^[a-z0-9-]{2,60}$/, "Use letras minúsculas, números e hífen.");

const position = z.coerce
  .number()
  .int()
  .min(0, "Use 0 ou mais.")
  .max(999)
  .default(0);

// Checkbox: marcado manda "on"; desmarcado não manda nada.
const checkbox = z
  .string()
  .optional()
  .transform((value) => value === "on");

const planRequired = z.coerce
  .number()
  .int()
  .refine((value) => value === 1 || value === 2, "Escolha o plano.");

const fen = z
  .string()
  .trim()
  .refine((value) => validateFen(value).ok, "FEN inválida.");

export const courseSchema = z.object({
  title,
  description: optionalText(1000),
  planRequired,
  position,
  isPublished: checkbox,
});

export const moduleSchema = z.object({
  courseId: z.uuid(),
  title,
  position,
});

export const lessonSchema = z.object({
  title,
  description: optionalText(4000),
  video: z
    .string()
    .trim()
    .transform((value, ctx) => {
      if (!value) return null;
      const id = youtubeId(value);
      if (!id) {
        ctx.addIssue({
          code: "custom",
          message: "Cole o link ou o código do vídeo do YouTube.",
        });
        return z.NEVER;
      }
      return id;
    }),
  fen: z
    .string()
    .trim()
    .refine((value) => !value || validateFen(value).ok, "FEN inválida.")
    .transform((value) => value || null),
  pgn: optionalText(20000),
  category: z.enum(["regular", "mestre"]),
  position,
  isPublished: checkbox,
});

export const endgameSchema = z.object({
  slug,
  title,
  description: optionalText(2000),
  category: z.string().trim().min(2, "Escreva a categoria.").max(60),
  level: z.coerce.number().int().min(1).max(3),
  fen,
  userColor: z.enum(["white", "black"]),
  goal: z.enum(["win", "draw"]),
  maxMoves: z.coerce
    .number()
    .int()
    .min(5, "Mínimo de 5 lances.")
    .max(150, "Máximo de 150 lances."),
  planRequired,
  position,
  isPublished: checkbox,
});

export const repertoireSchema = z.object({
  slug,
  title,
  description: optionalText(2000),
  color: z.enum(["white", "black"]),
  planRequired,
  position,
  isPublished: checkbox,
});

export const planSchema = z.object({
  id: z.enum(["membro", "intensivo"]),
  priceReais: z.coerce
    .number()
    .min(1, "Preço mínimo de R$ 1.")
    .max(10000)
    .transform((value) => Math.round(value * 100)),
  seatLimit: z
    .string()
    .trim()
    .transform((value) => (value === "" ? null : Number(value)))
    .refine(
      (value) =>
        value === null ||
        (Number.isInteger(value) && value >= 1 && value <= 500),
      "Use um número inteiro, ou deixe vazio para sem limite.",
    ),
});

export const grantSchema = z.object({
  userId: z.uuid(),
  planId: z.enum(["membro", "intensivo"]),
  until: z
    .string()
    .trim()
    .refine(
      (value) => !value || /^\d{4}-\d{2}-\d{2}$/.test(value),
      "Data inválida.",
    )
    .transform((value) =>
      value ? new Date(`${value}T23:59:59-03:00`).toISOString() : null,
    ),
});

export const liveSchema = z.object({
  title,
  startsAt: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/, "Escolha data e hora.")
    .transform((value) => new Date(`${value}:00-03:00`).toISOString()),
  url: z
    .string()
    .trim()
    .refine(
      (value) => !value || /^https:\/\/\S+$/.test(value),
      "Use um link que comece com https://",
    )
    .transform((value) => value || null),
  audience: z.enum(["public", "membro", "intensivo"]),
});

export const SETTING_KEYS = [
  "whatsapp_membros_url",
  "whatsapp_intensivo_url",
] as const;

export const settingsSchema = z.object({
  whatsapp_membros_url: z
    .string()
    .trim()
    .refine(
      (value) => !value || /^https:\/\/chat\.whatsapp\.com\/\S+$/.test(value),
      "Use o link de convite do grupo (https://chat.whatsapp.com/...).",
    ),
  whatsapp_intensivo_url: z
    .string()
    .trim()
    .refine(
      (value) => !value || /^https:\/\/chat\.whatsapp\.com\/\S+$/.test(value),
      "Use o link de convite do grupo (https://chat.whatsapp.com/...).",
    ),
});

export const dailySchema = z.object({
  day: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  puzzleId: z
    .string()
    .trim()
    .regex(
      /^[A-Za-z0-9]{5}$/,
      "O código do puzzle do Lichess tem 5 letras/números.",
    ),
});

// Códigos de puzzle do Lichess separados por espaço, vírgula ou linha
// (aceita também o link lichess.org/training/código).
export function parsePuzzleIds(text: string): string[] {
  const ids = text
    .split(/[\s,;]+/)
    .map((token) => token.trim().replace(/^.*\/training\//, ""))
    .filter((token) => /^[A-Za-z0-9]{5}$/.test(token));
  return [...new Set(ids)];
}

export const officialSetSchema = z.object({
  name: z.string().trim().min(2, "Escreva o nome do conjunto.").max(80),
  description: optionalText(500),
  position,
  puzzleIds: z
    .string()
    .transform(parsePuzzleIds)
    .refine((ids) => ids.length >= 3, "Cole pelo menos 3 códigos de puzzle.")
    .refine((ids) => ids.length <= 200, "Use no máximo 200 puzzles."),
});

export const trailSchema = z.object({
  slug,
  title,
  description: optionalText(1000),
  planRequired,
  position,
  isPublished: checkbox,
});

export const STEP_KINDS = ["lesson", "repertoire", "endgame", "set"] as const;

// O select manda "tipo:id" (ex.: "lesson:3f2c...").
export const stepSchema = z.object({
  trailId: z.uuid(),
  ref: z
    .string()
    .regex(
      /^(lesson|repertoire|endgame|set):[0-9a-f-]{36}$/i,
      "Escolha a etapa.",
    )
    .transform((value) => {
      const [kind, id] = value.split(":");
      return { kind: kind as (typeof STEP_KINDS)[number], id };
    }),
  title: z.string().trim().max(120).optional().default(""),
  position,
});
