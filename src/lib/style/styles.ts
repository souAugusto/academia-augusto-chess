// Estilos de jogo. O estilo do aluno sai só do questionário, nunca das partidas.

export type StyleId = "atacante" | "posicional" | "tatico" | "defensor";
export type ResultStyle = StyleId | "universal";

export const STYLE_IDS: StyleId[] = [
  "atacante",
  "posicional",
  "tatico",
  "defensor",
];

export type StyleInfo = {
  name: string;
  description: string;
  strengths: string[];
  toDevelop: string[];
  // Classes do tema (tokens definidos em globals.css), para selo e barras.
  badge: string;
  bar: string;
};

export const STYLES: Record<ResultStyle, StyleInfo> = {
  atacante: {
    name: "Atacante",
    description:
      "Você gosta de partir para cima do rei adversário e de manter a iniciativa. Aceita riscos e material a menos em troca de ataque. Suas melhores partidas são as que terminam rápido.",
    strengths: [
      "Iniciativa e ritmo",
      "Coragem para sacrificar",
      "Pressão constante sobre o rei",
    ],
    toDevelop: [
      "Avaliar quando o ataque não é correto",
      "Defender posições piores com paciência",
      "Finais técnicos",
    ],
    badge: "border-danger text-danger",
    bar: "bg-danger",
  },
  posicional: {
    name: "Posicional",
    description:
      "Você constrói a vitória aos poucos, melhorando peças, estrutura de peões e casas fortes. Prefere vantagens duradouras a complicações. Gosta de planos claros.",
    strengths: [
      "Planos de longo prazo",
      "Estrutura de peões",
      "Uso das casas fortes",
    ],
    toDevelop: [
      "Cálculo em posições agudas",
      "Aproveitar oportunidades táticas na hora",
      "Jogo com pouco tempo no relógio",
    ],
    badge: "border-accent-2 text-accent-2-text",
    bar: "bg-accent-2",
  },
  tatico: {
    name: "Tático",
    description:
      "Você enxerga combinações e gosta de posições com muitas possibilidades. Calcula bem e procura o golpe que decide a partida. Brilha quando o tabuleiro está aberto.",
    strengths: [
      "Cálculo de variantes",
      "Visão de combinações",
      "Aproveitar erros do adversário",
    ],
    toDevelop: [
      "Posições calmas, sem tática à vista",
      "Planejamento estratégico",
      "Não forçar golpes que não existem",
    ],
    badge: "border-accent text-accent-text",
    bar: "bg-accent",
  },
  defensor: {
    name: "Defensor",
    description:
      "Você é difícil de derrubar: defende com calma, neutraliza o ataque adversário e contra-ataca no momento certo. Gosta de finais e de partidas longas.",
    strengths: [
      "Defesa sob pressão",
      "Contra-ataque no momento certo",
      "Paciência em finais",
    ],
    toDevelop: [
      "Tomar a iniciativa mais cedo",
      "Converter vantagens com mais rapidez",
      "Arriscar quando a posição pede",
    ],
    badge: "border-success text-success",
    bar: "bg-success",
  },
  universal: {
    name: "Universal",
    description:
      "Você não tem um estilo dominante: se adapta ao que a posição pede, atacando, manobrando ou defendendo. Essa versatilidade é rara e valiosa.",
    strengths: [
      "Adaptação a qualquer tipo de posição",
      "Equilíbrio entre cálculo e plano",
      "Poucas fraquezas evidentes",
    ],
    toDevelop: [
      "Escolher um plano e ir até o fim",
      "Aprofundar o tipo de posição de que mais gosta",
      "Repertório de aberturas coerente",
    ],
    badge: "border-border-strong text-text",
    bar: "bg-muted",
  },
};
