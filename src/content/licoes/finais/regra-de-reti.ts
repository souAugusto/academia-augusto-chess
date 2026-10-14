import type { EndgameLesson } from "../types.ts";

export const regraDeReti: EndgameLesson = {
  kind: "final",
  slug: "regra-de-reti",
  title: "Regra de Réti",
  group: "peoes",
  difficulty: 2,
  summary:
    "O rei pode perseguir dois objetivos ao mesmo tempo: andando na diagonal, ele se aproxima do peão inimigo e do próprio peão.",
  theory: [
    "Em 1921 Richard Réti publicou um estudo que parece impossível: o rei branco, longe de tudo, consegue empatar contra um peão que está fora do quadrado. O segredo é a diagonal.",
    "No tabuleiro, andar na diagonal leva o rei tão rápido quanto andar em linha reta, mas cobre duas direções de uma vez. Assim o rei ameaça dois planos ao mesmo tempo: entrar no quadrado do peão adversário ou ajudar o próprio peão a promover. O adversário não consegue impedir os dois.",
    "A lição vai além deste estudo: nos finais, procure lances de rei que sirvam para duas coisas. Muitas vezes é o único jeito de ganhar tempo.",
  ],
  keyPoints: [
    "Andar na diagonal custa o mesmo número de lances que andar em linha reta.",
    "Um lance de rei pode ter dois objetivos ao mesmo tempo.",
    "Se o adversário segura um plano, o outro funciona.",
    "Antes de desistir de alcançar um peão, procure o caminho pela diagonal.",
  ],
  model: {
    fen: "7K/8/k1P5/7p/8/8/8/8 w - - 0 1",
    orientation: "white",
    caption:
      "O estudo de Réti (1921). O peão h5 parece imparável, mas o rei branco empata.",
    moves: [
      {
        san: "Kg7",
        note: "Pela diagonal, o rei vai em direção ao peão h5 e ao próprio peão c6.",
      },
      { san: "Kb6" },
      {
        san: "Kf6",
        note: "Agora ameaça entrar no quadrado do peão h com Rg5.",
      },
      { san: "h4" },
      {
        san: "Ke5",
        note: "Fora do quadrado, o rei vai para o outro lado: ameaça Rd6, ajudando o peão c6.",
      },
      {
        san: "Kxc6",
        note: "As pretas precisam pegar o peão c6 e perdem um tempo.",
      },
      { san: "Ke4", note: "Agora o rei branco entra no quadrado do peão h." },
      { san: "h3" },
      { san: "Kf3", note: "O rei alcança o peão: empate." },
    ],
  },
  practice: [
    {
      level: "facil",
      fen: "7K/8/1k1P4/7p/8/8/8/8 w - - 0 1",
      goal: "empatar",
      solution: ["Kg7"],
      accept: ["Kh7"],
      hint: "Corra atrás do peão h5 pela diagonal.",
      why: "Rg7 se aproxima do peão h5 e ainda pode voltar para ajudar o peão d6.",
    },
    {
      level: "medio",
      fen: "7K/8/k1P5/7p/8/8/8/8 w - - 0 1",
      goal: "empatar",
      solution: ["Kg7", "Kb6", "Kf6", "h4", "Ke5"],
      hint: "Use a diagonal: cada lance deve servir para dois objetivos.",
      why: "Rg7, Rf6 e Re5 ameaçam ao mesmo tempo alcançar o peão h e apoiar o peão c6. As pretas não conseguem impedir as duas coisas.",
    },
    {
      level: "medio",
      fen: "K7/8/5P1k/p7/8/8/8/8 w - - 0 1",
      goal: "empatar",
      solution: ["Kb7"],
      hint: "É o estudo de Réti espelhado. Para que diagonal o rei deve ir?",
      why: "Rb7 se aproxima do peão a5 e do próprio peão f6 ao mesmo tempo.",
    },
    {
      level: "dificil",
      fen: "8/8/8/8/7P/K1p5/8/7k b - - 0 1",
      goal: "empatar",
      solution: ["Kg2"],
      hint: "Agora você é o rei preto. Ande pela diagonal.",
      why: "...Rg2 vai em direção ao peão h4 e, se for preciso, volta para apoiar o peão c3.",
    },
    {
      level: "dificil",
      fen: "8/8/8/8/P7/5p1K/8/k7 b - - 0 1",
      goal: "empatar",
      solution: ["Kb2"],
      hint: "Persiga o peão a4 sem abandonar o seu peão f3.",
      why: "...Rb2 segue a diagonal rumo ao peão a4 e ao apoio do peão f3.",
    },
  ],
  quiz: [
    {
      question: "Qual é o segredo do estudo de Réti?",
      options: [
        "O rei anda na diagonal e persegue dois objetivos ao mesmo tempo",
        "O rei corre em linha reta até o peão",
        "O peão branco promove primeiro",
      ],
      answer: 0,
      explanation: "Andar na diagonal custa o mesmo e ameaça duas coisas.",
    },
    {
      question: "Andar na diagonal é mais lento que em linha reta?",
      options: [
        "Não: o rei chega ao mesmo tempo",
        "Sim, sempre",
        "Depende da cor da casa",
      ],
      answer: 0,
      explanation:
        "O número de lances é o maior entre a distância de colunas e a de fileiras.",
    },
    {
      question: "O que esta regra ensina para outros finais?",
      options: [
        "Procurar lances de rei que sirvam para dois planos",
        "Sempre empurrar os peões primeiro",
        "Nunca usar o rei",
      ],
      answer: 0,
      explanation:
        "Um lance com dois objetivos costuma ganhar o tempo que falta.",
    },
  ],
};
