import type { EndgameLesson } from "../types.ts";

export const mateDuasTorres: EndgameLesson = {
  kind: "final",
  slug: "mate-duas-torres",
  title: "Mate com duas torres",
  group: "mates",
  difficulty: 1,
  summary:
    "A escada: uma torre corta a fileira, a outra dá xeque, e o rei adversário sobe degrau por degrau até a borda.",
  theory: [
    "Duas torres dão mate sem precisar do próprio rei. A técnica se chama escada (ou cortador de grama): uma torre corta uma fileira e a outra dá xeque na fileira seguinte. O rei adversário é empurrado uma fileira por vez até a borda.",
    "O único cuidado é o rei adversário se aproximar das torres. Quando isso acontecer, leve a torre ameaçada para o outro lado do tabuleiro, na mesma fileira, e continue a escada.",
    "Às vezes o seu rei ajuda a encurtar o caminho, mas a escada sempre funciona e é o método mais seguro.",
  ],
  keyPoints: [
    "Uma torre corta, a outra dá xeque: depois elas trocam de papel.",
    "As torres ficam em colunas vizinhas para não se atrapalharem.",
    "Se o rei adversário atacar uma torre, leve-a para o lado oposto do tabuleiro.",
    "O mate é dado na última fileira (ou coluna), com a outra torre segurando a penúltima.",
  ],
  model: {
    fen: "8/8/8/8/1k6/6R1/8/K6R w - - 0 1",
    orientation: "white",
    caption:
      "A escada passo a passo. Aqui existe um mate mais curto, mas a escada funciona sempre que o rei adversário está longe das torres.",
    moves: [
      {
        san: "Rh4+",
        note: "A torre de g3 corta a terceira fileira; a de h1 dá xeque na quarta.",
      },
      { san: "Kb5" },
      {
        san: "Rg5+",
        note: "Agora a torre de h4 corta e a de g3 sobe com xeque.",
      },
      { san: "Kc6" },
      { san: "Rh6+" },
      { san: "Kd7" },
      { san: "Rg7+", note: "O rei preto chegou à última fileira." },
      { san: "Ke8" },
      {
        san: "Rh8#",
        note: "Mate: a torre de g7 segura a sétima e a de h8 fecha a oitava.",
      },
    ],
  },
  practice: [
    {
      level: "facil",
      fen: "6k1/R7/8/8/8/8/8/1R4K1 w - - 0 1",
      goal: "vencer",
      solution: ["Rb8#"],
      hint: "Uma torre já corta a sétima fileira. Feche a oitava.",
      why: "Tb8# é mate: a torre de a7 controla a sétima fileira e a de b8 dá xeque na oitava.",
    },
    {
      level: "facil",
      fen: "k7/7R/8/8/8/8/8/K5R1 w - - 0 1",
      goal: "vencer",
      solution: ["Rg8#"],
      hint: "Suba com a torre que está livre.",
      why: "Tg8# é mate: a torre de h7 segura a sétima fileira.",
    },
    {
      level: "facil",
      fen: "6k1/8/6K1/8/8/8/8/R6R w - - 0 1",
      goal: "vencer",
      solution: ["Ra8#"],
      hint: "Com o rei branco em frente ao rei preto, basta uma torre.",
      why: "Ta8# é mate: o rei branco controla f7, g7 e h7.",
    },
    {
      level: "medio",
      fen: "1k6/8/8/8/8/8/R7/6RK w - - 0 1",
      goal: "vencer",
      solution: ["Rg7", "Kc8", "Ra8#"],
      hint: "Corte a sétima fileira com uma torre; a outra dá o mate.",
      why: "Tg7 prende o rei na oitava fileira. Depois de ...Rc8, Ta8# é mate.",
    },
    {
      level: "medio",
      fen: "8/5k2/8/8/8/R7/1R6/K7 w - - 0 1",
      goal: "vencer",
      solution: ["Ra6", "Kg7", "Rb7+", "Kf8", "Ra8#"],
      hint: "Comece a escada com a torre da coluna a, cortando a sexta fileira.",
      why: "Ta6 corta a sexta fileira. Depois Tb7+ e Ta8#: a escada até o fim.",
    },
    {
      level: "dificil",
      fen: "8/8/4k3/8/R7/7R/8/K7 w - - 0 1",
      goal: "vencer",
      solution: [
        "Ra5",
        "Kf6",
        "Rh6+",
        "Kg7",
        "Rb6",
        "Kf7",
        "Ra7+",
        "Kg8",
        "Rb8#",
      ],
      hint: "Comece a escada pela quinta fileira.",
      why: "Ta5 corta a quinta fileira. Quando o rei preto chega perto da torre de h6, ela vai para o outro lado (Tb6) e a escada continua.",
    },
    {
      level: "dificil",
      fen: "8/8/8/8/2k5/8/R7/1R4K1 w - - 0 1",
      goal: "vencer",
      solution: [
        "Rd2",
        "Kc3",
        "Rd7",
        "Kc2",
        "Rbd1",
        "Kc3",
        "Rc7+",
        "Kb2",
        "Rd6",
        "Kb3",
        "Rb6+",
        "Ka2",
        "Ra7#",
      ],
      hint: "O rei preto está perto das torres. Afaste uma delas para cortar a coluna d.",
      why: "As torres cortam colunas em vez de fileiras e empurram o rei para a coluna a. Afastar a torre atacada é a chave.",
    },
  ],
  quiz: [
    {
      question: "Como funciona a escada com duas torres?",
      options: [
        "Uma torre corta uma fileira e a outra dá xeque na seguinte, alternando",
        "As duas torres dão xeque ao mesmo tempo",
        "O rei faz quase todo o trabalho",
      ],
      answer: 0,
      explanation: "As torres se revezam: uma segura, a outra empurra.",
    },
    {
      question: "O que fazer quando o rei adversário se aproxima de uma torre?",
      options: [
        "Levar a torre para o outro lado do tabuleiro, na mesma fileira",
        "Trocar as torres de lugar",
        "Dar xeque com a outra torre",
      ],
      answer: 0,
      explanation:
        "Longe do rei, a torre continua cortando a mesma fileira com segurança.",
    },
    {
      question: "O rei é necessário para dar mate com duas torres?",
      options: [
        "Não, as torres conseguem sozinhas",
        "Sim, sempre",
        "Só no canto",
      ],
      answer: 0,
      explanation:
        "A escada funciona sem o rei; ele só ajuda a encurtar o caminho.",
    },
  ],
};
