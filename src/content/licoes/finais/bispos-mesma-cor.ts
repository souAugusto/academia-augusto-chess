import type { EndgameLesson } from "../types.ts";

export const bisposMesmaCor: EndgameLesson = {
  kind: "final",
  slug: "bispos-da-mesma-cor",
  title: "Bispos da mesma cor",
  group: "bispos",
  difficulty: 2,
  summary:
    "Com bispos da mesma cor, eles disputam as mesmas casas: trocas, bloqueios e xeques decidem quem fica com a vantagem.",
  theory: [
    "Quando os dois bispos andam nas casas da mesma cor, eles podem se enfrentar: um bispo pode bloquear, ameaçar ou forçar a troca do outro. Isso torna esses finais bem mais decisivos que os de bispos de cores opostas.",
    "Com um peão a mais e o rei defensor longe, o atacante costuma vencer. Ferramentas típicas: oferecer a troca de bispos para ir a um final de peões ganho, usar o bispo para parar o peão adversário enquanto os seus avançam, e levar o rei até os peões do outro lado.",
    "Para o defensor, o caminho é ficar ativo: dar xeques no momento certo, ganhar peões soltos e, quando não houver mais nada, sacrificar o bispo pelo último peão se isso levar ao empate.",
  ],
  keyPoints: [
    "Bispos da mesma cor podem se enfrentar e ser trocados.",
    "A troca de bispos pode levar a um final de peões ganho.",
    "Use o bispo para parar o peão passado adversário.",
    "O rei ativo vai buscar os peões fracos.",
    "Defensor: xeques e capturas no momento certo seguram o empate.",
  ],
  model: {
    fen: "8/5k2/1P1P4/8/6b1/8/3K3p/5B2 w - - 0 1",
    orientation: "white",
    caption: "O bispo branco para o peão h e os peões b e d decidem.",
    moves: [
      { san: "Bg2", note: "O bispo vigia h1: o peão h2 não promove." },
      { san: "Bc8" },
      {
        san: "d7",
        note: "Os peões passados avançam com o apoio do rei e do bispo.",
      },
      { san: "Bb7" },
      {
        san: "d8=Q",
        note: "Dama. O bispo preto ainda pega o bispo branco, mas é tarde.",
      },
      { san: "Bxg2" },
    ],
  },
  practice: [
    {
      level: "facil",
      fen: "4k3/8/8/1b1P4/4K3/8/8/5B2 w - - 0 1",
      goal: "vencer",
      solution: ["Bxb5+"],
      hint: "Os bispos estão na mesma diagonal. Troque com xeque.",
      why: "Bxb5+ troca os bispos com xeque. O final de rei e peão que sobra é ganho.",
    },
    {
      level: "facil",
      fen: "8/3k4/8/4P3/3K4/5b2/8/3B4 w - - 0 1",
      goal: "vencer",
      solution: ["Bxf3"],
      hint: "O bispo preto está solto.",
      why: "Bxf3 ganha o bispo. Rei, bispo e peão vencem com facilidade.",
    },
    {
      level: "medio",
      fen: "8/5k2/1P1P4/8/6b1/8/3K3p/5B2 w - - 0 1",
      goal: "vencer",
      solution: ["Bg2"],
      hint: "O peão h2 quer promover em h1. Pare-o com o bispo.",
      why: "Bg2 vigia h1. Com o peão h parado, os peões b e d avançam e vencem.",
    },
    {
      level: "medio",
      fen: "8/5bk1/B7/5P2/3p2K1/8/2P5/8 w - - 0 1",
      goal: "vencer",
      solution: ["Kf4"],
      accept: ["Kg5"],
      hint: "O peão d4 está fraco. Leve o rei até ele.",
      why: "Rf4 e Re4 vão buscar o peão d4. O rei ativo decide o final.",
    },
    {
      level: "medio",
      fen: "2B5/8/8/3p4/5P2/5K2/6P1/1b5k b - - 0 1",
      goal: "empatar",
      solution: ["Be4+"],
      hint: "Um xeque que prepara a captura de um peão.",
      why: "...Be4+ tira o rei branco do caminho e depois ...Bxg2 elimina um peão. Com menos peões, as pretas empatam.",
    },
    {
      level: "dificil",
      fen: "8/1b1P4/8/8/BP1K2k1/6p1/8/8 b - - 0 1",
      goal: "empatar",
      solution: ["g2"],
      hint: "O peão d7 vai promover. Crie a sua própria ameaça.",
      why: "...g2! cria uma ameaça própria. Os dois lados acabam promovendo, e o final de damas que sobra é empate.",
    },
    {
      level: "dificil",
      fen: "8/8/b7/3k4/8/5P2/4PpB1/3K4 b - - 0 1",
      goal: "empatar",
      solution: ["Ke5"],
      hint: "O seu peão f2 prende as peças brancas. Ative o rei.",
      why: "...Re5 e ...Rf4 atacam os peões brancos enquanto o peão f2 mantém o bispo branco ocupado.",
    },
  ],
  quiz: [
    {
      question: "O que muda quando os bispos são da mesma cor?",
      options: [
        "Eles podem se enfrentar e ser trocados",
        "Eles nunca se encontram",
        "O final é sempre empate",
      ],
      answer: 0,
      explanation:
        "Andando nas mesmas casas, um bispo pode bloquear ou forçar a troca do outro.",
    },
    {
      question: "Quando trocar os bispos é bom para o atacante?",
      options: ["Quando o final de peões que sobra é ganho", "Sempre", "Nunca"],
      answer: 0,
      explanation:
        "Antes de trocar, confira se o final de peões é mesmo vencedor.",
    },
    {
      question: "Qual é a arma típica do defensor?",
      options: [
        "Ficar ativo: xeques, capturas e sacrifício pelo último peão",
        "Esperar com o bispo parado",
        "Trocar todos os peões",
      ],
      answer: 0,
      explanation:
        "Um defensor passivo costuma perder; o ativo encontra o empate.",
    },
  ],
};
