// Partidas do Chess.com e do Lichess num formato único (só dados diretos, sem motor).

export type Platform = "chesscom" | "lichess";
export type GameResult = "win" | "draw" | "loss";
export type TimeClass =
  "bullet" | "blitz" | "rapid" | "classical" | "correspondence";
export type EndReason =
  | "mate"
  | "resign"
  | "timeout"
  | "abandoned"
  | "stalemate"
  | "agreement"
  | "repetition"
  | "insufficient"
  | "fifty_moves"
  | "timeout_insufficient"
  | "other";

export type NormalizedGame = {
  platform: Platform;
  externalId: string;
  playedAt: string; // ISO
  color: "white" | "black";
  result: GameResult;
  endReason: EndReason;
  timeControl: string | null;
  timeClass: TimeClass;
  userRating: number | null;
  opponentRating: number | null;
  openingName: string | null;
  eco: string | null;
  moves: number | null;
};

export const END_REASON_LABELS: Record<EndReason, string> = {
  mate: "Xeque-mate",
  resign: "Abandono",
  timeout: "Tempo",
  abandoned: "Saiu da partida",
  stalemate: "Afogamento",
  agreement: "Empate combinado",
  repetition: "Repetição",
  insufficient: "Material insuficiente",
  fifty_moves: "Regra dos 50 lances",
  timeout_insufficient: "Tempo sem material para mate",
  other: "Outro",
};

export const TIME_CLASS_LABELS: Record<TimeClass, string> = {
  bullet: "Bullet",
  blitz: "Blitz",
  rapid: "Rápida",
  classical: "Clássica",
  correspondence: "Por correspondência",
};

export const PLATFORM_LABELS: Record<Platform, string> = {
  chesscom: "Chess.com",
  lichess: "Lichess",
};

// ---------------------------------------------------------------------------
// Chess.com: GET /pub/player/{username}/games/{AAAA}/{MM}
// ---------------------------------------------------------------------------

type ChessComSide = { username: string; rating?: number; result: string };
export type ChessComGame = {
  url?: string;
  uuid?: string;
  pgn?: string;
  time_control?: string;
  time_class?: string;
  end_time?: number;
  rules?: string;
  eco?: string;
  white: ChessComSide;
  black: ChessComSide;
};

const CHESSCOM_REASON: Record<string, EndReason> = {
  checkmated: "mate",
  resigned: "resign",
  timeout: "timeout",
  abandoned: "abandoned",
  stalemate: "stalemate",
  agreed: "agreement",
  repetition: "repetition",
  insufficient: "insufficient",
  "50move": "fifty_moves",
  timevsinsufficient: "timeout_insufficient",
};

const CHESSCOM_CLASS: Record<string, TimeClass> = {
  bullet: "bullet",
  blitz: "blitz",
  rapid: "rapid",
  daily: "correspondence",
};

// Número de lances (completos) a partir do PGN: o maior "N." do texto.
export function countPgnMoves(pgn: string): number | null {
  const body = pgn.replace(/\[[^\]]*\]/g, " ").replace(/\{[^}]*\}/g, " ");
  let max = 0;
  for (const match of body.matchAll(/(\d+)\.(?!\.)/g)) {
    max = Math.max(max, Number(match[1]));
  }
  return max || null;
}

function pgnHeader(pgn: string, name: string): string | null {
  return new RegExp(`\\[${name} "([^"]*)"\\]`).exec(pgn)?.[1] ?? null;
}

// "https://www.chess.com/openings/Closed-Sicilian-Defense-Grand-Prix-Attack-3...g6"
// -> "Closed Sicilian Defense Grand Prix Attack"
export function chessComOpeningName(ecoUrl: string | undefined): string | null {
  if (!ecoUrl) return null;
  const slug = ecoUrl.split("/openings/")[1];
  if (!slug) return null;
  const name = decodeURIComponent(slug)
    .split(/-\d+\./)[0]
    .replace(/-/g, " ")
    .trim();
  return name || null;
}

export function normalizeChessCom(
  game: ChessComGame,
  username: string,
): NormalizedGame | null {
  if (game.rules && game.rules !== "chess") return null; // só xadrez normal
  const me = username.toLowerCase();
  const color =
    game.white.username.toLowerCase() === me
      ? "white"
      : game.black.username.toLowerCase() === me
        ? "black"
        : null;
  if (!color || !game.end_time) return null;
  const mine = game[color];
  const theirs = game[color === "white" ? "black" : "white"];
  const result: GameResult =
    mine.result === "win" ? "win" : theirs.result === "win" ? "loss" : "draw";
  const reasonCode = result === "win" ? theirs.result : mine.result;
  const timeClass = CHESSCOM_CLASS[game.time_class ?? ""];
  if (!timeClass) return null;
  const externalId = game.uuid ?? game.url?.split("/").pop();
  if (!externalId) return null;
  return {
    platform: "chesscom",
    externalId,
    playedAt: new Date(game.end_time * 1000).toISOString(),
    color,
    result,
    endReason: CHESSCOM_REASON[reasonCode] ?? "other",
    timeControl: game.time_control ?? null,
    timeClass,
    userRating: mine.rating ?? null,
    opponentRating: theirs.rating ?? null,
    openingName: chessComOpeningName(game.eco),
    eco: game.pgn ? pgnHeader(game.pgn, "ECO") : null,
    moves: game.pgn ? countPgnMoves(game.pgn) : null,
  };
}

// ---------------------------------------------------------------------------
// Lichess: GET /api/games/user/{username} (ndjson, uma partida por linha)
// ---------------------------------------------------------------------------

type LichessSide = { user?: { name?: string; id?: string }; rating?: number };
export type LichessGame = {
  id: string;
  variant?: string;
  speed?: string;
  createdAt?: number;
  lastMoveAt?: number;
  status?: string;
  players: { white: LichessSide; black: LichessSide };
  winner?: "white" | "black";
  opening?: { eco?: string; name?: string };
  moves?: string;
  clock?: { initial: number; increment: number };
};

const LICHESS_REASON: Record<string, EndReason> = {
  mate: "mate",
  resign: "resign",
  outoftime: "timeout",
  timeout: "abandoned", // o adversário saiu e a vitória foi reclamada
  stalemate: "stalemate",
  draw: "agreement",
};

const LICHESS_CLASS: Record<string, TimeClass> = {
  ultraBullet: "bullet",
  bullet: "bullet",
  blitz: "blitz",
  rapid: "rapid",
  classical: "classical",
  correspondence: "correspondence",
};

const LICHESS_SKIP = new Set(["aborted", "noStart", "created", "started"]);

export function normalizeLichess(
  game: LichessGame,
  username: string,
): NormalizedGame | null {
  if (game.variant && game.variant !== "standard") return null;
  if (game.status && LICHESS_SKIP.has(game.status)) return null;
  const me = username.toLowerCase();
  const color =
    game.players.white.user?.id === me ||
    game.players.white.user?.name?.toLowerCase() === me
      ? "white"
      : game.players.black.user?.id === me ||
          game.players.black.user?.name?.toLowerCase() === me
        ? "black"
        : null;
  const timeClass = LICHESS_CLASS[game.speed ?? ""];
  const when = game.lastMoveAt ?? game.createdAt;
  if (!color || !timeClass || !when) return null;
  const result: GameResult = !game.winner
    ? "draw"
    : game.winner === color
      ? "win"
      : "loss";
  const plies = game.moves ? game.moves.trim().split(/\s+/).length : 0;
  return {
    platform: "lichess",
    externalId: game.id,
    playedAt: new Date(when).toISOString(),
    color,
    result,
    endReason: LICHESS_REASON[game.status ?? ""] ?? "other",
    timeControl: game.clock
      ? `${game.clock.initial}+${game.clock.increment}`
      : null,
    timeClass,
    userRating: game.players[color].rating ?? null,
    opponentRating:
      game.players[color === "white" ? "black" : "white"].rating ?? null,
    openingName: game.opening?.name ?? null,
    eco: game.opening?.eco ?? null,
    moves: plies ? Math.ceil(plies / 2) : null,
  };
}

// Lê um pedaço de ndjson: devolve as linhas completas e o resto que sobrou.
export function splitNdjson(buffer: string): { lines: string[]; rest: string } {
  const parts = buffer.split("\n");
  const rest = parts.pop() ?? "";
  return { lines: parts.map((line) => line.trim()).filter(Boolean), rest };
}
