import type { PlanId } from "@/lib/data/public";

// Textos dos cards de plano. Preço e vagas vêm do banco.
export const PLAN_COPY: Record<
  PlanId,
  {
    tagline: string;
    features: string[];
    cta: string;
    badge?: (seatLimit: number) => string;
  }
> = {
  membro: {
    tagline: "Todo o treino da Finale, no seu ritmo",
    features: [
      "Táticas com rating, dica e revisão dos erros",
      "Aberturas e finais com modo treino",
      "Aulas em vídeo com material em PDF e PGN",
      "Lives exclusivas, ranking, torneios e grupo no WhatsApp",
    ],
    cta: "Assinar como membro",
  },
  intensivo: {
    tagline: "Treino guiado, em turma pequena",
    features: [
      "Tudo do plano Membro",
      "[NOME DO MÉTODO DO INTENSIVO]: treino de táticas por ciclos",
      "Diagnóstico das suas partidas",
      "Plano de treino individual por nível",
      "Revisões ao vivo na turma de até 10 alunos",
      "1 aula por mês com um mestre nacional em atividade",
      "Grupo exclusivo da turma no WhatsApp e prioridade nas lives",
    ],
    cta: "Garantir minha vaga",
    badge: (seatLimit) => `Turma de ${seatLimit} alunos`,
  },
};

// Texto neutro até a Fase 4 confirmar as formas de pagamento.
export const PAYMENT_NOTE = "Assinatura mensal · cancele quando quiser";
