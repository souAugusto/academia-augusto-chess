// Regras da partida contra o computador (lógica pura, testável).

export type Side = "w" | "b";
export type Result = "vitoria" | "derrota" | "empate"; // do ponto de vista do aluno

export type EndReason =
  | "mate"
  | "afogamento"
  | "repeticao"
  | "50-lances"
  | "material"
  | "abandono"
  | "acordo"
  | "tempo";

export type Outcome = { result: Result; reason: EndReason };

export const END_TEXT: Record<EndReason, string> = {
  mate: "Xeque-mate",
  afogamento: "Afogamento (rei sem lances e sem xeque)",
  repeticao: "Empate por repetição de posição",
  "50-lances": "Empate pela regra dos 50 lances",
  material: "Empate por material insuficiente",
  abandono: "Abandono",
  acordo: "Empate combinado",
  tempo: "Tempo esgotado",
};

// O que o chess.js informa sobre a posição atual.
export type PositionFlags = {
  isCheckmate: boolean;
  isStalemate: boolean;
  isThreefoldRepetition: boolean;
  isInsufficientMaterial: boolean;
  isDraw: boolean; // inclui a regra dos 50 lances
  turn: Side;
};

export function positionOutcome(flags: PositionFlags, player: Side): Outcome | null {
  if (flags.isCheckmate)
    return { result: flags.turn === player ? "derrota" : "vitoria", reason: "mate" };
  if (flags.isStalemate) return { result: "empate", reason: "afogamento" };
  if (flags.isThreefoldRepetition) return { result: "empate", reason: "repeticao" };
  if (flags.isInsufficientMaterial) return { result: "empate", reason: "material" };
  if (flags.isDraw) return { result: "empate", reason: "50-lances" };
  return null;
}

// Só o rei, ou rei e uma peça menor: não dá mate sozinho.
export function cannotMate(fen: string, side: Side): boolean {
  const board = fen.split(" ")[0];
  const pieces = [...board].filter((ch) =>
    side === "w" ? /[PNBRQ]/.test(ch) : /[pnbrq]/.test(ch),
  );
  if (pieces.some((p) => /[pPrRqQ]/.test(p))) return false;
  return pieces.length <= 1;
}

// Tempo de quem acabou: perde, a menos que o outro lado não consiga dar mate.
export function timeoutOutcome(fen: string, flagged: Side, player: Side): Outcome {
  const other: Side = flagged === "w" ? "b" : "w";
  if (cannotMate(fen, other)) return { result: "empate", reason: "tempo" };
  return { result: flagged === player ? "derrota" : "vitoria", reason: "tempo" };
}

// O personagem aceita o empate? `botCp` é a avaliação do ponto de vista dele.
// Aceita se está pior, ou se a partida já vai longe e está igual.
export const DRAW_RULES = { worseCp: -120, equalCp: 40, minPlies: 50, everyPlies: 10 };

export function acceptsDraw(botCp: number | null, plies: number): boolean {
  if (botCp === null) return false;
  if (botCp <= DRAW_RULES.worseCp) return true;
  return plies >= DRAW_RULES.minPlies && Math.abs(botCp) <= DRAW_RULES.equalCp;
}

// Pode oferecer empate agora? Uma oferta a cada 10 lances (meios-lances).
export function canOfferDraw(plies: number, lastOfferPly: number | null): boolean {
  if (plies < 2) return false;
  return lastOfferPly === null || plies - lastOfferPly >= DRAW_RULES.everyPlies;
}

// Estrelas de uma vitória: 1 por vencer, +1 sem desfazer, +1 sem dica.
export function starsFor(result: Result, usedUndo: boolean, usedHint: boolean): number {
  if (result !== "vitoria") return 0;
  return 1 + (usedUndo ? 0 : 1) + (usedHint ? 0 : 1);
}

// Relógio opcional.
export const CLOCKS = [
  { id: "sem", label: "Sem relógio", baseMs: 0, incMs: 0 },
  { id: "10+0", label: "10 min", baseMs: 10 * 60_000, incMs: 0 },
  { id: "5+3", label: "5 min + 3 s", baseMs: 5 * 60_000, incMs: 3_000 },
  { id: "3+2", label: "3 min + 2 s", baseMs: 3 * 60_000, incMs: 2_000 },
] as const;
export type ClockId = (typeof CLOCKS)[number]["id"];

export function formatClock(ms: number): string {
  const total = Math.max(0, Math.ceil(ms / 1000));
  const min = Math.floor(total / 60);
  const sec = total % 60;
  return `${min}:${String(sec).padStart(2, "0")}`;
}
