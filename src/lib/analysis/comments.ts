// Comentário de "treinador" para um lance analisado: frases fixas preenchidas
// com os dados do motor. Determinístico, sem IA: o texto só afirma o que os
// números mostram.
import { Chess } from "chess.js";
import { sanToPortuguese } from "@/lib/chess/notation";
import { CLASS_LABELS, type DeepLine, type ReviewedMove } from "./classify";
import { PIECE_NAMES_PT, playUci, type PieceType } from "./material";
import { formatEval, type EngineScore } from "./winprob";

const SIDE = { w: "as brancas", b: "as pretas" } as const;

// Linha em SAN português, com numeração: "12.Bxh7+ Rxh7 13.Cg5+".
export function lineToSan(fen: string, ucis: string[], max = 6): string {
  const chess = new Chess(fen);
  const parts: string[] = [];
  for (const uci of ucis.slice(0, max)) {
    const ply = (Number(chess.fen().split(" ")[5]) - 1) * 2 + (chess.turn() === "b" ? 1 : 0);
    const move = playUci(chess, uci);
    if (!move) break;
    const number = Math.floor(ply / 2) + 1;
    const prefix =
      move.color === "w" ? `${number}.` : parts.length === 0 ? `${number}...` : "";
    parts.push(`${prefix}${sanToPortuguese(move.san)}`);
  }
  return parts.join(" ");
}

export function moveToSan(fen: string, uci: string | null): string | null {
  if (!uci) return null;
  const move = playUci(new Chess(fen), uci);
  return move ? sanToPortuguese(move.san) : null;
}

const article = (piece: PieceType) =>
  piece === "r" || piece === "q" ? "a" : "o";

// Peça de quem jogou que o adversário captura em seguida sem recaptura na linha.
function hangingPiece(
  fenAfter: string,
  reply: string[],
): { piece: PieceType; square: string } | null {
  if (reply.length === 0) return null;
  const chess = new Chess(fenAfter);
  const first = playUci(chess, reply[0]);
  if (!first?.captured) return null;
  const next = reply[1] ? playUci(chess, reply[1]) : null;
  if (next?.captured && next.to === first.to) return null;
  return { piece: first.captured as PieceType, square: first.to };
}

export type CommentContext = {
  fens: string[];
  pv: string[][];
  deep: Record<number, DeepLine[]>;
  evals: EngineScore[];
  opening: string | null;
};

export function commentFor(move: ReviewedMove, ctx: CommentContext): string {
  const fen = ctx.fens[move.ply];
  const fenAfter = ctx.fens[move.ply + 1];
  const played = moveToSan(fen, move.played) ?? move.played;
  const best = moveToSan(fen, move.best);
  const side = SIDE[move.color];
  const evalBefore = ctx.evals[move.ply];
  const evalAfter = ctx.evals[move.ply + 1];
  const change =
    evalBefore && evalAfter
      ? `A avaliação foi de ${formatEval(evalBefore)} para ${formatEval(evalAfter)}.`
      : "";

  switch (move.cls) {
    case "teoria":
      return ctx.opening
        ? `${played} é lance de teoria (${ctx.opening}).`
        : `${played} é lance de teoria.`;
    case "brilhante": {
      const sac = move.sacrifice;
      // A linha em que o adversário aceita o sacrifício (do motor ou da partida).
      const line = lineToSan(fenAfter, sac?.line ?? [], 5);
      const piece = sac
        ? `${article(sac.piece)} ${PIECE_NAMES_PT[sac.piece]} em ${sac.square}`
        : "material";
      return `Brilhante! ${played} sacrifica ${piece}. ${line ? `Se o adversário aceitar: ${line}, e ${side} ficam melhores.` : `${side[0].toUpperCase()}${side.slice(1)} ficam melhores.`}`;
    }
    case "otimo":
      return move.onlyMoveGap !== null
        ? `Ótimo: ${played} era o único lance que mantinha a posição. A segunda melhor opção perdia ${Math.round(move.onlyMoveGap)} pontos de chance de vitória.`
        : `Ótimo: ${played} muda o rumo da partida a favor d${side}, e só este lance consegue isso.`;
    case "melhor":
      return `${played} é o melhor lance do motor.`;
    case "excelente":
      return `${played} é excelente: quase tão bom quanto o melhor lance${best ? ` (${best})` : ""}.`;
    case "bom":
      return `${played} é um bom lance. O melhor era ${best ?? "outro lance"}.`;
    default: {
      const parts = [`${CLASS_LABELS[move.cls]}: ${played}.`];
      if (move.allowedMate !== null)
        parts.push(`Permitiu mate em ${move.allowedMate}.`);
      if (move.missedMate !== null)
        parts.push(`Perdeu a chance de mate em ${move.missedMate}.`);
      if (move.cls === "chance_perdida" && move.missedMate === null)
        parts.push("O adversário tinha acabado de errar, e a vantagem escapou.");
      if (best) parts.push(`O melhor era ${best}.`);
      const hanging = hangingPiece(fenAfter, ctx.pv[move.ply + 1] ?? []);
      if (hanging && move.allowedMate === null)
        parts.push(
          `Deixou ${article(hanging.piece)} ${PIECE_NAMES_PT[hanging.piece]} em ${hanging.square} sem defesa.`,
        );
      if (change) parts.push(change);
      return parts.join(" ");
    }
  }
}
