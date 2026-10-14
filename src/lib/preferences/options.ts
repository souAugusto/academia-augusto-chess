import type {
  AnimationSpeed,
  BoardTheme,
  Coordinates,
  MoveMethod,
  PieceSet,
  SoundPack,
} from "./schema";

// Cores de cada tema do tabuleiro. "finale" usa os tokens do tema do site
// (globals.css), para o padrão continuar sendo o tabuleiro de sempre.
export type BoardColors = {
  light: string;
  dark: string;
  lastMove: string;
  legal: string; // ponto dos lances possíveis
};

export const BOARD_THEME_OPTIONS: Record<
  BoardTheme,
  { label: string; colors: BoardColors }
> = {
  finale: {
    label: "Finale (padrão)",
    colors: {
      light: "var(--color-board-light)",
      dark: "var(--color-board-dark)",
      lastMove: "rgb(232 184 74 / 0.45)",
      legal: "rgb(11 13 18 / 0.35)",
    },
  },
  verde: {
    label: "Verde e creme",
    colors: {
      light: "#eeeed2",
      dark: "#769656",
      lastMove: "rgb(246 246 105 / 0.6)",
      legal: "rgb(20 40 10 / 0.3)",
    },
  },
  madeira: {
    label: "Madeira",
    colors: {
      light: "#f0d9b5",
      dark: "#b58863",
      lastMove: "rgb(205 210 106 / 0.65)",
      legal: "rgb(60 30 10 / 0.3)",
    },
  },
  azul: {
    label: "Azul",
    colors: {
      light: "#dee3e6",
      dark: "#8ca2ad",
      lastMove: "rgb(155 199 0 / 0.45)",
      legal: "rgb(20 40 60 / 0.3)",
    },
  },
  cinza: {
    label: "Cinza",
    colors: {
      light: "#d9d9d9",
      dark: "#8a8a8a",
      lastMove: "rgb(232 184 74 / 0.5)",
      legal: "rgb(0 0 0 / 0.3)",
    },
  },
  roxo: {
    label: "Roxo",
    colors: {
      light: "#e4dcf1",
      dark: "#8b72b5",
      lastMove: "rgb(255 214 102 / 0.55)",
      legal: "rgb(30 10 50 / 0.3)",
    },
  },
  contraste: {
    label: "Alto contraste",
    colors: {
      light: "#ffffff",
      dark: "#4a4a4a",
      lastMove: "rgb(255 200 0 / 0.75)",
      legal: "rgb(0 120 255 / 0.65)",
    },
  },
};

export const COORDINATE_OPTIONS: Record<Coordinates, string> = {
  dentro: "Dentro das casas",
  margem: "Na margem",
  ocultas: "Ocultas",
};

export const ANIMATION_OPTIONS: Record<
  AnimationSpeed,
  { label: string; ms: number }
> = {
  desligada: { label: "Desligada", ms: 0 },
  rapida: { label: "Rápida", ms: 120 },
  normal: { label: "Normal", ms: 220 },
  lenta: { label: "Lenta", ms: 400 },
};

export const MOVE_METHOD_OPTIONS: Record<MoveMethod, string> = {
  ambos: "Arrastar e clicar",
  arrastar: "Só arrastar",
  clicar: "Só clicar (origem e destino)",
};

// Conjuntos de peças. Só entram conjuntos com licença que permite uso comercial,
// conferida na fonte original (ver docs/licencas/ e /creditos).
export const PIECE_SET_OPTIONS: Record<
  PieceSet,
  { label: string; author: string; license: string; source: string }
> = {
  cburnett: {
    label: "Clássico",
    author: "Colin M.L. Burnett",
    license: "BSD 3-clause",
    source: "https://commons.wikimedia.org/wiki/Category:SVG_chess_pieces",
  },
  chessnut: {
    label: "Moderno",
    author: "Alexis Luengas",
    license: "Apache 2.0",
    source: "https://github.com/LexLuengas/chessnut-pieces",
  },
  fantasy: {
    label: "Fantasia",
    author: "Maurizio Monge",
    license: "MIT",
    source: "https://github.com/maurimo/chess-art",
  },
  spatial: {
    label: "Minimalista",
    author: "Maurizio Monge",
    license: "MIT",
    source: "https://github.com/maurimo/chess-art",
  },
};

export const SOUND_PACK_OPTIONS: Record<SoundPack, string> = {
  suave: "Suave",
  madeira: "Madeira",
};

export const pieceUrl = (set: PieceSet, code: string) =>
  `/pieces/${set}/${code}.svg`;
