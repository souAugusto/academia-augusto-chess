# Decisões tomadas sem consulta

Formato: data · dúvida · escolha · motivo.

- 2026-10-13 · O prompt pede a análise "liberada para todos os usuários cadastrados" por padrão, mas o CLAUDE.md diz "Não existe plano gratuito". · A análise fica atrás de uma constante (`ANALYSIS_MIN_PLAN_RANK` em `src/lib/analysis/config.ts`) que começa em 1 (assinantes). A landing lê a constante e só fala em "gratuita" se ela for 0. · O CLAUDE.md lista isso como regra que nunca quebra; a constante deixa a troca a um commit de distância.
- 2026-10-13 · O prompt proíbe migrações destrutivas, mas o preview da Vercel usa o mesmo Supabase da produção. · Migrations novas são só aditivas (tabelas novas) e são aplicadas no banco para o preview funcionar. · O próprio prompt autoriza migrações aditivas; sem elas o preview quebra.
- 2026-10-13 · O nome `docs/PROMPT-MESTRE.md` é parecido com `PROMPT_MESTRE.md` (documento do produto). · Mantive os dois, com um aviso no topo do novo. · O prompt pede esse caminho exato; o documento do produto continua valendo para regras de negócio.
- 2026-10-13 · Como o motor confere as práticas. · `scripts/verificar-motor.ts` (Stockfish 19 lite no Node, local, sem custo), com 3 regras:
  - **Finais:** a posição declarada como "vencer" precisa dar ao melhor lance pelo menos 80% de chance; a "empatar", pelo menos 30%. Cada lance do aluno na solução precisa manter esse resultado e perder no máximo 8 pontos de chance para o melhor lance (ou manter um mate).
  - **Aberturas:** o lance pedido pode perder no máximo 10 pontos (aviso a partir de 6).
  - **Profundidade:** 20 nos finais e 15 nas aberturas.
  
  Motivo: comparar chance de vitória (curva do Lichess) evita falso alarme quando há vários lances ganhadores.
- 2026-10-13 · Pacote `stockfish` no projeto. · Entra como devDependency (19.0.1, exata), usado só nos scripts locais. Os arquivos servidos ao navegador continuam em `public/engine/`, copiados sem modificação. · Mantém o motor fora do bundle e permite repetir a verificação.

## Motor também confere linhas explicadas e armadilhas (2026-10-13)
O `verify:engine` passou a checar, além da prática: cada lance da linha principal e das variantes (profundidade 13; erro se perder mais de 15 pontos de chance, aviso acima de 9) e o fim de cada armadilha, que agora declara `favors` (brancas/pretas). O lado favorecido precisa ter ao menos 65% de chance (ou ter dado mate). Gambitos teóricos (ex.: Gambito do Rei) ficam abaixo do limite de erro.

## Rodada final: landing, menu e últimas lições (2026-10-13)
- **Maquetes da landing** (importação e análise) usam dados inventados e levam o selo "Exemplo ilustrativo"; o card de estilo leva "Exemplo de resultado". Os números de lições e exercícios vêm do conteúdo real (`contentCounts()`). Nada de depoimentos ou números de alunos.
- **"Análise" no menu:** entrou no menu do desktop e como card no Painel. A barra inferior do celular continua com cinco itens (não cabe um sexto); no celular a análise fica a um toque pelo Painel.
- **Menu público:** "Como funciona" saiu do cabeçalho para dar lugar a "Lições" e "Análise". A seção continua na página.
- **Avaliação com vírgula** (+1,2), como o resto do site em português.
- **Prática só aceita os lances listados.** Por isso as lições novas usam posições com um lance certo, ou com a lista completa de lances que mantêm o resultado (conferida com `MULTIPV=40` no `resolver-final.ts`). Posições com muitos lances ganhadores (ex.: evitar afogamento com dama) ficaram de fora para não marcar como erro um lance bom.
- **Licença da libvips no Linux:** a exceção LGPL do sharp passou a cobrir também `@img/sharp-libvips-*`, que o build da Vercel instala separado. É a mesma biblioteca e a mesma exceção já listada nas pendências.

## Perfil, aparência e sons — Bloco A (2026-10-14)
Prompt de referência: `docs/PROMPT_PERSONALIZACAO_TITULOS.md`.
- **Adaptações ao projeto real** (o prompt foi escrito para uma versão anterior): pagamento é Asaas (não Stripe); o tabuleiro é react-chessboard (o chessground é GPL e foi descartado); a migration "0002" virou **0014** (a parte de rating e títulos fica para o Bloco B); `/puzzles` é `/taticas`.
- **Banco único:** não há Supabase de desenvolvimento; a 0014 (só aditiva) foi aplicada no banco de produção com autorização do Augusto.
- **Apelido e foto só mudam pelo servidor:** um trigger no banco bloqueia a troca direta pelo aluno (pela API), para as regras de palavras proibidas, nomes reservados e prazo de 30 dias não poderem ser burladas. Trocar só maiúsculas/minúsculas não conta como troca.
- **Fotos sem escrita do aluno no Storage:** o bucket `avatars` tem leitura pública, mas só o servidor grava, depois de redimensionar (256x256), converter para webp e apagar os metadados (EXIF/GPS). Assim ninguém sobe a foto original com localização pela API.
- **Excluir conta:** pede o apelido (ou o e-mail, se não tiver apelido), cancela a assinatura no Asaas antes de apagar e grava um resumo do que foi apagado em `account_deletions` (sem e-mail ou nome). Eventos de pagamento ficam (registro fiscal). Contas de admin não se excluem pelo site.
- **Peças:** só conjuntos com licença comercial conferida na fonte original: Clássico (cburnett, BSD), Moderno (chessnut, Apache 2.0), Fantasia e Minimalista (fantasy e spatial, MIT). Os conjuntos populares do Lichess com licença NC ficaram de fora (lista em `docs/licencas/README.md`).
- **Sons gerados por código** (Web Audio, `src/lib/sound/synth.ts`): os sons do Lichess são AGPL ou NC, então a Finale gera os próprios. Sem arquivos, sem licença de terceiros, latência mínima. Nada toca antes do primeiro toque/clique; no iPhone, o modo "ambient" respeita a chave de silêncio.
- **Tema padrão continua o atual** ("Finale", azul-acinzentado). O "verde e creme" do prompt antigo entrou como opção.
- **Bio privada por enquanto:** o perfil público (Bloco B) mostra só apelido, foto, título e rating.

## Rating tático, títulos e ranking — Bloco B (2026-10-14)
- **Rating:** usa o rating de táticas que já existia (`user_stats`, começa em 1500), por decisão do Augusto. A conta continua no servidor (`src/lib/rating.ts`, K = 40 nos 30 primeiros e 20 depois), sem função SQL nova.
- **Só a primeira tentativa de cada puzzle conta.** Repetir um puzzle (inclusive pela revisão) não muda o rating, o que impede inflar o número.
- **Não contam para o rating:** puzzles personalizados, puzzles sem rating, puzzle do dia, ciclos do Método Padrão Finale e revisão. Usar "Dica" ou "Ver solução" conta como erro.
- **Travas de plausibilidade** (`src/lib/tactics/plausibility.ts`): menos de 0,8 s por lance, menos de 2 s depois da tentativa anterior ou mais de 300 puzzles valendo rating no dia. A tentativa é gravada, mas não mexe no rating nem concede título.
- **Limitação de segurança conhecida:** o navegador recebe a solução do puzzle (o tabuleiro precisa dela para responder na hora). Uma pessoa técnica consegue forjar acertos dentro das travas. Por isso o ranking é de **motivação, não de competição com prêmio**. Se um dia houver prêmio, será preciso esconder as soluções e validar lance a lance no servidor.
- **Títulos permanentes:** concedidos só depois de 30 puzzles contados e nunca retirados; o exibido é o mais alto já conquistado. Ao completar 30 puzzles, o aluno pode ganhar vários de uma vez; a celebração mostra só o mais alto. A celebração aparece uma única vez por título (só os títulos recém-inseridos voltam na resposta).
- **Escada editável no admin** (`/admin/titulos`), sem títulos oficiais da FIDE ou da federação (o formulário recusa nomes como "Grande Mestre" e "Mestre Nacional"). Mudar o rating mínimo não tira títulos já conquistados.
- **Ranking em `/comunidade`:** só apelido, foto, título e rating. Entra quem tem apelido, deixou "aparecer no ranking" ligado e tem 30+ puzzles contados. Só quem tem plano ativo vê. A linha do próprio aluno aparece mesmo fora do top 50.
- **Imagem para compartilhar** (`/api/titulo/[apelido]/og`, quadrada ou vertical): só sai para quem aparece no ranking ou para o próprio aluno logado.
- **Alunos antigos:** quem já tinha 30+ puzzles recebe os títulos (com celebração) no próximo puzzle valendo rating.

## Teste grátis de 30 dias do Membro (2026-10-14)
Decisões do Augusto: **sem cartão**, ao fim fica liberado **só o que já é público**, e a regra "não existe plano gratuito" passou a ter essa única exceção (CLAUDE.md, regra 7, e PROMPT_MESTRE.md).
- **Modelo:** o teste é uma linha em `subscriptions` (source `trial`, status `trialing`, `cancel_at_period_end = true`, `current_period_end` = fim do teste). A função `my_plan_rank()`, que já decide o acesso no RLS e no servidor, vale para o teste sem mudança e o expira sozinha pela data (sem job, sem a tolerância de 3 dias do pago).
- **Prazo:** o dia da ativação conta como o 1º; o teste vale até 23h59 (horário de Brasília) do 30º dia.
- **Uma vez por pessoa:** índice único de um teste por conta + tabela `trial_claims` com o e-mail normalizado (minúsculas, sem "+etiqueta" e, no Gmail, sem pontos). O registro fica mesmo se a conta for excluída. Quem já foi assinante (pago que chegou a ativar ou concessão manual) não testa; tentativa de pagamento abandonada não impede.
- **Idempotente:** clicar duas vezes (ou em duas abas) não cria um segundo teste nem muda o prazo.
- **Assinar durante o teste:** quando o Asaas confirma o pagamento, o teste termina na hora (sem dias extras) e a conversão fica em `trial_claims.converted_at`. O checkout passou a olhar só o plano pago (`my_paid_plan_rank()`), para quem está no teste conseguir assinar; quem já paga continua bloqueado (sem cobrança dupla).
- **Status único** (`getAccessStatus` em `src/lib/data/trial.ts`): pago, em teste (dias restantes), teste expirado ou gratuito (e se pode testar). Usado pela faixa do app, Minha conta, /planos, /teste-gratis e a tela de "plano necessário".
- **Cadastro com intenção de teste:** o botão leva a `/entrar?aba=criar&next=/teste-gratis`; o cadastro (e-mail ou Google) passou a respeitar esse destino depois do questionário; quem já está logado vai direto para a confirmação.
- **Oferta na landing:** a página inicial é a mesma para todos (rápida, em cache), então mostra a oferta também para quem já assina; a página `/teste-gratis` responde "você já é assinante". Em `/planos`, que sabe quem está logado, a oferta some para pagantes e para quem já testou.

## Minha conta e foto de perfil (2026-10-14)
- **Causa do bug da foto:** a foto era salva certo (arquivo no bucket e `avatar_path` preenchido), mas a página `/conta` nunca desenhava o avatar; ele só aparecia na subpágina `/conta/perfil` e no ranking, e o cabeçalho usava um ícone genérico.
- **Avatar único** (`src/components/account/Avatar.tsx`) em todo o site: foto ou, se faltar ou falhar, as iniciais sobre o dourado. Quem entra com Google e não enviou foto usa a foto do Google.
- **Storage sem políticas de escrita para o aluno:** envio e remoção passam só por ações do servidor, que conferem a sessão, validam o tipo real do arquivo com `sharp`, reduzem para 512 px em WebP e gravam com a service role em `{user_id}/avatar-<data>.webp` (nome único; os arquivos antigos da pasta são apagados). Leitura do bucket continua pública. A migration 0017 ajusta a checagem de `avatar_path` para o nome novo.
- **Página única com seções** (Perfil, Assinatura, Segurança, Preferências, Contas vinculadas, Privacidade); `/conta/perfil` e `/conta/aparencia` redirecionam para as âncoras.
- **Desfazer cancelamento** cria uma assinatura nova no Asaas com o mesmo valor da anterior e primeira cobrança no dia em que o período pago termina (sem cobrança dupla).
- **Trocar senha** exige a senha atual. **Sair de todos os aparelhos** encerra todas as sessões. **Excluir conta** exige digitar EXCLUIR e fica bloqueada enquanto houver assinatura renovando.
- **Tema** (escuro, claro ou do aparelho) fica salvo no navegador; tabuleiro, peças, sons e e-mails ficam na conta.
- **Preferências de e-mail** ficam guardadas, mas a Finale ainda não envia esses e-mails.
- **Rating declarado** e cidade são privados (não aparecem no ranking).

## Análise profunda de partidas (2026-10-16)
Decisões do Augusto: só o motor do site (sem nuvem nem análise do Lichess), guardar sozinho ao terminar (no limite de 100, a mais antiga sai) e aplicar 0013 + 0018.
- **Perfil fixo** em `src/lib/analysis/profile.ts` (`ANALYSIS_PROFILE`): Stockfish 19 lite, 1 thread, hash 16 MB; passagem 1 em profundidade 16 (todas as posições); passagem 2 em profundidade 16 com 3 linhas, em até 12 posições candidatas. Selo, página `/como-analisamos`, motor e banco leem daí. Sem seletor de profundidade (removido da tela, do código e da validação do servidor).
- **Benchmark (este computador, Chrome sem limitação):** profundidade 18 só na passagem 1 levou 133 s numa partida de 80 meias-jogadas (sem contar a passagem 2), acima da meta de ~2 min; profundidade 16 ficou entre 75 e 100 s nessa partida difícil. Com o pipeline completo (duas passagens): Opera de Morphy (33 meias-jogadas) 42–58 s; Byrne x Fischer (82) 84–92 s no navegador; Kasparov x Topalov (87) 56–65 s no Node. O Chrome não deixa simular celular lento para o Web Worker do motor; estimativa para Android intermediário: 3 a 4 vezes mais lento (3 a 6 min). Se a previsão passar de 5 min, a tela avisa e oferece continuar ou cancelar (sem reduzir a profundidade em silêncio). Medir num celular real antes de fixar de vez.
- **Determinismo:** 1 thread, hash fixo, `ucinewgame` no começo, mesma ordem de posições; o "Tente de novo" usa outro motor. A mesma partida deu as mesmas classes no navegador e no Node.
- **Classificação** (`src/lib/analysis/classify.ts`, limiares em `CLASSIFY_CONFIG`, versão em `algoVersion`):
  - win% e precisão por lance pelas fórmulas abertas do Lichess (implementação nossa, sem código AGPL).
  - Δ = win% da melhor linha antes − win% depois; 0 se jogou o 1º lance do motor ou deu xeque-mate.
  - Limiares: Excelente ≤ 2, Bom ≤ 5, Imprecisão ≤ 10, Erro ≤ 20, Erro grave > 20 (ou permitir mate). Prioridade: Teoria → Brilhante → Ótimo → Erro grave → Chance perdida → pela perda.
  - **Sacrifício (ajuste nosso ao prompt):** "3 pontos abaixo" deixava de fora o sacrifício clássico de bispo por peão (saldo de 2). Ficou: a peça entregue vale 3 ou mais (peça menor ou mais), o adversário a captura **no lance seguinte** e, nas duas últimas posições da linha (até 6 meias-jogadas), quem jogou segue pelo menos 2 pontos abaixo. Qualidade fica desligada. A linha vem do motor ou, se o motor recusa a oferta, do que aconteceu na partida.
  - **Ótimo (ajuste após calibração):** lance único só quando a 2ª opção perde 15 pontos **e** muda a categoria (de vencedora para não vencedora, ou de equilibrada para pior); mate em 1 é "Melhor". Sem isso, a Opera de Morphy tinha 5 "Ótimos" em posições já ganhas.
  - Calibração com partidas reais: `npx tsx scripts/calibrar-analise.ts partida.pgn`. Resultado: 17...Be6 de Fischer = Brilhante; 26.Qxd4+ de Kasparov = Brilhante; 24.Rxd4 de Kasparov não (o motor, nesta profundidade, acha a posição pior depois do lance).
- **Precisão da partida (escolhas nossas):** média entre a média ponderada pela volatilidade (desvio padrão do win% das brancas em janela deslizante que termina na posição depois do lance; janela = clamp(lances/10, 2, 8); peso = clamp(desvio, 0,5, 12)) e a média harmônica. Sem "rating de desempenho".
- **Teoria:** `src/content/teoria-aberturas.json` gerado de lichess-org/chess-openings (CC0) por `npm run build:opening-book` (7.982 posições, 3.332 nomes); a sequência inicial de lances que está no livro vira "Teoria", e a saída da teoria é momento-chave.
- **Dados (0018):** `game_analyses` ganhou `engine_profile`, `algo_version`, `game_key` (chesscom:/lichess:/pgn:) e `summary`. Perfil diferente: a tela mostra "padrão antigo, Reanalisar". Só a versão das regras mudou: o servidor refaz o resumo a partir dos mesmos dados. Cache local em IndexedDB. A 0013 foi aplicada como `alter policy` (o MCP recusa `drop`).
- **Salvar como tática:** cria tática própria (posição antes do erro + linha do motor, terminando num lance do aluno) no conjunto "Meus erros". Segue a regra existente: tática própria é do plano Intensivo; no Membro aparece só o aviso. Não conta para o rating.
- **Interface:** no desktop o painel tem abas "Lances | Resumo" (o painel tem a altura do tabuleiro e não cabe tudo empilhado); os controles ficam na base do painel no desktop e logo abaixo do tabuleiro no celular, como nas outras telas com tabuleiro. O `PROMPT_LAYOUT_CHESSCOM.md` citado no prompt não existe no projeto; segui o padrão `BoardStage` que já existe.
