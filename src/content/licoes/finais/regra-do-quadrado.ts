import type { EndgameLesson } from "../types.ts";

export const regraDoQuadrado: EndgameLesson = {
  kind: "final",
  slug: "regra-do-quadrado",
  title: "Regra do quadrado",
  group: "peoes",
  difficulty: 1,
  summary:
    "Como saber, sem calcular, se o rei alcança um peão passado: basta imaginar um quadrado.",
  theory: [
    "Quando um peão passado corre sozinho para a promoção, o rei adversário precisa alcançá-lo. A regra do quadrado resolve isso sem cálculo: desenhe um quadrado com um lado indo do peão até a casa de promoção e o mesmo tamanho para o lado.",
    "Se o rei defensor estiver dentro do quadrado (ou conseguir entrar nele no lance dele), ele alcança o peão. Se ficar fora, o peão vira dama.",
    "Atenção ao peão na casa inicial: como ele pode andar duas casas no primeiro lance, conte o quadrado a partir da casa onde ele chegaria com o lance duplo.",
  ],
  keyPoints: [
    "Lado do quadrado: do peão até a casa de promoção.",
    "Rei dentro do quadrado alcança o peão; fora, não.",
    "Quem está na vez importa: o rei pode entrar no quadrado com o próprio lance.",
    "Peão na casa inicial: conte a partir da casa do lance duplo.",
    "Se o rei adversário está fora do quadrado, empurre o peão sem perder tempo.",
  ],
  model: {
    fen: "7k/8/8/8/p7/8/8/4K3 w - - 0 1",
    orientation: "white",
    caption:
      "O quadrado do peão a4 vai de a4 a d4 e de a1 a d1. O rei branco entra nele e alcança o peão.",
    moves: [
      {
        san: "Kd2",
        note: "O rei entra no quadrado: agora ele alcança o peão.",
      },
      { san: "a3" },
      {
        san: "Kc2",
        note: "O quadrado diminui junto com o peão, e o rei continua dentro.",
      },
      { san: "a2" },
      { san: "Kb2" },
      { san: "a1=Q+" },
      {
        san: "Kxa1",
        note: "O peão foi capturado na casa de promoção: empate.",
      },
    ],
  },
  practice: [
    {
      level: "facil",
      fen: "7k/8/8/8/p7/8/8/4K3 w - - 0 1",
      goal: "empatar",
      solution: ["Kd2"],
      accept: ["Kd1"],
      hint: "Entre no quadrado do peão a4.",
      why: "Rd2 (ou Rd1) coloca o rei dentro do quadrado a4-d4-d1-a1. O rei alcança o peão.",
    },
    {
      level: "facil",
      fen: "7k/8/8/p7/8/8/8/5K2 w - - 0 1",
      goal: "empatar",
      solution: ["Ke1"],
      accept: ["Ke2"],
      hint: "O quadrado do peão a5 vai até a coluna e.",
      why: "Re1 (ou Re2) entra no quadrado a5-e5-e1-a1 e alcança o peão.",
    },
    {
      level: "medio",
      fen: "K7/8/5k2/8/8/8/1P6/8 b - - 0 1",
      goal: "empatar",
      solution: ["Ke5"],
      accept: ["Ke6"],
      hint: "O peão está na casa inicial: ele pode andar duas casas. Conte o quadrado a partir de b4.",
      why: "...Re5 (ou ...Re6) se aproxima do peão sem sair do quadrado contado a partir de b4 (b4-f4-f8-b8). Um lance para a coluna g deixaria o rei fora dele.",
    },
    {
      level: "medio",
      fen: "6k1/8/8/2P5/8/8/8/K7 w - - 0 1",
      goal: "vencer",
      solution: ["c6"],
      hint: "O rei preto está fora do quadrado. Não perca tempo.",
      why: "c6! e o peão corre: o rei preto em g8 está fora do quadrado c6-e6-e8-c8 depois do avanço.",
    },
    {
      level: "dificil",
      fen: "7k/8/8/8/8/8/1P6/K7 w - - 0 1",
      goal: "vencer",
      solution: ["b4"],
      accept: ["Ka2"],
      hint: "Use o lance duplo do peão.",
      why: "b4! deixa o rei preto fora do quadrado. Com b3?, o rei preto entraria no quadrado e empataria.",
    },
    {
      level: "dificil",
      fen: "8/8/5k2/8/1P6/8/8/K7 w - - 0 1",
      goal: "vencer",
      solution: ["Ka2"],
      accept: ["Kb2"],
      hint: "O rei preto já está no quadrado. O peão precisa da ajuda do rei.",
      why: "Com b5?, o rei preto alcança o peão. Ra2 (ou Rb2) traz o rei para apoiar o peão, e o rei preto não chega a tempo de pará-los.",
    },
  ],
  quiz: [
    {
      question: "Como se desenha o quadrado de um peão passado?",
      options: [
        "Do peão até a casa de promoção, e o mesmo tamanho para o lado",
        "Do rei até o peão",
        "Do peão até o rei adversário",
      ],
      answer: 0,
      explanation: "O lado do quadrado é a distância do peão até a promoção.",
    },
    {
      question: "O que acontece se o rei defensor está fora do quadrado?",
      options: [
        "O peão vira dama sem que o rei o alcance",
        "O rei alcança o peão",
        "Empate automático",
      ],
      answer: 0,
      explanation: "Fora do quadrado, o rei está longe demais.",
    },
    {
      question: "Como contar o quadrado de um peão na casa inicial?",
      options: [
        "A partir da casa onde ele chega com o lance duplo",
        "Da casa inicial normalmente",
        "Não se conta",
      ],
      answer: 0,
      explanation:
        "O peão pode andar duas casas no primeiro lance, então o quadrado fica menor.",
    },
  ],
};
