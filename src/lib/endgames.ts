// Regras do treino de finais contra o Stockfish (PROMPT_MESTRE.md, seção 6).

export type Goal = "win" | "draw";
export type Side = "w" | "b";

// Qualidade do lance do aluno, pela perda de avaliação (em centipeões).
export type MoveQuality = "bom" | "imprecisao" | "erro" | "grave";

export const QUALITY_LABELS: Record<MoveQuality, string> = {
  bom: "Bom lance",
  imprecisao: "Imprecisão",
  erro: "Erro",
  grave: "Erro grave",
};

const DECISIVE = 500; // acima disso a posição já está decidida

// before/after: avaliação do ponto de vista do aluno, antes e depois do lance dele.
export function classifyMove(before: number, after: number): MoveQuality {
  const loss = before - after;
  // Trocar um mate por outra vitória clara não é erro grave: a posição segue ganha.
  if (before >= DECISIVE && after >= DECISIVE)
    return loss >= 300 ? "imprecisao" : "bom";
  if (loss >= 300) return "grave";
  if (loss >= 150) return "erro";
  if (loss >= 60) return "imprecisao";
  return "bom";
}

export type GameState = {
  isCheckmate: boolean;
  isDraw: boolean; // afogamento, material insuficiente, repetição ou 50 lances
  turn: Side; // quem joga agora (no mate, quem levou mate)
};

export type EndgameStatus =
  | { kind: "playing" }
  | { kind: "success"; reason: string }
  | { kind: "fail"; reason: string };

export function endgameStatus(
  state: GameState,
  userColor: Side,
  goal: Goal,
  userMoves: number,
  maxMoves: number,
): EndgameStatus {
  if (state.isCheckmate) {
    const userMated = state.turn === userColor;
    if (userMated) return { kind: "fail", reason: "Você levou mate." };
    return goal === "win"
      ? { kind: "success", reason: "Xeque-mate. Final convertido." }
      : { kind: "success", reason: "Xeque-mate! Melhor do que o empate." };
  }
  if (state.isDraw) {
    return goal === "draw"
      ? { kind: "success", reason: "Empate garantido." }
      : { kind: "fail", reason: "A partida terminou empatada." };
  }
  if (userMoves >= maxMoves) {
    return goal === "draw"
      ? {
          kind: "success",
          reason: `Você segurou a posição por ${maxMoves} lances.`,
        }
      : { kind: "fail", reason: `Não deu mate em ${maxMoves} lances.` };
  }
  return { kind: "playing" };
}

export const GOAL_LABELS: Record<Goal, string> = {
  win: "Objetivo: vencer",
  draw: "Objetivo: empatar",
};
