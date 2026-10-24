// Tipos dos adversários do "Jogar contra o computador".

export type BotStyle = "agressivo" | "defensivo" | "posicional" | "tatico";

// Desenhos de cada personagem: public/personagens/<id>/<expressao>.svg
export const EXPRESSIONS = ["normal", "feliz", "preocupado", "surpreso"] as const;
export type Expression = (typeof EXPRESSIONS)[number];

// Falas do personagem. Os lances citados são os do aluno:
// bomLance (o aluno jogou bem), erro (o aluno errou feio), captura (o aluno
// tomou uma peça), xeque (o aluno deu xeque). vitoria/derrota/empate são o
// resultado do aluno.
export const REACTIONS = [
  "intro",
  "bomLance",
  "erro",
  "captura",
  "xeque",
  "vitoria",
  "derrota",
  "empate",
] as const;
export type Reaction = (typeof REACTIONS)[number];

// Expressão do personagem em cada reação.
export const REACTION_EXPRESSION: Record<Reaction, Expression> = {
  intro: "normal",
  bomLance: "preocupado",
  erro: "feliz",
  captura: "surpreso",
  xeque: "surpreso",
  vitoria: "preocupado",
  derrota: "feliz",
  empate: "normal",
};

// Como o motor joga:
// - "multipv": o motor lista os melhores lances e a Finale escolhe um, às vezes
//   o 2º ou o 3º (erros humanos), às vezes um lance qualquer (só nos níveis
//   iniciais). O estilo dá preferência a certos lances entre os bons.
// - "elo": o próprio Stockfish limita a força (UCI_LimitStrength + UCI_Elo).
// - "maximo": força total, com tempo limitado por lance.
export type EngineParams =
  | {
      mode: "multipv";
      depth: number; // profundidade da busca
      multipv: number; // quantos lances candidatos (até 5)
      randomChance: number; // chance de um lance legal qualquer (0 a 1)
      mistakeChance: number; // chance de não jogar o melhor candidato
      mistakeWeights: number[]; // pesos do 2º, 3º... candidato (decrescentes)
      maxLossCp: number; // erro máximo aceito num lance "humano" (centipeões)
      styleWindowCp: number; // diferença em que o estilo pode decidir
    }
  | { mode: "elo"; elo: number; movetimeMs: number }
  | { mode: "maximo"; movetimeMs: number };

export type Bot = {
  id: string; // também é a pasta do avatar
  nivel: number; // 1 a 10, ordem da trilha
  nome: string;
  titulo: string;
  descricao: string;
  cor: string; // cor do personagem (realce, balão)
  eloAprox: number; // força aproximada, só para orientar o aluno
  estilo: BotStyle;
  chefe?: boolean;
  frases: Record<Reaction, string[]>;
  motor: EngineParams;
  // Aberturas preferidas, em SAN a partir da posição inicial. Se a partida
  // segue o começo de uma linha, o personagem joga o próximo lance dela.
  aberturas?: string[][];
  ajudas: { desfazer: number; dicas: number }; // por partida
};
