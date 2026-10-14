import type { EndgameLesson } from "../types.ts";

export const xequePerpetuo: EndgameLesson = {
  kind: "final",
  slug: "xeque-perpetuo",
  title: "Xeque perpétuo",
  group: "damas",
  difficulty: 2,
  summary:
    "Com material a menos, a dama salva a partida dando xeques sem fim. Às vezes um desses xeques ainda ganha uma peça.",
  theory: [
    "Xeque perpétuo é uma série de xeques que o adversário não consegue evitar. Como a mesma posição se repete, a partida termina empatada pela regra da repetição (três vezes a mesma posição).",
    "A dama é a melhor peça para isso: ela alcança muitas casas e ataca de longe. Quando o rei adversário está exposto, sem peões em volta, procure duas ou três casas de onde a dama dá xeque alternando, e confira se o rei não tem um esconderijo.",
    "Antes de se contentar com o empate, olhe se algum xeque também ataca uma peça solta. Um xeque com garfo pode ganhar material e até a partida.",
  ],
  keyPoints: [
    "Rei adversário exposto + dama ativa = chance de xeque perpétuo.",
    "Procure duas ou três casas de xeque que se alternam.",
    "Confira se o rei adversário não tem como fugir dos xeques.",
    "A repetição da posição três vezes encerra a partida em empate.",
    "Antes do perpétuo, veja se algum xeque garfa uma peça.",
  ],
  model: {
    fen: "2K3k1/8/8/1r6/8/8/2Q5/7q w - - 0 1",
    orientation: "white",
    caption:
      "Com torre a menos, as brancas empatam: o rei preto não escapa dos xeques.",
    moves: [
      {
        san: "Qg6+",
        note: "Primeiro xeque: o rei preto só pode ir para f8 ou h8.",
      },
      { san: "Kf8" },
      { san: "Qf6+", note: "A dama segue o rei pela diagonal e pela coluna." },
      { san: "Ke8" },
      { san: "Qe6+" },
      { san: "Kf8" },
      {
        san: "Qf6+",
        note: "A posição vai se repetir: empate por xeque perpétuo.",
      },
    ],
  },
  practice: [
    {
      level: "facil",
      fen: "1k1K4/8/8/5Q2/4r3/8/2q5/8 w - - 0 1",
      goal: "empatar",
      solution: ["Qb5+", "Ka7", "Qa5+", "Kb7", "Qb5+"],
      hint: "O rei preto está no canto. Dê xeques alternando entre duas casas.",
      why: "Db5+ e Da5+ se alternam: o rei preto fica preso entre a7 e b7 e não escapa.",
    },
    {
      level: "facil",
      fen: "2K3k1/8/8/1r6/8/8/2Q5/7q w - - 0 1",
      goal: "empatar",
      solution: ["Qg6+", "Kf8", "Qf6+", "Ke8", "Qe6+"],
      hint: "Comece com um xeque que tire as casas de fuga do rei preto.",
      why: "Dg6+, Df6+ e De6+ acompanham o rei. A posição se repete e o jogo empata.",
    },
    {
      level: "medio",
      fen: "8/q7/6r1/8/8/3k4/7K/2Q5 w - - 0 1",
      goal: "empatar",
      solution: ["Qb1+", "Kc4", "Qc2+"],
      hint: "O rei preto está no meio do tabuleiro, sem proteção. Dê xeque.",
      why: "Db1+ e Dc2+ começam a série de xeques. O rei preto não encontra abrigo.",
    },
    {
      level: "medio",
      fen: "4Q3/8/5K2/8/3k4/7q/r7/8 w - - 0 1",
      goal: "empatar",
      solution: ["Qe5+", "Kc4", "Qe4+"],
      hint: "Só um lance salva: xeque pela coluna e.",
      why: "De5+ e De4+ seguem o rei. Sem os xeques, as pretas atacariam o rei branco.",
    },
    {
      level: "dificil",
      fen: "4Q3/q7/3k3r/8/8/8/1K6/8 w - - 0 1",
      goal: "empatar",
      solution: ["Qf8+", "Ke5", "Qxh6"],
      hint: "Procure um xeque que também ataque a torre.",
      why: "Df8+ é um garfo: depois do lance do rei, Dxh6 pega a torre e o jogo fica empatado (dama contra dama).",
    },
    {
      level: "dificil",
      fen: "2K5/3r4/2k5/Q7/8/3q4/8/8 w - - 0 1",
      goal: "empatar",
      solution: ["Qa4+", "Kc5", "Qxd7"],
      hint: "O rei branco está em perigo. Um xeque resolve tudo.",
      why: "Da4+ obriga o rei preto a sair, e Dxd7 pega a torre que ameaçava o rei branco.",
    },
  ],
  quiz: [
    {
      question: "O que é xeque perpétuo?",
      options: [
        "Uma série de xeques que o adversário não consegue evitar",
        "Um xeque-mate",
        "Um xeque dado pelo rei",
      ],
      answer: 0,
      explanation: "Como a posição se repete, a partida termina empatada.",
    },
    {
      question: "Quando procurar o xeque perpétuo?",
      options: [
        "Quando você está pior e o rei adversário está exposto",
        "Quando você está ganhando",
        "Só no começo da partida",
      ],
      answer: 0,
      explanation: "Com material a menos, o perpétuo salva meio ponto.",
    },
    {
      question: "O que conferir antes de aceitar o empate por perpétuo?",
      options: [
        "Se algum xeque também ataca uma peça solta",
        "Se o seu rei pode rocar",
        "Se há peões dobrados",
      ],
      answer: 0,
      explanation:
        "Um xeque com garfo pode ganhar material e mudar o resultado.",
    },
  ],
};
