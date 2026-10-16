import { z } from "zod";

// Preferências de tabuleiro, peças e sons. Ficam em profiles.preferences (jsonb,
// até 2 KB) para quem está logado e no localStorage para visitantes e como cache.
// Cada campo tem lista fechada; valor inválido volta ao padrão e chave
// desconhecida é descartada.

export const BOARD_THEMES = [
  "finale",
  "esmeralda",
  "oceano",
  "coral",
  "uva",
  "limao",
  "rosa",
  "madeira",
  "concreto",
  "meianoite",
  "contraste",
] as const;

// Temas antigos que mudaram de nome: a escolha do aluno é convertida sozinha.
export const LEGACY_BOARD_THEMES: Record<string, (typeof BOARD_THEMES)[number]> = {
  verde: "esmeralda",
  azul: "oceano",
  cinza: "concreto",
  roxo: "uva",
};
export const COORDINATES = ["dentro", "margem", "ocultas"] as const;
export const ANIMATION_SPEEDS = [
  "desligada",
  "rapida",
  "normal",
  "lenta",
] as const;
export const MOVE_METHODS = ["ambos", "arrastar", "clicar"] as const;
export const PIECE_SETS = [
  "cburnett",
  "colorido",
  "chessnut",
  "fantasy",
  "spatial",
] as const;
// "engracado" nunca é o padrão; "vibracao" só aparece onde o aparelho vibra.
export const SOUND_PACKS = [
  "suave",
  "madeira",
  "oco",
  "arcade",
  "engracado",
  "vibracao",
] as const;

export type BoardTheme = (typeof BOARD_THEMES)[number];
export type Coordinates = (typeof COORDINATES)[number];
export type AnimationSpeed = (typeof ANIMATION_SPEEDS)[number];
export type MoveMethod = (typeof MOVE_METHODS)[number];
export type PieceSet = (typeof PIECE_SETS)[number];
export type SoundPack = (typeof SOUND_PACKS)[number];

export const DEFAULT_PREFERENCES = {
  v: 1 as const,
  board: {
    theme: "finale" as BoardTheme,
    coordinates: "dentro" as Coordinates,
    lastMove: true,
    legalMoves: true,
    animation: "normal" as AnimationSpeed,
    moveMethod: "ambos" as MoveMethod,
    autoQueen: false,
    confirmMove: false,
  },
  pieces: "cburnett" as PieceSet,
  sound: {
    enabled: true,
    volume: 50,
    pack: "suave" as SoundPack,
    // Grupos: lances (movimento, captura...), feedback (certo, errado,
    // título) e interface (cliques). Interface começa desligada.
    groups: { lances: true, feedback: true, interface: false },
    opponent: true, // tocar o som do lance do adversário
  },
  // E-mails que o aluno aceita receber (guardado mesmo antes de o site enviar).
  emails: { lembretes: true, novidades: false, assinatura: true },
};

export type Preferences = typeof DEFAULT_PREFERENCES;

const d = DEFAULT_PREFERENCES;

export const preferencesSchema = z.object({
  v: z.literal(1).catch(1),
  board: z
    .object({
      theme: z.enum(BOARD_THEMES).catch(d.board.theme),
      coordinates: z.enum(COORDINATES).catch(d.board.coordinates),
      lastMove: z.boolean().catch(d.board.lastMove),
      legalMoves: z.boolean().catch(d.board.legalMoves),
      animation: z.enum(ANIMATION_SPEEDS).catch(d.board.animation),
      moveMethod: z.enum(MOVE_METHODS).catch(d.board.moveMethod),
      autoQueen: z.boolean().catch(d.board.autoQueen),
      confirmMove: z.boolean().catch(d.board.confirmMove),
    })
    .catch(d.board),
  pieces: z.enum(PIECE_SETS).catch(d.pieces),
  sound: z
    .object({
      enabled: z.boolean().catch(d.sound.enabled),
      volume: z.number().int().min(0).max(100).catch(d.sound.volume),
      pack: z.enum(SOUND_PACKS).catch(d.sound.pack),
      groups: z
        .object({
          lances: z.boolean().catch(d.sound.groups.lances),
          feedback: z.boolean().catch(d.sound.groups.feedback),
          interface: z.boolean().catch(d.sound.groups.interface),
        })
        .catch(d.sound.groups),
      opponent: z.boolean().catch(d.sound.opponent),
    })
    .catch(d.sound),
  emails: z
    .object({
      lembretes: z.boolean().catch(d.emails.lembretes),
      novidades: z.boolean().catch(d.emails.novidades),
      assinatura: z.boolean().catch(d.emails.assinatura),
    })
    .catch(d.emails),
});

export const MAX_PREFERENCES_BYTES = 2048;

// Lê qualquer valor (do banco, do localStorage ou do navegador) e devolve
// preferências completas e válidas.
export function parsePreferences(value: unknown): Preferences {
  const source =
    value && typeof value === "object" && !Array.isArray(value) ? value : {};
  const filled = {
    ...source,
    board: (() => {
      const board: Record<string, unknown> = {
        ...d.board,
        ...((source as { board?: object }).board ?? {}),
      };
      const theme = board.theme;
      if (typeof theme === "string" && theme in LEGACY_BOARD_THEMES)
        board.theme = LEGACY_BOARD_THEMES[theme];
      return board;
    })(),
    sound: (() => {
      const sound = (source as { sound?: { groups?: object } }).sound ?? {};
      return {
        ...d.sound,
        ...sound,
        groups: { ...d.sound.groups, ...(sound.groups ?? {}) },
      };
    })(),
    emails: { ...d.emails, ...((source as { emails?: object }).emails ?? {}) },
  };
  return preferencesSchema.parse(filled) as Preferences;
}

// Preferências vazias no banco ({}) significam "nunca salvou".
export function isEmptyPreferences(value: unknown): boolean {
  return (
    !value ||
    (typeof value === "object" && Object.keys(value as object).length === 0)
  );
}

export function preferencesSize(prefs: Preferences): number {
  return new TextEncoder().encode(JSON.stringify(prefs)).length;
}
