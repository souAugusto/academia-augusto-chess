import type { EndgameLesson } from "../types.ts";

export const casasChave: EndgameLesson = {
  kind: "final",
  slug: "peao-central-casas-chave",
  title: "Peão central e casas-chave",
  group: "peoes",
  difficulty: 2,
  summary:
    "Para promover o peão, o rei atacante não precisa acompanhar o peão: precisa chegar às casas-chave.",
  theory: [
    "Em rei e peão contra rei, as casas-chave são as casas que, se o rei atacante ocupar, garantem a vitória não importa quem esteja na vez. Para um peão central que ainda não passou da metade do tabuleiro, as casas-chave ficam duas fileiras à frente do peão: na mesma coluna e nas duas colunas vizinhas.",
    "Por exemplo, com o peão em e2, e3 ou e4, as casas-chave são d6, e6 e f6 para o peão em e4, e d4, e4 e f4 para o peão em e2. Quando o peão chega à quinta fileira, as casas-chave passam a incluir também as da fileira logo à frente dele (com o peão em e5: d6, e6, f6, d7, e7 e f7).",
    "Para o atacante: leve o rei primeiro, o peão depois. Para o defensor: impeça o rei adversário de chegar às casas-chave, usando a oposição.",
  ],
  keyPoints: [
    "Casas-chave: duas fileiras à frente do peão, na coluna dele e nas vizinhas.",
    "Rei na casa-chave = vitória, seja quem for a vez.",
    "Atacante: rei na frente, peão depois.",
    "Defensor: use a oposição para barrar o caminho até as casas-chave.",
  ],
  model: {
    fen: "8/8/4k3/8/3K4/8/4P3/8 w - - 0 1",
    orientation: "white",
    caption: "O rei branco corre para as casas-chave antes de mexer o peão.",
    moves: [
      {
        san: "Ke4",
        note: "Oposição: os reis ficam frente a frente na coluna e.",
      },
      { san: "Kf6" },
      { san: "Kd5", note: "O rei contorna e se aproxima das casas-chave." },
      { san: "Kg6" },
      { san: "Ke5", note: "Agora o rei controla o caminho do peão inteiro." },
      { san: "Kg7" },
      { san: "e4", note: "Só agora o peão avança, com o rei na frente dele." },
      { san: "Kf7" },
    ],
  },
  practice: [
    {
      level: "facil",
      fen: "8/8/8/2k1P3/8/4K3/8/8 w - - 0 1",
      goal: "vencer",
      solution: ["Kf4"],
      accept: ["Ke4"],
      hint: "As casas-chave do peão e5 incluem d6, e6 e f6. Leve o rei para lá.",
      why: "Rf4 (ou Re4) corre para as casas-chave. O rei preto está longe demais para impedir.",
    },
    {
      level: "medio",
      fen: "8/8/4k3/8/3K4/8/4P3/8 w - - 0 1",
      goal: "vencer",
      solution: ["Ke4"],
      hint: "Tome a oposição e caminhe para as casas-chave.",
      why: "Re4 toma a oposição. O rei preto precisa ceder e o rei branco chega às casas-chave.",
    },
    {
      level: "medio",
      fen: "8/8/8/3k4/8/2K5/3P4/8 w - - 0 1",
      goal: "vencer",
      solution: ["Kd3"],
      hint: "Coloque o rei em frente ao peão, em oposição ao rei preto.",
      why: "Rd3 toma a oposição na coluna d. As pretas precisam ceder, e o rei branco avança para as casas-chave.",
    },
    {
      level: "medio",
      fen: "8/4k3/8/8/2K5/8/4P3/8 w - - 0 1",
      goal: "vencer",
      solution: ["Kd5"],
      accept: ["Kd4", "Kd3", "Kc5", "Kc3"],
      hint: "Rei primeiro, peão depois.",
      why: "O rei corre para as casas-chave à frente do peão. O peão fica atrás, protegido.",
    },
    {
      level: "dificil",
      fen: "8/8/8/2k5/8/3K4/3P4/8 b - - 0 1",
      goal: "empatar",
      solution: ["Kd5"],
      hint: "Barre o caminho do rei branco às casas-chave. Use a oposição.",
      why: "...Rd5 toma a oposição. O rei branco não chega às casas-chave c4, d4 e e4 com o rei preto bloqueando.",
    },
    {
      level: "dificil",
      fen: "8/3k4/8/8/3K4/3P4/8/8 b - - 0 1",
      goal: "empatar",
      solution: ["Kd6"],
      hint: "Fique na coluna do peão, em oposição ao rei branco.",
      why: "...Rd6 toma a oposição e impede o rei branco de chegar às casas-chave da quinta fileira.",
    },
  ],
  quiz: [
    {
      question: "O que são casas-chave?",
      options: [
        "Casas que, ocupadas pelo rei atacante, garantem a vitória",
        "As casas de promoção",
        "As casas do centro",
      ],
      answer: 0,
      explanation:
        "Com o rei numa casa-chave, o peão promove, seja quem for a vez.",
    },
    {
      question: "Quais são as casas-chave do peão em e4?",
      options: ["d6, e6 e f6", "d5, e5 e f5", "e7 e e8"],
      answer: 0,
      explanation:
        "Duas fileiras à frente do peão, na coluna dele e nas vizinhas.",
    },
    {
      question: "Qual é a regra para o atacante?",
      options: [
        "Rei primeiro, peão depois",
        "Peão primeiro, rei depois",
        "Trocar o peão",
      ],
      answer: 0,
      explanation:
        "O rei abre caminho para o peão; o peão apressado costuma empatar.",
    },
  ],
};
