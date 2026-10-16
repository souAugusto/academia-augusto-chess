import type {
  AnimationSpeed,
  BoardTheme,
  Coordinates,
  MoveMethod,
  PieceSet,
  SoundPack,
} from "./schema";

// Cores de cada tema do tabuleiro (cores sólidas, contraste conferido por
// teste em src/lib/preferences/contrast.test.ts). Os destaques não dependem só
// da cor: último lance = casa tingida, lances possíveis = ponto ou anel, xeque =
// anel em volta do rei.
export type BoardColors = {
  light: string;
  dark: string;
  lastMove: string;
  legal: string; // ponto dos lances possíveis
  check: string; // casa do rei em xeque
  arrow: string; // setas (melhor lance, dica)
  frame: string; // moldura em volta do tabuleiro e coordenadas da margem
  // Contorno claro/escuro em volta das peças, onde a cor da peça some na casa.
  halo?: { w?: string; b?: string };
};

export const BOARD_THEME_OPTIONS: Record<
  BoardTheme,
  { label: string; colors: BoardColors }
> = {
  finale: {
    label: "Finale (padrão)",
    colors: {
      light: "#c9cedf",
      dark: "#6f7ba6",
      lastMove: "rgb(232 184 74 / 0.5)",
      legal: "rgb(11 13 18 / 0.38)",
      check: "rgb(220 38 38 / 0.85)",
      arrow: "rgb(232 184 74 / 0.85)",
      frame: "#4b5579",
    },
  },
  esmeralda: {
    label: "Esmeralda",
    colors: {
      light: "#eef5e1",
      dark: "#2e8b57",
      lastMove: "rgb(255 214 64 / 0.6)",
      legal: "rgb(10 40 20 / 0.4)",
      check: "rgb(220 38 38 / 0.85)",
      arrow: "rgb(255 160 0 / 0.85)",
      frame: "#1f5f3b",
    },
  },
  oceano: {
    label: "Oceano",
    colors: {
      light: "#dcebfa",
      dark: "#2f6fbf",
      lastMove: "rgb(255 214 64 / 0.6)",
      legal: "rgb(10 25 60 / 0.4)",
      check: "rgb(220 38 38 / 0.85)",
      arrow: "rgb(255 140 20 / 0.85)",
      frame: "#22508a",
    },
  },
  coral: {
    label: "Coral",
    colors: {
      light: "#ffe9d6",
      dark: "#e8683f",
      lastMove: "rgb(60 190 220 / 0.5)",
      legal: "rgb(70 20 0 / 0.38)",
      check: "rgb(150 0 60 / 0.85)",
      arrow: "rgb(30 100 220 / 0.85)",
      frame: "#b5482a",
    },
  },
  uva: {
    label: "Uva",
    colors: {
      light: "#ebe1f7",
      dark: "#7a4dd1",
      lastMove: "rgb(255 214 64 / 0.6)",
      legal: "rgb(30 10 60 / 0.4)",
      check: "rgb(220 38 38 / 0.85)",
      arrow: "rgb(255 160 0 / 0.85)",
      frame: "#5a35a3",
    },
  },
  limao: {
    label: "Limão",
    colors: {
      light: "#f6f9d4",
      dark: "#8db600",
      lastMove: "rgb(60 140 255 / 0.45)",
      legal: "rgb(30 40 0 / 0.4)",
      check: "rgb(220 38 38 / 0.85)",
      arrow: "rgb(40 90 220 / 0.85)",
      frame: "#6a8a00",
    },
  },
  rosa: {
    label: "Rosa",
    colors: {
      light: "#ffe3ee",
      dark: "#d6457e",
      lastMove: "rgb(255 214 64 / 0.6)",
      legal: "rgb(70 0 30 / 0.38)",
      check: "rgb(120 0 40 / 0.85)",
      arrow: "rgb(30 100 220 / 0.85)",
      frame: "#a8325f",
    },
  },
  madeira: {
    label: "Madeira",
    colors: {
      light: "#f0d9b5",
      dark: "#b4763f",
      lastMove: "rgb(205 210 106 / 0.7)",
      legal: "rgb(60 30 10 / 0.38)",
      check: "rgb(220 38 38 / 0.85)",
      arrow: "rgb(30 120 200 / 0.85)",
      frame: "#8a5a32",
    },
  },
  concreto: {
    label: "Concreto",
    colors: {
      light: "#d9dcdf",
      dark: "#7c858d",
      lastMove: "rgb(255 196 0 / 0.55)",
      legal: "rgb(0 0 0 / 0.35)",
      check: "rgb(220 38 38 / 0.85)",
      arrow: "rgb(230 120 0 / 0.85)",
      frame: "#5b636a",
    },
  },
  meianoite: {
    label: "Meia-noite",
    colors: {
      light: "#8aa0c8",
      dark: "#1e2a4a",
      lastMove: "rgb(255 214 64 / 0.5)",
      legal: "rgb(255 255 255 / 0.45)",
      check: "rgb(255 70 70 / 0.85)",
      arrow: "rgb(255 200 60 / 0.9)",
      frame: "#121a30",
      halo: { b: "#e6ecf7" },
    },
  },
  contraste: {
    label: "Alto contraste",
    colors: {
      light: "#ffffff",
      dark: "#1b1b1b",
      lastMove: "rgb(255 200 0 / 0.8)",
      legal: "rgb(0 120 255 / 0.75)",
      check: "rgb(255 0 0 / 0.9)",
      arrow: "rgb(0 150 255 / 0.9)",
      frame: "#000000",
      halo: { b: "#ffffff" },
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
// conferida na fonte original (ver docs/licencas/ e /creditos). `colors`: corpo
// e contorno de cada lado (o mais difícil de cada degradê), usados no teste de
// contraste peça × casa.
type PieceColors = { body: string; outline: string };
export const PIECE_SET_OPTIONS: Record<
  PieceSet,
  {
    label: string;
    author: string;
    license: string;
    source: string;
    colors: { w: PieceColors; b: PieceColors };
  }
> = {
  cburnett: {
    label: "Clássico",
    author: "Colin M.L. Burnett",
    license: "BSD 3-clause",
    source: "https://commons.wikimedia.org/wiki/Category:SVG_chess_pieces",
    colors: {
      w: { body: "#ffffff", outline: "#000000" },
      b: { body: "#000000", outline: "#000000" },
    },
  },
  colorido: {
    label: "Colorido",
    author: "Colin M.L. Burnett (cores da Academia Finale)",
    license: "BSD 3-clause",
    source: "https://commons.wikimedia.org/wiki/Category:SVG_chess_pieces",
    colors: {
      w: { body: "#f4e7c8", outline: "#3b2a1a" },
      b: { body: "#1e3a6e", outline: "#0a1428" },
    },
  },
  chessnut: {
    label: "Moderno",
    author: "Alexis Luengas",
    license: "Apache 2.0",
    source: "https://github.com/LexLuengas/chessnut-pieces",
    colors: {
      w: { body: "#ffffff", outline: "#000000" },
      b: { body: "#000000", outline: "#f2f2f2" },
    },
  },
  fantasy: {
    label: "Fantasia",
    author: "Maurizio Monge",
    license: "MIT",
    source: "https://github.com/maurimo/chess-art",
    colors: {
      w: { body: "#bfd3d7", outline: "#000000" },
      b: { body: "#1c1c2f", outline: "#000000" },
    },
  },
  spatial: {
    label: "Minimalista",
    author: "Maurizio Monge",
    license: "MIT",
    source: "https://github.com/maurimo/chess-art",
    colors: {
      w: { body: "#bfd3d7", outline: "#000000" },
      b: { body: "#1c1c2f", outline: "#000000" },
    },
  },
};

// Pacotes de som (todos gerados por código pela própria Finale).
export const SOUND_PACK_OPTIONS: Record<
  SoundPack,
  { label: string; description: string }
> = {
  suave: { label: "Suave", description: "Discreto, o som de sempre." },
  madeira: { label: "Madeira", description: "Peça de madeira no tabuleiro, com corpo." },
  oco: { label: "Oco", description: "Toc grave e redondo, bem presente." },
  arcade: { label: "Arcade", description: "Bipes e moedinhas de videogame." },
  engracado: { label: "Engraçado", description: "Boing, pop, apito e splat." },
  vibracao: { label: "Só vibração", description: "Sem som: o celular vibra nos lances." },
};

export const pieceUrl = (set: PieceSet, code: string) =>
  `/pieces/${set}/${code}.svg`;
