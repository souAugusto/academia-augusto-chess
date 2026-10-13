import type { EndgameLesson } from "../types.ts";

export const peoesPassados: EndgameLesson = {
  kind: "final",
  slug: "peoes-ligados-e-passados",
  title: "Peões ligados e passados",
  group: "peoes",
  difficulty: 2,
  summary:
    "Peão passado é aquele que nenhum peão adversário consegue parar. Nos finais, ele decide corridas: conte os lances e empurre na hora certa.",
  theory: [
    "Um peão passado não tem peões adversários na frente dele nem nas colunas vizinhas. Ele só pode ser parado pelo rei ou pelas peças, e por isso vale muito nos finais. Dois peões passados ligados (em colunas vizinhas) se protegem e avançam juntos, e são muito difíceis de parar só com o rei.",
    "O peão passado distante (longe do resto dos peões) é uma arma: ele atrai o rei adversário para longe, enquanto o seu rei ataca os peões do outro lado.",
    "Quando os dois lados têm peões passados, a partida vira uma corrida. Conte quantos lances cada peão precisa para promover e veja se a nova dama dá xeque ou se ela pode ser capturada. Muitas vezes o lance certo é simplesmente empurrar o peão, sem perder tempo.",
  ],
  keyPoints: [
    "Peão passado: sem peões adversários na frente nem nas colunas vizinhas.",
    "Peões passados ligados se protegem e avançam juntos.",
    "O peão passado distante desvia o rei adversário.",
    "Em corridas, conte os lances e veja se a promoção vem com xeque.",
    "Não perca tempo: na corrida, cada lance conta.",
  ],
  model: {
    fen: "8/2k5/7P/1Pp5/8/p7/3P4/6K1 b - - 0 1",
    orientation: "black",
    caption: "Corrida de peões: o peão a das pretas chega primeiro.",
    moves: [
      {
        san: "a2",
        note: "Sem perder tempo: o peão a está a um passo de promover.",
      },
      { san: "Kf1" },
      {
        san: "Kb6",
        note: "O rei preto para o peão b e ainda vigia a diagonal.",
      },
      { san: "h7" },
      {
        san: "a1=Q+",
        note: "A dama nasce com xeque e chega a tempo de parar o peão h.",
      },
      { san: "Ke2" },
      { san: "Qe5+" },
      { san: "Kf3" },
      {
        san: "Qh5+",
        note: "A dama alcança o peão h: as pretas ficam com dama contra peões.",
      },
    ],
  },
  practice: [
    {
      level: "facil",
      fen: "8/2k5/7P/1Pp5/8/p7/3P4/6K1 b - - 0 1",
      goal: "vencer",
      solution: ["a2"],
      hint: "O seu peão a está mais perto de promover. Não perca tempo.",
      why: "...a2! e o peão promove no lance seguinte, com xeque. Qualquer outro lance dá tempo às brancas.",
    },
    {
      level: "facil",
      fen: "8/7p/5P2/6P1/2P5/8/3p2K1/1k6 b - - 0 1",
      goal: "vencer",
      solution: ["d1=Q"],
      hint: "Promova agora.",
      why: "...d1=D! cria a dama antes que os peões brancos cheguem perto da promoção.",
    },
    {
      level: "medio",
      fen: "8/6p1/1P6/8/6K1/4P3/k1P1p3/8 w - - 0 1",
      goal: "empatar",
      solution: ["b7"],
      hint: "O peão e2 das pretas vai promover. Corra com o seu peão passado.",
      why: "b7! e as duas damas nascem quase juntas. Qualquer lance lento deixa as pretas com dama contra peões.",
    },
    {
      level: "medio",
      fen: "8/2K1k3/8/1P3p2/7P/3pP3/8/8 w - - 0 1",
      goal: "empatar",
      solution: ["b6"],
      hint: "O peão d3 vai promover. O seu peão b precisa correr junto.",
      why: "b6! O peão b chega à oitava fileira logo depois do peão preto, e as damas se anulam.",
    },
    {
      level: "dificil",
      fen: "8/4K3/p3PP2/8/1P6/1p6/2k5/8 b - - 0 1",
      goal: "empatar",
      solution: ["b2"],
      hint: "As brancas têm peões ligados perto da promoção. Corra com o peão b.",
      why: "...b2! As pretas fazem dama a tempo de lutar contra os peões ligados de e6 e f6.",
    },
    {
      level: "dificil",
      fen: "8/2P5/1P2P3/3p4/8/p5k1/8/5K2 b - - 0 1",
      goal: "empatar",
      solution: ["a2"],
      hint: "Os peões brancos estão muito perto da promoção. Só a sua própria dama salva.",
      why: "...a2! e a dama preta nasce a tempo de dar xeques e frear os peões brancos.",
    },
  ],
  quiz: [
    {
      question: "O que é um peão passado?",
      options: [
        "Um peão sem peões adversários na frente nem nas colunas vizinhas",
        "Um peão que já capturou uma peça",
        "Um peão na sétima fileira",
      ],
      answer: 0,
      explanation:
        "Nenhum peão adversário consegue pará-lo; só o rei ou as peças.",
    },
    {
      question: "Por que o peão passado distante é forte?",
      options: [
        "Porque atrai o rei adversário para longe dos outros peões",
        "Porque não pode ser capturado",
        "Porque vale dois peões",
      ],
      answer: 0,
      explanation:
        "Enquanto o rei adversário corre atrás dele, o seu rei ataca do outro lado.",
    },
    {
      question: "O que fazer numa corrida de peões?",
      options: [
        "Contar os lances e empurrar sem perder tempo",
        "Mover o rei primeiro, sempre",
        "Esperar o adversário promover",
      ],
      answer: 0,
      explanation:
        "Cada lance conta: veja quem promove primeiro e se a dama nasce com xeque.",
    },
  ],
};
