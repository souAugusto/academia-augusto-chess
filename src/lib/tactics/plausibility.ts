// Travas contra tentativas implausíveis (bots ou envios forjados). Tentativa
// implausível é gravada, mas não mexe no rating nem concede título.
//
// Limitação conhecida: o aluno consegue ler a solução do puzzle pelo banco
// (o tabuleiro precisa dela para responder na hora), então uma pessoa técnica
// ainda consegue forjar acertos dentro destes limites. Por isso o ranking é de
// motivação, não de competição com prêmio (ver docs/DECISOES.md).

export const MIN_SECONDS_PER_MOVE = 0.8;
export const MIN_GAP_SECONDS = 2;
export const DAILY_RATED_LIMIT = 300;

export type Implausible = "rapido-demais" | "seguidas-demais" | "limite-diario";

export function implausibleReason(input: {
  userMoves: number; // lances do aluno na tentativa
  seconds: number;
  secondsSinceLastAttempt: number | null;
  ratedToday: number;
}): Implausible | null {
  const minimum = Math.max(1, input.userMoves * MIN_SECONDS_PER_MOVE);
  if (input.seconds < minimum) return "rapido-demais";
  if (
    input.secondsSinceLastAttempt !== null &&
    input.secondsSinceLastAttempt < MIN_GAP_SECONDS
  )
    return "seguidas-demais";
  if (input.ratedToday >= DAILY_RATED_LIMIT) return "limite-diario";
  return null;
}

export const IMPLAUSIBLE_MESSAGES: Record<Implausible, string> = {
  "rapido-demais":
    "Resposta rápida demais: esta tentativa não contou para o rating.",
  "seguidas-demais":
    "Tentativas seguidas demais: esta não contou para o rating.",
  "limite-diario":
    "Você chegou ao limite de puzzles valendo rating por hoje. Os próximos contam para o treino, mas não para o rating.",
};
