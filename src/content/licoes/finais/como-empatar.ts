import type { EndgameLesson } from "../types.ts";

export const comoEmpatar: EndgameLesson = {
  kind: "final",
  slug: "como-empatar-fortalezas-e-afogamento",
  title: "Como empatar: fortalezas e afogamento",
  group: "combinados",
  difficulty: 2,
  summary:
    "Mesmo com material a menos, há posições que não se perdem: a fortaleza no canto certo e o afogamento forçado com a torre desesperada.",
  theory: [
    "Quando a vitória não é possível, salvar meio ponto é um ótimo resultado. Duas armas clássicas do defensor são a fortaleza e o afogamento.",
    "Fortaleza é uma posição que o adversário não consegue quebrar, mesmo com material a mais. O exemplo mais conhecido é o bispo da cor errada: com peão de torre, se o bispo não controla a casa de promoção, o rei defensor no canto empata. Basta levar o rei até lá.",
    "O afogamento acontece quando o lado na vez não está em xeque e não tem nenhum lance legal. Com o rei sem casas, o defensor pode usar a torre desesperada: ela dá xeques sem parar e, se for capturada, o rei fica afogado. Em qualquer caso, o empate está garantido.",
  ],
  keyPoints: [
    "Bispo da cor errada + peão de torre: o rei no canto empata.",
    "Leve o rei para o canto antes que o rei adversário chegue.",
    "Afogamento: sem xeque e sem lances legais, a partida empata.",
    "Torre desesperada: xeques sem fim; se ela for capturada, é afogamento.",
  ],
  model: {
    fen: "7k/5Q2/6K1/8/8/8/8/r7 b - - 0 1",
    orientation: "black",
    caption:
      "O rei preto não tem lances. A torre dá xeques até forçar o empate.",
    moves: [
      {
        san: "Rg1+",
        note: "Se o rei branco capturar a torre, o rei preto fica afogado.",
      },
      { san: "Kf6" },
      {
        san: "Rf1+",
        note: "A torre continua perseguindo o rei e ataca a dama.",
      },
      { san: "Ke6" },
      { san: "Rxf7", note: "Agora a torre pega a dama." },
      { san: "Kxf7", note: "Rei contra rei: empate." },
    ],
  },
  practice: [
    {
      level: "facil",
      fen: "4k3/8/8/8/P7/8/8/2B1K3 b - - 0 1",
      goal: "empatar",
      solution: ["Kd8"],
      accept: ["Kd7", "Ke7"],
      hint: "O bispo branco é de casas escuras e o peão vai promover em a8, que é clara. Corra para o canto.",
      why: "...Rd8 (ou ...Rd7, ...Re7) leva o rei a a8. Com o bispo da cor errada, o rei no canto empata.",
    },
    {
      level: "facil",
      fen: "8/8/8/8/6k1/8/5PK1/8 b - - 0 1",
      goal: "empatar",
      solution: ["Kf4"],
      hint: "Fique na frente do peão, em oposição ao rei branco.",
      why: "...Rf4 bloqueia o peão f e mantém a oposição. O rei branco não consegue apoiar o avanço.",
    },
    {
      level: "medio",
      fen: "8/8/8/8/1k6/8/1KP5/8 b - - 0 1",
      goal: "empatar",
      solution: ["Kc4"],
      hint: "Fique na frente do peão e tome a oposição.",
      why: "...Rc4 bloqueia o peão e prepara a oposição. O rei branco não consegue apoiar o avanço.",
    },
    {
      level: "medio",
      fen: "7k/5Q2/6K1/8/8/8/8/r7 b - - 0 1",
      goal: "empatar",
      solution: ["Rg1+"],
      hint: "O seu rei não tem lances. Use a torre para dar xeque.",
      why: "...Tg1+! Se o rei branco pegar a torre, é afogamento. Se fugir, a torre continua os xeques.",
    },
    {
      level: "dificil",
      fen: "k7/2Q5/1K6/8/8/8/8/7r b - - 0 1",
      goal: "empatar",
      solution: ["Rb1+"],
      hint: "O mesmo truque, do outro lado.",
      why: "...Tb1+! A torre desesperada força o empate: capturá-la afoga o rei preto.",
    },
    {
      level: "dificil",
      fen: "7k/5Q2/6K1/8/8/8/1r6/8 b - - 0 1",
      goal: "empatar",
      solution: ["Rg2+"],
      hint: "Só um lance salva. Comece os xeques pela coluna do rei branco.",
      why: "...Tg2+! Os xeques não acabam e, se o rei branco se aproximar da torre, ela pega a dama.",
    },
  ],
  quiz: [
    {
      question: "O que é o bispo da cor errada?",
      options: [
        "Um bispo que não controla a casa de promoção do peão de torre",
        "Um bispo de casas escuras",
        "Um bispo preso atrás dos peões",
      ],
      answer: 0,
      explanation:
        "Com o rei defensor no canto, esse bispo não consegue forçar a promoção.",
    },
    {
      question: "Quando acontece o afogamento?",
      options: [
        "Quando o lado na vez não está em xeque e não tem lances legais",
        "Quando o rei leva xeque três vezes",
        "Quando os dois lados ficam só com reis",
      ],
      answer: 0,
      explanation: "Sem lances e sem xeque, a partida termina empatada.",
    },
    {
      question: "O que é a torre desesperada?",
      options: [
        "Uma torre que dá xeques sem parar; capturá-la causa afogamento",
        "Uma torre presa no canto",
        "Uma torre que defende um peão",
      ],
      answer: 0,
      explanation:
        "Com o rei sem lances, a única peça que se mexe é a torre, e ela força o empate.",
    },
  ],
};
