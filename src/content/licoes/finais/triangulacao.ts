import type { EndgameLesson } from "../types.ts";

export const triangulacao: EndgameLesson = {
  kind: "final",
  slug: "triangulacao",
  title: "Triangulação",
  group: "peoes",
  difficulty: 3,
  summary:
    "Como passar a vez sem lance de peão: o rei anda em triângulo e volta à mesma posição com o adversário na vez.",
  theory: [
    "Às vezes a posição seria ganha se fosse a vez do adversário, mas é a sua. Sem lances de peão sobrando, a solução é a triangulação: o rei faz três lances formando um triângulo e volta para a mesma posição, enquanto o rei adversário, preso à defesa, só consegue alternar entre duas casas. Depois da manobra, a posição é a mesma, mas com o adversário na vez.",
    "O exemplo clássico é o estudo de Lasker e Reichhelm (1901). Todos os peões estão bloqueados e as brancas só vencem levando o rei, com muita precisão, até o lado em que podem atacar os peões pretos.",
    "A triangulação funciona quando o seu rei tem mais espaço que o adversário: ele tem três casas boas para circular e o outro rei tem só duas.",
  ],
  keyPoints: [
    "Triangulação: três lances do rei para voltar à mesma posição.",
    "O objetivo é passar a vez para o adversário.",
    "Funciona quando o rei adversário só tem duas casas para alternar.",
    "Com peões bloqueados, cada tempo decide o final.",
  ],
  model: {
    fen: "8/k7/3p4/p2P1p2/P2P1P2/8/8/K7 w - - 0 1",
    orientation: "white",
    caption: "Estudo de Lasker e Reichhelm (1901): só um caminho do rei vence.",
    moves: [
      { san: "Kb1", note: "O rei começa a viagem pela primeira fileira." },
      { san: "Kb7" },
      {
        san: "Kc1",
        note: "Cada lance branco precisa deixar as pretas sem a resposta certa.",
      },
      { san: "Kc7" },
      { san: "Kd1" },
      { san: "Kd7" },
      {
        san: "Kc2",
        note: "O rei circula por c1, d1 e c2: o rei preto só acompanha.",
      },
      { san: "Kc7" },
      {
        san: "Kd2",
        note: "Mesma ideia: o rei branco tem casas de sobra e passa a vez quando precisa.",
      },
    ],
  },
  practice: [
    {
      level: "facil",
      fen: "8/8/4K3/4p1p1/3kP1P1/8/8/8 w - - 0 1",
      goal: "vencer",
      solution: ["Kf5"],
      hint: "Ataque os peões pretos com o rei.",
      why: "Rf5 ataca e5 e g5 ao mesmo tempo. O rei preto não defende os dois.",
    },
    {
      level: "facil",
      fen: "8/8/3K4/1p1p4/1P1Pk3/8/8/8 w - - 0 1",
      goal: "vencer",
      solution: ["Kc5"],
      hint: "A mesma ideia do outro lado: ataque dois peões com o rei.",
      why: "Rc5 ataca b5 e d5. O rei preto não consegue defender os dois.",
    },
    {
      level: "medio",
      fen: "8/1k6/3p4/p2P1p2/P2P1P2/8/8/1K6 w - - 0 1",
      goal: "vencer",
      solution: ["Kc1"],
      hint: "Continue a manobra, acompanhando o rei preto.",
      why: "Rc1! mantém a correspondência: para cada lance preto, o rei branco tem a resposta certa.",
    },
    {
      level: "dificil",
      fen: "8/2k5/3p4/p2P1p2/P2P1P2/8/8/2K5 w - - 0 1",
      goal: "vencer",
      solution: ["Kd1"],
      accept: ["Kb1"],
      hint: "O rei preto foi para c7. Qual é a casa correspondente do rei branco?",
      why: "Rd1 mantém o rei branco na casa certa em relação ao preto e prepara a triangulação.",
    },
    {
      level: "dificil",
      fen: "8/3k4/3p4/p2P1p2/P2P1P2/8/8/3K4 w - - 0 1",
      goal: "vencer",
      solution: ["Kc2"],
      accept: ["Kc1"],
      hint: "Agora o rei branco usa o triângulo c1, d1 e c2.",
      why: "Rc2 faz parte do triângulo: o rei branco volta às mesmas casas com as pretas na vez.",
    },
  ],
  quiz: [
    {
      question: "Para que serve a triangulação?",
      options: [
        "Para passar a vez ao adversário sem lance de peão",
        "Para dar xeque",
        "Para trocar peões",
      ],
      answer: 0,
      explanation:
        "O rei volta à mesma posição em três lances, e o adversário fica na vez.",
    },
    {
      question: "Quando a triangulação funciona?",
      options: [
        "Quando o seu rei tem três casas boas e o adversário só duas",
        "Sempre",
        "Só com damas no tabuleiro",
      ],
      answer: 0,
      explanation:
        "O rei adversário, preso à defesa, não consegue fazer o mesmo triângulo.",
    },
    {
      question:
        "Quem criou o estudo clássico de triangulação mostrado na lição?",
      options: ["Lasker e Reichhelm", "Réti", "Lucena"],
      answer: 0,
      explanation: "O estudo de Lasker e Reichhelm é de 1901.",
    },
  ],
};
