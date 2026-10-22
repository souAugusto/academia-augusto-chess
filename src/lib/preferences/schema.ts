import * as z from "zod/mini";

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
  // Versão do formato. 1: até o Bloco 1 do prompt de sons e temas (temas
  // verde/azul/cinza/roxo, sons sem grupos). 2: atual. Ver migratePreferences.
  v: 2 as const,
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

// zod/mini: a mesma validação, num pacote bem menor (este arquivo vai para o
// navegador em todas as páginas, junto com as preferências).
const keep = z.catch;
const bool = (value: boolean) => keep(z.boolean(), value);

export const preferencesSchema = z.object({
  v: keep(z.literal(2), 2),
  board: keep(
    z.object({
      theme: keep(z.enum(BOARD_THEMES), d.board.theme),
      coordinates: keep(z.enum(COORDINATES), d.board.coordinates),
      lastMove: bool(d.board.lastMove),
      legalMoves: bool(d.board.legalMoves),
      animation: keep(z.enum(ANIMATION_SPEEDS), d.board.animation),
      moveMethod: keep(z.enum(MOVE_METHODS), d.board.moveMethod),
      autoQueen: bool(d.board.autoQueen),
      confirmMove: bool(d.board.confirmMove),
    }),
    d.board,
  ),
  pieces: keep(z.enum(PIECE_SETS), d.pieces),
  sound: keep(
    z.object({
      enabled: bool(d.sound.enabled),
      volume: keep(
        z.number().check(z.int(), z.minimum(0), z.maximum(100)),
        d.sound.volume,
      ),
      pack: keep(z.enum(SOUND_PACKS), d.sound.pack),
      groups: keep(
        z.object({
          lances: bool(d.sound.groups.lances),
          feedback: bool(d.sound.groups.feedback),
          interface: bool(d.sound.groups.interface),
        }),
        d.sound.groups,
      ),
      opponent: bool(d.sound.opponent),
    }),
    d.sound,
  ),
  emails: keep(
    z.object({
      lembretes: bool(d.emails.lembretes),
      novidades: bool(d.emails.novidades),
      assinatura: bool(d.emails.assinatura),
    }),
    d.emails,
  ),
});

export const MAX_PREFERENCES_BYTES = 2048;

export const PREFERENCES_VERSION = 2;

// Converte um formato antigo para o atual, sem perder a escolha do aluno:
// - temas renomeados (verde, azul, cinza, roxo) viram os equivalentes novos;
// - sons ganham grupos e a opção do adversário com os valores padrão (feito
//   abaixo, ao completar com os padrões).
// Chaves desconhecidas continuam sendo descartadas pelo esquema.
export function migratePreferences(value: object): object {
  const source = value as { v?: unknown; board?: { theme?: unknown } };
  if (source.v === PREFERENCES_VERSION) return value;
  const theme = source.board?.theme;
  return {
    ...value,
    v: PREFERENCES_VERSION,
    board:
      typeof theme === "string" && theme in LEGACY_BOARD_THEMES
        ? { ...source.board, theme: LEGACY_BOARD_THEMES[theme] }
        : source.board,
  };
}

// Lê qualquer valor (do banco, do localStorage ou do navegador) e devolve
// preferências completas, válidas e na versão atual.
export function parsePreferences(value: unknown): Preferences {
  const source = migratePreferences(
    value && typeof value === "object" && !Array.isArray(value) ? value : {},
  );
  const filled = {
    ...source,
    board: { ...d.board, ...((source as { board?: object }).board ?? {}) },
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
