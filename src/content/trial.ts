// Textos do teste grátis de 30 dias do plano Membro.

export const TRIAL_CTA = "Começar 30 dias grátis";
export const TRIAL_NOTE = "Sem cartão de crédito.";
// Destino do botão: cria a conta (ou entra) e volta para ativar o teste.
export const TRIAL_HREF = `/entrar?aba=criar&next=${encodeURIComponent("/teste-gratis")}`;

export const TRIAL_PLAN_BADGE = "30 dias grátis";
export const TRIAL_PLAN_CTA = "Testar 30 dias grátis";

export const TRIAL_REASONS = {
  "ja-testou":
    "Esta conta (ou este e-mail) já usou o teste grátis. Para continuar treinando, escolha um plano.",
  "ja-assinou":
    "O teste grátis é para quem ainda não foi assinante. Para voltar a treinar, escolha um plano.",
  pago: "Você já é assinante, então não precisa do teste.",
  erro: "Não consegui ativar o teste agora. Tente de novo em instantes.",
} as const;

export const TRIAL_FAQ = {
  question: "Como funciona o teste grátis?",
  answer:
    "Você tem 30 dias de acesso completo ao plano Membro, sem cartão de crédito. Vale uma vez por conta e só para o Membro. Ao fim, nada é cobrado: se quiser continuar, é só assinar.",
};

export const TRIAL_TERMS =
  "A Finale pode oferecer um teste grátis de 30 dias do plano Membro, uma vez por pessoa, para quem ainda não foi assinante. O teste começa quando é ativado, dura 30 dias corridos (horário de Brasília) e não exige cartão: ao fim, nada é cobrado automaticamente e o acesso aos recursos de Membro termina até que o usuário assine. A conta e o histórico de treino continuam guardados. A Finale pode encerrar o teste ou a conta de quem usar o teste de forma abusiva (por exemplo, criando várias contas para repeti-lo).";
