import { Chess } from "chess.js";

// Tabuleiro sincronizado com o vídeo da aula. A marcação de tempo fica no próprio
// PGN, num comentário depois do lance: 1. e4 {[%t 0:45] Abre o centro} e5 {[%t 1:02]}
// Também vale um comentário antes do 1º lance para a posição inicial.

export type SyncPly = {
  ply: number; // 0 = posição inicial
  san: string | null;
  fen: string;
  from: string | null;
  to: string | null;
  seconds: number | null; // marcação de tempo deste lance, se houver
  comment: string | null; // comentário sem a marcação
};

export type ParsedLesson = { plies: SyncPly[]; hasMarks: boolean };

const TIME_TAG = /\[%t\s+(\d+(?::\d{1,2}){0,2})\]/;

export function parseTime(text: string): number | null {
  const parts = text.split(":").map(Number);
  if (parts.some((part) => !Number.isFinite(part))) return null;
  return parts.reduce((total, part) => total * 60 + part, 0);
}

function readComment(raw: string | undefined) {
  if (!raw) return { seconds: null, comment: null };
  const match = TIME_TAG.exec(raw);
  const seconds = match ? parseTime(match[1]) : null;
  const comment = raw.replace(TIME_TAG, "").trim() || null;
  return { seconds, comment };
}

// startFen: posição da aula quando o PGN não traz [FEN].
export function parseLessonPgn(
  pgn: string,
  startFen?: string | null,
): ParsedLesson | null {
  const chess = new Chess();
  try {
    if (startFen && !/\[FEN /.test(pgn)) {
      chess.load(startFen);
      chess.loadPgn(`[SetUp "1"]\n[FEN "${startFen}"]\n\n${pgn}`);
    } else {
      chess.loadPgn(pgn);
    }
  } catch {
    return null;
  }
  const comments = new Map(
    chess.getComments().map((entry) => [entry.fen, entry.comment]),
  );
  const history = chess.history({ verbose: true });
  const replay = new Chess(history[0]?.before ?? chess.fen());
  const start = readComment(comments.get(replay.fen()));
  const plies: SyncPly[] = [
    { ply: 0, san: null, fen: replay.fen(), from: null, to: null, ...start },
  ];
  history.forEach((move, index) => {
    replay.move(move.san);
    plies.push({
      ply: index + 1,
      san: move.san,
      fen: replay.fen(),
      from: move.from,
      to: move.to,
      ...readComment(comments.get(replay.fen())),
    });
  });
  return { plies, hasMarks: plies.some((ply) => ply.seconds !== null) };
}

// Lance a mostrar no tempo `seconds` do vídeo: o último com marcação já alcançada.
export function plyAtTime(plies: SyncPly[], seconds: number): number {
  let current = 0;
  for (const ply of plies) {
    if (ply.seconds !== null && ply.seconds <= seconds && ply.ply >= current)
      current = ply.ply;
  }
  return current;
}

// "1:05" para mostrar ao lado do lance.
export function formatMark(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const mm = h > 0 ? String(m).padStart(2, "0") : String(m);
  return `${h > 0 ? `${h}:` : ""}${mm}:${String(s).padStart(2, "0")}`;
}
