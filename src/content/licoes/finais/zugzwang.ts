import type { EndgameLesson } from "../types.ts";

export const zugzwang: EndgameLesson = {
  kind: "final",
  slug: "zugzwang",
  title: "Zugzwang",
  group: "peoes",
  difficulty: 2,
  summary:
    "Quando qualquer lance piora a posição, ter de jogar é uma desvantagem. O objetivo é deixar o adversário nessa situação.",
  theory: [
    'Zugzwang (palavra alemã, "obrigação de jogar") é a situação em que o lado que está na vez só tem lances ruins. Se ele pudesse passar a vez, estaria bem; como não pode, precisa piorar a própria posição.',
    "O exemplo mais claro é o trébuchet: peões bloqueados frente a frente e cada rei atacando o peão do adversário enquanto defende o seu. Quem tiver de jogar perde o peão, porque o rei precisa sair. É um zugzwang mútuo: o importante é chegar a essa posição com o adversário na vez.",
    "Nos finais de peões, contar os lances e saber quem estará na vez no momento decisivo é tão importante quanto a posição das peças.",
  ],
  keyPoints: [
    "Zugzwang: quem está na vez só tem lances ruins.",
    "No trébuchet, quem joga perde o peão.",
    "Procure chegar à posição crítica com o adversário na vez.",
    "Conte os lances antes de se aproximar: um tempo a mais ou a menos muda o resultado.",
  ],
  model: {
    fen: "8/8/2K5/3p4/3Pk3/8/8/8 w - - 0 1",
    orientation: "white",
    caption: "Rc5! monta o trébuchet com as pretas na vez.",
    moves: [
      {
        san: "Kc5",
        note: "Agora cada rei ataca o peão do outro. As pretas precisam jogar e abandonar d5.",
      },
      { san: "Ke3", note: "O rei preto sai, porque não há outro lance." },
      { san: "Kxd5", note: "O peão d5 cai e o peão branco fica livre." },
      { san: "Kf4" },
      { san: "Kc6" },
      { san: "Ke4" },
      {
        san: "d5",
        note: "Com o rei branco ao lado, o peão avança até promover.",
      },
    ],
  },
  practice: [
    {
      level: "facil",
      fen: "8/8/2K5/3p4/3Pk3/8/8/8 b - - 0 1",
      goal: "vencer",
      solution: ["Kxd4"],
      hint: "O peão branco está sem defesa.",
      why: "...Rxd4 pega o peão. O rei branco não conseguiu chegar a c5 a tempo.",
    },
    {
      level: "medio",
      fen: "8/8/2K5/3p4/3Pk3/8/8/8 w - - 0 1",
      goal: "vencer",
      solution: ["Kc5"],
      hint: "Coloque o seu rei atacando o peão preto e defendendo o seu.",
      why: "Rc5! monta o trébuchet com as pretas na vez: o rei preto precisa sair e o peão d5 cai.",
    },
    {
      level: "medio",
      fen: "8/8/8/3pK3/3P4/2k5/8/8 b - - 0 1",
      goal: "vencer",
      solution: ["Kc4"],
      hint: "Agora é você, com as pretas, quem monta o trébuchet.",
      why: "...Rc4! ataca d4 e defende d5. As brancas estão na vez e perdem o peão.",
    },
    {
      level: "dificil",
      fen: "8/8/3K4/4p3/4Pk2/8/8/8 w - - 0 1",
      goal: "vencer",
      solution: ["Kd5"],
      hint: "A mesma ideia, nos peões da coluna e.",
      why: "Rd5! deixa as pretas em zugzwang: o rei preto sai e o peão e5 cai.",
    },
    {
      level: "dificil",
      fen: "8/8/5K2/4p3/3kP3/8/8/8 w - - 0 1",
      goal: "vencer",
      solution: ["Kf5"],
      hint: "Ataque o peão e5 pelo outro lado, defendendo e4.",
      why: "Rf5! monta o trébuchet com as pretas na vez.",
    },
    {
      level: "dificil",
      fen: "8/8/8/4pK2/4P3/3k4/8/8 b - - 0 1",
      goal: "vencer",
      solution: ["Kd4"],
      hint: "Com as pretas: ataque e4 e defenda e5 ao mesmo tempo.",
      why: "...Rd4! deixa as brancas em zugzwang: o rei branco precisa sair e o peão e4 cai.",
    },
  ],
  quiz: [
    {
      question: "O que é zugzwang?",
      options: [
        "A situação em que o lado na vez só tem lances ruins",
        "Um tipo de xeque",
        "Um empate por repetição",
      ],
      answer: 0,
      explanation:
        "Ter de jogar vira uma desvantagem: qualquer lance piora a posição.",
    },
    {
      question: "No trébuchet, quem perde?",
      options: [
        "Quem estiver na vez",
        "Sempre as brancas",
        "Ninguém, é empate",
      ],
      answer: 0,
      explanation: "Quem joga precisa tirar o rei da defesa do próprio peão.",
    },
    {
      question: "Qual é o objetivo ao jogar um final com zugzwang mútuo?",
      options: [
        "Chegar à posição crítica com o adversário na vez",
        "Trocar todos os peões",
        "Avançar o peão o mais rápido possível",
      ],
      answer: 0,
      explanation:
        "Contar os lances define quem estará na vez no momento decisivo.",
    },
  ],
};
