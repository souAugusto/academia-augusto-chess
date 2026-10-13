import type { EndgameLesson } from "../types.ts";

export const philidorTorre: EndgameLesson = {
  kind: "final",
  slug: "posicao-de-philidor",
  title: "Posição de Philidor",
  group: "torres",
  difficulty: 2,
  summary:
    "A defesa mais importante com torre contra torre e peão: torre na sexta fileira e, quando o peão avança, xeques por trás.",
  theory: [
    "Na posição de Philidor o rei defensor está na frente do peão, e a torre defensora impede o rei atacante de chegar à sexta fileira (a terceira do ponto de vista do defensor). Sem o rei na sexta, o atacante não consegue apoiar o avanço do peão.",
    "Quando o peão avança para a sexta fileira para expulsar a torre, ele tira o próprio abrigo do rei atacante. Nesse momento a torre defensora vai para a primeira fileira (a oitava do atacante) e começa a dar xeques por trás. O rei atacante não tem onde se esconder, e o empate é certo.",
    "Resumindo em duas regras: antes do avanço do peão, torre na sexta; depois do avanço, torre lá atrás dando xeques.",
  ],
  keyPoints: [
    "Rei defensor na frente do peão.",
    "Torre na sexta fileira enquanto o peão está na quinta.",
    "Quando o peão chega à sexta, a torre vai para trás e dá xeques.",
    "O rei atacante fica sem abrigo e não consegue fugir dos xeques.",
  ],
  model: {
    fen: "4k3/7R/8/3PK3/8/8/8/r7 b - - 0 1",
    orientation: "black",
    caption: "A defesa de Philidor com as pretas.",
    moves: [
      {
        san: "Ra6",
        note: "A torre vai para a sexta fileira: o rei branco não passa.",
      },
      {
        san: "d6",
        note: "Para expulsar a torre, o peão avança e perde o papel de abrigo.",
      },
      { san: "Ra1", note: "Agora a torre vai para trás." },
      { san: "Ke6" },
      {
        san: "Re1+",
        note: "Xeques por trás: o rei branco não tem onde se esconder.",
      },
      { san: "Kd5" },
      { san: "Rd1+" },
      { san: "Kc6" },
      { san: "Rc1+" },
      { san: "Kb7" },
      {
        san: "Rd1",
        note: "Se o rei se afasta, a torre volta a pressionar o peão. Empate.",
      },
    ],
  },
  practice: [
    {
      level: "facil",
      fen: "4k3/7R/8/3PK3/8/8/8/r7 b - - 0 1",
      goal: "empatar",
      solution: ["Ra6"],
      hint: "Impeça o rei branco de chegar à sexta fileira.",
      why: "...Ta6 coloca a torre na sexta fileira. O rei branco não consegue avançar sem o peão sair na frente.",
    },
    {
      level: "medio",
      fen: "4k3/R7/1r1P4/4K3/8/8/8/8 b - - 0 1",
      goal: "empatar",
      solution: ["Rb1"],
      accept: ["Rb2", "Rb3", "Rb4"],
      hint: "O peão chegou à sexta fileira. Hora de levar a torre para trás.",
      why: "...Tb1 prepara os xeques por trás. O rei branco perdeu o abrigo do peão.",
    },
    {
      level: "medio",
      fen: "2k5/6R1/8/2PK4/8/8/8/r7 b - - 0 1",
      goal: "empatar",
      solution: ["Ra6"],
      accept: ["Rf1", "Rh1"],
      hint: "Mesma ideia, em outra coluna: torre na sexta fileira.",
      why: "...Ta6 impede Rd6. Ficar com a torre longe, na primeira fileira, também segura neste caso.",
    },
    {
      level: "dificil",
      fen: "3k4/R7/3PK3/8/8/8/8/2r5 b - - 0 1",
      goal: "empatar",
      solution: ["Re1+", "Kd5", "Rd1+", "Kc6", "Rc1+"],
      hint: "O rei branco está sem abrigo. Comece os xeques por trás e não pare.",
      why: "...Te1+, ...Td1+ e ...Tc1+: os xeques por trás não deixam o rei branco ajudar o peão.",
    },
    {
      level: "dificil",
      fen: "5k2/R7/5PK1/8/8/8/8/4r3 b - - 0 1",
      goal: "empatar",
      solution: ["Rg1+"],
      hint: "Só um lance segura o empate: xeque por trás.",
      why: "...Tg1+ começa os xeques. Qualquer lance passivo permite Ta8+ e o avanço do peão.",
    },
  ],
  quiz: [
    {
      question: "Onde fica a torre defensora antes de o peão avançar?",
      options: [
        "Na sexta fileira, impedindo o rei atacante de avançar",
        "Na frente do peão",
        "Atrás do próprio rei",
      ],
      answer: 0,
      explanation: "Na sexta fileira a torre corta o caminho do rei atacante.",
    },
    {
      question: "O que a torre faz quando o peão chega à sexta fileira?",
      options: ["Vai para trás e dá xeques", "Captura o peão", "Fica parada"],
      answer: 0,
      explanation:
        "O peão avançado não protege mais o rei, e os xeques por trás empatam.",
    },
    {
      question: "Por que o rei atacante não escapa dos xeques?",
      options: [
        "Porque o peão avançou e ele perdeu o abrigo",
        "Porque está no canto",
        "Porque não pode se mover",
      ],
      answer: 0,
      explanation:
        "Sem uma casa protegida dos xeques, o rei atacante só pode se afastar do peão.",
    },
  ],
};
