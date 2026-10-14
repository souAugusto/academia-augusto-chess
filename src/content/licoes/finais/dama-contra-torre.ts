import type { EndgameLesson } from "../types.ts";

export const damaContraTorre: EndgameLesson = {
  kind: "final",
  slug: "dama-contra-torre",
  title: "Dama contra torre",
  group: "damas",
  difficulty: 3,
  summary:
    "A dama vence a torre, mas é preciso técnica: xeques duplos para ganhar a torre e cuidado com espetos e xeques de desespero.",
  theory: [
    "Dama contra torre (sem peões) é vitória, mas o caminho pode ser longo. O plano geral é empurrar o rei defensor para a borda com o rei e a dama juntos, até que a torre não consiga mais ficar perto do próprio rei.",
    "Quando a torre se afasta do rei, aparecem os golpes que decidem: xeques da dama que atacam o rei e a torre ao mesmo tempo (garfos) ou que preparam um xeque seguinte com ataque à torre.",
    "O defensor também tem armas. Um espeto (xeque da torre com a dama atrás do rei) ganha a dama, e xeques de desespero com a torre podem forçar afogamento ou a troca da dama. Antes de cada lance, olhe se a torre pode dar um xeque perigoso.",
  ],
  keyPoints: [
    "Rei e dama juntos empurram o rei adversário para a borda.",
    "Procure xeques que ataquem o rei e a torre ao mesmo tempo.",
    "Às vezes são dois xeques seguidos: o primeiro posiciona, o segundo garfa.",
    "Cuidado com espetos: dama e rei na mesma linha são alvo da torre.",
    "Torre de desespero: xeques sem fim ou sacrifício para afogar.",
  ],
  model: {
    fen: "7r/8/2K1k3/8/8/8/8/1Q6 w - - 0 1",
    orientation: "white",
    caption: "Dois xeques seguidos: o segundo é um garfo no rei e na torre.",
    moves: [
      {
        san: "Qg6+",
        note: "Xeque que empurra o rei preto para longe da torre.",
      },
      { san: "Ke5" },
      {
        san: "Qg7+",
        note: "Agora a dama ataca o rei e a torre de h8 ao mesmo tempo.",
      },
      { san: "Kf5" },
      { san: "Qxh8", note: "Torre ganha: dama contra rei." },
    ],
  },
  practice: [
    {
      level: "facil",
      fen: "8/8/1Q6/8/6k1/3r4/8/7K w - - 0 1",
      goal: "vencer",
      solution: ["Qg6+", "Kf4", "Qxd3"],
      hint: "Procure um xeque que também ataque a torre de d3.",
      why: "Dg6+ é um garfo: a dama dá xeque e ataca a torre pela diagonal g6-d3. Depois do lance do rei, Dxd3.",
    },
    {
      level: "facil",
      fen: "5k2/8/1Q6/4r3/8/8/8/K7 w - - 0 1",
      goal: "vencer",
      solution: ["Qf6+", "Ke8", "Qxe5+"],
      hint: "Procure um xeque que ataque também a torre de e5.",
      why: "Df6+ é um garfo: depois de ...Re8, Dxe5+ ganha a torre.",
    },
    {
      level: "medio",
      fen: "3K4/8/8/2k5/6r1/8/Q7/8 w - - 0 1",
      goal: "vencer",
      solution: ["Qa5+", "Kd4", "Qb4+", "Ke3", "Qxg4"],
      hint: "Dois xeques seguidos: o segundo alcança a torre de g4.",
      why: "Da5+ e Db4+ levam a dama até a quarta fileira com xeque, e Dxg4 pega a torre.",
    },
    {
      level: "medio",
      fen: "7r/8/2K1k3/8/8/8/8/1Q6 w - - 0 1",
      goal: "vencer",
      solution: ["Qg6+", "Ke5", "Qg7+", "Kf5", "Qxh8"],
      hint: "Empurre o rei com xeque e depois garfe o rei e a torre.",
      why: "Dg6+ e Dg7+: o segundo xeque ataca o rei e a torre de h8.",
    },
    {
      level: "dificil",
      fen: "3k4/8/7r/8/Q7/2K5/8/8 w - - 0 1",
      goal: "vencer",
      solution: ["Qd4+", "Kc8", "Qg4+", "Kb7", "Qg7+"],
      hint: "Use xeques para levar a dama até uma casa que veja o rei e a torre.",
      why: "Dd4+, Dg4+ e Dg7+: o último xeque ataca o rei e a torre de h6 ao mesmo tempo.",
    },
    {
      level: "dificil",
      fen: "Q7/8/8/8/8/K7/5k2/4r3 b - - 0 1",
      goal: "vencer",
      solution: ["Ra1+", "Kb4", "Rxa8"],
      hint: "Agora você está com a torre. A dama e o rei brancos estão na mesma coluna.",
      why: "...Ta1+ é um espeto: o rei sai do xeque e a torre pega a dama em a8.",
    },
    {
      level: "dificil",
      fen: "6Q1/8/6K1/8/8/r7/4k3/8 b - - 0 1",
      goal: "empatar",
      solution: ["Rg3+", "Kf7", "Rxg8"],
      hint: "Com a torre, procure um xeque que exponha a dama.",
      why: "...Tg3+ força o rei branco a sair da coluna g, e a torre pega a dama de g8. Depois de Rxg8, é empate.",
    },
  ],
  quiz: [
    {
      question: "Dama contra torre, sem peões, é:",
      options: ["Vitória da dama, com técnica", "Empate", "Vitória da torre"],
      answer: 0,
      explanation:
        "A dama vence, mas o defensor tem truques que exigem atenção.",
    },
    {
      question: "Qual tática ganha a torre com mais frequência?",
      options: [
        "Xeque da dama que ataca o rei e a torre ao mesmo tempo",
        "Trocar a dama pela torre",
        "Avançar o rei sem dama",
      ],
      answer: 0,
      explanation:
        "O garfo da dama é a arma principal contra a torre afastada do rei.",
    },
    {
      question: "Qual é o maior perigo para o lado da dama?",
      options: [
        "Espetos e xeques de desespero da torre",
        "Ficar sem lances",
        "Perder o roque",
      ],
      answer: 0,
      explanation:
        "Dama e rei alinhados são alvo de espeto; xeques sem fim podem forçar empate.",
    },
  ],
};
