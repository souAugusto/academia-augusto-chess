import type { EndgameLesson } from "../types.ts";

export const mateDoisBispos: EndgameLesson = {
  kind: "final",
  slug: "mate-dois-bispos",
  title: "Mate com dois bispos",
  group: "mates",
  difficulty: 2,
  summary:
    "Os dois bispos, lado a lado, formam uma parede diagonal. O rei ajuda a levar o adversário para um canto.",
  theory: [
    "Rei e dois bispos (um de casas claras e outro de casas escuras) vencem contra o rei sozinho. Dois bispos da mesma cor não conseguem: eles nunca controlam as casas da outra cor.",
    "Os bispos funcionam melhor lado a lado, em diagonais vizinhas. Juntos eles formam uma barreira que o rei adversário não consegue atravessar. O seu rei vem por trás e empurra o rei adversário até um canto qualquer.",
    "O mate só acontece no canto (ou na casa ao lado dele). Cuidado com o afogamento: quando o rei adversário estiver quase sem casas, deixe sempre uma casa livre até a hora do mate.",
  ],
  keyPoints: [
    "Use bispos de cores diferentes; com a mesma cor não há mate.",
    "Bispos lado a lado formam uma parede diagonal.",
    "O rei ajuda o tempo todo: os bispos sozinhos não dão mate.",
    "Leve o rei adversário para qualquer canto.",
    "Antes de cada lance, confira se o rei adversário ainda tem um lance (afogamento).",
  ],
  model: {
    fen: "6k1/8/8/5K2/8/8/8/2B2B2 w - - 0 1",
    orientation: "white",
    caption:
      "Mate em 6: o rei branco se aproxima e os bispos fecham as diagonais.",
    moves: [
      {
        san: "Kf6",
        note: "O rei branco vem primeiro, tirando casas do rei preto.",
      },
      { san: "Kf8" },
      { san: "Bb5", note: "O bispo de casas claras controla e8." },
      { san: "Kg8" },
      { san: "Kg6", note: "O rei branco fica em frente ao rei preto." },
      { san: "Kf8" },
      { san: "Ba3+", note: "O bispo de casas escuras empurra o rei de volta." },
      { san: "Kg8" },
      { san: "Bc4+" },
      { san: "Kh8" },
      { san: "Bb2#", note: "Mate no canto: cada bispo cobre uma diagonal." },
    ],
  },
  practice: [
    {
      level: "facil",
      fen: "k7/2K5/8/8/8/8/5B2/5B2 w - - 0 1",
      goal: "vencer",
      solution: ["Bg2#"],
      hint: "O rei preto está no canto. Um bispo já controla a7; o outro fecha a diagonal longa.",
      why: "Bg2# é mate: o bispo de f2 controla a7, o de g2 dá xeque em a8 e o rei branco cuida de b7 e b8.",
    },
    {
      level: "facil",
      fen: "1k6/1B6/1K6/8/8/8/5B2/8 w - - 0 1",
      goal: "vencer",
      solution: ["Bg3#"],
      hint: "Dê xeque pela diagonal que chega a b8.",
      why: "Bg3# é mate: o bispo de b7 controla a8 e c8, e o rei branco cuida de a7, b7 e c7.",
    },
    {
      level: "medio",
      fen: "1k6/8/1K6/8/8/8/4BB2/8 w - - 0 1",
      goal: "vencer",
      solution: ["Ba6", "Ka8", "Bb7+", "Kb8", "Bg3#"],
      hint: "Tire a casa c8 do rei preto com o bispo de casas claras.",
      why: "Ba6 deixa o rei preto entre a8 e b8. Depois Bb7+ e Bg3# completam o mate.",
    },
    {
      level: "medio",
      fen: "7k/8/6K1/8/8/8/8/3BB3 w - - 0 1",
      goal: "vencer",
      solution: ["Bb4", "Kg8", "Bb3+", "Kh8", "Bc3#"],
      hint: "Primeiro tire a casa f8 do rei preto.",
      why: "Bb4 controla f8. O rei preto só pode ir para g8; Bb3+ o devolve ao canto e Bc3# é mate.",
    },
    {
      level: "medio",
      fen: "k7/8/1K6/8/8/8/4B3/4B3 w - - 0 1",
      goal: "vencer",
      solution: ["Kc7", "Ka7", "Bf2+", "Ka8", "Bf3#"],
      hint: "Leve o rei para c7, tirando b8 do rei preto.",
      why: "Rc7 prende o rei preto em a7 e a8. Depois os bispos dão xeques nas duas diagonais.",
    },
    {
      level: "dificil",
      fen: "6k1/8/5K2/8/8/2BB4/8/8 w - - 0 1",
      goal: "vencer",
      solution: ["Bb4", "Kh8", "Kg6", "Kg8", "Bc4+", "Kh8", "Bc3#"],
      hint: "Tire a casa f8 antes de trazer o rei.",
      why: "Bb4 fecha f8. O rei branco chega a g6 e os bispos fazem o resto.",
    },
    {
      level: "dificil",
      fen: "k7/8/2K5/8/3B4/8/8/5B2 w - - 0 1",
      goal: "vencer",
      solution: ["Ba6", "Kb8", "Kb6", "Ka8", "Bb7+", "Kb8", "Be5#"],
      hint: "Controle c8 com o bispo de casas claras.",
      why: "Ba6 tira c8. O rei branco vai para b6, e Bb7+ seguido de Be5# é mate.",
    },
    {
      level: "dificil",
      fen: "7k/8/5KB1/8/8/8/8/2B5 w - - 0 1",
      goal: "vencer",
      solution: [
        "Bf7",
        "Kh7",
        "Ba2",
        "Kh8",
        "Kf7",
        "Kh7",
        "Bb1+",
        "Kh8",
        "Bb2#",
      ],
      hint: "Use o bispo para tirar g8 e depois abra caminho para o rei.",
      why: "O bispo de casas claras controla g8 e depois sai da frente para o rei ocupar f7. Bb1+ e Bb2# terminam.",
    },
  ],
  quiz: [
    {
      question: "Por que dois bispos da mesma cor não dão mate?",
      options: [
        "Porque nunca controlam as casas da outra cor",
        "Porque são lentos demais",
        "Porque o rei não ajuda",
      ],
      answer: 0,
      explanation:
        "O rei adversário sempre escapa pelas casas da cor que nenhum bispo controla.",
    },
    {
      question: "Onde acontece o mate com dois bispos?",
      options: ["No canto", "No centro", "Em qualquer borda"],
      answer: 0,
      explanation:
        "Só no canto (ou ao lado dele) os bispos e o rei conseguem tirar todas as casas.",
    },
    {
      question: "Qual é o maior perigo nesse final?",
      options: [
        "Afogar o rei adversário",
        "Perder um bispo",
        "O rei adversário escapar para o centro",
      ],
      answer: 0,
      explanation:
        "Com poucas casas, é fácil tirar a última. Confira sempre se ele tem um lance.",
    },
  ],
};
