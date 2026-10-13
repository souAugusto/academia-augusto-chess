import type { EndgameLesson } from "../types.ts";

export const oposicaoDistante: EndgameLesson = {
  kind: "final",
  slug: "oposicao-distante",
  title: "Oposição distante",
  group: "peoes",
  difficulty: 2,
  summary:
    "A oposição também vale de longe: reis na mesma coluna com três ou cinco casas entre eles.",
  theory: [
    "Na oposição direta os reis ficam a uma casa de distância. Na oposição distante eles ficam na mesma coluna (ou fileira) com um número ímpar de casas entre eles: três ou cinco.",
    "A oposição distante prepara a oposição direta. Quem a toma de longe consegue mantê-la a cada aproximação: se o adversário avança uma casa, você avança outra e continua em oposição, até chegar à oposição direta no momento decisivo.",
    "Use-a quando os reis estão longe do peão. Para o atacante, é o caminho para chegar às casas-chave; para o defensor, é o jeito de barrar o rei adversário bem antes de ele se aproximar.",
  ],
  keyPoints: [
    "Oposição distante: mesma coluna, número ímpar de casas entre os reis.",
    "Ela se transforma em oposição direta quando os reis se aproximam.",
    "Conte as casas entre os reis antes de mover o seu.",
    "Funciona para o atacante e para o defensor.",
  ],
  model: {
    fen: "4k3/8/8/8/8/8/1P6/5K2 w - - 0 1",
    orientation: "white",
    caption:
      "Re2! toma a oposição distante (cinco casas entre os reis) e o rei branco chega às casas-chave.",
    moves: [
      {
        san: "Ke2",
        note: "Reis na coluna e, com cinco casas entre eles: oposição distante.",
      },
      { san: "Kd7" },
      {
        san: "Kd3",
        note: "O rei preto foi para a coluna d; o branco acompanha.",
      },
      { san: "Kc7" },
      {
        san: "Kc4",
        note: "O rei branco se aproxima das casas-chave do peão b (a3, b3 e c3 já estão ao alcance).",
      },
      { san: "Kc6" },
      {
        san: "b3",
        note: "Um lance de peão de reserva entrega a vez às pretas.",
      },
      { san: "Kb6" },
      { san: "Kb4" },
      { san: "Kb7" },
      {
        san: "Ka5",
        note: "O rei branco chega às casas-chave e o peão vai promover.",
      },
      { san: "Kc6" },
    ],
  },
  practice: [
    {
      level: "facil",
      fen: "4k3/8/8/8/8/8/1P6/5K2 w - - 0 1",
      goal: "vencer",
      solution: ["Ke2"],
      hint: "Coloque o seu rei na coluna do rei preto, com um número ímpar de casas entre eles.",
      why: "Re2 toma a oposição distante. O rei branco vai acompanhar o preto até chegar às casas-chave.",
    },
    {
      level: "facil",
      fen: "3k4/8/8/8/8/8/6P1/2K5 w - - 0 1",
      goal: "vencer",
      solution: ["Kd2"],
      hint: "Mesma ideia: oposição distante na coluna do rei preto.",
      why: "Rd2 toma a oposição distante (cinco casas entre os reis).",
    },
    {
      level: "medio",
      fen: "8/8/2k5/8/8/8/2PK4/8 b - - 0 1",
      goal: "empatar",
      solution: ["Kd6"],
      hint: "Agora você defende. Barre o rei branco de longe.",
      why: "...Rd6 toma a oposição distante na coluna d. O rei branco não consegue passar.",
    },
    {
      level: "medio",
      fen: "8/8/5k2/8/8/8/4KP2/8 b - - 0 1",
      goal: "empatar",
      solution: ["Ke6"],
      hint: "Coloque o seu rei na coluna do rei branco.",
      why: "...Re6 toma a oposição distante na coluna e e segura o empate.",
    },
    {
      level: "dificil",
      fen: "8/4k3/8/8/8/5KP1/8/8 b - - 0 1",
      goal: "empatar",
      solution: ["Kf7"],
      hint: "Conte as casas entre os reis na coluna f.",
      why: "...Rf7 deixa três casas entre os reis na coluna f: oposição distante.",
    },
    {
      level: "dificil",
      fen: "4k3/8/8/8/8/1P1K4/8/8 b - - 0 1",
      goal: "empatar",
      solution: ["Kd7"],
      hint: "O rei branco está em d3. Onde o seu rei toma a oposição de longe?",
      why: "...Rd7 deixa três casas entre os reis na coluna d: oposição distante.",
    },
  ],
  quiz: [
    {
      question: "Quando os reis estão em oposição distante?",
      options: [
        "Na mesma coluna, com três ou cinco casas entre eles",
        "Na mesma coluna, com duas casas entre eles",
        "Em diagonal, encostados",
      ],
      answer: 0,
      explanation:
        "Número ímpar de casas entre eles, como na oposição direta (uma casa).",
    },
    {
      question: "Para que serve a oposição distante?",
      options: [
        "Para chegar à oposição direta no momento decisivo",
        "Para dar xeque",
        "Para proteger o peão",
      ],
      answer: 0,
      explanation:
        "Quem a mantém a cada aproximação acaba com a oposição direta.",
    },
    {
      question: "Quem pode usar a oposição distante?",
      options: ["O atacante e o defensor", "Só o atacante", "Só o defensor"],
      answer: 0,
      explanation:
        "O atacante abre caminho; o defensor barra o rei adversário.",
    },
  ],
};
