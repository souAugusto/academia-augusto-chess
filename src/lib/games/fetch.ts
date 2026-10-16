import "server-only";
import {
  normalizeChessCom,
  normalizeLichess,
  splitNdjson,
  type ChessComGame,
  type LichessGame,
  type NormalizedGame,
} from "./normalize";

// Chamadas às APIs públicas do Chess.com e do Lichess (sem chave).
// Só no servidor. As requisições são feitas uma de cada vez: o navegador chama
// um passo por vez e espera entre eles.

export const MAX_GAMES_PER_IMPORT = 500;
const USER_AGENT =
  "FinaleXadrez/1.0 (+https://www.academiafinale.site; academia de xadrez)";
const TIMEOUT_MS = 25_000;
// O Lichess manda umas 20 partidas por segundo: 500 levam perto de 30s.
const LICHESS_STREAM_TIMEOUT_MS = 100_000;

export type FetchErrorKind =
  "not_found" | "no_games" | "unavailable" | "rate_limited";

export class GamesFetchError extends Error {
  kind: FetchErrorKind;
  constructor(kind: FetchErrorKind) {
    super(kind);
    this.kind = kind;
  }
}

const USERNAME = /^[A-Za-z0-9_-]{2,50}$/;

export function isValidUsername(value: string): boolean {
  return USERNAME.test(value);
}

async function get(
  url: string,
  accept = "application/json",
  timeoutMs = TIMEOUT_MS,
): Promise<Response> {
  let response: Response;
  try {
    response = await fetch(url, {
      headers: { "User-Agent": USER_AGENT, Accept: accept },
      signal: AbortSignal.timeout(timeoutMs),
      cache: "no-store",
    });
  } catch {
    throw new GamesFetchError("unavailable");
  }
  if (response.status === 429) throw new GamesFetchError("rate_limited");
  if (response.status === 404 || response.status === 410)
    throw new GamesFetchError("not_found");
  if (!response.ok) throw new GamesFetchError("unavailable");
  return response;
}

async function getJson<T>(url: string): Promise<T> {
  const response = await get(url);
  try {
    return (await response.json()) as T;
  } catch {
    throw new GamesFetchError("unavailable");
  }
}

// ---------------------------------------------------------------------------
// Chess.com
// ---------------------------------------------------------------------------

const CHESSCOM = "https://api.chess.com/pub/player";

// Confere se o usuário existe e tem partidas. Devolve o nome como o site guarda
// e a lista de meses (do mais recente para o mais antigo).
export async function checkChessCom(
  username: string,
): Promise<{ username: string; archives: string[] }> {
  if (!isValidUsername(username)) throw new GamesFetchError("not_found");
  const player = await getJson<{ username?: string }>(
    `${CHESSCOM}/${username.toLowerCase()}`,
  );
  const canonical = player.username ?? username.toLowerCase();
  const { archives = [] } = await getJson<{ archives?: string[] }>(
    `${CHESSCOM}/${canonical}/games/archives`,
  );
  if (archives.length === 0) throw new GamesFetchError("no_games");
  return { username: canonical, archives: [...archives].reverse() };
}

// Só aceita a URL de um mês do próprio usuário (nada de buscar endereços livres).
export function isChessComArchiveUrl(url: string, username: string): boolean {
  const match =
    /^https:\/\/api\.chess\.com\/pub\/player\/([^/]+)\/games\/\d{4}\/\d{2}$/.exec(
      url,
    );
  return Boolean(match && match[1].toLowerCase() === username.toLowerCase());
}

export async function fetchChessComMonth(
  url: string,
  username: string,
): Promise<NormalizedGame[]> {
  if (!isChessComArchiveUrl(url, username))
    throw new GamesFetchError("not_found");
  const { games = [] } = await getJson<{ games?: ChessComGame[] }>(url);
  return games
    .map((game) => normalizeChessCom(game, username))
    .filter((game): game is NormalizedGame => game !== null);
}

// ---------------------------------------------------------------------------
// Lichess
// ---------------------------------------------------------------------------

export async function checkLichess(
  username: string,
): Promise<{ username: string }> {
  if (!isValidUsername(username)) throw new GamesFetchError("not_found");
  const user = await getJson<{
    username?: string;
    disabled?: boolean;
    closed?: boolean;
    count?: { all?: number };
  }>(`https://lichess.org/api/user/${username}`);
  if (user.disabled || user.closed) throw new GamesFetchError("not_found");
  if (!user.count?.all) throw new GamesFetchError("no_games");
  return { username: user.username ?? username };
}

// Lê o ndjson aos poucos (stream), sem guardar a resposta inteira na memória.
export async function fetchLichessGames(
  username: string,
  options: { sinceMs: number | null; max: number },
): Promise<NormalizedGame[]> {
  const params = new URLSearchParams({
    max: String(options.max),
    opening: "true",
    clocks: "false",
    evals: "false",
    moves: "true",
  });
  if (options.sinceMs) params.set("since", String(options.sinceMs + 1));
  const response = await get(
    `https://lichess.org/api/games/user/${encodeURIComponent(username)}?${params}`,
    "application/x-ndjson",
    LICHESS_STREAM_TIMEOUT_MS,
  );
  if (!response.body) return [];
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  const games: NormalizedGame[] = [];
  let buffer = "";
  const take = (lines: string[]) => {
    for (const line of lines) {
      try {
        const game = normalizeLichess(
          JSON.parse(line) as LichessGame,
          username,
        );
        if (game) games.push(game);
      } catch {
        // Linha inesperada: pula sem derrubar a importação.
      }
    }
  };
  try {
    for (;;) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const { lines, rest } = splitNdjson(buffer);
      buffer = rest;
      take(lines);
    }
  } catch {
    // Leitura cortada no meio: não salva nada. Salvar só as mais novas faria as
    // mais antigas sumirem (a próxima importação busca só depois da última salva).
    throw new GamesFetchError("unavailable");
  }
  take(splitNdjson(`${buffer}\n`).lines);
  return games;
}

// ---------------------------------------------------------------------------
// Uma partida para análise (lances e, no Lichess, a análise já feita lá)
// ---------------------------------------------------------------------------

export type GameForAnalysis = {
  pgn: string | null; // Chess.com
  sans: string[] | null; // Lichess (lances em SAN, posição inicial padrão)
  lichessAnalysis: unknown; // lista do Lichess com evals, se a partida foi analisada
};

const LICHESS_ID = /^[A-Za-z0-9]{8}$/;

export async function fetchLichessGameForAnalysis(
  externalId: string,
): Promise<GameForAnalysis> {
  if (!LICHESS_ID.test(externalId)) throw new GamesFetchError("not_found");
  const game = await getJson<{
    moves?: string;
    variant?: string;
    analysis?: unknown;
  }>(
    `https://lichess.org/game/export/${externalId}?evals=true&clocks=false&opening=false&literate=false`,
  );
  if (game.variant && game.variant !== "standard")
    throw new GamesFetchError("not_found");
  const sans = game.moves?.trim() ? game.moves.trim().split(/\s+/) : [];
  if (sans.length === 0) throw new GamesFetchError("no_games");
  return { pgn: null, sans, lichessAnalysis: game.analysis ?? null };
}

// O Chess.com não tem endpoint de partida avulsa: a partida é procurada no
// arquivo do mês em que foi jogada (o mesmo usado na importação).
export async function fetchChessComGameForAnalysis(
  username: string,
  playedAt: Date,
  externalId: string,
): Promise<GameForAnalysis> {
  if (!isValidUsername(username)) throw new GamesFetchError("not_found");
  const year = playedAt.getUTCFullYear();
  const month = String(playedAt.getUTCMonth() + 1).padStart(2, "0");
  const url = `${CHESSCOM}/${username.toLowerCase()}/games/${year}/${month}`;
  const { games = [] } = await getJson<{
    games?: { uuid?: string; url?: string; pgn?: string; rules?: string }[];
  }>(url);
  const game = games.find(
    (item) =>
      item.uuid === externalId || item.url?.split("/").pop() === externalId,
  );
  if (!game?.pgn || (game.rules && game.rules !== "chess"))
    throw new GamesFetchError("not_found");
  return { pgn: game.pgn, sans: null, lichessAnalysis: null };
}
