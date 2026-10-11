import { Chess } from "chess.js";

export type ParsedMove = { from: string; to: string; promotion?: string };

// Peças em português -> inglês (notação do chess.js).
// R = Rei em português (mas Rook em inglês): por isso o português é tentado primeiro.
const PT_TO_EN: Record<string, string> = {
  R: "K",
  D: "Q",
  T: "R",
  B: "B",
  C: "N",
};

const EN_TO_PT: Record<string, string> = {
  K: "R",
  Q: "D",
  R: "T",
  B: "B",
  N: "C",
};

// Lance do chess.js para mostrar ao aluno: "Nf3" -> "Cf3", "e8=Q+" -> "e8=D+".
export function sanToPortuguese(san: string): string {
  return san
    .replace(/^[KQRBN]/, (piece) => EN_TO_PT[piece])
    .replace(/=([QRBN])/, (_, piece: string) => `=${EN_TO_PT[piece]}`);
}

function translatePortuguese(text: string): string {
  return text
    .replace(/^[RDTBC]/, (piece) => PT_TO_EN[piece])
    .replace(/=([DTBC])$/, (_, piece: string) => `=${PT_TO_EN[piece]}`);
}

function tryMove(fen: string, san: string): ParsedMove | null {
  try {
    const move = new Chess(fen).move(san);
    return { from: move.from, to: move.to, promotion: move.promotion };
  } catch {
    return null;
  }
}

// Lê um lance digitado: coordenadas ("h5f7", "e7e8q"), notação em português
// ("Dxf7", "Cf3", "e8=D") ou em inglês ("Qxf7", "Nf3"). Retorna null se não for legal.
export function parseTypedMove(fen: string, input: string): ParsedMove | null {
  const text = input
    .trim()
    .replace(/[+#!?]+$/, "")
    .replace(/^0-0(-0)?$/, (castle) => castle.replace(/0/g, "O"));
  if (!text) return null;

  const coords = /^([a-h][1-8])-?([a-h][1-8])([qrbn])?$/i.exec(text);
  if (coords) {
    const [, from, to, promotion] = coords;
    try {
      const move = new Chess(fen).move({
        from: from.toLowerCase(),
        to: to.toLowerCase(),
        promotion: promotion?.toLowerCase(),
      });
      return { from: move.from, to: move.to, promotion: move.promotion };
    } catch {
      return null;
    }
  }

  return tryMove(fen, translatePortuguese(text)) ?? tryMove(fen, text);
}
