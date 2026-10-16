// Teoria de aberturas para a análise: quais lances do começo da partida estão
// nas linhas do repositório lichess-org/chess-openings (CC0). Os dados ficam num
// arquivo estático do projeto (src/content/teoria-aberturas.json), gerado por
// scripts/build-opening-book.ts; nada é buscado no GitHub em tempo de execução.

export type OpeningBook = {
  v: 1;
  names: string[]; // "C00 · French Defense"
  // posição (hash da EPD) -> índice do nome, ou -1 se a posição está numa
  // linha conhecida mas não tem nome próprio.
  book: Record<string, number>;
};

// EPD: as 4 primeiras partes do FEN (peças, vez, roque, en passant).
export function epdOf(fen: string): string {
  return fen.split(" ").slice(0, 4).join(" ");
}

// Hash curto e estável (FNV-1a de 32 bits, em base 36) para a chave da posição.
export function positionKey(fen: string): string {
  const epd = epdOf(fen);
  let hash = 0x811c9dc5;
  for (let i = 0; i < epd.length; i++) {
    hash ^= epd.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash.toString(36);
}

export type TheoryResult = {
  bookPlies: number; // lances seguidos, desde o início, que estão na teoria
  opening: string | null; // nome mais específico alcançado
};

// fens[i] = posição depois de i meias-jogadas (fens[0] = início).
export function theoryOf(fens: string[], book: OpeningBook | null): TheoryResult {
  if (!book) return { bookPlies: 0, opening: null };
  let bookPlies = 0;
  let opening: string | null = null;
  for (let i = 1; i < fens.length; i++) {
    const index = book.book[positionKey(fens[i])];
    if (index === undefined) break;
    bookPlies = i;
    if (index >= 0) opening = book.names[index] ?? opening;
  }
  return { bookPlies, opening };
}

export function parseBook(json: unknown): OpeningBook | null {
  if (!json || typeof json !== "object") return null;
  const data = json as Partial<OpeningBook>;
  if (data.v !== 1 || !Array.isArray(data.names) || !data.book) return null;
  return data as OpeningBook;
}
