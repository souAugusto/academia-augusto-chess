import { ANALYSIS_MIN_PLAN_RANK } from "@/lib/analysis/config";
import { PLAN_NAMES } from "@/lib/data/account";

// Texto mostrado quando o plano do aluno não inclui a análise.
export function analysisUpgradeText(planRank: number): string {
  if (planRank >= 1 && ANALYSIS_MIN_PLAN_RANK > planRank)
    return `A análise de partidas está disponível a partir do plano ${PLAN_NAMES[ANALYSIS_MIN_PLAN_RANK] ?? "superior"}. Faça o upgrade para analisar suas partidas com o motor.`;
  return "A análise de partidas com o motor faz parte da assinatura. Assine para analisar suas partidas, ver os momentos críticos e treinar os erros.";
}
