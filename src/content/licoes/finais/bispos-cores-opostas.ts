import type { EndgameLesson } from "../types.ts";

export const bisposCoresOpostas: EndgameLesson = {
  kind: "final",
  slug: "bispos-de-cores-opostas",
  title: "Bispos de cores opostas",
  group: "bispos",
  difficulty: 2,
  summary:
    "Cada bispo domina casas que o outro nunca alcança. Por isso o defensor costuma empatar mesmo com peões a menos.",
  theory: [
    "Quando um lado tem bispo de casas claras e o outro de casas escuras, os bispos nunca se enfrentam. O defensor usa isso: coloca o bispo numa diagonal que controla a casa de promoção (ou as casas por onde o peão precisa passar), e o peão não consegue avançar.",
    "Por isso finais de bispos de cores opostas são famosos por empatar, às vezes com dois ou até três peões a menos. O atacante só costuma vencer com peões passados bem separados, que o bispo defensor não consegue vigiar ao mesmo tempo.",
    "Para defender: ache a diagonal certa e mantenha o bispo nela. Muitas vezes basta sacrificar o bispo pelo último peão, quando o adversário não tem mais como vencer.",
  ],
  keyPoints: [
    "Bispos de cores opostas nunca se enfrentam.",
    "O defensor controla a casa de promoção com o bispo.",
    "Peões nas casas da cor do bispo adversário são bloqueáveis por ele.",
    "Muitos desses finais são empate, mesmo com material a menos.",
  ],
  model: {
    fen: "8/1b2P3/7p/4P3/7k/8/1B3K2/8 b - - 0 1",
    orientation: "black",
    caption: "Com um peão a menos, as pretas empatam controlando a casa e8.",
    moves: [
      {
        san: "Bc6",
        note: "O bispo de casas claras vigia e8, a casa de promoção do peão e7.",
      },
      { san: "e8=Q", note: "Se o peão promover, o bispo captura a dama." },
      { san: "Bxe8" },
      { san: "Kf3" },
      { san: "Kg5", note: "O peão e5 sozinho, contra rei e bispo, não vence." },
      { san: "Bc1+" },
    ],
  },
  practice: [
    {
      level: "facil",
      fen: "2b5/P5pk/8/8/8/2B5/P2K4/8 b - - 0 1",
      goal: "empatar",
      solution: ["Bb7"],
      hint: "O peão a7 quer promover em a8. Que casa o seu bispo precisa vigiar?",
      why: "...Bb7 controla a8: o peão a7 nunca promove.",
    },
    {
      level: "facil",
      fen: "8/3P2b1/p7/3P4/k7/8/2K3B1/8 b - - 0 1",
      goal: "empatar",
      solution: ["Bf6"],
      hint: "O peão d7 vai promover em d8. Use o bispo de casas escuras.",
      why: "...Bf6 vigia d8. Se o peão promover, o bispo captura.",
    },
    {
      level: "medio",
      fen: "8/1b2P3/7p/4P3/7k/8/1B3K2/8 b - - 0 1",
      goal: "empatar",
      solution: ["Bc6"],
      hint: "Controle a casa de promoção do peão e7.",
      why: "...Bc6 vigia e8. O peão e5 que sobra não basta para vencer.",
    },
    {
      level: "medio",
      fen: "7k/8/b4K1B/8/3P4/7p/1P6/8 w - - 0 1",
      goal: "empatar",
      solution: ["Bf4"],
      hint: "O peão h3 das pretas é perigoso. Vigie o caminho dele.",
      why: "Bf4 controla h2: o peão h3 não avança. Com o bispo vigiando, o jogo empata.",
    },
    {
      level: "medio",
      fen: "k7/8/B1K4b/8/4P3/p7/6P1/8 w - - 0 1",
      goal: "empatar",
      solution: ["Bc4"],
      hint: "A mesma ideia, do outro lado: pare o peão a3.",
      why: "Bc4 vigia a2, por onde o peão a3 precisa passar.",
    },
    {
      level: "dificil",
      fen: "2K5/7B/1b6/6k1/2P5/8/4P2p/8 w - - 0 1",
      goal: "empatar",
      solution: ["Be4"],
      hint: "O peão h2 está a um passo de promover. Só o bispo chega a tempo.",
      why: "Be4 vigia h1. Os peões brancos não ganham sozinhos e o jogo empata.",
    },
    {
      level: "dificil",
      fen: "5K2/B7/6b1/1k6/5P2/8/p2P4/8 w - - 0 1",
      goal: "empatar",
      solution: ["Bd4"],
      hint: "Vigie a casa de promoção do peão a2.",
      why: "Bd4 controla a1 pela diagonal longa: o peão a2 não promove.",
    },
  ],
  quiz: [
    {
      question:
        "Por que os finais de bispos de cores opostas costumam empatar?",
      options: [
        "Porque cada bispo controla casas que o outro nunca alcança",
        "Porque os bispos se trocam logo",
        "Porque os reis ficam presos",
      ],
      answer: 0,
      explanation:
        "O defensor bloqueia os peões nas casas da cor do seu bispo.",
    },
    {
      question: "Qual é a primeira ideia do defensor?",
      options: [
        "Colocar o bispo na diagonal que vigia a casa de promoção",
        "Trocar os peões",
        "Atacar com o rei",
      ],
      answer: 0,
      explanation:
        "Com a casa de promoção vigiada, o peão não consegue virar dama.",
    },
    {
      question: "Quando o atacante costuma vencer nesses finais?",
      options: [
        "Com peões passados bem separados",
        "Com um peão a mais, sempre",
        "Nunca",
      ],
      answer: 0,
      explanation:
        "Peões longe um do outro obrigam o bispo defensor a vigiar duas frentes.",
    },
  ],
};
