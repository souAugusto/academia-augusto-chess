import type { EndgameLesson } from "../types.ts";

export const oposicaoDireta: EndgameLesson = {
  kind: "final",
  slug: "oposicao-direta",
  title: "Oposição direta",
  group: "peoes",
  difficulty: 1,
  summary:
    "Reis frente a frente com uma casa entre eles: quem NÃO precisa jogar tem a oposição e decide o final de rei e peão.",
  theory: [
    "Nos finais de rei e peão contra rei, quase tudo depende da oposição. Os reis estão em oposição direta quando ficam na mesma coluna (ou fileira) com exatamente uma casa entre eles. Como reis não podem encostar, quem tiver que jogar é obrigado a ceder caminho.",
    'Dizemos que "tem a oposição" o lado que fez o último lance, ou seja, o lado que NÃO está na vez. Para o atacante, ter a oposição permite passar com o rei para a frente do peão. Para o defensor, ter a oposição segura o empate.',
    "Regra prática para o defensor: fique na frente do peão e, quando o rei atacante se aproximar, coloque-se em oposição a ele. Regra para o atacante: leve o rei para a frente do peão; com o rei na sexta fileira na frente do peão (peão que não seja de torre), a vitória é garantida.",
  ],
  keyPoints: [
    "Oposição direta: reis na mesma coluna, com uma casa entre eles.",
    "Quem não está na vez tem a oposição.",
    "Defensor: fique na frente do peão e tome a oposição.",
    "Atacante: rei na frente do peão, de preferência na sexta fileira.",
    "Um lance de peão de reserva pode mudar quem tem a oposição.",
  ],
  model: {
    fen: "3k4/8/3K4/3P4/8/8/8/8 w - - 0 1",
    orientation: "white",
    caption:
      "Rei na sexta fileira na frente do peão: vitória mesmo sem ter a oposição.",
    moves: [
      { san: "Ke6", note: "O rei sai pelo lado e mantém o controle de d7." },
      { san: "Ke8" },
      {
        san: "d6",
        note: "O peão avança com o rei protegendo as casas da frente.",
      },
      { san: "Kd8" },
      { san: "d7", note: "O rei preto precisa sair: ...Rc7 é forçado." },
      { san: "Kc7" },
      { san: "Ke7", note: "O rei branco controla d8." },
      { san: "Kc6" },
      { san: "d8=Q", note: "O peão vira dama." },
    ],
  },
  practice: [
    {
      level: "facil",
      fen: "4k3/8/4K3/4P3/8/8/8/8 w - - 0 1",
      goal: "vencer",
      solution: ["Kd6"],
      accept: ["Kf6"],
      hint: "Não empurre o peão ainda. Mova o rei para o lado, mantendo-o na sexta fileira.",
      why: "Rd6 (ou Rf6) mantém o rei na sexta fileira e prepara e6-e7. Com o rei na frente do peão na sexta, a vitória é certa.",
    },
    {
      level: "facil",
      fen: "4k3/8/8/4K3/4P3/8/8/8 b - - 0 1",
      goal: "empatar",
      solution: ["Ke7"],
      hint: "Fique na frente do peão e encare o rei branco.",
      why: "...Re7 toma a oposição (os reis ficam frente a frente com e6 entre eles). O rei branco não consegue avançar.",
    },
    {
      level: "medio",
      fen: "8/8/8/3k4/8/3KP3/8/8 b - - 0 1",
      goal: "empatar",
      solution: ["Ke5"],
      hint: "O rei branco está ao lado do peão. Fique na frente do peão, em oposição ao rei.",
      why: "...Re5 coloca o rei na frente do peão. Quando o rei branco avançar, o preto toma a oposição de novo.",
    },
    {
      level: "medio",
      fen: "3k4/8/8/3K4/3P4/8/8/8 b - - 0 1",
      goal: "empatar",
      solution: ["Kd7"],
      hint: "Tome a oposição na coluna do peão.",
      why: "...Rd7 deixa os reis frente a frente com d6 entre eles. As brancas precisam jogar e não conseguem passar.",
    },
    {
      level: "medio",
      fen: "8/8/3k4/8/2K5/3P4/8/8 b - - 0 1",
      goal: "empatar",
      solution: ["Kc6"],
      hint: "O rei branco está em c4. Coloque o seu rei em frente a ele.",
      why: "...Rc6 toma a oposição na coluna c. O rei branco não consegue se aproximar da frente do peão.",
    },
    {
      level: "dificil",
      fen: "8/8/3k4/8/3K4/8/3P4/8 w - - 0 1",
      goal: "vencer",
      solution: ["d3"],
      accept: ["Ke4", "Kc4"],
      hint: "Os reis estão em oposição e é você quem joga. Use um lance de peão para passar a vez.",
      why: "d3 é um lance de reserva: agora são as pretas que precisam ceder, e o rei branco avança. Rc4 e Re4 também ganham, rodeando o rei preto.",
    },
    {
      level: "dificil",
      fen: "3k4/8/3K4/3P4/8/8/8/8 w - - 0 1",
      goal: "vencer",
      solution: ["Ke6"],
      accept: ["Kc6"],
      hint: "Com o rei na sexta fileira, não importa quem tem a oposição. Saia pelo lado.",
      why: "Re6 (ou Rc6) controla as casas na frente do peão. Depois d6-d7 e o peão corona.",
    },
  ],
  quiz: [
    {
      question: "Quando os reis estão em oposição direta?",
      options: [
        "Na mesma coluna ou fileira, com uma casa entre eles",
        "Em diagonal, encostados",
        "Em cantos opostos do tabuleiro",
      ],
      answer: 0,
      explanation:
        "Com uma casa entre eles, nenhum rei pode entrar nessa casa.",
    },
    {
      question: "Quem tem a oposição?",
      options: [
        "O lado que não está na vez",
        "O lado que está na vez",
        "Quem tem o peão",
      ],
      answer: 0,
      explanation: "Quem precisa jogar é obrigado a ceder caminho.",
    },
    {
      question: "Como o defensor empata contra rei e peão?",
      options: [
        "Ficando na frente do peão e tomando a oposição",
        "Atacando o peão pelo lado",
        "Fugindo para o canto",
      ],
      answer: 0,
      explanation:
        "Na frente do peão e em oposição, o rei atacante nunca consegue passar.",
    },
    {
      question: "Por que um lance de peão de reserva é importante?",
      options: [
        "Ele passa a vez e muda quem tem a oposição",
        "Ele dá xeque",
        "Ele protege o rei",
      ],
      answer: 0,
      explanation:
        "Com um lance sobrando, o atacante obriga o defensor a ceder caminho.",
    },
  ],
};
