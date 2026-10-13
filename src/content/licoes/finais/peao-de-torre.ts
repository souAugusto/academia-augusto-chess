import type { EndgameLesson } from "../types.ts";

export const peaoDeTorre: EndgameLesson = {
  kind: "final",
  slug: "peao-de-torre",
  title: "Peão de torre",
  group: "peoes",
  difficulty: 2,
  summary:
    "O peão da coluna a ou h é o mais fácil de parar: se o rei defensor chega ao canto, o final empata mesmo com o rei atacante por perto.",
  theory: [
    "Com peão central, o rei atacante na frente do peão costuma vencer. Com peão de torre é diferente: o canto tem pouco espaço e o rei defensor que chega a ele não sai mais. O atacante acaba sem casas para manobrar e a partida termina em afogamento ou em repetição.",
    "Por isso o defensor tem um objetivo simples: correr para a casa de promoção ou para a casa ao lado dela (b8 ou b7 contra o peão a; g8 ou g7 contra o peão h). Com o rei preso ali, nem a oposição ajuda o atacante.",
    "O atacante só vence se impedir essa corrida. O rei dele precisa chegar antes à coluna vizinha (b ou g) e fechar o caminho do rei adversário, como um escudo. Se o rei defensor já está fora de alcance, basta empurrar o peão.",
  ],
  keyPoints: [
    "Rei defensor no canto da promoção: empate.",
    "Defensor: corra para a casa de promoção ou para a vizinha dela.",
    "Atacante: feche a coluna vizinha com o rei antes da chegada do adversário.",
    "Cuidado com o afogamento quando o peão chega à sétima fileira.",
  ],
  model: {
    fen: "1k6/8/PK6/8/8/8/8/8 b - - 0 1",
    orientation: "black",
    caption: "O rei preto só tem uma casa que salva a partida.",
    moves: [
      {
        san: "Ka8",
        note: "O rei vai para o canto. Agora as brancas não conseguem tirá-lo dali.",
      },
      {
        san: "a7",
        note: "Se o peão avança, o rei preto fica sem lances: afogamento. Se o rei branco se afasta, o preto volta a b8.",
      },
    ],
  },
  practice: [
    {
      level: "facil",
      fen: "8/8/1K1k4/8/P7/8/8/8 w - - 0 1",
      goal: "vencer",
      solution: ["Kb7"],
      accept: ["a5"],
      hint: "Use o rei para fechar o caminho do rei preto até o canto.",
      why: "Rb7 controla c8 e c7. O rei preto não chega a a8 e o peão promove.",
    },
    {
      level: "facil",
      fen: "8/3k4/8/P3K3/8/8/8/8 b - - 0 1",
      goal: "empatar",
      solution: ["Kc7"],
      accept: ["Kc6", "Kc8", "Kd8"],
      hint: "Corra para o canto a8.",
      why: "...Rc7 leva o rei a b8 e a8 a tempo. Com o rei no canto, o peão de torre não promove.",
    },
    {
      level: "medio",
      fen: "3k4/8/1K6/P7/8/8/8/8 w - - 0 1",
      goal: "vencer",
      solution: ["a6"],
      accept: ["Kb7"],
      hint: "O rei branco já fecha o caminho. Conte quantos lances o peão precisa.",
      why: "a6! O rei branco em b6 impede o rei preto de chegar a b7 e o peão corre sozinho.",
    },
    {
      level: "medio",
      fen: "8/4k3/8/P1K5/8/8/8/8 b - - 0 1",
      goal: "empatar",
      solution: ["Kd7"],
      accept: ["Kd8"],
      hint: "O rei branco quer ir para b6. Chegue antes a c7 ou c8.",
      why: "...Rd7 ameaça ...Rc7 e ...Rb8. O rei preto chega ao canto a tempo.",
    },
    {
      level: "medio",
      fen: "8/4k3/8/1K6/P7/8/8/8 w - - 0 1",
      goal: "vencer",
      solution: ["Kb6"],
      accept: ["Ka6", "Kc6"],
      hint: "Avance o rei antes do peão e feche a coluna b e a coluna c.",
      why: "Rb6 controla b7 e c7. O rei preto não chega ao canto e o peão vem depois.",
    },
    {
      level: "dificil",
      fen: "1k6/8/PK6/8/8/8/8/8 b - - 0 1",
      goal: "empatar",
      solution: ["Ka8"],
      hint: "Só uma casa salva. Pense no afogamento.",
      why: "...Ra8! Se a7, o rei preto fica afogado. Qualquer outro lance perde: ...Rc8 a7 e o peão promove.",
    },
    {
      level: "dificil",
      fen: "2k5/8/PK6/8/8/8/8/8 b - - 0 1",
      goal: "empatar",
      solution: ["Kb8"],
      hint: "Fique na frente do peão, na casa vizinha à de promoção.",
      why: "...Rb8! bloqueia o peão. Depois de a7+, ...Ra8 e o rei branco só pode afogar ou se afastar.",
    },
  ],
  quiz: [
    {
      question: "Por que o peão de torre é o mais fácil de parar?",
      options: [
        "Porque o rei defensor no canto não pode ser expulso",
        "Porque ele anda mais devagar",
        "Porque não pode promover a dama",
      ],
      answer: 0,
      explanation:
        "No canto não há espaço para o rei atacante manobrar: o resultado é afogamento ou repetição.",
    },
    {
      question: "Qual é o plano do rei atacante?",
      options: [
        "Fechar a coluna vizinha antes que o rei defensor chegue ao canto",
        "Ficar atrás do peão",
        "Trocar o peão por outro",
      ],
      answer: 0,
      explanation:
        "Contra o peão a, o rei atacante em b7 ou b6 corta o caminho até a8.",
    },
    {
      question:
        "O rei preto está em a8, o rei branco em b6 e o peão em a6. Se as brancas jogam a7, o que acontece?",
      options: ["Afogamento: empate", "As brancas vencem", "Xeque-mate"],
      answer: 0,
      explanation: "O rei preto não está em xeque e não tem lances legais.",
    },
  ],
};
