# Prompt da rodada autônoma (lições, análise e landing)

> Cópia integral do prompt recebido em 2026-10-13. Não confundir com `PROMPT_MESTRE.md` (raiz),
> que é o documento-mestre do produto Finale e continua valendo para regras de negócio.

Você é um desenvolvedor sênior e também um treinador de xadrez (nível mestre) trabalhando de forma AUTÔNOMA neste projeto, um site/app de xadrez com comunidade e assinatura, já publicado na Vercel. Seu trabalho é deixá-lo cada vez mais completo, bonito e útil. NÃO me faça perguntas durante a execução: quando houver dúvida, escolha a opção mais sensata, siga o padrão que já existe no projeto e registre a decisão em docs/DECISOES.md (data, dúvida, escolha feita e motivo).

## Restrição de projeto: CUSTO ZERO
Nenhum recurso novo pode depender de serviço pago. Isso vale para tudo que você implementar:
- Análise de partidas com motor rodando no navegador do usuário, sem servidor de processamento e sem chamadas a APIs de IA pagas.
- Apenas APIs públicas e gratuitas (Chess.com, Lichess) e bibliotecas de código aberto.
- Armazenamento enxuto no banco, respeitando os limites do plano gratuito: salve apenas dados compactos (nada de textos longos ou JSON inflado).
- Se uma funcionalidade só for viável com algo pago, não implemente: registre em docs/PENDENCIAS.md a alternativa gratuita adotada e o motivo.

## Regras de segurança (inegociáveis)
- Trabalhe em uma branch nova (ex.: feat/licoes-analise-landing). Pode fazer commits pequenos e frequentes nela, com mensagens claras em português.
- NUNCA faça push para main/master, deploy em produção, nem merge. Eu reviso o preview da Vercel e faço o merge.
- NUNCA apague dados, tabelas ou colunas existentes, nem rode migrações destrutivas. Só migrações aditivas (criar tabelas/colunas novas).
- NUNCA exponha segredos no código. Se faltar uma variável de ambiente ou credencial, não trave: implemente com valor opcional/fallback, anote em docs/PENDENCIAS.md o que preciso configurar e siga para a próxima tarefa.
- Não quebre o que já funciona. Antes de alterar algo existente, entenda como é usado. Rode build, lint e testes a cada etapa; se algo quebrar, corrija antes de continuar.

## Protocolo de checkpoint e retomada (obrigatório)
Sua sessão pode ser interrompida a qualquer momento (limite de tokens ou de uso). Trabalhe sempre de forma que outra sessão consiga continuar exatamente de onde você parou.

0. SE docs/CHECKLIST.md JÁ EXISTIR, esta é uma retomada: NÃO recomece. Leia CHECKLIST.md, PROGRESSO.md (seção "Estado atual"), DECISOES.md e PENDENCIAS.md, confira o último commit e continue do primeiro item não marcado. Só execute o "Primeiro passo: reconhecimento" se ele ainda não tiver sido feito.
1. No primeiro uso, salve uma cópia integral deste prompt em docs/PROMPT-MESTRE.md e faça commit. Em seguida crie docs/CHECKLIST.md com TODAS as tarefas e subtarefas deste prompt em formato de checklist (- [ ]), uma linha por item pequeno (ex.: uma lição de abertura, um tópico de finais, uma etapa da análise, uma seção da landing). Esse arquivo é a fonte da verdade do andamento.
2. Ao concluir cada item, marque [x] no CHECKLIST.md e faça um commit na hora (mensagem: "checkpoint: <item>"). Nunca acumule mais de um item concluído sem commit.
3. Faça push da branch de trabalho (somente a branch de feature, nunca main/master) a cada 3 a 5 commits, para o progresso ficar salvo no remoto.
4. Mantenha em docs/PROGRESSO.md uma seção "Estado atual" com: o que está em andamento agora, o próximo item exato, decisões abertas e qualquer arquivo parcialmente escrito. Atualize antes de começar cada item grande.
5. Nunca deixe o repositório quebrado entre checkpoints: se um item ficar pela metade, deixe o build passando (código novo desativado ou isolado) e anote em "Estado atual" o que falta.
6. Em arquivos de conteúdo grandes (lições, posições), grave em lotes pequenos (uma lição por vez), validando com o script antes de cada commit.
7. Quando perceber que a sessão está longa ou o limite está próximo, pare de iniciar itens novos, finalize o atual, faça o commit e atualize "Estado atual" com o próximo passo exato.

## Primeiro passo: reconhecimento
Inspecione o repositório: framework, estrutura de pastas, rotas, autenticação, banco, componentes de UI, design system, planos/assinatura, tabela de partidas importadas (Chess.com/Lichess), o questionário de estilo de jogo e COMO as abas "Lições de aberturas", "Prática" e "Finais" estão estruturadas hoje (modelo de dados, componentes, tabuleiro usado). Siga esse modelo para o novo conteúdo. Se o modelo atual for limitado (ex.: lição com vários passos e prática com validação de lances), estenda-o de forma compatível. Crie docs/PROGRESSO.md e atualize-o a cada bloco concluído.

## Tarefa 1: Lições de ABERTURAS + prática
Crie o máximo de lições possível, com qualidade, na aba de lições de aberturas, cada uma com prática associada. Cubra, no mínimo:
- Com brancas: Italiana (Giuoco Piano e Giuoco Pianissimo), Espanhola/Ruy Lopez (Berlim, Fechada, Aberta), Escocesa, Gambito da Dama (aceito e recusado), Inglesa, Londres, Sistema Catalão, Gambito do Rei (visão geral).
- Com pretas: Siciliana (Najdorf, Dragão, Scheveningen, Clássica e Fechada), Francesa (Avanço, Troca, Tarrasch), Caro-Kann (Clássica, Avanço), Escandinava, Defesa Eslava e Semi-Eslava, Nimzo-Indiana, Índia do Rei, Índia da Dama, Grünfeld, Petroff, Defesa Philidor, Defesa Holandesa.
- Para cada abertura: ideias estratégicas, planos típicos para ambos os lados, estruturas de peões, armadilhas comuns (com os lances exatos), erros frequentes de iniciantes e intermediários, e as principais variantes.
Formato de cada lição:
1. Introdução curta (quem joga, que tipo de posição surge, para qual estilo serve: Atacante, Posicional, Tático, Defensor ou Universal; ligue isso ao teste de estilo do site).
2. Passo a passo no tabuleiro, lance a lance, com explicação de CADA lance importante.
3. Armadilhas e erros comuns.
4. Prática interativa em níveis (fácil, médio, difícil): o usuário precisa encontrar o lance certo da linha, com feedback imediato, dica opcional e explicação do porquê quando erra.
5. Mini-quiz de 3 a 5 perguntas no final.
Organize por abertura, com nível de dificuldade, progresso salvo por usuário e indicação de lição concluída.

## Tarefa 2: Lições de FINAIS + prática (preencher o máximo possível)
Cubra de forma progressiva, do básico ao avançado:
- Mates básicos: rei+dama, rei+torre, dois bispos, bispo+cavalo (técnica), mates com duas torres.
- Finais de peões: oposição (direta, distante, diagonal), regra do quadrado, peão de torre, peão central, casas-chave, regra de Réti, triangulação, zugzwang, peões ligados e passados, brecha (peão de rompimento).
- Finais de torre: posição de Lucena, posição de Philidor, torre atrás do peão passado, rei cortado, finais com peão de torre, torre ativa vs. passiva, 4 contra 3 e 3 contra 2 na mesma ala.
- Finais de bispos: bispos de mesma cor e de cores opostas, bispo bom vs. mau, bispo vs. cavalo.
- Finais de cavalos e de cavalo vs. bispo.
- Finais de dama: dama vs. peão na 7ª fileira, dama vs. torre, xeque perpétuo.
- Finais combinados (torre+minor), conversão de vantagem material, e como empatar posições perdidas (fortalezas e afogamento).
Cada lição segue o mesmo formato: teoria curta e clara, posição-modelo no tabuleiro, lances explicados e prática interativa com várias posições (FEN) em níveis crescentes, com dicas e feedback. Para cada tópico, crie pelo menos 5 a 10 posições de prática.

## Qualidade e precisão do conteúdo de xadrez (CRÍTICO)
- TODA sequência de lances e TODA posição devem ser validadas por código (chess.js ou equivalente): escreva um script de verificação (ex.: scripts/validar-conteudo.ts) que carrega cada lição, confere se cada lance é legal a partir da posição, se os FENs são válidos e, nas posições de prática, se existe uma solução definida. O script deve rodar no CI/build e FALHAR se houver erro. Nunca publique lance ilegal ou posição inválida.
- Se tiver motor disponível (Stockfish via npm/WASM), use-o em um script offline (rodando localmente, sem custo) para confirmar que o lance "correto" de cada posição de prática é realmente o melhor, ou que o resultado teórico declarado (ganho/empate) está certo. Onde não puder confirmar, não afirme: reescreva de forma conservadora ou descarte a posição.
- Conteúdo 100% original, em português do Brasil, escrito com suas próprias palavras. Não copie texto de livros, cursos ou sites. Posições e linhas teóricas clássicas são conhecimento livre, a redação deve ser sua.
- Linguagem clara para iniciante e intermediário, com termos técnicos explicados na primeira vez.
- Dados do conteúdo em arquivos estruturados (JSON/TS) separados dos componentes, para eu poder editar depois sem mexer na interface.

## Tarefa 3: Seção "Análise de partidas" com Stockfish no navegador (custo zero)

### Motor
- Use o pacote npm `stockfish` (build WASM single-thread, versão lite), carregado sob demanda (lazy load) apenas nesta seção, dentro de um Web Worker, comunicando via protocolo UCI. O motor não pode ser carregado nas outras páginas.
- NÃO exija headers COOP/COEP. Se a versão multi-thread for opcional, deixe desativada por padrão.
- Servir os arquivos do motor com cache longo no navegador (o download acontece só na primeira análise).
- Profundidade configurável (padrão 14, opções 12 / 16 / 20, pensando em celulares fracos) e botão para cancelar. Analise a partida em fila, um lance por vez, com barra de progresso.
- Tratar falhas: navegador sem suporte a WASM, worker que não carrega, partida inválida.

### Entrada de partidas
- Escolher uma partida já importada do Chess.com/Lichess (reaproveitar a tabela de partidas importadas) ou colar um PGN. Validar o PGN com chess.js e mostrar erro claro se for inválido.
- Se a partida do Lichess já trouxer avaliações, reaproveite-as e rode o motor só onde faltar.
- Para as primeiras jogadas, consulte antes a cloud eval gratuita do Lichess, respeitando o limite de requisições, com fallback automático para o motor local.

### Análise
- Para cada posição, guardar avaliação (centipeões ou mate em N), melhor lance e 2 ou 3 melhores linhas.
- Converter a avaliação em chance de vitória (curva logística) e classificar cada lance pela perda de chance em relação ao melhor lance: melhor, excelente, bom, imprecisão, erro, gafe. Documente os limiares no código e em docs/DECISOES.md.
- Calcular a precisão (%) de cada lado e a contagem de cada classificação.
- Identificar os momentos críticos (maiores quedas de avaliação).
- Não usar IA paga para comentar lances: o feedback vem do motor e de regras próprias.

### Interface
- Tabuleiro interativo com navegação por lances (setas do teclado e botões), barra de avaliação, seta da melhor jogada e lista de lances com ícone de classificação.
- Gráfico de avaliação clicável (clicar leva ao lance).
- Painel de resumo: precisão dos dois lados, contagem de erros e os 3 momentos críticos.
- Modo "Tente de novo": nos erros e gafes do usuário, volta a posição e pede o lance melhor, com feedback imediato.

### Persistência
- Migração aditiva para salvar a análise por partida em JSON compacto (só avaliações, classificações e precisão, sem textos longos), com RLS: cada usuário lê e escreve só as próprias análises.
- Se a partida já tiver análise salva, mostrar direto, sem rodar o motor de novo (cache agressivo).
- Limite de análises por plano é OPCIONAL e configurável em constante; por padrão, deixe a análise liberada para todos os usuários cadastrados. Se eu ativar o limite depois, mostrar mensagem de upgrade seguindo o modelo de planos existente.

### Integração com o resto do site
- No painel de estatísticas, ligar "Analisar esta partida" a cada partida importada.
- A partir dos erros mais frequentes e da abertura em que o usuário perde mais avaliação, sugerir lições de abertura e de finais existentes.

### Conformidade de licença (Stockfish, GPLv3)
- Servir os arquivos do motor como assets estáticos separados, sem modificação e fora do bundle principal; comunicação apenas via UCI/postMessage, sem importar código interno do motor no código do site.
- Criar a página /creditos (link no rodapé) com: nome e versão exata do motor e do pacote npm, link para o código-fonte dessa versão, texto da GPLv3 (arquivo LICENSE do pacote em /public/licencas/) e aviso de que o motor é software livre. Não usar o nome "Stockfish" de forma que sugira parceria ou endosso do projeto.
- Gerar um arquivo THIRD_PARTY_LICENSES com todas as dependências e suas licenças (use uma ferramenta de auditoria como license-checker). Configure uma lista de licenças permitidas (incluindo a GPLv3 do motor, que é esperada e documentada) e falhe o build se aparecer licença desconhecida ou copyleft inesperada.
- Nos Termos de Uso, incluir cláusula de que componentes de terceiros seguem suas próprias licenças e não são restringidos por estes termos.
- Registrar em docs/PENDENCIAS.md: "Revisão jurídica da licença do Stockfish antes do lançamento comercial", com o resumo da arquitetura adotada (motor separado, sem modificação, comunicação via UCI).
- Registrar também em docs/PENDENCIAS.md: "Conferir os termos da hospedagem atual (plano gratuito da Vercel é voltado a uso não comercial) e os termos da API do Chess.com para uso comercial; avaliar alternativas gratuitas com uso comercial permitido, como Cloudflare Pages ou Netlify".

## Tarefa 4: Landing page
Atualize a landing page para comunicar o valor do produto, mantendo a identidade visual atual:
- Seção do TESTE DE ESTILO DE JOGO: "Descubra seu estilo (Atacante, Posicional, Tático, Defensor ou Universal) em 2 minutos e receba um caminho de estudo feito para o seu jeito de jogar." Mostre um preview do resultado (selo + gráfico de barras ou radar) e um botão para começar o teste.
- Seção de IMPORTAÇÃO DE PARTIDAS do Chess.com e do Lichess: o usuário informa só o nome de usuário, sem senha, e vê aberturas mais jogadas, desempenho por cor e ritmo, como as partidas terminam e evolução de rating. Mostre um mockup do painel de estatísticas.
- Seção de ANÁLISE DE PARTIDAS COM MOTOR (Stockfish): barra de avaliação, classificação de cada lance, precisão, momentos críticos e o modo "Tente de novo". Mostre um mockup da tela de análise e deixe claro que roda no navegador do usuário. Só diga que a análise é gratuita se o limite por plano estiver desativado na configuração (leia a constante, não escreva fixo).
- Destaque a combinação: "seu estilo declarado + seus dados reais + análise lance a lance = treino sob medida".
- Seções de lições de aberturas e finais, com contagem real de lições/posições (leia do conteúdo, não escreva número fixo).
- Foque no problema que o site resolve: jogadores que estudam sem direção, repetem os mesmos erros e não sabem o que treinar. Copy persuasiva, honesta, sem promessas exageradas de ganho de rating.
- CTAs claros para cadastro. Prova social só se houver dados reais (não invente depoimentos nem números).
- Responsiva (prioridade celular), rápida, acessível (contraste, alt, navegação por teclado) e com SEO básico (title, description, Open Graph, dados estruturados quando fizer sentido).

## Tarefa 5: Melhoria contínua (depois das tarefas 1 a 4)
Continue em ciclos, sem perguntar, na ordem de maior impacto:
1. Bugs e erros de console, tratamento de erros e estados de carregamento/vazio.
2. Experiência de aprendizado: progresso, sequência diária (streak), recomendação da próxima lição com base no estilo do questionário, nas aberturas mais jogadas e nos erros da análise, e revisão espaçada das posições que o usuário errou.
3. Desempenho (Lighthouse), imagens otimizadas, carregamento sob demanda.
4. Acessibilidade e responsividade em todas as telas.
5. Testes automatizados para a lógica crítica: pontuação do questionário, importação, validação de conteúdo, classificação de lances, cálculo de precisão, parsing de PGN e conversão de avaliação (use posições conhecidas com resultado esperado).
6. Polimento visual e microinterações coerentes com o design atual.
7. Mais conteúdo: novas aberturas, mais posições de prática, lições de táticas e de estratégia, sempre validadas pelo script.
A cada ciclo: implemente, rode build/lint/testes, faça commit na branch (seguindo o protocolo de checkpoint) e atualize docs/PROGRESSO.md. Pare de iterar quando as tarefas 1 a 4 estiverem completas e, depois, após 3 ciclos de melhoria sem achados relevantes, ou se esbarrar em algo que dependa de mim.

## Padrões gerais
- Interface responsiva (prioridade celular), com estados de carregamento, vazio e erro em todas as telas novas.
- Textos em português do Brasil, seguindo o design system atual.

## Entrega final
Ao terminar, atualize docs/PROGRESSO.md e mostre um resumo: o que foi criado (quantidade de lições de aberturas, de finais e de posições de prática, e o que foi feito na análise com motor, na conformidade de licença e na landing page), decisões tomadas, pendências que dependem de mim (docs/PENDENCIAS.md), como testar localmente e o link/branch para eu conferir o preview da Vercel.
