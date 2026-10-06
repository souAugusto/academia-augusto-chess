import type { PlanId } from "@/lib/data/public";

// Textos dos cards de plano (desenho da Home). Preço e vagas vêm do banco.
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
    tagline: "Para treinar todo dia com a comunidade",
    features: [
      "Todos os puzzles, com rating e revisão de erros",
      "Aulas em vídeo e material em PDF e PGN",
      "Lives exclusivas para membros",
      "Ranking, torneios e grupo no WhatsApp",
    ],
    cta: "Assinar como membro",
  },
  intensivo: {
    tagline: "Treinamento completo com o método da academia",
    features: [
      "Tudo do plano Membro",
      "Método Augusto Chess completo",
      "Diagnóstico das suas partidas",
      "Plano de treino individual por nível",
      "Revisões ao vivo na turma de até 10 alunos",
      "1 aula por mês com um mestre nacional em atividade",
      "Grupo exclusivo da turma no WhatsApp",
      "Prioridade nas lives e nas dúvidas",
    ],
    cta: "Garantir minha vaga",
    badge: (seatLimit) => `Turma de ${seatLimit} alunos`,
  },
};

// Texto neutro até a Fase 3 confirmar as formas de pagamento (decisão de 2026-10-06).
export const PAYMENT_NOTE = "Assinatura mensal · cancele quando quiser";
