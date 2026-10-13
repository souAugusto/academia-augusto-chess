import type { EndgameLesson } from "../types.ts";

export const mateDama: EndgameLesson = {
  kind: "final",
  slug: "mate-rei-e-dama",
  title: "Rei e dama contra rei",
  group: "mates",
  difficulty: 1,
  summary:
    "O mate mais importante: a dama prende o rei na borda e o seu rei ajuda a fechar.",
  theory: [
    "Com rei e dama contra rei sozinho, a vitória é garantida, mas precisa de método. A dama sozinha não dá mate: ela empurra o rei adversário para a borda e o seu rei vem ajudar a fechar a última casa.",
    'O truque é usar a dama como uma "cerca": ela fica a um lance de cavalo de distância do rei adversário e vai diminuindo o espaço dele, sempre sem dar xeques à toa.',
    "O grande perigo é o afogamento (o rei adversário não está em xeque e não tem nenhum lance legal: a partida termina empatada). Antes de cada lance de dama, confira se o rei adversário ainda tem para onde ir.",
  ],
  keyPoints: [
    "Empurre o rei para qualquer borda; não precisa ser um canto.",
    "A dama a um salto de cavalo do rei adversário corta o máximo de casas.",
    "Traga o seu rei: sem ele não há mate.",
    "Quando o rei adversário tiver poucas casas, olhe sempre se ele ainda tem um lance (perigo de afogamento).",
    "O mate é dado com a dama protegida pelo rei, ou com a dama na borda e o rei na frente.",
  ],
  model: {
    fen: "8/8/8/3k4/8/8/8/K5Q1 w - - 0 1",
    orientation: "white",
    caption:
      "Do meio do tabuleiro até o mate em 9 lances, o caminho mais curto.",
    moves: [
      {
        san: "Qe1",
        note: "A dama corta a coluna e: o rei preto fica preso do lado esquerdo do tabuleiro.",
      },
      { san: "Kd6" },
      {
        san: "Kb2",
        note: "Com o rei preto cercado, o rei branco começa a subir para ajudar.",
      },
      { san: "Kd7" },
      {
        san: "Kc3",
        note: "O rei branco se aproxima sem pressa: a dama segura a cerca sozinha.",
      },
      { san: "Kc6" },
      {
        san: "Qe6+",
        note: "Xeque que encolhe a caixa: agora o rei preto só tem as duas últimas fileiras.",
      },
      { san: "Kc7" },
      { san: "Kc4", note: "Mais um passo do rei branco." },
      { san: "Kb7" },
      { san: "Kc5" },
      { san: "Kc7" },
      { san: "Qe7+", note: "A dama empurra o rei para a última fileira." },
      { san: "Kb8" },
      {
        san: "Kc6",
        note: "O rei branco chega: agora ele protege as casas de mate.",
      },
      { san: "Kc8" },
      {
        san: "Qc7#",
        note: "Mate: a dama protegida pelo rei, e o rei preto sem casas.",
      },
    ],
  },
  practice: [
    {
      level: "facil",
      fen: "6k1/8/6K1/8/8/8/8/Q7 w - - 0 1",
      goal: "vencer",
      solution: ["Qa8#"],
      accept: ["Qg7#"],
      hint: "O rei preto está na borda e o seu rei controla a fileira de baixo dele.",
      why: "Qa8# fecha a oitava fileira; o rei branco em g6 cuida de f7, g7 e h7. Qg7# também é mate, com a dama protegida pelo rei.",
    },
    {
      level: "facil",
      fen: "3k4/8/3K4/8/8/8/8/6Q1 w - - 0 1",
      goal: "vencer",
      solution: ["Qg8#"],
      hint: "Os reis estão frente a frente. Ataque a fileira do rei preto.",
      why: "Qg8# dá xeque pela oitava fileira, e o rei branco em d6 tira as casas c7, d7 e e7.",
    },
    {
      level: "medio",
      fen: "7k/8/6K1/8/8/8/8/5Q2 w - - 0 1",
      goal: "vencer",
      solution: ["Qf8#"],
      hint: "Cuidado: um lance de dama natural aqui afoga o rei preto.",
      why: "Qf8# é mate. A armadilha é Qf7??: o rei preto não estaria em xeque e não teria nenhum lance, e a partida terminaria empatada por afogamento.",
    },
    {
      level: "medio",
      fen: "8/8/8/8/k7/8/2K5/1Q6 w - - 0 1",
      goal: "vencer",
      solution: ["Qb6", "Ka3", "Qb3#"],
      hint: "Um lance tranquilo de dama deixa o rei preto com uma só casa.",
      why: "Qb6 tira todas as casas do rei preto, menos a3. Depois de Ka3, Qb3# é mate, com a dama protegida pelo rei de c2.",
    },
    {
      level: "medio",
      fen: "2k5/8/1K6/8/8/8/8/3Q4 w - - 0 1",
      goal: "vencer",
      solution: ["Qd4", "Kb8", "Qd8#"],
      accept: ["Qd2", "Qd3", "Qd5"],
      hint: "Controle a coluna d sem tirar a última casa do rei preto.",
      why: "Com a dama na coluna d, o rei preto só pode ir para b8, e Qd8# é mate. Cuidado com Qd6??: o rei preto fica sem lances e é afogamento.",
    },
    {
      level: "dificil",
      fen: "8/1k6/8/1K6/8/8/8/6Q1 w - - 0 1",
      goal: "vencer",
      solution: ["Qc5", "Kb8", "Kb6", "Ka8", "Qc8#"],
      accept: ["Qg7+"],
      hint: "Prenda o rei preto nas duas últimas colunas e traga o seu rei.",
      why: "Qc5 cerca o rei preto em a8 e b8. O rei branco vem para b6 e a dama dá mate na oitava fileira. Qg7+ também leva ao mate em 3.",
    },
    {
      level: "dificil",
      fen: "8/8/8/8/8/2k5/8/K2Q4 w - - 0 1",
      goal: "vencer",
      solution: ["Qd5"],
      accept: ["Ka2"],
      hint: "Use a dama como cerca, a um salto de cavalo do rei preto.",
      why: "Qd5 prende o rei preto num canto pequeno do tabuleiro; depois o rei branco se aproxima. Ka2 também funciona: o rei vem ajudar antes.",
    },
    {
      level: "dificil",
      fen: "8/8/2k5/8/8/8/1Q6/K7 w - - 0 1",
      goal: "vencer",
      solution: ["Qd4"],
      accept: ["Qd2", "Qe5", "Qf6+"],
      hint: "Corte uma coluna inteira do rei preto com a dama.",
      why: "Com a dama em d4 o rei preto fica preso nas colunas a, b e c; em seguida o rei branco sobe pela coluna b ou c.",
    },
  ],
  quiz: [
    {
      question: "O que é afogamento?",
      options: [
        "O rei está em xeque e não tem como sair",
        "O jogador da vez não está em xeque e não tem nenhum lance legal: é empate",
        "Quando a dama é trocada pelo rei",
      ],
      answer: 1,
      explanation:
        "No afogamento o rei não está em xeque, mas não existe lance legal. A partida termina empatada.",
    },
    {
      question: "A dama sozinha consegue dar mate no rei adversário?",
      options: [
        "Sim, em qualquer posição",
        "Não, ela precisa da ajuda do próprio rei",
        "Só se o rei adversário estiver no centro",
      ],
      answer: 1,
      explanation:
        "A dama empurra o rei para a borda, mas o mate precisa do rei para proteger a dama ou fechar casas.",
    },
    {
      question:
        "Qual é a boa distância entre a dama e o rei adversário para encolher a caixa?",
      options: [
        "Colada nele, para dar xeque",
        "Um salto de cavalo de distância",
        "Do outro lado do tabuleiro",
      ],
      answer: 1,
      explanation:
        "A um salto de cavalo, a dama corta o máximo de casas sem ficar exposta a ser capturada.",
    },
  ],
};
