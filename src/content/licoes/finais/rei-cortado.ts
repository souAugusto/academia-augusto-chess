import type { EndgameLesson } from "../types.ts";

export const reiCortado: EndgameLesson = {
  kind: "final",
  slug: "rei-cortado",
  title: "Rei cortado",
  group: "torres",
  difficulty: 2,
  summary:
    "Com a torre, isole o rei adversário longe do peão. Cortado por duas colunas, ele não volta a tempo.",
  theory: [
    "Em torre e peão contra torre, o rei defensor quer ficar na frente do peão (como na posição de Philidor). O atacante tenta impedir isso cortando o rei com a torre: ela ocupa uma coluna (ou fileira) entre o rei defensor e o peão.",
    "A regra prática: com um peão central ou de bispo, se o rei defensor estiver cortado por duas colunas, o atacante costuma vencer, porque o próprio rei consegue escoltar o peão enquanto a torre segura o corte. Cortado por uma coluna só, o defensor normalmente se salva.",
    "Depois de cortar, o rei atacante avança na frente do peão, se escondendo dos xeques atrás do próprio peão ou perto da torre.",
  ],
  keyPoints: [
    "Coloque a torre entre o rei adversário e o peão.",
    "Corte por duas colunas costuma ganhar; por uma, costuma empatar.",
    "Depois do corte, o rei atacante leva o peão.",
    "Contra os xeques, o rei se aproxima da torre adversária ou se esconde atrás do peão.",
  ],
  model: {
    fen: "1r6/8/6k1/8/3P4/3K4/8/R7 w - - 0 1",
    orientation: "white",
    caption: "Torre na coluna f: o rei preto fica cortado por duas colunas.",
    moves: [
      { san: "Rf1", note: "O corte: o rei preto não atravessa a coluna f." },
      { san: "Rd8" },
      { san: "Kc4", note: "O rei branco avança na frente do peão." },
      { san: "Rc8+" },
      {
        san: "Kb5",
        note: "O rei se esconde dos xeques e continua apoiando o peão.",
      },
      { san: "Rd8" },
      { san: "Rd1", note: "A torre volta para apoiar o peão por trás." },
      { san: "Kf5" },
    ],
  },
  practice: [
    {
      level: "facil",
      fen: "6r1/8/1k6/8/4P3/4K3/8/7R w - - 0 1",
      goal: "vencer",
      solution: ["Rc1"],
      hint: "Coloque a torre numa coluna entre o rei preto e o peão.",
      why: "Tc1 corta o rei preto por duas colunas (c e d). O rei branco escolta o peão.",
    },
    {
      level: "facil",
      fen: "1r6/8/6k1/8/3P4/3K4/8/R7 w - - 0 1",
      goal: "vencer",
      solution: ["Rf1"],
      hint: "Corte o rei preto pela coluna f.",
      why: "Tf1 deixa o rei preto cortado por duas colunas (e e f).",
    },
    {
      level: "medio",
      fen: "1r6/6k1/8/8/3P4/2K5/8/R7 w - - 0 1",
      goal: "vencer",
      solution: ["Rf1"],
      hint: "Antes de mexer no peão, isole o rei preto.",
      why: "Tf1 corta o rei. Depois o rei branco sobe pela ala da dama.",
    },
    {
      level: "medio",
      fen: "1r6/8/5k2/8/3P4/3K4/8/4R3 b - - 0 1",
      goal: "empatar",
      solution: ["Rd8"],
      accept: ["Rc8", "Rg8", "Rh8", "Ra8"],
      hint: "O seu rei está cortado por só uma coluna. Prepare-se para os xeques e para pressionar o peão.",
      why: "Com o rei a uma coluna do peão, as pretas seguram: a torre ataca o peão ou dá xeques de longe.",
    },
    {
      level: "dificil",
      fen: "3r4/8/6k1/8/3P4/3K4/8/5R2 w - - 2 2",
      goal: "vencer",
      solution: ["Kc4", "Rc8+", "Kb5"],
      hint: "O corte já está feito. Agora o rei avança na frente do peão, sem medo dos xeques.",
      why: "Rc4 e Rb5: o rei branco escapa dos xeques e apoia o peão, enquanto o rei preto continua cortado.",
    },
  ],
  quiz: [
    {
      question: "O que é cortar o rei com a torre?",
      options: [
        "Colocar a torre numa coluna entre o rei adversário e o peão",
        "Dar xeque no rei",
        "Trocar as torres",
      ],
      answer: 0,
      explanation:
        "A torre impede o rei de atravessar a coluna e chegar à frente do peão.",
    },
    {
      question:
        "Por quantas colunas o rei precisa estar cortado para o atacante costumar vencer?",
      options: ["Duas", "Uma", "Três ou mais, sempre"],
      answer: 0,
      explanation:
        "Com uma coluna o defensor costuma voltar a tempo; com duas, não.",
    },
    {
      question: "Depois do corte, quem leva o peão?",
      options: ["O rei atacante", "A torre", "O peão sozinho"],
      answer: 0,
      explanation: "A torre segura o corte; o rei abre caminho para o peão.",
    },
  ],
};
