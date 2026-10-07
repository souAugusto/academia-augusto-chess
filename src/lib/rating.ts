// Rating de táticas (Elo simplificado, PROMPT_MESTRE.md, seção 6).
// - Começa em 1500 (mesma referência do banco do Lichess).
// - Fator K maior nos primeiros puzzles, para o rating achar o nível rápido.
// - Só a primeira tentativa em cada puzzle conta (decidido no servidor).

export const INITIAL_RATING = 1500;
const PROVISIONAL_GAMES = 30;
const K_PROVISIONAL = 40;
const K_STABLE = 20;
const MIN_RATING = 400;
const MAX_RATING = 3200;

export type PlayerRating = { rating: number; games: number };

export function expectedScore(player: number, opponent: number): number {
  return 1 / (1 + 10 ** ((opponent - player) / 400));
}

export function nextRating(
  player: PlayerRating,
  puzzleRating: number,
  solved: boolean,
): PlayerRating {
  const k = player.games < PROVISIONAL_GAMES ? K_PROVISIONAL : K_STABLE;
  const delta =
    k * ((solved ? 1 : 0) - expectedScore(player.rating, puzzleRating));
  const rating = Math.min(
    MAX_RATING,
    Math.max(MIN_RATING, Math.round(player.rating + delta)),
  );
  return { rating, games: player.games + 1 };
}

// Faixas de dificuldade em relação ao rating do aluno.
export type Difficulty = "facil" | "medio" | "dificil";

export const DIFFICULTIES: { id: Difficulty; label: string }[] = [
  { id: "facil", label: "Fácil" },
  { id: "medio", label: "Médio" },
  { id: "dificil", label: "Difícil" },
];

export function difficultyRange(
  rating: number,
  difficulty: Difficulty,
): { min: number; max: number } {
  const offsets: Record<Difficulty, [number, number]> = {
    facil: [-350, -100],
    medio: [-100, 100],
    dificil: [100, 350],
  };
  const [low, high] = offsets[difficulty];
  return { min: rating + low, max: rating + high };
}
