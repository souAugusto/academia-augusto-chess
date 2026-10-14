import type { EndgameLesson } from "../types.ts";

export const torreEPecaMenor: EndgameLesson = {
  kind: "final",
  slug: "torre-e-peca-menor",
  title: "Torre e peça menor",
  group: "combinados",
  difficulty: 3,
  summary:
    "Torre com bispo ou cavalo contra torre: o lado mais forte vence quando as peças trabalham juntas, com espetos, garfos e redes de mate na borda.",
  theory: [
    "Torre e peça menor contra torre, sem peões, costuma ser empate com defesa correta. Mas a defesa é difícil, e na prática a vitória aparece quando a torre e a peça menor se ajudam e o rei defensor está na borda.",
    "As armas principais são três. O espeto: a torre dá xeque e, quando o rei sai, captura a torre que estava atrás dele na mesma linha. O garfo: o cavalo dá xeque e ataca a torre ao mesmo tempo. A rede de mate: o rei atacante e a peça menor tiram as casas de fuga e a torre dá o golpe final.",
    "Antes de cada lance, olhe se a torre adversária está na mesma linha, coluna ou diagonal que o rei dela, e se as suas peças protegem as casas onde vão dar xeque. A mesma atenção vale na defesa: o lado com uma torre só também pode encontrar um mate quando o rei adversário está preso no canto.",
  ],
  keyPoints: [
    "Sem peões, torre e peça menor contra torre costuma empatar, mas a defesa é difícil.",
    "Espeto: xeque com a torre e captura da peça que está atrás do rei.",
    "Garfo de cavalo: xeque e ataque à torre no mesmo lance.",
    "Rei na borda: procure a rede de mate com o rei e a peça menor.",
  ],
  model: {
    fen: "3k2r1/8/B7/8/4K3/2R5/8/8 w - - 0 1",
    orientation: "white",
    caption: "O rei preto e a torre preta estão na mesma fileira.",
    moves: [
      {
        san: "Rc8+",
        note: "O bispo de a6 protege c8. O rei precisa sair da oitava fileira.",
      },
      { san: "Kd7" },
      { san: "Rxg8", note: "Espeto: a torre preta cai." },
    ],
  },
  practice: [
    {
      level: "facil",
      fen: "6r1/8/8/1N4k1/2K5/8/8/2R5 w - - 0 1",
      goal: "vencer",
      solution: ["Rg1+"],
      hint: "O rei preto e a torre preta estão na mesma coluna.",
      why: "Tg1+! Espeto: o rei sai da coluna g e a torre branca captura a torre de g8.",
    },
    {
      level: "facil",
      fen: "8/4K3/8/8/r3k3/8/6N1/7R w - - 0 1",
      goal: "vencer",
      solution: ["Rh4+"],
      hint: "Um xeque pela quarta fileira. O cavalo protege a casa.",
      why: "Th4+! O cavalo de g2 protege h4. Quando o rei sai, Txa4 ganha a torre.",
    },
    {
      level: "medio",
      fen: "3k2r1/8/B7/8/4K3/2R5/8/8 w - - 0 1",
      goal: "vencer",
      solution: ["Rc8+"],
      hint: "A oitava fileira tem o rei e a torre pretos. Qual casa o bispo protege?",
      why: "Tc8+! O bispo de a6 protege c8. O rei sai e Txg8 ganha a torre.",
    },
    {
      level: "medio",
      fen: "5K2/5R2/8/1N6/2r1k3/8/8/8 w - - 0 1",
      goal: "vencer",
      solution: ["Nd6+"],
      hint: "Procure um xeque de cavalo que também ataque a torre.",
      why: "Cd6+! Garfo: o cavalo dá xeque e ataca a torre de c4.",
    },
    {
      level: "dificil",
      fen: "K7/2k5/5R2/2r5/8/7B/8/8 b - - 0 1",
      goal: "vencer",
      solution: ["Ra5+"],
      hint: "O rei branco está preso no canto. O seu rei já cobre b8 e b7.",
      why: "...Ta5+! Depois de Ta6, ...Txa6 é mate. Mesmo com menos material, as pretas vencem.",
    },
    {
      level: "dificil",
      fen: "8/8/6r1/8/2K2R2/4B3/8/4k3 w - - 0 1",
      goal: "vencer",
      solution: ["Kd3"],
      hint: "O rei preto está na primeira fileira. Tire as casas de fuga dele.",
      why: "Rd3! O rei branco controla d2 e e2. Com a torre e o bispo, a rede de mate se fecha.",
    },
  ],
  quiz: [
    {
      question:
        "Sem peões, qual é o resultado teórico de torre e bispo contra torre?",
      options: [
        "Empate na maioria das posições, com defesa correta",
        "Vitória sempre",
        "Derrota de quem tem o bispo",
      ],
      answer: 0,
      explanation:
        "A defesa é possível, mas exige precisão. Por isso o lado mais forte costuma ter chances práticas.",
    },
    {
      question: "O que é um espeto?",
      options: [
        "Um xeque que obriga o rei a sair e deixa a peça de trás ser capturada",
        "Um ataque duplo de cavalo",
        "Uma troca de torres",
      ],
      answer: 0,
      explanation:
        "O rei precisa sair da linha e a peça que estava atrás dele fica desprotegida.",
    },
    {
      question: "Onde o rei defensor corre mais perigo?",
      options: ["Na borda ou no canto", "No centro", "Perto do próprio peão"],
      answer: 0,
      explanation:
        "Na borda, o rei tem poucas casas de fuga e as redes de mate aparecem.",
    },
  ],
};
