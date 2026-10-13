import type { EndgameLesson } from "../types.ts";

export const mesmaAla: EndgameLesson = {
  kind: "final",
  slug: "quatro-contra-tres-na-mesma-ala",
  title: "4 contra 3 e 3 contra 2 na mesma ala",
  group: "torres",
  difficulty: 3,
  summary:
    "Com todos os peões no mesmo lado, o final de torre costuma empatar, mas o final de peões que sobra depois da troca de torres costuma ser ganho.",
  theory: [
    "Quando os peões estão todos na mesma ala, o peão a mais não cria um peão passado com facilidade. Com as torres no tabuleiro, o defensor ataca peões, dá xeques e muitas vezes empata, mesmo com 4 contra 3 ou 3 contra 2.",
    "Sem as torres, a história muda. No final de peões, o rei do lado mais forte avança, o peão a mais acaba virando um peão passado e o rei defensor não consegue segurar tudo. Por isso a troca de torres é o grande objetivo do atacante.",
    "Para o defensor, a regra é a mesma ao contrário: não aceite a troca de torres. Tire a torre da coluna em que ela pode ser trocada e mantenha-a ativa. No final de peões, o atacante usa o rei: ele dá a volta pelo centro para atacar os peões por trás ou pelo lado.",
  ],
  keyPoints: [
    "Com torres e peões na mesma ala, o defensor costuma empatar.",
    "Atacante: procure a troca de torres; o final de peões costuma ser ganho.",
    "Defensor: evite a troca e mantenha a torre ativa.",
    "No final de peões, o rei atacante entra pelo centro.",
  ],
  model: {
    fen: "8/3rkp2/6p1/7p/7P/4P1P1/3R1PK1/8 w - - 0 1",
    orientation: "white",
    caption: "Quatro peões contra três, todos na ala do rei.",
    moves: [
      {
        san: "Rxd7+",
        note: "A troca de torres leva a um final de peões ganho.",
      },
      { san: "Kxd7" },
      {
        san: "Kf3",
        note: "O rei branco sobe para o centro antes de mexer nos peões.",
      },
      { san: "Kd6" },
      { san: "Kf4" },
      {
        san: "Ke6",
        note: "Depois e4 e g4, as brancas criam um peão passado.",
      },
    ],
  },
  practice: [
    {
      level: "facil",
      fen: "8/3rkp2/6p1/7p/7P/4P1P1/3R1PK1/8 w - - 0 1",
      goal: "vencer",
      solution: ["Rxd7+"],
      hint: "Qual final é melhor para as brancas: com torres ou sem torres?",
      why: "Txd7+! O final de peões com 4 contra 3 é ganho. Com as torres, as pretas teriam boas chances de empate.",
    },
    {
      level: "facil",
      fen: "8/3rk2p/6p1/8/8/6P1/3R1P1P/6K1 w - - 0 1",
      goal: "vencer",
      solution: ["Rxd7+"],
      hint: "A mesma ideia com 3 contra 2.",
      why: "Txd7+! Sem torres, o rei branco e o peão a mais decidem o final.",
    },
    {
      level: "medio",
      fen: "3r4/4kp2/6p1/7p/7P/4P1P1/4KP2/3R4 b - - 0 1",
      goal: "empatar",
      solution: ["Rc8"],
      accept: ["Rg8", "Re8", "Rf8", "Rh8", "Rb8", "Ra8"],
      hint: "As torres estão de frente na coluna d. O que acontece se elas forem trocadas?",
      why: "...Tc8 (ou outro lance de torre na oitava fileira) evita a troca. ...Txd1 levaria a um final de peões perdido.",
    },
    {
      level: "medio",
      fen: "8/4k3/3r1p2/6pp/8/4P1P1/3R1P1P/4K3 b - - 0 1",
      goal: "empatar",
      solution: ["Rb6"],
      accept: ["Re6", "Rc6", "Ra6", "g4"],
      hint: "Tire a torre da coluna d, mas mantenha-a ativa.",
      why: "...Tb6 sai da coluna d e ameaça entrar em b2 ou b1. O final de peões depois de ...Txd2 seria perdido.",
    },
    {
      level: "dificil",
      fen: "8/8/6k1/5p1p/5P1P/4K1P1/8/8 w - - 0 1",
      goal: "vencer",
      solution: ["Kd4"],
      accept: ["Kd3", "Kd2", "Ke2"],
      hint: "Os peões estão travados. O rei branco precisa de um caminho até os peões pretos.",
      why: "Rd4! O rei vai por d5 e e5 até f6 ou g5. O rei preto não consegue defender f5 e h5 ao mesmo tempo.",
    },
  ],
  quiz: [
    {
      question:
        "Com torres e 4 peões contra 3 na mesma ala, qual é o resultado mais comum?",
      options: ["Empate", "Vitória fácil do lado com mais peões", "Derrota"],
      answer: 0,
      explanation:
        "Sem peão passado, o defensor tem boas chances de segurar o final de torre.",
    },
    {
      question: "O que o lado com o peão a mais deve buscar?",
      options: [
        "A troca de torres",
        "Trocar todos os peões",
        "Manter a torre passiva",
      ],
      answer: 0,
      explanation: "O final de peões com um peão a mais costuma ser ganho.",
    },
    {
      question: "E o defensor?",
      options: [
        "Evitar a troca e manter a torre ativa",
        "Oferecer a troca de torres",
        "Avançar todos os peões",
      ],
      answer: 0,
      explanation:
        "Com as torres no tabuleiro, o defensor tem mais chances de empate.",
    },
  ],
};
