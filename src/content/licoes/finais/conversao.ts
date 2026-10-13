import type { EndgameLesson } from "../types.ts";

export const conversao: EndgameLesson = {
  kind: "final",
  slug: "conversao-de-vantagem-material",
  title: "Conversão de vantagem material",
  group: "combinados",
  difficulty: 2,
  summary:
    "Com um peão a mais, troque peças e não peões. Muitas vezes o caminho mais seguro para vencer é chegar a um final de peões ganho.",
  theory: [
    "Ter material a mais não basta: é preciso transformar a vantagem em vitória. A regra clássica é trocar peças, não peões. Cada troca de peças deixa o peão a mais mais forte e tira do defensor as chances de contra-ataque.",
    "O final de peões é o destino natural dessa estratégia. Sem peças, o rei atacante avança, o peão a mais vira um peão passado e o rei defensor não consegue segurar tudo. Antes de trocar, porém, confira se o final de peões que sobra é mesmo ganho.",
    "Para o defensor, a lição é a inversa: evite as trocas. Com peças no tabuleiro, ainda há chances de atividade, de xeques e de empate.",
  ],
  keyPoints: [
    "Com vantagem: troque peças, não peões.",
    "O final de peões com um peão a mais costuma ser ganho.",
    "Antes de trocar, confira o final de peões que vai sobrar.",
    "Defensor: evite as trocas e mantenha as peças ativas.",
  ],
  model: {
    fen: "8/5p2/4k1p1/3r4/3R4/5PPP/5K2/8 w - - 0 1",
    orientation: "white",
    caption: "Três peões contra dois. As torres estão frente a frente.",
    moves: [
      {
        san: "Rxd5",
        note: "Troca de torres: o final de peões que sobra é ganho.",
      },
      { san: "Kxd5" },
      {
        san: "Ke3",
        note: "O rei branco vai para o centro e impede a entrada do rei preto.",
      },
      { san: "Ke5" },
      {
        san: "f4+",
        note: "Com o rei apoiando, os peões avançam e criam um peão passado.",
      },
    ],
  },
  practice: [
    {
      level: "facil",
      fen: "8/5p2/4k1p1/3r4/3R4/5PPP/5K2/8 w - - 0 1",
      goal: "vencer",
      solution: ["Rxd5"],
      hint: "As torres estão de frente. Com um peão a mais, você quer trocar?",
      why: "Txd5! Depois de ...Rxd5, o final de peões com 3 contra 2 é ganho. Com as torres, as pretas teriam boas chances de empate.",
    },
    {
      level: "facil",
      fen: "8/5p2/4k1p1/3n4/8/4NPPP/5K2/8 w - - 0 1",
      goal: "vencer",
      solution: ["Nxd5"],
      hint: "A mesma ideia com cavalos.",
      why: "Cxd5! O final de cavalos seria difícil de ganhar; o final de peões é ganho.",
    },
    {
      level: "medio",
      fen: "8/5p2/4k1p1/3b4/4B3/5PPP/5K2/8 w - - 0 1",
      goal: "vencer",
      solution: ["Bxd5+"],
      hint: "Os bispos são da mesma cor. Qual troca simplifica a partida?",
      why: "Bxd5+! Sem os bispos, o rei branco e o peão a mais decidem.",
    },
    {
      level: "medio",
      fen: "8/5p2/4k1p1/3q4/3Q4/5PPP/5K2/8 w - - 0 1",
      goal: "vencer",
      solution: ["Qxd5+"],
      accept: ["Qe4+"],
      hint: "Com damas, o rei branco sofre xeques. Sem damas, a vantagem fica clara.",
      why: "Dxd5+! A troca de damas leva a um final de peões ganho e acaba com os xeques das pretas.",
    },
    {
      level: "dificil",
      fen: "8/5p2/4k1p1/3r4/3R4/4KPPP/8/8 b - - 0 1",
      goal: "empatar",
      solution: ["Rb5"],
      accept: ["Ra5", "Rc5", "Rf5", "Rg5", "Rh5"],
      hint: "Agora você defende com um peão a menos. Não aceite a troca.",
      why: "...Tb5 (ou outro lance de torre pela quinta fileira) evita a troca. ...Txd4 levaria a um final de peões perdido.",
    },
  ],
  quiz: [
    {
      question: "Qual é a regra clássica para quem tem material a mais?",
      options: [
        "Trocar peças, não peões",
        "Trocar peões, não peças",
        "Evitar todas as trocas",
      ],
      answer: 0,
      explanation:
        "Cada troca de peças deixa o peão a mais mais forte e reduz o contra-ataque do defensor.",
    },
    {
      question: "O que conferir antes de trocar a última peça?",
      options: [
        "Se o final de peões que sobra é ganho",
        "Se o adversário tem bispo",
        "Quantos lances já foram jogados",
      ],
      answer: 0,
      explanation:
        "Nem todo final de peões com um peão a mais é ganho. Calcule antes.",
    },
    {
      question: "E quem está com material a menos?",
      options: [
        "Deve evitar as trocas e manter as peças ativas",
        "Deve trocar tudo o quanto antes",
        "Deve abandonar",
      ],
      answer: 0,
      explanation: "Com peças no tabuleiro, o defensor ainda tem chances.",
    },
  ],
};
