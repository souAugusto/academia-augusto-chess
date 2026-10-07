// Leitura e seleção do banco aberto de puzzles do Lichess (licença CC0).
// Arquivo: https://database.lichess.org/lichess_db_puzzle.csv.zst
// Colunas: PuzzleId,FEN,Moves,Rating,RatingDeviation,Popularity,NbPlays,Themes,GameUrl,OpeningTags

export const LICHESS_PUZZLES_URL =
  "https://database.lichess.org/lichess_db_puzzle.csv.zst";
export const EXPECTED_HEADER =
  "PuzzleId,FEN,Moves,Rating,RatingDeviation,Popularity,NbPlays,Themes,GameUrl,OpeningTags";

export type LichessPuzzle = {
  id: string;
  fen: string;
  moves: string;
  rating: number;
  ratingDeviation: number;
  popularity: number;
  plays: number;
  themes: string[];
  openingTags: string[];
};

// O CSV do Lichess não usa aspas: nenhum campo tem vírgula.
export function parseLichessLine(line: string): LichessPuzzle | null {
  const cols = line.split(",");
  if (cols.length < 9) return null;
  const [
    id,
    fen,
    moves,
    rating,
    deviation,
    popularity,
    plays,
    themes,
    ,
    openingTags = "",
  ] = cols;
  const numbers = [rating, deviation, popularity, plays].map(Number);
  if (!id || !fen || !moves || numbers.some(Number.isNaN)) return null;
  return {
    id,
    fen,
    moves,
    rating: numbers[0],
    ratingDeviation: numbers[1],
    popularity: numbers[2],
    plays: numbers[3],
    themes: themes ? themes.split(" ").filter(Boolean) : [],
    openingTags: openingTags ? openingTags.split(" ").filter(Boolean) : [],
  };
}

// Critérios de qualidade: puzzles bem avaliados, jogados bastante e com rating estável.
export const SELECTION = {
  minRating: 600,
  maxRating: 2600,
  bucketSize: 100,
  maxDeviation: 90,
  minPopularity: 85,
  minPlays: 300,
  maxPlies: 10, // lance do adversário + até 5 lances do aluno
} as const;

export function passesQuality(puzzle: LichessPuzzle): boolean {
  const plies = puzzle.moves.split(" ").length;
  return (
    puzzle.rating >= SELECTION.minRating &&
    puzzle.rating < SELECTION.maxRating &&
    puzzle.ratingDeviation <= SELECTION.maxDeviation &&
    puzzle.popularity >= SELECTION.minPopularity &&
    puzzle.plays >= SELECTION.minPlays &&
    plies <= SELECTION.maxPlies
  );
}

// Faixa de rating (0 = 600–699, 1 = 700–799, ...).
export function ratingBucket(rating: number): number {
  return Math.floor((rating - SELECTION.minRating) / SELECTION.bucketSize);
}

export const BUCKET_COUNT =
  (SELECTION.maxRating - SELECTION.minRating) / SELECTION.bucketSize;

// Seleciona até `limit` puzzles distribuídos igualmente entre as faixas de rating.
// (Sem "parameter properties": o script roda no Node, que só remove tipos.)
export class BucketSampler {
  readonly limit: number;
  readonly perBucket: number;
  readonly counts: number[] = new Array<number>(BUCKET_COUNT).fill(0);
  taken = 0;

  constructor(limit: number) {
    this.limit = limit;
    this.perBucket = Math.ceil(limit / BUCKET_COUNT);
  }

  offer(puzzle: LichessPuzzle): boolean {
    if (this.full || !passesQuality(puzzle)) return false;
    const bucket = ratingBucket(puzzle.rating);
    if (this.counts[bucket] >= this.perBucket) return false;
    this.counts[bucket] += 1;
    this.taken += 1;
    return true;
  }

  get full(): boolean {
    return (
      this.taken >= this.limit ||
      this.counts.every((count) => count >= this.perBucket)
    );
  }

  get total(): number {
    return this.taken;
  }
}

export function toPuzzleRow(puzzle: LichessPuzzle) {
  return {
    id: puzzle.id,
    fen: puzzle.fen,
    moves: puzzle.moves,
    first_move_is_setup: true,
    rating: puzzle.rating,
    popularity: puzzle.popularity,
    themes: puzzle.themes,
    opening_tags: puzzle.openingTags,
    source: "lichess" as const,
  };
}
