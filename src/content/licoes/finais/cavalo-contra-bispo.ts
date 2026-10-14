import type { EndgameLesson } from "../types.ts";

export const cavaloContraBispo: EndgameLesson = {
  kind: "final",
  slug: "cavalo-contra-bispo",
  title: "Cavalo contra bispo",
  group: "cavalos",
  difficulty: 2,
  summary:
    "O cavalo alcança casas das duas cores; o bispo, só de uma. Em posições fechadas e com peões num lado só, o cavalo pode ser melhor.",
  theory: [
    "O bispo nunca muda de cor de casa. Se os peões ou a casa de promoção estão na outra cor, ele não consegue ajudar. O cavalo não tem essa limitação: em poucos lances ele chega a qualquer casa.",
    "Por isso o cavalo costuma ser melhor em posições fechadas, com peões bloqueados, e quando todos os peões estão no mesmo lado do tabuleiro. Já em corridas de peões, o alcance do bispo pesa: ele freia peões à distância.",
    "Nos exercícios, veja de que cor são as casas importantes (de promoção ou de bloqueio) e se a peça consegue chegar a elas a tempo.",
  ],
  keyPoints: [
    "O bispo fica preso a uma cor de casa; o cavalo, não.",
    "Posições fechadas e peões num lado só favorecem o cavalo.",
    "Em corridas, o bispo freia peões à distância.",
    "Confira a cor das casas importantes antes de calcular.",
  ],
  model: {
    fen: "K7/P7/1k6/8/8/P2Np3/8/b7 w - - 0 1",
    orientation: "white",
    caption:
      "O rei branco sai do canto e o peão a7 promove; o cavalo segura o peão e3.",
    moves: [
      {
        san: "Kb8",
        note: "O rei sai da frente do peão. O bispo preto (casas escuras) não controla a8.",
      },
      { san: "Kb5" },
      {
        san: "a8=Q",
        note: "Dama: a casa a8 é clara, fora do alcance do bispo.",
      },
      { san: "Kc4" },
      { san: "Qe4+", note: "A dama ainda ajuda o cavalo contra o peão e3." },
    ],
  },
  practice: [
    {
      level: "facil",
      fen: "K7/P7/1k6/8/8/P2Np3/8/b7 w - - 0 1",
      goal: "vencer",
      solution: ["Kb8"],
      hint: "Saia com o rei da frente do peão a7.",
      why: "Rb8 libera a8. O bispo preto anda nas casas escuras e não consegue vigiar a8, que é clara.",
    },
    {
      level: "medio",
      fen: "6K1/8/7k/2P1P3/6p1/8/8/3bN3 w - - 0 1",
      goal: "vencer",
      solution: ["c6"],
      hint: "Dois peões passados afastados são difíceis para o bispo.",
      why: "c6! Os peões c e e avançam juntos; o bispo não consegue vigiar os dois e o cavalo segura o peão g.",
    },
    {
      level: "medio",
      fen: "4k1K1/2P5/8/8/8/p5N1/7P/1b6 b - - 0 1",
      goal: "vencer",
      solution: ["Kd7"],
      hint: "Com as pretas: pare o peão c7 com o rei. O seu peão a vai correr.",
      why: "...Rd7 pega o peão c7. Depois o peão a3 avança: o bispo de b1 protege a casa a2 e o cavalo não consegue parar o peão sem se sacrificar.",
    },
    {
      level: "dificil",
      fen: "N7/8/8/1P3k2/6b1/K2p4/P7/8 b - - 0 1",
      goal: "vencer",
      solution: ["d2"],
      hint: "O peão d está muito perto de promover, e o cavalo branco está no canto.",
      why: "...d2! O cavalo de a8 está longe e não chega a tempo de parar o peão.",
    },
    {
      level: "dificil",
      fen: "4K2N/2P5/8/8/1b6/1P5p/8/1k6 b - - 0 1",
      goal: "empatar",
      solution: ["h2"],
      hint: "O peão c7 vai promover. Corra com o seu peão h.",
      why: "...h2! Os dois lados promovem quase juntos, e o final que sobra é empate.",
    },
    {
      level: "dificil",
      fen: "5K2/1b2NP2/7P/8/8/7p/6k1/8 b - - 0 1",
      goal: "empatar",
      solution: ["Be4"],
      hint: "Os peões brancos f e h são perigosos. O bispo pode vigiar casas importantes à distância.",
      why: "...Be4! O bispo vigia h7 e ajuda o peão h3 a avançar. As pretas conseguem uma dama a tempo.",
    },
  ],
  quiz: [
    {
      question: "Qual é a limitação do bispo que o cavalo não tem?",
      options: [
        "O bispo fica sempre nas casas da mesma cor",
        "O bispo não pode andar para trás",
        "O bispo não captura peões",
      ],
      answer: 0,
      explanation:
        "O cavalo alterna de cor a cada lance e chega a qualquer casa.",
    },
    {
      question: "Em que posições o cavalo costuma ser melhor?",
      options: [
        "Fechadas, com peões bloqueados e num lado só",
        "Abertas, com peões nas duas alas",
        "Com muitos peões passados afastados",
      ],
      answer: 0,
      explanation:
        "Sem longas diagonais abertas, o bispo perde a vantagem do alcance.",
    },
    {
      question:
        "O que conferir antes de calcular uma corrida com bispo e cavalo?",
      options: [
        "A cor das casas de promoção e se a peça chega a tempo",
        "Se os reis já rocaram",
        "Quantas peças foram trocadas",
      ],
      answer: 0,
      explanation: "Um bispo da cor errada não vigia a casa de promoção.",
    },
  ],
};
