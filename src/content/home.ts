// Textos da Home da Finale (rascunho para revisão do Augusto).
// Placeholders entre colchetes bloqueiam o deploy de produção.

export const HERO = {
  label: "Academia Finale de Xadrez",
  title: "Treino de xadrez com método.",
  text: "Táticas, aberturas, finais e aulas em vídeo num só lugar, com um progresso que você enxerga a cada dia.",
  primaryCta: "Ver planos",
  secondaryCta: "Resolver o puzzle do dia",
  note: "Feito para treinar no celular, em poucos minutos por dia.",
};

export const MODULES = {
  label: "O que tem dentro",
  title: "Quatro frentes de treino, um só caminho.",
  items: [
    {
      id: "taticas",
      title: "Táticas",
      text: "Puzzles por tema e dificuldade, com rating próprio, dica, solução e revisão dos erros na hora certa.",
    },
    {
      id: "aberturas",
      title: "Aberturas",
      text: "Repertórios em árvore, com comentário em cada lance e um modo treino em que você repete a linha até fixar.",
    },
    {
      id: "finais",
      title: "Finais",
      text: "Posições clássicas organizadas por nível, para treinar a conversão e a defesa contra o computador.",
    },
    {
      id: "aulas",
      title: "Aulas em vídeo",
      text: "Cursos em módulos, com o tabuleiro acompanhando o vídeo e material em PDF e PGN para baixar.",
    },
  ],
};

export const HOW_IT_WORKS = {
  label: "Como funciona",
  title: "Do primeiro acesso ao treino diário.",
  steps: [
    {
      title: "Escolha seu plano",
      text: "Assine o Membro ou garanta uma vaga na turma do Intensivo.",
    },
    {
      title: "Treine todo dia",
      text: "Alguns minutos por dia entre táticas, aberturas, finais e aulas.",
    },
    {
      title: "Acompanhe sua evolução",
      text: "Veja seu rating, sua sequência de dias e os erros que voltam para revisão.",
    },
  ],
};

export const PLANS_SECTION = {
  label: "Planos",
  title: "Escolha o seu nível de treino.",
};

export const FAQ = {
  title: "Dúvidas frequentes",
  items: [
    {
      question: "Preciso saber jogar bem para começar?",
      answer:
        "Não. Puzzles, finais e aulas têm níveis de dificuldade, e o treino se ajusta ao seu ritmo.",
    },
    {
      question: "Funciona no celular?",
      answer:
        "Sim. O site foi feito primeiro para o celular e pode ser instalado na tela inicial, como um aplicativo.",
    },
    {
      question: "Posso cancelar quando quiser?",
      answer:
        "Sim. O cancelamento é feito na página Minha conta, e o acesso continua até o fim do período pago.",
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
  text: "Entre para a Finale e transforme o treino em hábito.",
  cta: "Ver planos",
};

// ---------------------------------------------------------------------------
// Seções da rodada de lições, análise e estilo (rascunho para revisão).
// Sem prova social inventada e sem promessa de resultado (regra do projeto).
// ---------------------------------------------------------------------------

export const PROBLEM = {
  label: "O problema",
  title: "Estudar xadrez sem direção cansa e rende pouco.",
  points: [
    {
      title: "Conteúdo demais, ordem nenhuma",
      text: "Vídeos soltos, livros pela metade e listas de aberturas que ninguém termina.",
    },
    {
      title: "Os mesmos erros voltam",
      text: "Sem olhar as próprias partidas, fica difícil saber o que treinar primeiro.",
    },
    {
      title: "Treino que não combina com você",
      text: "Quem gosta de atacar e quem prefere posições fechadas aprendem melhor por caminhos diferentes.",
    },
  ],
};

export const STYLE_SECTION = {
  label: "Teste de estilo",
  title: "Descubra como você joga.",
  text: "Dez perguntas rápidas sobre as suas escolhas no tabuleiro apontam o seu estilo: Atacante, Tático, Posicional, Defensor ou Universal. As lições mostram quais aberturas combinam com ele.",
  previewLabel: "Exemplo de resultado",
};

export const IMPORT_SECTION = {
  label: "Suas partidas",
  title: "Traga suas partidas do Chess.com e do Lichess.",
  text: "Vincule sua conta e importe suas partidas. Você vê com quais aberturas mais joga, onde ganha e onde perde, e pode abrir qualquer partida na análise.",
  mockupLabel: "Exemplo ilustrativo",
};

export const ANALYSIS_SECTION = {
  label: "Análise com motor",
  title: "Veja onde a partida virou.",
  text: "O Stockfish roda no seu próprio navegador e mostra o melhor lance de cada posição, os erros, a precisão de cada lado e os três momentos críticos. Depois, o modo Tente de novo pede que você encontre o lance certo.",
  freeNote: "A análise de partidas é gratuita.",
  paidNote: "A análise de partidas está incluída na assinatura.",
  mockupLabel: "Exemplo ilustrativo",
};

export const EQUATION = {
  label: "Treino sob medida",
  title: "Estilo + dados + análise = treino sob medida.",
  parts: [
    { title: "Seu estilo", text: "O teste diz como você gosta de jogar." },
    {
      title: "Seus dados",
      text: "As partidas importadas mostram o que acontece de verdade.",
    },
    {
      title: "A análise",
      text: "O motor aponta os erros e os momentos críticos.",
    },
  ],
  result: {
    title: "Seu treino",
    text: "Lições, exercícios e revisões escolhidos a partir disso, no seu ritmo.",
  },
};

export const LESSONS_SECTION = {
  label: "Lições",
  title: "Aberturas e finais explicados lance a lance.",
  openings: {
    title: "Lições de aberturas",
    text: "Ideias, linha principal comentada, armadilhas, exercícios em três níveis e quiz.",
  },
  endgames: {
    title: "Lições de finais",
    text: "Dos mates básicos aos finais de torre, de dama e combinados, com teoria curta e posições para praticar.",
  },
};
