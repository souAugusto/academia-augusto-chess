// Formato das lições de aberturas e de finais. O conteúdo fica em arquivos .ts
// nesta pasta, separado da interface. Tudo é conferido por
// scripts/validar-conteudo.ts (lances legais, FEN válido, solução definida).

export type StyleTag =
  "atacante" | "posicional" | "tatico" | "defensor" | "universal";
export type Level = "facil" | "medio" | "dificil";
export type Difficulty = 1 | 2 | 3; // 1 = iniciante, 2 = intermediário, 3 = avançado

// Lance em notação SAN do chess.js (Nf3, exd5, O-O, e8=Q). Explicação opcional.
export type ExplainedMove = { san: string; note?: string };

export type QuizQuestion = {
  question: string;
  options: string[];
  answer: number; // índice da opção certa
  explanation: string;
  fen?: string; // posição opcional para a pergunta
};

// Prática de abertura: depois dos lances `before` (a partir da posição inicial),
// o aluno precisa achar `answer`. `alternatives` também valem.
export type OpeningDrill = {
  level: Level;
  before: string[];
  answer: string;
  alternatives?: string[];
  hint: string;
  why: string; // explicação mostrada no erro e no acerto
};

export type OpeningLesson = {
  kind: "abertura";
  slug: string;
  title: string;
  family: string; // agrupa variantes da mesma abertura (ex.: "Siciliana")
  side: "brancas" | "pretas"; // quem o aluno joga nesta lição
  eco: string;
  difficulty: Difficulty;
  styles: StyleTag[];
  summary: string; // uma frase para a lista
  intro: string[]; // parágrafos curtos
  ideas: { white: string[]; black: string[] };
  structure: string; // estrutura de peões típica
  mainLine: ExplainedMove[]; // linha principal, desde o 1º lance
  variations: { name: string; moves: ExplainedMove[]; text: string }[]; // desde o 1º lance
  traps: { name: string; moves: string[]; text: string }[]; // desde o 1º lance
  mistakes: string[];
  practice: OpeningDrill[];
  quiz: QuizQuestion[];
};

export type EndgameGroup =
  "mates" | "peoes" | "torres" | "bispos" | "cavalos" | "damas" | "combinados";

// Prática de final: a partir de `fen`, o aluno joga o primeiro lance de
// `solution`; o site responde com o lance seguinte, e assim por diante
// (lances alternados, sempre começando pelo lado que joga no FEN).
export type EndgameDrill = {
  level: Level;
  fen: string;
  goal: "vencer" | "empatar";
  solution: string[];
  accept?: string[]; // outros primeiros lances também corretos
  hint: string;
  why: string;
};

export type EndgameLesson = {
  kind: "final";
  slug: string;
  title: string;
  group: EndgameGroup;
  difficulty: Difficulty;
  summary: string;
  theory: string[]; // parágrafos curtos
  keyPoints: string[];
  model: {
    fen: string;
    orientation: "white" | "black";
    caption: string;
    moves: ExplainedMove[]; // a partir do FEN
  };
  practice: EndgameDrill[];
  quiz: QuizQuestion[];
};

export type Lesson = OpeningLesson | EndgameLesson;

export const LEVEL_LABELS: Record<Level, string> = {
  facil: "Fácil",
  medio: "Médio",
  dificil: "Difícil",
};

export const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  1: "Iniciante",
  2: "Intermediário",
  3: "Avançado",
};

export const GROUP_LABELS: Record<EndgameGroup, string> = {
  mates: "Mates básicos",
  peoes: "Finais de peões",
  torres: "Finais de torre",
  bispos: "Finais de bispos",
  cavalos: "Finais de cavalos",
  damas: "Finais de dama",
  combinados: "Finais combinados",
};
