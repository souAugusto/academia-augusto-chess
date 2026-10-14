import type { EndgameLesson } from "../types.ts";

export const lucena: EndgameLesson = {
  kind: "final",
  slug: "posicao-de-lucena",
  title: "Posição de Lucena",
  group: "torres",
  difficulty: 2,
  summary:
    "Como vencer com torre e peão contra torre: cortar o rei adversário e construir a ponte.",
  theory: [
    "A posição de Lucena é a vitória mais importante dos finais de torre. O peão está na sétima fileira, o rei do atacante está na casa de promoção e o rei defensor está cortado a uma coluna de distância. A torre defensora fica dando xeques pelo lado.",
    'O método tem dois passos. Primeiro, cortar o rei adversário mais uma coluna com um xeque da torre. Depois, "construir a ponte": levar a torre para a quarta fileira. Quando o rei sair da frente do peão e os xeques começarem, a torre se coloca entre o rei e a torre adversária e bloqueia os xeques.',
    "Sem a ponte, o rei atacante não consegue escapar dos xeques laterais. Com ela, o peão promove.",
  ],
  keyPoints: [
    "Primeiro corte o rei adversário com um xeque da torre.",
    "Leve a torre para a quarta fileira (a ponte).",
    "Saia com o rei da frente do peão e aproxime-se da torre nos xeques.",
    "Bloqueie o xeque com a torre na quarta fileira.",
  ],
  model: {
    fen: "1K1k4/1P6/8/8/8/8/r7/2R5 w - - 0 1",
    orientation: "white",
    caption: "Lucena: cortar o rei e construir a ponte na quarta fileira.",
    moves: [
      {
        san: "Rd1+",
        note: "Primeiro passo: o rei preto é afastado mais uma coluna.",
      },
      { san: "Ke7" },
      {
        san: "Rd4",
        note: "Segundo passo: a torre vai para a quarta fileira, preparando a ponte.",
      },
      { san: "Ra1" },
      { san: "Kc7", note: "O rei sai da frente do peão. Começam os xeques." },
      { san: "Rc1+" },
      { san: "Kb6" },
      { san: "Rb1+" },
      { san: "Kc6" },
      { san: "Rc1+" },
      { san: "Kb5" },
      { san: "Rb1+" },
      {
        san: "Rb4",
        note: "A ponte: a torre bloqueia o xeque e o peão vai promover.",
      },
    ],
  },
  practice: [
    {
      level: "facil",
      fen: "8/1P2k3/8/1K6/3R4/8/1r6/8 w - - 0 1",
      goal: "vencer",
      solution: ["Rb4"],
      accept: ["Kc6"],
      hint: "Bloqueie o xeque com a torre.",
      why: "Tb4 é a ponte: a torre bloqueia o xeque e as pretas não conseguem mais parar o peão.",
    },
    {
      level: "facil",
      fen: "1K6/1P2k3/8/8/1R6/8/8/r7 w - - 0 1",
      goal: "vencer",
      solution: ["Kc7"],
      accept: ["Kc8"],
      hint: "A torre já está na quarta fileira. Saia com o rei da frente do peão.",
      why: "Rc7 libera o peão. Se as pretas derem xeques, o rei se aproxima da torre e a ponte bloqueia.",
    },
    {
      level: "medio",
      fen: "1K1k4/1P6/8/8/8/8/r7/2R5 w - - 0 1",
      goal: "vencer",
      solution: ["Rd1+", "Ke7", "Rd4"],
      hint: "Corte o rei preto com um xeque e depois prepare a ponte.",
      why: "Td1+ afasta o rei preto. Td4 prepara a ponte na quarta fileira.",
    },
    {
      level: "dificil",
      fen: "1K6/1P2k3/8/8/3R4/8/r7/8 w - - 0 1",
      goal: "vencer",
      solution: [
        "Kc7",
        "Rc2+",
        "Kb6",
        "Rb2+",
        "Kc6",
        "Rc2+",
        "Kb5",
        "Rb2+",
        "Rb4",
      ],
      hint: "Saia da frente do peão e se aproxime da torre a cada xeque.",
      why: "O rei sobe em zigue-zague até b5, e Tb4 bloqueia o último xeque. É a ponte completa.",
    },
    {
      level: "dificil",
      fen: "2r5/R7/8/8/8/8/1p6/1k1K4 b - - 0 1",
      goal: "vencer",
      solution: ["Rd8+", "Ke2", "Rd5"],
      hint: "Agora você está com as pretas. Corte o rei branco e prepare a ponte.",
      why: "...Td8+ afasta o rei branco e ...Td5 prepara a ponte na quinta fileira (a quarta do ponto de vista das pretas).",
    },
  ],
  quiz: [
    {
      question: "Quais são os dois passos da técnica de Lucena?",
      options: [
        "Cortar o rei adversário e construir a ponte",
        "Trocar as torres e avançar o peão",
        "Dar xeques até o empate",
      ],
      answer: 0,
      explanation:
        "Primeiro o corte com xeque, depois a torre na quarta fileira para bloquear os xeques.",
    },
    {
      question: "Para que serve a ponte?",
      options: [
        "Bloquear os xeques laterais com a torre",
        "Proteger o peão por trás",
        "Atacar a torre adversária",
      ],
      answer: 0,
      explanation:
        "A torre se coloca entre o rei e a torre adversária e acaba com os xeques.",
    },
    {
      question: "Em qual fileira a torre constrói a ponte (para as brancas)?",
      options: [
        "Na quarta fileira",
        "Na primeira fileira",
        "Na oitava fileira",
      ],
      answer: 0,
      explanation:
        "Da quarta fileira a torre chega a tempo de bloquear o xeque quando o rei sobe.",
    },
  ],
};
