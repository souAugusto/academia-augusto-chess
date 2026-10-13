// Configuração da análise de partidas.
//
// Plano mínimo para usar a análise: 0 = qualquer conta logada, 1 = Membro,
// 2 = Intensivo. Hoje fica em 1 porque o site não tem plano gratuito (regra do
// projeto); a landing só chama a análise de "gratuita" se este valor for 0.
export const ANALYSIS_MIN_PLAN_RANK: number = 1;

// A landing usa isto para decidir se chama a análise de "gratuita".
export const ANALYSIS_IS_FREE = ANALYSIS_MIN_PLAN_RANK === 0;

// Profundidades oferecidas na tela (meias-jogadas que o motor calcula).
export const ANALYSIS_DEPTHS = [12, 14, 16, 20] as const;
export const DEFAULT_ANALYSIS_DEPTH = 14;

// Quantas análises salvas cada aluno pode ter. Ao atingir o limite, o site pede
// para o aluno apagar alguma antes de salvar outra (nada é apagado sozinho).
export const MAX_SAVED_ANALYSES = 100;
