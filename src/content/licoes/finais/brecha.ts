import type { EndgameLesson } from "../types.ts";

export const brecha: EndgameLesson = {
  kind: "final",
  slug: "brecha-peao-de-rompimento",
  title: "Brecha (peão de rompimento)",
  group: "peoes",
  difficulty: 2,
  summary:
    "Com peões frente a frente, um sacrifício abre caminho e um dos peões passa para virar dama.",
  theory: [
    "Quando os peões dos dois lados estão bloqueados frente a frente e os reis estão longe, às vezes um sacrifício de peão cria um peão passado que ninguém consegue parar. É a brecha, ou rompimento.",
    "O exemplo clássico tem três peões contra três: brancos em a5, b5 e c5 contra pretos em a7, b7 e c7. Com 1.b6! as brancas sacrificam o peão central. Se as pretas pegam com o peão a, vem c6!; se pegam com o peão c, vem a6!. Em todos os casos um peão branco passa.",
    "A brecha só funciona se o rei adversário estiver longe. Antes de sacrificar, conte quantos lances o peão precisa para promover e se o rei chega antes.",
  ],
  keyPoints: [
    "Peões bloqueados e reis longe: procure a brecha.",
    "Sacrifique o peão do meio para abrir caminho para os vizinhos.",
    "Conte os lances: o rei adversário não pode chegar a tempo.",
    "O defensor pode evitar a brecha avançando o próprio peão na hora certa.",
  ],
  model: {
    fen: "7k/ppp5/8/PPP5/8/8/8/7K w - - 0 1",
    orientation: "white",
    caption: "A brecha clássica: três peões contra três.",
    moves: [
      {
        san: "b6",
        note: "O sacrifício: o peão do meio avança para ser capturado.",
      },
      { san: "axb6" },
      { san: "c6", note: "Mais um sacrifício: agora o peão b7 precisa pegar." },
      { san: "bxc6" },
      { san: "a6", note: "O peão a passou e ninguém o alcança." },
      { san: "Kg7" },
      { san: "a7" },
      { san: "Kf7" },
      { san: "a8=Q", note: "Dama. O rei preto estava longe demais." },
    ],
  },
  practice: [
    {
      level: "facil",
      fen: "7k/ppp5/8/PPP5/8/8/8/7K w - - 0 1",
      goal: "vencer",
      solution: ["b6", "cxb6", "a6"],
      hint: "Sacrifique o peão do meio.",
      why: "Depois de b6 e da captura com o peão c, a6! deixa um peão passado. Se as pretas pegassem com o peão a, c6! funcionaria.",
    },
    {
      level: "facil",
      fen: "7k/ppp5/8/PPP5/8/8/8/7K b - - 0 1",
      goal: "empatar",
      solution: ["b6"],
      hint: "As pretas estão na vez. Impeça a brecha.",
      why: "...b6! troca os peões antes que as brancas joguem b6. Sem a brecha, os reis decidem e o jogo empata.",
    },
    {
      level: "medio",
      fen: "k7/5ppp/8/5PPP/8/8/8/K7 w - - 0 1",
      goal: "vencer",
      solution: ["g6", "hxg6", "f6"],
      hint: "A mesma ideia, do outro lado do tabuleiro.",
      why: "g6! e, depois de ...hxg6, f6! cria um peão passado. O rei preto em a8 está longe demais.",
    },
    {
      level: "dificil",
      fen: "7k/1ppp4/8/1PPP4/8/8/8/7K w - - 0 1",
      goal: "vencer",
      solution: ["c6", "bxc6", "d6"],
      hint: "Qual peão sacrificar para abrir caminho aos vizinhos?",
      why: "c6! e depois d6! (ou b6!, se as pretas pegarem com o peão d) cria o peão passado.",
    },
    {
      level: "dificil",
      fen: "k7/5ppp/8/5PPP/8/8/8/K7 b - - 0 1",
      goal: "empatar",
      solution: ["g6"],
      hint: "As pretas estão na vez. Desmonte a brecha antes que ela aconteça.",
      why: "...g6! troca o peão do meio. Depois as brancas não têm mais o sacrifício g6, e o jogo empata.",
    },
  ],
  quiz: [
    {
      question: "Quando procurar uma brecha?",
      options: [
        "Com peões bloqueados frente a frente e o rei adversário longe",
        "Sempre que tiver mais peões",
        "Quando o rei adversário está perto",
      ],
      answer: 0,
      explanation:
        "Se o rei adversário estiver perto, ele captura o peão que passou.",
    },
    {
      question:
        "No exemplo clássico com peões em a5, b5 e c5, qual é o primeiro lance?",
      options: ["b6", "a6", "c6"],
      answer: 0,
      explanation:
        "Sacrificar o peão do meio deixa os dois vizinhos prontos para passar.",
    },
    {
      question: "Como o defensor evita a brecha quando está na vez?",
      options: [
        "Avançando o próprio peão do meio primeiro",
        "Movendo o rei para longe",
        "Não há defesa",
      ],
      answer: 0,
      explanation:
        "Com ...b6 as pretas desmontam a estrutura antes do sacrifício.",
    },
  ],
};
