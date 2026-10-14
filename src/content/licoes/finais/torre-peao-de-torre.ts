import type { EndgameLesson } from "../types.ts";

export const torrePeaoDeTorre: EndgameLesson = {
  kind: "final",
  slug: "torre-e-peao-de-torre",
  title: "Torre e peão de torre",
  group: "torres",
  difficulty: 2,
  summary:
    "Torre na frente do peão de torre: o defensor guarda as casas g7 e h7; o atacante procura o espeto na sétima fileira.",
  theory: [
    "Uma posição muito comum: o atacante tem um peão na coluna a (ou h) na sétima fileira e a torre na frente dele, em a8. A torre defensora fica atrás do peão, na coluna a. O peão não avança porque a casa a8 está ocupada pela própria torre.",
    "O defensor empata mantendo o rei em g7 ou h7. Nessas casas o rei fica protegido do truque principal do atacante: tirar a torre de a8 com xeque ou com um espeto. Se o rei sair dessas casas (por exemplo, para f7 ou e7), vem Th8! A torre preta pega o peão, mas Th7+ pega a torre preta pela sétima fileira.",
    "Se o rei defensor estiver em g6, Tg8+ tira o rei do caminho e o peão promove. O atacante deve sempre procurar esses truques antes de qualquer outro plano.",
  ],
  keyPoints: [
    "Defensor: rei em g7 ou h7, torre atrás do peão.",
    "Atacante: se o rei adversário sair de g7/h7, procure Th8 e o espeto Th7+.",
    "Com o rei adversário em g6, Tg8+ libera a casa a8 para o peão.",
    "Fora desses truques, a posição costuma ser empate.",
  ],
  model: {
    fen: "R7/P4k2/8/8/8/8/r7/6K1 w - - 0 1",
    orientation: "white",
    caption: "O rei preto saiu de g7. O espeto decide.",
    moves: [
      { san: "Rh8", note: "A torre sai da frente do peão e ameaça promover." },
      { san: "Rxa7", note: "As pretas pegam o peão..." },
      {
        san: "Rh7+",
        note: "...mas o espeto pela sétima fileira ganha a torre.",
      },
      { san: "Kf6" },
      { san: "Rxa7", note: "Torre contra rei: vitória." },
    ],
  },
  practice: [
    {
      level: "facil",
      fen: "R7/P7/6k1/8/8/8/r7/6K1 w - - 0 1",
      goal: "vencer",
      solution: ["Rg8+"],
      hint: "Tire o rei preto do caminho com xeque e deixe a casa a8 livre.",
      why: "Tg8+ obriga o rei a sair, e na sequência a8=D promove. Se ...Txa8, Txa8.",
    },
    {
      level: "medio",
      fen: "R7/P4k2/8/8/8/8/r7/6K1 w - - 0 1",
      goal: "vencer",
      solution: ["Rh8", "Rxa7", "Rh7+"],
      hint: "O rei preto saiu de g7. Procure o espeto.",
      why: "Th8! e, se ...Txa7, Th7+ pega a torre preta pela sétima fileira.",
    },
    {
      level: "medio",
      fen: "R7/P3k3/8/8/8/8/r7/6K1 w - - 0 1",
      goal: "vencer",
      solution: ["Rh8"],
      accept: ["Rg8"],
      hint: "Com o rei preto longe de g7 e h7, a torre pode sair da frente do peão.",
      why: "Th8 ameaça a8=D. Se a torre preta pegar o peão, Th7+ ganha a torre.",
    },
    {
      level: "dificil",
      fen: "R7/P4k2/8/8/8/8/r7/6K1 b - - 0 1",
      goal: "empatar",
      solution: ["Kg7"],
      accept: ["Ra1+"],
      hint: "Leve o rei para a casa que impede o espeto.",
      why: "...Rg7 protege h7 e g8: o truque Th8 deixa de funcionar e a posição é empate.",
    },
    {
      level: "dificil",
      fen: "R7/P7/7k/8/8/8/r7/6K1 b - - 0 1",
      goal: "empatar",
      solution: ["Kh7"],
      accept: ["Kg7", "Ra1+"],
      hint: "Em h6 o rei está perto, mas há um lugar ainda mais seguro.",
      why: "...Rh7 (ou ...Rg7) mantém o rei nas casas que seguram o empate.",
    },
  ],
  quiz: [
    {
      question:
        "Em quais casas o rei defensor deve ficar contra o peão de torre na sétima?",
      options: ["g7 ou h7", "f7 ou e7", "Qualquer casa da oitava fileira"],
      answer: 0,
      explanation:
        "Em g7 ou h7 o rei impede o espeto e o xeque que liberam a casa a8.",
    },
    {
      question: "Qual é o truque do atacante quando o rei sai de g7/h7?",
      options: [
        "Th8, e se a torre pegar o peão, Th7+ ganha a torre",
        "Trocar as torres",
        "Avançar o rei para b7",
      ],
      answer: 0,
      explanation:
        "O espeto pela sétima fileira ganha a torre que capturou o peão.",
    },
    {
      question: "Com o rei preto em g6, qual lance vence?",
      options: ["Tg8+", "Th8", "Rf2"],
      answer: 0,
      explanation: "Tg8+ tira o rei da casa g7/g8 e o peão promove.",
    },
  ],
};
