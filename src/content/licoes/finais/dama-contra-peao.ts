import type { EndgameLesson } from "../types.ts";

export const damaContraPeao: EndgameLesson = {
  kind: "final",
  slug: "dama-contra-peao-na-setima",
  title: "Dama contra peão na 7ª fileira",
  group: "damas",
  difficulty: 2,
  summary:
    "Dama vence peão de centro ou de cavalo com xeques; contra peão de bispo ou de torre, o afogamento costuma salvar o defensor.",
  theory: [
    "Com dama contra um peão na sétima fileira (a um passo de promover), apoiado pelo rei, o resultado depende da coluna do peão e de onde está o rei atacante.",
    "Contra peão central ou de cavalo, a dama vence com um método simples: xeques e ameaças que obrigam o rei defensor a ficar na frente do próprio peão. Cada vez que isso acontece, o peão não pode promover, e o rei atacante ganha um tempo para se aproximar. Repetindo, o rei chega e a vitória vem.",
    "Contra peão de bispo ou de torre (colunas a, c, f e h), o defensor tem um truque: em vez de bloquear o peão, o rei vai para o canto, e pegar o peão deixa o rei afogado. Sem o rei atacante perto, a posição é empate.",
  ],
  keyPoints: [
    "Peão central ou de cavalo: a dama vence com xeques e aproximação do rei.",
    "O objetivo dos xeques é obrigar o rei defensor a ficar na frente do peão.",
    "Peão de bispo ou de torre: o defensor salva com o truque do afogamento.",
    "Defensor: com peão de bispo ou de torre, leve o rei para o canto em vez de proteger o peão.",
  ],
  model: {
    fen: "8/8/8/8/8/8/2kp4/6QK w - - 0 1",
    orientation: "white",
    caption:
      "Peão d: a dama encosta no rei preto com xeques até ele bloquear o próprio peão.",
    moves: [
      { san: "Qc5+", note: "Xeque para afastar o rei da casa de promoção." },
      { san: "Kd3" },
      { san: "Qf5+" },
      { san: "Kc3" },
      { san: "Qd5", note: "A dama controla d1: o peão não pode promover." },
      { san: "Kc2" },
      { san: "Qe4+" },
      { san: "Kb2" },
      { san: "Qd4+" },
      { san: "Kc2" },
      { san: "Qc4+" },
      { san: "Kb2" },
      {
        san: "Qd3",
        note: "A dama prende o peão; se ele promover, é capturado.",
      },
      { san: "d1=Q+" },
      { san: "Qxd1", note: "Dama contra rei: vitória." },
    ],
  },
  practice: [
    {
      level: "facil",
      fen: "8/8/8/8/8/8/2kp4/6QK w - - 0 1",
      goal: "vencer",
      solution: ["Qc5+"],
      hint: "Só um lance segura a vitória: xeque que afasta o rei da casa de promoção.",
      why: "Dc5+ começa a série de xeques. Qualquer outro lance deixa o peão promover com segurança.",
    },
    {
      level: "medio",
      fen: "Q7/8/8/8/8/8/3pk3/7K w - - 0 1",
      goal: "vencer",
      solution: ["Qe4+"],
      accept: ["Qa2", "Qg2+", "Qa6+", "Qe8+"],
      hint: "Use a dama para controlar d1 ou para empurrar o rei para a frente do peão.",
      why: "De4+ obriga o rei a se mexer; a dama controla d1 e o rei branco ganha tempo para se aproximar.",
    },
    {
      level: "medio",
      fen: "8/8/8/8/8/2Q5/4pk2/K7 w - - 0 1",
      goal: "vencer",
      solution: ["Qd2"],
      accept: ["Qc5+", "Qd4+", "Qf6+", "Qb2", "Qc2"],
      hint: "Crave o peão e: a dama pode controlar e1.",
      why: "Dd2 crava o peão e prende o rei preto. O rei branco vem em seguida.",
    },
    {
      level: "dificil",
      fen: "8/8/8/8/8/8/p1k5/4Q2K b - - 0 1",
      goal: "empatar",
      solution: ["Kb2"],
      hint: "Peão de torre: o seu rei deve ir em direção ao canto.",
      why: "...Rb2 protege a casa de promoção. Se as brancas tirarem o peão, o rei preto pode ficar afogado no canto.",
    },
    {
      level: "dificil",
      fen: "8/8/8/8/8/1Q6/2p5/3k3K b - - 0 1",
      goal: "empatar",
      solution: ["Kd2"],
      hint: "Peão de bispo: proteja o peão pelo lado e prepare o truque do canto.",
      why: "...Rd2 protege c1. Se a dama atacar demais, o rei vai para a1 e pegar o peão afoga.",
    },
    {
      level: "dificil",
      fen: "8/8/8/8/8/Q7/p7/2k4K b - - 0 1",
      goal: "empatar",
      solution: ["Kb1"],
      hint: "Proteja a casa de promoção com o rei.",
      why: "...Rb1 protege a1. Com o rei branco longe, a dama não consegue vencer.",
    },
  ],
  quiz: [
    {
      question: "Contra qual peão na sétima a dama costuma vencer?",
      options: ["Peão central ou de cavalo", "Peão de torre", "Peão de bispo"],
      answer: 0,
      explanation:
        "Contra peões de bispo e de torre, o afogamento salva o defensor.",
    },
    {
      question: "Qual é o objetivo dos xeques da dama?",
      options: [
        "Obrigar o rei defensor a ficar na frente do próprio peão",
        "Dar mate imediatamente",
        "Trocar as damas",
      ],
      answer: 0,
      explanation:
        "Com o rei na frente do peão, o peão não promove e o rei atacante se aproxima.",
    },
    {
      question: "Qual truque salva o defensor com peão de torre ou de bispo?",
      options: [
        "Ir para o canto: capturar o peão deixa o rei afogado",
        "Trocar o peão",
        "Dar xeque com o rei",
      ],
      answer: 0,
      explanation: "Sem lances legais, o rei fica afogado e a partida empata.",
    },
  ],
};
