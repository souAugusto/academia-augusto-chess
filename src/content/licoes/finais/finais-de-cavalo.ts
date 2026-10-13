import type { EndgameLesson } from "../types.ts";

export const finaisDeCavalo: EndgameLesson = {
  kind: "final",
  slug: "finais-de-cavalo",
  title: "Finais de cavalo",
  group: "cavalos",
  difficulty: 2,
  summary:
    "Finais de cavalo parecem finais de peões: o peão passado manda, e o cavalo vive de garfos e de xeques que ganham tempo.",
  theory: [
    "Nos finais com um cavalo de cada lado, as regras dos finais de peões continuam valendo: rei ativo, peão passado e contagem de lances. O cavalo é lento para atravessar o tabuleiro, então um peão passado distante é muito perigoso para ele.",
    "A arma do cavalo é o garfo: um xeque que ataca outra peça ou um peão ao mesmo tempo. Muitas defesas usam esse truque para pegar o peão mais perigoso do adversário.",
    "Antes de cada lance, olhe as casas de garfo do cavalo adversário e conte se o seu cavalo chega a tempo de parar o peão.",
  ],
  keyPoints: [
    "Peão passado distante é forte contra o cavalo.",
    "O cavalo é lento: conte quantos lances ele precisa para chegar.",
    "Garfos com xeque ganham tempo e material.",
    "O rei ativo continua sendo decisivo, como nos finais de peões.",
  ],
  model: {
    fen: "8/8/N1k5/8/K4P2/8/p6P/7n w - - 0 1",
    orientation: "white",
    caption:
      "O peão a2 vai promover. O cavalo salva com um xeque que também alcança o peão.",
    moves: [
      {
        san: "Nb4+",
        note: "Xeque: o rei preto precisa sair, e o cavalo passa a vigiar a2.",
      },
      { san: "Kc5" },
      { san: "Nxa2", note: "O peão perigoso cai. O jogo fica equilibrado." },
      { san: "Nf2" },
      { san: "Nc3" },
    ],
  },
  practice: [
    {
      level: "facil",
      fen: "8/1N6/2P5/K4k2/2p1n3/7P/8/8 w - - 0 1",
      goal: "vencer",
      solution: ["c7"],
      hint: "O cavalo preto está longe do seu peão passado.",
      why: "c7! e o peão promove: o cavalo de e4 não chega a c8 a tempo.",
    },
    {
      level: "facil",
      fen: "8/8/N1k5/8/K4P2/8/p6P/7n w - - 0 1",
      goal: "empatar",
      solution: ["Nb4+"],
      hint: "Um xeque que também alcança o peão a2.",
      why: "Cb4+ ganha um tempo e, depois do lance do rei, Cxa2 elimina o peão.",
    },
    {
      level: "medio",
      fen: "8/k2p2N1/8/6K1/5P2/8/1P6/4n3 w - - 0 1",
      goal: "vencer",
      solution: ["f5"],
      hint: "Avance o peão passado apoiado pelo cavalo e pelo rei.",
      why: "f5! O peão f avança com apoio, e o cavalo preto está longe.",
    },
    {
      level: "medio",
      fen: "3nk3/7P/p7/4K2P/8/3N4/8/8 b - - 0 1",
      goal: "empatar",
      solution: ["Nf7+"],
      hint: "Um xeque que também vigia a casa de promoção do peão h.",
      why: "...Cf7+ dá xeque e controla h8. O peão h7 não promove.",
    },
    {
      level: "dificil",
      fen: "1K6/6P1/N3k3/6P1/8/3p4/4n3/8 b - - 0 1",
      goal: "vencer",
      solution: ["Kf7"],
      hint: "Pare os peões brancos com o rei; o seu peão d vai decidir.",
      why: "...Rf7! segura os peões g. O peão d3 avança e o cavalo branco não consegue parar tudo.",
    },
    {
      level: "dificil",
      fen: "3k4/7n/8/8/8/6P1/p1K1P2N/8 w - - 0 1",
      goal: "empatar",
      solution: ["Kb2"],
      hint: "O peão a2 é o perigo principal. O seu rei está perto.",
      why: "Rb2 ataca o peão a2. Com ele eliminado, os peões brancos seguram o empate.",
    },
    {
      level: "dificil",
      fen: "2k5/P7/5p2/5P2/1N4n1/2K5/8/8 b - - 0 1",
      goal: "empatar",
      solution: ["Kb7"],
      hint: "O peão a7 está a um passo de promover. Use o rei.",
      why: "...Rb7 vai pegar o peão a7. Depois o cavalo preto cuida do peão f.",
    },
  ],
  quiz: [
    {
      question: "Com que tipo de final os finais de cavalo se parecem?",
      options: [
        "Com os finais de peões",
        "Com os finais de dama",
        "Com os mates básicos",
      ],
      answer: 0,
      explanation:
        "Rei ativo, peão passado e contagem de lances continuam decidindo.",
    },
    {
      question: "Qual é a principal arma tática do cavalo?",
      options: ["O garfo", "O espeto", "A cravada"],
      answer: 0,
      explanation:
        "Um xeque que também ataca outra peça ou peão ganha tempo e material.",
    },
    {
      question: "Por que o peão passado distante é perigoso contra o cavalo?",
      options: [
        "Porque o cavalo é lento para atravessar o tabuleiro",
        "Porque o cavalo não pode capturar peões",
        "Porque o peão fica protegido",
      ],
      answer: 0,
      explanation:
        "O cavalo precisa de vários lances para chegar ao outro lado.",
    },
  ],
};
