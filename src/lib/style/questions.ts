import type { StyleId } from "./styles";

// 10 cenários, 4 opções cada (uma por estilo). A opção mais característica do
// estilo naquele tema vale 2 pontos; as outras valem 1. Cada estilo tem 2
// opções de 2 pontos no total, para nenhum sair na frente por construção.

export type StyleOption = {
  id: string;
  text: string;
  style: StyleId;
  points: 1 | 2;
};

export type StyleQuestion = {
  id: string;
  text: string;
  options: StyleOption[];
};

export const QUESTIONS: StyleQuestion[] = [
  {
    id: "troca-damas",
    text: "Você está com a dama ativa e o adversário oferece a troca de damas. O que você faz?",
    options: [
      {
        id: "a",
        text: "Recuso: sem a dama, meu ataque perde a força.",
        style: "atacante",
        points: 2,
      },
      {
        id: "b",
        text: "Aceito, se a troca deixar a estrutura de peões dele pior.",
        style: "posicional",
        points: 1,
      },
      {
        id: "c",
        text: "Aceito, se logo depois aparecer um golpe tático.",
        style: "tatico",
        points: 1,
      },
      {
        id: "d",
        text: "Aceito e jogo o final com calma.",
        style: "defensor",
        points: 1,
      },
    ],
  },
  {
    id: "abertura",
    text: "Na abertura, de brancas, qual linha você escolheria para uma partida importante?",
    options: [
      {
        id: "a",
        text: "Uma linha sólida, que conheço bem e dá uma posição segura.",
        style: "defensor",
        points: 1,
      },
      {
        id: "b",
        text: "Um gambito: entrego um peão por desenvolvimento e ataque.",
        style: "atacante",
        points: 2,
      },
      {
        id: "c",
        text: "Uma linha aguda, cheia de complicações táticas.",
        style: "tatico",
        points: 1,
      },
      {
        id: "d",
        text: "Uma abertura de manobra, com plano claro para o meio-jogo.",
        style: "posicional",
        points: 1,
      },
    ],
  },
  {
    id: "roque",
    text: "O adversário rocou para o lado da dama e você para o lado do rei. Como você segue?",
    options: [
      {
        id: "a",
        text: "Avanço os peões contra o rei dele o mais rápido possível.",
        style: "atacante",
        points: 1,
      },
      {
        id: "b",
        text: "Primeiro reforço a defesa do meu rei, depois penso no ataque.",
        style: "defensor",
        points: 2,
      },
      {
        id: "c",
        text: "Procuro abrir colunas e diagonais para criar golpes.",
        style: "tatico",
        points: 1,
      },
      {
        id: "d",
        text: "Melhoro minhas peças e fecho o centro antes de qualquer coisa.",
        style: "posicional",
        points: 1,
      },
    ],
  },
  {
    id: "sacrificio",
    text: "Você vê um sacrifício de cavalo que abre o rei adversário, mas não calcula até o fim. O que faz?",
    options: [
      {
        id: "a",
        text: "Sacrifico: a iniciativa compensa.",
        style: "atacante",
        points: 1,
      },
      {
        id: "b",
        text: "Calculo mais um pouco; só sacrifico se encontrar o golpe que fecha.",
        style: "tatico",
        points: 2,
      },
      {
        id: "c",
        text: "Não sacrifico: prefiro aumentar a pressão sem dar material.",
        style: "posicional",
        points: 1,
      },
      {
        id: "d",
        text: "Não sacrifico: se der errado, fico perdido.",
        style: "defensor",
        points: 1,
      },
    ],
  },
  {
    id: "tipo-posicao",
    text: "Qual tipo de posição você mais gosta de jogar?",
    options: [
      {
        id: "a",
        text: "Fechada, com cadeias de peões e manobras lentas.",
        style: "posicional",
        points: 2,
      },
      {
        id: "b",
        text: "Aberta, com peças ativas e muitas trocas de golpes.",
        style: "tatico",
        points: 1,
      },
      {
        id: "c",
        text: "Com reis em lados opostos e ataques dos dois lados.",
        style: "atacante",
        points: 1,
      },
      {
        id: "d",
        text: "Sólida, em que o adversário precisa se arriscar para ganhar.",
        style: "defensor",
        points: 1,
      },
    ],
  },
  {
    id: "pouco-tempo",
    text: "Restam 30 segundos no seu relógio, numa posição equilibrada. Como você joga?",
    options: [
      {
        id: "a",
        text: "Ataco: em zeitnot, quem ataca tem vantagem.",
        style: "atacante",
        points: 1,
      },
      {
        id: "b",
        text: "Jogo lances seguros e espero o erro dele.",
        style: "defensor",
        points: 2,
      },
      {
        id: "c",
        text: "Procuro uma tática rápida que resolva a partida.",
        style: "tatico",
        points: 1,
      },
      {
        id: "d",
        text: "Simplifico com trocas para uma posição fácil de jogar.",
        style: "posicional",
        points: 1,
      },
    ],
  },
  {
    id: "desvantagem",
    text: "Você está com um peão a menos, sem compensação clara. O que faz?",
    options: [
      {
        id: "a",
        text: "Defendo com cuidado e espero o contra-ataque.",
        style: "defensor",
        points: 1,
      },
      {
        id: "b",
        text: "Complico a posição para criar chances táticas.",
        style: "tatico",
        points: 2,
      },
      {
        id: "c",
        text: "Busco atividade das peças contra o rei dele, mesmo arriscando mais.",
        style: "atacante",
        points: 1,
      },
      {
        id: "d",
        text: "Fortaleço as casas importantes e bloqueio o peão a mais.",
        style: "posicional",
        points: 1,
      },
    ],
  },
  {
    id: "final",
    text: "A partida chegou a um final de torres com um peão a mais para você. Qual é o seu sentimento?",
    options: [
      {
        id: "a",
        text: "Ótimo: é aqui que eu ganho, com calma e técnica.",
        style: "defensor",
        points: 1,
      },
      {
        id: "b",
        text: "Bom, vou melhorar o rei e a torre passo a passo.",
        style: "posicional",
        points: 2,
      },
      {
        id: "c",
        text: "Prefiro quando ainda há peças para atacar.",
        style: "atacante",
        points: 1,
      },
      {
        id: "d",
        text: "Procuro uma manobra de torre que force a vitória rápido.",
        style: "tatico",
        points: 1,
      },
    ],
  },
  {
    id: "bispo-cavalo",
    text: "Você pode trocar seu bispo pelo cavalo do adversário. O que pesa na sua decisão?",
    options: [
      {
        id: "a",
        text: "Se a troca abre linhas para meu ataque, troco.",
        style: "atacante",
        points: 1,
      },
      {
        id: "b",
        text: "Mantenho o bispo se a posição vai se abrir: o par de bispos vale ouro.",
        style: "posicional",
        points: 1,
      },
      {
        id: "c",
        text: "Troco se o cavalo dele defende uma casa importante para um golpe.",
        style: "tatico",
        points: 1,
      },
      {
        id: "d",
        text: "Troco se o cavalo dele é a peça mais perigosa contra meu rei.",
        style: "defensor",
        points: 1,
      },
    ],
  },
  {
    id: "estudo",
    text: "Que tipo de estudo você mais gosta de fazer?",
    options: [
      {
        id: "a",
        text: "Partidas de ataque dos grandes mestres atacantes.",
        style: "atacante",
        points: 1,
      },
      { id: "b", text: "Puzzles e combinações.", style: "tatico", points: 1 },
      {
        id: "c",
        text: "Partidas comentadas de planos e estruturas de peões.",
        style: "posicional",
        points: 1,
      },
      {
        id: "d",
        text: "Finais teóricos e técnicas de defesa.",
        style: "defensor",
        points: 1,
      },
    ],
  },
];
