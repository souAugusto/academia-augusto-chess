import type { EndgameLesson } from "../types.ts";

export const torreAtiva: EndgameLesson = {
  kind: "final",
  slug: "torre-ativa-contra-torre-passiva",
  title: "Torre ativa contra torre passiva",
  group: "torres",
  difficulty: 2,
  summary:
    "Nos finais de torre, a atividade vale muitas vezes mais que um peão. Torre que ataca, dá xeques e corta o rei manda no jogo.",
  theory: [
    "Uma torre ativa ataca peões, dá xeques, corta o rei adversário ou empurra o próprio peão passado por trás. Uma torre passiva só defende: fica presa a um peão ou a uma casa e não faz mais nada.",
    "Por isso os mestres repetem: nos finais de torre, ative a torre, mesmo que isso custe um peão. Uma torre passiva costuma perder; uma torre ativa costuma salvar posições difíceis.",
    "Na prática: antes de defender um peão com a torre, pergunte se ela pode atacar algo do adversário. Um xeque no momento certo também ganha tempo para o seu rei ou para o seu peão.",
  ],
  keyPoints: [
    "Torre ativa: ataca, dá xeques, corta o rei ou apoia o peão por trás.",
    "Torre passiva: presa à defesa de um peão ou de uma casa.",
    "Atividade costuma valer mais que um peão.",
    "Xeques no momento certo ganham tempo.",
  ],
  model: {
    fen: "8/8/8/1k3P2/7K/4p3/2P4R/1r6 w - - 0 1",
    orientation: "white",
    caption: "A torre branca sai da defesa e ataca o peão e3.",
    moves: [
      {
        san: "Re2",
        note: "Em vez de esperar, a torre ataca o peão mais avançado das pretas.",
      },
      { san: "Rc1" },
      { san: "Rxe3", note: "O peão perigoso cai." },
      { san: "Rxc2" },
      {
        san: "Kg5",
        note: "Agora o rei branco apoia o peão f, e a torre branca está mais ativa.",
      },
    ],
  },
  practice: [
    {
      level: "facil",
      fen: "8/8/8/1k3P2/7K/4p3/2P4R/1r6 w - - 0 1",
      goal: "vencer",
      solution: ["Re2"],
      hint: "Ataque o peão mais perigoso das pretas.",
      why: "Te2 ataca e3. A troca de peões deixa as brancas com o peão f mais perigoso e a torre ativa.",
    },
    {
      level: "facil",
      fen: "k7/4r3/8/P7/K7/4p3/R1P5/8 w - - 0 1",
      goal: "empatar",
      solution: ["Ra1"],
      hint: "O peão e3 vai correr. Leve a torre para onde ela possa pará-lo.",
      why: "Ta1 prepara Te1, parando o peão e por trás. A torre passiva em a2 não ajudaria.",
    },
    {
      level: "medio",
      fen: "8/7r/8/p1k3P1/1R6/2P5/8/3K4 w - - 0 1",
      goal: "vencer",
      solution: ["Rg4"],
      hint: "Coloque a torre atrás do seu peão passado.",
      why: "Tg4 apoia o peão g por trás. A torre preta fica presa na frente dele.",
    },
    {
      level: "medio",
      fen: "2K5/5k2/1p2r3/1R4P1/P7/8/8/8 w - - 0 1",
      goal: "vencer",
      solution: ["Rb4"],
      hint: "Proteja o peão a4 sem deixar a torre passiva: o rei vai buscar o peão b6.",
      why: "Tb4 defende a4 e mantém a torre livre. O rei branco vai a c7 e captura b6.",
    },
    {
      level: "dificil",
      fen: "8/2R3P1/3r4/k5P1/8/2K5/p7/8 w - - 0 1",
      goal: "vencer",
      solution: ["Ra7+"],
      hint: "Um xeque que também para o peão a2.",
      why: "Ta7+ ganha um tempo e coloca a torre atrás do peão a2. Depois g8=D decide.",
    },
    {
      level: "dificil",
      fen: "8/8/K7/P5r1/7R/1P6/6p1/3k4 w - - 0 1",
      goal: "empatar",
      solution: ["Ra4"],
      hint: "O peão g2 está perto de promover. A torre precisa de uma linha ativa.",
      why: "Ta4 prepara Ta1, de onde a torre controla a primeira fileira. Com a torre ativa, as brancas empatam.",
    },
    {
      level: "dificil",
      fen: "3K4/8/2P5/8/k3r3/4p3/7P/1R6 w - - 0 1",
      goal: "vencer",
      solution: ["c7"],
      hint: "O seu peão c está mais perto da promoção. Os xeques pretos não bastam.",
      why: "c7! O rei branco escapa dos xeques perto do peão e a torre de b1 ainda controla a coluna b.",
    },
  ],
  quiz: [
    {
      question: "O que é uma torre passiva?",
      options: [
        "Uma torre presa à defesa de um peão ou de uma casa",
        "Uma torre que ainda não saiu do lugar",
        "Uma torre que dá xeques",
      ],
      answer: 0,
      explanation:
        "Presa à defesa, ela não ataca nada e não ajuda o próprio rei.",
    },
    {
      question: "Vale a pena dar um peão para ativar a torre?",
      options: [
        "Muitas vezes sim: nos finais de torre a atividade pesa muito",
        "Nunca",
        "Só no começo da partida",
      ],
      answer: 0,
      explanation: "Uma torre ativa costuma compensar o peão perdido.",
    },
    {
      question: "Onde a torre fica mais ativa em relação a um peão passado?",
      options: ["Atrás dele", "Na frente dele", "Longe da coluna dele"],
      answer: 0,
      explanation: "Atrás do peão, a torre ganha força a cada avanço.",
    },
  ],
};
