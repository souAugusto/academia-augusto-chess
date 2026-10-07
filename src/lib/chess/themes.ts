// Temas do banco do Lichess com nome em português (filtro de táticas).
export const THEME_LABELS: Record<string, string> = {
  fork: "Garfo",
  pin: "Cravada",
  skewer: "Espeto",
  discoveredAttack: "Ataque descoberto",
  doubleCheck: "Xeque duplo",
  deflection: "Desvio",
  attraction: "Atração",
  xRayAttack: "Raio-X",
  sacrifice: "Sacrifício",
  hangingPiece: "Peça solta",
  trappedPiece: "Peça presa",
  capturingDefender: "Eliminação do defensor",
  interference: "Interferência",
  clearance: "Abertura de linha",
  intermezzo: "Lance intermediário",
  quietMove: "Lance silencioso",
  backRankMate: "Mate no corredor",
  mateIn1: "Mate em 1",
  mateIn2: "Mate em 2",
  mateIn3: "Mate em 3",
  promotion: "Promoção",
  endgame: "Final",
  opening: "Abertura",
  middlegame: "Meio-jogo",
};

// Ordem do filtro na tela de táticas.
export const THEME_FILTERS = [
  "mateIn1",
  "mateIn2",
  "mateIn3",
  "fork",
  "pin",
  "skewer",
  "discoveredAttack",
  "deflection",
  "attraction",
  "xRayAttack",
  "sacrifice",
  "hangingPiece",
  "backRankMate",
  "endgame",
] as const;

export type ThemeFilter = (typeof THEME_FILTERS)[number];

export function isThemeFilter(value: string): value is ThemeFilter {
  return (THEME_FILTERS as readonly string[]).includes(value);
}

export function themeLabel(theme: string): string {
  return THEME_LABELS[theme] ?? theme;
}
