// Perfil único da análise de partidas. Motor, textos da tela e dados guardados
// leem daqui: o que a tela diz é sempre o que o motor faz. Não existe seletor
// de profundidade ou de força em lugar nenhum.
//
// Valores medidos no benchmark (docs/DECISOES.md, "Análise profunda"): uma
// partida de 40 lances leva por volta de 2 minutos num notebook comum.
export const ANALYSIS_PROFILE = {
  engineName: "Stockfish 19",
  engineBuild: "lite, WebAssembly, 1 thread",
  engineFile: "/engine/stockfish-19-lite-single.js",
  // Passagem 1: todas as posições, 1 linha.
  depth: 16,
  // Passagem 2: só nas posições candidatas, com várias linhas candidatas.
  deepLines: 3,
  deepDepth: 16,
  // No máximo tantas posições na passagem 2 (as mais promissoras).
  maxDeepPositions: 12,
  hashMb: 16,
  threads: 1,
  // "Tente de novo": confere o lance do aluno (rápido; não aparece na tela).
  retryDepth: 12,
  // Aviso de aparelho lento quando a previsão passa disto.
  slowWarningMs: 5 * 60 * 1000,
  // Versão das regras de classificação (src/lib/analysis/classify.ts).
  algoVersion: 1,
} as const;

export type EngineProfile = {
  engine: string;
  depth: number;
  lines: number;
  hash: number;
};

// O que fica gravado junto da análise, para saber quando reanalisar.
export function currentEngineProfile(): EngineProfile {
  return {
    engine: `${ANALYSIS_PROFILE.engineName} ${ANALYSIS_PROFILE.engineBuild}`,
    depth: ANALYSIS_PROFILE.depth,
    lines: ANALYSIS_PROFILE.deepLines,
    hash: ANALYSIS_PROFILE.hashMb,
  };
}

export function sameEngineProfile(
  a: EngineProfile | null | undefined,
  b: EngineProfile = currentEngineProfile(),
): boolean {
  return (
    !!a &&
    a.engine === b.engine &&
    a.depth === b.depth &&
    a.lines === b.lines &&
    a.hash === b.hash
  );
}

// Texto do selo "Análise profunda" (sempre a partir da constante).
export function deepAnalysisText(): string {
  const p = ANALYSIS_PROFILE;
  return `Cada posição da partida é analisada pelo ${p.engineName} em profundidade ${p.depth}, e os lances mais decisivos recebem uma segunda análise com ${p.deepLines} linhas candidatas. É o mesmo padrão para todos os alunos: não há nada para ajustar.`;
}
