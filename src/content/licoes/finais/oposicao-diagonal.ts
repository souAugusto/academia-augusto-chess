import type { EndgameLesson } from "../types.ts";

export const oposicaoDiagonal: EndgameLesson = {
  kind: "final",
  slug: "oposicao-diagonal",
  title: "Oposição diagonal",
  group: "peoes",
  difficulty: 2,
  summary:
    "Reis na mesma diagonal com uma casa entre eles também estão em oposição, e ela vira oposição direta no lance seguinte.",
  theory: [
    "Quando os reis estão na mesma diagonal com uma casa vazia entre eles (por exemplo, d4 e f6), eles estão em oposição diagonal. Como na oposição direta, quem precisa jogar é obrigado a ceder.",
    "A oposição diagonal aparece quando o rei adversário tenta contornar o seu pela lateral. Se ele vai para um lado, você responde de forma a manter a oposição: muitas vezes ela vira oposição direta já no lance seguinte.",
    "Na prática, ela é a ferramenta para não perder a oposição quando os reis não estão na mesma coluna. Para o defensor, é o jeito de seguir barrando o caminho; para o atacante, de chegar às casas-chave.",
  ],
  keyPoints: [
    "Oposição diagonal: mesma diagonal, uma casa entre os reis.",
    "Quem não está na vez tem a oposição.",
    "Ela vira oposição direta quando os reis se aproximam.",
    "Use-a quando o rei adversário tenta contornar pelo lado.",
  ],
  model: {
    fen: "8/8/5k2/8/8/3KP3/8/8 w - - 0 1",
    orientation: "white",
    caption: "Rd4 toma a oposição diagonal (casa e5 entre os reis).",
    moves: [
      {
        san: "Kd4",
        note: "Reis em d4 e f6, na mesma diagonal: oposição diagonal.",
      },
      { san: "Kf5" },
      {
        san: "Kd5",
        note: "O rei branco avança e o preto não consegue barrar.",
      },
      { san: "Kf6" },
      { san: "e4" },
      { san: "Ke7" },
      { san: "Ke5", note: "O rei branco chegou à frente do peão." },
      { san: "Kd7" },
      { san: "Kf6", note: "Casa-chave alcançada: o peão vai promover." },
      { san: "Kd6" },
    ],
  },
  practice: [
    {
      level: "facil",
      fen: "8/8/5k2/8/8/3KP3/8/8 w - - 0 1",
      goal: "vencer",
      solution: ["Kd4"],
      hint: "Procure a casa que deixa os reis na mesma diagonal, com uma casa entre eles.",
      why: "Rd4 toma a oposição diagonal. As pretas precisam ceder e o rei branco avança.",
    },
    {
      level: "medio",
      fen: "3K4/8/8/4k3/1P6/8/8/8 w - - 0 1",
      goal: "vencer",
      solution: ["Kc7"],
      hint: "O rei preto quer correr para o peão. Coloque o seu rei em oposição diagonal a ele.",
      why: "Rc7 fica em oposição diagonal com o rei preto e, ao mesmo tempo, perto do peão.",
    },
    {
      level: "medio",
      fen: "5K2/2k5/8/8/8/5P2/8/8 b - - 0 1",
      goal: "empatar",
      solution: ["Kd6"],
      hint: "Barre o rei branco pela diagonal.",
      why: "...Rd6 toma a oposição diagonal com o rei de f8 e corre para a frente do peão.",
    },
    {
      level: "medio",
      fen: "8/6K1/8/1P6/5k2/8/8/8 b - - 0 1",
      goal: "empatar",
      solution: ["Ke5"],
      hint: "O seu rei precisa alcançar o peão sem deixar o rei branco passar.",
      why: "...Re5 fica em oposição diagonal com o rei de g7 e se aproxima do peão b.",
    },
    {
      level: "dificil",
      fen: "3K4/6k1/8/8/4P3/8/8/8 b - - 0 1",
      goal: "empatar",
      solution: ["Kf6"],
      hint: "Um único lance segura: oposição diagonal com o rei de d8.",
      why: "...Rf6 toma a oposição diagonal e chega a tempo de bloquear o peão.",
    },
    {
      level: "dificil",
      fen: "8/4K3/7k/8/8/8/4P3/8 b - - 0 1",
      goal: "empatar",
      solution: ["Kg5"],
      hint: "Use a diagonal para ficar em oposição e se aproximar do peão.",
      why: "...Rg5 fica em oposição diagonal com o rei de e7 e corre para a frente do peão.",
    },
  ],
  quiz: [
    {
      question: "Quando os reis estão em oposição diagonal?",
      options: [
        "Na mesma diagonal, com uma casa entre eles",
        "Encostados na diagonal",
        "Em cantos opostos",
      ],
      answer: 0,
      explanation:
        "Como na oposição direta, a casa do meio não pode ser ocupada por nenhum dos reis.",
    },
    {
      question: "Quando a oposição diagonal costuma aparecer?",
      options: [
        "Quando o rei adversário tenta contornar pelo lado",
        "Só no começo da partida",
        "Quando há damas no tabuleiro",
      ],
      answer: 0,
      explanation: "Ela permite manter a oposição mesmo fora da mesma coluna.",
    },
    {
      question: "Em que a oposição diagonal se transforma?",
      options: ["Em oposição direta", "Em xeque", "Em afogamento"],
      answer: 0,
      explanation:
        "Quando os reis se aproximam, a oposição diagonal vira direta.",
    },
  ],
};
