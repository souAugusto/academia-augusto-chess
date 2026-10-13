import { describe, expect, it } from "vitest";
import { ALL_LESSONS } from "@/content/licoes";
import type { EndgameLesson, OpeningLesson } from "@/content/licoes/types";
import { validateEndgame, validateLessons, validateOpening } from "./validate";

const quiz = [1, 2, 3].map((n) => ({
  question: `Pergunta ${n}?`,
  options: ["Sim", "Não"],
  answer: 0,
  explanation: "Porque sim.",
}));

const opening: OpeningLesson = {
  kind: "abertura",
  slug: "teste",
  title: "Abertura de teste",
  family: "Teste",
  side: "brancas",
  eco: "C50",
  difficulty: 1,
  styles: ["atacante"],
  summary: "Resumo da lição.",
  intro: ["Introdução."],
  ideas: { white: ["Atacar f7."], black: ["Defender f7."] },
  structure: "Centro aberto.",
  mainLine: [
    { san: "e4", note: "Ocupa o centro." },
    { san: "e5" },
    { san: "Nf3" },
    { san: "Nc6" },
    { san: "Bc4" },
  ],
  variations: [],
  traps: [
    {
      name: "Mate pastor",
      moves: ["e4", "e5", "Qh5", "Nc6", "Bc4", "Nf6", "Qxf7#"],
      text: "Cuidado com f7.",
      favors: "brancas",
    },
  ],
  mistakes: ["Esquecer f7."],
  practice: [
    {
      level: "facil",
      before: [],
      answer: "e4",
      hint: "Centro.",
      why: "Ocupa o centro.",
    },
    {
      level: "medio",
      before: ["e4", "e5"],
      answer: "Nf3",
      hint: "Ataque e5.",
      why: "Desenvolve.",
    },
    {
      level: "dificil",
      before: ["e4", "e5", "Nf3", "Nc6"],
      answer: "Bc4",
      alternatives: ["Bb5"],
      hint: "Bispo.",
      why: "Mira f7.",
    },
  ],
  quiz,
};

const endgame: EndgameLesson = {
  kind: "final",
  slug: "teste-final",
  title: "Final de teste",
  group: "mates",
  difficulty: 1,
  summary: "Mate com dama.",
  theory: ["Teoria."],
  keyPoints: ["Use o rei."],
  model: {
    fen: "8/8/8/4k3/8/8/8/4K2Q w - - 0 1",
    orientation: "white",
    caption: "Modelo.",
    moves: [{ san: "Qh5+", note: "Corta." }],
  },
  practice: [
    "6k1/8/6K1/8/8/8/8/7Q w - - 0 1",
    "7k/8/6K1/8/8/8/8/1Q6 w - - 0 1",
    "k7/8/1K6/8/8/8/8/7Q w - - 0 1",
    "7k/8/6K1/8/8/8/8/Q7 w - - 0 1",
    "k7/8/2K5/8/8/8/8/7Q w - - 0 1",
  ].map((fen, index) => ({
    level: index < 2 ? "facil" : "medio",
    fen,
    goal: "vencer",
    solution: [
      index === 0
        ? "Qa8#"
        : index === 1
          ? "Qb8#"
          : index === 2
            ? "Qh8#"
            : index === 3
              ? "Qa8#"
              : "Qh8+",
    ],
    hint: "Procure o mate.",
    why: "Mate na última fileira.",
  })),
  quiz,
};

describe("validateOpening", () => {
  it("aceita lição correta", () => {
    expect(validateOpening(opening)).toEqual([]);
  });

  it("acusa lance ilegal, prática da cor errada e quiz curto", () => {
    const broken: OpeningLesson = {
      ...opening,
      mainLine: [...opening.mainLine, { san: "Qxf7#" }],
      practice: [
        ...opening.practice,
        { level: "facil", before: ["e4"], answer: "e5", hint: "x", why: "xxx" },
      ],
      quiz: quiz.slice(0, 2),
    };
    const errors = validateOpening(broken).join("\n");
    expect(errors).toContain('lance 6 "Qxf7#" é ilegal');
    expect(errors).toContain("a lição é com as brancas");
    expect(errors).toContain("3 a 5 perguntas");
  });
});

describe("alfabeto", () => {
  it("acusa letra cirílica no texto", () => {
    const lesson = { ...opening, summary: "Pressão com ...Dа5" };
    expect(validateLessons([lesson]).join(" ")).toContain("outro alfabeto");
  });
});

describe("estilos", () => {
  it("acusa estilo que não existe no questionário", () => {
    const lesson = {
      ...opening,
      styles: ["estrategico"],
    } as unknown as OpeningLesson;
    expect(validateOpening(lesson).join(" ")).toContain("estilo desconhecido");
  });
});

describe("validateEndgame", () => {
  it("aceita lição correta", () => {
    expect(validateEndgame(endgame)).toEqual([]);
  });

  it("acusa FEN inválido, solução vazia e poucas posições", () => {
    const broken: EndgameLesson = {
      ...endgame,
      practice: [
        { ...endgame.practice[0], fen: "8/8/8 w - - 0 1" },
        { ...endgame.practice[1], solution: [] },
      ],
    };
    const errors = validateEndgame(broken).join("\n");
    expect(errors).toContain("FEN inválido");
    expect(errors).toContain("sem solução definida");
    expect(errors).toContain("pelo menos 5 posições");
  });
});

describe("conteúdo publicado", () => {
  it("todas as lições do site passam na validação", () => {
    expect(validateLessons(ALL_LESSONS)).toEqual([]);
  });

  it("acusa slug repetido", () => {
    expect(validateLessons([opening, opening]).join()).toContain(
      "slug repetido",
    );
  });
});

describe("notação de xeque e mate", () => {
  it("acusa xeque ou mate escrito errado", () => {
    const wrongMate: OpeningLesson = {
      ...opening,
      traps: [
        {
          name: "x",
          moves: ["e4", "e5", "Qh5", "Nc6", "Bc4", "Nf6", "Qxf7+"],
          text: "Mate.",
          favors: "brancas",
        },
      ],
    };
    expect(validateOpening(wrongMate).join()).toContain(
      'escrito "Qxf7+", mas o certo é "Qxf7#"',
    );
  });
});
