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
