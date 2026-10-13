import type { EndgameLesson } from "../types.ts";

export const torreAtrasDoPassado: EndgameLesson = {
  kind: "final",
  slug: "torre-atras-do-peao-passado",
  title: "Torre atrás do peão passado",
  group: "torres",
  difficulty: 2,
  summary:
    "A regra de Tarrasch: a torre fica atrás do peão passado, seja o seu ou o do adversário.",
  theory: [
    "Nos finais de torre, o melhor lugar para a torre é atrás do peão passado. Atrás do próprio peão, a torre ganha força a cada avanço, porque a coluna fica cada vez mais livre. Na frente do peão, ela fica presa e só bloqueia.",
    "Para o defensor vale a mesma regra: a torre atrás do peão adversário o persegue e fica ativa. A torre que bloqueia na frente do peão vira uma peça passiva, e o rei adversário fica livre para atacar os outros peões.",
    "Com a torre bem colocada, o plano do atacante é simples: avançar o peão para prender a torre adversária e depois usar o próprio rei contra os peões do outro lado.",
  ],
  keyPoints: [
    "Torre atrás do peão passado, o seu ou o do adversário.",
    "Atrás do próprio peão, a torre fica mais forte a cada avanço.",
    "Torre na frente do peão adversário fica passiva.",
    "Com a torre adversária presa, o rei atacante vai pegar peões do outro lado.",
  ],
  model: {
    fen: "6k1/1r3pp1/7p/8/P7/7P/5PP1/R5K1 w - - 0 1",
    orientation: "white",
    caption:
      "Torre branca atrás do peão a, torre preta na frente: o rei branco fica livre.",
    moves: [
      { san: "a5", note: "O peão avança com o apoio da torre por trás." },
      { san: "Ra7", note: "A torre preta precisa bloquear e fica passiva." },
      { san: "a6", note: "Agora a torre preta não sai mais da coluna a." },
      { san: "Kf8" },
      {
        san: "Kh2",
        note: "O rei branco vai para o centro, rumo aos peões pretos.",
      },
      { san: "Ke7" },
      { san: "Kg3" },
      { san: "Kd6" },
      { san: "Kf4", note: "O rei branco vai atacar os peões da ala do rei." },
      { san: "h5" },
      { san: "Kg5" },
      { san: "Kc5" },
    ],
  },
  practice: [
    {
      level: "facil",
      fen: "6k1/1r3pp1/7p/8/P7/7P/5PP1/R5K1 w - - 0 1",
      goal: "vencer",
      solution: ["a5"],
      hint: "A sua torre já está atrás do peão. Empurre.",
      why: "a5 avança com o apoio da torre. Cada avanço deixa a torre branca mais forte e a preta mais presa.",
    },
    {
      level: "facil",
      fen: "6k1/5pp1/7p/8/P7/7P/1r3PP1/R5K1 w - - 0 1",
      goal: "vencer",
      solution: ["a5"],
      accept: ["Kf1"],
      hint: "Use a torre de a1 atrás do peão.",
      why: "a5 empurra o peão com a torre atrás dele. A torre preta vai ter que voltar para bloquear.",
    },
    {
      level: "medio",
      fen: "r5k1/5pp1/7p/P7/8/7P/5PP1/1R4K1 b - - 0 1",
      goal: "empatar",
      solution: ["Rxa5"],
      hint: "A torre branca não está atrás do peão. O peão está protegido?",
      why: "...Txa5 pega o peão: a torre branca estava na coluna b, não atrás do peão.",
    },
    {
      level: "medio",
      fen: "1k6/1pp3r1/p7/8/7P/P7/1PP5/1K5R w - - 0 1",
      goal: "vencer",
      solution: ["h5"],
      hint: "A mesma ideia, do outro lado: torre atrás do peão h.",
      why: "h5 avança com a torre atrás. A torre preta vai ficar presa na frente do peão.",
    },
    {
      level: "dificil",
      fen: "6k1/5pp1/7p/1P6/8/7P/r4PP1/1R4K1 w - - 0 1",
      goal: "vencer",
      solution: ["Kf1"],
      accept: ["b6"],
      hint: "A torre já está atrás do peão. Traga o rei.",
      why: "Rf1 tira o rei da primeira fileira e o leva ao centro. O peão b pode esperar, protegido pela torre.",
    },
    {
      level: "dificil",
      fen: "1k5r/1pp5/p7/7P/8/P7/1PP5/1K4R1 b - - 0 1",
      goal: "empatar",
      solution: ["Rxh5"],
      hint: "A torre branca não protege o peão h.",
      why: "...Txh5 pega o peão passado. Com a torre branca fora da coluna h, o peão estava sem defesa.",
    },
  ],
  quiz: [
    {
      question: "Onde a torre deve ficar em relação a um peão passado?",
      options: [
        "Atrás dele, seja o seu ou o do adversário",
        "Na frente dele",
        "Ao lado dele",
      ],
      answer: 0,
      explanation:
        "É a regra de Tarrasch: atrás do peão a torre ganha atividade.",
    },
    {
      question: "Por que a torre na frente do peão adversário é ruim?",
      options: [
        "Porque fica passiva, só bloqueando",
        "Porque pode ser capturada pelo peão",
        "Porque perde o roque",
      ],
      answer: 0,
      explanation: "Presa na frente do peão, ela não ajuda em mais nada.",
    },
    {
      question: "Depois de prender a torre adversária, qual é o plano?",
      options: [
        "Levar o rei para atacar os peões do outro lado",
        "Trocar as torres",
        "Avançar todos os peões ao mesmo tempo",
      ],
      answer: 0,
      explanation: "Com a torre adversária presa, o rei atacante fica livre.",
    },
  ],
};
