// Leitura de partidas em PGN para a análise. Valida o texto, reproduz os lances
// com o chess.js e devolve tudo o que a tela e o motor precisam.
import { Chess } from "chess.js";

export const MAX_PGN_CHARS = 20_000;
export const MAX_PLIES = 400;

export type ParsedGame = {
  headers: Record<string, string>;
  startFen: string;
  sans: string[];
  ucis: string[];
  fens: string[]; // fens[i] = posição depois de i meias-jogadas (fens[0] = início)
  ending: "mate" | "afogamento" | null;
};

export type PgnError = "vazio" | "grande" | "invalido" | "sem-lances" | "longo";

export const PGN_ERROR_MESSAGES: Record<PgnError, string> = {
  vazio: "Cole o PGN da partida.",
  grande: "O PGN é grande demais.",
  invalido: "Não consegui ler esse PGN. Confira se ele está completo.",
  "sem-lances": "A partida não tem lances.",
  longo: `A partida tem mais de ${MAX_PLIES / 2} lances.`,
};

export function parsePgn(
  text: string,
): { ok: true; game: ParsedGame } | { ok: false; error: PgnError } {
  const pgn = text.trim();
  if (!pgn) return { ok: false, error: "vazio" };
  if (pgn.length > MAX_PGN_CHARS) return { ok: false, error: "grande" };
  const chess = new Chess();
  try {
    chess.loadPgn(pgn);
  } catch {
    return { ok: false, error: "invalido" };
  }
  const history = chess.history({ verbose: true });
  if (history.length === 0) return { ok: false, error: "sem-lances" };
  if (history.length > MAX_PLIES) return { ok: false, error: "longo" };
  const headers = Object.fromEntries(
    Object.entries(chess.getHeaders()).filter(
      ([, value]) => typeof value === "string" && value !== "?",
    ),
  ) as Record<string, string>;
  const startFen = history[0].before;
  return {
    ok: true,
    game: {
      headers,
      startFen,
      sans: history.map((move) => move.san),
      ucis: history.map(
        (move) => `${move.from}${move.to}${move.promotion ?? ""}`,
      ),
      fens: [startFen, ...history.map((move) => move.after)],
      ending: chess.isCheckmate()
        ? "mate"
        : chess.isStalemate()
          ? "afogamento"
          : null,
    },
  };
}

// Mesmos dados a partir de uma lista de lances em UCI (partidas importadas).
export function gameFromUcis(
  ucis: string[],
  startFen?: string,
  headers: Record<string, string> = {},
): ParsedGame | null {
  const chess = new Chess(startFen);
  const fens = [chess.fen()];
  const sans: string[] = [];
  try {
    for (const uci of ucis.slice(0, MAX_PLIES)) {
      const move = chess.move({
        from: uci.slice(0, 2),
        to: uci.slice(2, 4),
        promotion: uci[4],
      });
      sans.push(move.san);
      fens.push(move.after);
    }
  } catch {
    return null;
  }
  if (sans.length === 0) return null;
  return {
    headers,
    startFen: fens[0],
    sans,
    ucis: ucis.slice(0, sans.length),
    fens,
    ending: chess.isCheckmate()
      ? "mate"
      : chess.isStalemate()
        ? "afogamento"
        : null,
  };
}

// Lances em SAN (como o Lichess exporta) para UCI.
export function sansToUcis(sans: string[], startFen?: string): string[] | null {
  const chess = new Chess(startFen);
  const ucis: string[] = [];
  try {
    for (const san of sans) {
      const move = chess.move(san);
      ucis.push(`${move.from}${move.to}${move.promotion ?? ""}`);
    }
  } catch {
    return null;
  }
  return ucis;
}
