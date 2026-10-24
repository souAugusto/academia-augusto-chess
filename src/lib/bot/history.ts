import { Chess } from "chess.js";
import { gameFromUcis, MAX_PLIES } from "@/lib/analysis/pgn";
import { BUSINESS_TIME_ZONE } from "@/lib/format";
import { CLOCKS, type ClockId, type EndReason, type Result, type Side } from "./game";
import type { MoveMark } from "./review";

// Histórico de partidas contra o computador (lógica pura, testável).
// Visitante: últimas partidas no aparelho. Com conta: no banco (0022).

export type MarkCode = 1 | 2 | 3; // imprecisão, erro, erro grave
export const MARK_CODES: Record<Exclude<MoveMark, null>, MarkCode> = {
  imprecisao: 1,
  erro: 2,
  "erro-grave": 3,
};
export const CODE_MARKS: Record<MarkCode, Exclude<MoveMark, null>> = {
  1: "imprecisao",
  2: "erro",
  3: "erro-grave",
};

export type BotGameRecord = {
  id: string; // uuid criado no aparelho (evita duplicar ao juntar com a conta)
  botId: string;
  color: Side; // cor do aluno
  result: Result;
  reason: EndReason;
  stars: number;
  accuracy: number | null;
  moves: string[]; // UCI
  marks: [number, MarkCode][]; // [meio-lance, marca] dos lances do aluno
  clock: ClockId;
  playedAt: string; // ISO
};

export const STORAGE_GAMES = "finale:jogar:partidas";
export const MAX_LOCAL_GAMES = 20;
export const MAX_ACCOUNT_GAMES = 200;

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
const UCI = /^[a-h][1-8][a-h][1-8][qrbn]?$/;
const RESULTS = ["vitoria", "derrota", "empate"];
const REASONS = ["mate", "afogamento", "repeticao", "50-lances", "material", "abandono", "acordo", "tempo"];
const CLOCK_IDS: string[] = CLOCKS.map((c) => c.id);

// Confere uma partida (do aparelho ou enviada ao servidor): formato, lances
// legais e coerência do mate. Devolve null se algo não bate.
export function validateGame(raw: unknown, validBots: string[]): BotGameRecord | null {
  if (!raw || typeof raw !== "object") return null;
  const g = raw as Record<string, unknown>;
  if (typeof g.id !== "string" || !UUID.test(g.id)) return null;
  if (typeof g.botId !== "string" || !validBots.includes(g.botId)) return null;
  if (g.color !== "w" && g.color !== "b") return null;
  if (typeof g.result !== "string" || !RESULTS.includes(g.result)) return null;
  if (typeof g.reason !== "string" || !REASONS.includes(g.reason)) return null;
  if (typeof g.stars !== "number" || !Number.isInteger(g.stars) || g.stars < 0 || g.stars > 3)
    return null;
  if (g.result !== "vitoria" && g.stars !== 0) return null;
  const accuracy =
    g.accuracy === null || g.accuracy === undefined
      ? null
      : typeof g.accuracy === "number" && Number.isInteger(g.accuracy) && g.accuracy >= 0 && g.accuracy <= 100
        ? g.accuracy
        : undefined;
  if (accuracy === undefined) return null;
  if (!Array.isArray(g.moves) || g.moves.length > MAX_PLIES) return null;
  if (!g.moves.every((m) => typeof m === "string" && UCI.test(m))) return null;
  const moves = g.moves as string[];
  if (moves.length > 0) {
    const replay = gameFromUcis(moves);
    if (!replay || replay.sans.length !== moves.length) return null;
    if (g.reason === "mate" && replay.ending !== "mate") return null;
  } else if (g.reason !== "abandono" && g.reason !== "tempo") return null;
  if (!Array.isArray(g.marks) || g.marks.length > MAX_PLIES) return null;
  const marks: [number, MarkCode][] = [];
  for (const item of g.marks) {
    if (!Array.isArray(item) || item.length !== 2) return null;
    const [ply, code] = item;
    if (!Number.isInteger(ply) || ply < 0 || ply >= moves.length) return null;
    if (code !== 1 && code !== 2 && code !== 3) return null;
    marks.push([ply, code]);
  }
  if (typeof g.clock !== "string" || !CLOCK_IDS.includes(g.clock)) return null;
  if (typeof g.playedAt !== "string" || Number.isNaN(Date.parse(g.playedAt))) return null;
  return {
    id: g.id,
    botId: g.botId,
    color: g.color,
    result: g.result as Result,
    reason: g.reason as EndReason,
    stars: g.stars,
    accuracy,
    moves,
    marks,
    clock: g.clock as ClockId,
    playedAt: new Date(g.playedAt).toISOString(),
  };
}

export function parseLocalGames(raw: unknown, validBots: string[]): BotGameRecord[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .slice(0, MAX_LOCAL_GAMES)
    .map((item) => validateGame(item, validBots))
    .filter((game): game is BotGameRecord => game !== null);
}

// A mais nova primeiro; passou do limite, a mais antiga sai.
export function addLocalGame(list: BotGameRecord[], game: BotGameRecord): BotGameRecord[] {
  return [game, ...list.filter((item) => item.id !== game.id)].slice(0, MAX_LOCAL_GAMES);
}

const PGN_RESULT = (game: BotGameRecord) =>
  game.result === "empate" ? "1/2-1/2" : (game.result === "vitoria") === (game.color === "w") ? "1-0" : "0-1";

// Data no formato do PGN (AAAA.MM.DD), no fuso de São Paulo.
function pgnDate(iso: string): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: BUSINESS_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(iso));
  return parts.replaceAll("-", ".");
}

export function gamePgn(game: BotGameRecord, botName: string, playerName = "Você"): string {
  const chess = new Chess();
  chess.setHeader("Event", "Academia Finale: jogar contra o computador");
  chess.setHeader("Site", "academiafinale.site");
  chess.setHeader("Date", pgnDate(game.playedAt));
  chess.setHeader("White", game.color === "w" ? playerName : botName);
  chess.setHeader("Black", game.color === "w" ? botName : playerName);
  chess.setHeader("Result", PGN_RESULT(game));
  for (const uci of game.moves)
    chess.move({ from: uci.slice(0, 2), to: uci.slice(2, 4), promotion: uci[4] });
  return chess.pgn();
}
