// Textos da Home, conforme docs/design/home.dc.html.
// Placeholders entre colchetes são pendências do Augusto e bloqueiam o deploy de produção.

export const HERO = {
  eyebrow: "Comunidade de xadrez ao vivo",
  title: "Treine xadrez todo dia e evolua junto com a comunidade.",
  text: "Puzzles com progresso, aulas em vídeo, ranking entre os membros e acesso à comunidade que se encontra nas lives do Augusto.",
  primaryCta: "Quero ser membro",
  secondaryCta: "Resolver o puzzle do dia",
  liveLine: "Lives diárias no TikTok · @augustochess",
};

export const NEXT_LIVE = {
  eyebrow: "Próxima live",
  placeholder: "[DIA E HORÁRIO DA LIVE]",
  text: "Treino aberto no TikTok, com partidas e puzzles comentados.",
  cta: "Assistir no TikTok",
};

export const BENEFITS = {
  eyebrow: "O que você recebe",
  title: "Tudo para treinar com método, dentro e fora das lives.",
  items: [
    {
      title: "Puzzles com progresso",
      text: "Táticas por tema e dificuldade, com sequência diária e rating que acompanha a sua evolução.",
    },
    {
      title: "Aulas em vídeo",
      text: "Cursos organizados em módulos, com o tabuleiro ao lado do vídeo e material em PDF e PGN para baixar.",
    },
    {
      title: "Revisão dos seus erros",
      text: "Os puzzles que você errou voltam na hora certa, para fixar o padrão até virar automático.",
    },
    {
      title: "Lives exclusivas",
      text: "Encontros só para membros, com análise de partidas e espaço para tirar dúvidas.",
    },
    {
      title: "Ranking e torneios",
      text: "Dispute posições no ranking da academia e participe dos torneios internos entre os membros.",
    },
    {
      title: "Comunidade no WhatsApp",
      text: "Convite liberado na sua área de membro depois da assinatura, para treinar junto com a comunidade.",
    },
  ],
};

export const STEPS = {
  title: "Como entrar na academia",
  items: [
    {
      title: "1. Assista à live",
      text: "Acompanhe o treino aberto no TikTok e veja o método na prática.",
    },
    {
      title: "2. Conheça o método",
      text: "Resolva o puzzle do dia e veja como o treino funciona na prática.",
    },
    {
      title: "3. Vire membro",
      text: "Assine, libere as aulas e o grupo do WhatsApp e comece a subir no ranking.",
    },
  ],
};

export const METHOD = {
  eyebrow: "Treinamento intensivo",
  title: "Método Augusto Chess: do diagnóstico à evolução, com acompanhamento.",
  text: "Para quem quer sair do treino solto e seguir um caminho definido, com o Augusto corrigindo a rota ao longo do processo.",
  phases: [
    {
      title: "Diagnóstico",
      text: "Análise das suas partidas para encontrar os padrões de erro que mais custam pontos.",
    },
    {
      title: "Seu conjunto de táticas",
      text: "Seleção de táticas no seu nível para formar o conjunto que você vai treinar até dominar.",
    },
    {
      title: "Ciclos de repetição",
      text: "Você refaz o mesmo conjunto em ciclos, cada um mais rápido, com revisão espaçada dos erros.",
    },
    {
      title: "Revisão ao vivo",
      text: "Encontros com turma de até 10 alunos para corrigir partidas, tirar dúvidas e ajustar o plano.",
    },
  ],
  pending: "[DEFINIR DURAÇÃO E ESTRUTURA REAL DO MÉTODO ANTES DE PUBLICAR]",
};

export const PLANS_SECTION = {
  eyebrow: "Planos",
  title: "Escolha o seu nível de treino.",
};

export const FAQ = {
  title: "Dúvidas frequentes",
  items: [
    {
      question: "Preciso saber jogar bem para entrar?",
      answer:
        "Não. Os puzzles e as aulas têm níveis de dificuldade, então iniciantes e intermediários treinam no próprio ritmo.",
    },
    {
      question: "Como recebo o acesso ao grupo do WhatsApp?",
      answer:
        "Depois da confirmação do pagamento, o botão de convite aparece na sua área de membro.",
    },
    {
      question: "Posso cancelar quando quiser?",
      answer:
        "Sim. O cancelamento é feito direto na página Minha conta, sem precisar falar com ninguém.",
    },
    {
      question: "O que muda para quem entra agora como fundador?",
      answer:
        "[DEFINIR BENEFÍCIO DO FUNDADOR: preço travado, selo no ranking ou outro]",
    },
  ],
};

export const FINAL_CTA = {
  title: "Seu próximo lance começa aqui.",
  text: "Entre na academia e treine todo dia com quem leva o xadrez a sério.",
  cta: "Quero ser membro",
};
