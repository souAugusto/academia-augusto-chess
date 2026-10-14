import type { EndgameLesson } from "../types.ts";

export const bispoContraCavalo: EndgameLesson = {
  kind: "final",
  slug: "bispo-contra-cavalo",
  title: "Bispo contra cavalo",
  group: "bispos",
  difficulty: 2,
  summary:
    "O bispo age de longe: segura um peão num canto do tabuleiro enquanto ajuda o outro a promover. Com peões nas duas alas, ele costuma ser melhor que o cavalo.",
  theory: [
    "A grande vantagem do bispo sobre o cavalo é o alcance. De uma diagonal, ele vigia casas dos dois lados do tabuleiro ao mesmo tempo. O cavalo é lento: precisa de vários lances para atravessar o tabuleiro.",
    "Por isso o bispo brilha em posições abertas, com peões nas duas alas e peões passados afastados. O cavalo tem dificuldade especial com peões de torre e com peões que avançam longe dele.",
    "Use o bispo para frear o peão adversário (vigiando a casa de promoção ou o caminho) e empurre o seu peão passado do outro lado, onde o cavalo não chega a tempo.",
  ],
  keyPoints: [
    "O bispo age de longe; o cavalo é lento.",
    "Com peões nas duas alas, o bispo costuma ser melhor.",
    "Use o bispo para frear o peão adversário à distância.",
    "Peões passados afastados e peões de torre são difíceis para o cavalo.",
  ],
  model: {
    fen: "6k1/8/8/5n2/1P6/7p/3P3B/1K6 w - - 0 1",
    orientation: "white",
    caption: "O bispo segura o peão h e o peão b corre longe do cavalo.",
    moves: [
      { san: "b5", note: "O bispo de h2 já vigia o peão h3. O peão b avança." },
      { san: "Kf7" },
      { san: "b6", note: "O cavalo está longe demais para alcançar b8." },
      { san: "Ne7" },
      { san: "Kc2" },
      {
        san: "Nc6",
        note: "O cavalo bloqueia, mas o rei branco vai apoiar o peão.",
      },
      { san: "b7" },
    ],
  },
  practice: [
    {
      level: "facil",
      fen: "8/P7/8/2n5/8/8/k7/2K4B w - - 0 1",
      goal: "vencer",
      solution: ["a8=Q+"],
      hint: "O cavalo não alcança a casa de promoção.",
      why: "a8=D+: o cavalo de c5 não controla a8, e a nova dama ainda dá xeque.",
    },
    {
      level: "medio",
      fen: "6k1/8/8/5n2/1P6/7p/3P3B/1K6 w - - 0 1",
      goal: "vencer",
      solution: ["b5"],
      hint: "O bispo já freia o peão h. Avance o seu peão passado do outro lado.",
      why: "b5! O cavalo está longe e não chega a tempo de parar o peão b.",
    },
    {
      level: "medio",
      fen: "8/7B/5P2/6P1/8/K3k3/p7/2n5 w - - 0 1",
      goal: "vencer",
      solution: ["Kb2"],
      hint: "O peão a2 é perigoso. O seu rei está perto dele.",
      why: "Rb2 ataca o peão a2. Depois, os peões f e g avançam com o apoio do bispo.",
    },
    {
      level: "dificil",
      fen: "6n1/k7/3B2P1/P7/5K2/8/6p1/8 w - - 0 1",
      goal: "vencer",
      solution: ["Bc5+"],
      hint: "Um xeque que também coloca o bispo na diagonal do peão g2.",
      why: "Bc5+ ganha um tempo com o xeque e, na diagonal a7-g1, o bispo vigia g1.",
    },
    {
      level: "dificil",
      fen: "k7/8/p2Pn3/8/7B/6P1/2K5/8 w - - 0 1",
      goal: "vencer",
      solution: ["d7"],
      hint: "O bispo de h4 já vigia a casa de promoção do peão d.",
      why: "d7! O bispo controla d8 pela diagonal h4-d8, e o cavalo precisa se sacrificar pelo peão.",
    },
  ],
  quiz: [
    {
      question: "Qual é a principal vantagem do bispo sobre o cavalo?",
      options: [
        "O alcance: ele age de longe, nos dois lados do tabuleiro",
        "Ele pode mudar de cor de casa",
        "Ele pula sobre as peças",
      ],
      answer: 0,
      explanation:
        "De uma diagonal o bispo vigia casas distantes; o cavalo precisa de vários lances.",
    },
    {
      question: "Em que tipo de posição o bispo costuma ser melhor?",
      options: [
        "Abertas, com peões nas duas alas",
        "Fechadas, com peões bloqueados no centro",
        "Só no começo da partida",
      ],
      answer: 0,
      explanation: "Com o jogo aberto, o alcance do bispo pesa mais.",
    },
    {
      question: "Que peão costuma ser difícil para o cavalo parar?",
      options: ["O peão de torre", "O peão central", "O peão do bispo"],
      answer: 0,
      explanation: "No canto o cavalo tem poucas casas para se aproximar.",
    },
  ],
};
