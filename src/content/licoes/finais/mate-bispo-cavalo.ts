import type { EndgameLesson } from "../types.ts";

export const mateBispoCavalo: EndgameLesson = {
  kind: "final",
  slug: "mate-bispo-e-cavalo",
  title: "Mate com bispo e cavalo (técnica)",
  group: "mates",
  difficulty: 3,
  summary:
    "O mate mais difícil dos básicos: só é possível no canto da cor do bispo, com rei, bispo e cavalo trabalhando juntos.",
  theory: [
    "Rei, bispo e cavalo vencem contra o rei sozinho, mas o mate só acontece no canto da mesma cor do bispo. Com um bispo de casas claras, o mate é em a8 ou h1; com um de casas escuras, em a1 ou h8. Se o rei adversário fugir para o canto errado, ele precisa ser levado pela borda até o canto certo.",
    'A manobra para levar o rei de um canto ao outro é conhecida como "W", por causa do desenho que o cavalo faz (por exemplo, Ce5-d7-c5-b7). O bispo e o rei seguram a borda enquanto o cavalo cobre as casas da outra cor.',
    "Há limite de 50 lances sem captura nem movimento de peão, e o mate pode levar mais de 30 lances a partir de posições ruins. Por isso vale treinar a fase final: quando o rei adversário já está perto do canto certo.",
  ],
  keyPoints: [
    "O mate só existe no canto da cor do bispo.",
    "Bispo e cavalo controlam casas de cores diferentes: juntos cobrem tudo.",
    "O rei fica perto, a um salto de cavalo de distância do rei adversário.",
    "Para tirar o rei do canto errado, use a manobra em W do cavalo.",
    "Cuidado com o afogamento quando o rei adversário estiver no canto.",
  ],
  model: {
    fen: "1k6/8/1K6/3N4/8/8/8/5B2 w - - 0 1",
    orientation: "white",
    caption:
      "A fase final: o rei preto já está perto do canto certo (a8, casa clara).",
    moves: [
      { san: "Ne7", note: "O cavalo controla c8 e se prepara para c8." },
      { san: "Ka8" },
      { san: "Kc7", note: "O rei branco tira b8 e b7." },
      { san: "Ka7" },
      { san: "Nc8+", note: "O cavalo devolve o rei ao canto." },
      { san: "Ka8" },
      {
        san: "Bg2#",
        note: "Mate no canto claro: o bispo de casas claras dá o xeque.",
      },
    ],
  },
  practice: [
    {
      level: "facil",
      fen: "k7/2K5/8/1N6/8/8/8/5B2 w - - 0 1",
      goal: "vencer",
      solution: ["Bg2#"],
      hint: "O cavalo já controla a7. Feche a diagonal longa.",
      why: "Bg2# é mate: o cavalo de b5 cobre a7, o rei cobre b7 e b8, e o bispo dá xeque em a8.",
    },
    {
      level: "facil",
      fen: "1k6/1B6/1K6/2N5/8/8/8/8 w - - 0 1",
      goal: "vencer",
      solution: ["Na6#"],
      hint: "O bispo segura a8 e c8. Agora o cavalo dá o xeque.",
      why: "Ca6# é mate: o bispo cobre a8 e c8, o rei cobre a7, b7 e c7.",
    },
    {
      level: "facil",
      fen: "6k1/6B1/6K1/8/6N1/8/8/8 w - - 0 1",
      goal: "vencer",
      solution: ["Nh6#"],
      hint: "Com o bispo em g7, o cavalo dá o xeque final.",
      why: "Ch6# é mate no canto escuro: o bispo cobre f8 e h8, o rei cobre f7, g7 e h7.",
    },
    {
      level: "medio",
      fen: "k7/8/1K6/8/8/3N4/8/5B2 w - - 0 1",
      goal: "vencer",
      solution: ["Nc5", "Kb8", "Ba6", "Ka8", "Bb7+", "Kb8", "Na6#"],
      accept: ["Nb4"],
      hint: "Traga o cavalo para perto, rumo à casa a6.",
      why: "O cavalo vai para c5 (ou b4), o bispo tira c8 e depois Bb7+ e Ca6# fecham a rede.",
    },
    {
      level: "medio",
      fen: "7k/8/6K1/4N3/8/8/8/2B5 w - - 0 1",
      goal: "vencer",
      solution: ["Ng4", "Kg8", "Bh6", "Kh8", "Bg7+", "Kg8", "Nh6#"],
      hint: "O canto h8 é escuro, como o seu bispo. Leve o cavalo para perto de h6.",
      why: "Cg4 prepara Ch6. O bispo tira f8 e depois dá xeque em g7; Ch6# é mate.",
    },
    {
      level: "dificil",
      fen: "k7/8/1KN5/8/8/8/8/5B2 w - - 0 1",
      goal: "vencer",
      solution: ["Nb4", "Kb8", "Ba6", "Ka8", "Bb7+", "Kb8", "Na6#"],
      hint: "O cavalo precisa chegar a a6. Qual casa leva até lá?",
      why: "Cb4 prepara Ca6. O bispo tira c8 e depois prende o rei com Bb7+.",
    },
    {
      level: "dificil",
      fen: "1k6/8/1K6/3N4/8/8/8/5B2 w - - 0 1",
      goal: "vencer",
      solution: ["Ne7", "Ka8", "Kc7", "Ka7", "Nc8+", "Ka8", "Bg2#"],
      hint: "Tire a casa c8 com o cavalo antes de trazer o rei.",
      why: "Ce7 controla c8, o rei vai para c7 e o cavalo volta a c8 com xeque. Bg2# é mate.",
    },
  ],
  quiz: [
    {
      question: "Em qual canto acontece o mate com bispo e cavalo?",
      options: [
        "No canto da mesma cor do bispo",
        "Em qualquer canto",
        "No canto da cor do cavalo",
      ],
      answer: 0,
      explanation:
        "No canto da outra cor, o bispo não consegue dar o xeque final.",
    },
    {
      question: "O que é a manobra em W?",
      options: [
        "O caminho do cavalo para levar o rei adversário de um canto ao outro pela borda",
        "Um sacrifício de bispo",
        "Um xeque duplo",
      ],
      answer: 0,
      explanation:
        "O cavalo cobre as casas que o bispo não alcança enquanto o rei adversário é empurrado.",
    },
    {
      question: "Por que vale treinar a fase final desse mate?",
      options: [
        "Porque o mate pode levar muitos lances e existe o limite de 50 lances",
        "Porque é o mate mais comum",
        "Porque não precisa do rei",
      ],
      answer: 0,
      explanation:
        "Saber fechar a rede rápido evita o empate pela regra dos 50 lances.",
    },
  ],
};
