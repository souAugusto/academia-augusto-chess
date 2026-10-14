import type { EndgameLesson } from "../types.ts";

export const bispoBomMau: EndgameLesson = {
  kind: "final",
  slug: "bispo-bom-contra-bispo-mau",
  title: "Bispo bom contra bispo mau",
  group: "bispos",
  difficulty: 3,
  summary:
    "Bispo mau é o que fica preso atrás dos próprios peões. O bispo bom ataca esses peões, e a troca certa leva a um final de peões ganho.",
  theory: [
    "Um bispo é chamado de mau quando os próprios peões estão fixos em casas da cor dele: ele vira um defensor passivo, preso atrás dos peões. O bispo bom é o que tem os próprios peões nas casas da outra cor e fica livre para atacar.",
    "Com bispos da mesma cor, o lado do bispo bom tem dois caminhos. O primeiro é atacar: os peões fixos do adversário estão na cor do seu bispo, e o bispo mau precisa ficar defendendo. O segundo é trocar os bispos quando o final de peões que sobra é ganho, normalmente porque os peões adversários ficaram fracos.",
    "Quem tem o bispo mau deve evitar fixar os peões na cor do próprio bispo e procurar a troca de bispos antes que seja tarde.",
  ],
  keyPoints: [
    "Bispo mau: preso atrás dos próprios peões fixos na mesma cor.",
    "Bispo bom: peões na outra cor, bispo livre para atacar.",
    "Peões fixos na cor do seu bispo são alvos para ele.",
    "Troque os bispos quando o final de peões for ganho.",
    "Cuidado com espetos e xeques: o bispo mau costuma ficar exposto.",
  ],
  model: {
    fen: "8/8/3k4/1p1p1b2/1P1P1P2/4K3/2B5/8 w - - 0 1",
    orientation: "white",
    caption:
      "Trocar os bispos aqui leva a um final de peões ganho para as brancas.",
    moves: [
      {
        san: "Bxf5",
        note: "A troca: o bispo preto era o único defensor dos peões das casas claras.",
      },
      { san: "Kc6" },
      {
        san: "Bb1",
        note: "O bispo branco segue ativo; os peões pretos em b5 e d5 viram alvos.",
      },
      { san: "Kb7" },
      { san: "Bd3" },
      { san: "Kb6" },
    ],
  },
  practice: [
    {
      level: "facil",
      fen: "8/8/3k4/1p1p1b2/1P1P1P2/4K3/2B5/8 b - - 0 1",
      goal: "vencer",
      solution: ["Bxc2"],
      hint: "O bispo branco está ao alcance do seu e sem defesa.",
      why: "...Bxc2 ganha o bispo branco. Com as pretas na vez, quem captura primeiro é quem vence.",
    },
    {
      level: "medio",
      fen: "8/8/3k4/1p1p1b2/1P1P1P2/4K3/2B5/8 w - - 0 1",
      goal: "vencer",
      solution: ["Bxf5"],
      hint: "Troque os bispos: o final de peões é bom para você.",
      why: "Bxf5 troca o único defensor dos peões pretos das casas claras. O bispo e o rei brancos ganham os peões fracos.",
    },
    {
      level: "medio",
      fen: "8/8/4k3/2b1p1p1/2P1P1P1/3K4/5B2/8 w - - 0 1",
      goal: "vencer",
      solution: ["Bxc5"],
      hint: "A mesma ideia, espelhada: troque o bispo que defende os peões fixos.",
      why: "Bxc5 elimina o defensor dos peões pretos das casas escuras, que viram alvos.",
    },
    {
      level: "dificil",
      fen: "2b5/8/p3k3/1p1p4/1P1P4/4K3/4B3/8 w - - 0 1",
      goal: "vencer",
      solution: ["Bg4+", "Kf6", "Bxc8"],
      hint: "O bispo preto está preso em c8, na mesma diagonal do rei. Procure um xeque.",
      why: "Bg4+ é um espeto: o rei sai do xeque e o bispo de c8 cai.",
    },
    {
      level: "dificil",
      fen: "5b2/8/3k3p/4p1p1/4P1P1/3K4/3B4/8 w - - 0 1",
      goal: "vencer",
      solution: ["Bb4+", "Ke6", "Bxf8"],
      hint: "Rei e bispo pretos estão na mesma diagonal.",
      why: "Bb4+ é um espeto pela diagonal b4-f8: depois do lance do rei, Bxf8.",
    },
  ],
  quiz: [
    {
      question: "O que é um bispo mau?",
      options: [
        "Um bispo preso atrás dos próprios peões fixos na cor dele",
        "Um bispo que já foi trocado",
        "Um bispo de casas escuras",
      ],
      answer: 0,
      explanation:
        "Com os próprios peões bloqueando as diagonais, ele só consegue defender.",
    },
    {
      question: "Quando trocar o bispo bom pelo bispo mau adversário?",
      options: [
        "Quando o final de peões que sobra é ganho",
        "Nunca",
        "Sempre que possível",
      ],
      answer: 0,
      explanation:
        "O bispo mau às vezes é o único defensor dos peões fracos; sem ele, os peões caem.",
    },
    {
      question: "Como evitar ficar com o bispo mau?",
      options: [
        "Não fixar os peões na cor do próprio bispo",
        "Avançar todos os peões",
        "Deixar o bispo em casa",
      ],
      answer: 0,
      explanation: "Com os peões na outra cor, o bispo fica livre e ativo.",
    },
  ],
};
