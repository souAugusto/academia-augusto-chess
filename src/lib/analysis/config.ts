// Configuração da análise de partidas.
//
// Plano mínimo para usar a análise: 0 = qualquer conta logada, 1 = Membro,
// 2 = Intensivo. Hoje fica em 1 porque o site não tem plano gratuito (regra do
// projeto); a landing só chama a análise de "gratuita" se este valor for 0.
export const ANALYSIS_MIN_PLAN_RANK: number = 1;

// A landing usa isto para decidir se chama a análise de "gratuita".
export const ANALYSIS_IS_FREE = ANALYSIS_MIN_PLAN_RANK === 0;

// Quantas análises guardadas cada aluno pode ter. Ao passar do limite, a mais
// antiga é apagada sozinha (decisão do Augusto, 2026-10-16). A profundidade e o
// resto do perfil do motor ficam em profile.ts.
export const MAX_SAVED_ANALYSES = 100;
