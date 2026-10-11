import type { LegalSection } from "@/components/site/LegalPage";

// RASCUNHOS (Fase 1). Precisam de revisão jurídica antes do lançamento.
// Placeholders entre colchetes bloqueiam o deploy de produção.

export const LEGAL_UPDATED = "Rascunho · versão de outubro de 2026";

export const TERMS: LegalSection[] = [
  {
    title: "1. Quem somos",
    paragraphs: [
      "A Academia Finale de Xadrez é um serviço de assinatura para treino de xadrez, mantido por [RAZÃO SOCIAL E CNPJ]. Ao criar uma conta, você concorda com estes Termos de uso e com a Política de privacidade.",
    ],
  },
  {
    title: "2. Conta",
    paragraphs: [
      "A conta é pessoal e intransferível. Você é responsável por manter sua senha em segurança e por tudo o que for feito com o seu acesso.",
      "Criar uma conta não dá acesso ao conteúdo. O acesso depende de uma assinatura ativa, exceto o puzzle do dia, que é público.",
    ],
  },
  {
    title: "3. Planos e pagamento",
    paragraphs: [
      "Os planos, preços e benefícios são os informados na página de planos no momento da contratação. A cobrança é mensal e renovada automaticamente até o cancelamento.",
      "O plano Intensivo tem número limitado de vagas por turma. Quando a turma está completa, é possível entrar na lista de espera.",
      "Se um pagamento falhar, o acesso pode ser suspenso após um período de tolerância, até a regularização.",
    ],
  },
  {
    title: "4. Cancelamento",
    paragraphs: [
      "Você pode cancelar a qualquer momento pela página Minha conta. O acesso continua até o fim do período já pago e não há cobrança nos meses seguintes.",
      "[DEFINIR REGRA DE REEMBOLSO E DIREITO DE ARREPENDIMENTO]",
    ],
  },
  {
    title: "5. Uso do conteúdo",
    paragraphs: [
      "Aulas, materiais em PDF e PGN, vídeos e demais conteúdos são para uso pessoal do assinante. Não é permitido copiar, revender, compartilhar o acesso ou redistribuir o conteúdo.",
      "Nos grupos, lives e ranking, trate os outros membros com respeito. Contas que violarem estas regras podem ser suspensas.",
    ],
  },
  {
    title: "6. Resultados",
    paragraphs: [
      "O treino oferece método, prática e acompanhamento, mas a evolução de cada aluno depende de muitos fatores. Não garantimos ganho de rating, títulos ou resultados em torneios.",
    ],
  },
  {
    title: "7. Créditos",
    paragraphs: [
      "Peças do tabuleiro: conjunto de Colin M.L. Burnett, usado sob a licença BSD.",
    ],
  },
  {
    title: "8. Alterações e contato",
    paragraphs: [
      "Estes termos podem ser atualizados. Mudanças relevantes serão avisadas por e-mail ou na sua área de membro.",
      "Dúvidas: [E-MAIL DE SUPORTE]. Fica eleito o foro de [CIDADE E ESTADO DO FORO] para resolver eventuais conflitos, ressalvados os direitos do consumidor.",
    ],
  },
];

export const PRIVACY: LegalSection[] = [
  {
    title: "1. Controlador dos dados",
    paragraphs: [
      "[RAZÃO SOCIAL E CNPJ] é o controlador dos dados pessoais tratados na Academia Finale de Xadrez, nos termos da Lei Geral de Proteção de Dados (Lei 13.709/2018).",
    ],
  },
  {
    title: "2. Dados que coletamos",
    paragraphs: [
      "Cadastro: nome, e-mail, senha (guardada de forma criptografada) e, se você quiser informar, o número de WhatsApp.",
      "Uso da plataforma: puzzles resolvidos, tempos, erros, aulas concluídas e participação no ranking.",
      "Pagamento: processado pelo Asaas. O CPF e os dados do cartão são informados ao Asaas, que os exige para emitir a cobrança; a Finale não guarda o seu CPF nem o número do seu cartão e recebe apenas o status da assinatura.",
      "Dados técnicos: registros de acesso, como endereço IP e data e hora, guardados conforme o Marco Civil da Internet.",
    ],
  },
  {
    title: "3. Para que usamos",
    paragraphs: [
      "Para criar e manter sua conta, liberar o conteúdo do seu plano, registrar seu progresso, montar o ranking e cobrar a assinatura.",
      "O WhatsApp, quando informado, é usado para avisos da sua turma e do grupo de membros. Você pode removê-lo quando quiser.",
      "Não vendemos seus dados.",
    ],
  },
  {
    title: "4. Com quem compartilhamos",
    paragraphs: [
      "Com prestadores que fazem o serviço funcionar: Supabase (banco de dados e login), Vercel (hospedagem), Asaas (pagamentos), YouTube (vídeos das aulas) e Google, se você escolher entrar com o Google. Alguns desses serviços guardam dados fora do Brasil, com as garantias previstas na LGPD.",
      "No ranking, outros membros podem ver o seu nome e a sua posição.",
    ],
  },
  {
    title: "5. Por quanto tempo guardamos",
    paragraphs: [
      "Enquanto sua conta existir. Ao excluir a conta, apagamos seus dados, exceto os que a lei exige guardar, como registros de acesso e dados fiscais, pelos prazos legais.",
    ],
  },
  {
    title: "6. Seus direitos",
    paragraphs: [
      "Você pode pedir acesso, correção, exclusão ou portabilidade dos seus dados, e revogar consentimentos, pelo e-mail [E-MAIL DE SUPORTE]. A exclusão da conta também ficará disponível na página Minha conta.",
    ],
  },
  {
    title: "7. Cookies",
    paragraphs: [
      "Usamos apenas cookies necessários para manter você conectado. Não usamos cookies de publicidade.",
    ],
  },
];
